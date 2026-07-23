module.exports = {
  moduleNameMapper: {
    '^@src/(.*)$': '<rootDir>/$1',
  },
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: 'src',
  testRegex: '.*\\.spec\\.ts$',
  testPathIgnorePatterns: ['\\.e2e-spec\\.ts$'],
  transform: {
    '^.+\\.(t|j)s$': [
      '@swc/jest',
      {
        configFile: './.swcrc.test.json',
      },
    ],
  },
  collectCoverageFrom: ['**/*.(t|j)s'],
  coverageDirectory: '../coverage',
  testEnvironment: 'node',
  setupFiles: ['<rootDir>/common/config/jest-setup-env.ts'],
};
