'use client';
import {Canvas,useFrame} from '@react-three/fiber';
import {OrbitControls,Stars,Line,Text} from '@react-three/drei';
import * as THREE from 'three';
import {useMemo,useRef} from 'react';

type P={name:string;position:[number,number,number];color:string;size:number};
const anchors:P[]=[
 {name:'Sun',position:[0,0,0],color:'#ffd166',size:.42},{name:'Earth',position:[3,0,0],color:'#5fa8ff',size:.13},{name:'Mars',position:[4.6,0,0],color:'#d66b4d',size:.1},{name:'Jupiter',position:[6.8,0,0],color:'#d5b08b',size:.25},
 {name:'Proxima Centauri',position:[-5,1,-2],color:'#ff9a76',size:.09},{name:'Sirius',position:[7,-2,-6],color:'#dcecff',size:.1},{name:'Betelgeuse',position:[-8,4,-9],color:'#ff8a62',size:.13},
 {name:'Andromeda Galaxy',position:[-10,2,-18],color:'#9db7ff',size:.2},{name:'M87*',position:[12,5,-25],color:'#b6a0ff',size:.18}
];
function Solar(){const earth=useRef<THREE.Mesh>(null);useFrame(({clock})=>{const t=clock.getElapsedTime();earth.current?.position.set(Math.cos(t*.28)*3,0,Math.sin(t*.28)*3)});return <><mesh><sphereGeometry args={[.42,32,32]}/><meshBasicMaterial color="#ffd166"/></mesh><mesh ref={earth}><sphereGeometry args={[.13,24,24]}/><meshStandardMaterial color="#5fa8ff" emissive="#17345f"/></mesh><Line points={Array.from({length:101},(_,i)=>{const a=i/100*Math.PI*2;return [Math.cos(a)*3,0,Math.sin(a)*3] as [number,number,number]})} color="#56709b" transparent opacity={.4}/></>}
function Anchors(){return <>{anchors.map(a=><group key={a.name} position={a.position}><mesh><sphereGeometry args={[a.size,12,12]}/><meshBasicMaterial color={a.color}/></mesh><Text position={[0,a.size+.12,0]} fontSize={.12} color="#cdd8ec" anchorX="center">{a.name}</Text></group>)}</>}
function Scene(){return <><color attach="background" args={['#01030a']}/><ambientLight intensity={.8}/><Stars radius={180} depth={90} count={9000} factor={2} saturation={0} fade speed={.15}/><Solar/><Anchors/><OrbitControls enableDamping dampingFactor={.08} minDistance={1} maxDistance={120}/></>}
export default function Universe(){return <Canvas camera={{position:[0,5,10],fov:55}} dpr={[1,2]} gl={{antialias:true}}><Scene/></Canvas>}
