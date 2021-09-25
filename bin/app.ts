#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { BMOPipelineStack } from '../lib/bmo-pipeline-stack';

const app = new cdk.App();

const prodAccount = process.env.CDK_DEFAULT_ACCOUNT;
const prodRegion = process.env.CDK_DEFAULT_REGION;

new BMOPipelineStack(app, 'BMOPipelineStack', {
    env: { account: prodAccount, region: prodRegion },
});
