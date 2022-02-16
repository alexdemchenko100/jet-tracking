import PrismaPkg from '@prisma/client'

const { PrismaClient } = PrismaPkg

const prisma = new PrismaClient()

import emitter from './emitter.js'

import { db, MonitorDTO } from '@httpmon/db'

export class MonitorService {
  static instance: MonitorService

  public static getInstance(): MonitorService {
    if (!MonitorService.instance) {
      MonitorService.instance = new MonitorService()
    }
    return MonitorService.instance
  }

  public async create(input: MonitorDTO) {
    const mon = await prisma.monitor.create({
      data: { ...input },
    })

    emitter.emit('monitor', mon.id)
    return mon
  }

  public async update(input: MonitorDTO) {
    const mon = await prisma.monitor.update({
      where: { id: input.id },
      data: { ...input },
    })
    return mon
  }

  public async find(id: string) {
    try {
      const mon = await prisma.monitor.findUnique({
        where: {
          id,
        },
      })
      return mon
    } catch (e) {
      return null
    }
  }

  public async list() {
    const monList = await prisma.monitor.findMany()
    return monList

    // const { count } = this.db.fn

    // const monList = await this.db.selectFrom('Monitor').selectAll().execute()
    // const t2 = await this.db.selectFrom('Monitor').select('Monitor.name')

    // return monList
  }

  public async getMonitorResults(monitorId: string) {
    return await db
      .selectFrom('MonitorResult')
      .selectAll()
      .where('monitorId', '=', monitorId)
      .execute()
  }
}
