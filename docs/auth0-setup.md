# Auth0 Tenant Setup

One-time manual steps required before deploying with `Auth__Provider=Auth0`.

## 1. Create the API resource

1. In the Auth0 dashboard, go to **Applications → APIs → Create API**
2. Set **Name** to `Golf League API`
3. Set **Identifier** (audience) to any string you choose — this is not a real URL, just a stable identifier. Convention is URI-format (e.g. `golf-league-api` or `https://golf-league-app/api`). Whatever you pick here must match `Auth__Auth0__Audience` exactly in your environment config. It cannot be changed later without updating all configs.
4. Leave signing algorithm as RS256

## 2. Create the Regular Web Application

The `@auth0/nextjs-auth0` v4 SDK requires a **Regular Web Application** (not SPA) because the token exchange happens server-side.

1. Go to **Applications → Applications → Create Application**
2. Choose **Regular Web Application**
3. Set **Name** to `Golf League Web`
4. Under **Allowed Callback URLs**, add `{APP_BASE_URL}/auth/callback`
5. Under **Allowed Logout URLs**, add `{APP_BASE_URL}`
6. Under **Allowed Web Origins**, add `{APP_BASE_URL}`
7. Save — note the **Domain**, **Client ID**, and **Client Secret** for `AUTH0_DOMAIN`, `AUTH0_CLIENT_ID`, and `AUTH0_CLIENT_SECRET`

## 3. Deploy the Post Login Action

The access token does not include a bare `email` claim by default (Auth0 silently drops it to avoid OIDC namespace collisions). Add a custom namespaced claim via a Post Login Action.

1. Go to **Actions → Library → Create Action**
2. Set **Name** to `Add email claim`
3. Set **Trigger** to **Login / Post Login**
4. Paste the following code:

```javascript
exports.onExecutePostLogin = async (event, api) => {
  api.accessToken.setCustomClaim('https://golf-league-app/email', event.user.email);
};
```

5. Click **Deploy**

## 4. Wire the Action into the Login flow

1. Go to **Actions → Flows → Login**
2. In the flow editor, drag **Add email claim** from the sidebar into the flow between **Start** and **Complete**
3. Click **Apply**

After this, every access token issued by Auth0 will contain the `https://golf-league-app/email` claim, which `Auth0AuthProvider` reads for the first-time-login linking flow.
