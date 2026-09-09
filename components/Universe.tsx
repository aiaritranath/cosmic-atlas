'use client';

import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Line, Text } from '@react-three/drei';
import * as THREE from 'three';
import { useEffect, useMemo, useRef } from 'react';

type Obj = { name: string; type: string; ra?: number; dec?: number; distance?: string };
type Props = { selected?: Obj; onSelect?: (obj: Obj) => void };

type Anchor = {
  name: string; type: string; ra: number; dec: number; distanceLy: number; color: string; size: number;
};

const ANCHORS: Anchor[] = [
  { name:'Sun', type:'STAR', ra:0, dec:0, distanceLy:0.000016, color:'#fff4c2', size:0.42 },
  { name:'Proxima Centauri', type:'STAR', ra:217.429, dec:-62.679, distanceLy:4.246, color:'#ffb07c', size:0.11 },
  { name:'Sirius', type:'STAR', ra:101.287, dec:-16.716, distanceLy:8.60, color:'#dceeff', size:0.13 },
  { name:'Betelgeuse', type:'STAR', ra:88.793, dec:7.407, distanceLy:640, color:'#ff8f6a', size:0.16 },
  { name:'Rigel', type:'STAR', ra:78.634, dec:-8.202, distanceLy:860, color:'#b9d9ff', size:0.14 },
  { name:'Andromeda Galaxy', type:'GALAXY', ra:10.6847, dec:41.269, distanceLy:2_500_000, color:'#a8c0ff', size:0.58 },
  { name:'M87*', type:'BLACK HOLE', ra:187.706, dec:12.391, distanceLy:55_000_000, color:'#c3a8ff', size:0.48 },
  { name:'Sagittarius A*', type:'BLACK HOLE', ra:266.417, dec:-29.008, distanceLy:26_700, color:'#b99bff', size:0.30 },
  { name:'Orion Nebula', type:'NEBULA', ra:83.822, dec:-5.391, distanceLy:1_340, color:'#d8a8ff', size:0.44 },
  { name:'Crab Nebula', type:'SUPERNOVA REMNANT', ra:83.633, dec:22.014, distanceLy:6_500, color:'#9fd7ff', size:0.32 },
  { name:'Pleiades', type:'STAR CLUSTER', ra:56.75, dec:24.117, distanceLy:444, color:'#b9d8ff', size:0.28 },
  { name:'Omega Centauri', type:'GLOBULAR CLUSTER', ra:201.697, dec:-47.479, distanceLy:16_000, color:'#fff0c0', size:0.30 },
  { name:'TON 618', type:'QUASAR', ra:201.445, dec:31.281, distanceLy:18_200_000_000, color:'#ffd59b', size:0.26 },
];

function raDecToDirection(ra: number, dec: number) {
  const a = THREE.MathUtils.degToRad(ra * 15);
  const d = THREE.MathUtils.degToRad(dec);
  return new THREE.Vector3(Math.cos(d) * Math.cos(a), Math.sin(d), Math.cos(d) * Math.sin(a));
}

function logRadius(ly: number) {
  if (ly < 0.001) return 0;
  return 2 + Math.log10(ly + 1) * 4.3;
}

function anchorPosition(a: Anchor) {
  const dir = raDecToDirection(a.ra, a.dec);
  const r = a.name === 'Sun' ? 0 : logRadius(a.distanceLy);
  return dir.multiplyScalar(r);
}

function RealisticStar({ a, selected, onClick }: { a: Anchor; selected: boolean; onClick: () => void }) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (!ref.current) return;
    const pulse = 1 + Math.sin(clock.getElapsedTime() * (a.type === 'STAR' ? 1.5 : .6)) * (a.type === 'STAR' ? .025 : .01);
    ref.current.scale.setScalar(pulse * (selected ? 1.2 : 1));
  });
  return <group position={anchorPosition(a)} onClick={(e) => { e.stopPropagation(); onClick(); }}>
    <mesh ref={ref}>
      <sphereGeometry args={[a.size, 48, 48]} />
      <meshStandardMaterial color={a.color} emissive={a.color} emissiveIntensity={a.type === 'STAR' ? 3.2 : 1.2} roughness={0.28} metalness={0.05} toneMapped={false} />
    </mesh>
    {a.type === 'STAR' && <pointLight intensity={2} distance={Math.max(3, a.size * 14)} color={a.color} />}
    {a.type === 'GALAXY' && <GalaxyCore color={a.color} />}
    {a.type === 'NEBULA' && <NebulaGlow color={a.color} />}
    {a.type === 'SUPERNOVA REMNANT' && <NebulaGlow color={a.color} />}
    {a.type.includes('CLUSTER') && <ClusterGlow color={a.color} />}
    {a.type === 'BLACK HOLE' && <BlackHoleVisual />}
    {a.type === 'QUASAR' && <QuasarJet />}
    <Text position={[0, a.size + 0.18, 0]} fontSize={selected ? .22 : .13} color={selected ? '#ffffff' : '#aebbd1'} anchorX="center" outlineWidth={0.02} outlineColor="#000000">{a.name}</Text>
  </group>;
}

