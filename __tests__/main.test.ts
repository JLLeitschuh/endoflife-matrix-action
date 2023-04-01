import * as process from 'process'
import * as cp from 'child_process'
import * as path from 'path'
import {expect, test} from '@jest/globals'
import {run_args} from '../src/main'

test('test runs_args', async () => {
  const values = await run_args('java', '44321, 33221 3111', '', '')
  expect(values).toContain(44321)
  expect(values).toContain(33221)
  expect(values).toContain(3111)
})

// shows how the runner will run a javascript action with env / stdout protocol
test('test runs', () => {
  const nodePath = process.execPath
  const ip = path.join(__dirname, '..', 'lib', 'main.js')
  // eslint-disable-next-line no-console
  console.log(`Environment Before Merge: ${JSON.stringify(process.env)}`)
  const options: cp.ExecFileSyncOptions = {
    env: {...process.env, INPUT_PRODUCT: 'java', RUNNER_DEBUG: '1'}
  }
  // eslint-disable-next-line no-console
  console.log(`Environment After Merge: ${JSON.stringify(options.env)}`)
  const output = cp.execFileSync(nodePath, [ip], options).toString()
  // eslint-disable-next-line no-console
  console.log(output)
  expect(output).toContain('::set-output name=versions::[')
})
