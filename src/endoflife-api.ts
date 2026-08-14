import * as httpm from '@actions/http-client'

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
    const url = `https://endoflife.date/api/${product}.json`
    return await this.fetchEOLDataAsJSON(url)
  }

  private async fetchEOLDataAsJSON(
    url: string
  ): Promise<EndOfLifeProductVersion[]> {
    const response =
      await this.httpClient.getJson<EndOfLifeProductVersionRaw[]>(url)
    if (response.result === null) {
      throw new Error(`No data returned from ${url}`)
    }
    return Array.from<EndOfLifeProductVersionRaw>(response.result).map(
      ({cycle, eol, latest, link, lts, releaseDate, support}) => {
        return {
          cycle,
          eol: new Date(eol),
          latest,
          link,
          lts,
          releaseDate: new Date(releaseDate),
          support: new Date(support)
        }
      }
    )
  }
}

type EndOfLifeProductVersionRaw = {
  cycle: string
  eol: string
  latest: string
  link?: string
  lts: boolean
  releaseDate: string
  support: string
}

export type EndOfLifeProductVersion = {
  cycle: string
  eol: Date
  latest: string
  link?: string
  lts: boolean
  releaseDate: Date
  support: Date
}
