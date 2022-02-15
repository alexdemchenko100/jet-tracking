import * as sst from '@serverless-stack/resources'

export default class MyStack extends sst.Stack {
  constructor(scope: sst.App, id: string, props?: sst.StackProps) {
    super(scope, id, props)

    // Create Topic
    const topic = new sst.Topic(this, 'exec-monitor', {
      subscribers: ['src/monitor.sns'],
    })

    // Create the HTTP API
    const api = new sst.Api(this, 'Api', {
      defaultFunctionProps: {
        // Pass in the topic to our API
        environment: {
          topicArn: topic.snsTopic.topicArn,
        },
      },
      routes: {
        'POST /monitor/ondemand': 'src/api.main',
        'POST /monitor/exec': 'src/monitor.api',
      },
    })

    // Allow the API to publish the topic
    api.attachPermissions([topic])

    // Show the API endpoint in the output
    this.addOutputs({
      ApiEndpoint: api.url,
    })
  }
}
