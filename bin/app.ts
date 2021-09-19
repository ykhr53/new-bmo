#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { NewBmoStack } from '../lib/new-bmo-stack';

const app = new cdk.App();
new NewBmoStack(app, 'NewBmoStack', {
    env: {
        account: process.env.CDK_DEFAULT_ACCOUNT,
        region: process.env.CDK_DEFAULT_REGION,
    },
});
