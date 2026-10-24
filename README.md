# Worldweaver

Next.js app for AI Builders Day. Deploys to **Vercel** with a **Turso** (libSQL/SQLite) database.

## Getting started

```bash
cp .env.example .env.local
# Edit .env.local — at minimum set BETTER_AUTH_SECRET and AGENTICORG_API_KEY
npm install
npm run db:push
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

For local DB, `DATABASE_URL=file:./local.db` is enough (no auth token).

## Deploy to Vercel

1. Create a free Turso database: [turso.tech](https://turso.tech) → copy the `libsql://…` URL and auth token.
2. Push the schema:
   ```bash
   DATABASE_URL="libsql://…" DATABASE_AUTH_TOKEN="…" npm run db:push
   ```
3. Import the repo in [vercel.com/new](https://vercel.com/new) (or `npx vercel`).
4. Set these project env vars in Vercel:
   - `DATABASE_URL`
   - `DATABASE_AUTH_TOKEN`
   - `BETTER_AUTH_SECRET` (e.g. `openssl rand -base64 32`)
   - `BETTER_AUTH_URL` (your production URL, e.g. `https://your-app.vercel.app`)
   - `AGENTICORG_API_KEY`
   - `AGENTICORG_BASE_URL` (optional; defaults in code if unset)
5. Deploy. After the first deploy, set `BETTER_AUTH_URL` to the real URL if you used a placeholder, then redeploy.

The project-run API sets `maxDuration = 300` so the multi-agent pipeline has room to finish (needs a Vercel plan that allows 300s functions).
