import * as pulumi from '@pulumi/pulumi'
import * as gcp from '@pulumi/gcp'

// Location to deploy Cloud Run services
const location = gcp.config.region || 'us-east1'
const region = location
const project = 'httpmon-stage'

const EnabledServices = ['run', 'cloudscheduler', 'eventarc', 'iam', 'sqladmin', 'compute']

const allServices = EnabledServices.map(
  (api) =>
    new gcp.projects.Service(`${api}-enabled`, {
      project,
      service: `${api}.googleapis.com`,
      disableDependentServices: true,
    })
)

const dbServer = new gcp.sql.DatabaseInstance(
  `mondb-${project}-instance`,
  {
    project,
    name: `mondb-${project}-instance`,
    region,
    databaseVersion: 'POSTGRES_14',
    settings: {
      tier: 'db-f1-micro',
      diskSize: 25,
      ipConfiguration: {
        ipv4Enabled: true,
      },
    },
    deletionProtection: true,
  },
  {
    dependsOn: allServices,
  }
)

const database = new gcp.sql.Database('mondb', {
  project,
  name: 'mondb',
  instance: dbServer.name,
})

const user = new gcp.sql.User('users', {
  instance: dbServer.name,
  name: 'postgres',
  password: 'rdjdiirejf',
})

export const dbUser = user.name
export const dbPass = user.password
