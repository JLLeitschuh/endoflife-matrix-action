import {beforeEach, describe, expect, jest, test} from '@jest/globals'
import {EndOfLifeClient} from '../src/endoflife-api'
import * as httpm from '@actions/http-client'

jest.mock('@actions/http-client')

const temurinFixture = {
  schema_version: '1.0.0',
  generated_at: '2024-01-01T00:00:00Z',
  last_modified: '2024-01-01T00:00:00Z',
  result: {
    name: 'eclipse-temurin',
    label: 'Eclipse Temurin',
    aliases: ['temurin'],
    category: 'lang',
    tags: ['eclipse', 'java-distribution'],
    identifiers: [],
    labels: {},
    links: {},
    releases: [
      {
        name: '21',
        codename: null,
        label: '21 (LTS)',
        releaseDate: '2023-09-19',
        isLts: true,
        ltsFrom: null,
        isEoas: false,
        eoasFrom: '2026-09-30',
        isEol: false,
        eolFrom: '2029-12-31',
        isMaintained: true,
        latest: {name: '21.0.5', date: '2024-10-15', link: null}
      },
      {
        name: '17',
        codename: null,
        label: '17 (LTS)',
        releaseDate: '2021-09-14',
        isLts: true,
        ltsFrom: null,
        isEoas: false,
        eoasFrom: '2026-09-30',
        isEol: false,
        eolFrom: '2027-10-31',
        isMaintained: true,
        latest: {name: '17.0.13', date: '2024-10-15', link: null}
      },
      {
        name: '11',
        codename: null,
        label: '11 (LTS)',
        releaseDate: '2018-09-25',
        isLts: true,
        ltsFrom: null,
        isEoas: true,
        eoasFrom: '2023-09-30',
        isEol: false,
        eolFrom: '2027-10-31',
        isMaintained: true,
        latest: {name: '11.0.25', date: '2024-10-15', link: null}
      }
    ]
  }
}

describe('endoflife-api', () => {
  let client: EndOfLifeClient
  beforeEach(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const mockGetJson = jest.fn<any>().mockResolvedValue({
      statusCode: 200,
      result: temurinFixture,
      headers: {}
    })
    ;(httpm.HttpClient as jest.MockedClass<typeof httpm.HttpClient>)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .mockImplementation(() => ({getJson: mockGetJson}) as any)
    client = new EndOfLifeClient()
  })

  test('fetches data for a product', async () => {
    const eolData = await client.fetchEOLData('eclipse-temurin')
    expect(eolData).toBeDefined()
    expect(eolData.length).toBeGreaterThan(0)
    for (const eolVersion of eolData) {
      expect(eolVersion.cycle).toBeDefined()
      expect(eolVersion.lts).toBeDefined()
      expect(eolVersion.releaseDate).toBeDefined()
      expect(eolVersion.eol !== undefined).toBe(true) // may be null for unknown EOL
      expect(eolVersion.latest).toBeDefined()
    }
  })

  test('maps v1 API fields correctly', async () => {
    const eolData = await client.fetchEOLData('eclipse-temurin')
    const java21 = eolData.find(v => v.cycle === '21')
    expect(java21).toBeDefined()
    if (!java21) return
    expect(java21.lts).toBe(true)
    expect(java21.eol).toEqual(new Date('2029-12-31'))
    expect(java21.latest).toBe('21.0.5')
    expect(java21.releaseDate).toEqual(new Date('2023-09-19'))
  })
})
