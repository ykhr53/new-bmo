# Prerequisites

## Environment Variables

Before you build/deploy the CDK package, you need to specify a target accoun id and region.

```
export CDK_DEPLOY_ACCOUNT=<AWS ACCOUNT ID>
export CDK_DEPLOY_REGION=<REGOIN>
```

## Secret Manager

You need to store your App's slack token and user name in a Secrets Manager secret named 'SlackTokenForBMO'.secret key named 'SLACK_TOKEN'.

```
SLACK_TOKEN: <App's slack token> (something begins with xoxb- or xoxp-)
APP_UNAME: <App's user name> (something like U01234ABCDE)
```

# Welcome to your CDK TypeScript project!

This is a blank project for TypeScript development with CDK.

The `cdk.json` file tells the CDK Toolkit how to execute your app.

## Useful commands

-   `npm run build` compile typescript to js
-   `npm run watch` watch for changes and compile
-   `npm run test` perform the jest unit tests
-   `cdk deploy` deploy this stack to your default AWS account/region
-   `cdk diff` compare deployed stack with current state
-   `cdk synth` emits the synthesized CloudFormation template
