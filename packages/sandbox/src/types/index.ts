import { MonitorAuth } from '@httpmon/db'

export type SandBox = {
  ctx: {
    request: {
      method: string
      url: string
      auth: MonitorAuth | undefined
      headers: Record<string, string>
      queryParams: Record<string, string>
      body: string | undefined
    }
    env: Record<string, string>
  }
}
