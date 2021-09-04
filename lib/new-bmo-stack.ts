import * as cdk from '@aws-cdk/core';
import * as nodejs from '@aws-cdk/aws-lambda-nodejs';
import * as lambda from '@aws-cdk/aws-lambda';
import * as apigateway from '@aws-cdk/aws-apigateway';
import * as secretsmanager from '@aws-cdk/aws-secretsmanager';
import * as ddb from '@aws-cdk/aws-dynamodb';
import * as iam from '@aws-cdk/aws-iam';

export class NewBmoStack extends cdk.Stack {
    constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        // Secrets Manager
        const secret = secretsmanager.Secret.fromSecretNameV2(
            this,
            'SlackToken',
            'SlackTokenForBMO'
        );
        // Probably we should consider to pass Secret ARN instead of token itself
        const token = secret.secretValueFromJson('SLACK_TOKEN').toString();
        const uname = secret.secretValueFromJson('APP_UNAME').toString();

        // DynamoDB
        const bmoTable = new ddb.Table(this, 'wordTable', {
            partitionKey: {
                name: 'name',
                type: ddb.AttributeType.STRING,
            },
            tableName: 'bmo-brain',
        });

        // Lambda
        const entryLambdaFunction = new nodejs.NodejsFunction(
            this,
            'BMO-entry-Lambda',
            {
                functionName: `BMO-entry-Lambda`,
                entry: 'lambda/handlers/entry.ts',
                memorySize: 128,
                timeout: cdk.Duration.seconds(10),
                runtime: lambda.Runtime.NODEJS_14_X,
                environment: {
                    SLACK_TOKEN: token,
                    APP_UNAME: uname,
                    BMO_TABLE: bmoTable.tableName,
                },
            }
        );
        const ddbPolicy = new iam.PolicyStatement({
            effect: iam.Effect.ALLOW,
            actions: [
                'dynamodb:PutItem',
                'dynamodb:DescribeTable',
                'dynamodb:Get*',
                'dynamodb:Query',
                'dynamodb:Scan',
                'dynamodb:Update*',
            ],
            resources: [bmoTable.tableArn],
        });
        entryLambdaFunction.addToRolePolicy(ddbPolicy);

        // API Gateway
        const entryAPIG = new apigateway.RestApi(this, 'BMO-APIG', {
            cloudWatchRole: false,
        });
        entryAPIG.root.addMethod(
            'POST',
            new apigateway.LambdaIntegration(entryLambdaFunction)
        );
    }
}
