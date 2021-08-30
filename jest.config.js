module.exports = {
  roots: ['<rootDir>/src'],
  "collectCoverageFrom": [
    "src/**/*.{js,jsx,ts,tsx}",
    "!<rootDir>/node_modules/",
    "!<rootDir>/**/__mocks__/**"
  ],
  "coverageThreshold": {
    "gobal": {
      "lines": 1
    }
  },
  "coverageReports": [
    "json-summary",
    "text",
    "lcov"
  ],
  "modulePaths": [
    "<rootDir>/src/"
  ]
}
