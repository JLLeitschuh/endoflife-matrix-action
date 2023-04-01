import * as core from '@actions/core'
import {EndOfLifeClient} from './endoflife-api'

async function run(): Promise<void> {
  try {
    const product: string = core.getInput('product', {required: true})
    core.debug(`Retrieving end of life datat for ${product}`)
    const client = new EndOfLifeClient()
    const eolData = await client.fetchEOLData(product)
    core.debug(`Retrieved ${eolData.length} versions of ${product}`)
    if (core.isDebug()) {
      core.debug(JSON.stringify(eolData, null, 2))
    }

    const cycles = eolData
      .filter(version => version.eol > new Date())
      .map(version => version.cycle)

    core.setOutput('version-matrix', JSON.stringify(cycles))
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message)
  }
}

run()
