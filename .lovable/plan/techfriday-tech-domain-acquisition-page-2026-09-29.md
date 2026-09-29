# TechFriday.tech Domain Acquisition Page

## Goal

Replace the public homepage with a premium, dark, single-column acquisition experience whose only message is that **TechFriday.tech is available for acquisition for $999 USD**. Preserve the existing admin and editorial routes unless they directly conflict with the new homepage.

## Page Experience

- Build the selected **Midnight Emerald Acquisition** direction using the existing TechFriday blue/green palette and current typography.
- Create a focused first screen with the availability status, monumental domain name, exact supporting copy, and two actions.
- Add the requested value, four benefit cards, clearly labeled concept use cases, price, offer form, FAQ, final call-to-action, and minimal footer.
- Add restrained grid/glow details, subtle reveal and interaction motion, reduced-motion support, strong focus states, and responsive layouts for mobile, tablet, and desktop.
- Keep all claims factual. Do not add testimonials, buyer activity, traffic, statistics, marketplace language, or invented ownership claims.

## Offer Form

- Add accessible fields for name, company, work email, current website, offer amount, intended use, message, and acquisition acknowledgment.
- Validate and normalize every field in the browser and again before storage.
- Prevent duplicate clicks, show loading and actionable error states, and replace the form with the requested success state after acceptance.
- Add a hidden honeypot and server-enforced rate limiting. Cloudflare Turnstile will not be added, per your choice.
- Store accepted inquiries in a private `domain_inquiries` table. Public visitors cannot read or edit inquiries; only server code can create them and administrators can review them.

## Secure Processing

- Add a public offer-submission function with strict origin checks for `techfriday.tech`, its `www` address, the published Lovable address, and local previewing.
- Apply server-side schema validation, email and offer-amount validation, payload limits, honeypot rejection, rate limiting, safe generic errors, and security headers.
- Keep all private credentials in encrypted backend secrets, never browser code or Git-tracked files.
- Send an email notification for accepted inquiries and keep the admin inbox as the reliable record. If email delivery requires sender verification or a provider credential that is not yet configured, finish the inbox and report that single remaining setup item clearly.

## Admin Inbox

- Add a protected **Domain Inquiries** page inside the existing admin area.
- Show contact details, offer amount, intended use, message, received time, and inquiry status in a compact review layout.
- Allow administrators to mark inquiries as new, contacted, or closed without exposing them publicly.

## Search and Browser Appearance

- Set the exact requested title and description in the static page head.
- Add matching Open Graph and Twitter metadata, keep the existing favicon, and update canonical/share URLs for `https://techfriday.tech/`.
- Add security headers through the existing hosting configuration without breaking direct-route refreshes.

## Verification

- Verify form validation, duplicate prevention, success/error states, private inquiry access, and administrator status changes.
- Check the finished page at desktop and mobile sizes for content fit, clear hierarchy, keyboard access, and reduced motion.
- Confirm the final build, browser console, network behavior, and direct-route handling are clean.

## Technical Notes

- Reuse React, Tailwind, the existing design components, Zod, and React Hook Form; add no unnecessary dependencies.
- Keep the existing blog/admin structure in place while routing `/` to the acquisition page.
- Record the new homepage and inquiry-flow architecture in `AGENTS.md` so future work preserves the acquisition purpose and security boundary.