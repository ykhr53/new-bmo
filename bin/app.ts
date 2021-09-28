#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { BMOPipelineStack } from '../lib/bmo-pipeline-stack';
import { BMO_STAGES } from '../lib/configuration';

const app = new cdk.App();

const prodAccount = BMO_STAGES.Prod.ACCOUNT;
const prodRegion = BMO_STAGES.Prod.REGION;

new BMOPipelineStack(app, 'BMOPipelineStack', {
    env: { account: prodAccount, region: prodRegion },
});
