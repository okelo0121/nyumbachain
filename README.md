# 🏠 NyumbaChain

> **Nyumba** (Swahili for *house*) **+ Chain** (blockchain) — Trustless rental property management on Stellar.

A blockchain-powered rental management system that connects landlords and tenants through automated, smart-contract-based escrow. Tenants fund a personal USDC wallet; on the agreed payment day, a Soroban smart contract automatically releases rent to the landlord — no bank transfer, no manual action, no late fees.

Built for the **Stellar Hackathon 2025** by a team of 5.

---

## ✨ Features

- 🔐 **JWT auth** (landlord / tenant / admin roles) with HttpOnly refresh cookies
- 🏘️ **Property + unit CRUD** with photo uploads (Cloudflare R2)
- 🗺️ **Map-based search** (Leaflet + OpenStreetMap) with radius + filter
- 📝 **Application flow** — apply, approve, reject with email notifications
- 🤖 **Automated rent collection** via Soroban smart contract on Stellar
- 💵 **USDC escrow** — stable-value, cross-border, 3–5s finality, $0.00001/tx
- 🛡️ **Locked deposit** returned automatically at lease end (7-day inspection window)
- 📊 **Immutable payment history** verifiable on-chain via Stellar Expert
- 📧 **Email receipts** to both parties on every payment
- 📱 **Mobile-first** UI (works at 360px viewport)

---

## 🧰 Tech Stack

| Layer    | Tech                                                                 |
|----------|----------------------------------------------------------------------|
| Frontend | React 18 · TypeScript 5 · Vite 5 · Tailwind CSS · shadcn/ui · Zustand · TanStack Query · Leaflet · Axios |
| Backend  | Node.js 20 · Express 4 · TypeScript 5 · Sequelize 6 · PostgreSQL 15 · Redis · Multer · Resend |
| Blockchain | Stellar Soroban (Rust → WASM) · USDC (SEP-41) · @stellar/stellar-sdk |
| DevOps   | GitHub Actions · Vercel · Railway · Upstash · Cloudflare R2 · Better Stack |

---

## 📁 Repository Structure

```
nyumbachain/
├── frontend/                    # React 18 + TypeScript SPA (Dev 1 + Dev 2)
│   ├── src/
│   │   ├── components/
│   │   │   ├── property/        # PropertyCard, PhotoGallery, UnitCard
│   │   │   ├── search/          # SearchBar, FilterPanel, MapView, MarkerPopup
│   │   │   ├── wallet/          # WalletBalance, EscrowTopUp, PaymentHistoryTable
│   │   │   └── shared/          # Button, Input, Badge, Skeleton, ErrorBoundary
│   │   ├── pages/               # one file per route
│   │   ├── hooks/               # useSearch, useWallet, useAuth, useGeoLocation
│   │   ├── stores/              # authStore.ts, walletStore.ts  (Zustand)
│   │   ├── services/            # api.ts (axios instance), stellar.ts
│   │   ├── utils/               # stroops.ts, formatCurrency.ts, dates.ts
│   │   ├── types/               # shared TypeScript types
│   │   └── assets/              # static images, icons
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── index.html
│   └── .env.example
│
├── backend/                     # Node.js + Express API (Dev 3 + Dev 4)
│   ├── src/
│   │   ├── routes/              # auth, properties, units, applications, tenancies, payments, wallet
│   │   ├── controllers/         # one controller per domain
│   │   ├── models/              # Sequelize ORM: User, Property, Unit, Tenancy, Payment, Application
│   │   ├── services/
│   │   │   ├── stellar.service.ts   # contract calls, balance queries, event listener
│   │   │   ├── email.service.ts     # Resend transactional email
│   │   │   └── storage.service.ts   # Cloudflare R2 photo uploads
│   │   ├── jobs/
│   │   │   └── payment.cron.ts  # daily 00:05 UTC rent execution
│   │   ├── middleware/          # auth.ts, validate.ts, rateLimit.ts, error.ts
│   │   ├── config/              # database, stellar, redis
│   │   ├── utils/               # stroops, logger
│   │   ├── db/
│   │   │   ├── migrations/
│   │   │   └── seeders/
│   │   ├── app.ts
│   │   └── server.ts
│   ├── package.json
│   ├── tsconfig.json
│   └── .env.example
│
├── contracts/                   # Soroban Smart Contracts (Dev 5)
│   ├── escrow/
│   │   ├── src/lib.rs           # main escrow contract
│   │   └── Cargo.toml
│   ├── deposit/
│   │   ├── src/lib.rs           # deposit hold & dispute contract
│   │   └── Cargo.toml
│   ├── tests/                   # integration tests against Testnet
│   └── Cargo.toml               # workspace
│
├── docs/                        # ADRs, diagrams, deep dives
│   ├── ARCHITECTURE.md
│   ├── API.md
│   ├── SMART_CONTRACTS.md
│   ├── DATABASE.md
│   └── DEPLOYMENT.md
│
├── .github/workflows/           # ci.yml, deploy.yml
├── .env.example                 # template for environment variables
├── .gitignore
├── docker-compose.yml           # local Postgres + Redis
└── README.md
```

