# Boardroom AI — Virtual CXO Board

A hiring-assignment-ready full-stack prototype where a CEO can run business questions through distinct CFO, CMO, COO and CSO agents, grounded in uploaded P&L/KPI/market data.

## Stack

- Frontend: React + Vite + TypeScript + Tailwind CSS
- Backend: Node.js + Express + TypeScript
- Database: MongoDB + Mongoose
- AI: OpenAI Responses API
- Data grounding: CSV / JSON ingestion, normalized into a board data context
- Sessions: persistent MongoDB board sessions and messages

## Architecture

CEO question
   |
   v
Boardroom Orchestrator
   |
   +--> CFO analysis
   +--> CMO analysis
   +--> COO analysis
   +--> CSO analysis
   |
   v
Cross-examination round
   |
   v
Chairperson synthesis
   |
   v
CEO-visible board transcript

The important design choice is that agents are not merely four independent chatbots.
Each executive receives the same verified company-data context but has a different system
mandate. The debate round explicitly exposes selected recommendations to the other agents
so disagreement can be generated from the same facts.

## Quick start

### 1. Prerequisites

- Node.js 20+
- MongoDB (local or Atlas)
- OpenAI API key

### 2. Backend

```bash
cd server
cp .env.example .env
npm install
npm run dev
```

### 3. Frontend

```bash
cd client
npm install
npm run dev
```

Open http://localhost:5173

## Environment

Server `.env`:

```env
PORT=4000
MONGODB_URI=mongodb://127.0.0.1:27017/boardroom_ai
OPENAI_API_KEY=your_key_here
OPENAI_MODEL=gpt-5-mini
CLIENT_URL=http://localhost:5173
```

## Demo data

The UI includes a "Load demo company data" button. It creates a realistic but fictional
company dataset with revenue, gross margin, operating expenses, CAC, churn, market share,
cash runway and competitor data.

## Supported uploads

JSON:
```json
{
  "company": "Acme",
  "period": "Q3 2026",
  "revenue": 12500000,
  "grossMargin": 0.41,
  "ebitdaMargin": 0.08,
  "cash": 18400000,
  "cac": 420,
  "churn": 0.037,
  "marketShare": 0.14
}
```

CSV:
```csv
metric,value,period
revenue,12500000,Q3 2026
grossMargin,0.41,Q3 2026
ebitdaMargin,0.08,Q3 2026
cac,420,Q3 2026
churn,0.037,Q3 2026
marketShare,0.14,Q3 2026
```

## Production hardening

For a production version, add:
- SSO/RBAC and tenant isolation
- audit logs
- encrypted company data at rest
- PII/secret scanning on uploads
- source-level citations for every factual claim
- model/evaluation tracing
- rate limits and spend controls
- approval workflow before financial recommendations become actions
- stronger structured schemas and automated evals
