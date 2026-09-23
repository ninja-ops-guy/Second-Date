# Second Date production launch checklist

## Already in the repository
- Guest-first product flow and free-plan limit
- Account/session backend
- PostgreSQL/Drizzle data model
- Stripe checkout, verified webhook synchronization, and billing portal
- Plus email reminder job with duplicate-delivery protection
- First-party activation/retention event stream
- CI gate: install, lint, typecheck, tests, production build
- GitHub Pages frontend preview
- Privacy and Terms starter pages
- Web app manifest and service worker
- Health endpoint

## External services required before live paid launch
1. Create a managed PostgreSQL database and set DATABASE_URL.
2. Deploy the Next.js application to a server-capable host and set APP_URL.
3. Run npx drizzle-kit push against the production database.
4. Create Stripe production credentials; set STRIPE_SECRET_KEY and STRIPE_WEBHOOK_SECRET; register /api/billing/webhook.
5. Configure the Stripe Customer Portal and test cancellation/downgrade.
6. Create a verified email sender and set RESEND_API_KEY, REMINDER_FROM_EMAIL, and a strong CRON_SECRET.
7. Replace starter legal text with counsel-reviewed terms appropriate to the launch jurisdictions and add a support/contact address.
8. Add account deletion/export before broad public launch.
9. Add runtime error monitoring and alerting.
10. Run a production smoke test: guest → first item → account → checkout test → Plus entitlement → reminder → billing portal → cancel.

## Validation cohort
Recruit 50 real users. Ask each to track five products they already have open. Measure first real item, second item, guest-to-account, day-7/day-30 retained use, reminder-driven return, used-vs-discarded, and free-to-Plus conversion.

Do not expand the roadmap substantially until this cohort reveals the retention bottleneck.
