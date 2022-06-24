import { MonitorRequest } from '@httpmon/db'
import { NodeVM } from 'vm2'

export async function executePreScript(
  monitor: MonitorRequest,
  env: Record<string, string>,
  script: string
) {
  const { method, url, auth, headers, queryParams, body } = monitor
  const sandbox = {
    ctx: {
      request: { method, url, auth, headers, queryParams, body },
      env,
    },
  }

  const vm2 = new NodeVM({
    timeout: 2000,
    console: 'inherit',
    eval: false,
    wasm: false,
    require: {
      external: ['request', 'axios'],
      builtin: [
        'util',
        'path',
        'fs',
        'uuid',
        'crypto',
        'url',
        'buffer',
        'assert',
        'tls',
        'zlib',
      ],
      root: './',
    },
    sandbox,
    env,
  })

  try {
    //enable high level await with async function
    const asyncScriptWrapperFunction = vm2.run(
      `module.exports = async () => { ${script} }`,
      'vm'
    )
    await asyncScriptWrapperFunction()
  } catch (e) {
    console.log('run error' + e)
    //throw e
  }

  return sandbox.ctx
}

// let monitor = { url: 'https://httpbin.org/get', headers: { 'x-a': 'dude' } }
// let env = { TOKEN: '1234' }

// let resp = await executePreScript(
//   monitor,
//   env,
//   `
//   const axios = require('axios')
//   let r = await axios.get(request.url)
//   request.headers['Auth'] = process.env['TOKEN']
//   request.headers['Foo'] = 'Bar'
//   request.headers['r'] = r.data

//   process.env['dd'] = 234
//   process.env.x = 'randomXXX'
//   console.log('resp-int', JSON.stringify(request, null, 2))
// `
// )

// console.log('resp', JSON.stringify(resp, null, 2))
