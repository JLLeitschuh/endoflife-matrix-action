import * as core from '@actions/core'
import {EndOfLifeClient} from './endoflife-api'

function convertInputListToNumberList(
  input: string,
  fieldName: string
): number[] {
  return input
    .split(/(,| |, )/)
    .map(v => v.trim())
    .filter(v => v.length !== 0 && v !== ',')
    .map(v => {
      const parsed = parseInt(v, 10)
      if (isNaN(parsed)) throw new Error(`Invalid ${fieldName} number: ${v}`)
      return parsed
    })
}

export async function run_args(
  product: string,
  additionalVersions: string,
  excludedVersions: string,
  maxVersion: string
): Promise<number[]> {
  const additionalVersionsList = convertInputListToNumberList(
    additionalVersions,
    'additional-versions'
  )
  const excludedVersionsList = convertInputListToNumberList(
    excludedVersions,
    'excluded-versions'
  )
  const maxVersionNumber =
    maxVersion.length !== 0 ? parseInt(maxVersion, 10) : null
  core.debug(`Retrieving end of life data for ${product}`)
  const client = new EndOfLifeClient()
  const eolData = await client.fetchEOLData(product)
  core.debug(`Retrieved ${eolData.length} versions of ${product}`)
  if (core.isDebug()) {
    core.debug(JSON.stringify(eolData, null, 2))
  }
  const filteredCycles = eolData
    .filter(version => version.eol > new Date())
    .map(version => version.cycle)
    .map(cycle => parseInt(cycle, 10))
    .filter(cycle => !excludedVersionsList.includes(cycle))
  let cycles: number[]
  if (maxVersionNumber !== null) {
    cycles = filteredCycles.filter(cycle => cycle <= maxVersionNumber)
  } else {
    cycles = filteredCycles
  }
  cycles = cycles.concat(additionalVersionsList)
  cycles = cycles.sort((a, b) => a - b)
  core.debug(`For product ${product} selected versions: ${cycles.join(', ')}`)
  return cycles
}

async function run(): Promise<void> {
  try {
    core.debug(
      `Environment variables within action: ${JSON.stringify(process.env)}\n`
    )
    const product: string = core.getInput('product', {required: true})
    const additionalVersions = core.getInput('additional-versions')
    const excludedVersions = core.getInput('excluded-versions')
    const maxVersion = core.getInput('max-version')
    core.setOutput(
      'versions',
      JSON.stringify(
        await run_args(
          product,
          additionalVersions,
          excludedVersions,
          maxVersion
        )
      )
    )
  } catch (error) {
    if (error instanceof Error) core.setFailed(error)
  }
}

if (require.main === module) {
  // Only run if this file is being executed directly
  run()
}
