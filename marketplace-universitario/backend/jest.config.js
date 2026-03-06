/** @type {import('jest').Config} */
const config = {
  testEnvironment: 'node',
  testMatch: ['**/tests/**/*.test.js'],
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/server.js',
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
  coverageReporters: ['text', 'lcov', 'clover'],
  setupFilesAfterEnv: [],
  testTimeout: 30000,
  verbose: true,
};

module.exports = config;
