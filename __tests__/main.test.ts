import * as process from 'process'
import * as cp from 'child_process'
import * as path from 'path'
import {beforeEach, afterAll, describe, expect, jest, test} from '@jest/globals'
import {run_args} from '../src/main'
import {EndOfLifeClient} from '../src/endoflife-api'
import type {EndOfLifeProductVersion} from '../src/endoflife-api'

jest.mock('../src/endoflife-api')

const javaVersions: EndOfLifeProductVersion[] = [
  {
    cycle: '21',
    eol: new Date('2029-09-30'),
    latest: '21.0.5',
    lts: true,
    releaseDate: new Date('2023-09-19'),
    support: new Date('2026-09-30')
  },
  {
    cycle: '17',
    eol: new Date('2027-09-30'),
    latest: '17.0.13',
    lts: true,
    releaseDate: new Date('2021-09-14'),
    support: new Date('2026-09-30')
  },
  {
    cycle: '11',
    eol: new Date('2026-09-30'),
    latest: '11.0.25',
    lts: true,
    releaseDate: new Date('2018-09-25'),
    support: new Date('2023-09-30')
  }
]

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

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const mockFetchEOLData = jest.fn<any>().mockResolvedValue(javaVersions)
    ;(EndOfLifeClient as jest.MockedClass<typeof EndOfLifeClient>)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .mockImplementation(() => ({fetchEOLData: mockFetchEOLData}) as any)
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
    const mockScript = path.join(__dirname, 'mock-http-client.js')
    const options: cp.ExecFileSyncOptions = {
      env: {
        ...processEnv,
        INPUT_PRODUCT: 'java',
        NODE_OPTIONS: `--require ${mockScript}`
      }
    }
    const output = cp.execFileSync(nodePath, [ip], options).toString()
    expect(output).toContain('::set-output name=versions::[')
  })
})
