import { FastifyInstance } from 'fastify'
import S from 'fluent-json-schema'
import { ApiKeySchema } from '@httpmon/db'
import { onRequestAuthHook, onAdminRequestAuthHook } from '../../RouterHooks'
import { ApiKeyService } from '../../../services/ApiKeyService'
import { Params, ParamsSchema } from '../../../types'

export default async function ApiKeyRouter(app: FastifyInstance) {
  app.addHook('onRequest', onRequestAuthHook)
  app.addHook('onRequest', onAdminRequestAuthHook)

  const apiKeyService = ApiKeyService.getInstance()

  interface ApiKeyCreate {
    name: string
  }

  app.get(
    '/',
    {
      schema: {
        response: {
          200: S.array().items(ApiKeySchema),
        },
      },
    },
    async function (req, reply) {
      const resp = await apiKeyService.listKeys()
      req.log.info(`List keys: ${JSON.stringify(resp)}`)
      reply.send(resp)
    }
  )

  app.post<{ Body: ApiKeyCreate }>(
    '/',
    {
      schema: {
        body: S.object().prop('name', S.string()),
        response: {
          200: ApiKeySchema,
        },
      },
    },
    async function (req, reply) {
      try {
        const { name } = req.body
        const resp = await apiKeyService.addKey(name)
        req.log.info(`Creating new api key: ${resp.token}`)
        reply.send(resp)
      } catch (error) {
        let message
        switch (error.message) {
          case 'Max_limit_per_user':
            message = 'Every user can have 5 api keys at maximum.'
            break
          case 'ApiKey_name_userId_key':
            message = 'Api Key with the same name already exists. Please use another name'
            break
          default:
            message = ''
        }
        reply.status(400).send({ message })
      }
    }
  )

  app.delete<{ Params: Params }>(
    '/:id',
    {
      schema: {
        params: ParamsSchema,
      },
    },
    async function ({ params: { id }, log }, reply) {
      const resp = await apiKeyService.deleteKey(id)
      log.info(resp, `Deleted api key id: ${id}`)
      reply.send(resp)
    }
  )
}
