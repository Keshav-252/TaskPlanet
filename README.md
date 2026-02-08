# TaskPlanet — Social Feed (Frontend + Backend)

Small social feed example with a React + Vite frontend and an Express + MongoDB backend.

## Overview
- Frontend: Vite + React (client SPA). Routes: `/` (feed), `/login`, `/signup`.
- Backend: Express API with MongoDB (posts, users, auth via JWT). File uploads stored under `Backend/uploads`.

## Prerequisites
- Node.js (18+ recommended)
- npm or yarn
- MongoDB running locally (or a reachable Mongo URI)

## Quick start (development)
1. Backend
   - cd Backend
   - copy `.env.example` to `.env` and fill values (see Environment)
   - npm install
   - node index.js

2. Frontend
   - cd frontend
   - npm install
   - npm run dev
   - Open http://localhost:5173 (Vite default) or the URL shown by Vite

## Environment variables
Place secret/config values in `.env` files (do NOT commit `.env`).

Backend `.env` (example)
```
MONGO_URI=mongodb://127.0.0.1:27017/tp
JWT_SECRET=your-jwt-secret
PORT=8912
```

Frontend `.env` (optional)
```
VITE_API_URL=http://localhost:3001
```

Note: Vite only exposes env vars prefixed with `VITE_` to client code.

## Build (production)
- Frontend: `cd frontend && npm run build` (outputs to `frontend/dist`)
- Backend: deploy as a Node process; ensure `MONGO_URI` and `JWT_SECRET` are set in the environment.

## Project structure (high level)

- Backend/
  - index.js — Express server and API routes
  - model/ — Mongoose models (User, Post)
  - middleware/ — auth middleware
  - uploads/ — static file host for uploaded images

- frontend/
  - src/ — React app (components, pages, styles)
  - public/ — static assets (icons)
  - vite.config.js, package.json

## Notes & recommendations
- Do NOT commit `.env` or other secrets. Use `.env.example` and GitHub secrets for CI.
- Add a CI workflow to run lint/build on pull requests.
- Consider adding `jsconfig.json` for path aliases and improving imports.

## License
This project is licensed under the MIT License — see `LICENSE`.

