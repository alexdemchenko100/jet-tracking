import { FastifyReply, FastifyRequest } from 'fastify'
import { requestContext } from '@fastify/request-context'
import { firebaseAuth } from '../Firebase'
import { createNewAccount, getUserAccount, processInvitedAccounts } from '../services/DBService'

import { validateKey } from '../services/ApiKeyService'

export async function onRequestAuthHook(request: FastifyRequest, reply: FastifyReply) {
  const authHeader = request.headers.authorization ?? ''
  let user = null
  const requestedAccountId = (request.headers['x-proautoma-accountid'] as string) ?? ''

  const [bearer = '', token] = authHeader.split(' ')
  if (bearer.trim().toLowerCase() !== 'bearer') {
    request.log.error('No Auth bearer header - must provide one')
    reply.code(401).send({ message: 'Bad token format' })
    return
  }

  try {
    if (token.startsWith('pak.')) {
      //This is API Key for programmable access
      const userId = await validateKey(requestedAccountId, token)
      if (userId) {
        user = await firebaseAuth.getUser(userId)
      }
    } else {
      //regular user login
      user = await firebaseAuth.verifyIdToken(token)
    }
  } catch (error) {
    request.log.error(error)
    reply.code(401).send({ message: 'Not authorized' })
    return
  }

  if (!user) {
    reply.code(401).send({ message: 'Not authorized' })
    return
  }

  let userAccount = await getUserAccount(user.uid, requestedAccountId)

  if (!userAccount) {
    request.log.error(`user ${user.uid} ${user.email} not found`)

    processInvitedAccounts(user.uid, user.email ?? '')

    //It may be a new user, so create an account with owner role
    userAccount = await createNewAccount(user.uid, user.email ?? '')
  }

  if (!userAccount) {
    reply.code(401).send({ message: 'Not authorized' })
    return
  }

  if (userAccount.role == 'notifications') {
    reply.code(401).send({ message: 'Not authorized. notifications only' })
    return
  }

  request.requestContext.set('user', {
    user: user.email,
    userId: user.uid,
    accountId: userAccount.accountId,
    role: userAccount.role,
  })
  request.log.info(requestContext.get('user'), 'user authorized')
}

export async function onOwnerRequestAuthHook(_: FastifyRequest, reply: FastifyReply) {
  const user = requestContext.get('user')

  if (user && user.role !== '' && user.role !== 'owner') {
    reply.code(403).send({ message: 'Access denied' })
  }
}

export async function onAdminRequestAuthHook(_: FastifyRequest, reply: FastifyReply) {
  const user = requestContext.get('user')

  if (user && user.role === 'viewer') {
    reply.code(403).send({ message: 'Access denied' })
  }
}
