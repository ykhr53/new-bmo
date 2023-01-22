#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { BMOPipelineStack } from '../lib/bmo-pipeline-stack';
import { BMO_CONFIG } from '../lib/configuration';

const app = new cdk.App();

const pipeAccount = process.env.CDK_DEFAULT_ACCOUNT;
const pipeRegion = BMO_CONFIG.Prod.REGION;

new BMOPipelineStack(app, 'BMOPipelineStack', {
    env: { account: pipeAccount, region: pipeRegion },
});
