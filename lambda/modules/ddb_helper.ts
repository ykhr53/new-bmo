import { VoteDict } from '../types';
import * as AWS from 'aws-sdk';

const BMO_TABLE = process.env.BMO_TABLE || '';

export async function getWord(key: string): Promise<{
    key: string;
    description: string | undefined;
}> {
    const documentClient = new AWS.DynamoDB.DocumentClient();
    const params = {
        TableName: BMO_TABLE,
        Key: {
            name: key,
        },
        AttributesToGet: ['description'],
    };
    const data = await documentClient.get(params).promise();
    if (data.Item && data.Item['description']) {
        return {
            key,
            description: data.Item['description'],
        };
    } else {
        return {
            key,
            description: undefined,
        };
    }
}

export async function addWord(key: string, comment: string) {
    const documentClient = new AWS.DynamoDB.DocumentClient();
    const params = {
        TableName: BMO_TABLE,
        Key: {
            name: key,
        },
        UpdateExpression: 'set #d = :c',
        ExpressionAttributeNames: { '#d': 'description' },
        ExpressionAttributeValues: { ':c': comment },
    };
    await documentClient.update(params).promise();
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
    const newVote: VoteDict = {};
    for (let name in vd) {
        const vsum = currentVote[name] + vd[name];
        const params = {
            TableName: BMO_TABLE,
            Key: {
                name: name,
            },
            UpdateExpression: 'set #v = :s',
            ExpressionAttributeNames: { '#v': 'votes' },
            ExpressionAttributeValues: { ':s': vsum },
        };
        try {
            await documentClient.update(params).promise();
            newVote[name] = vsum;
        } catch (err) {
            console.log(err);
        }
    }
    return newVote;
}

export async function getAllWords() {
    const documentClient = new AWS.DynamoDB.DocumentClient();
    const params = {
        TableName: BMO_TABLE,
    };
    const data = await documentClient.scan(params).promise();
    if (data.Items) {
        return formatWords(data.Items);
    } else {
        return [];
    }
}

export async function search(query: string) {
    const documentClient = new AWS.DynamoDB.DocumentClient();
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
    const data = await documentClient.scan(params).promise();
    if (data.Count && data.Count > 0 && data.Items) {
        return formatWords(data.Items);
    } else {
        return [];
    }
}

// Format result to array of { name: string; description: string }
function formatWords(wordItems: AWS.DynamoDB.DocumentClient.ItemList) {
    return wordItems
        .filter((item) => item['name'] && item['description'])
        .map(
            (item) =>
                ({
                    name: item['name'].toString(),
                    description: item['description'].toString(),
                } as { name: string; description: string })
        );
}
