import { resolve } from 'node:path'

import { config } from 'dotenv'

/**
 * Loads the local Supabase credentials for the `db` Jest project.
 *
 * `@next/env` deliberately excludes `.env.local` whenever `NODE_ENV` is `test`,
 * so `next/jest` never supplies these values to a test run — see
 * `node_modules/next/dist/docs/01-app/02-guides/environment-variables.md:250`.
 * These specs talk to the real local stack, so they need the real values.
 *
 * `dotenv` does not override variables already present in `process.env`, which
 * keeps an explicitly-set environment (CI) authoritative over the file.
 */
config({ path: resolve(__dirname, '..', '..', '.env.local'), quiet: true })
