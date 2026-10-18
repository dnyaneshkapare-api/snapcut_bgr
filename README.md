# SnapCut AI

SnapCut AI is a neon pink and cyan/aqua SaaS workspace for removing image backgrounds. The React/Vite frontend includes a responsive dashboard, upload history, billing surfaces, API documentation, admin analytics, file validation, and a working browser-side quick-cut preview that exports a transparent PNG.

## Local development

```bash
pnpm install
pnpm dev
```

The app listens on port `3000` and the production build is generated with `pnpm build`.

## Integration path

The frontend is intentionally separated from provider credentials. Configure the public values from `.env.example` and keep all server-only keys in the deployment secret manager. The n8n workflow in `integrations/n8n-background-removal-workflow.json` accepts `fileUrl`, `userId`, and `originalName`, fetches the temporary Cloudinary file, calls the configured AI provider, uploads the result, inserts metadata in Supabase, and returns an expiring result URL. The schema in `integrations/supabase-schema.sql` covers uploads, credits, subscriptions, transactions, API keys, and logs.

For production, replace the local quick-cut adapter with the n8n webhook adapter behind the `BackgroundRemovalService` contract in `src/lib/services.ts`. Cloudinary should be configured with a 24-hour lifecycle rule, Supabase Auth should own signup/login and JWT sessions, and Razorpay webhooks should update subscription and transaction state through n8n.

## Deployment

For Vercel or Netlify, build with `pnpm build` and publish the `dist` directory. Keep the SPA fallback enabled so `/workspace`, `/history`, `/billing`, `/api-keys`, and `/admin` resolve to the app shell. Configure the production environment values from `.env.example` in the host secret manager. n8n, Supabase, Cloudinary, and Razorpay are external services and are not provisioned by this frontend repository.

## Product constraints

Uploads are limited to JPG, PNG, and WEBP, 10 MB maximum size, and 5000 × 5000 pixels. The product should not retain source or result images for more than 24 hours. The current browser preview is deliberately lightweight for product validation; provider-grade edge quality belongs to the configured AI service.
