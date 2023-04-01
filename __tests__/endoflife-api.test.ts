import {beforeEach, describe, expect, test} from '@jest/globals'
import {EndOfLifeClient} from '../src/endoflife-api'

describe('endoflife-api', () => {
  let client: EndOfLifeClient
  beforeEach(() => {
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
