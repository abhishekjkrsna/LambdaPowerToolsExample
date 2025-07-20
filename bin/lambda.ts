#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { LambdaStack } from '../lib/lambda-stack';
import { AwsSolutionsChecks, ServerlessChecks, NagSuppressions } from 'cdk-nag';

const app = new cdk.App();
const lambdaStack = new LambdaStack(app, 'LambdaStack');

cdk.Aspects.of(app).add(new AwsSolutionsChecks());
cdk.Aspects.of(app).add(new ServerlessChecks());

NagSuppressions.addStackSuppressions(lambdaStack, [
    {
        id: 'AwsSolutions-IAM4',
        reason: 'IAM policy is managed by CDK'
    },
    {
        id: 'Serverless-LambdaDLQ',
        reason: 'DLQ is not required for this example Lambda function'
    },
    {
        id: 'AwsSolutions-IAM5',
        reason: 'Lambda function role is managed by CDK and does not require additional permissions'
    }
]);
app.synth();