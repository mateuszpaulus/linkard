# Skedify

Link-in-bio platform for professionals: profile + services + booking.

## Local development

### Prerequisites

- **Docker** (for Postgres)
- **Node 20+** and **npm**
- **Java 25** (backend uses Maven wrapper `mvnw` — no system Maven needed)
- A Clerk **dev** project (free at clerk.com). The default dev JWKS in
  `application-local.properties` points at the existing dev tier — you only need
  to put your `pk_test_…` / `sk_test_…` keys into `frontend/.env.local`.

### First-time setup

1. Copy `frontend/.env.local.example` → `frontend/.env.local` and fill in:
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` + `CLERK_SECRET_KEY` (from clerk.com)
   - `NEXT_PUBLIC_API_URL=http://localhost:8080`
   - Cloudinary keys (for avatar uploads) — optional, profile works without
   - Stripe, Resend — leave empty locally; backend skips them gracefully.

2. Two terminals are enough:

   **Backend stack** (Postgres + Spring Boot in docker, port 8080):
   ```bash
   cd backend
   docker compose up -d            # first run builds the backend image (~2-3 min)
   docker compose logs -f backend  # tail logs (optional)
   ```

   **Frontend** (Next.js dev, port 3000):
   ```bash
   cd frontend
   npm run dev
   ```

   After changing backend code: `cd backend && docker compose up -d --build backend`
   (or `restart backend` if you only changed properties / env).

### Running only parts of the backend stack

| Command                                              | What it does                              |
|------------------------------------------------------|-------------------------------------------|
| `cd backend && docker compose up -d`                 | Postgres + backend                        |
| `cd backend && docker compose up -d postgres`        | Just Postgres (run backend natively)      |
| `cd backend && docker compose restart backend`       | Restart backend (no rebuild)              |
| `cd backend && docker compose up -d --build backend` | Rebuild & restart backend                 |
| `cd backend && docker compose stop`                  | Stop everything (volumes persist)         |
| `cd backend && docker compose down -v`               | Wipe DB data too                          |

If you prefer the backend natively (faster restarts, easier debugging):
```bash
cd backend
docker compose up -d postgres
./mvnw spring-boot:run -Dspring-boot.run.profiles=local
```

### Demo data

When `SPRING_PROFILES_ACTIVE=local`, `DataSeeder` creates three demo profiles
on first boot:
- `anna-kowalska` — dev consultant, 3 services, 3 social links, mon-fri 9–17 availability
- `marek-wisniewski` — UX designer
- `julia-nowak` — startup coach

It also flips `local_test_user` (the implicit clerk id for unauthenticated dev
requests) to **PRO** so you can exercise paid features. *However* — Spring
Security still requires a real JWT on `/api/me/*`, so the local-test fallback
only kicks in for requests that bypass the security filter (it does not).
In practice: **log in via Clerk** at <http://localhost:3000> to get a real
session; the local_test_user PRO flag is mostly for legacy/test paths.

## Testing the backend in isolation

### Getting a Clerk JWT for `*.http` files

1. Start the stack (see commands above) and open http://localhost:3000.
2. Sign in with your Clerk dev account.
3. Open the dashboard. In the sidebar footer (right of the language switcher)
   there's a small **JWT** button — dev-only (`NODE_ENV=development`). Click it
   → token is copied to your clipboard.
4. Paste it into the `@token = …` line at the top of any file under
   `backend/api-requests/`.

Alternative (no UI): open browser DevTools console on any logged-in page and run

```js
await window.Clerk.session.getToken()
```

Clerk dev tokens are short-lived (~60 s of inactivity). Re-copy as needed.

### Request files

- `backend/api-requests/profile-requests.http` — profile, services, links, stats, email test
- `backend/api-requests/booking-requests.http` — availability, bookings, subscription
- `backend/api-requests/webhook-requests.http` — Clerk + Stripe webhook payloads

Compatible with VS Code REST Client, IntelliJ HTTP Client, JetBrains tooling.

### Swagger / OpenAPI

Once the backend is up:
- UI: <http://localhost:8080/swagger-ui.html>
- Spec: <http://localhost:8080/v3/api-docs>

Generate frontend TS types from the live spec (backend must be running):

```bash
cd frontend && npm run codegen   # writes src/types/api.ts
```

