import * as httpm from '@actions/http-client'

const API_BASE = 'https://endoflife.date/api/v1'

export class EndOfLifeClient {
  private httpClient: httpm.HttpClient

  constructor() {
    this.httpClient = new httpm.HttpClient(
      'JLLeitschuh/endoflife-date-matrix-action',
      [],
      {allowRetries: true, maxRetries: 3}
    )
  }

  async fetchEOLData(product: string): Promise<EndOfLifeProductVersion[]> {
    const url = `${API_BASE}/products/${product}`
    const response = await this.httpClient.getJson<ProductDetailsResponse>(url)
    if (response.result === null) {
      throw new Error(`No data returned from ${url}`)
    }
    return mapReleases(response.result.result.releases)
  }

  async fetchEOLDataByTag(tag: string): Promise<EndOfLifeProductVersion[]> {
    const url = `${API_BASE}/tags/${tag}`
    const response = await this.httpClient.getJson<ProductListResponse>(url)
    if (response.result === null) {
      throw new Error(`No data returned from ${url}`)
    }

    const allReleases = await Promise.all(
      response.result.result.map(async product =>
        this.fetchEOLData(product.name)
      )
    )

    // Merge cycles across distributions: a cycle is included if any distribution
    // still supports it, and the EOL date is the latest (most generous) across all.
    const cycleMap = new Map<string, EndOfLifeProductVersion>()
    for (const releases of allReleases) {
      for (const release of releases) {
        const existing = cycleMap.get(release.cycle)
        if (!existing) {
          cycleMap.set(release.cycle, release)
        } else {
          cycleMap.set(release.cycle, {
            ...existing,
            eol: mergeEolDates(existing.eol, release.eol),
            support: mergeOptionalDates(existing.support, release.support),
            lts: existing.lts || release.lts
          })
        }
      }
    }

    return Array.from(cycleMap.values())
  }
}

function mergeEolDates(a: Date | null, b: Date | null): Date | null {
  // null means the EOL date is unknown; treat conservatively as "still supported"
  if (a === null || b === null) return null
  return a > b ? a : b
}

function mergeOptionalDates(
  a: Date | null | undefined,
  b: Date | null | undefined
): Date | null | undefined {
  if (a === null || b === null) return null
  if (a === undefined && b === undefined) return undefined
  if (a === undefined) return b
  if (b === undefined) return a
  return a > b ? a : b
}

function mapReleases(releases: ProductReleaseRaw[]): EndOfLifeProductVersion[] {
  return releases.map(r => ({
    cycle: r.name,
    eol: r.eolFrom ? new Date(r.eolFrom) : null,
    latest: r.latest ? r.latest.name : null,
    link: r.latest?.link ?? null,
    lts: r.isLts,
    releaseDate: new Date(r.releaseDate),
    support: r.eoasFrom ? new Date(r.eoasFrom) : null
  }))
}

// v1 API response envelope types
type ProductListResponse = {
  schema_version: string
  result: ProductSummaryRaw[]
}

type ProductSummaryRaw = {
  name: string
  label: string
  aliases: string[]
  uri: string
}

type ProductDetailsResponse = {
  schema_version: string
  result: {
    name: string
    releases: ProductReleaseRaw[]
  }
}

type ProductReleaseRaw = {
  name: string
  releaseDate: string
  isLts: boolean
  eolFrom: string | null
  eoasFrom?: string | null
  isEol: boolean
  isMaintained: boolean
  latest: {name: string; date: string | null; link: string | null} | null
}

export type EndOfLifeProductVersion = {
  cycle: string
  eol: Date | null
  latest: string | null
  link?: string | null
  lts: boolean
  releaseDate: Date
  support?: Date | null
}
