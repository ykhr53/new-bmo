import {
    LambdaRequest,
    LambdaResponse,
    SlackMessage,
    RegexTable,
    VoteDict,
} from '../types';
import { HTTP_200, HTTP_400 } from '../response_templates';
import { WebClient } from '@slack/web-api';
import * as ddb from '../ddb_helper';
import { getSecrets } from '../secrets_helper';

const BMO_REGEX: RegexTable = {
    vote: /^\S+(\+\+|--)\s/,
    word: /^\!word\s\S+/,
    words: /^\!words$/,
    add: /^\!add\s\S+/,
    search: /^\!search\s\S+/,
};

exports.handler = async function (
    event: LambdaRequest,
    context: any
): Promise<LambdaResponse> {
    //console.log('EVENT: \n' + JSON.stringify(event, null, 2));

    // Return error response if request body is empty
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

    // Get secrets
    const secrets: { [key: string]: string } = await getSecrets();
    const SLACK_TOKEN = secrets.token;
    const APP_UNAME = secrets.uname;
    if (!SLACK_TOKEN || !APP_UNAME) return HTTP_200;

    // Handle message
    const slack = new WebClient(SLACK_TOKEN);
    const message: SlackMessage = getMessage(lambdaEvent);

    if (isBMO(message, APP_UNAME)) {
        // Return immediately if the message is posted by BMO
        return HTTP_200;
    }

    console.log(message.text);
    await behaveReaction(message, slack);
    return HTTP_200;
};

async function behaveReaction(incomingMessage: SlackMessage, slack: WebClient) {
    const reactionType = findReactionType(incomingMessage);
    let reply = '';
    switch (reactionType) {
        case 'vote':
            const vd = parseVote(incomingMessage.text);
            const newVote: VoteDict = await ddb.vote(vd);
            for (let name in newVote) {
                let diffMessage = '';
                if (vd[name] > 1 || vd[name] < -1)
                    diffMessage = `(got ${vd[name]} votes)`;
                reply += `${name}: ${newVote[name]} voted! ${diffMessage}\n`;
            }
            break;
        case 'word':
            const wq = parseWord(incomingMessage.text);
            try {
                const word = await ddb.getWord(wq);
                if (word.description !== undefined) {
                    reply = `${wq}: ${word.description}`;
                } else {
                    reply = `まだ登録されてないみたい。「!add ${wq} comment」で登録してね！`;
                }
            } catch (err) {
                console.error(err);
                reply = 'エラーだよ';
            }
            break;
        case 'words':
            try {
                const words = await ddb.getAllWords();
                let allWordsMessage = '';
                for (let word of words) {
                    allWordsMessage += `${word.name}: ${word.description}\n`;
                }
                const fp = {
                    title: 'BMO word list',
                    filename: 'words',
                    filetype: 'post',
                    content: allWordsMessage,
                };
                const result = await slack.files.upload(fp);
                if (result.file && result.file.permalink) {
                    reply = result.file.permalink;
                } else {
                    reply = 'エラーだよ';
                }
            } catch (err) {
                console.error(err);
                reply = 'エラーだよ';
            }
            break;
        case 'add':
            const aq = parseAdd(incomingMessage.text);
            if (aq.length < 2) {
                reply = 'コマンドがおかしいみたい';
            } else {
                try {
                    await ddb.addWord(aq[0], aq[1]);
                    reply = '登録しました！';
                } catch (err) {
                    console.log(err);
                    reply = '登録に失敗しました';
                }
            }
            break;
        case 'search':
            const query = parseWord(incomingMessage.text);
            try {
                const resultWords = await ddb.search(query);
                if (resultWords.length > 0) {
                    reply += `「${query}」が含まれるものを見つけました！\n-----------------\n`;
                    for (let word of resultWords) {
                        reply += `${word.name}: ${word.description}\n`;
                    }
                } else {
                    reply += `「${query}」が含まれるものは見つかりませんでした:cry:\n`;
                }
            } catch (err) {
                console.error(err);
                reply = 'エラーだよ';
            }
            break;
    }

    // Post a reply message to slack if it is not empty
    if (reply) {
        try {
            await slack.chat.postMessage({
                channel: incomingMessage.channel,
                text: reply,
            });
        } catch (err) {
            console.log(err);
        }
    }
}

function getMessage(lambdaEvent: { [key: string]: any }): SlackMessage {
    const defaultMessage: SlackMessage = {
        text: '',
        user: '',
        channel: '',
    };

    if (!lambdaEvent.event) {
        return defaultMessage;
    }

    const slackEvent = lambdaEvent.event;
    return {
        text: slackEvent.text || defaultMessage.text,
        user: slackEvent.user || defaultMessage.user,
        channel: slackEvent.channel || defaultMessage.channel,
    };
}

function isBMO(message: SlackMessage, appuname: string): boolean {
    return message.user == appuname;
}

function findReactionType(message: SlackMessage): string {
    const text = message.text;
    for (let key in BMO_REGEX) {
        if (text.match(BMO_REGEX[key]) != null) {
            return key;
        }
    }
    return '';
}

function parseWord(text: string): string {
    const words = text.split(' ');
    if (words.length > 1) {
        return words[1];
    }
    return '';
}

function parseAdd(text: string): string[] {
    /**
     *  Return structure will be...
     *  1. If an input has '!add', 'key', and 'comment'
     *     -> ['key', 'comment']
     *  2. If an input is incorrect format
     *     -> []
     */
    const words = text.split(/\s/);
    const ret: string[] = [];

    if (words.length < 3) return ret;

    ret[0] = words[1];
    ret[1] = words.slice(2).join(' ');
    return ret;
}

function parseVote(text: string): VoteDict {
    let votes: VoteDict = {};
    const regex = /\S+(\+\+|--)\s/g;
    const names = text.match(regex);
    if (names != null) {
        for (let v of names.values()) {
            let isPositive = v.endsWith('+ ');
            let name = v.replace(/(\+\+|--)\s$/, '');
            if (votes[name]) {
                votes[name] = isPositive ? votes[name] + 1 : votes[name] - 1;
            } else {
                votes[name] = isPositive ? 1 : -1;
            }
        }
    }
    return votes;
}
