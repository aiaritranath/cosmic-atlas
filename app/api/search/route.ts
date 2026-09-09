import {NextRequest,NextResponse} from 'next/server';
import {nasaExoplanets,simbad} from '@/lib/catalogs';
export async function GET(req:NextRequest){const q=req.nextUrl.searchParams.get('q')?.trim()||''; if(q.length<2)return NextResponse.json({results:[]});
  const [ex,si]=await Promise.allSettled([nasaExoplanets(q,10),simbad(q,10)]);
  const results=[...(ex.status==='fulfilled'?ex.value:[]),...(si.status==='fulfilled'?si.value:[])];
  return NextResponse.json({results:results.slice(0,20),sources:['NASA Exoplanet Archive','SIMBAD / CDS']},{headers:{'Cache-Control':'s-maxage=900, stale-while-revalidate=3600'}});
}
