import { createNewAccount, getAccountIdByUser } from './../services/DBService'
import { firebaseAuth } from './../Firebase'
import { EnvService } from '../services/EnvService'
import { FastifyInstance } from 'fastify'
import S from 'fluent-json-schema'
import { EnvFluentSchema, MonEnv } from '@httpmon/db'
import { requestContext } from 'fastify-request-context'

export default async function EnvRouter(app: FastifyInstance) {
  const envService = EnvService.getInstance()

  app.addHook('onRequest', async (request: any, reply) => {
    const authHeader = request.headers.authorization ?? ''
    let user = null

    const [bearer = '', token] = authHeader.split(' ')
    if (bearer.trim().toLowerCase() !== 'bearer') {
      app.log.error('error in parsing auth header')
      reply.code(401).send({ message: 'Bad token format' })
      return
    }

    try {
      user = await firebaseAuth.verifyIdToken(token)
    } catch (error) {
      app.log.error(error)
      reply.code(401).send({ message: 'Not authorized' })
      return
    }

    let accountId = await getAccountIdByUser(user.uid)
    if (!accountId) {
      app.log.error(`user ${user.uid} ${user.email} not found`)

      //It may be a new user, so create an account for them
      accountId = await createNewAccount(user.uid, user.email ?? '')
    }

    request.requestContext.set('user', { user: user.email, accountId })
    app.log.info(requestContext.get('user'), 'user authorized')
  })

  //GET, PUT, POST /environments
  //['env1', 'env2']

  app.put<{ Body: MonEnv }>(
    '/',
    {
      schema: {
        body: EnvFluentSchema,
        response: {
          200: EnvFluentSchema,
        },
      },
    },
    async function (req, reply) {
      const env = req.body

      const resp = await envService.newEnv(env.name, env.env)
      req.log.info(`Creating new env: ${resp?.id}`)
      reply.send(resp)
    }
  )

  app.get(
    '/',
    {
      schema: {
        response: {},
      },
    },
    async function (_, reply) {
      const resp = await envService.listEnvironments()
      reply.send(resp)
    }
  )

  const ParamsSchema = S.object().prop('id', S.string())
  type Params = {
    id: string
  }

  app.get<{ Params: Params }>(
    '/:id',
    {
      schema: {
        params: ParamsSchema,
        response: { 200: EnvFluentSchema },
      },
    },
    async function ({ params: { id } }, reply) {
      const monEnv = await envService.getEnv(id)
      if (monEnv) {
        reply.send(monEnv)
      } else {
        reply.code(404).send(`${id} Not found`)
      }
    }
  )

  app.post<{ Params: Params; Body: MonEnv }>(
    '/:id',
    {
      schema: {
        params: ParamsSchema,
        body: EnvFluentSchema,
        response: {
          200: EnvFluentSchema,
        },
      },
    },
    async function ({ params: { id }, body: monEnv, log }, reply) {
      if (id != monEnv.id) {
        reply.code(400).send('Env id is not valid')
        return
      }

      const resp = await envService.updateEnv(monEnv.id, monEnv.env)
      log.info(`Updating monEnv: ${monEnv.id}`)

      reply.send(resp)
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
      const resp = await envService.deleteEnv(id)
      log.info(resp, `Deleted env id: ${id}`)
      reply.send(resp)
    }
  )
}
