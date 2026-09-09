export type AtlasObject = {
  id: string;
  name: string;
  type: string;
  distance?: string;
  status: string;
  description?: string;
  ra?: number;
  dec?: number;
  source: string;
  sourceUrl?: string;
  metadata?: Record<string, string | number | null>;
};

const NASA_TAP = 'https://exoplanetarchive.ipac.caltech.edu/TAP/sync';
const SIMBAD_TAP = 'https://simbad.cds.unistra.fr/simbad/sim-tap/sync';

function finiteNumber(v: unknown) {
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
}

export async function nasaExoplanets(q: string, limit = 20): Promise<AtlasObject[]> {
  const esc = q.replace(/'/g, "''");
  const query = `select top ${Math.min(limit, 50)} pl_name,hostname,ra,dec,sy_dist,discoverymethod,disc_year,pl_rade,pl_masse,pl_orbper,st_teff from pscomppars where lower(pl_name) like lower('%${esc}%') or lower(hostname) like lower('%${esc}%') order by pl_name`;
  const url = `${NASA_TAP}?query=${encodeURIComponent(query)}&format=json`;
  const r = await fetch(url, { next: { revalidate: 900 } });
  if (!r.ok) throw new Error('NASA Exoplanet Archive unavailable');
  const rows = await r.json();
  return (rows as any[]).map((x) => ({
    id: `nea:${x.pl_name}`,
    name: x.pl_name,
    type: 'EXOPLANET',
    distance: x.sy_dist != null ? `${x.sy_dist} pc` : undefined,
    status: 'CONFIRMED',
    description: `Confirmed exoplanet orbiting ${x.hostname}.`,
    ra: finiteNumber(x.ra),
    dec: finiteNumber(x.dec),
    source: 'NASA Exoplanet Archive',
    sourceUrl: 'https://exoplanetarchive.ipac.caltech.edu/',
    metadata: {
      host: x.hostname,
      discovery_method: x.discoverymethod,
      discovery_year: x.disc_year,
      radius_re: x.pl_rade,
      mass_me: x.pl_masse,
      orbital_period_days: x.pl_orbper,
      stellar_temperature_k: x.st_teff,
    },
  }));
}

function normalizeSimbadType(raw: string): string {
  const t = (raw || '').toLowerCase();
  if (/qso|agn|sey|gal|bll|radio/.test(t)) return t.includes('qso') ? 'QUASAR' : 'GALAXY / AGN';
  if (/snr|hii|neb|rfn|dne|sfr|ism|cld|moc/.test(t)) return 'NEBULA / ISM';
  if (/cl\*|glc|opc|cluster/.test(t)) return 'STAR CLUSTER';
  if (/bh|black/.test(t)) return 'BLACK HOLE';
  if (/psr|pulsar/.test(t)) return 'PULSAR';
  if (/wd|white/.test(t)) return 'WHITE DWARF';
  if (/n\*|neutron/.test(t)) return 'NEUTRON STAR';
  if (/v\*|star|\*/.test(t)) return 'STAR';
  if (/sn|nova|trans/.test(t)) return 'TRANSIENT';
  return raw || 'ASTRONOMICAL OBJECT';
}

export async function simbad(q: string, limit = 20): Promise<AtlasObject[]> {
  const esc = q.replace(/'/g, "''");
  const adql = `SELECT TOP ${Math.min(limit, 50)} main_id,ra,dec,otype_txt FROM basic WHERE main_id LIKE '%${esc}%' OR ident.id LIKE '%${esc}%'`;
  const url = `${SIMBAD_TAP}?request=doQuery&lang=adql&format=json&query=${encodeURIComponent(adql)}`;
  const r = await fetch(url, { next: { revalidate: 1800 } });
  if (!r.ok) throw new Error('SIMBAD unavailable');
  const data = await r.json();
  const rows = data?.data || data?.results || [];
  return (rows as any[]).map((x) => ({
    id: `simbad:${x.main_id}`,
    name: x.main_id,
    type: normalizeSimbadType(x.otype_txt),
    status: 'CATALOGUED',
    description: 'Astronomical object resolved through the SIMBAD database.',
    ra: finiteNumber(x.ra),
    dec: finiteNumber(x.dec),
    source: 'SIMBAD / CDS',
    sourceUrl: 'https://simbad.cds.unistra.fr/simbad/',
    metadata: { simbad_type: x.otype_txt },
  }));
}

export async function searchAll(q: string): Promise<AtlasObject[]> {
  const tasks = await Promise.allSettled([nasaExoplanets(q), simbad(q)]);
  const combined = tasks.flatMap((r) => (r.status === 'fulfilled' ? r.value : []));
  const seen = new Set<string>();
  return combined.filter((x) => {
    const key = x.name.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  }).slice(0, 30);
}

export const featuredObjects: AtlasObject[] = [
  { id: 'sun', name: 'Sun', type: 'STAR', distance: '1 AU', status: 'CONFIRMED', description: 'The star at the center of the Solar System.', source: 'NASA / Solar System reference data' },
  { id: 'earth', name: 'Earth', type: 'PLANET', distance: '1 AU from Sun', status: 'CONFIRMED', description: 'The third planet from the Sun.', source: 'NASA / Solar System reference data' },
  { id: 'm31', name: 'Andromeda Galaxy', type: 'GALAXY', distance: '~2.5 million ly', status: 'CONFIRMED', description: 'A large spiral galaxy in the Local Group.', source: 'SIMBAD / CDS' },
  { id: 'm87star', name: 'M87*', type: 'BLACK HOLE', distance: '~55 million ly', status: 'INDIRECT DETECTION', description: 'The supermassive black hole at the center of M87.', source: 'EHT / published observations' },
  { id: 'orion', name: 'Orion Nebula', type: 'NEBULA', distance: '~1,300 ly', status: 'CONFIRMED', description: 'A nearby massive star-forming region.', source: 'SIMBAD / CDS' },
  { id: 'sag-a', name: 'Sagittarius A*', type: 'BLACK HOLE', distance: '~26,700 ly', status: 'INDIRECT DETECTION', description: 'The supermassive compact object at the Galactic Center.', source: 'EHT / Galactic Center observations' },
];
