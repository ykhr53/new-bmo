import { CfnOutput, Construct, Stage, StageProps } from '@aws-cdk/core';
import { NewBmoStack } from './new-bmo-stack';

/**
 * Deployable unit of the app
 */
export class BMOPipelineStage extends Stage {
    public readonly urlOutput: CfnOutput;

    constructor(scope: Construct, id: string, props?: StageProps) {
        super(scope, id, props);

        const service = new NewBmoStack(this, 'NewBmoStack', {
            env: {
                account: process.env.CDK_DEFAULT_ACCOUNT,
                region: process.env.CDK_DEFAULT_REGION,
            },
        });

        // Expose NewBmoStack's output one level higher
        this.urlOutput = service.urlOutput;
    }
}