function GalaxyCore({ color }: { color: string }) {
  const points = useMemo(() => Array.from({length: 700}, (_, i) => {
    const r = Math.pow(Math.random(), .72) * 1.15;
    const arm = (i % 4) * Math.PI / 2;
    const a = arm + r * 2.8 + (Math.random()-.5)*.45;
    return new THREE.Vector3(Math.cos(a)*r, (Math.random()-.5)*.16*(1-r/1.15), Math.sin(a)*r*.55);
  }), []);
  const geo = useMemo(() => { const g = new THREE.BufferGeometry(); g.setFromPoints(points); return g; }, [points]);
  return <points geometry={geo} rotation={[.28, .2, .0]}>
    <pointsMaterial color={color} size={.018} sizeAttenuation transparent opacity={.56} depthWrite={false} blending={THREE.AdditiveBlending} />
  </points>;
}

function NebulaGlow({ color }: { color: string }) {
  const points = useMemo(() => Array.from({length: 280}, () => new THREE.Vector3((Math.random()-.5)*1.7, (Math.random()-.5)*1.1, (Math.random()-.5)*1.2)), []);
  const geo = useMemo(() => { const g = new THREE.BufferGeometry(); g.setFromPoints(points); return g; }, [points]);
  return <points geometry={geo}>
    <pointsMaterial color={color} size={.05} transparent opacity={.09} depthWrite={false} blending={THREE.AdditiveBlending} />
  </points>;
}

function ClusterGlow({ color }: { color: string }) {
  const pts = useMemo(() => Array.from({length: 90}, (_, i) => { const t=i/90*Math.PI*2; const r=.45+Math.random()*.55; return [Math.cos(t)*r,(Math.random()-.5)*.3,Math.sin(t)*r] as [number,number,number]; }), []);
  return <>{pts.map((p,i)=><mesh key={i} position={p} scale={.018}><sphereGeometry args={[1,10,10]}/><meshBasicMaterial color={color} toneMapped={false}/></mesh>)}</>;
}

function BlackHoleVisual() {
  const ring = useRef<THREE.Mesh>(null);
  useFrame(({clock})=>{ if(ring.current) ring.current.rotation.z = clock.getElapsedTime()*.12; });
  return <group rotation={[Math.PI/2.25,0,0]}>
    <mesh><sphereGeometry args={[0.95,48,48]}/><meshBasicMaterial color="#000000"/></mesh>
    <mesh ref={ring} rotation={[Math.PI/2,0,0]}>
      <torusGeometry args={[1.22,.16,32,160]}/>
      <meshBasicMaterial color="#ffb16e" transparent opacity={.42} blending={THREE.AdditiveBlending} toneMapped={false}/>
    </mesh>
    <mesh rotation={[Math.PI/2,0,0]} scale={[1.45,.42,1]}>
      <torusGeometry args={[1.25,.12,24,160]}/>
      <meshBasicMaterial color="#b9a6ff" transparent opacity={.12} blending={THREE.AdditiveBlending} depthWrite={false} toneMapped={false}/>
    </mesh>
  </group>;
}

function QuasarJet() {
  return <group>
    <mesh scale={[.09,1.9,.09]} position={[0,1.8,0]}><cylinderGeometry args={[.04,.12,2.6,16]}/><meshBasicMaterial color="#d4e6ff" transparent opacity={.22} blending={THREE.AdditiveBlending} /></mesh>
    <mesh scale={[.09,1.9,.09]} position={[0,-1.8,0]}><cylinderGeometry args={[.04,.12,2.6,16]}/><meshBasicMaterial color="#d4e6ff" transparent opacity={.22} blending={THREE.AdditiveBlending} /></mesh>
  </group>;
}

