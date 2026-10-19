# Better Found Online outreach console

The private console is served at `/console/` on the primary site and at the root of `console.betterfoundonline.com`. It provides individual user accounts, role-based access, browser calling, two-way SMS, and per-user outreach reporting.

## Access roles

- **Agent:** contacts, templates, outbound SMS, schedules, and browser calls.
- **Manager:** agent access plus team performance reporting.
- **Administrator:** manager access plus user management, compliance, number configuration, and billing screens.

Every outbound SMS and browser call is written to `outreach_events` with the authenticated `user_id`. Inbound SMS replies are attributed to the user responsible for the latest outbound outreach to that number. Twilio delivery and call status callbacks update the matching event.

## Cloudflare resources

- D1 database: `better-found-online-db`
- D1 ID: `b8dbe9b8-9739-483a-b497-670398ef08c4`
- Worker binding: `DB`
- Migration: `migrations/0002_outreach_console.sql`

Bind the production D1 database to the `better-found-online` Pages project as `DB` for both Production and Preview.

Add these encrypted Pages secrets:

- `CONSOLE_BOOTSTRAP_TOKEN`
- `TWILIO_ACCOUNT_SID`
- `TWILIO_AUTH_TOKEN`
- `TWILIO_API_KEY`
- `TWILIO_API_SECRET`
- `TWILIO_CALLER_ID`
- `TWILIO_TWIML_APP_SID`
- `TWILIO_MESSAGING_SERVICE_SID` when scheduled messages or a Messaging Service are used
- `TWILIO_SMS_ENABLED=true` only after the sender is approved for use
- `TWILIO_A2P_BRAND_STATUS`
- `TWILIO_A2P_CAMPAIGN_STATUS`

Cloudflare secrets are encrypted and cannot be read or copied out of the Shrey project. Enter the existing Twilio values again in the Better Found Online Pages project.

## Create the first administrator

The bootstrap endpoint works only while `console_users` is empty. Keep the bootstrap token private and remove it after the owner account is created.

```bash
curl -X POST 'https://console.betterfoundonline.com/api/console/bootstrap' \
  -H 'Authorization: Bearer YOUR_BOOTSTRAP_TOKEN' \
  -H 'Content-Type: application/json' \
  --data '{"username":"OWNER_USERNAME","name":"OWNER_NAME","email":"OWNER_EMAIL","password":"A_UNIQUE_12+_CHARACTER_PASSWORD"}'
```

Afterward, sign in and use **Team access** to create Agent, Manager, or Administrator accounts. Do not share accounts; attribution depends on each person signing in with their own username.

## Twilio routing

Configure the existing Twilio number and TwiML App with HTTPS `POST` requests:

- Incoming message webhook: `https://console.betterfoundonline.com/api/console/sms-webhook`
- TwiML App voice request URL: `https://console.betterfoundonline.com/api/console/voice-webhook`

The application supplies these callbacks automatically for console-created activity:

- SMS delivery callback: `/api/console/sms-status-webhook`
- Call progress callback: `/api/console/call-status-webhook`

All Twilio webhooks validate `X-Twilio-Signature`; unsigned or altered requests are rejected.

## Go-live verification

1. Confirm `/api/console/status` reports the Twilio account as active and Voice as enabled.
2. Confirm the number shown is the intended shared number.
3. Sign in as an Agent and place one approved test call to a number supplied for testing.
4. Send one compliant test SMS only after A2P approval and explicit recipient consent.
5. Reply to the test SMS and confirm it appears as inbound.
6. Sign in as a Manager and confirm Team performance attributes the message, reply, call, connection, and talk time to the Agent.
7. Remove `CONSOLE_BOOTSTRAP_TOKEN` after the first administrator is created.

Do not run live call or SMS tests without a confirmed destination number and permission from its owner.
