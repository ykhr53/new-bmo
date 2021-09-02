import * as AWS from 'aws-sdk';

export function getItem() {
    const documentClient = new AWS.DynamoDB.DocumentClient();
    const params = {
        TableName: 'Table',
        Key: {
            HashKey: 'hashkey',
        },
    };
    documentClient.get(params, function (err, data) {
        if (err) console.log(err);
        else console.log(data);
    });
}

export function putItem() {
    const documentClient = new AWS.DynamoDB.DocumentClient();
}
export function scan() {
    const documentClient = new AWS.DynamoDB.DocumentClient();
}
