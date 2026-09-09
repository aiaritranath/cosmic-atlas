import { NextResponse } from 'next/server';
import { featuredObjects } from '../../../lib/catalogs';

const typeAliases: Record<string, string> = {
  galaxy: 'GALAXY', galaxies: 'GALAXY', star: 'STAR', stars: 'STAR', planet: 'PLANET', planets: 'PLANET',
  exoplanet: 'EXOPLANET', exoplanets: 'EXOPLANET', nebula: 'NEBULA', nebulae: 'NEBULA', cluster: 'CLUSTER', clusters: 'CLUSTER',
  'black hole': 'BLACK HOLE', 'black holes': 'BLACK HOLE', quasar: 'QUASAR', quasars: 'QUASAR', pulsar: 'PULSAR', pulsars: 'PULSAR'
};

export async function GET(request: Request) {
  const type = new URL(request.url).searchParams.get('type')?.trim().toLowerCase();
  const normalized = type ? typeAliases[type] : undefined;
  const data = normalized ? featuredObjects.filter((x) => x.type.includes(normalized)) : featuredObjects;
  return NextResponse.json({
    data,
    count: data.length,
    scope: 'featured visualization anchors',
    note: 'The complete universe is not loaded into the browser. Full-scale deployments should stream specialized catalogues by viewport.'
  });
}
