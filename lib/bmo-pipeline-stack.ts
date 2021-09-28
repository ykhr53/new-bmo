import { Construct, SecretValue, Stack, StackProps } from '@aws-cdk/core';
import {
    CodePipeline,
    ShellStep,
    CodePipelineSource,
} from '@aws-cdk/pipelines';
import { BMOPipelineStage } from './pipeline-stage';
import { BMO_STAGES } from './configuration';

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

        // Deplpy Dev Stage
        const devBMO = new BMOPipelineStage(this, 'Dev', {
            env: {
                account: BMO_STAGES.Dev.ACCOUNT,
                region: BMO_STAGES.Dev.REGION,
            },
        });
        pipeline.addStage(devBMO);

        // Test ShellStep
        const curlTest = new ShellStep('curlTest', {
            envFromCfnOutputs: {
                ENDPOINT: devBMO.urlOutput,
            },
            commands: ['curl $ENDPOINT'],
        });

        // Deplpy Prod Stage
        const prodBMO = new BMOPipelineStage(this, 'Prod', {
            env: {
                account: BMO_STAGES.Prod.ACCOUNT,
                region: BMO_STAGES.Prod.REGION,
            },
        });
        pipeline.addStage(prodBMO);
    }
}
