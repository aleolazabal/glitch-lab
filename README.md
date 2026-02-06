# GlitchLab — VideoSynth XL Pro Lab

Web-based video effects lab: camera or upload, real-time WebGL effects, record and download.

## Features

- **Source**: Camera or upload video file
- **Effects**: Glitch, pixelate, RGB shift, feedback, hue, palette, sat/bright/contrast, bloom, swirl, ripple, warp, poster, displace, scanlines, invert, strobe, mirror, edge, solarize, slit-scan; plus chromatic aberration, vignette, film grain
- **Resolution**: 720p / 1080p / 4K internal render
- **Record**: Capture canvas (with effects) as WebM
- **Download**: Save last recording
- **Auth** (optional): Supabase — set `window.__GLITCHLAB_AUTH__` before load to enable

## Run locally

Open `v2.html` or `index.html` in a browser (HTTPS or localhost required for camera).

## Deploy (CI/CD)

1. Push this repo to GitHub.
2. **Vercel**: Create a project at [vercel.com](https://vercel.com) linked to the repo (auto-deploys), or use the GitHub Action:
   - In repo **Settings > Secrets**, add `VERCEL_TOKEN` (from [vercel.com/account/tokens](https://vercel.com/account/tokens)).
   - Optionally add `VERCEL_ORG_ID` and `VERCEL_PROJECT_ID` from your Vercel project.
   - Pushing to `main` runs [.github/workflows/deploy.yml](.github/workflows/deploy.yml) and deploys to Vercel.

## Enable auth (Supabase)

Before loading the app, set:

```js
window.__GLITCHLAB_AUTH__ = {
  enabled: true,
  supabaseUrl: 'https://YOUR_PROJECT.supabase.co',
  supabaseAnonKey: 'YOUR_ANON_KEY',
  requireAuth: false  // true to force login before using the app
};
```

Then open the page. Login / Sign up and Log out appear in the header.
# glitch-lab
