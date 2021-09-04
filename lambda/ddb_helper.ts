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
        AttributesToGet: ['word'],
    };
    try {
        const data = await documentClient.get(params).promise();
        if (data.Item) return data.Item['word'];
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

export async function getVote(vd: VoteDict) {
    const documentClient = new AWS.DynamoDB.DocumentClient();
    const retvd: VoteDict = {};
    for (let name in vd) {
        const params = {
            TableName: BMO_TABLE,
            Key: {
                name: name,
            },
            AttributesToGet: ['vote'],
        };
        try {
            const data = await documentClient.get(params).promise();
            if (!data.Item || !data.Item['vote']) {
                retvd[name] = 0;
            } else {
                retvd[name] = data.Item['vote'];
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
                vote: vsum,
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
                allWords += `${item['name']}: ${item['word']}\n`;
            }
        }
    } catch (err) {
        console.log(err);
    }
    return allWords;
}
