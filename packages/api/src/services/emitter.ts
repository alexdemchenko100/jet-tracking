import Emittery from 'emittery'
import { deleteObject } from './GSCService'

import { MonitorResult } from '@httpmon/db'
import { logger } from '../Context'

export const emitter = new Emittery()

emitter.on('monitor', function (ctx) {
  logger.info('Monitor created', ctx)
})

emitter.on(
  'delete-cloud-storage-objects',
  function ({ accountId, items }: { accountId: string; items: MonitorResult[] }) {
    for (const item of items) {
      if (item?.id && item?.monitorId) {
        const folderName = `${item.monitorId}/${item.id}`
        deleteObject(accountId, folderName, 'body')
        deleteObject(accountId, folderName, 'headers')
      }
    }
  }
)

export default emitter
