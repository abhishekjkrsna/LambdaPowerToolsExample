"""
Lambda function code to display cloudwatch insights and metrics using AWS Lambda Powertools.
This code is designed to be used with AWS CDK and includes necessary imports and configurations.
"""

import json
from time import time
from aws_lambda_powertools import Logger, Tracer, Metrics
from aws_lambda_powertools.metrics import MetricUnit
from aws_lambda_powertools.utilities.data_classes import (
    event_source,
    LambdaFunctionUrlEvent
)
from aws_lambda_powertools.utilities.typing import LambdaContext

logger = Logger()
tracer = Tracer()
metrics = Metrics()
        

@tracer.capture_lambda_handler
@logger.inject_lambda_context
@metrics.log_metrics(capture_cold_start_metric=True)
@event_source(data_class=LambdaFunctionUrlEvent)
def lambda_handler(event: dict, context: LambdaContext) -> dict:
    "Lambda function handler to log and return event details."
    logger.info("Received event", extra={"event": event})
    metrics.add_metric(name="SuccessfulInvocations", unit=MetricUnit.Count, value=1)
    metrics.add_metadata(key="EventTime", value=time())
    return {
        "statusCode": 200,
        "body": json.dumps({"message": "Hello from Lambda!"}),
    }
