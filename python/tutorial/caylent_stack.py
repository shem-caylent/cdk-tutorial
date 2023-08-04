from aws_cdk import (
    # Duration,
    Stack,
    aws_lambda as lambda_,
    aws_lambda_event_sources as sources,
    aws_kms as kms,
    aws_s3 as s3,
    aws_sns as sns,
    aws_sqs as sqs,

    aws_s3_notifications as notifications,
    aws_sns_subscriptions as subscriptions
)
from constructs import Construct
import path

aspectRatios = [
    "16x16", "32x32", "64x64", "128x128", "64x128"
]

class CaylentStack(Stack):
    def __init__(self, scope: Construct, construct_id: str, **kwargs) -> None:
        super().__init__(scope, construct_id, **kwargs)

        key = kms.Key(self, "EncryptionKey")

        bucket = s3.Bucket(self, "SouceBucket", encryption_key=key)
        topic = sns.Topic(self, "EventTopic", master_key=key)

        bucket.add_event_notifications(s3.EventType.OBJECT_CREATED_PUT, notifications.SnsDestination(topic))

        queues_and_lambdas = []
        for ratio in aspectRatios:
            queue = sqs.Queue(self, f'{ratio}Queue', encryption_master_key=key)
            topic.add_subscription(subscriptions.SqsSubscription(queue))

            [width, height] = ratio.split('x')
            func = lambda_.Function(self,
                                    f'{ratio}Handler',
                                    code=lambda_.Code.from_asset(path.join(__dirname, 'index.py')),
                                    handler='handler',
                                    runtime=lambda_.Runtime.PYTHON_3_9,
                                    environment={
                                        'HEIGHT': height,
                                        'WIDTH': width
                                    })
            func.add_event_source(sources.SqsEventSource(queue))
            queues_and_lambdas.append({
                'queue': queue,
                'func': func
            })