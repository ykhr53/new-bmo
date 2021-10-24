import {
    parseWord,
    generateWordReply,
    parseAdd,
    generateSearchReply,
} from './word';

describe('word: parsWord', () => {
    it('can get a word after "!word"', () => {
        const result = parseWord('!word awesomeWord');
        expect(result).toBe('awesomeWord');
    });

    it('can get a word after "!search"', () => {
        const result = parseWord('!search awesome');
        expect(result).toBe('awesome');
    });
});

describe('word: generateWordReply', () => {
    it('can generate word description', () => {
        const result = generateWordReply({
            key: 'awesomeWord',
            description: 'awsomeWord description',
        });
        expect(result).toBe('awesomeWord: awsomeWord description');
    });
    it('can generate suggestion message', () => {
        const result = generateWordReply({
            key: 'awesomeWord',
            description: undefined,
        });
        expect(result).toBe(
            'まだ登録されてないみたい。「!add awesomeWord comment」で登録してね！'
        );
    });
});

describe('word: parseAdd', () => {
    it('can get a word after "!add"', () => {
        const result = parseAdd('!add awesomeWord awesomeWord description');
        expect(result).toEqual(['awesomeWord', 'awesomeWord description']);
    });
});

describe('word: generateSearchReply', () => {
    it('can generate list of search results', () => {
        const result = generateSearchReply('awesome', [
            {
                name: 'awesomeWord',
                description: 'awsomeWord description',
            },
            {
                name: 'funnyWord',
                description: 'mean of funnyWord',
            },
        ]);
        expect(result).toBe(
            '「awesome」が含まれるものを見つけました！\n-----------------\nawesomeWord: awsomeWord description\nfunnyWord: mean of funnyWord\n'
        );
    });

    it('can generate no entry message', () => {
        const result = generateSearchReply('awesome', []);
        expect(result).toBe(
            '「awesome」が含まれるものは見つかりませんでした:cry:\n'
        );
    });
});
