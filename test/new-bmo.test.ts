import { expect as expectCDK, matchTemplate, MatchStyle } from '@aws-cdk/assert';
import * as cdk from '@aws-cdk/core';
import * as NewBmo from '../lib/new-bmo-stack';

test('Empty Stack', () => {
    const app = new cdk.App();
    // WHEN
    const stack = new NewBmo.NewBmoStack(app, 'MyTestStack');
    // THEN
    expectCDK(stack).to(matchTemplate({
      "Resources": {}
    }, MatchStyle.EXACT))
});
