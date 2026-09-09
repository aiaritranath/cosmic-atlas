import { NextResponse } from 'next/server';
import { featuredObjects, searchAll } from '../../../lib/catalogs';

export async function GET(request: Request) {
  const q = new URL(request.url).searchParams.get('q')?.trim() || '';
  if (q.length < 2) return NextResponse.json({ results: [] });
  try {
    const live = await searchAll(q);
    const featured = featuredObjects.filter((x) => x.name.toLowerCase().includes(q.toLowerCase()));
    return NextResponse.json({ results: [...featured, ...live].slice(0, 30), provenance: ['NASA Exoplanet Archive', 'SIMBAD / CDS'] });
  } catch {
    const featured = featuredObjects.filter((x) => x.name.toLowerCase().includes(q.toLowerCase()));
    return NextResponse.json({ results: featured, degraded: true });
  }
}
