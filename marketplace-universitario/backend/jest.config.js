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
      branches: 90,
      functions: 90,
      lines: 90,
      statements: 90,
    },
  },
  coverageReporters: ['text', 'lcov', 'clover'],
  setupFilesAfterEnv: [],
  testTimeout: 30000,
  verbose: true,
  // Run suites sequentially — prevents FK race conditions on shared test DB
  runInBand: true,
};

module.exports = config;
