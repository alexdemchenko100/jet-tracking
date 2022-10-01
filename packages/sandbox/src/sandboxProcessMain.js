const { NodeVM } = require('vm2')

const axios = require('axios')
axios.defaults.timeout = 10000

//construct this from argv
const script = process.argv[2]
const sandbox = JSON.parse(process.argv[3])

console.log('sb process started')

// const sandboxResp = await runScriptInSandbox(sandbox, script)
// process.send(JSON.stringify(sandboxResp.ctx))

runScriptInSandbox(sandbox, script)
  .catch((e) => {
    console.log('run error' + e)
    sandbox.ctx['err'] = e.toString()
  })
  .finally(() => {
    process.send(JSON.stringify(sandbox.ctx))
  })

async function runScriptInSandbox(sandbox, script) {
  const vm2 = new NodeVM({
    timeout: 10000,
    console: 'inherit',
    eval: false,
    wasm: false,
    require: {
      external: ['uuid', 'axios'],
      builtin: ['util', 'path', 'fs', 'crypto', 'url', 'buffer', 'assert', 'tls', 'zlib'],
      root: './',
    },
    sandbox,
    env: {},
  })

  //enable high level await with async function
  const asyncScriptWrapperFunction = vm2.run(`module.exports = async () => { ${script} }`, 'vm')

  try {
    await asyncScriptWrapperFunction()
  } catch (e) {
    sandbox.ctx['err'] = e.toString()
  }

  return sandbox
}

// const { NodeVM } = require('vm2')

// const axios = require('axios')

// //construct this from argv
// const script = process.argv[2]
// const sandbox = JSON.parse(process.argv[3])

// console.log('sb process started')

// const vm2 = new NodeVM({
//   timeout: 10000,
//   console: 'inherit',
//   eval: false,
//   wasm: false,
//   require: {
//     external: ['axios'],
//     builtin: ['util', 'path', 'fs', 'uuid', 'crypto', 'url', 'buffer', 'assert', 'tls', 'zlib'],
//     root: './',
//   },
//   sandbox,
//   env: {},
// })

// //enable high level await with async function
// const asyncScriptWrapperFunction = vm2.run(`module.exports = async () => { ${script} }`, 'vm')

// asyncScriptWrapperFunction()
//   .then((r) => {
//     //done
//   })
//   .catch((e) => {
//     console.log('run error' + e)
//     sandbox.ctx['err'] = e.toString()
//   })
//   .finally(() => {
//     process.send(JSON.stringify(sandbox.ctx))
//   })
