const API_URL = process.env.NEXT_PUBLIC_SUPABASE_URL

describe("local Supabase stack", () => {
  it("exposes the three env vars the clients need", () => {
    expect(process.env.NEXT_PUBLIC_SUPABASE_URL).toBeDefined()
    expect(process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY).toBeDefined()
    expect(process.env.SUPABASE_SECRET_KEY).toBeDefined()
  })

  it("answers on the REST endpoint", async () => {
    const response = await fetch(`${API_URL}/rest/v1/`, {
      headers: { apikey: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY as string },
    })
    expect(response.status).toBe(200)
  })
})
