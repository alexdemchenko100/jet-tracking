import PrismaPkg from '@prisma/client'

const { PrismaClient } = PrismaPkg

const prisma = new PrismaClient()

import emitter from './emitter.js'

import { sql } from 'kysely'
import { db, Monitor, MonitorTuples } from '@httpmon/db'
import { nanoid } from 'nanoid'
import pino from 'pino'

const logger = pino()
export class MonitorService {
  static instance: MonitorService

  public static getInstance(): MonitorService {
    if (!MonitorService.instance) {
      MonitorService.instance = new MonitorService()
    }
    return MonitorService.instance
  }

  public async create(input: Monitor) {
    logger.info('mon:')
    logger.info(input)

    const sql = db
      .insertInto('Monitor')
      .values({ ...input, id: nanoid() })
      .compile().sql

    logger.info(sql)

    const mon = await db
      .insertInto('Monitor')
      .values({ ...input, id: nanoid() })
      .returningAll()
      .executeTakeFirstOrThrow()

    emitter.emit('monitor', mon.id)
    return mon
  }

  // const mon = await prisma.monitor.create({
  //   data: { ...input },
  // })

  // emitter.emit('monitor', mon.id)
  // return mon

  // public async update(input: Monitor) {
  //   const mon = await prisma.monitor.update({
  //     where: { id: input.id },
  //     data: { ...input },
  //   })
  //   return mon
  // }

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
    // const monList = await prisma.monitor.findMany()
    // return monList

    const monList = await db.selectFrom('Monitor').selectAll().execute()
    return monList
  }

  public async getMonitorResults(monitorId: string) {
    const results = await db
      .selectFrom('MonitorResult')
      .selectAll()
      .where('monitorId', '=', monitorId)
      .execute()
    const resultSet = results.map((result) => {
      return {
        ...result,
        bodyJson: result.bodyJson ? JSON.stringify(result.bodyJson) : null,
      }
    })
    return resultSet
  }

  public async setEnv(monitorId: string, env: MonitorTuples) {
    await db
      .updateTable('Monitor')
      .set({ env: JSON.stringify(env) })
      .where('id', '=', monitorId)
      .execute()
  }
}
