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

        // const sourceArtifact = new codepipeline.Artifact();
        // const cloudAssemblyArtifact = new codepipeline.Artifact();
        // const cdkpipeline = new CdkPipeline(this, 'Pipeline', {
        //     pipelineName: 'BMOPipeline',
        //     cloudAssemblyArtifact,
        //     sourceAction: new codepipeline_actions.GitHubSourceAction({
        //         actionName: 'GitHub',
        //         output: sourceArtifact,
        //         oauthToken: githubToken,
        //         owner: 'ykhr53',
        //         repo: 'new-bmo',
        //         branch: 'mainline',
        //     }),

        //     // How it will be built and synthesized
        //     synthAction: SimpleSynthAction.standardYarnSynth({
        //         sourceArtifact,
        //         cloudAssemblyArtifact,

        //         // We need a build step to compile the TypeScript Lambda
        //         buildCommand: 'yarn build',
        //     }),
        // });
        const pipeline = new CodePipeline(this, 'BMOPipeline', {
            pipelineName: 'BMOPipeline',
            synth: new ShellStep('Synth', {
                input: CodePipelineSource.gitHub('ykhr53/new-bmo', 'mainline', {
                    authentication: githubToken,
                }),
                commands: ['yarn build', 'npx cdk synth'],
            }),
        });
    }
}
