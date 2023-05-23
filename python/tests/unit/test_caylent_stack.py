import aws_cdk as core
import aws_cdk.assertions as assertions

from tutorial.caylent_stack import CaylentStack

# example tests. To run these tests, uncomment this file along with the example
# resource in tutorial/caylent_stack.py
def test_sqs_queue_created():
    app = core.App()
    stack = CaylentStack(app, "TestStack")
    template = assertions.Template.from_stack(stack)

#     template.has_resource_properties("AWS::SQS::Queue", {
#         "VisibilityTimeout": 300
#     })
