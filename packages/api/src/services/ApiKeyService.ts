import { currentUserInfo } from '../Context'
import { db } from '@httpmon/db'
import { nanoid } from 'nanoid'
import generateApiKey from 'generate-api-key'
import { hashSync, compareSync } from 'bcryptjs'

export async function validateKey(accountId: string, key: string) {
  const apiKeys = await db
    .selectFrom('UserAccount')
    .innerJoin('ApiKey', 'ApiKey.userId', 'UserAccount.userId')
    .selectAll()
    .where('tag', '=', key.slice(-4))
    .where('accountId', '=', accountId)
    .execute()

  for (let i = 0; i < apiKeys.length; i++) {
    if (compareSync(key, apiKeys[i].hash)) {
      return apiKeys[i].userId
    }
  }
  return
}

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
      .selectAll()
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
      const token = generateApiKey({
        method: 'string',
        prefix: 'pak',
        length: 36,
      })

      //use bcrypt to compute hash of the token for later comparision
      const hash = hashSync(token as string, 10)
      const tag = token.slice(-4) as string

      const key = await db
        .insertInto('ApiKey')
        .values({
          id: nanoid(),
          name: name,
          tag,
          hash,
          userId: currentUserInfo().userId,
        })
        .returningAll()
        .executeTakeFirst()

      return { ...key, token }
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
