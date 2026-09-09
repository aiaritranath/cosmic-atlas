export type AtlasObject = {id:string; name:string; type:string; distance?:string; status:string; description?:string; ra?:number; dec?:number; source:string; sourceUrl?:string; image?:string; metadata?:Record<string,string|number|null>};

const NASA_TAP='https://exoplanetarchive.ipac.caltech.edu/TAP/sync';
const SIMBAD_TAP='https://simbad.cds.unistra.fr/simbad/sim-tap/sync';

export async function nasaExoplanets(q:string, limit=12): Promise<AtlasObject[]> {
  const esc=q.replace(/'/g,"''");
  const query=`select top ${Math.min(limit,50)} pl_name,hostname,ra,dec,sy_dist,discoverymethod,disc_year,pl_rade,pl_masse,pl_orbper,st_teff from ps where default_flag=1 and (lower(pl_name) like lower('%${esc}%') or lower(hostname) like lower('%${esc}%')) order by pl_name`;
  const url=`${NASA_TAP}?query=${encodeURIComponent(query)}&format=json`;
  const r=await fetch(url,{next:{revalidate:900}}); if(!r.ok) throw new Error('NASA TAP unavailable');
  const rows=await r.json();
  return rows.map((x:any)=>({id:`nea:${x.pl_name}`,name:x.pl_name,type:'EXOPLANET',distance:x.sy_dist?`${x.sy_dist} pc`:'Data unavailable',status:'CONFIRMED',description:`Confirmed exoplanet orbiting ${x.hostname}.`,ra:x.ra,dec:x.dec,source:'NASA Exoplanet Archive',sourceUrl:'https://exoplanetarchive.ipac.caltech.edu/',metadata:{host:x.hostname,discovery_method:x.discoverymethod,discovery_year:x.disc_year,radius_re:x.pl_rade,mass_me:x.pl_masse,orbital_period_days:x.pl_orbper,stellar_temperature_k:x.st_teff}}));
}

export async function simbad(q:string, limit=12): Promise<AtlasObject[]> {
  const esc=q.replace(/'/g,"''");
  const adql=`SELECT TOP ${Math.min(limit,50)} main_id,ra,dec,otype_txt FROM basic WHERE id LIKE '%${esc}%' OR main_id LIKE '%${esc}%'`;
  const url=`${SIMBAD_TAP}?request=doQuery&lang=adql&format=json&query=${encodeURIComponent(adql)}`;
  const r=await fetch(url,{next:{revalidate:1800}}); if(!r.ok) throw new Error('SIMBAD unavailable');
  const data=await r.json();
  const rows=data?.data||data?.results||[];
  return rows.map((x:any)=>({id:`simbad:${x.main_id}`,name:x.main_id,type:x.otype_txt||'ASTRONOMICAL OBJECT',status:'CATALOGUED',description:'Object resolved through the SIMBAD astronomical database.',ra:Number(x.ra),dec:Number(x.dec),source:'SIMBAD / CDS',sourceUrl:'https://simbad.cds.unistra.fr/simbad/'}));
}
