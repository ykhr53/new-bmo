import * as codepipeline from '@aws-cdk/aws-codepipeline';
import * as codepipeline_actions from '@aws-cdk/aws-codepipeline-actions';
import { Construct, SecretValue, Stack, StackProps } from '@aws-cdk/core';
import { CdkPipeline, SimpleSynthAction } from '@aws-cdk/pipelines';

/**
 * The stack that defines the application pipeline
 */
export class BMOPipelineStack extends Stack {
    constructor(scope: Construct, id: string, props?: StackProps) {
        super(scope, id, props);

        const sourceArtifact = new codepipeline.Artifact();
        const cloudAssemblyArtifact = new codepipeline.Artifact();

        const githubToken = SecretValue.secretsManager('SlackTokenForBMO', {
            jsonField: 'GITHUB_TOKEN',
        });
        const pipeline = new CdkPipeline(this, 'Pipeline', {
            pipelineName: 'BMOPipeline',
            cloudAssemblyArtifact,
            sourceAction: new codepipeline_actions.GitHubSourceAction({
                actionName: 'GitHub',
                output: sourceArtifact,
                oauthToken: githubToken,
                owner: 'ykhr53',
                repo: 'new-bmo',
            }),

            // How it will be built and synthesized
            synthAction: SimpleSynthAction.standardYarnSynth({
                sourceArtifact,
                cloudAssemblyArtifact,

                // We need a build step to compile the TypeScript Lambda
                buildCommand: 'yarn build',
            }),
        });

        // This is where we add the application stages
        // ...
    }
}
