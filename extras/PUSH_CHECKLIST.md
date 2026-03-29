# Pre-push checklist

Use this before your first (or any) push to avoid committing secrets and noise.

- [ ] **No secrets in repo**  
  Ensure `.env`, `.env.local`, and any file with real keys/passwords are **not** staged.  
  (They are in `.gitignore`; run `git status` and confirm they don’t appear.)

- [ ] **Only one lockfile per app**  
  Each of `backend`, `frontend`, and `admin` should use either `package-lock.json` (npm) or `bun.lockb` (bun), not both in the same folder unless you intend to support both.

- [ ] **Build and run**  
  From repo root, run backend and frontend (and admin if you use it) and do a quick smoke test.

- [ ] **Optional**  
  Remove this file after your first successful push if you don’t need it.
