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
- **Testnet contract:** https://stellar.expert/explorer/testnet/contract/REPLACE_WITH_DEPLOYED_ID

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
