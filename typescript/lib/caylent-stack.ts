import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as kms from "aws-cdk-lib/aws-kms";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as notifications from "aws-cdk-lib/aws-s3-notifications";
import * as sns from "aws-cdk-lib/aws-sns";
import * as subscriptions from 'aws-cdk-lib/aws-sns-subscriptions';
import * as sqs from "aws-cdk-lib/aws-sqs";

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
    const queue1 = new sqs.Queue(this, "QueueOne", {
      encryptionMasterKey: encryptionKey,
    });
    const queue2 = new sqs.Queue(this, "QueueTwo", {
      encryptionMasterKey: encryptionKey,
    });

    bucket.addEventNotification(s3.EventType.OBJECT_CREATED_PUT, new notifications.SnsDestination(topic));
    topic.addSubscription(new subscriptions.SqsSubscription(queue1))
    topic.addSubscription(new subscriptions.SqsSubscription(queue2))
  }
}
