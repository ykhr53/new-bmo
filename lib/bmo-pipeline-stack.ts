import {
    Arn,
    ArnFormat,
    ConcreteDependable,
    Construct,
    SecretValue,
    Stack,
    StackProps,
} from '@aws-cdk/core';
import {
    CodePipeline,
    ShellStep,
    CodePipelineSource,
} from '@aws-cdk/pipelines';
import { Pipeline } from '@aws-cdk/aws-codepipeline';
import { SlackChannelConfiguration } from '@aws-cdk/aws-chatbot';
import { NotificationRule } from '@aws-cdk/aws-codestarnotifications';
import { BMOPipelineStage } from './pipeline-stage';

/**
 * The stack that defines the application pipeline
 */
export class BMOPipelineStack extends Stack {
    constructor(scope: Construct, id: string, props?: StackProps) {
        super(scope, id, props);

        const pipelineName = 'BMOPipeline';

        // Retrive values from Secrets Manager
        const githubToken = SecretValue.secretsManager('SlackTokenForBMO', {
            jsonField: 'GITHUB_TOKEN',
        });
        const workspaceId = SecretValue.secretsManager('SlackTokenForBMO', {
            jsonField: 'SLACK_WS_ID',
        }).toString();
        const channelId = SecretValue.secretsManager('SlackTokenForBMO', {
            jsonField: 'SLACK_CHANNEL_ID',
        }).toString();

        // Pipeline definition
        const pipeline = new CodePipeline(this, 'BMOPipeline', {
            pipelineName: pipelineName,
            synth: new ShellStep('Synth', {
                input: CodePipelineSource.gitHub('ykhr53/new-bmo', 'mainline', {
                    authentication: githubToken,
                }),
                commands: [
                    'yarn install --frozen-lockfile',
                    'yarn build',
                    'npx cdk synth',
                ],
            }),
        });

        const account = props?.env?.account || process.env.CDK_DEFAULT_ACCOUNT;
        const region = props?.env?.region || process.env.CDK_DEFAULT_REGION;

        // Deplpy Dev Stage
        const devBMO = new BMOPipelineStage(this, 'Dev', {
            env: {
                account: account,
                region: region,
            },
        });
        pipeline.addStage(devBMO);

        // Test ShellStep
        // ToDo: Add some "real" test
        const curlTest = new ShellStep('curlTest', {
            envFromCfnOutputs: {
                ENDPOINT: devBMO.urlOutput,
            },
            commands: [
                'curl -sS -X POST -H "Content-Type: application/json" -d \'{"challenge":"somechallengemessage"}\' $ENDPOINT',
            ],
        });

        // Deplpy Prod Stage
        const prodBMO = new BMOPipelineStage(this, 'Prod', {
            env: {
                account: account,
                region: region,
            },
        });
        pipeline.addStage(prodBMO, {
            pre: [curlTest],
        });

        // Chatbot for Slack notification
        const slackChannel = new SlackChannelConfiguration(
            this,
            'NotificationSlackChannel',
            {
                slackChannelConfigurationName: 'BMOSlackNotifCh',
                slackWorkspaceId: workspaceId,
                slackChannelId: channelId,
            }
        );

        // Notification setting
        const rule = new NotificationRule(this, 'NotificationRule', {
            notificationRuleName: 'BMONotifRule',
            events: [
                'codepipeline-pipeline-stage-execution-failed',
                'codepipeline-pipeline-pipeline-execution-succeeded',
            ],
            source: Pipeline.fromPipelineArn(
                this,
                'importedPipeline',
                Arn.format(
                    {
                        resource: pipelineName,
                        service: 'codepipline',
                    },
                    this
                )
            ),
            targets: [slackChannel],
        });

        // Configure resource creation order
        const ruleDependencies = new ConcreteDependable();
        ruleDependencies.add(pipeline);
        ruleDependencies.add(slackChannel);
        rule.node.addDependency(ruleDependencies);
    }
}
