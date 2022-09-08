import { currentUserInfo } from '../Context'

import { db } from '@httpmon/db'
import { nanoid } from 'nanoid'
import generateApiKey from 'generate-api-key'

export class ApiKeyService {
  static instance: ApiKeyService

  public static getInstance(): ApiKeyService {
    if (!ApiKeyService.instance) {
      ApiKeyService.instance = new ApiKeyService()
    }
    return ApiKeyService.instance
  }

  public async listKeys() {
    const keys = await db
      .selectFrom('ApiKey')
      .select(['id', 'name'])
      .where('userId', '=', currentUserInfo().userId)
      .execute()
    return keys
  }

  public async addKey(name: string) {
    const { count } = db.fn
    const apiKeys = await db
      .selectFrom('ApiKey')
      .select(count<number>('id').as('count'))
      .where('userId', '=', currentUserInfo().userId)
      .execute()
    if (apiKeys[0].count >= 5) {
      throw new Error('Max_limit_per_user')
    }
    try {
      const hash = generateApiKey({ method: 'uuidv4' }) as string
      const token = generateApiKey({
        method: 'uuidv5',
        name,
        namespace: hash,
        prefix: 'pak',
      })
      const key = await db
        .insertInto('ApiKey')
        .values({
          id: nanoid(),
          name: name,
          tag: token.slice(-4) as string,
          hash,
          userId: currentUserInfo().userId,
        })
        .returningAll()
        .executeTakeFirst()

      return { id: key?.id, name, token }
    } catch (error) {
      throw new Error(error.constraint)
    }
  }

  public async deleteKey(keyId: string) {
    await db
      .deleteFrom('ApiKey')
      .where('id', '=', keyId)
      .where('userId', '=', currentUserInfo().userId)
      .executeTakeFirst()
  }
}
