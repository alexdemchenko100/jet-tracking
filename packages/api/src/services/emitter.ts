import Emittery from 'emittery'

import pino from 'pino'
const logger = pino()

export const emitter = new Emittery()

emitter.on('monitor', function (ctx) {
  logger.info('Monitor created', ctx)
})

export default emitter
