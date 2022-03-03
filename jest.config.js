module.exports = {
    testEnvironment: 'node',
    roots: ['./src'],
    testMatch: ['**/*.test.ts'],
    transform: {
        '^.+\\.tsx?$': 'ts-jest',
    },
};
