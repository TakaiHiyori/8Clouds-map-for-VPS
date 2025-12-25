export default {
  transform: {
    '^.+\\.(js|jsx)$': 'babel-jest',
  },
  testEnvironment: 'jest-environment-jsdom',
  moduleFileExtensions: ['js', 'jsx'],
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@js/(.*)$': '<rootDir>/src/js/$1',
    '^@redux/(.*)$': '<rootDir>/src/js/redux/$1',
    '^@utils/(.*)$': '<rootDir>/src/js/utils/$1',
    '^@common/(.*)$': '<rootDir>/src/js/common/$1',
  },
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  transformIgnorePatterns: [
    'node_modules/(?!(.*\\.mjs$|@testing-library|@tanstack|framer-motion|react-beautiful-dnd))',
  ],
  reporters: [
    'default',
    [
      'jest-html-reporter',
      {
        pageTitle: 'テストレポート',
        outputPath: 'test-report.html',
        includeFailureMsg: true,
        includeConsoleLog: true,
      },
    ],
  ],
};
