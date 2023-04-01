import * as httpm from 'typed-rest-client/HttpClient'

export class EndOfLifeClient {
  private httpClient: httpm.HttpClient

  constructor() {
    this.httpClient = new httpm.HttpClient(
      'JLLeitschuh/endoflife-date-matrix-action',
      undefined,
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
    return Array.from<EndOfLifeProductVersionRaw>(
      JSON.parse(await this.httpGetText(url))
    ).map(({cycle, eol, latest, link, lts, releaseDate, support}) => {
      return {
        cycle,
        eol: new Date(eol),
        latest,
        link,
        lts,
        releaseDate: new Date(releaseDate),
        support: new Date(support)
      }
    })
  }

  private async httpGetText(url: string): Promise<string> {
    const response = await this.httpClient.get(url)
    return response.readBody()
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
