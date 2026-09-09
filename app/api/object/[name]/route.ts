import { NextResponse } from 'next/server';
import { featuredObjects, searchAll } from '../../../../lib/catalogs';

export async function GET(_request: Request, { params }: { params: Promise<{ name: string }> }) {
  const { name } = await params;
  const decoded = decodeURIComponent(name);
  const featured = featuredObjects.find((x) => x.name.toLowerCase() === decoded.toLowerCase());
  if (featured) return NextResponse.json({ object: featured });
  try {
    const results = await searchAll(decoded);
    return NextResponse.json({ object: results[0] || null });
  } catch {
    return NextResponse.json({ object: null }, { status: 404 });
  }
}
