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
