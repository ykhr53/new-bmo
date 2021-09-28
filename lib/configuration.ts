import { Aws } from '@aws-cdk/core';

export const BMO_STAGES = {
    Prod: {
        ACCOUNT: Aws.ACCOUNT_ID,
        REGION: 'ap-northeast-1',
    },
    Dev: {
        ACCOUNT: Aws.ACCOUNT_ID,
        REGION: 'us-west-2',
    },
};
