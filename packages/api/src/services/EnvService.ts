import { currentUserInfo } from './../Context'

import { db, MonEnv, MonitorTuples } from '@httpmon/db'
import { nanoid } from 'nanoid'

export class EnvService {
  static instance: EnvService

  public static getInstance(): EnvService {
    if (!EnvService.instance) {
      EnvService.instance = new EnvService()
    }
    return EnvService.instance
  }

  public async listEnvironments(name: string = '') {
    const environments = await db
      .selectFrom('MonEnv')
      .selectAll()
      .where('accountId', '=', currentUserInfo().accountId)
      .if(Boolean(name), (qb) => qb.where('name', '=', name))
      .if(Boolean(!name), (qb) => qb.where('name', '<>', '__global__'))
      .execute()
    return environments
  }

  public async newEnv(name: string, env: MonitorTuples) {
    const monEnv = await db
      .insertInto('MonEnv')
      .values({
        id: nanoid(),
        name: name,
        accountId: currentUserInfo().accountId,
        env: JSON.stringify(env) as any,
      })
      .returningAll()
      .executeTakeFirst()

    return monEnv
  }

  public async getEnv(envId: string) {
    if (envId === 'global') {
      const env = await db
        .selectFrom('MonEnv')
        .selectAll()
        .where('accountId', '=', currentUserInfo().accountId)
        .where('name', '=', '__global__')
        .executeTakeFirst()
      return env ?? {}
    }
    const vars = await db
      .selectFrom('MonEnv')
      .selectAll()
      .where('accountId', '=', currentUserInfo().accountId)
      .where('id', '=', envId)
      .executeTakeFirst()
    return vars
  }

  public async updateEnv(envId: string, env: MonEnv) {
    await db
      .updateTable('MonEnv')
      .set({ name: env.name, env: JSON.stringify(env.env) as any })
      .where('id', '=', envId)
      .where('accountId', '=', currentUserInfo().accountId)
      .executeTakeFirst()
  }

  public async deleteEnv(envId: string) {
    await db
      .deleteFrom('MonEnv')
      .where('id', '=', envId)
      .where('accountId', '=', currentUserInfo().accountId)
      .executeTakeFirst()
  }
}
