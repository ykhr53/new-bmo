import { parseVote, generateVoteReply } from './vote';

describe('vote: parseVote', () => {
    it('can parse increment', () => {
        const incomingText = 'tom++ thanks';
        const result = parseVote(incomingText);
        expect(result).toEqual({
            tom: 1,
        });
    });

    it('can parse decrement', () => {
        const incomingText = 'tom-- not good';
        const result = parseVote(incomingText);
        expect(result).toEqual({
            tom: -1,
        });
    });

    it('can parse 0 vote', () => {
        const incomingText = 'bob++ bob-- good and bad';
        const result = parseVote(incomingText);
        expect(result).toEqual({
            bob: 0,
        });
    });

    it('can parse multi persons', () => {
        const incomingText = 'alice++ cathy-- alice win';
        const result = parseVote(incomingText);
        expect(result).toEqual({
            alice: 1,
            cathy: -1,
        });
    });

    it('can parse no comment text', () => {
        const incomingText = 'tom++';
        const result = parseVote(incomingText);
        expect(result).toEqual({});
    });

    it('can parse no comment 0 vote', () => {
        const incomingText = 'tom++ tom--';
        const result = parseVote(incomingText);
        expect(result).toEqual({
            tom: 1,
        });
    });

    it('can parse joined vote', () => {
        const incomingText = 'tom++tom-- good and bad';
        const result = parseVote(incomingText);
        expect(result).toEqual({
            'tom++tom': -1,
        });
    });
});

describe('vote: generateVoteReply', () => {
    it('can generate increment', () => {
        const diffVote = {
            tom: 1,
        };
        const afterVote = {
            tom: 3,
        };
        const result = generateVoteReply(diffVote, afterVote);
        expect(result).toBe('tom: 3 voted! \n');
    });

    it('can generate increment 2', () => {
        const diffVote = {
            tom: 2,
        };
        const afterVote = {
            tom: 3,
        };
        const result = generateVoteReply(diffVote, afterVote);
        expect(result).toBe('tom: 3 voted! (got 2 votes)\n');
    });

    it('can generate decrement', () => {
        const diffVote = {
            bob: 2,
        };
        const afterVote = {
            bob: -1,
        };
        const result = generateVoteReply(diffVote, afterVote);
        expect(result).toBe('bob: -1 voted! (got 2 votes)\n');
    });

    it('can generate multi persons', () => {
        const diffVote = {
            bob: 2,
            tom: 1,
        };
        const afterVote = {
            bob: -1,
            tom: 3,
        };
        const result = generateVoteReply(diffVote, afterVote);
        expect(result).toBe('bob: -1 voted! (got 2 votes)\ntom: 3 voted! \n');
    });
});