## Testing Stripe locally (Pro upgrade flow)

Stripe checkout works in full locally using test mode + Stripe CLI for webhook
forwarding. End-to-end "Free → Pro" flow with fake cards in ~5 minutes setup.

### 1. Get test keys from Stripe

1. Sign up at https://dashboard.stripe.com (free, no card required).
2. **Toggle "Test mode" in the top-right** — everything below is test data.
3. **Developers → API keys** → copy your **Secret key** (`sk_test_…`).
4. **Products → Add product**:
   - Name: anything ("Skedify Pro")
   - Pricing: **Recurring**, e.g. $9 / month
   - Save → copy the **Price ID** (`price_…`)

### 2. Install Stripe CLI (one-time)

```bash
brew install stripe/stripe-cli/stripe   # macOS
stripe login                            # opens browser, authorizes once
```

### 3. Forward webhooks to local backend

In a separate terminal, keep this running while testing:

```bash
stripe listen --forward-to http://localhost:8080/api/webhooks/stripe
```

It prints a **webhook signing secret** (`whsec_…`) — grab it.

### 4. Put secrets in `backend/.env`

Copy the template and fill in:

```bash
cd backend
cp .env.example .env
# edit .env with: sk_test_…, price_…, whsec_…
```

`.env` is git-ignored. `docker compose up -d` will auto-load it.

### 5. Restart backend so it picks up the env

```bash
cd backend && docker compose up -d --build backend
# or if running natively: stop ./mvnw and restart it
```

### 6. Test the upgrade flow

1. Frontend → `/pricing` → "Upgrade to Pro"
2. Redirects to Stripe Checkout page
3. Use a Stripe **test card**:

   | Card                  | Result                                   |
   |-----------------------|------------------------------------------|
   | `4242 4242 4242 4242` | Successful payment                       |
   | `4000 0027 6000 3184` | Requires 3D Secure (test SCA flow)       |
   | `4000 0000 0000 9995` | Declined (insufficient funds)            |
   | `4000 0000 0000 0341` | Succeeds first time, fails on renewal    |
   | `4000 0000 0000 0002` | Declined (generic)                       |

   Expiry: any future date (e.g. `12 / 30`), CVC: any 3 digits (`123`),
   ZIP: any (`90210`), email: any.

4. After "Pay" you'll be redirected to `/success`.
5. The `stripe listen` terminal will show `checkout.session.completed` →
   backend webhook → `User.subscriptionStatus = PRO`.
6. Refresh dashboard — Plan tab shows "Pro plan ⭐ Active".

### Common gotchas

- **Webhook signing fails (`Invalid Stripe signature`)** — the `whsec_…` in
  `.env` doesn't match what `stripe listen` is using. Restart `stripe listen`,
  copy the new secret, restart backend.
- **`Failed to create payment session`** — almost always means env vars not
  loaded. Verify with `docker compose exec backend env | grep STRIPE`.
- **No redirect to Stripe** — frontend got a 503 from backend (missing key).
  Same root cause as above.
- **Upgrade doesn't reflect after payment** — `stripe listen` terminal was
  closed, so the webhook never arrived. Keep it running.

Full list of test cards: https://stripe.com/docs/testing

## External services — local behavior

| Service     | Local config              | Behavior if not configured             |
|-------------|---------------------------|----------------------------------------|
| PostgreSQL  | docker-compose            | Required — backend will not start      |
| Clerk       | dev JWKS in properties    | `/api/me/*` returns 401 without JWT    |
| Resend      | `RESEND_API_KEY` env      | Email sends are no-ops + warning log   |
| Stripe      | `STRIPE_SECRET_KEY` env   | `/checkout-session` returns 503        |
| Cloudinary  | frontend env vars         | Avatar upload disabled, rest works     |

## Tech stack

- **Frontend**: Next.js 16 (App Router), React 19, Tailwind v4, Clerk v7, Motion 12, Lucide
- **Backend**: Spring Boot 4, Java 25, JPA/Hibernate, springdoc-openapi
- **Database**: PostgreSQL 17
- **Email**: Resend
- **Payments**: Stripe
- **Storage**: Cloudinary
- **Auth**: Clerk (OAuth2 JWT)

See `CLAUDE.md` for module breakdown and project history.
