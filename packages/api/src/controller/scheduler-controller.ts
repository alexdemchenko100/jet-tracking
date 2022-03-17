import { execMonitor } from './../services/monitor-exec.js'
import { db, saveMonitorResult } from '@httpmon/db'
import { processAssertions } from '../services/assertions.js'
import { FastifyInstance } from 'fastify'
import { sql } from 'kysely'

export default async function SchedulerController(app: FastifyInstance) {
  app.post('/', async function (req, reply) {
    console.log('body: ', JSON.stringify(req.body))
    console.log('headers: ', JSON.stringify(req.headers))

    const schedulTime = new Date(Date.now())

    // // let's get to the closest 10 second using floor.
    // // This helps when doing modulo math to figure out if a monitor is a hit to schedule
    const seconds = schedulTime.getMinutes() * 60
    const envRegion = process.env.PA_REGION || 'us-east'

    const region = `{"${envRegion}"}`

    const eu = 'europe-west'
    const anyc = 'any(locations")'
    const monitors = await db
      .selectFrom('Monitor')
      .selectAll()
      .where('status', '=', 'active')
      .where('locations', '@>', sql`${region}`)
      .where(sql`${seconds} % frequency`, '=', 0)
      // .where(sql`${eu}`, '=', sql`${anyc}`)
      // .compile().sql
      .execute()

    console.log('monitors', monitors)

    for (let i = 0; i < monitors.length; i++) {
      const mon = monitors[i]
      const result = await execMonitor(mon)

      if (result.err == '') {
        const asserionResults = processAssertions(mon, result)
        result.assertResults = asserionResults
      }

      //createdAt caused type issue for db
      await saveMonitorResult({ ...result })
    }

    reply.code(200).send()
  })
}
