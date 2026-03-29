# Push to Your GitHub Repos

You have **three separate repositories**. Push each folder to its own repo.

---

## 1. Backend → innovative-backend

```powershell
cd d:\Innovative_web\backend
git status
```

**If you see "not a git repository":**
```powershell
git init
git remote add origin https://github.com/Jagadeswar-Pati/innovative-backend.git
git add .
git commit -m "Backend: ready for push"
git branch -M main
git push -u origin main
```

**If it’s already a git repo with remote:**
```powershell
git add .
git status
git commit -m "Backend updates"
git push
```

---

## 2. Frontend → innovative-frontend

```powershell
cd d:\Innovative_web\frontend
git status
```

**If you see "not a git repository":**
```powershell
git init
git remote add origin https://github.com/Jagadeswar-Pati/innovative-frontend.git
git add .
git commit -m "Frontend: mobile responsive, wishlist, product page"
git branch -M main
git push -u origin main
```

**If it’s already a git repo:**
```powershell
git add .
git status
git commit -m "Frontend updates"
git push
```

---

## 3. Admin → innovative-admin

```powershell
cd d:\Innovative_web\admin
git status
```

**If you see "not a git repository":**
```powershell
git init
git remote add origin https://github.com/Jagadeswar-Pati/innovative-admin.git
git add .
git commit -m "Admin: ready for push"
git branch -M main
git push -u origin main
```

**If it’s already a git repo (e.g. already connected to innovative-admin):**
```powershell
git add .
git status
git commit -m "Admin updates"
git push
```

---

## Before every push

- Run **`git status`** and ensure no `.env` or secret files are listed.
- Your `.gitignore` in each folder should already exclude `.env` and `node_modules`.

---

## Repo URLs (for reference)

| App     | Repo URL |
|--------|----------|
| Backend | https://github.com/Jagadeswar-Pati/innovative-backend |
| Frontend | https://github.com/Jagadeswar-Pati/innovative-frontend |
| Admin | https://github.com/Jagadeswar-Pati/innovative-admin |

Admin is already hosted at **innovative-admin.vercel.app**; after you push, Vercel will deploy from the `innovative-admin` repo.
