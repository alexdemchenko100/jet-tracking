const esbuild = require('esbuild')
const copyPlugin = require('esbuild-plugin-copy')
const { nodeExternalsPlugin } = require('esbuild-node-externals')
//defaults to build
let config = '-build'
if (process.argv.length > 2) {
  config = process.argv[2]
}

esbuild
  .build({
    entryPoints: ['src/index.ts', 'src/sandboxProcessMain.js'],
    bundle: true,
    outdir: 'dist',
    platform: 'node',
    minify: true,
    target: 'node16',
    external: ['pg-native'],
    watch: config == '-w',
    sourcemap: config == '-w',
    logLevel: 'info',
    plugins: [
      nodeExternalsPlugin({
        allowList: ['@httpmon/db'],
      }),
    ],
  })
  .catch(() => process.exit(1))

//esbuild src/index.ts --bundle --minify --platform=node
//--target=node16 --external:pg-native --outdir=dist --metafile=dist/meta.json",
