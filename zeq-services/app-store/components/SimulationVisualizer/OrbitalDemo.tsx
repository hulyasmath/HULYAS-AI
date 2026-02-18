/**
 * OrbitalDemo - Planets and satellites synced to HulyaPulse
 * 
 * Demonstrates KO33 (orbital velocity) and KO34 (orbital period)
 * with visual pulsing orbits synchronized to 1.287 Hz.
 */

import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sphere, Trail, Line, Text } from '@react-three/drei';
import * as THREE from 'three';
import { HULYAPULSE_HZ, ko42 } from './useZeqSync';

interface PlanetProps {
  name: string;
  radius: number;
  orbitRadius: number;
  orbitSpeed: number;
  color: string;
  emissive?: string;
  startAngle?: number;
}

const Planet: React.FC<PlanetProps> = ({ 
  name, 
  radius, 
  orbitRadius, 
  orbitSpeed, 
  color, 
  emissive,
  startAngle = 0 
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const trailRef = useRef<THREE.Group>(null);
  const startTime = useRef(Date.now() / 1000);

  useFrame(() => {
    if (!meshRef.current) return;
    
    const elapsed = Date.now() / 1000 - startTime.current;
    
    // KO42 sync modulation
    const syncValue = ko42(elapsed, 0.1);
    
    // Orbital position with sync modulation
    const angle = startAngle + elapsed * orbitSpeed;
    const modulatedOrbitRadius = orbitRadius * (1 + syncValue * 0.05);
    
    meshRef.current.position.x = Math.cos(angle) * modulatedOrbitRadius;
    meshRef.current.position.z = Math.sin(angle) * modulatedOrbitRadius;
    
    // Pulse the planet size with HulyaPulse
    const scale = 1 + syncValue * 0.3;
    meshRef.current.scale.setScalar(scale);
  });

  return (
    <group>
      <Trail
        width={0.5}
        length={50}
        color={color}
        attenuation={(t) => t * t}
      >
        <mesh ref={meshRef}>
          <sphereGeometry args={[radius, 32, 32]} />
          <meshStandardMaterial 
            color={color} 
            emissive={emissive || color}
            emissiveIntensity={0.3}
          />
        </mesh>
      </Trail>
    </group>
  );
};

interface OrbitRingProps {
  radius: number;
  color: string;
}

const OrbitRing: React.FC<OrbitRingProps> = ({ radius, color }) => {
  const ringRef = useRef<THREE.Line>(null);
  const startTime = useRef(Date.now() / 1000);
  
  const points = useMemo(() => {
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i <= 64; i++) {
      const angle = (i / 64) * Math.PI * 2;
      pts.push(new THREE.Vector3(Math.cos(angle) * radius, 0, Math.sin(angle) * radius));
    }
    return pts;
  }, [radius]);

  useFrame(() => {
    if (!ringRef.current) return;
    const elapsed = Date.now() / 1000 - startTime.current;
    const syncValue = ko42(elapsed, 0.1);
    
    // Pulse opacity with HulyaPulse
    const material = ringRef.current.material as THREE.LineBasicMaterial;
    if (material) {
      material.opacity = 0.3 + syncValue * 0.2;
    }
  });

  return (
    <Line
      ref={ringRef}
      points={points}
      color={color}
      lineWidth={1}
      transparent
      opacity={0.3}
    />
  );
};

const Sun: React.FC = () => {
  const meshRef = useRef<THREE.Mesh>(null);
  const lightRef = useRef<THREE.PointLight>(null);
  const startTime = useRef(Date.now() / 1000);

  useFrame(() => {
    if (!meshRef.current || !lightRef.current) return;
    
    const elapsed = Date.now() / 1000 - startTime.current;
    const syncValue = ko42(elapsed, 0.15);
    
    // Pulse sun size
    const scale = 1 + syncValue * 0.2;
    meshRef.current.scale.setScalar(scale);
    
    // Pulse light intensity
    lightRef.current.intensity = 2 + syncValue * 0.5;
  });

  return (
    <group>
      <mesh ref={meshRef}>
        <sphereGeometry args={[1.5, 32, 32]} />
        <meshBasicMaterial color="#FDB813" />
      </mesh>
      <pointLight ref={lightRef} intensity={2} distance={100} decay={2} />
    </group>
  );
};

const PulseIndicator: React.FC = () => {
  const textRef = useRef<any>(null);
  const startTime = useRef(Date.now() / 1000);

  useFrame(() => {
    if (!textRef.current) return;
    
    const elapsed = Date.now() / 1000 - startTime.current;
    const syncValue = ko42(elapsed, 0.1);
    const zeqond = Math.floor(elapsed * HULYAPULSE_HZ);
    
    // Update text (this is expensive, but okay for demo)
    textRef.current.text = `Zeqond: ${zeqond} | Sync: ${syncValue.toFixed(3)}`;
  });

  return (
    <Text
      ref={textRef}
      position={[0, 8, 0]}
      fontSize={0.5}
      color="#6366f1"
      anchorX="center"
      anchorY="middle"
    >
      Zeqond: 0 | Sync: 0.000
    </Text>
  );
};

export const OrbitalDemo: React.FC = () => {
  return (
    <group>
      {/* Central sun */}
      <Sun />
      
      {/* Orbit rings */}
      <OrbitRing radius={4} color="#6366f1" />
      <OrbitRing radius={6} color="#8b5cf6" />
      <OrbitRing radius={8.5} color="#a855f7" />
      <OrbitRing radius={11} color="#d946ef" />
      
      {/* Planets - speeds based on Kepler's laws approximation */}
      <Planet 
        name="Mercury"
        radius={0.3} 
        orbitRadius={4} 
        orbitSpeed={1.2}
        color="#A0522D"
        startAngle={0}
      />
      <Planet 
        name="Venus"
        radius={0.5} 
        orbitRadius={6} 
        orbitSpeed={0.8}
        color="#DEB887"
        startAngle={Math.PI / 3}
      />
      <Planet 
        name="Earth"
        radius={0.5} 
        orbitRadius={8.5} 
        orbitSpeed={0.5}
        color="#4169E1"
        emissive="#1e3a8a"
        startAngle={Math.PI * 2 / 3}
      />
      <Planet 
        name="Mars"
        radius={0.4} 
        orbitRadius={11} 
        orbitSpeed={0.35}
        color="#CD5C5C"
        startAngle={Math.PI}
      />
      
      {/* Pulse indicator */}
      <PulseIndicator />
      
      {/* Ambient light */}
      <ambientLight intensity={0.2} />
    </group>
  );
};

export default OrbitalDemo;
