const esbuild = require('esbuild')
const copyPlugin = require('esbuild-plugin-copy')

//defaults to build
let config = '-build'
if (process.argv.length > 2) {
  config = process.argv[2]
}

esbuild
  .build({
    entryPoints: ['src/index.ts'],
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
      copyPlugin.copy({
        // this is equal to process.cwd(), which means we use cwd path as base path to resolve `to` path
        // if not specified, this plugin uses ESBuild.build outdir/outfile options as base path.
        resolveFrom: 'cwd',
        assets: [
          {
            from: ['node_modules/vm2/lib/bridge.js'],
            to: ['dist/bridge.js'],
          },
          {
            from: ['node_modules/vm2/lib/setup-sandbox.js'],
            to: ['dist/setup-sandbox.js'],
          },
          {
            from: ['node_modules/vm2/lib/setup-node-sandbox.js'],
            to: ['dist/setup-node-sandbox.js'],
          },
        ],
      }),
    ],
  })
  .catch(() => process.exit(1))

//esbuild src/index.ts --bundle --minify --platform=node
//--target=node16 --external:pg-native --outdir=dist --metafile=dist/meta.json",
