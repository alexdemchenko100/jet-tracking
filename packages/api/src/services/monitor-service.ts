import PrismaPkg from '@prisma/client'

const { PrismaClient } = PrismaPkg

const prisma = new PrismaClient()

import { Static, Type } from '@sinclair/typebox'

import emitter from './emitter.js'

import { Generated, Kysely, PostgresDialect } from 'kysely'

export const MonitorSchema = Type.Object({
  id: Type.Optional(Type.String()),
  name: Type.String({ minLength: 2 }),
  url: Type.String({ format: 'url' }),
  method: Type.String(),
  body: Type.String(),
  frequency: Type.Integer(),
  headers: Type.String({ default: '' }),
  queryParams: Type.String({ default: '' }),
  cookies: Type.String({ default: '' }),
})

export type MonitorDTO = Static<typeof MonitorSchema>

interface MonitorTable {
  id: Generated<number>
  createdAt: Generated<Date>
  updatedAt: Generated<Date>
  name: string
  url: string
  method: string
  body: string
  frequency: number
  headers: string
  queryParams: string
  cookies: string
}

interface Database {
  Monitor: MonitorTable
}

export class MonitorService {
  static instance: MonitorService
  db = new Kysely<Database>({
    dialect: new PostgresDialect({
      host: 'localhost',
      database: 'mondb',
      user: 'postgres',
      password: 'postgres',
    }),
  })

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
    // const monList = await prisma.monitor.findMany()
    // return monList

    const { count } = this.db.fn

    const monList = await this.db.selectFrom('Monitor').selectAll().execute()
    const t2 = await this.db.selectFrom('Monitor').select('Monitor.name')

    return monList
  }
}