---

## 👥 Team & Ownership

| Member | Role               | Owns                                                         |
|--------|--------------------|--------------------------------------------------------------|
| Dev 1  | Frontend Lead      | React app shell, routing, search + Leaflet map, shared UI   |
| Dev 2  | Frontend / UX      | Dashboards (landlord + tenant), wallet UI, forms, mobile     |
| Dev 3  | Backend Lead       | Express API, PostgreSQL schema, auth, file uploads, Stellar SDK |
| Dev 4  | Backend / DevOps   | Payment cron, Redis, CI/CD, Railway/Vercel, monitoring       |
| Dev 5  | Smart Contract Lead| Soroban escrow + deposit contracts (Rust), Testnet deploy    |

---

## 🚀 Quick Start

### Prerequisites

- **Node.js 20+** and **npm 10+**
- **Rust** (latest stable) + `wasm32-unknown-unknown` target
- **Stellar CLI** — https://developers.stellar.org/docs/tools/developer-tools
- **Docker** (for local Postgres + Redis) — optional but recommended
- **PostgreSQL 15+** and **Redis 7+** if not using Docker

### 1. Clone & install

```bash
git clone https://github.com/okelo0121/nyumbachain.git
cd nyumbachain
```

### 2. Start local infrastructure

```bash
docker compose up -d        # Postgres on :5432, Redis on :6379
```

### 3. Backend setup

```bash
cd backend
cp .env.example .env       # fill in real values
npm install
npx sequelize-cli db:migrate
npx sequelize-cli db:seed:all
npm run dev                # http://localhost:4000
```

### 4. Frontend setup

```bash
cd ../frontend
cp .env.example .env       # set VITE_API_URL=http://localhost:4000
npm install
npm run dev                # http://localhost:5173
```

### 5. Smart contract setup (Testnet)

```bash
cd ../contracts
cargo build --target wasm32-unknown-unknown --release
stellar contract optimize --wasm target/wasm32-unknown-unknown/release/nyumbachain_escrow.wasm
stellar contract deploy --wasm target/wasm32-unknown-unknown/release/nyumbachain_escrow.optimized.wasm --network testnet
```

---

## 🌍 Live Demo (Testnet)

