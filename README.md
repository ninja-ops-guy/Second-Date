# Second Date

Second Date is a small, paid-optional app for the *second shelf-life clock*: the period that starts **after** you open a product. People enter the after-opening period from a label, then track what to use next across food, beauty, wellness, and home products.

## What works

- Instant guest workspace with removable example timers; no sign-up required to try it.
- Create, edit, search, filter, finish, discard, and delete opening-date timers.
- Free plan: 8 active personal items. Example items do not count and disappear when the first real item is added.
- Email/password account creation and sign-in; guest items stay when a guest creates an account.
- Plus plan: unlimited active items, email Second Date reminders, printable date label sheets, and personal use-up insights.
- Self-service subscription checkout and billing management through Stripe. Billing is intentionally disabled with a clear message when Stripe environment variables are not configured.

Dates are reminders based on periods entered by users, not food-safety or medical advice. Always follow the product's instructions and storage guidance.

## Run locally

1. Set `DATABASE_URL` in `.env` to your PostgreSQL database.
2. Install dependencies with `npm install`.
3. Apply the schema with `npx drizzle-kit push`.
4. Start with `npm run dev`.

## Quality checks

Run the local qualification gate with:

```bash
npm run check
npm run build
```

GitHub Actions runs lint, TypeScript, tests, and a production build on pushes and pull requests.

## Enable reminders

Plus users can opt into email reminders from Settings. The scheduled endpoint sends a heads-up at the chosen lead time and once again on the Second Date. A per-user/per-day delivery record prevents duplicate digests.

Set these server-side environment variables:

- `RESEND_API_KEY` — API key for email delivery through Resend.
- `REMINDER_FROM_EMAIL` — verified sender identity, for example `Second Date <hello@example.com>`.
- `CRON_SECRET` — long random secret used to authorize `/api/reminders/run`.

`vercel.json` schedules the reminder route daily at 13:00 UTC. Vercel Cron sends the configured `CRON_SECRET` as a bearer token when the project environment is configured accordingly. If email or cron secrets are missing, reminder delivery fails closed and normal app usage is unaffected.

## Product analytics

Lifecycle events are stored in the `analytics_events` table for activation, retention, use-up, checkout, and reminder analysis. See `docs/launch-metrics.md` for the initial metric definitions. Analytics failures never block the product action that generated them.

## Enable subscriptions

Set these server-side environment variables:

- `STRIPE_SECRET_KEY` — Stripe secret API key.
- `STRIPE_WEBHOOK_SECRET` — signing secret for the webhook endpoint.
- `APP_URL` — canonical public origin, for example `https://your-domain.com` (optional for local development; request origin is used otherwise).

Register `https://your-domain.com/api/billing/webhook` in Stripe for `checkout.session.completed`, `customer.subscription.created`, `customer.subscription.updated`, and `customer.subscription.deleted`. Configure the Stripe Customer Portal in your Stripe dashboard to enable self-service cancellation and payment-method management.

The app creates Stripe Prices inline: **$2.99 per month** or **$24 per year** for Second Date Plus. Checkout is linked to a registered user and Plus access is synchronized from verified Stripe events (with a verified Checkout return as an additional fast path). No payment keys are bundled with this project.
