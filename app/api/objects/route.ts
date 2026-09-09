import {NextResponse} from 'next/server';
export async function GET(){return NextResponse.json({data:[{id:'sun',canonical_name:'Sun',object_type:'star',confidence:'CONFIRMED'},{id:'earth',canonical_name:'Earth',object_type:'planet',confidence:'CONFIRMED'},{id:'proxima',canonical_name:'Proxima Centauri',object_type:'star',confidence:'CONFIRMED'}],count:3});}
