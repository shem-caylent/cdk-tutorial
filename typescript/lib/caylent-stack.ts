import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as sources from "aws-cdk-lib/aws-lambda-event-sources";
import * as kms from "aws-cdk-lib/aws-kms";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as notifications from "aws-cdk-lib/aws-s3-notifications";
import * as sns from "aws-cdk-lib/aws-sns";
import * as subscriptions from 'aws-cdk-lib/aws-sns-subscriptions';
import * as sqs from "aws-cdk-lib/aws-sqs";
import * as path from 'path';

const aspectRatios = [
  "16x16", "32x32", "64x64", "128x128", "64x128" // And a tall skinny one for fun
];

export class CaylentStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const encryptionKey = new kms.Key(this, "EncryptionKey");

    const bucket = new s3.Bucket(this, "SourceBucket", {
      encryptionKey,
    });
    const topic = new sns.Topic(this, "EventTopic", {
      masterKey: encryptionKey,
    });

    bucket.addEventNotification(s3.EventType.OBJECT_CREATED_PUT, new notifications.SnsDestination(topic));

    const queuesAndLambdas = aspectRatios.map((ratio) => {
      const queue = new sqs.Queue(this, `${ratio}Queue`, {
        encryptionMasterKey: encryptionKey,
      });
      topic.addSubscription(new subscriptions.SqsSubscription(queue));

      const [width, height] = ratio.split('x')
      const func = new lambda.Function(this, `${ratio}Handler`, {
        code: lambda.Code.fromAsset(path.join(__dirname, 'index.js')),
        runtime: lambda.Runtime.NODEJS_18_X,
        handler: 'index.handler',
        environment: {
          HEIGHT: height,
          WIDTH: width,
        }
      })
      func.addEventSource(new sources.SqsEventSource(queue))
      return {
        queue,
        func,
      }
    })
  }
}
