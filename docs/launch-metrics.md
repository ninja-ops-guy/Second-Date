# Launch metrics

Second Date records a small first-party event stream in PostgreSQL. Product actions do not fail when analytics writes fail.

## Events

- `guest_started` — guest workspace created.
- `account_created` — guest converted or a new account registered.
- `item_created` — a real item was added.
- `item_used` / `item_discarded` — outcome recorded.
- `checkout_started` — Stripe checkout session created.
- `reminders_enabled` / `reminders_disabled` — reminder preference changed.
- `reminder_digest_sent` — reminder delivery succeeded.

## Metrics worth watching first

1. **Activation:** percentage of guest workspaces that add a real item.
2. **Account conversion:** percentage of activated guests that create an account.
3. **Week-4 retained use:** users who create or complete an item 22–35 days after their first event.
4. **Use-up rate:** `item_used / (item_used + item_discarded)` by category.
5. **Plus funnel:** account-created → checkout-started → Plus entitlement.
6. **Reminder adoption:** Plus users who enable reminders, and whether reminder recipients complete items afterward.

Keep the event schema deliberately small until real usage suggests a need for deeper instrumentation.
