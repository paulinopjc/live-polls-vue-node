import { OAuth2Client } from 'google-auth-library'

let client: OAuth2Client | null = null

function getClient(): OAuth2Client {
  const clientId = process.env.GOOGLE_CLIENT_ID
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET
  const backendUrl = process.env.BACKEND_URL
  if (!clientId) throw new Error('GOOGLE_CLIENT_ID must be set')
  if (!client) {
    const redirectUri = backendUrl ? `${backendUrl}/api/auth/google/callback` : undefined
    client = new OAuth2Client(clientId, clientSecret || undefined, redirectUri)
  }
  return client
}

export interface GooglePayload {
  email: string
  name: string
  sub: string
}

function extractPayload(payload: Record<string, unknown> | undefined): GooglePayload {
  if (!payload || !payload.email || !payload.email_verified || !payload.sub) {
    throw new Error('Invalid token payload')
  }
  return {
    email: (payload.email as string).toLowerCase(),
    name: (payload.name as string) ?? (payload.email as string),
    sub: payload.sub as string,
  }
}

export const googleVerifier = {
  async verify(idToken: string): Promise<GooglePayload> {
    const clientId = process.env.GOOGLE_CLIENT_ID
    const ticket = await getClient().verifyIdToken({
      idToken,
      audience: clientId,
    })
    return extractPayload(ticket.getPayload() as Record<string, unknown> | undefined)
  },

  getAuthUrl(state: string): string {
    return getClient().generateAuthUrl({
      access_type: 'offline',
      scope: ['openid', 'email', 'profile'],
      state,
      prompt: 'select_account',
    })
  },

  async exchangeCode(code: string): Promise<GooglePayload> {
    const { tokens } = await getClient().getToken(code)
    const idToken = tokens.id_token
    if (!idToken) throw new Error('No id_token in token response')

    const clientId = process.env.GOOGLE_CLIENT_ID
    const ticket = await getClient().verifyIdToken({
      idToken,
      audience: clientId,
    })
    return extractPayload(ticket.getPayload() as Record<string, unknown> | undefined)
  },
}
