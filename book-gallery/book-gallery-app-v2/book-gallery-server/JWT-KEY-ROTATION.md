# JWT key configuration

The server reads its JWT signing key from the `JWT_CURRENT_SECRET` environment
variable. The key must contain at least 32 UTF-8 bytes for HS256. The legacy
`JWT_SECRET` variable is accepted when `JWT_CURRENT_SECRET` is not set.

To rotate keys without immediately invalidating existing access tokens:

1. Set `JWT_CURRENT_SECRET` to the new key and `JWT_PREVIOUS_SECRET` to the old
   key, then restart the server. New tokens use the new key; validation accepts
   both.
2. After all access tokens signed with the old key have expired, remove
   `JWT_PREVIOUS_SECRET` and restart the server again.

Keep production keys in your deployment environment or platform configuration.
For local development, set `JWT_CURRENT_SECRET` in your IDE run configuration
or shell environment. Do not commit key values to source control.
