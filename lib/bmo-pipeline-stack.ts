import * as codepipeline from '@aws-cdk/aws-codepipeline';
import * as codepipeline_actions from '@aws-cdk/aws-codepipeline-actions';
import { Construct, SecretValue, Stack, StackProps } from '@aws-cdk/core';
import {
    CdkPipeline,
    SimpleSynthAction,
    CodePipeline,
    ShellStep,
    CodePipelineSource,
} from '@aws-cdk/pipelines';
import { CDKPipelineStage } from './pipeline-stage';

/**
 * The stack that defines the application pipeline
 */
export class BMOPipelineStack extends Stack {
    constructor(scope: Construct, id: string, props?: StackProps) {
        super(scope, id, props);

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
    }
}
