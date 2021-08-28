exports.handler = async function (event: any, context: any) {
    console.log('EVENT: \n' + JSON.stringify(event, null, 2));
    const response = {
        statusCode: 200,
        headers: {},
        body: JSON.stringify({ message: 'Hello World!' }),
    };
    return response;
};
