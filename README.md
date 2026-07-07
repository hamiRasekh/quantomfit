# QuantumFit Web Platform

QuantumFit is a multi-panel gym platform with strict tenant isolation, subdomain-based routes, a Go backend, and Next.js frontends.

## Main Reference

- [QuantumFit platform architecture](docs/quantumfit-platform-architecture.md)

## Current Repo Shape

- `backend/` - Go API, modular clean architecture scaffold
- `frontend/` - frontend workspace that will be migrated to Next.js App Router apps
- `docs/` - architecture and implementation notes

## Target Panels

- `www.quantumfit.ir` - marketing website
- `gym.quantumfit.ir` - gym owner panel
- `coach.quantumfit.ir` - trainer panel
- `app.quantumfit.ir` - athlete app
- `admin.quantumfit.ir` - super admin panel

## Local Run

1. Start PostgreSQL:
   `docker compose up -d postgres`
2. Start the Go API:
   `cd backend && go run ./cmd/api`
3. Start the frontend workspace:
   `cd frontend && pnpm dev`

## Recommended Dev Start Order

Use this order when you want the full platform up locally:

1. Start Docker Desktop.
2. Start PostgreSQL:
   `docker compose up -d postgres`
3. Start the backend API:
   `cd backend`
   `go run ./cmd/api`
4. Start all five frontend apps together:
   `cd frontend`
   `pnpm dev`

## Local Ports

- `http://localhost:8080` - Go API
- `http://localhost:3000` - Marketing site
- `http://localhost:3001` - Gym panel
- `http://localhost:3002` - Coach panel
- `http://localhost:3003` - Athlete app
- `http://localhost:3004` - Super admin panel

## Quick Health Checks

- API health:
  `curl http://localhost:8080/healthz`
- Database:
  `docker ps`
- Frontend workspace:
  open the ports above in your browser

## If The API Does Not Start

1. Verify Docker is running.
2. Verify port `5432` is free.
3. Check backend logs by running:
   `cd backend && go run ./cmd/api`
4. If a migration fails, fix the seed or migration file and rerun.

## If The Frontend Feels Slow On First Load

Next.js dev mode can take a few seconds to compile each app the first time. Wait for the terminal to show `Ready`, then refresh the browser once.

## Useful Notes

- Backend default URL: `http://localhost:8080`
- Main app ports:
  - `www` -> `http://localhost:3000`
  - `gym` -> `http://localhost:3001`
  - `coach` -> `http://localhost:3002`
  - `app` -> `http://localhost:3003`
  - `admin` -> `http://localhost:3004`
- Login pages:
  - `www/login`
  - `gym/login`
  - `coach/login`
  - `app/login`
  - `admin/login`
- Demo credentials:
  - Admin: `admin@quantumfit.ir` / `Admin#2026`
  - Gym owner: `owner@demo-gym.ir` / `Owner#2026`
  - Trainer: `trainer@demo-gym.ir` / `Trainer#2026`
  - Athlete: `athlete@demo-gym.ir` / `Athlete#2026`

## Short-Term Next Steps

1. Wire the login forms to the auth endpoints.
2. Add edit/update flows for gym onboarding and admin controls.
3. Add SSE/WebSocket live updates for occupancy and check-ins.
