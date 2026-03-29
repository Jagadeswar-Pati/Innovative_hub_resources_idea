# Innovative Web - First-Time Setup Guide

Welcome! This guide helps you run the project after installing Cursor for the first time.

## Prerequisites

- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **MongoDB** - The project uses MongoDB Atlas (cloud). No local MongoDB needed.
- **Git** (optional) - For version control

## Project Structure

```
Innovative_web/
├── backend/               # Node.js + Express API (port 5000)
├── adminannel/            # Admin dashboard - Vite + React (port 8080)
├── e-commerce-foundation/ # User storefront - Vite + React (port 5174)
```

## Installation (Already Done)

Dependencies have been installed in all three folders:
- ✅ `backend` - npm install
- ✅ `adminanel` - npm install  
- ✅ `e-commerce-foundation` - npm install

## How to Run the Project

**Open 3 separate terminal windows** (or use Cursor's split terminals):

### Terminal 1 - Backend (must run first)
```powershell
cd d:\Innovative_web\backend
npm run dev
```
- Runs on **http://localhost:5000**
- Connects to MongoDB Atlas
- Creates default admin on first run

### Terminal 2 - Admin Dashboard
```powershell
cd d:\Innovative_web\adminannel
npm run dev
```
- Runs on **http://localhost:8080**
- Admin login: `admin@innovativehub.com` / `admin123`

### Terminal 3 - User Storefront
```powershell
cd d:\Innovative_web\e-commerce-foundation
npm run dev
```
- Runs on **http://localhost:5174**
- Main e-commerce site for customers

## Quick Start (One Command)

From project root, run all servers:
```powershell
# Start backend
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd d:\Innovative_web\backend; npm run dev"
# Start admin (after a few seconds)
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd d:\Innovative_web\adminannel; npm run dev"
# Start storefront
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd d:\Innovative_web\e-commerce-foundation; npm run dev"
```

## Environment Configuration

| Location | Key Variables | Status |
|----------|---------------|--------|
| `backend/.env` | MONGODB_URI, JWT_SECRET, CLOUDINARY_URL | ✅ Pre-configured |
| `adminanel/.env` | VITE_API_BASE_URL=http://localhost:5000/api | ✅ Set |
| `e-commerce-foundation/.env` | VITE_API_URL=http://localhost:5000 | ✅ Set |

## Admin Credentials

- **Email:** admin@innovativehub.com
- **Password:** admin123

## Optional Commands

```powershell
# Reset database & create admin
cd backend
npm run cleanup-db

# Seed admin only
npm run seed-admin
```

## Troubleshooting

| Issue | Solution |
|-------|----------|
| **Port already in use** | Close other apps using 5000, 8080, or 5174. Or change port in respective config. |
| **MongoDB connection failed** | Check internet. Verify `backend/.env` has valid MONGODB_URI. |
| **Frontend can't reach API** | Ensure backend is running first on port 5000. |
| **npm not found** | Install Node.js from nodejs.org and restart Cursor. |
| **PowerShell && error** | Use `;` instead of `&&` in PowerShell (e.g., `cd folder; npm run dev`). |

## Verification Checklist

- [ ] Node.js installed: `node -v` (should show v18+)
- [ ] Backend runs without errors
- [ ] Admin dashboard loads at http://localhost:8080
- [ ] Storefront loads at http://localhost:5174
- [ ] Can login to admin with provided credentials

---

**Need help?** Check `TESTING_INSTRUCTIONS.md` for API details and `PRODUCT_WORKFLOW_GUIDE.md` for workflows.
