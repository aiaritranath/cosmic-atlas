import {NextRequest,NextResponse} from 'next/server';
export async function GET(req:NextRequest){const q=req.nextUrl.searchParams.get('q')?.trim(); if(!q)return NextResponse.json({items:[]});
 const url=`https://images-api.nasa.gov/search?q=${encodeURIComponent(q)}&media_type=image&page_size=12`;
 const r=await fetch(url,{next:{revalidate:3600}}); if(!r.ok)return NextResponse.json({items:[]},{status:502}); const d=await r.json();
 const items=(d.collection?.items||[]).map((i:any)=>({title:i.data?.[0]?.title||'NASA image',description:i.data?.[0]?.description||'',date:i.data?.[0]?.date_created||null,href:i.links?.find((l:any)=>l.rel==='preview')?.href||i.links?.[0]?.href||null,source:'NASA Image and Video Library'})).filter((x:any)=>x.href);
 return NextResponse.json({items});
}
