/**
 * WaveDemo - Quantum/electromagnetic wave propagation
 * 
 * Visualizes wave functions synchronized to the 1.287 Hz HulyaPulse,
 * demonstrating quantum mechanical operators (QM series).
 */

import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import * as THREE from 'three';
import { HULYAPULSE_HZ, ko42 } from './useZeqSync';

const GRID_SIZE = 80;
const GRID_SPACING = 0.25;

const WaveSurface: React.FC = () => {
  const meshRef = useRef<THREE.Mesh>(null);
  const startTime = useRef(Date.now() / 1000);
  
  // Create the plane geometry
  const geometry = useMemo(() => {
    const geo = new THREE.PlaneGeometry(
      GRID_SIZE * GRID_SPACING,
      GRID_SIZE * GRID_SPACING,
      GRID_SIZE - 1,
      GRID_SIZE - 1
    );
    geo.rotateX(-Math.PI / 2);
    return geo;
  }, []);

  // Store original positions
  const originalPositions = useMemo(() => {
    return new Float32Array(geometry.attributes.position.array);
  }, [geometry]);

  useFrame(() => {
    if (!meshRef.current) return;
    
    const elapsed = Date.now() / 1000 - startTime.current;
    const positions = meshRef.current.geometry.attributes.position;
    const colors = meshRef.current.geometry.attributes.color;
    
    // Global KO42 sync
    const globalSync = ko42(elapsed, 1.0);
    
    // Wave parameters modulated by HulyaPulse
    const waveFreq = 0.3 + globalSync * 0.05;
    const waveAmp = 1.5 + globalSync * 0.5;
    const waveSpeed = 2.0;
    
    for (let i = 0; i < positions.count; i++) {
      const i3 = i * 3;
      const x = originalPositions[i3];
      const z = originalPositions[i3 + 2];
      
      // Distance from center
      const dist = Math.sqrt(x * x + z * z);
      
      // Multiple wave interference pattern
      // Wave 1: Circular ripple from center
      const wave1 = Math.sin(dist * waveFreq - elapsed * waveSpeed) * waveAmp;
      
      // Wave 2: Plane wave (quantum probability wave)
      const wave2 = Math.sin(x * 0.5 + elapsed * HULYAPULSE_HZ * Math.PI * 2) * 0.5;
      
      // Wave 3: Standing wave (synchronized to HulyaPulse)
      const wave3 = Math.cos(z * 0.3) * Math.sin(elapsed * HULYAPULSE_HZ * Math.PI * 2) * 0.3;
      
      // Combine waves with interference
      const y = (wave1 + wave2 + wave3) * Math.exp(-dist * 0.02);
      
      positions.array[i3 + 1] = y;
      
      // Color based on wave height (quantum probability density)
      const normalizedHeight = (y + 2) / 4; // Normalize to 0-1
      colors.array[i3] = 0.4 + normalizedHeight * 0.4;     // R - purple
      colors.array[i3 + 1] = 0.2 + normalizedHeight * 0.3; // G
      colors.array[i3 + 2] = 0.9;                           // B - blue
    }
    
    positions.needsUpdate = true;
    colors.needsUpdate = true;
    meshRef.current.geometry.computeVertexNormals();
  });

  // Initialize colors
  useMemo(() => {
    const colors = new Float32Array(geometry.attributes.position.count * 3);
    for (let i = 0; i < colors.length; i += 3) {
      colors[i] = 0.5;     // R
      colors[i + 1] = 0.3; // G
      colors[i + 2] = 0.9; // B
    }
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  }, [geometry]);

  return (
    <mesh ref={meshRef} geometry={geometry}>
      <meshStandardMaterial
        vertexColors
        side={THREE.DoubleSide}
        wireframe={false}
        metalness={0.3}
        roughness={0.7}
      />
    </mesh>
  );
};

