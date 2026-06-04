# NyumbaChain — Development Setup Guide

## Prerequisites

Install these before anything else.

| Tool | Version | Purpose |
|------|---------|---------|
| Node.js | 20 LTS | Backend + Frontend |
| Docker | any | PostgreSQL + Redis |
| Rust | stable | Smart contract |
| Stellar CLI | latest | Contract build + deploy |
| cargo | comes with Rust | Contract tests |

```bash
# Install Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
rustup target add wasm32-unknown-unknown

# Install Stellar CLI
cargo install --locked stellar-cli --features opt
```

---

## Step 1 — Clone and Install

```bash
git clone <repo-url>
cd nyumbachain

# Backend
cd backend && npm install && cd ..

# Frontend
cd frontend && npm install && cd ..
```

---

## Step 2 — Start PostgreSQL and Redis

The project ships with a `docker-compose.yml` that runs both.

```bash
docker compose up -d
```

This starts:
- PostgreSQL on `localhost:5432` — user: `nyumba`, password: `nyumba`, db: `nyumbachain`
- Redis on `localhost:6379`

Verify they are running:
```bash
docker compose ps
```

---

## Step 3 — Create the Admin Stellar Keypair

The admin keypair is the backend server's Stellar identity. It signs all contract calls. You create it once and store it in `.env`.

```bash
# Generate keypair and save it
stellar keys generate service-keypair --network testnet

# Fund it on testnet (free)
stellar keys fund service-keypair --network testnet

# Show the secret key — copy the S... value
stellar keys show service-keypair
```

Keep the secret key. You need it in Step 4.

---

## Step 4 — Configure Backend Environment

```bash
cd backend
cp .env.example .env
```

Open `.env` and fill in:

```env
PORT=5000
NODE_ENV=development

# PostgreSQL — matches docker-compose.yml
DATABASE_URL=postgresql://nyumba:nyumba@localhost:5432/nyumbachain

# JWT — generate two separate random secrets
JWT_SECRET=<64 random hex chars>
JWT_REFRESH_SECRET=<different 64 random hex chars>

# Generate secrets with:
# node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Redis — matches docker-compose.yml
REDIS_URL=redis://localhost:6379

# Stellar — paste the S... secret from Step 3
STELLAR_SERVICE_SECRET=SXXX...
STELLAR_NETWORK=testnet
STELLAR_HORIZON_URL=https://horizon-testnet.stellar.org

# USDC on Stellar Testnet
USDC_CONTRACT_ADDRESS=CBIELTK6YBZJU5UP2WWQEUCYKLPU6AUNZ2BQ4WWFEIE3USCIHMXQDAMA

# Cloudflare R2 — optional for local dev, photos won't upload without it
CLOUDFLARE_R2_ACCESS_KEY=
CLOUDFLARE_R2_SECRET_KEY=
CLOUDFLARE_R2_BUCKET=nyumbachain-photos
CLOUDFLARE_R2_ENDPOINT=

# Email — optional for local dev, emails won't send without it
RESEND_API_KEY=

# Frontend URL for CORS
FRONTEND_URL=http://localhost:5173
```

---

## Step 5 — Start the Backend

```bash
cd backend
npm run dev
```

On first start the backend:
1. Connects to PostgreSQL
2. Runs `sequelize.sync({ alter: true })` — creates all tables automatically
3. Starts the payment cron job
4. Listens on `http://localhost:5000`

Verify it is running:
```bash
curl http://localhost:5000/health
# → {"status":"ok","service":"NyumbaChain API",...}
```

---

## Step 6 — Start the Frontend

Open a new terminal:

```bash
cd frontend
npm run dev
```

Frontend runs at `http://localhost:5173`.

---

## Step 7 — Register Users (wallets are created here)

Open `http://localhost:5173` and register two accounts, or use curl:

**Register a landlord:**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "landlord@test.com",
    "password": "password123",
    "role": "landlord",
    "full_name": "John Landlord"
  }'
```

**Register a tenant:**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "tenant@test.com",
    "password": "password123",
    "role": "tenant",
    "full_name": "Jane Tenant"
  }'
```

Both responses include a `stellar_wallet` field — a `G...` public key generated automatically by the backend (`Keypair.random()`). Copy both wallet addresses from the responses.

**Fund both wallets on testnet:**
```bash
stellar keys fund <LANDLORD_G_ADDRESS> --network testnet
stellar keys fund <TENANT_G_ADDRESS> --network testnet
```

---

## Step 8 — Run the Contract Tests

```bash
cd contracts
make test
```

Expected output:
```
running 10 tests
test test::initialize_stores_values ... ok
test test::deposit_funds_updates_balance ... ok
test test::execute_payment_transfers_rent ... ok
test test::double_payment_blocked ... ok
test test::insufficient_funds_panics ... ok
test test::terminate_and_release_deposit ... ok
test test::claim_deposit_goes_to_landlord ... ok
test test::release_on_active_panics ... ok
test test::double_initialize_panics ... ok
test test::full_lifecycle ... ok

test result: ok. 10 passed; 0 failed
```

---

## Step 9 — Build and Deploy the Contract

```bash
cd contracts

# Compile to WASM
make build

# Shrink WASM for deployment
make optimize

# Deploy to Stellar Testnet
make deploy
```

`make deploy` prints a contract address starting with `C...`. Copy it — you do not need to put it anywhere in `.env` because the backend deploys a fresh contract per tenancy automatically. This manual deploy step is only for verifying your contract works on-chain before the full flow.

Verify on-chain:
```
https://stellar.expert/explorer/testnet/contract/<CONTRACT_ID>
```

---

## Step 10 — Full End-to-End Flow Test

Do this through the UI at `http://localhost:5173`.

```
1. Log in as landlord
2. Create a property → add a unit with rent and deposit
3. Log in as tenant (open incognito tab)
4. Search → find the property → submit application

5. Log in as landlord
6. Go to Applications → Approve
   → backend deploys escrow contract
   → tenancy record created in DB with escrow_contract_id

7. Log in as tenant
8. Go to Wallet → copy the escrow wallet address (C...)
9. Send USDC to that address on testnet
   (use Freighter wallet or Stellar Laboratory)

10. Trigger payment (cron runs at 00:05 UTC daily)
    To test manually, call execute_payment directly:

    stellar contract invoke \
      --id <CONTRACT_ID> \
      --source service-keypair \
      --network testnet \
      -- execute_payment

11. Check landlord wallet balance increased
    Check payment history in tenant dashboard
    Verify tx hash on stellar.expert
```

---

## Wallet Addresses — Quick Reference

| Who | Address type | When created |
|-----|-------------|--------------|
| Admin | `S...` secret in `.env` | Step 3 — you create once manually |
| Landlord | `G...` public key in DB | Step 7 — auto on register |
| Tenant | `G...` public key in DB | Step 7 — auto on register |
| Escrow contract | `C...` contract address in DB | Step 10 — auto on application approve |

---

## Common Issues

**Backend fails to connect to DB**
→ Check Docker is running: `docker compose ps`
→ Check `DATABASE_URL` in `.env` matches docker-compose credentials

**`STELLAR_SERVICE_SECRET is not set`**
→ You skipped Step 3 or forgot to add it to `.env`

**Contract deploys as `C_MOCK_`**
→ WASM file not found — run `make build` in `contracts/` first

**CORS error in browser**
→ `FRONTEND_URL` in `.env` must match exactly where your frontend is running

**SSL error on local PostgreSQL**
→ The `db.config.ts` has SSL enabled for Supabase. For local Docker, change `require: false` or set `NODE_ENV=development` which disables strict SSL checks
