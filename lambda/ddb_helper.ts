import { VoteDict } from './types';
import * as AWS from 'aws-sdk';

const BMO_TABLE = process.env.BMO_TABLE || '';

export async function getWord(key: string) {
    const documentClient = new AWS.DynamoDB.DocumentClient();
    const params = {
        TableName: BMO_TABLE,
        Key: {
            name: key,
        },
        AttributesToGet: ['description'],
    };
    try {
        const data = await documentClient.get(params).promise();
        if (data.Item) return data.Item['description'];
    } catch (err) {
        console.log(err);
        return 'エラーだよ';
    }
}

export async function addWord(key: string, comment: string) {
    const documentClient = new AWS.DynamoDB.DocumentClient();
    const params = {
        TableName: BMO_TABLE,
        Item: {
            name: key,
            description: comment,
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

export async function getVote(vd: VoteDict) {
    const documentClient = new AWS.DynamoDB.DocumentClient();
    const retvd: VoteDict = {};
    for (let name in vd) {
        const params = {
            TableName: BMO_TABLE,
            Key: {
                name: name,
            },
            AttributesToGet: ['votes'],
        };
        try {
            const data = await documentClient.get(params).promise();
            if (!data.Item || !data.Item['votes']) {
                retvd[name] = 0;
            } else {
                retvd[name] = data.Item['votes'];
            }
        } catch (err) {
            console.log(err);
        }
    }
    return retvd;
}

export async function vote(vd: VoteDict) {
    const documentClient = new AWS.DynamoDB.DocumentClient();
    const currentVote: VoteDict = await getVote(vd);
    let reply: string = '';
    for (let name in vd) {
        const vsum = currentVote[name] + vd[name];
        const params = {
            TableName: BMO_TABLE,
            Item: {
                name: name,
                votes: vsum,
            },
        };
        try {
            await documentClient.put(params).promise();
            let total: string = '';
            if (vd[name] > 1 || vd[name] < -1)
                total = `(got ${vd[name]} votes)`;
            reply += `${name}: ${vsum} voted! ${total}\n`;
        } catch (err) {
            console.log(err);
        }
    }
    return reply;
}

export async function getAllWords() {
    const documentClient = new AWS.DynamoDB.DocumentClient();
    let allWords: string = '';
    const params = {
        TableName: BMO_TABLE,
    };
    try {
        const data = await documentClient.scan(params).promise();
        console.log(data.Items);
        if (data.Items) {
            for (let item of data.Items) {
                allWords += `${item['name']}: ${item['description']}\n`;
            }
        }
    } catch (err) {
        console.log(err);
    }
    return allWords;
}

export async function search(query: string) {
    const documentClient = new AWS.DynamoDB.DocumentClient();
    let queryResult: string = '';
    var params = {
        TableName: BMO_TABLE,
        ProjectionExpression: '#n, #d',
        FilterExpression: 'contains (#d, :query) or contains (#n, :query)',
        ExpressionAttributeNames: {
            '#n': 'name',
            '#d': 'description',
        },
        ExpressionAttributeValues: {
            ':query': query,
        },
    };
    try {
        const data = await documentClient.scan(params).promise();
        console.log(data.Items);
        if (data.Items) {
            queryResult += `「${query}」が含まれるものを見つけました！\n-----------------\n`;
            for (let item of data.Items) {
                if (item['name'] && item['description'])
                    queryResult += `${item['name']}: ${item['description']}\n`;
            }
        }
    } catch (err) {
        console.log(err);
        return 'エラーだよ';
    }
    return queryResult;
}