function MilkyWay() {
  const pts = useMemo(() => Array.from({length: 16000}, () => {
    const r = Math.pow(Math.random(), .62) * 22;
    const a = Math.random()*Math.PI*2 + r*.35;
    const arm = Math.sin(a*3 + r*.4) * .9;
    const y = (Math.random()-.5) * (.35 + r*.035);
    return new THREE.Vector3(Math.cos(a)*r, y + arm*.10, Math.sin(a)*r*.42);
  }), []);
  const geo = useMemo(() => { const g=new THREE.BufferGeometry(); g.setFromPoints(pts); return g; },[pts]);
  return <points geometry={geo} rotation={[.08,.15,.12]}>
    <pointsMaterial color="#91a8d0" size={.018} transparent opacity={.27} depthWrite={false} blending={THREE.AdditiveBlending} />
  </points>;
}

function BackgroundStars() {
  const pts = useMemo(() => Array.from({length: 12000}, () => {
    const r = 60 + Math.random()*150;
    const theta = Math.random()*Math.PI*2;
    const phi = Math.acos(2*Math.random()-1);
    return new THREE.Vector3(r*Math.sin(phi)*Math.cos(theta), r*Math.cos(phi), r*Math.sin(phi)*Math.sin(theta));
  }), []);
  const geo = useMemo(() => { const g = new THREE.BufferGeometry(); g.setFromPoints(pts); return g; }, [pts]);
  return <points geometry={geo}><pointsMaterial color="#d8e6ff" size={.055} sizeAttenuation transparent opacity={.8} depthWrite={false} blending={THREE.AdditiveBlending}/></points>;
}

function SolarSystem() {
  const earth = useRef<THREE.Group>(null);
  const mars = useRef<THREE.Group>(null);
  useFrame(({clock}) => {
    const t=clock.getElapsedTime();
    earth.current?.position.set(Math.cos(t*.32)*3,0,Math.sin(t*.32)*3);
    mars.current?.position.set(Math.cos(t*.2)*4.8,0,Math.sin(t*.2)*4.8);
  });
  const orbit = (r:number) => Array.from({length:129},(_,i)=>{const a=i/128*Math.PI*2; return [Math.cos(a)*r,0,Math.sin(a)*r] as [number,number,number]});
  return <group scale={.65}>
    <mesh><sphereGeometry args={[.45,64,64]}/><meshStandardMaterial color="#ffd56b" emissive="#ffb72e" emissiveIntensity={2.7} toneMapped={false}/></mesh>
    <pointLight intensity={6} distance={16} color="#fff6cf" />
    <group ref={earth}><mesh rotation={[0.2,0.4,0]}><sphereGeometry args={[.14,64,64]}/><meshStandardMaterial color="#3c72c7" roughness={.86} metalness={0}/></mesh><mesh scale={1.03}><sphereGeometry args={[.14,64,64]}/><meshBasicMaterial color="#8cc8ff" transparent opacity={.06} side={THREE.BackSide} blending={THREE.AdditiveBlending}/></mesh></group>
    <group ref={mars}><mesh><sphereGeometry args={[.09,64,64]}/><meshStandardMaterial color="#a84d32" roughness={.92}/></mesh></group>
    <Line points={orbit(3)} color="#6880aa" transparent opacity={.22}/><Line points={orbit(4.8)} color="#6880aa" transparent opacity={.18}/>
  </group>;
}

function Scene({selected, onSelect}: Props) {
  const target = useMemo(() => selected ? raDecToDirection(selected.ra ?? 0, selected.dec ?? 0).multiplyScalar(10) : new THREE.Vector3(0,0,0), [selected]);
  return <>
    <color attach="background" args={['#010207']} />
    <fog attach="fog" args={['#010207', 40, 210]} />
    <ambientLight intensity={.18} />
    <BackgroundStars /><MilkyWay /><SolarSystem />
    {ANCHORS.map((a) => <RealisticStar key={a.name} a={a} selected={selected?.name===a.name} onClick={()=>onSelect?.({name:a.name,type:a.type,ra:a.ra,dec:a.dec,distance:`~${a.distanceLy.toLocaleString()} ly`})} />)}
    <OrbitControls enableDamping dampingFactor={.075} minDistance={1} maxDistance={220} target={target} makeDefault />
  </>;
}

export default function Universe({selected, onSelect}: Props) {
  return <Canvas camera={{position:[0,2.6,12],fov:52}} dpr={[1,1.75]} gl={{antialias:true, powerPreference:'high-performance'}}>
    <Scene selected={selected} onSelect={onSelect}/>
  </Canvas>;
}
