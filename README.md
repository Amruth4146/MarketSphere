# MarketSphere

MarketSphere is a modern, scalable multi-vendor e-commerce marketplace platform built with React, Node.js, Express, MongoDB, Redis, and Elasticsearch.

---

## 📁 Project Directory Structure

```
MarketSphere/
├── client/                     # Frontend Application (React + Vite)
│   ├── src/
│   │   ├── components/         # Reusable UI components
│   │   ├── pages/              # Route view pages
│   │   ├── layouts/            # Page layouts
│   │   ├── hooks/              # Custom React hooks
│   │   ├── context/            # Global React context providers
│   │   ├── services/           # API services & HTTP clients
│   │   ├── utils/              # Frontend utilities & helpers
│   │   └── assets/             # Static frontend assets
│   ├── .env.example            # Client environment template
│   └── package.json            # Client dependencies and scripts
│
├── server/                     # Backend API Server (Node.js + Express)
│   ├── src/
│   │   ├── config/             # DB, Redis, Elasticsearch & Env config
│   │   ├── controllers/        # Request handlers
│   │   ├── models/             # Mongoose schemas & data models
│   │   ├── routes/             # API route definitions
│   │   ├── middleware/         # Auth, validation & error handling
│   │   ├── services/           # Business logic
│   │   ├── utils/              # Backend helper utilities
│   │   └── validators/         # Input validation schemas
│   ├── .env.example            # Server environment template
│   └── package.json            # Server dependencies and scripts
│
├── docs/                       # Technical Documentation
│   ├── architecture.md         # System architecture & data flow
│   ├── database-schema.md      # MongoDB, Redis, & Elasticsearch schemas
│   ├── api-documentation.md    # REST API endpoints & specs
│   └── testing-report.md       # Initialization audit & test strategy
│
├── assets/                     # Project-level static assets
├── README.md                   # Project documentation & setup guide
├── .gitignore                  # Git ignore rules
└── docker-compose.yml          # Container orchestration (MongoDB, Redis, Elasticsearch)
```

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18.x or later; v24.x recommended)
- [npm](https://www.npmjs.com/) (v9.x or later)
- [Docker](https://www.docker.com/) & Docker Compose

---

### 1. Start Infrastructure Services

Spin up MongoDB, Redis, and Elasticsearch using Docker Compose:

```bash
docker-compose up -d
```

To verify the services are running:
```bash
docker-compose ps
```

Services exposed:
- **MongoDB**: `localhost:27017`
- **Redis**: `localhost:6379`
- **Elasticsearch**: `localhost:9200`

---

### 2. Configure Environment Variables

#### Client Configuration:
```bash
cd client
cp .env.example .env
```

#### Server Configuration:
```bash
cd server
cp .env.example .env
```

---

### 3. Install Dependencies & Run

#### Server:
```bash
cd server
npm install
npm run dev
```
Server runs at: `http://localhost:5000` (Health check: `http://localhost:5000/health`)

#### Client:
```bash
cd client
npm install
npm run dev
```
Client runs at: `http://localhost:5173`

---

## 📖 Technical Documentation

- [System Architecture](docs/architecture.md)
- [Database Schema & Data Models](docs/database-schema.md)
- [REST API Documentation](docs/api-documentation.md)
- [Testing & Verification Report](docs/testing-report.md)

---

## 🔒 Security & Best Practices

- All secrets and credentials are kept out of source control using `.env` and `.gitignore`.
- Production-ready security headers configured via `helmet`.
- CORS policies configured between client and server.
- Modular code architecture separating concerns cleanly.

