module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  collectCoverageFrom: [
    "**/*.ts"
  ],
  coveragePathIgnorePatterns: ["/node_modules/", "/build/"]
};
