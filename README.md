# COSMIC ATLAS — Vercel Edition

A scientifically responsible interactive astronomical atlas. This Vercel MVP queries real public astronomy services server-side and never exposes provider credentials in the browser.

## Live data sources
- NASA Exoplanet Archive TAP (`ps` / Planetary Systems)
- SIMBAD / CDS TAP for astronomical object resolution
- NASA Image and Video Library for media search

## Deploy to Vercel
1. Push this folder to GitHub.
2. Import the repository in Vercel.
3. Framework: Next.js (auto-detected).
4. No database or secret is required for the current public-data MVP.
5. Deploy.

## Local development
```bash
npm install
npm run dev
```
Open http://localhost:3000.

## API
- `GET /api/search?q=andromeda`
- `GET /api/object/{name}`
- `GET /api/images?q=Orion%20Nebula`

## Scientific policy
Procedural stars are explicitly visualization-only. Catalogue records come from external scientific services. Unknown values are not invented. Image results are media references and should retain their source metadata/credits.

## Next scale-up
For millions of records, add managed PostgreSQL/PostGIS, scheduled ingestion, object identity resolution, spatial indexes, object storage/CDN, and viewport-based streaming. Keep external source URL, catalogue ID, provenance, and synchronization timestamps on every imported record.
# cosmic-atlas
