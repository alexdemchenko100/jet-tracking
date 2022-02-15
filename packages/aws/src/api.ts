import { APIGatewayProxyEventV2 } from 'aws-lambda'
import AWS from 'aws-sdk'

const sns = new AWS.SNS()

export async function main(event: APIGatewayProxyEventV2) {
  // Publish a message to topic
  await sns
    .publish({
      // Get the topic from the environment variable
      TopicArn: process.env.topicArn,
      Message: event.body ?? '',
      MessageStructure: 'string',
    })
    .promise()

  console.log('Published message!', event.body ?? '')

  return {
    statusCode: 200,
    body: JSON.stringify({ status: 'successful' }),
  }
}
