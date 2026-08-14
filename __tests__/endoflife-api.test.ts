import {beforeEach, describe, expect, jest, test} from '@jest/globals'
import {EndOfLifeClient} from '../src/endoflife-api'
import * as httpm from '@actions/http-client'

jest.mock('@actions/http-client')

const javaFixture = [
  {
    cycle: '21',
    eol: '2029-09-30',
    latest: '21.0.5',
    lts: true,
    releaseDate: '2023-09-19',
    support: '2026-09-30'
  },
  {
    cycle: '17',
    eol: '2027-09-30',
    latest: '17.0.13',
    lts: true,
    releaseDate: '2021-09-14',
    support: '2026-09-30'
  },
  {
    cycle: '11',
    eol: '2026-09-30',
    latest: '11.0.25',
    lts: true,
    releaseDate: '2018-09-25',
    support: '2023-09-30'
  }
]

describe('endoflife-api', () => {
  let client: EndOfLifeClient
  beforeEach(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const mockGetJson = jest.fn<any>().mockResolvedValue({
      statusCode: 200,
      result: javaFixture,
      headers: {}
    })
    ;(httpm.HttpClient as jest.MockedClass<typeof httpm.HttpClient>)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .mockImplementation(() => ({getJson: mockGetJson}) as any)
    client = new EndOfLifeClient()
  })

  test('fetches data', async () => {
    const eolData = await client.fetchEOLData('java')
    expect(eolData).toBeDefined()
    expect(eolData.length).toBeGreaterThan(0)
    for (const eolVersion of eolData) {
      expect(eolVersion.cycle).toBeDefined()
      expect(eolVersion.lts).toBeDefined()
      expect(eolVersion.releaseDate).toBeDefined()
      expect(eolVersion.support).toBeDefined()
      expect(eolVersion.eol).toBeDefined()
      expect(eolVersion.latest).toBeDefined()
    }
  })
})
