import * as pulumi from '@pulumi/pulumi'
import * as gcp from '@pulumi/gcp'
import * as docker from '@pulumi/docker'

//setup: run following commands and log into gcp
//glcoud auth application-default login
//gcloud auth configure-docker

// Location to deploy Cloud Run services
const location = gcp.config.region || 'us-east1'
const project = 'httpmon-stage'

// const EnabledServices = ['run', 'cloudscheduler', 'eventarc', 'iam']

// const allServices = EnabledServices.map(
//   (api) =>
//     new gcp.projects.Service(`${api}-enabled`, {
//       service: `${api}.googleapis.com`,
//       disableDependentServices: true,
//     })
// )

// Build a Docker image from our sample Ruby app and put it to Google Container Registry.
// Note: Run `gcloud auth configure-docker` in your command line to configure auth to GCR.
const mainImageName = pulumi.interpolate`gcr.io/${project}/httpmon-main:v0.0.1`
// const mainImage = new docker.Image('httpmon-main-image', {
//   imageName: mainImageName,
//   build: {
//     context: '..',
//     dockerfile: '../Dockerfile',
//   },
// })

const serviceAccount = new gcp.serviceaccount.Account(`${project}-sa`, {
  accountId: `${project}-sa`,
  project,
})

new gcp.projects.IAMBinding('cloud-run-cloud-sql', {
  project,
  members: [pulumi.interpolate`serviceAccount:${serviceAccount.email}`],
  role: 'roles/cloudsql.client',
})

const dbInstanceName = 'httpmon-stage:us-east1:mondb-instance'

const httpmonMainService = new gcp.cloudrun.Service(
  'httpmon-main-service',
  {
    project,
    name: 'httpmon-main-service',
    location,
    template: {
      spec: {
        serviceAccountName: serviceAccount.email,
        containers: [
          {
            image: mainImageName, //mainImage.imageName,
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
                value: '/cloudsql/httpmon-stage:us-east1:mondb-instance',
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
  }
  //   { dependsOn: allServices }
)

// Open the service to public unrestricted access
new gcp.cloudrun.IamMember('httpmon-main-everyone', {
  project,
  service: httpmonMainService.name,
  location,
  role: 'roles/run.invoker',
  member: 'allUsers',
})

// const sandboxImage = new docker.Image('httpmon-sandbox-image', {
//   imageName: pulumi.interpolate`gcr.io/${project}/httpmon-sandbox:v0.0.1`,
//   build: {
//     context: '..',
//     dockerfile: '../Dockerfile.sandbox',
//   },
// })
//
// const httpmonSandboxService = new gcp.cloudrun.Service(
//   'httpmon-sandbox-service',
//   {
//     location,
//     template: {
//       spec: {
//         containers: [
//           {
//             image: sandboxImage.imageName,
//             ports: [
//               {
//                 containerPort: 8080,
//               },
//             ],
//             resources: {
//               limits: {
//                 memory: '1Gi',
//               },
//             },
//           },
//         ],
//         containerConcurrency: 80,
//       },
//     },
//     traffics: [
//       {
//         percent: 100,
//         latestRevision: true,
//       },
//     ],
//   },
//   { dependsOn: allServices }
// )
//
// // Open the service to public unrestricted access
// new gcp.cloudrun.IamMember('httpmon-sandbox-everyone', {
//   service: httpmonSandboxService.name,
//   location,
//   role: 'roles/run.invoker',
//   member: 'allUsers',
// })

//Scheduler

const schedulerTopic = new gcp.pubsub.Topic(`${project}-scheduler`, {
  name: `${project}-scheduler`, //this will be topic name
  project,
})

new gcp.cloudscheduler.Job(
  'scheduler-job',
  {
    project,
    schedule: '* * * * *',
    pubsubTarget: {
      topicName: schedulerTopic.id,
      data: btoa('Schedule now!'),
    },
    region: location,
    timeZone: 'Europe/London',
  }
  //   { dependsOn: allServices }
)

const schedulerTrigger = new gcp.eventarc.Trigger(
  'scheduler-trigger',
  {
    project,
    location,
    serviceAccount: serviceAccount.email,
    matchingCriterias: [
      {
        attribute: 'type',
        value: 'google.cloud.pubsub.topic.v1.messagePublished',
      },
    ],
    destination: {
      cloudRunService: {
        service: httpmonMainService.name,
        region: location,
        path: '/api/services/scheduler',
      },
    },
    transports: [
      {
        pubsubs: [
          {
            topic: schedulerTopic.name,
          },
        ],
      },
    ],
  }
  //   { dependsOn: allServices }
)
