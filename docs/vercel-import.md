# Import Second Date into Vercel

The repository is ready to be imported as a separate Vercel project. Do not attach it to the RESIDUAL project.

## Import

1. In Vercel, choose **Add New → Project**.
2. Import **ninja-ops-guy/Second-Date**.
3. Keep the repository root as the project root.
4. Framework preset should detect **Next.js**.
5. Do not add production billing or reminder secrets during the first deployment.

## Minimum environment

Create these production variables before expecting the hosted app to be ready:

- DATABASE_URL
- APP_URL

Set APP_URL to the eventual production origin.

Provision PostgreSQL, then run the schema setup against that database:

    DATABASE_URL=... npm run db:push

After deployment, verify:

- /api/health
- /api/readiness

Then run the repository smoke workflow or:

    SECOND_DATE_URL=https://your-host npm run smoke:production

## Add billing after the core app is healthy

Set:

- STRIPE_SECRET_KEY
- STRIPE_WEBHOOK_SECRET

Register:

    https://your-host/api/billing/webhook

Enable these Stripe events:

- checkout.session.completed
- customer.subscription.created
- customer.subscription.updated
- customer.subscription.deleted

Test in Stripe test mode before using live credentials.

## Add reminders last

Set:

- RESEND_API_KEY
- REMINDER_FROM_EMAIL
- CRON_SECRET

Verify the sending domain before enabling reminder delivery.

## Go-live gate

Do not start the 50-user cohort until:
- CI is green
- /api/readiness returns 200
- production smoke passes
- account export/delete work
- Stripe test checkout/cancel passes if billing is enabled
- reminder duplicate protection is verified if reminders are enabled
