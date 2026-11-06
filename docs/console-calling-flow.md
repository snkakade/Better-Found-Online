# Console calling flow

The dialer starts ordinary live calls directly: enter a number and click Call or press Enter. There is no recipient-review dialog, state or time-zone form, screening classification, identity checkbox, or local-hour gate in this path. The optional outcome dialog opens after hang-up, and Skip leaves the outcome unset. It does not interrupt a new call.

`POST /api/console/calls` accepts only the destination number. The authenticated server creates a short-lived session bound to the user and number, using the workspace caller ID. It always selects live agent voice and recording off, regardless of extra client fields. It does not create recipient profiles, infer location, mark screening as complete, or fabricate attestations or consent. Saved do-not-call entries and the explicit workspace calling pause remain enforced, including a recheck in the signed Twilio callback.

The existing advanced `/call-preflight` API remains available for integrations using reviewed AI/recording flows; its restrictions do not gate ordinary manual calls. The console no longer presents that API's review form to dialer users.

Duplicate clicks are ignored while a call is starting. Hang-up or Escape can cancel a pending connection, and a late Twilio connection is disconnected. Connection errors restore the dialer. Post-call feedback is matched by the actual call SID, so editing the number does not attach feedback to another call.

The console subdomain and public website share the Pages project. Apply only this console change to main for production; retain the colour redesign on new-colour. Versioned UI assets and the new service-worker cache refresh installed consoles.

## Validation

- `node --test tests/console-calling.test.mjs tests/console-webhooks.test.mjs` exercises the actual authenticated API, the signed voice callback with the real SQLite migrations, and the actual client functions with fake call objects.
- Covers direct dialing with only a number, no invented recipient facts, no local-hour gate, authentication, suppression/pause checks, forced live/unrecorded settings, cancellation, duplicate clicks, and post-call feedback attribution.
- `node --test tests/*.test.mjs` and `npm run build:pages` cover regression and production-build checks.
- Automated tests do not contact Twilio or real recipients.

## Voice webhook correction

The live trace showed an allowed call review followed by HTTP 403 at the voice webhook. A signed callback fixture reproduced the rejection. The validator used locale-based sorting, which puts `Called` before `CallSid`; Twilio signs with case-sensitive lexical sorting, which puts `CallSid` first. The validator now follows the [official Twilio SDK signing contract](https://github.com/twilio/twilio-node/blob/main/src/webhooks/webhooks.ts), including unique, sorted repeated values. Missing, altered and wrong-URL signatures are still rejected.

Authenticated call refusals return HTTP 200 with explanatory TwiML and Hangup, without Dial. This avoids a generic provider application-error announcement for an intentional refusal. Unknown caller IDs cannot crash the refusal audit insert. Fourteen signed-webhook tests use the actual migrations in an in-memory SQLite database and cover dialing/attribution, DNC recheck, expired/mismatched reviews, tampering and call status updates.

## Production verification — 6 November 2026

Twilio's latest recorded error was 11200 at 00:28:31 IST: the voice webhook returned HTTP 403. This predates the signature correction deployed to production from main (`544fee2`). No newer errors appeared in the debugger during inspection.

A diagnostic POST to the production voice webhook, signed with the account's actual credential and containing both `Called` and `CallSid`, returned HTTP 200 and XML containing `Say` and `Hangup`. Its deliberately invalid destination exercised signature verification without dialing, creating a call record, or changing recipient data. An unsigned POST still returned HTTP 403. Credentials were not saved in the repository.

The live console JavaScript exactly matches the checked-in calling client. The console document returns `Cache-Control: no-store` and permits its own microphone access. All 111 Node `.mjs` regression tests pass. These checks establish that the deployed endpoint accepts valid signatures; recipient ringing and two-way audio still require a real call and are not claimed as verified.
