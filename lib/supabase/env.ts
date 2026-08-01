/**
 * Validates a single environment value.
 *
 * Takes the value as an argument rather than reading process.env[name]:
 * Next only inlines NEXT_PUBLIC_* vars into the browser bundle when they are
 * referenced statically, so a dynamic lookup would be undefined client-side.
 */
export function requireValue(name: string, value: string | undefined): string {
  if (value === undefined || value.trim() === '') {
    throw new Error(
      `Missing Supabase environment variable: ${name}. ` +
        `Copy .env.example to .env.local and fill it in — ` +
        `run \`yarn supabase status -o env\` for local values.`
    )
  }

  return value
}
