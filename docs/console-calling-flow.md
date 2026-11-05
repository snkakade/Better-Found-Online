# Console calling flow

Ordinary live-agent calls use a compact recipient check. The business name is optional; a successful check immediately starts the requested call instead of requiring another confirmation button. Existing recipient facts load for reuse. New numbers still require explicit line classification, screening basis, state and time zone; these are never guessed from an area code or invented from a company name.

Live agent and recording off are the defaults. AI consent fields appear only for AI/prerecorded mode. Recording permission is never carried over from a previous call. Actual blocking reasons have their own result panel; informational state-review notes and other warnings appear separately in collapsible notes. They do not require a second confirmation.

Unchanged server restrictions include internal/recipient DNC, workspace calling pause, blocked states, recipient-local calling window, unknown/unverified line classification, truthful identity confirmation, AI consent/policy and recording permission. The signed Twilio webhook still requires a current review matching the caller and destination and rechecks internal suppression.

The client prevents duplicate pending calls and cancels a late response/connection when the dialog is closed. UI assets use a new version query so installed consoles fetch the updated form and script.

## Validation

- `node --test tests/console-calling.test.mjs`: actual authenticated API handler with an in-memory D1 adapter; client functions exercised in a VM with fake media/call objects.
- Covers the optional business name, non-blocking notes, retained restrictions, saved recipient facts, one-submit connection, duplicate submissions, cancellation and conditional consent controls.
- `node --test tests/*.test.mjs` and `npm run build:pages` cover regression/build checks.
- These tests do not call Twilio, contact real recipients or change the production database. A real outbound call has not been placed as part of verification.
- Browser inspection remains unavailable: navigation fails with the existing browser-control `timeoutMs` error. No completed visual/browser end-to-end check is claimed.

The console subdomain and public website share the Pages project. Apply only this console fix to main for the live console; retain the colour redesign on new-colour.

## Policy references

These references inform the distinction between live business calls and artificial/prerecorded voice. The console check does not certify a call as lawful in every jurisdiction.

- [FTC: Do Not Call Q&A](https://www.ftc.gov/business-guidance/resources/qa-telemarketers-sellers-about-dnc-provisions-tsr-0)
- [FTC: 2024 B2B telemarketing protections](https://www.ftc.gov/news-events/news/press-releases/2024/03/ftc-implements-new-protections-businesses-against-telemarketing-fraud-affirms-protections-against-ai)
- [FCC: AI-generated voice declaratory ruling](https://docs.fcc.gov/public/attachments/FCC-24-17A1_Rcd.pdf)

## Voice webhook correction

The live trace showed an allowed call review followed by HTTP 403 at the voice webhook. A signed callback fixture reproduced the rejection. The validator used locale-based sorting, which puts `Called` before `CallSid`; Twilio signs with case-sensitive lexical sorting, which puts `CallSid` first. The validator now follows the [official Twilio SDK signing contract](https://github.com/twilio/twilio-node/blob/main/src/webhooks/webhooks.ts), including unique, sorted repeated values. Missing, altered and wrong-URL signatures are still rejected.

Authenticated call refusals return HTTP 200 with explanatory TwiML and Hangup, without Dial. This avoids a generic provider application-error announcement for an intentional refusal. Unknown caller IDs cannot crash the refusal audit insert. Fourteen signed-webhook tests use the actual migrations in an in-memory SQLite database and cover dialing/attribution, DNC recheck, expired/mismatched reviews, tampering and call status updates.
