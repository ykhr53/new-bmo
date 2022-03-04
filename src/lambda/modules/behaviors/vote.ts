import type { Behavior, Reaction, VoteDict } from '../../types';
import { vote } from '../ddb_helper';

/*
 * ++/-- command
 */

// Export for test
export function parseVote(text: string): VoteDict {
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

// Export for test
export const generateVoteReply = (
    diffVote: VoteDict,
    afterVote: VoteDict
): string => {
    let reply = '';
    for (let name in afterVote) {
        const diff = diffVote[name];
        let diffMessage = '';
        if (diff > 1 || diff < -1) diffMessage = `(got ${diff} votes)`;
        reply += `${name}: ${afterVote[name]} voted! ${diffMessage}\n`;
    }
    return reply;
};

const voteReaction: Reaction = async (incomingMessage, context) => {
    // Return immediately if slack client was not passed
    if (!context.slackClient) return;

    const vd = parseVote(incomingMessage.text);
    const newVote: VoteDict = await vote(vd);
    let reply = generateVoteReply(vd, newVote);

    // Post a reply message to slack if it is not empty
    if (reply) {
        await context.slackClient.chat.postMessage({
            channel: incomingMessage.channel,
            text: reply,
        });
    }
    return;
};

export const voteBehavior: Behavior = {
    type: 'vote',
    triggerPattern: /^\S+(\+\+|--)\s/,
    reaction: voteReaction,
};
