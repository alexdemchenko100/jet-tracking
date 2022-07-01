const { NodeVM } = require('vm2')

//construct this from argv
const script = process.argv[2]
const sandbox = JSON.parse(process.argv[3])

console.log('sb process started')

const vm2 = new NodeVM({
  timeout: 10000,
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
  env: {},
})

try {
  //enable high level await with async function
  const asyncScriptWrapperFunction = vm2.run(
    `module.exports = async () => { ${script} }`,
    'vm'
  )
  asyncScriptWrapperFunction().then((r) => {})
} catch (e) {
  console.log('run error' + e)
  sandbox.ctx['err'] = e.toString()
  //throw e
}

process.send(JSON.stringify(sandbox.ctx))

console.log('Sandbox Done')

console.log('sb', JSON.stringify(sandbox.ctx))
