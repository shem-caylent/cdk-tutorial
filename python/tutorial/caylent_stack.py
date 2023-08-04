from aws_cdk import (
    # Duration,
    Stack,
    aws_kms as kms,
    aws_s3 as s3,
    aws_sns as sns,
    aws_sqs as sqs,

    aws_s3_notifications as notifications,
    aws_sns_subscriptions as subscriptions
)
from constructs import Construct


class CaylentStack(Stack):
    def __init__(self, scope: Construct, construct_id: str, **kwargs) -> None:
        super().__init__(scope, construct_id, **kwargs)

        key = kms.Key(self, "EncryptionKey")

        bucket = s3.Bucket(self, "SouceBucket", encryption_key=key)
        topic = sns.Topic(self, "EventTopic", master_key=key)
        queue1 = sqs.Queue(self, "QueueOne", encryption_master_key=key)
        queue2 = sqs.Queue(self, "QueueTwo", encryption_master_key=key)

        bucket.add_event_notifications(s3.EventType.OBJECT_CREATED_PUT, notifications.SnsDestination(topic))
        topic.add_subscription(subscriptions.SqsSubscription(queue1))
        topic.add_subscription(subscriptions.SqsSubscription(queue2))