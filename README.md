# OmniSpark Engage

A multi-tenant marketing platform for email and SMS campaigns, automation, and analytics.

---

## Tech Stack

- **Frontend**: Next.js 14, Tailwind CSS, ShadCN UI
- **Backend**: NestJS, TypeORM, PostgreSQL, Redis, BullMQ
- **Deployment**: Vercel (frontend), Railway / Render (backend)

---

## Quick Start

### Prerequisites

- Node.js v18+
- PostgreSQL (v12+)
- Redis (v6+)

### Setup

1. **Clone the repo**
   ```bash
   git clone https://github.com/kimeunashon0-Bs/omnispark-engage.git
   cd omnispark-engage
   ```

2. **Backend**
   ```bash
   cd backend
   npm install
   cp .env.example .env   # set your DATABASE_URL, JWT_SECRET, REDIS_URL
   npm run start:dev       # runs on http://localhost:3001
   ```

3. **Frontend**
   ```bash
   cd ../frontend
   npm install
   cp .env.local.example .env.local   # set NEXT_PUBLIC_API_URL=http://localhost:3001
   npm run dev            # runs on http://localhost:3000
   ```

---

## Database & Redis

- Use **Docker** to run both quickly:
  ```bash
  docker-compose up -d
  ```
- Or install PostgreSQL and Redis locally.

---

## Deployment

- **Frontend**: on Vercel, set **Root Directory** to `frontend` and add `NEXT_PUBLIC_API_URL` as environment variable.
- **Backend**: deploy to Railway / Render, set the same environment variables, and use a managed PostgreSQL (Supabase) and Redis (Upstash) for production.

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register` | Register a new tenant + admin user |
| POST | `/auth/login` | Login → JWT token |
| GET | `/contacts` | List contacts (tenant‑scoped) |
| POST | `/campaigns` | Create a campaign |
| POST | `/campaigns/:id/send` | Send campaign via queue |

Full API documentation is in progress.

---

## License

MIT
```