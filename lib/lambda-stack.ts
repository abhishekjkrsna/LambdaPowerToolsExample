import { CfnOutput, Duration, RemovalPolicy, Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { Function, Runtime, Code, Tracing, LayerVersion, LambdaInsightsVersion, FunctionUrl, FunctionUrlAuthType, InvokeMode } from 'aws-cdk-lib/aws-lambda';
import { LogGroup, LogGroupClass, RetentionDays } from 'aws-cdk-lib/aws-logs';
import { Role, ServicePrincipal, ManagedPolicy } from 'aws-cdk-lib/aws-iam';
import path from 'path';

export class LambdaStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const functionName = "ExampleLambdaFunction";
    const functionDir = '../src';

    const logGroup = new LogGroup(this, "ExampleLambdaLogGroup", {
      logGroupName: `/aws/lambda/${functionName}`,
      retention: RetentionDays.ONE_WEEK,
      removalPolicy: RemovalPolicy.DESTROY,
      logGroupClass: LogGroupClass.STANDARD
    })

    const functionRole = new Role(this, "ExampleLambdaRole", {
      assumedBy: new ServicePrincipal("lambda.amazonaws.com"),
      roleName: `${functionName}Role`,
      description: "Role for the example Lambda function",
      managedPolicies: [
        ManagedPolicy.fromAwsManagedPolicyName("service-role/AWSLambdaBasicExecutionRole"),
        ManagedPolicy.fromAwsManagedPolicyName("AWSXRayDaemonWriteAccess"),
        ManagedPolicy.fromAwsManagedPolicyName("CloudWatchLambdaInsightsExecutionRolePolicy")
      ]
    })

    const lambdaPowertoolsLayer = LayerVersion.fromLayerVersionArn(this, "ExampleLambdaPowertoolsLayer", `arn:aws:lambda:${Stack.of(this).region}:017000801446:layer:AWSLambdaPowertoolsPythonV3-python313-x86_64:20`);

    const lambdaFunction = new Function(this, "ExampleLambdaFunction", {
      functionName: functionName,
      description: "An example Lambda function",
      runtime: Runtime.PYTHON_3_13,
      code: Code.fromAsset(
        path.join(__dirname, functionDir)
      ),
      handler: "lambda_function.lambda_handler",
      timeout: Duration.seconds(30),
      memorySize: 128,
      logGroup: logGroup,
      tracing: Tracing.ACTIVE,
      role: functionRole,
      layers: [lambdaPowertoolsLayer],
      insightsVersion: LambdaInsightsVersion.VERSION_1_0_333_0,
      environment: {
        POWERTOOLS_SERVICE_NAME: functionName,
        POWERTOOLS_TRACE_DISABLED: "false",
        POWERTOOLS_LOG_LEVEL: "INFO",
        POWERTOOLS_METRICS_NAMESPACE: "ExampleInvocations",
      }
    });

    const functionUrl = new FunctionUrl(this, "ExampleLambdaFunctionUrl", {
      function: lambdaFunction,
      authType: FunctionUrlAuthType.NONE,
      invokeMode: InvokeMode.BUFFERED,
    });

    new CfnOutput(this, "ExampleLambdaFunctionUrlOutput", {
      value: functionUrl.url,
      description: "The URL of the example Lambda function",
      exportName: "ExampleLambdaFunctionUrl"
    })
  }
}