const WaveWireframe: React.FC = () => {
  const meshRef = useRef<THREE.LineSegments>(null);
  const startTime = useRef(Date.now() / 1000);
  
  const geometry = useMemo(() => {
    const geo = new THREE.PlaneGeometry(
      GRID_SIZE * GRID_SPACING,
      GRID_SIZE * GRID_SPACING,
      GRID_SIZE / 2 - 1,
      GRID_SIZE / 2 - 1
    );
    geo.rotateX(-Math.PI / 2);
    return new THREE.WireframeGeometry(geo);
  }, []);

  const originalPositions = useMemo(() => {
    return new Float32Array(geometry.attributes.position.array);
  }, [geometry]);

  useFrame(() => {
    if (!meshRef.current) return;
    
    const elapsed = Date.now() / 1000 - startTime.current;
    const positions = meshRef.current.geometry.attributes.position;
    
    const globalSync = ko42(elapsed, 1.0);
    const waveFreq = 0.3 + globalSync * 0.05;
    const waveAmp = 1.5 + globalSync * 0.5;
    
    for (let i = 0; i < positions.count; i++) {
      const i3 = i * 3;
      const x = originalPositions[i3];
      const z = originalPositions[i3 + 2];
      
      const dist = Math.sqrt(x * x + z * z);
      
      const wave1 = Math.sin(dist * waveFreq - elapsed * 2.0) * waveAmp;
      const wave2 = Math.sin(x * 0.5 + elapsed * HULYAPULSE_HZ * Math.PI * 2) * 0.5;
      const wave3 = Math.cos(z * 0.3) * Math.sin(elapsed * HULYAPULSE_HZ * Math.PI * 2) * 0.3;
      
      const y = (wave1 + wave2 + wave3) * Math.exp(-dist * 0.02);
      
      positions.array[i3 + 1] = y + 0.01; // Slight offset above surface
    }
    
    positions.needsUpdate = true;
  });

  return (
    <lineSegments ref={meshRef} geometry={geometry}>
      <lineBasicMaterial color="#6366f1" transparent opacity={0.3} />
    </lineSegments>
  );
};

const QuantumParticles: React.FC = () => {
  const particleCount = 200;
  const pointsRef = useRef<THREE.Points>(null);
  const startTime = useRef(Date.now() / 1000);
  
  const { positions, phases } = useMemo(() => {
    const positions = new Float32Array(particleCount * 3);
    const phases = new Float32Array(particleCount);
    
    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      const angle = Math.random() * Math.PI * 2;
      const radius = Math.random() * 8;
      
      positions[i3] = Math.cos(angle) * radius;
      positions[i3 + 1] = 0;
      positions[i3 + 2] = Math.sin(angle) * radius;
      
      phases[i] = Math.random() * Math.PI * 2;
    }
    
    return { positions, phases };
  }, []);

  const originalPositions = useRef(new Float32Array(positions));

  useFrame(() => {
    if (!pointsRef.current) return;
    
    const elapsed = Date.now() / 1000 - startTime.current;
    const posAttr = pointsRef.current.geometry.attributes.position;
    
    const globalSync = ko42(elapsed, 1.0);
    
    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      const x = originalPositions.current[i3];
      const z = originalPositions.current[i3 + 2];
      
      const dist = Math.sqrt(x * x + z * z);
      
      // Particle follows wave surface
      const waveFreq = 0.3 + globalSync * 0.05;
      const waveAmp = 1.5 + globalSync * 0.5;
      const wave1 = Math.sin(dist * waveFreq - elapsed * 2.0) * waveAmp;
      const wave2 = Math.sin(x * 0.5 + elapsed * HULYAPULSE_HZ * Math.PI * 2) * 0.5;
      const wave3 = Math.cos(z * 0.3) * Math.sin(elapsed * HULYAPULSE_HZ * Math.PI * 2) * 0.3;
      
      const y = (wave1 + wave2 + wave3) * Math.exp(-dist * 0.02);
      
      // Add some quantum jitter
      const jitter = ko42(elapsed, 0.1, phases[i]);
      
      posAttr.array[i3 + 1] = y + 0.3 + jitter * 0.2;
    }
    
    posAttr.needsUpdate = true;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particleCount}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.15}
        color="#ec4899"
        transparent
        opacity={0.8}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
};

const InfoDisplay: React.FC = () => {
  const textRef = useRef<any>(null);
  const startTime = useRef(Date.now() / 1000);

  useFrame(() => {
    if (!textRef.current) return;
    
    const elapsed = Date.now() / 1000 - startTime.current;
    const syncValue = ko42(elapsed, 1.0);
    const wavelength = (1 / (0.3 + syncValue * 0.05)).toFixed(2);
    
    textRef.current.text = `Quantum Wave | λ = ${wavelength} | ψ² sync: ${((syncValue + 1) / 2).toFixed(2)}`;
  });

  return (
    <Text
      ref={textRef}
      position={[0, 6, 0]}
      fontSize={0.4}
      color="#6366f1"
      anchorX="center"
      anchorY="middle"
    >
      Quantum Wave | λ = 3.33 | ψ² sync: 0.50
    </Text>
  );
};

export const WaveDemo: React.FC = () => {
  return (
    <group>
      {/* Wave surface */}
      <WaveSurface />
      
      {/* Wireframe overlay */}
      <WaveWireframe />
      
      {/* Quantum particles riding the wave */}
      <QuantumParticles />
      
      {/* Info display */}
      <InfoDisplay />
      
      {/* Lighting */}
      <ambientLight intensity={0.4} />
      <directionalLight position={[5, 10, 5]} intensity={0.8} />
      <directionalLight position={[-5, 10, -5]} intensity={0.4} color="#8b5cf6" />
    </group>
  );
};

export default WaveDemo;
