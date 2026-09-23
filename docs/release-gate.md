# Second Date v1 release gate

A release candidate is eligible for a public validation cohort only when every required gate below is evidenced.

## G0 — Source
- main is the intended release head
- CI passes on that exact head
- no credentials or private keys are committed
- GitHub Pages preview deploy passes

## G1 — Core hosted infrastructure
- Second Date exists as its own hosted project
- production PostgreSQL is provisioned
- DATABASE_URL is configured
- APP_URL is configured
- database schema is applied
- /api/health returns 200
- /api/readiness returns 200

## G2 — Core user journey
- guest workspace is created
- first real item removes examples
- free limit is enforced
- account registration preserves guest items
- login/logout work
- edit/use/discard/delete work
- data export works
- account deletion works

## G3 — Billing (required before accepting money)
- Stripe test keys configured
- signed webhook configured
- monthly checkout succeeds
- yearly checkout succeeds
- entitlement becomes Plus only from verified Stripe state
- portal opens
- cancellation removes Plus entitlement
- deletion of a subscribed account cancels subscription first
- no live-mode keys used until all test-mode cases pass

## G4 — Reminders (required before advertising reminders as live)
- sender domain verified
- reminder secrets configured
- test reminder delivers
- duplicate cron call does not duplicate delivery
- failed send is retryable
- reminder analytics records successful delivery

## G5 — Safety and privacy
- Privacy and Terms are linked
- safety boundary is visible
- export/delete controls are available
- browser mutations reject cross-origin requests
- security headers are present
- SECURITY.md exists

## G6 — Operations
- production smoke workflow passes against production URL
- rollback target is known
- runtime error monitoring is available
- launch owner can inspect health/readiness
- database rollback is not treated as an automatic deployment rollback

## G7 — Validation launch
- cohort protocol is frozen
- 50-user recruitment can begin
- analytics definitions are frozen for the 30-day observation window
- feature expansion pauses unless needed to repair a measured blocker

## Release claim

Until G1 is complete, describe Second Date as a deployed frontend preview with a production-ready backend codebase, not as a fully hosted SaaS.

Until G3 is complete, do not claim live paid subscriptions.

Until G4 is complete, do not claim live reminder delivery.
