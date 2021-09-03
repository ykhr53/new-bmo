import * as AWS from 'aws-sdk';

export async function getWord(key: string, attr: string, table: string) {
    const documentClient = new AWS.DynamoDB.DocumentClient();
    const params = {
        TableName: table,
        Key: {
            name: key,
        },
        AttributesToGet: [attr],
    };
    try {
        const data = await documentClient.get(params).promise();
        if (data.Item) return data.Item['word'];
    } catch (err) {
        console.log(err);
        return 'エラーだよ';
    }
}

export async function addWord(key: string, comment: string, table: string) {
    const documentClient = new AWS.DynamoDB.DocumentClient();
    const params = {
        TableName: table,
        Item: {
            name: key,
            word: comment,
        },
    };
    try {
        await documentClient.put(params).promise();
        return '登録しました！';
    } catch (err) {
        console.log(err);
        return '登録に失敗しました';
    }
}
