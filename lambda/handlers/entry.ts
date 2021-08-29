exports.handler = async function (event: any, context: any) {
    console.log('EVENT: \n' + JSON.stringify(event, null, 2));
    let lambdaEvent;
    if (event.body) {
        lambdaEvent = JSON.parse(event.body);
    }

    // Handle challenge request
    const challenge = lambdaEvent.challenge;
    if (challenge) {
        const body = {
            challenge: challenge,
        };
        const response = {
            statusCode: 200,
            body: JSON.stringify(body),
        };
        return response;
    }

    const response = {
        statusCode: 200,
        headers: {},
        body: JSON.stringify({ message: 'Hello World!' }),
    };
    return response;
};
