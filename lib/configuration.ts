import { Aws } from '@aws-cdk/core';

export const BMO_STAGES = {
    Prod: {
        ACCOUNT: Aws.ACCOUNT_ID,
        REGION: 'us-west-2',
    },
    Dev: {
        ACCOUNT: Aws.ACCOUNT_ID,
        REGION: 'us-east-1',
    },
};
