# Project Architecture Rules

- Root `/` is the premium TechFriday.tech domain-acquisition page; keep public copy focused exclusively on acquiring the domain.
- Public domain offers must pass through the `submit-domain-offer` function; never write inquiries directly from browser code because validation, rate limits, and private credentials are server-only.
- `domain_inquiries` is a private administrator inbox; only the service role creates records and authenticated admins may read or update status.