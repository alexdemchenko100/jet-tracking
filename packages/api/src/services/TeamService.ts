import { v4 as uuidv4 } from 'uuid'
import { currentUserInfo, logger } from '../Context'
import { db } from '@httpmon/db'
import { nanoid } from 'nanoid'
import { sendVerificationEmail } from './SendgridService'
import dayjs from 'dayjs'
import { UserInvite } from '../types'

export class TeamService {
  static instance: TeamService

  public static getInstance(): TeamService {
    if (!TeamService.instance) {
      TeamService.instance = new TeamService()
    }
    return TeamService.instance
  }

  public async listTeamMembers() {
    logger.error('In ListTeamMembers')
    const dayAgoStartime = dayjs().subtract(1, 'day').toDate()
    const userAccounts = await db
      .selectFrom('UserAccount')
      .selectAll()
      .where('accountId', '=', currentUserInfo().accountId)
      .execute()

    userAccounts.forEach((item) => {
      if (item.isVerified) {
        item.status = 'verified'
      } else if (item.createdAt && item.createdAt < dayAgoStartime) {
        item.status = 'expired'
      } else {
        item.status = 'unverified'
      }
      if (!item.role) {
        logger.error('ROLE msut be non-null')
        item.role = 'notifications'
      }
    })
    return userAccounts
  }

  public async createOrUpdateTeamMember(invitation: UserInvite) {
    const isUserInvite = invitation.role != 'notifications'

    //is this user is already a team member?
    const user = await db
      .selectFrom('UserAccount')
      .selectAll()
      .where('email', '=', invitation.email)
      .where('accountId', '=', currentUserInfo().accountId)
      .executeTakeFirst()

    if (!user) {
      const token = nanoid()
      const tokenExpiryAt = dayjs().add(1, 'day').toDate()

      await db
        .insertInto('UserAccount')
        .values({
          id: uuidv4(),
          email: invitation.email,
          accountId: currentUserInfo().accountId,
          isPrimary: false,
          role: invitation.role,
          isVerified: false,
          token,
          tokenExpiryAt,
        })
        .returningAll()
        .executeTakeFirst()

      await sendVerificationEmail(
        invitation.email,
        token,
        currentUserInfo().accountId,
        isUserInvite
      )
      return 'success'
    }

    if (user.isVerified && user.role == invitation.role) return 'already_verified'

    const expired = user.token && user.tokenExpiryAt && dayjs().toDate() > user.tokenExpiryAt

    if (expired || invitation.resendToken) {
      const token = nanoid()
      const tokenExpiryAt = dayjs().add(1, 'day').toDate()

      await db
        .updateTable('UserAccount')
        .set({
          userId: user.userId,
          role: invitation.role,
          isVerified: false,
          token,
          tokenExpiryAt,
        })
        .returningAll()
        .executeTakeFirst()

      await sendVerificationEmail(
        invitation.email,
        token,
        currentUserInfo().accountId,
        isUserInvite
      )
    } else {
      await db
        .updateTable('UserAccount')
        .set({
          role: invitation.role,
        })
        .returningAll()
        .executeTakeFirst()
    }

    return 'success'
  }

  public async deleteTeamMember(id: string) {
    await db
      .deleteFrom('UserAccount')
      .where('id', '=', id)
      .where('accountId', '=', currentUserInfo().accountId)
      .execute()
  }

  //this is public call
  public async verifyToken(email: string, token: string) {
    if (!token.length) return { status: 'invalid_token' }

    const userAccount = await db
      .selectFrom('UserAccount')
      .selectAll()
      .where('email', '=', email)
      .where('token', '=', token)
      .executeTakeFirst()

    if (!userAccount) return { status: 'failed' }

    if (userAccount.isVerified) {
      return { status: 'already_verified' }
    }

    //token is already validated
    const expired = !userAccount.tokenExpiryAt || dayjs().toDate() > userAccount.tokenExpiryAt

    if (expired) return { status: 'token_expired' }

    //is there a login capable userId already? then, update to that userId
    const loginUser = await db
      .selectFrom('UserAccount')
      .selectAll()
      .where('email', '=', email)
      .where('userId', '<>', '')
      .executeTakeFirst()

    const userId = loginUser ? loginUser.userId : ''

    await db
      .updateTable('UserAccount')
      .set({ userId, isVerified: true, token: null, tokenExpiryAt: null })
      .where('id', '=', userAccount?.id)
      .returningAll()
      .executeTakeFirst()
    return { status: 'success', hasDefaultUser: userId ? true : false }
  }
}
