import { FastifyReply, FastifyRequest } from 'fastify'
import { requestContext } from 'fastify-request-context'
import { firebaseAuth } from '../Firebase'
import { createNewAccount, getAccountIdByUser } from '../services/DBService'

export async function onRequestAuthHook(request: FastifyRequest, reply: FastifyReply) {
  const authHeader = request.headers.authorization ?? ''
  let user = null

  const [bearer = '', token] = authHeader.split(' ')
  if (bearer.trim().toLowerCase() !== 'bearer') {
    request.log.error('error in parsing auth header')
    reply.code(401).send({ message: 'Bad token format' })
    return
  }

  try {
    user = await firebaseAuth.verifyIdToken(token)
  } catch (error) {
    request.log.error(error)
    reply.code(401).send({ message: 'Not authorized' })
    return
  }

  let accountId = await getAccountIdByUser(user.uid)
  if (!accountId) {
    request.log.error(`user ${user.uid} ${user.email} not found`)

    //It may be a new user, so create an account for them
    accountId = await createNewAccount(user.uid, user.email ?? '')
  }

  request.requestContext.set('user', { user: user.email ?? '', accountId })
  request.log.info(requestContext.get('user'), 'user authorized')
}
