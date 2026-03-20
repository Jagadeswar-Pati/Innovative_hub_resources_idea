# Resources & Ideas Hub

Modular, isolated Resources Hub for InnoHub. Connects students, mentors, and innovators for collaboration (free or paid).

## Structure

```
Innovative_web/
├── backend/              # Main e-shop backend
├── resources-hub-api/    # Resources Hub backend (port 5001) – separate from main backend
│   └── src/modules/resourcesHub/...
├── resourcesi/           # Resources Hub frontend (port 5174)
└── ...
```

## Quick Start

### Backend (resources-hub-api)

```bash
cd resources-hub-api
cp .env.example .env
# Copy MONGODB_URI from backend/.env - data goes to separate DB "resources_hub"
# Also set: CLOUDINARY_*, RESOURCES_JWT_SECRET, RESOURCES_ADMIN_SECRET
npm install
npm run dev
```

### Seed (dummy data for testing)

```bash
cd resources-hub-api
npm run seed
# Creates 5 users, 10 posts (3 paid), 5 comments in "resources_hub" database
# Users: alex@test.com, sarah@test.com, raj@test.com, emma@test.com, james@test.com
# Password for all: password123
```

### Frontend

```bash
cd resourcesi
cp .env.example .env.local
# Set VITE_RESOURCES_API_URL=http://localhost:5001/api/resources
npm install
npm run dev
```

## Features

- **Posts**: Create, edit, delete. Free or Paid collaboration.
- **Paid flow**: 20% commission, 18% GST on commission. Escrow-protected.
- **Cloudinary**: Image uploads only (video disabled).
- **Temp users**: `resources_users` collection with JWT auth.
- **Admin**: `/admin/resources-hub` - posts, revenue, collaborations, ban user.

## Collections

- `resources_users`
- `resources_posts`
- `resources_comments`
- `resources_likes`
- `resources_collaborations`
- `resources_transactions`

**Note:** The backend has been moved out of `resourcesi/` to `resources-hub-api/` at project root (separate from main `backend/`).

## Admin Panel

Add to admin `.env`:
- `VITE_RESOURCES_ADMIN_API_URL=http://localhost:5001/api/resources/admin`
- `VITE_RESOURCES_ADMIN_KEY=<matches RESOURCES_ADMIN_SECRET>`
