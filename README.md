# Grupo ANGBU — website

Site institucional do Grupo ANGBU, Lda (Cabinda, Angola): Cab-Ração, Tchiowa Net, ATC, Angbu Empreitada, Angbu Telecom e Angbu Comércio.

Built with React + Vite, GSAP ScrollTrigger and Lenis smooth scrolling.

```bash
npm install
npm run dev      # local development
npm run build    # production build in dist/
npm run lint
```

- Content (companies, timeline, leadership, contacts): `src/data/site.ts`
- Media served by the site: `public/media/`
- The scroll-scrubbed company journey is rebuilt from the source clips with `python3 scripts/build-journey.py` (needs ffmpeg and the local `Option B/` folder).
- The company and hero clips are compressed with `scripts/encode-media.sh` (needs ffmpeg); run it on any new clip added to `public/media/`.

## Deploy

Every push to `main` builds the site and publishes it to GitHub Pages (`.github/workflows/deploy.yml`).
In the repository settings, under **Pages → Build and deployment**, the source must be **GitHub Actions**.

- The site's public address is `VITE_SITE_URL` in `.env`; it feeds the social previews and structured data.
- To serve from a custom domain such as `www.grupoangbu.com`, point its DNS at GitHub Pages, then add a
  repository variable `CUSTOM_DOMAIN` with that domain (Settings → Secrets and variables → Actions → Variables).
  The workflow then builds for the root path, sets `VITE_SITE_URL` to the domain and writes the `CNAME` file.
