import * as core from '@actions/core'

async function run(): Promise<void> {
  try {
    const product: string = core.getInput('product', {required: true})
    core.debug(`Retrieving end of life datat for ${product}`)

    core.setOutput('version-matrix', new Date().toTimeString())
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message)
  }
}

run()
