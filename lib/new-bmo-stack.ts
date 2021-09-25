import * as cdk from '@aws-cdk/core';
import * as nodejs from '@aws-cdk/aws-lambda-nodejs';
import * as lambda from '@aws-cdk/aws-lambda';
import * as apigateway from '@aws-cdk/aws-apigateway';
import * as secretsmanager from '@aws-cdk/aws-secretsmanager';
import * as ddb from '@aws-cdk/aws-dynamodb';
import * as iam from '@aws-cdk/aws-iam';

export interface BMOStackProps extends cdk.StackProps {
    readonly stage: string;
}

export class NewBmoStack extends cdk.Stack {
    // The URL of the API Gateway endpoint, for use in the integ tests
    public readonly urlOutput: cdk.CfnOutput;

    constructor(scope: cdk.Construct, id: string, props: BMOStackProps) {
        super(scope, id, props);
        const stage = props.stage;

        // Secrets Manager
        const secret = secretsmanager.Secret.fromSecretNameV2(
            this,
            'SlackToken',
            'SlackTokenForBMO'
        );

        // DynamoDB
        const bmoMemory = new ddb.Table(this, 'bmoMemory', {
            partitionKey: {
                name: 'name',
                type: ddb.AttributeType.STRING,
            },
            tableName: `BMO-DDB-${stage}`,
        });

        // Lambda
        const entryLambdaFunction = new nodejs.NodejsFunction(
            this,
            `BMO-Lambda-${stage}`,
            {
                functionName: `BMO-Lambda-${stage}`,
                entry: 'lambda/handlers/entry.ts',
                memorySize: 128,
                timeout: cdk.Duration.seconds(10),
                runtime: lambda.Runtime.NODEJS_14_X,
                environment: {
                    BMO_TABLE: bmoMemory.tableName,
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
            resources: [bmoMemory.tableArn],
        });
        entryLambdaFunction.addToRolePolicy(ddbPolicy);
        secret.grantRead(entryLambdaFunction);

        // API Gateway
        const entryAPIG = new apigateway.RestApi(this, `BMO-APIG-${stage}`, {
            cloudWatchRole: false,
        });
        entryAPIG.root.addMethod(
            'POST',
            new apigateway.LambdaIntegration(entryLambdaFunction)
        );
        this.urlOutput = new cdk.CfnOutput(this, 'Url', {
            value: entryAPIG.url,
        });
    }
}
