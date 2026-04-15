import dotenv from 'dotenv'

dotenv.config()

export interface CreateAccessTokenOptions {
  clientId: string
  clientSecret: string
  password: string
  tokenUrl: string
  username: string
}

interface TokenResponseBody {
  access_token?: string
  error?: string
  error_description?: string
}

/**
 * Creates a bearer token for the local mock OIDC server used by the development
 */
export async function createAccessToken(options: CreateAccessTokenOptions) {
  const response = await fetch(options.tokenUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: new URLSearchParams({
      client_id: options.clientId,
      client_secret: options.clientSecret,
      grant_type: 'password',
      password: options.password,
      scope: [].join(' '), // no scopes are currently needed for the mock OIDC server, but this can be easily updated if that changes in the future
      username: options.username
    })
  })

  const responseText = await response.text()
  const responseBody = parseTokenResponse(responseText)

  if (!response.ok) {
    const errorMessage = responseBody.error_description ?? responseBody.error
    throw new Error(
      `Token request failed for ${options.tokenUrl}: ${response.status} ${errorMessage ?? responseText}`
    )
  }

  return responseBody.access_token
}

export async function createAdminAccessToken() {
  return createAccessToken(resolveOptions())
}

function resolveOptions(): CreateAccessTokenOptions {
  const response = {
    clientId: process.env.MOCK_OIDC_CLIENT_ID,
    clientSecret: process.env.MOCK_OIDC_CLIENT_SECRET,
    password: process.env.MOCK_OIDC_PASSWORD,
    tokenUrl: process.env.MOCK_OIDC_TOKEN_URL,
    username: process.env.MOCK_OIDC_USERNAME
  }

  for (const [key, value] of Object.entries(response)) {
    if (!value) {
      throw new Error(`Missing required configuration for ${key.toUpperCase()}`)
    }
  }

  return response as CreateAccessTokenOptions
}

function parseTokenResponse(responseText: string): TokenResponseBody {
  try {
    return JSON.parse(responseText) as TokenResponseBody
  } catch {
    throw new Error(`Failed to parse token response as JSON: ${responseText}`)
  }
}
