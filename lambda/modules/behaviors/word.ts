import type { Behavior, Reaction } from '../../types';
import { getWord, getAllWords, addWord, search } from '../ddb_helper';
import { WebClient } from '@slack/web-api';

/*
 * word command
 */
const parseWord = (text: string): string => {
    const words = text.split(' ');
    if (words.length > 1) {
        return words[1];
    }
    return '';
};

const generateWordReply = (word: {
    key: string;
    description: string | undefined;
}): string => {
    return word.description !== undefined
        ? `${word.key}: ${word.description}`
        : `まだ登録されてないみたい。「!add ${word.key} comment」で登録してね！`;
};

const wordReaction: Reaction = async (incomingMessage, context) => {
    // Return immediately if slack client was not passed
    if (!context.slackClient) return;

    const wq = parseWord(incomingMessage.text);
    let reply: string;
    try {
        const word = await getWord(wq);
        reply = generateWordReply(word);
    } catch (err) {
        console.error(err);
        reply = 'エラーだよ';
    }

    // Post a reply message to slack if it is not empty
    if (reply) {
        await context.slackClient.chat.postMessage({
            channel: incomingMessage.channel,
            text: reply,
        });
    }
    return;
};

export const wordBehavior: Behavior = {
    type: 'word',
    triggerPattern: /^\!word\s\S+/,
    reaction: wordReaction,
};

/*
 * words command
 */
const uploadWordsFile = async (
    words: {
        name: string;
        description: string;
    }[],
    slackClient: WebClient
) => {
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
    return await slackClient.files.upload(fp);
};

const wordsReaction: Reaction = async (incomingMessage, context) => {
    // Return immediately if slack client was not passed
    if (!context.slackClient) return;

    let reply: string;
    try {
        const words = await getAllWords();
        const result = await uploadWordsFile(words, context.slackClient);
        if (result.file && result.file.permalink) {
            reply = result.file.permalink;
        } else {
            reply = 'エラーだよ';
        }
    } catch (err) {
        console.error(err);
        reply = 'エラーだよ';
    }

    // Post a reply message to slack if it is not empty
    if (reply) {
        await context.slackClient.chat.postMessage({
            channel: incomingMessage.channel,
            text: reply,
        });
    }
    return;
};

export const wordsBehavior: Behavior = {
    type: 'words',
    triggerPattern: /^\!words$/,
    reaction: wordsReaction,
};

/*
 * add command
 */
const parseAdd = (text: string): string[] => {
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
};

const addReaction: Reaction = async (incomingMessage, context) => {
    // Return immediately if slack client was not passed
    if (!context.slackClient) return;

    const aq = parseAdd(incomingMessage.text);

    let reply: string;
    if (aq.length < 2) {
        reply = 'コマンドがおかしいみたい';
    } else {
        try {
            await addWord(aq[0], aq[1]);
            reply = '登録しました！';
        } catch (err) {
            console.log(err);
            reply = '登録に失敗しました';
        }
    }

    // Post a reply message to slack if it is not empty
    if (reply) {
        await context.slackClient.chat.postMessage({
            channel: incomingMessage.channel,
            text: reply,
        });
    }
    return;
};

export const addBehavior: Behavior = {
    type: 'add',
    triggerPattern: /^\!add\s\S+/,
    reaction: addReaction,
};

/*
 * search command
 */
const generateSearchReply = (
    query: string,
    words: {
        name: string;
        description: string;
    }[]
): string => {
    let reply = '';
    if (words.length > 0) {
        reply += `「${query}」が含まれるものを見つけました！\n-----------------\n`;
        for (let word of words) {
            reply += `${word.name}: ${word.description}\n`;
        }
    } else {
        reply += `「${query}」が含まれるものは見つかりませんでした:cry:\n`;
    }
    return reply;
};

const searchReaction: Reaction = async (incomingMessage, context) => {
    // Return immediately if slack client was not passed
    if (!context.slackClient) return;

    const query = parseWord(incomingMessage.text);
    let reply: string;
    try {
        const resultWords = await search(query);
        reply = generateSearchReply(query, resultWords);
    } catch (err) {
        console.error(err);
        reply = 'エラーだよ';
    }

    // Post a reply message to slack if it is not empty
    if (reply) {
        await context.slackClient.chat.postMessage({
            channel: incomingMessage.channel,
            text: reply,
        });
    }
    return;
};

export const searchBehavior: Behavior = {
    type: 'search',
    triggerPattern: /^\!search\s\S+/,
    reaction: searchReaction,
};
