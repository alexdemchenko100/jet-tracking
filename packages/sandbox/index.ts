import { MonitorRequest, MonitorAuth } from '@httpmon/db'
import { spawn } from 'child_process'
import { join } from 'path'

type SandBox = {
  ctx: {
    request: {
      method: string
      url: string
      auth: MonitorAuth | undefined
      headers: Record<string, string>
      queryParams: Record<string, string>
      body: string | undefined
    }
    env: Record<string, string>
  }
}

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
      [
        join(__dirname, 'sandboxProcessMain.js'),
        script,
        JSON.stringify(sandbox),
      ],
      {
        stdio: [0, 1, 2, 'ipc'],
      }
    )

    let timeout = setTimeout(() => {
      workerProcess.kill('SIGINT')
    }, 10000)

    workerProcess.on('message', function (data) {
      console.log('message: ' + data)
      data = data.toString()
      sandboxOutJson += data
    })

    workerProcess.on('close', async function (code) {
      clearTimeout(timeout)
      console.log('==Result==')
      console.log(scriptOutput)

      try {
        let ctx = JSON.parse(sandboxOutJson)
        if (code == 0 && ctx && !ctx.err) {
          resolve(ctx)
        } else {
          reject({ err: ctx?.err || 'EScriptError' })
        }
      } catch (e) {
        reject({ err: 'EScriptError' })
      }
    })
  })
}
