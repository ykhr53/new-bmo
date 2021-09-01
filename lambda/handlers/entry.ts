import {
    LambdaRequest,
    LambdaResponse,
    SlackMessage,
    RegexTable,
} from '../types';
import { HTTP_200, HTTP_400 } from '../response_templates';
import { WebClient } from '@slack/web-api';
import { MockIntegration } from '@aws-cdk/aws-apigateway';

const BMO_REGEX: RegexTable = {
    vote: /^\S+(\+\+|--)\s/,
    word: /\!word\s\S+/,
    words: /^\!words$/,
    add: /^\!add\s\S+/,
};

exports.handler = async function (
    event: LambdaRequest,
    context: any
): Promise<LambdaResponse> {
    console.log('EVENT: \n' + JSON.stringify(event, null, 2));

    // return error response if request body is empty
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

    // Handle message
    const web = new WebClient(process.env.SLACK_TOKEN);
    const message: SlackMessage = getMessage(lambdaEvent);

    if (isBMO(message)) {
        // Return immediately if the message is posted by BMO
        return HTTP_200;
    } else {
        const commentType = searchRegex(message);
        let reply = '';
        switch (commentType) {
            case 'vote':
                reply = '++/-- はまだ未実装だよ。ごめんね。';
                break;
            case 'word':
                reply = 'word 参照はまだ未実装だよ。ごめんね。';
                break;
            case 'words':
                reply = 'word 一覧はまだ未実装だよ。ごめんね。';
                break;
            case 'add':
                reply = 'word 登録はまだ未実装だよ。ごめんね。';
                break;
            default:
                console.log('default');
                break;
        }
        try {
            await web.chat.postMessage({
                channel: message.channel,
                text: reply,
            });
        } catch (err) {
            console.log(err);
        }
    }

    return HTTP_200;
};

// Need to add slack event interface
function getMessage(lambdaEvent: any): SlackMessage {
    const slackEvent = lambdaEvent.event;
    let text: string = '',
        user: string = '',
        channel: string = '';

    if (slackEvent) {
        if (slackEvent.text) text = slackEvent.text;
        if (slackEvent.user) user = slackEvent.user;
        if (slackEvent.channel) channel = slackEvent.channel;
    }

    const message: SlackMessage = {
        text: text,
        user: user,
        channel: channel,
    };

    return message;
}

function isBMO(message: SlackMessage): boolean {
    return message.user == process.env.APP_UNAME;
}

function searchRegex(message: SlackMessage): string {
    const text = message.text;
    for (let key in BMO_REGEX) {
        if (text.match(BMO_REGEX[key]) != null) {
            return key;
        }
    }
    return '';
}
