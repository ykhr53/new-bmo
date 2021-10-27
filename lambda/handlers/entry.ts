import {
    LambdaRequest,
    LambdaResponse,
    SlackMessage,
    ReactionContext,
} from '../types';
import { HTTP_200, HTTP_400 } from '../modules/response_templates';
import { WebClient } from '@slack/web-api';
import { getSecrets } from '../modules/secrets_helper';
import { behaviors } from '../modules/behaviors';

exports.handler = async function (
    event: LambdaRequest,
    context: any
): Promise<LambdaResponse> {
    //console.log('EVENT: \n' + JSON.stringify(event, null, 2));

    // Return error response if request body is empty
    if (event.body === null) {
        return HTTP_400;
    }

    let lambdaEvent;
    try {
        lambdaEvent = JSON.parse(event.body);
    } catch (err) {
        // Request body is not JSON syntax
        console.error(err);
        return HTTP_400;
    }

    // Handle challenge request
    const challenge = lambdaEvent.challenge;
    if (challenge) {
        const body = {
            challenge: challenge,
        };
        const response: LambdaResponse = {
            statusCode: 200,
            body: JSON.stringify(body),
        };
        return response;
    }

    // Get secrets
    const secrets: { [key: string]: string } = await getSecrets();
    const SLACK_TOKEN = secrets.token;
    const APP_UNAME = secrets.uname;
    if (!SLACK_TOKEN || !APP_UNAME) return HTTP_200;

    // Handle message
    const slack = new WebClient(SLACK_TOKEN);
    const message: SlackMessage = getMessage(lambdaEvent);

    if (isBMO(message, APP_UNAME)) {
        // Return immediately if the message is posted by BMO
        return HTTP_200;
    }

    console.log(message.text);
    const reactionContext = {
        slackClient: slack,
    };
    await behaveReactions(message, reactionContext);
    return HTTP_200;
};

async function behaveReactions(
    incomingMessage: SlackMessage,
    reactionContext: ReactionContext
) {
    behaviors.forEach((behavior) => {
        if (incomingMessage.text.match(behavior.triggerPattern) != null) {
            console.log(`triggered reaction "${behavior.type}"`);
            behavior.reaction(incomingMessage, reactionContext);
        }
    });
}

function getMessage(lambdaEvent: { [key: string]: any }): SlackMessage {
    const defaultMessage: SlackMessage = {
        text: '',
        user: '',
        channel: '',
    };

    if (!lambdaEvent.event) {
        return defaultMessage;
    }

    const slackEvent = lambdaEvent.event;
    return {
        text: slackEvent.text || defaultMessage.text,
        user: slackEvent.user || defaultMessage.user,
        channel: slackEvent.channel || defaultMessage.channel,
    };
}

function isBMO(message: SlackMessage, appuname: string): boolean {
    return message.user == appuname;
}
