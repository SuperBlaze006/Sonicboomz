# Cloudflare Worker Deployment Guide for Blaze Music

This directory contains the standalone Cloudflare Edge Worker (`worker.js`) designed to run as your free backend API on Cloudflare's global edge network.

---

### Why Use this Cloudflare Worker?

1. **100% Free**: 100,000 requests/day per Cloudflare account.
2. **Rotating Anycast IPs**: Cloudflare routes every request through thousands of worldwide edge IP addresses, preventing single-server IP blocks by YouTube.
3. **Edge Caching**: Built-in 5-10 minute caching reduces upstream calls by over 80%.
4. **Zero Dependencies**: Pure Web Standards (`fetch`, `Request`, `Response`) — no Node.js libraries required.

---

### How to Deploy (Choose Option A or Option B)

#### Option A: Quick Paste in Cloudflare Dashboard (No tools needed, 60 seconds)
1. Log into your free [Cloudflare Dashboard](https://dash.cloudflare.com/).
2. Click **Workers & Pages** in the left sidebar.
3. Click **Create Application** -> **Create Worker**.
4. Name it `blaze-music-api` and click **Deploy**.
5. Click **Edit Code** (Quick Editor in your browser).
6. Copy the entire code from `cloudflare-worker/worker.js` and paste it, replacing everything.
7. Click **Save and Deploy**.
8. Cloudflare will give you a live URL like:
   `https://blaze-music-api.your-username.workers.dev`

#### Option B: Deploy with Wrangler CLI
```bash
cd cloudflare-worker
npx wrangler login
npx wrangler deploy
```

---

### Connecting to Your Frontend

Once deployed, open `src/lib/workerPool.ts` in this project and paste your worker URL into `WORKERS`:

```typescript
const WORKERS = [
  "https://blaze-music-api-1.your-account-1.workers.dev",
  "https://blaze-music-api-2.your-account-2.workers.dev" // Optional 2nd worker for 200k requests/day failover
];
```

If you deploy two free workers on two different Cloudflare accounts, the app automatically switches to the second one if the first ever hits the 100,000 daily request limit!
