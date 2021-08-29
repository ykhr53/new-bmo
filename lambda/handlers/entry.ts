exports.handler = async function (event: any, context: any) {
    console.log('EVENT: \n' + JSON.stringify(event, null, 2));
    let lambdaEvent;
    if (event.body) {
        try {
            lambdaEvent = JSON.parse(event.body);
        } catch (err) {
            // Request body is not JSON syntax
            console.error(err);
            const response = {
                statusCode: 400,
                body: 'Bad Request',
            };
            return response;
        }
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
