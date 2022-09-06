import * as pulumi from '@pulumi/pulumi'
import * as gcp from '@pulumi/gcp'
import * as docker from '@pulumi/docker'

//setup: run following commands and log into gcp
//glcoud auth application-default login
//gcloud auth configure-docker

// Location to deploy Cloud Run services
const mainRegionName = gcp.config.region || 'us-east1'
const project = 'httpmon-stage'

const config = new pulumi.Config()

// Build a Docker image and put it to Google Container Registry.
// Note: Run `gcloud auth configure-docker` in your command line to configure auth to GCR.
const mainImageName = pulumi.interpolate`gcr.io/${project}/httpmon-main:v0.0.1`
const mainImage = new docker.Image('httpmon-main-image', {
  imageName: mainImageName,
  build: {
    context: '../..',
    dockerfile: '../../Dockerfile',
    args: {
      VITE_PROJECT_ID: project,
    },
  },
})

const serviceAccount = new gcp.serviceaccount.Account(`${project}-sa`, {
  accountId: `${project}-sa`,
  project,
})

new gcp.projects.IAMBinding('cloud-run-cloud-sql', {
  project,
  members: [pulumi.interpolate`serviceAccount:${serviceAccount.email}`],
  role: 'roles/cloudsql.client',
})

const plainEnvs = [
  'SENDGRID_SENDER_EMAIL',
  'SENDGRID_NOTIFICATION_EMAIL_TEMPLATE',
  'SENDGRID_VERIFY_EMAIL_TEMPLATE',
  'WEB_APP_URL',
]
const secretEnvs = ['STRIPE_SECRET_KEY', 'SENDGRID_API_KEY']

const plainEnvArray = plainEnvs.map((name) => {
  return { name, value: config.require(name) }
})

const secretEnvArray = secretEnvs.map((name) => {
  return { name, value: config.requireSecret(name) }
})

const dbInstanceName = `${project}:${mainRegionName}:mondb-${project}-instance`

function createService(name: string, region: string) {
  const serviceResource = new gcp.cloudrun.Service(name, {
    project,
    name,
    location: region,
    template: {
      spec: {
        serviceAccountName: serviceAccount.email,
        containers: [
          {
            image: mainImage.imageName,
            ports: [
              {
                containerPort: 8080,
              },
            ],
            envs: [
              {
                name: 'DB_NAME',
                value: 'mondb',
              },
              {
                name: 'DB_HOST',
                value: `/cloudsql/${dbInstanceName}`,
              },
              {
                name: 'DB_PORT',
                value: '5432',
              },
              {
                name: 'DB_USER',
                value: 'postgres',
              },
              {
                name: 'DB_PASSWORD',
                value: 'rdjdiirejf',
              },
              ...plainEnvArray,
              ...secretEnvArray,
            ],
            resources: {
              limits: {
                memory: '512Mi',
              },
            },
          },
        ],
        containerConcurrency: 80,
      },
      metadata: {
        annotations: {
          'autoscaling.knative.dev/maxScale': '1000',
          'run.googleapis.com/cloudsql-instances': dbInstanceName,
          'run.googleapis.com/client-name': 'demo',
        },
      },
    },
    traffics: [
      {
        percent: 100,
        latestRevision: true,
      },
    ],
  })

  // Open the service to public unrestricted access
  new gcp.cloudrun.IamMember(`httpmon-everyone-${name}`, {
    project,
    service: serviceResource.name,
    location: region,
    role: 'roles/run.invoker',
    member: 'allUsers',
  })

  return serviceResource
}

const sandboxImage = new docker.Image('httpmon-sandbox-image', {
  imageName: pulumi.interpolate`gcr.io/${project}/httpmon-sandbox:v0.0.1`,
  build: {
    context: '../..',
    dockerfile: '../../Dockerfile.sandbox',
  },
})

const httpmonSandboxService = new gcp.cloudrun.Service('httpmon-sandbox-service', {
  location: mainRegionName,
  template: {
    spec: {
      containers: [
        {
          image: sandboxImage.imageName,
          ports: [
            {
              containerPort: 8080,
            },
          ],
          resources: {
            limits: {
              memory: '1Gi',
            },
          },
        },
      ],
      containerConcurrency: 80,
    },
  },
  traffics: [
    {
      percent: 100,
      latestRevision: true,
    },
  ],
})

// Open the service to public unrestricted access
new gcp.cloudrun.IamMember('httpmon-sandbox-everyone', {
  service: httpmonSandboxService.name,
  location: mainRegionName,
  role: 'roles/run.invoker',
  member: 'allUsers',
})

function createTopicAndTrigger(
  serviceRes: gcp.cloudrun.Service,
  regionName: string,
  topicName: string,
  servicePath: string
) {
  const topicRes = new gcp.pubsub.Topic(`${project}-${topicName}-topic`, {
    name: `${project}-${topicName}`, //this will be topic name
    project,
  })

  new gcp.eventarc.Trigger(`${topicName}-trigger`, {
    project,
    location: regionName,
    serviceAccount: serviceAccount.email,
    matchingCriterias: [
      {
        attribute: 'type',
        value: 'google.cloud.pubsub.topic.v1.messagePublished',
      },
    ],
    destination: {
      cloudRunService: {
        service: serviceRes.name,
        region: regionName,
        path: servicePath, //'/api/services/topic',
      },
    },
    transports: [
      {
        pubsubs: [
          {
            topic: topicRes.name,
          },
        ],
      },
    ],
  })
  return topicRes
}

const mainServiceTopics = [
  { name: 'scheduler', path: '/api/services/scheduler' },
  { name: 'monitor-prerequest', path: '/api/services/monitor-prerequest' },
  { name: `monitor-run-${mainRegionName}`, path: '/api/services/monitor-run' },
  { name: 'monitor-postrequest', path: '/api/services/monitor-postrequest' },
  { name: 'api-script-result', path: '/api/services/api-script-result' },
]

const httpmonMainService = createService(`httpmon-main-service`, mainRegionName)

const mainServiceTopicResources = mainServiceTopics.map(({ name, path }) => {
  return createTopicAndTrigger(httpmonMainService, mainRegionName, name, path)
})

//first one is scheduler
const schedulerTopic = mainServiceTopicResources[0]

new gcp.cloudscheduler.Job('scheduler-job', {
  project,
  schedule: '* * * * *',
  pubsubTarget: {
    topicName: schedulerTopic.id,
    data: btoa('Schedule now!'),
  },
  region: mainRegionName,
  timeZone: 'Europe/London',
})

const runLocations = ['europe-west3']
runLocations.map((locName) => {
  const service = createService(`httpmon-monitor-run-service-${locName}`, locName)
  createTopicAndTrigger(service, locName, `monitor-run-${locName}`, '/api/services/monitor-run')
})

//create Sandbox
createTopicAndTrigger(
  httpmonSandboxService,
  mainRegionName,
  'api-script-run',
  '/api/services/api-script-run'
)
