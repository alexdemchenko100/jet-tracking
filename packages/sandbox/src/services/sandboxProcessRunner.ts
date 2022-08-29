import { MonitorRequest } from '@httpmon/db'
import { spawn } from 'child_process'
import { join } from 'path'
import { SandBox } from '../types'
import { logger } from './Context'

export function handlePreScriptExecution(
  monitor: MonitorRequest,
  env: Record<string, string>,
  script: string
) {
  return new Promise<SandBox>((resolve, reject) => {
    const { method, url, auth, headers, queryParams, body } = monitor
    const sandbox = {
      ctx: {
        request: { method, url, auth, headers, queryParams, body },
        env,
      },
    }

    let scriptOutput = ''
    let sandboxOutJson = ''
    let err = ''
    var workerProcess = spawn(
      'node',
      [join(__dirname, 'sandboxProcessMain.js'), script, JSON.stringify(sandbox)],
      {
        stdio: [0, 1, 2, 'ipc'],
      }
    )

    let timeout = setTimeout(() => {
      workerProcess.kill('SIGINT')
    }, 10000)

    workerProcess.on('message', function (data) {
      logger.info('message: ' + data)
      data = data.toString()
      sandboxOutJson += data
    })

    workerProcess.on('close', async function (code) {
      clearTimeout(timeout)
      logger.info('scriptOutput', scriptOutput)

      try {
        let ctx = JSON.parse(sandboxOutJson)
        if (code == 0 && ctx && !ctx.err) {
          resolve({ ctx })
        } else {
          reject({ err: ctx?.err || 'EScriptError' })
        }
      } catch (e) {
        reject({ err: 'EScriptError' })
      }
    })
  })
}
