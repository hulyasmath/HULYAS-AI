/**
 * ParticleDemo - Thousands of particles in synchronized motion
 * 
 * Demonstrates phase-locked collective behavior with particles
 * breathing and flowing with the 1.287 Hz HulyaPulse.
 */

import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Points, PointMaterial, Text } from '@react-three/drei';
import * as THREE from 'three';
import { HULYAPULSE_HZ, ko42 } from './useZeqSync';

const PARTICLE_COUNT = 5000;

interface ParticleSystemProps {
  count?: number;
  spread?: number;
}

const ParticleSystem: React.FC<ParticleSystemProps> = ({ 
  count = PARTICLE_COUNT, 
  spread = 10 
}) => {
  const pointsRef = useRef<THREE.Points>(null);
  const startTime = useRef(Date.now() / 1000);
  
  // Initial particle positions
  const { positions, colors, velocities, phases } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const velocities = new Float32Array(count * 3);
    const phases = new Float32Array(count);
    
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      
      // Spherical distribution
      const radius = Math.random() * spread;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      
      positions[i3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i3 + 2] = radius * Math.cos(phi);
      
      // Velocity vectors (for flow animation)
      velocities[i3] = (Math.random() - 0.5) * 0.02;
      velocities[i3 + 1] = (Math.random() - 0.5) * 0.02;
      velocities[i3 + 2] = (Math.random() - 0.5) * 0.02;
      
      // Phase offset for each particle (creates wave effect)
      phases[i] = Math.random() * Math.PI * 2;
      
      // Colors - purple/blue gradient based on distance from center
      const t = radius / spread;
      colors[i3] = 0.4 + t * 0.3;     // R
      colors[i3 + 1] = 0.3 + t * 0.2; // G
      colors[i3 + 2] = 0.9 - t * 0.2; // B
    }
    
    return { positions, colors, velocities, phases };
  }, [count, spread]);

  // Store original positions for reference
  const originalPositions = useRef(new Float32Array(positions));
  
  useFrame(() => {
    if (!pointsRef.current) return;
    
    const elapsed = Date.now() / 1000 - startTime.current;
    const geometry = pointsRef.current.geometry;
    const positionAttribute = geometry.getAttribute('position') as THREE.BufferAttribute;
    const colorAttribute = geometry.getAttribute('color') as THREE.BufferAttribute;
    
    // Global KO42 sync value
    const globalSync = ko42(elapsed, 1.0);
    
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      
      // Individual particle sync with phase offset
      const particleSync = ko42(elapsed, 0.5, phases[i]);
      
      // Base position
      const ox = originalPositions.current[i3];
      const oy = originalPositions.current[i3 + 1];
      const oz = originalPositions.current[i3 + 2];
      
      // Distance from center
      const dist = Math.sqrt(ox * ox + oy * oy + oz * oz);
      
      // Breathing effect - particles move in/out with sync
      const breathScale = 1 + globalSync * 0.15;
      
      // Spiral rotation based on sync
      const rotAngle = elapsed * 0.2 + particleSync * 0.1;
      const cosR = Math.cos(rotAngle);
      const sinR = Math.sin(rotAngle);
      
      // Apply transformations
      const nx = ox * cosR - oz * sinR;
      const nz = ox * sinR + oz * cosR;
      
      positionAttribute.array[i3] = nx * breathScale + velocities[i3] * Math.sin(elapsed * 2 + phases[i]);
      positionAttribute.array[i3 + 1] = oy * breathScale + particleSync * 0.5;
      positionAttribute.array[i3 + 2] = nz * breathScale + velocities[i3 + 2] * Math.cos(elapsed * 2 + phases[i]);
      
      // Pulse colors with sync
      const colorPulse = 0.5 + globalSync * 0.3;
      colorAttribute.array[i3] = colors[i3] * colorPulse;
      colorAttribute.array[i3 + 1] = colors[i3 + 1] * colorPulse;
      colorAttribute.array[i3 + 2] = colors[i3 + 2] * (1 + globalSync * 0.2);
    }
    
    positionAttribute.needsUpdate = true;
    colorAttribute.needsUpdate = true;
  });

  return (
    <Points ref={pointsRef} limit={count}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={count}
          array={colors}
          itemSize={3}
        />
      </bufferGeometry>
      <PointMaterial
        size={0.08}
        vertexColors
        transparent
        opacity={0.8}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </Points>
  );
};

const CoreGlow: React.FC = () => {
  const meshRef = useRef<THREE.Mesh>(null);
  const startTime = useRef(Date.now() / 1000);

  useFrame(() => {
    if (!meshRef.current) return;
    
    const elapsed = Date.now() / 1000 - startTime.current;
    const syncValue = ko42(elapsed, 0.2);
    
    // Pulse the core
    const scale = 1 + syncValue;
    meshRef.current.scale.setScalar(scale);
    
    // Pulse opacity
    const material = meshRef.current.material as THREE.MeshBasicMaterial;
    if (material) {
      material.opacity = 0.3 + syncValue * 0.2;
    }
  });

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[0.5, 32, 32]} />
      <meshBasicMaterial 
        color="#8b5cf6" 
        transparent 
        opacity={0.3}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  );
};

const InfoDisplay: React.FC = () => {
  const textRef = useRef<any>(null);
  const startTime = useRef(Date.now() / 1000);

  useFrame(() => {
    if (!textRef.current) return;
    
    const elapsed = Date.now() / 1000 - startTime.current;
    const syncValue = ko42(elapsed, 1.0);
    const zeqond = Math.floor(elapsed * HULYAPULSE_HZ);
    
    textRef.current.text = `${PARTICLE_COUNT} particles | Zeqond: ${zeqond} | Phase: ${(syncValue + 1).toFixed(2)}`;
  });

  return (
    <Text
      ref={textRef}
      position={[0, 8, 0]}
      fontSize={0.4}
      color="#a855f7"
      anchorX="center"
      anchorY="middle"
    >
      {PARTICLE_COUNT} particles | Zeqond: 0 | Phase: 1.00
    </Text>
  );
};

export const ParticleDemo: React.FC = () => {
  return (
    <group>
      {/* Main particle system */}
      <ParticleSystem count={PARTICLE_COUNT} spread={8} />
      
      {/* Central glowing core */}
      <CoreGlow />
      
      {/* Info display */}
      <InfoDisplay />
      
      {/* Ambient lighting */}
      <ambientLight intensity={0.5} />
    </group>
  );
};

export default ParticleDemo;
