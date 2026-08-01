import type { Config } from 'jest'
import nextJest from 'next/jest.js'

const createJestConfig = nextJest({ dir: './' })

// Unit specs: jsdom, React Testing Library, everything outside /tests and /supabase.
const unitConfig: Config = {
  displayName: 'unit',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  // Playwright specs live in /tests; live-DB specs live in /supabase.
  testPathIgnorePatterns: [
    '<rootDir>/node_modules/',
    '<rootDir>/tests/',
    '<rootDir>/supabase/',
  ],
  moduleNameMapper: {
    '^next/image$': '<rootDir>/__mocks__/next/image.tsx',
  },
}

// Live-database specs: node environment, no jsdom setup, no RTL.
const dbConfig: Config = {
  displayName: 'db',
  testEnvironment: 'node',
  testMatch: ['<rootDir>/supabase/__tests__/**/*.test.ts'],
  // next/jest cannot supply these: @next/env skips .env.local when NODE_ENV=test.
  setupFiles: ['<rootDir>/supabase/__tests__/load-env.ts'],
}

const config = async (): Promise<Config> => ({
  // Coverage is global-only in Jest; it must not live inside a project.
  coverageProvider: 'v8',
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '<rootDir>/lib/types/supabase.ts',
    '<rootDir>/supabase/',
  ],
  coverageThreshold: {
    global: {
      statements: 90,
      branches: 85,
      functions: 95,
      lines: 90,
    },
  },
  projects: [await createJestConfig(unitConfig)(), await createJestConfig(dbConfig)()],
})

export default config
