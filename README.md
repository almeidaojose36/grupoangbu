# Grupo ANGBU — website

Site institucional do Grupo ANGBU, Lda (Cabinda, Angola): Cab-Ração, Tchiowa Net, ATC, Angbu Empreitada, Angbu Telecom e Angbu Comércio.

Built with React + Vite, GSAP ScrollTrigger and Lenis smooth scrolling.

```bash
npm install
npm run dev      # local development
npm run build    # production build in dist/
```

- Content (companies, timeline, leadership, contacts): `src/data/site.ts`
- Media served by the site: `public/media/`
- The scroll-scrubbed company journey is rebuilt from the source clips with `python3 scripts/build-journey.py` (needs ffmpeg and the local `Option B/` folder).
