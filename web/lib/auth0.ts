import { Auth0Client } from "@auth0/nextjs-auth0/server";

let _client: Auth0Client | undefined;

// Lazy singleton — only constructed when actually called, avoiding startup errors in mock mode.
export function getAuth0Client(): Auth0Client {
  _client ??= new Auth0Client({
    authorizationParameters: {
      audience: process.env.AUTH0_AUDIENCE,
      scope: "openid profile email",
    },
  });
  return _client;
}
