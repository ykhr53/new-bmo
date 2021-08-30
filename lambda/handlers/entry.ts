import { LambdaRequest, LambdaResponse, SlackMessage } from '../types';

exports.handler = async function (
    event: LambdaRequest,
    context: any
): Promise<LambdaResponse> {
    console.log('EVENT: \n' + JSON.stringify(event, null, 2));

    // return error response if request body is empty
    if (event.body == null) {
        const response: LambdaResponse = {
            statusCode: 400,
            body: 'Bad Request',
        };
        return response;
    }

    let lambdaEvent;
    try {
        lambdaEvent = JSON.parse(event.body);
    } catch (err) {
        // Request body is not JSON syntax
        console.error(err);
        const response: LambdaResponse = {
            statusCode: 400,
            body: 'Bad Request',
        };
        return response;
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

    const response: LambdaResponse = {
        statusCode: 200,
        headers: {},
        body: JSON.stringify({ message: 'Hello World!' }),
    };
    return response;
};

// Need to add slack event interface
function getMessage(lambdaEvent: any): SlackMessage {
    const slackEvent = lambdaEvent.event;
    let text,
        user,
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
