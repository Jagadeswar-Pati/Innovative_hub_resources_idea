# Hosting Guide

This project has three deployable apps:
- `backend` (Node.js + Express API)
- `frontend` (Storefront - Vite + React)
- `admin` (Admin dashboard - Vite + React)

## 1) Deploy the backend (API)

Use a Node hosting provider (Render, Railway, VPS, etc.).

Build/Start commands:
- Build: `npm install`
- Start: `npm run start`

Required environment variables (production):
- `MONGODB_URI`
- `JWT_SECRET`
- `CLOUDINARY_URL`
- `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`
- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_CALLBACK_URL`
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`
- `FRONTEND_URL` (storefront base URL)
- `LOGIN_URL` (storefront login URL, optional)
- `ADMIN_EMAIL`, `ADMIN_PASSWORD` (initial admin seed)
- `CORS_ORIGIN` (comma-separated list of allowed frontends)

Recommended production settings:
- `NODE_ENV=production`
- `CORS_ORIGIN=https://store.example.com,https://admin.example.com`

## 2) Deploy the storefront (frontend)

Use a static hosting provider (Vercel, Netlify, Cloudflare Pages, etc.).

Build/Publish:
- Build: `npm install` then `npm run build`
- Publish directory: `dist`

Environment variables:
- `VITE_API_URL=https://api.example.com`
- `VITE_GOOGLE_CLIENT_ID=...`
- `VITE_RAZORPAY_KEY_ID=...`
- `VITE_CLOUDINARY_URL=...`

Note: `VITE_API_URL` should be the backend base URL without `/api`.

## 3) Deploy the admin dashboard

Use the same kind of static hosting as the storefront.

Build/Publish:
- Build: `npm install` then `npm run build`
- Publish directory: `dist`

Environment variables:
- `VITE_API_BASE_URL=https://api.example.com/api`

## 4) Final checks after deployment

- Confirm `CORS_ORIGIN` includes both storefront and admin URLs.
- Open the storefront and verify product listing loads.
- Open the admin panel and log in with the seeded admin account.
- Test password reset emails (requires SMTP settings).
