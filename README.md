
# FomeOn Starter

FomeOn Starter is a simple food-delivery MVP inspired by apps like iFood.

It includes:
- `backend/` — Node.js + Express API
- `web/` — Web landing page connected to the API
- `mobile/` — Expo React Native app (MVP)

## Project structure

This repo is split into three parts so you can work on web and mobile independently while sharing the same backend.

## Run Backend + Web

The backend also serves the web app on the same port.

```bash
cd backend
npm install
npm start
```

Then open:
- `http://localhost:4000` (web app)
- `http://localhost:4000/api/health` (health check)

## Run Mobile

```bash
cd mobile
npm install
npm start
```

## API endpoints (MVP)

- `GET /api/health`
- `GET /api/restaurants?search=&category=&sort=`
- `GET /api/restaurants/:id`
- `GET /api/restaurants/:id/menu`
- `GET /api/offers`
- `POST /api/cart/quote`
- `POST /api/orders`

## Notes

- The web logo is loaded from `web/assets/logo/`.
- Most data is mock data for MVP development.
