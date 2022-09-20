import { FastifyInstance } from 'fastify'
import S from 'fluent-json-schema'
import { ContactInfo, ContactInfoSchema } from '../../types/index'
import { sendContactEmail } from '../../services/SendgridService'

export default async function ContactsPublicRouter(app: FastifyInstance) {
  // POST /
  app.post<{ Body: ContactInfo }>(
    '/',
    {
      schema: {
        body: ContactInfoSchema,
        response: {
          200: S.object().prop('message', S.string()),
        },
      },
    },
    async function (req, reply) {
      const { email, firstName, lastName, message } = req.body

      try {
        await sendContactEmail(email, firstName, lastName, message)
        reply.send({ message: 'success' })
      } catch (error) {
        reply.send({ message: error.message }).status(400)
      }
    }
  )
}
