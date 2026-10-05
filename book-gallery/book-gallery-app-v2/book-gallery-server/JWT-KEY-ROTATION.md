# JWT key rotation

The server reads the JWT key set from AWS Secrets Manager when `JWT_SECRET_ID`
is configured. It polls the secret every 30 seconds by default, so updated
signing and validation keys are applied without restarting the application.
Set `JWT_SECRET_REFRESH_INTERVAL_MS` to change the polling interval.

## Secret format

Store a JSON object as the secret's `SecretString`:

```json
{
  "currentSecret": "<random secret with at least 32 UTF-8 bytes>",
  "previousSecret": "<optional prior secret>"
}
```

New access tokens are signed with `currentSecret`. JWT verification accepts
`currentSecret` and, when non-empty, `previousSecret`. Do not reuse the example
placeholders as actual keys.

Configure the ECS task with `JWT_SECRET_ID` set to the secret name or ARN and
`AWS_REGION` set to the secret's region. Give the ECS task role
`secretsmanager:GetSecretValue` for only this secret. If it uses a customer
managed KMS key, also allow `kms:Decrypt` for that key. The AWS SDK uses the
task role credentials; do not put AWS credentials in application properties.

For local development without `JWT_SECRET_ID`, the server falls back to
`JWT_CURRENT_SECRET` (or legacy `JWT_SECRET`) and optional
`JWT_PREVIOUS_SECRET` environment variables.

## Planned rotation

To move from key A to key B without rejecting tokens during the transition:

1. Publish `{ "currentSecret": "A", "previousSecret": "B" }`. All instances
   still sign with A and accept A or B.
2. Publish `{ "currentSecret": "B", "previousSecret": "A" }`. Within one poll
   interval, instances start signing with B and accept both A and B.
3. After all A-signed access tokens have expired (15 minutes from step 2),
   publish `{ "currentSecret": "B", "previousSecret": null }`. A-signed tokens
   stop validating within one poll interval.

## Emergency compromise

Publish `{ "currentSecret": "B", "previousSecret": null }`. Each instance
rejects A-signed access tokens after its next successful poll, no restart
required. With the default setting this is normally within 30 seconds. Existing
refresh tokens can still be used to obtain access tokens signed with B.

If Secrets Manager cannot be reached or the secret is invalid, the server logs
the refresh failure and retains the last valid key set; fix the IAM/network or
secret issue so the new key set can be loaded. This preserves service behavior
during temporary AWS failures, but means key revocation is not effective until
a valid refresh succeeds.
