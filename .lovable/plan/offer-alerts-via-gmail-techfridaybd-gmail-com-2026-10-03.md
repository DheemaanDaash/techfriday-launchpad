# Offer Alerts via Gmail (techfridaybd@gmail.com)

## Goal

Every accepted offer on the TechFriday.tech page triggers an automatic email alert, sent from techfridaybd@gmail.com through Gmail's mail service, delivered to both techfridaybd@gmail.com and dh33m4nd45h3m0n+techfriday@gmail.com. The admin inbox stays the reliable record; email is the instant heads-up.

## What You Do (one time, in your Google account)

1. Turn on 2-Step Verification for techfridaybd@gmail.com if it is not already on (myaccount.google.com → Security).
2. Create an App Password (myaccount.google.com/apppasswords), name it something like "TechFriday offers", and copy the 16-character password.
3. Paste it into the secure secret form I open in chat — it is stored encrypted and never appears in code or Git.

## What I Build

- Store the app password as an encrypted backend secret (`GMAIL_APP_PASSWORD`), plus the sender address and the two recipient addresses as backend config values.
- Update the existing offer-submission function: after an inquiry is validated, rate-limit-checked, and saved, it sends a plain-text alert email through Gmail's secure mail service (TLS, port 465) containing the sender's name, email, and offer amount.
- Sending is best-effort: if the email fails, the inquiry is still saved in the admin inbox and the visitor still sees success — a mail hiccup never loses an offer. Failures are logged for diagnosis.
- Remove the now-unused Resend code path from the function.

## Verification

- Submit a test offer through the live form and confirm the alert email arrives at both addresses.
- Confirm the inquiry still appears in the admin inbox, then delete the test row.
- Confirm the build stays clean and no secret values appear anywhere in the codebase.

## Technical Notes

- Only `supabase/functions/submit-domain-offer/index.ts` changes; the page, form, and admin inbox are untouched.
- Gmail sending limits (hundreds/day) are far above expected offer volume.
- If Google ever revokes the app password, alerts stop but offers keep landing in the admin inbox; rotating the secret restores alerts.
