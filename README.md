# COSMIC ATLAS — Vercel Edition v2

A scientifically responsible interactive 3D atlas of known and catalogued astronomical objects.

## What changed in v2
- Expanded 3D scene: Solar System, nearby stars, nebulae, star clusters, galaxies, quasars and black-hole visualizations.
- Logarithmic visual navigation across astronomical scales.
- Real public-data search through the NASA Exoplanet Archive and SIMBAD/CDS.
- NASA Image and Video Library media search with source metadata.
- Explicit separation between catalogue observations and procedural 3D visualization.
- Layer controls for major celestial object families.
- Mobile layout optimized for touch.

## Scientific responsibility
The 3D background and object renderings are visualization layers, not telescope photographs. Real catalogue records should retain their source and unknown values are not invented. SIMBAD provides object identification and basic astronomical data; it is not itself a replacement for every specialized catalogue. Use authoritative specialized catalogues for ingestion at scale.

## Deploy to Vercel
1. Push this repository to GitHub.
2. Import it into Vercel.
3. Keep the framework as Next.js.
4. Deploy.

No secret is required for the current public-data MVP.

## Local development
```bash
npm install
npm run dev
```
Then open http://localhost:3000.

## API
- `GET /api/search?q=andromeda`
- `GET /api/object/{name}`
- `GET /api/images?q=Orion%20Nebula`

## Data sources
NASA Exoplanet Archive TAP; SIMBAD/CDS; NASA Image and Video Library.
