import { NextResponse } from 'next/server';

const NASA_IMAGES = 'https://images-api.nasa.gov/search';

export async function GET(request: Request) {
  const q = new URL(request.url).searchParams.get('q')?.trim() || '';
  if (!q) return NextResponse.json({ items: [] });
  const url = `${NASA_IMAGES}?q=${encodeURIComponent(q)}&media_type=image&page_size=12`;
  const r = await fetch(url, { next: { revalidate: 3600 } });
  if (!r.ok) return NextResponse.json({ items: [] }, { status: 502 });
  const data = await r.json();
  const items = (data?.collection?.items || []).slice(0, 12).map((item: any) => ({
    nasaId: item?.data?.[0]?.nasa_id,
    title: item?.data?.[0]?.title,
    description: item?.data?.[0]?.description,
    date: item?.data?.[0]?.date_created,
    href: item?.links?.find((l: any) => l.rel === 'preview')?.href || item?.links?.find((l: any) => l.rel === 'image')?.href,
    sourceUrl: item?.href,
    center: item?.data?.[0]?.center,
    photographer: item?.data?.[0]?.photographer,
  })).filter((x: any) => x.href);
  return NextResponse.json({ items });
}
