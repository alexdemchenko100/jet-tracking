import { FastifyInstance } from 'fastify'
import { StatusPageService } from '../../services/StatusPageService'
import { Params, ParamsSchema, PublicStatusPageSchema } from '../../types'

export default async function StatusPublicRouter(app: FastifyInstance) {
  const statusService = StatusPageService.getInstance()

  // GET /:id
  app.get<{ Params: Params }>(
    '/:id',
    {
      schema: {
        params: ParamsSchema,
        response: {
          200: PublicStatusPageSchema,
        },
      },
    },
    async function (req, reply) {
      const { id } = req.params
      const resp = await statusService.getStatusPageFromUrl(id)
      if (resp) {
        reply.send(resp)
      } else {
        reply.code(404).send(`Status Page Not found`)
      }
    }
  )
}
