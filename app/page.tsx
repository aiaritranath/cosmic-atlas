'use client';

import dynamic from 'next/dynamic';
import { useEffect, useMemo, useState } from 'react';

const Universe = dynamic(() => import('../components/Universe'), { ssr: false });

type Obj = { id:string; name:string; type:string; distance?:string; status:string; description?:string; ra?:number; dec?:number; source:string; sourceUrl?:string; metadata?:Record<string,string|number|null> };

const featured: Obj[] = [
  {id:'sun',name:'Sun',type:'STAR',distance:'1 AU',status:'CONFIRMED',description:'The star at the center of the Solar System.',source:'NASA / Solar System reference data'},
  {id:'earth',name:'Earth',type:'PLANET',distance:'1 AU from Sun',status:'CONFIRMED',description:'The third planet from the Sun.',source:'NASA / Solar System reference data'},
  {id:'m31',name:'Andromeda Galaxy',type:'GALAXY',distance:'~2.5 million ly',status:'CONFIRMED',description:'A large spiral galaxy in the Local Group.',source:'SIMBAD / CDS'},
  {id:'m87star',name:'M87*',type:'BLACK HOLE',distance:'~55 million ly',status:'INDIRECT DETECTION',description:'The supermassive black hole at the center of M87.',source:'EHT / published observations'},
  {id:'orion',name:'Orion Nebula',type:'NEBULA',distance:'~1,300 ly',status:'CONFIRMED',description:'A nearby massive star-forming region.',source:'SIMBAD / CDS'},
];

const categories = ['SOLAR SYSTEM','STARS','EXOPLANETS','NEBULAE','CLUSTERS','GALAXIES','QUASARS','BLACK HOLES','PULSARS','SUPERNOVAE'];

export default function Home(){
  const [q,setQ]=useState(''); const [results,setResults]=useState<Obj[]>([]); const [obj,setObj]=useState<Obj>(featured[0]); const [images,setImages]=useState<any[]>([]); const [loading,setLoading]=useState(false); const [category,setCategory]=useState('ALL OBJECTS');
  useEffect(()=>{const t=setTimeout(async()=>{if(q.trim().length<2){setResults([]);return;} setLoading(true); try{const r=await fetch('/api/search?q='+encodeURIComponent(q)); const d=await r.json(); setResults(d.results||[]);}catch{setResults([]);}finally{setLoading(false);}},300); return()=>clearTimeout(t)},[q]);
  useEffect(()=>{fetch('/api/images?q='+encodeURIComponent(obj.name)).then(r=>r.json()).then(d=>setImages(d.items||[])).catch(()=>setImages([]))},[obj.name]);
  const filteredFeatured = useMemo(()=>category==='ALL OBJECTS'?featured:featured.filter(x=>x.type.includes(category.replace('EXOPLANETS','EXOPLANET').replace('NEBULAE','NEBULA').replace('CLUSTERS','CLUSTER'))),[category]);
  return <main className="atlas">
    <header className="topbar"><div className="brand"><span className="brandDot"/>COSMIC ATLAS</div><div className="searchWrap"><span>⌕</span><input className="search" placeholder="Search stars, galaxies, nebulae, black holes, exoplanets…" value={q} onChange={e=>setQ(e.target.value)}/>{q&&<button className="clear" onClick={()=>setQ('')}>×</button>}</div><button className="glassBtn">3D ATLAS</button></header>
    {(q||loading)&&<div className="results">{loading?<div className="loading">Querying verified astronomical services…</div>:results.length?results.map(x=><button className="result" key={x.id} onClick={()=>{setObj(x);setQ('')}}><strong>{x.name}</strong><small>{x.type} · {x.distance||'Distance unavailable'} · {x.source}</small></button>):<div className="loading">No verified catalogue match.</div>}</div>}
    <div className="leftRail"><div className="railTitle">OBJECT LAYERS</div><button className={category==='ALL OBJECTS'?'active':''} onClick={()=>setCategory('ALL OBJECTS')}>ALL OBJECTS</button>{categories.map(c=><button key={c} className={category===c?'active':''} onClick={()=>setCategory(c)}>{c}</button>)}</div>
    <div className="canvas"><Universe selected={obj} onSelect={(x)=>setObj({...obj,...x})}/></div>
    <aside className="panel"><div className="eyebrow">SELECTED OBJECT · VERIFIED SOURCE</div><h1>{obj.name}</h1><div><span className="pill">{obj.type}</span><span className="pill">{obj.status}</span></div><p>{obj.description||'Scientific record resolved from a public astronomical source.'}</p><div className="grid"><div className="stat"><b>{obj.distance||'Data unavailable'}</b><span>Distance</span></div><div className="stat"><b>{obj.ra??'Data unavailable'}</b><span>Right ascension</span></div><div className="stat"><b>{obj.dec??'Data unavailable'}</b><span>Declination</span></div><div className="stat"><b>{obj.metadata?.discovery_year??'Data unavailable'}</b><span>Discovery year</span></div></div>{obj.metadata&&<div className="meta">{Object.entries(obj.metadata).map(([k,v])=>v!==null&&v!==undefined?<div key={k}><span>{k.replaceAll('_',' ')}</span><b>{String(v)}</b></div>:null)}</div>}<div className="source"><span>SOURCE</span><strong>{obj.source}</strong>{obj.sourceUrl&&<a href={obj.sourceUrl} target="_blank" rel="noreferrer">Open source ↗</a>}</div>{images[0]?.href&&<div className="imageCard"><img src={images[0].href} alt={images[0].title||obj.name}/><div className="imageMeta"><b>NASA MEDIA RESULT</b><span>{images[0].title||'Untitled media'}</span><small>Media result — inspect original metadata for observation/image classification and credit.</small></div></div>}<div className="method">Procedural 3D rendering is a visualization layer. It is not a telescope photograph. Unknown measurements remain unavailable.</div></aside>
    <footer className="bottom"><div><b>{category}</b><span> · Logarithmic scale · GPU layered scene</span></div><div>Drag to orbit · pinch/scroll to zoom · search catalogues</div></footer>
    <div className="legend"><span><i className="dot star"/>Observed/catalogued</span><span><i className="dot model"/>Scientific visualization</span><span><i className="dot image"/>NASA media</span></div>
  </main>
}
