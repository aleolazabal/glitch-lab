# GlitchLab — VideoSynth XL Pro Lab

Web-based video effects lab: camera or upload, real-time WebGL effects, record and download.

## Features

- **Source**: Camera or upload video file
- **Effects**: Glitch, pixelate, RGB shift, feedback, hue, palette, sat/bright/contrast, bloom, swirl, ripple, warp, poster, displace, scanlines, invert, strobe, mirror, edge, solarize, slit-scan; plus chromatic aberration, vignette, film grain
- **Resolution**: 720p / 1080p / 4K internal render
- **Record**: Capture canvas (with effects) as WebM
- **Download**: Save last recording
- **Auth**: Supabase email/password (required)
- **Pro Subscription**: $5/month via Stripe — unlocks premium features

## Run locally

Open `v2.html` or `index.html` in a browser (HTTPS or localhost required for camera).

## Setup

### 1. Supabase (Auth + Database)

1. Create a project at [supabase.com](https://supabase.com)
2. In **SQL Editor**, run the migration in the plan to create the `profiles` table
3. Note your **Project URL**, **anon key**, and **service_role key** from Settings > API
4. Update the `AUTH_CONFIG` in `v2.html` with your Supabase URL and anon key

### 2. Stripe (Payments)

1. Create an account at [stripe.com](https://stripe.com)
2. Create a Product: "GlitchLab Pro" with a $5/month recurring price
3. Note the **Price ID** (`price_...`), **Publishable key** (`pk_...`), **Secret key** (`sk_...`)

### 3. Deploy (CI/CD via Vercel)

1. Push this repo to GitHub
2. Create a project at [vercel.com](https://vercel.com) linked to the repo
3. Add environment variables in Vercel dashboard:
   - `STRIPE_SECRET_KEY`
   - `STRIPE_PRICE_ID`
   - `STRIPE_WEBHOOK_SECRET`
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
4. In GitHub repo **Settings > Secrets**, add:
   - `VERCEL_TOKEN` (from [vercel.com/account/tokens](https://vercel.com/account/tokens))
   - `VERCEL_ORG_ID` and `VERCEL_PROJECT_ID` (from Vercel project settings)
5. Pushing to `main` auto-deploys via [.github/workflows/deploy.yml](.github/workflows/deploy.yml)

### 4. Stripe Webhook

1. In Stripe Dashboard > Webhooks, add endpoint: `https://your-app.vercel.app/api/webhook`
2. Listen for: `checkout.session.completed`, `customer.subscription.deleted`
3. Copy the webhook signing secret to the `STRIPE_WEBHOOK_SECRET` env var in Vercel
