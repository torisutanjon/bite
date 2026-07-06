import type { Config } from 'jest'
import nextJest from 'next/jest.js'

const createJestConfig = nextJest({ dir: './' })

const config: Config = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  // Playwright specs live in /tests — keep them out of the jest run.
  testPathIgnorePatterns: ['<rootDir>/node_modules/', '<rootDir>/tests/'],
  coverageProvider: 'v8',
  coverageThreshold: {
    global: {
      statements: 90,
      branches: 85,
      functions: 95,
      lines: 90,
    },
  },
  moduleNameMapper: {
    '^next/image$': '<rootDir>/__mocks__/next/image.tsx',
  },
}

export default createJestConfig(config)
