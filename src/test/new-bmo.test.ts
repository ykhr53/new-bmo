import { Template } from 'aws-cdk-lib/assertions';
import * as cdk from 'aws-cdk-lib';
import * as NewBmo from '../lib/new-bmo-stack';

test('Empty Stack', () => {
    const app = new cdk.App();
    // WHEN
    const stack = new NewBmo.NewBmoStack(app, 'MyTestStack');
    // THEN
    Template.fromStack(stack).templateMatches({
        Resources: {},
    });
});
