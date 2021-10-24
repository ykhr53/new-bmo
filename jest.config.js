module.exports = {
    testEnvironment: 'node',
    roots: ['.'],
    testMatch: ['**/*.test.ts'],
    transform: {
        '^.+\\.tsx?$': 'ts-jest',
    },
};
