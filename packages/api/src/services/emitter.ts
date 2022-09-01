import Emittery from 'emittery'
import { deleteObject } from './GSCService'

import pino from 'pino'
import { MonitorResult } from '@httpmon/db'
const logger = pino()

export const emitter = new Emittery()

emitter.on('monitor', function (ctx) {
  logger.info('Monitor created', ctx)
})

emitter.on(
  'delete-cloud-storage-objects',
  function ({ accountId, items }: { accountId: string; items: MonitorResult[] }) {
    for (const item of items) {
      if (item?.id) {
        deleteObject(accountId, item.id, 'body')
      }
    }
  }
)

export default emitter
