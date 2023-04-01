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
  process.env['INPUT_PRODUCT'] = 'java'
  process.env['RUNNER_DEBUG'] = '1'
  const np = process.execPath
  const ip = path.join(__dirname, '..', 'lib', 'main.js')
  const options: cp.ExecFileSyncOptions = {
    env: process.env
  }
  const output = cp.execFileSync(np, [ip], options).toString()
  // eslint-disable-next-line no-console
  console.log(output)
  expect(output).toContain('::set-output name=versions::[')
})