- **Frontend:** https://nyumbachain.vercel.app
- **Service account:** [`GBMEIKTNFKWEMSAWM7Z7DOZFOXRUXVSZHZEY6PBDBTXMG7ZKLCJUZVUU`](https://stellar.expert/explorer/testnet/account/GBMEIKTNFKWEMSAWM7Z7DOZFOXRUXVSZHZEY6PBDBTXMG7ZKLCJUZVUU)
- **USDC contract (testnet):** [`CBIELTK6YBZJU5UP2WWQEUCYKLPU6AUNZ2BQ4WWFEIE3USCIHMXQDAMA`](https://stellar.expert/explorer/testnet/contract/CBIELTK6YBZJU5UP2WWQEUCYKLPU6AUNZ2BQ4WWFEIE3USCIHMXQDAMA)
- **Escrow contracts:** deployed per-tenancy — each approved lease creates a new contract instance on-chain. Browse live instances via the service account link above.

---

## 📦 Smart Contract Deployment

NyumbaChain uses a **one contract per tenancy** model. There is no single pre-deployed master contract. Every time a landlord approves a rental application, the backend:

1. Uploads the compiled WASM to Stellar testnet (if not already cached)
2. Creates a new contract instance from that WASM
3. Calls `initialize()` with this tenancy's specific values — landlord address, tenant address, monthly rent, deposit, and payment day
4. Stores the resulting contract ID in the database as `escrow_contract_id`

This means each tenant's deposit is **isolated in its own contract** — a bug or dispute in one tenancy cannot affect any other.

### Contract WASM

| Item | Value |
|---|---|
| Language | Rust → WASM (Soroban SDK v21) |
| Source | `contracts/src/` |
| Compiled WASM | `contracts/target/wasm32-unknown-unknown/release/nyumbachain_escrow.wasm` |
| Optimized WASM | Run `make optimize` in `contracts/` to produce `.optimized.wasm` |

### Deployed escrow contract functions

| Function | Caller | Description |
|---|---|---|
| `initialize()` | Backend (on approval) | Sets landlord, tenant, rent, deposit, payment day |
| `deposit_funds(amount)` | Tenant (via backend fee-bump) | Tenant sends USDC into escrow |
| `execute_payment()` | Backend cron (daily) | Releases rent from escrow to landlord |
| `terminate()` | Backend (landlord triggers) | Marks lease ended, starts 7-day inspection |
| `release_deposit()` | Backend (landlord triggers) | Returns deposit to tenant after inspection |
| `claim_deposit(reason)` | Backend (landlord triggers) | Sends deposit to landlord, records reason on-chain |
| `get_balance()` | Anyone (view) | Returns current USDC balance in escrow |
| `get_payment_history()` | Anyone (view) | Returns last 24 payment records |

### Service account setup (testnet)

The backend signs all contract transactions using `STELLAR_SERVICE_SECRET`. This account must be funded before contracts can be deployed:

```bash
# 1. Fund with testnet XLM (one time)
curl "https://friendbot.stellar.org/?addr=GBMEIKTNFKWEMSAWM7Z7DOZFOXRUXVSZHZEY6PBDBTXMG7ZKLCJUZVUU"

# 2. Build and optimize the contract WASM
cd contracts && make optimize

# 3. Start the backend — contracts deploy automatically on lease approval
cd ../backend && npm run dev
```

> The service account also acts as a testnet USDC faucet. Tenants can click **"Get 2,000 Test USDC"** in the wallet UI to receive test funds for the demo.

---

## 💡 The Problem We Solve

| Problem                     | NyumbaChain Solution                                        |
|-----------------------------|-------------------------------------------------------------|
| Late rent                   | Soroban contract auto-releases rent on payment day          |
| Deposit disputes            | Deposit locked in contract, returned at lease end           |
| Cross-border friction       | USDC on Stellar — 5s, $0.00001, works across Africa          |
| No audit trail              | Immutable on-chain payment history                          |
| Trust gap between strangers | Verifiable credit history from immutable records            |

---

## 🔐 Security Non-Negotiables

- **Never commit** `.env` files or any Stellar secret key.
- Access tokens live in **Zustand memory only** (never `localStorage`).
- Refresh tokens are **HttpOnly cookies** set by the backend.
- All Stellar secret keys are stored in **environment variables / secrets manager only**.
- Smart contract admin keypair controls payment execution — treat it like a bank PIN.
- The `STELLAR_SERVICE_SECRET` is rotated by revoking and re-issuing on any leak.

---

## 📜 License

MIT — see [LICENSE](./LICENSE).

---

## 🙏 Acknowledgments

- **Stellar Development Foundation** — for Soroban and the hackathon
- **Web3Bridge** — for the cohort and mentorship
- **OpenStreetMap contributors** — for free, open geodata

> Build something the judges cannot forget. Real local problem + genuine blockchain utility + working live demo = winning hackathon project.
