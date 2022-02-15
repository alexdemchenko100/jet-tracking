import Emittery from 'emittery'

import pino from 'pino'
const emitter = new Emittery()
const logger = pino()

emitter.on('monitor', function (ctx) {
  logger.info("Monitor created", ctx)
})

export default emitter
