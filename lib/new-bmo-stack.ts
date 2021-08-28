import * as cdk from '@aws-cdk/core';
import * as nodejs from '@aws-cdk/aws-lambda-nodejs';
import * as lambda from '@aws-cdk/aws-lambda';
import * as apigateway from '@aws-cdk/aws-apigateway';

export class NewBmoStack extends cdk.Stack {
    constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        const entryLambdaFunction = new nodejs.NodejsFunction(
            this,
            'BMO-entry-Lambda',
            {
                functionName: `BMO-entry-Lambda`,
                entry: 'lambda/handlers/entry.ts',
                memorySize: 128,
                timeout: cdk.Duration.seconds(10),
                runtime: lambda.Runtime.NODEJS_14_X,
            }
        );

        const entryAPIG = new apigateway.RestApi(this, 'BMO-APIG', {
            cloudWatchRole: false,
        });
        entryAPIG.root.addMethod(
            'POST',
            new apigateway.LambdaIntegration(entryLambdaFunction)
        );
    }
}
