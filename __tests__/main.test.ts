import * as process from 'process'
import * as cp from 'child_process'
import * as path from 'path'
import {beforeEach, afterAll, describe, expect, test} from '@jest/globals'
import {run_args} from '../src/main'

describe('integration testing', () => {
  // eslint-disable-next-line no-undef
  let processEnv: NodeJS.ProcessEnv
  beforeEach(() => {
    // eslint-disable-next-line no-console
    console.log('::stop-commands::stoptoken')
    processEnv = {...process.env}
    processEnv.GITHUB_PATH = '' // Stub out ENV file functionality, so we can verify it writes to standard out
    processEnv.GITHUB_OUTPUT = '' // Stub out ENV file functionality, so we can verify it writes to standard out
    processEnv.RUNNER_DEBUG = '1' // Enable debug logging
  })
  afterAll(() => {
    // eslint-disable-next-line no-console
    console.log('::stoptoken::')
  })
  test('test runs_args', async () => {
    const values = await run_args('java', '44321, 33221 3111', '', '')
    expect(values).toContain(44321)
    expect(values).toContain(33221)
    expect(values).toContain(3111)
  })

  // shows how the runner will run a javascript action with env / stdout protocol
  test('test run as spawned process', () => {
    const nodePath = process.execPath
    const ip = path.join(__dirname, '..', 'lib', 'main.js')
    // eslint-disable-next-line no-console
    console.log(`Environment Before Merge: ${JSON.stringify(process.env)}`)
    const options: cp.ExecFileSyncOptions = {
      env: {...processEnv, INPUT_PRODUCT: 'java'}
    }
    // eslint-disable-next-line no-console
    console.log(`Environment After Merge: ${JSON.stringify(options.env)}`)
    const output = cp.execFileSync(nodePath, [ip], options).toString()
    // eslint-disable-next-line no-console
    console.log(output)
    expect(output).toContain('::set-output name=versions::[')
  })
})
