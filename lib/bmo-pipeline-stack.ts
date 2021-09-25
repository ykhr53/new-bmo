import { Construct, SecretValue, Stack, StackProps } from '@aws-cdk/core';
import {
    CodePipeline,
    ShellStep,
    CodePipelineSource,
} from '@aws-cdk/pipelines';
import { BMOPipelineStage } from './pipeline-stage';

/**
 * The stack that defines the application pipeline
 */
export class BMOPipelineStack extends Stack {
    constructor(scope: Construct, id: string, props?: StackProps) {
        super(scope, id, props);

        // Pipeline
        const githubToken = SecretValue.secretsManager('SlackTokenForBMO', {
            jsonField: 'GITHUB_TOKEN',
        });
        const pipeline = new CodePipeline(this, 'BMOPipeline', {
            pipelineName: 'BMOPipeline',
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

        // Deplpy Prod Stage
        const account = props?.env?.account || process.env.CDK_DEFAULT_ACCOUNT;
        const region = props?.env?.region || process.env.CDK_DEFAULT_REGION;
        pipeline.addStage(
            new BMOPipelineStage(this, 'Prod', {
                env: {
                    account: account,
                    region: region,
                },
            })
        );
    }
}
