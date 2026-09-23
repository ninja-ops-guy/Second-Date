# Security policy

Second Date handles account sessions, product records, subscription state, and reminder preferences. Security reports should not be filed as public issues when they contain exploit details or user data.

## Supported version

The current main branch is the supported development version until the first tagged release.

## Reporting

Use GitHub's private vulnerability reporting feature for this repository when available. Include reproduction steps, affected route or component, impact, and the smallest safe proof of concept.

Do not include real credentials, payment data, or another person's personal information in a report.

## Security boundaries

- Passwords are stored as salted scrypt hashes.
- Session cookies are HTTP-only, SameSite=Lax, and Secure in production.
- Browser state-changing API calls are restricted to same-origin requests.
- Stripe webhook events require signature verification.
- Reminder cron execution requires a server-side bearer secret.
- Account deletion re-verifies the password and attempts to cancel an active subscription before deleting data.
- Secrets belong in the deployment platform and must never be committed to the repository.

The application does not make food, medical, cosmetic, or product-safety determinations.
