## 1. Post-login redirect to /me

- [x] 1.1 Pass `returnTo: "/me"` when initiating login in auth0.ts or proxy login handler so the Auth0 callback redirects to /me

## 2. Proxy routing logic

- [x] 2.1 In proxy.ts auth0 mode: add session check for / — redirect authenticated users to /me, unauthenticated users to /login
- [x] 2.2 In proxy.ts auth0 mode: add session check for /login — redirect authenticated users to /me
- [x] 2.3 In proxy.ts mock mode: add app-token cookie check for / — redirect unauthenticated users to /dev/login

## 3. Verify

- [x] 3.1 Auth0 mode: log in and confirm landing on /me
- [x] 3.2 Auth0 mode: while logged in, visit / and confirm redirect to /me
- [x] 3.3 Auth0 mode: while logged in, visit /login and confirm redirect to /me
- [x] 3.4 Auth0 mode: log out, visit / and confirm redirect to /login
- [x] 3.5 Auth0 mode: log out, visit /me and confirm redirect to /login (regression check)
