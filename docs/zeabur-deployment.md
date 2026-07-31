# Deploy Ember Home to Zeabur

Ember Home is deployed as a static Vite application. `zbpack.json` declares
`dist` as the static output directory, so Zeabur can build with Node.js and
serve the result with its static Caddy runtime.

## First deployment

1. In Zeabur, create or open a project.
2. Add a service from GitHub and select `linlinq040-del/polaris-local-first`.
3. Select the branch intended for preview or production.
4. Keep the repository root as the service root directory.
5. Confirm the build command is `npm run build` and output directory is `dist`.
6. Add `ELECTRON_SKIP_BINARY_DOWNLOAD=1` as a build environment variable. The
   PWA does not need the inherited desktop Electron runtime.
7. Generate a `zeabur.app` domain and wait for the HTTPS deployment to finish.

Zeabur automatically falls back to `index.html` for SPA routes. Files copied
from `public/` include `_headers`, the Web manifest, icons, and service worker.

## Verification

- Open the HTTPS domain and confirm the living room appears.
- Enter chat and return to the living room.
- On iPhone/iPad Safari, choose **Share → Add to Home Screen**.
- Launch the installed app once online, close it, disable networking, and
  confirm the previously loaded living room shell opens.
- Confirm failed API requests remain failures; the service worker never caches
  `/api/` responses or non-GET actions.

## Deployment behavior

Zeabur redeploys whenever the connected branch receives a push. Use the
foundation branch for preview until its draft pull request is approved; use
`main` only after merge.
