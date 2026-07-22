# Claude Fable Library — Bot specification

**Archetype:** content

**Voice:** warm and encouraging — write every user-facing message, button label, error, and empty state in this voice.

A curated on-demand fable library with browsing, scheduling, and admin curation tools for parents, teachers, and casual readers.

> This is the complete contract for the bot. Implement EVERY entry point, flow, feature, integration, and edge case below. The completeness review checks the bot against this document after each build pass.

## Primary audience

- parents
- teachers
- storytellers
- casual readers

## Success criteria

- 10,00.000 scheduled fable deliveries/month
- 500+ active subscriptions
- 200+ curated fables in library

## Entry points

Every feature must be reachable from the bot's command/button surface (button-first; only /start and /help are slash commands).

- **/start** (command, actor: user, command: /start) — Open main menu with quick actions
- **Browse** (button, actor: user, callback: browse:categories) — View fables by 8+ thematic categories
  - inputs: selected category
  - outputs: paginated fable list
- **Random Fable** (button, actor: user, callback: fable:random) — Instantly receive a random full fable
- **Subscribe** (button, actor: user, callback: schedule:start) — Configure daily/weekly fable delivery
- **/admin** (command, actor: admin, command: /admin) — Access moderation and curation tools

## Flows

### Browsing
_Trigger:_ browse:categories

1. Show category list
2. Display paginated fables (6 per page)
3. View full fable details
4. Save to personal library

_Data touched:_ Fable, User

### Subscription
_Trigger:_ schedule:start

1. Select cadence (daily/weekly)
2. Choose preferred time
3. Apply optional tag filter
4. Confirm subscription

_Data touched:_ Delivery schedule

### Admin Moderation
_Trigger:_ /admin

1. List flagged submissions
2. Review fable content
3. Approve/edit/delete submission

_Data touched:_ Fable, Admin note

## Data entities

Durable data (must survive a restart) uses the toolkit's persistent store, never in-memory maps.

- **Fable** _(retention: persistent)_ — Curated moral tale with metadata
  - fields: title, author, text, length, age_suitability, tags, language, timestamps
- **User** _(retention: persistent)_ — Subscriber profile and preferences
  - fields: Telegram ID, display name, language preference, subscription status
- **Delivery schedule** _(retention: persistent)_ — Scheduled delivery configuration
  - fields: user ID, cadence, preferred time, tag filter
- **Admin note** _(retention: persistent)_ — Moderation and editorial metadata
  - fields: moderation flag, editor comments

## Integrations

- **Telegram** (required) — Bot API messaging and scheduling
Call external APIs against their real contract (correct endpoints, ids, params); credentials from env. Do not fake responses.

## Owner controls

- /admin add/edit/delete fables
- /admin review flagged submissions
- /admin configure notification targets

## Notifications

- Scheduled fable delivery at user-selected time
- Admin alerts for new submissions/moderation needs

## Permissions & privacy

- User data limited to Telegram ID and preferences
- Moderation flags require admin review
- Saved fables stored with user consent

## Edge cases

- User exceeds 100 saved fables limit
- Scheduling conflict during DST transition
- Invalid tag filter in subscription settings

## Required tests

- End-to-end subscription workflow with scheduled delivery
- Admin moderation flow from submission to approval
- Pagination navigation in browse mode

## Assumptions

- Single admin user for moderation
- English as default language
- 8 core thematic tags plus 'Other'
