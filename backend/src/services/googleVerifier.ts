import { OAuth2Client } from 'google-auth-library'

let client: OAuth2Client | null = null

function getClient(): OAuth2Client {
  const clientId = process.env.GOOGLE_CLIENT_ID
  if (!clientId) throw new Error('GOOGLE_CLIENT_ID must be set')
  if (!client) client = new OAuth2Client(clientId)
  return client
}

export interface GooglePayload {
  email: string
  name: string
  sub: string
}

export const googleVerifier = {
  async verify(idToken: string): Promise<GooglePayload> {
    const clientId = process.env.GOOGLE_CLIENT_ID
    const ticket = await getClient().verifyIdToken({
      idToken,
      audience: clientId,
    })
    const payload = ticket.getPayload()
    if (!payload || !payload.email || !payload.email_verified || !payload.sub) {
      throw new Error('Invalid token payload')
    }
    return {
      email: payload.email.toLowerCase(),
      name: payload.name ?? payload.email,
      sub: payload.sub,
    }
  },
}
