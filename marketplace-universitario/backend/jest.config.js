/** @type {import('jest').Config} */
const config = {
  testEnvironment: 'node',
  testMatch: ['**/tests/**/*.test.js'],
  collectCoverageFrom: [
    'src/controllers/auth.controller.js',
    'src/controllers/orders.controller.js',
    'src/controllers/products.controller.js',
    'src/routes/auth.routes.js',
    'src/routes/orders.routes.js',
    'src/routes/products.routes.js',
    'src/middlewares/validators/auth.validators.js',
    'src/middlewares/validators/orders.validators.js',
    'src/middlewares/validators/products.validators.js',
  ],
  coverageThreshold: {
    global: {
      branches: 60,
      functions: 69,
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
