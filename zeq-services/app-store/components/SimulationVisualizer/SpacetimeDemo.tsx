/**
 * SpacetimeDemo - Visualize KO42.1/KO42.2 metric tensioning
 * 
 * Grid deformation showing spacetime modulation at 1.287 Hz,
 * demonstrating the metric tensor equations from General Relativity.
 */

import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, Sphere } from '@react-three/drei';
import * as THREE from 'three';
import { HULYAPULSE_HZ, ko42, ko42_1, ko42_2 } from './useZeqSync';

const GRID_SIZE = 50;
const GRID_SPACING = 0.4;

interface MassObjectProps {
  position: [number, number, number];
  mass: number;
  color: string;
}

const MassObject: React.FC<MassObjectProps> = ({ position, mass, color }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const startTime = useRef(Date.now() / 1000);

  useFrame(() => {
    if (!meshRef.current) return;
    
    const elapsed = Date.now() / 1000 - startTime.current;
    const syncValue = ko42(elapsed, 0.1);
    
    // Pulse the mass object
    const scale = 1 + syncValue * 0.3;
    meshRef.current.scale.setScalar(scale);
  });

  const radius = Math.log(mass + 1) * 0.3;

  return (
    <group position={position}>
      <mesh ref={meshRef}>
        <sphereGeometry args={[radius, 32, 32]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.5}
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>
      {/* Glow effect */}
      <mesh scale={1.5}>
        <sphereGeometry args={[radius, 16, 16]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.2}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </group>
  );
};

const SpacetimeFabric: React.FC = () => {
  const meshRef = useRef<THREE.Mesh>(null);
  const wireframeRef = useRef<THREE.LineSegments>(null);
  const startTime = useRef(Date.now() / 1000);
  
  // Mass objects that warp spacetime
  const massObjects = useMemo(() => [
    { x: 0, z: 0, mass: 20, color: '#fbbf24' },      // Central mass
    { x: 5, z: 3, mass: 5, color: '#6366f1' },       // Orbiting mass 1
    { x: -4, z: -2, mass: 3, color: '#ec4899' },     // Orbiting mass 2
  ], []);

  // Create grid geometry
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

  // Create wireframe geometry
  const wireframeGeo = useMemo(() => {
    return new THREE.WireframeGeometry(geometry);
  }, [geometry]);

  // Store original positions
  const originalPositions = useMemo(() => {
    return new Float32Array(geometry.attributes.position.array);
  }, [geometry]);

  const wireframeOriginalPositions = useMemo(() => {
    return new Float32Array(wireframeGeo.attributes.position.array);
  }, [wireframeGeo]);

  // Initialize colors
  useMemo(() => {
    const colors = new Float32Array(geometry.attributes.position.count * 3);
    for (let i = 0; i < colors.length; i += 3) {
      colors[i] = 0.2;     // R
      colors[i + 1] = 0.1; // G
      colors[i + 2] = 0.3; // B
    }
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  }, [geometry]);

  useFrame(() => {
    if (!meshRef.current || !wireframeRef.current) return;
    
    const elapsed = Date.now() / 1000 - startTime.current;
    
    // KO42.1 metric tensioning
    const metricTension = ko42_1(elapsed, 1.0, 0.05);
    
    // KO42.2 manual tensioning (user could adjust beta)
    const manualTension = ko42_2(elapsed, 1.0, 0.02);
    
    const positions = meshRef.current.geometry.attributes.position;
    const colors = meshRef.current.geometry.attributes.color;
    const wireframePositions = wireframeRef.current.geometry.attributes.position;
    
    // Update mass object positions (orbiting)
    const movingMass1 = {
      x: 5 * Math.cos(elapsed * 0.3),
      z: 5 * Math.sin(elapsed * 0.3),
      mass: massObjects[1].mass
    };
    
    const movingMass2 = {
      x: 4 * Math.cos(-elapsed * 0.4 + Math.PI),
      z: 4 * Math.sin(-elapsed * 0.4 + Math.PI),
      mass: massObjects[2].mass
    };
    
    const allMasses = [
      { x: 0, z: 0, mass: massObjects[0].mass },
      movingMass1,
      movingMass2
    ];
    
    for (let i = 0; i < positions.count; i++) {
      const i3 = i * 3;
      const x = originalPositions[i3];
      const z = originalPositions[i3 + 2];
      
      // Calculate spacetime curvature from all masses
      let totalCurvature = 0;
      
      for (const mass of allMasses) {
        const dx = x - mass.x;
        const dz = z - mass.z;
        const dist = Math.sqrt(dx * dx + dz * dz) + 0.5; // Softening
        
        // Schwarzschild-like metric distortion
        // ds² modulated by KO42.1
        const curvature = (mass.mass / (dist * dist)) * metricTension.value;
        totalCurvature += curvature;
      }
      
      // Apply curvature to y position (fabric depression)
      // Modulated by both KO42.1 and KO42.2
      const y = -totalCurvature * (1 + manualTension.pulseTerm);
      
      positions.array[i3 + 1] = y;
      
      // Color based on curvature (purple = high curvature)
      const normalizedCurvature = Math.min(totalCurvature / 3, 1);
      colors.array[i3] = 0.2 + normalizedCurvature * 0.6;     // R
      colors.array[i3 + 1] = 0.1 + normalizedCurvature * 0.2; // G
      colors.array[i3 + 2] = 0.5 + normalizedCurvature * 0.4; // B
    }
    
    positions.needsUpdate = true;
    colors.needsUpdate = true;
    meshRef.current.geometry.computeVertexNormals();
    
    // Update wireframe
    for (let i = 0; i < wireframePositions.count; i++) {
      const i3 = i * 3;
      const x = wireframeOriginalPositions[i3];
      const z = wireframeOriginalPositions[i3 + 2];
      
      let totalCurvature = 0;
      for (const mass of allMasses) {
        const dx = x - mass.x;
        const dz = z - mass.z;
        const dist = Math.sqrt(dx * dx + dz * dz) + 0.5;
        totalCurvature += (mass.mass / (dist * dist)) * metricTension.value;
      }
      
      wireframePositions.array[i3 + 1] = -totalCurvature * (1 + manualTension.pulseTerm) + 0.02;
    }
    wireframePositions.needsUpdate = true;
  });

  return (
    <group>
      {/* Spacetime fabric surface */}
      <mesh ref={meshRef} geometry={geometry}>
        <meshStandardMaterial
          vertexColors
          side={THREE.DoubleSide}
          metalness={0.1}
          roughness={0.8}
          transparent
          opacity={0.9}
        />
      </mesh>
      
      {/* Wireframe grid lines */}
      <lineSegments ref={wireframeRef} geometry={wireframeGeo}>
        <lineBasicMaterial color="#6366f1" transparent opacity={0.4} />
      </lineSegments>
      
      {/* Mass objects */}
      <MassObject position={[0, 1, 0]} mass={20} color="#fbbf24" />
      <OrbitingMass index={1} baseRadius={5} speed={0.3} mass={5} color="#6366f1" />
      <OrbitingMass index={2} baseRadius={4} speed={-0.4} mass={3} color="#ec4899" />
    </group>
  );
};

interface OrbitingMassProps {
  index: number;
  baseRadius: number;
  speed: number;
  mass: number;
  color: string;
}

const OrbitingMass: React.FC<OrbitingMassProps> = ({ baseRadius, speed, mass, color }) => {
  const groupRef = useRef<THREE.Group>(null);
  const startTime = useRef(Date.now() / 1000);

  useFrame(() => {
    if (!groupRef.current) return;
    
    const elapsed = Date.now() / 1000 - startTime.current;
    const angle = elapsed * speed + (speed < 0 ? Math.PI : 0);
    
    const x = baseRadius * Math.cos(angle);
    const z = baseRadius * Math.sin(angle);
    
    // Calculate y based on spacetime curvature at this position
    const distFromCenter = Math.sqrt(x * x + z * z);
    const centralMassCurvature = 20 / (distFromCenter * distFromCenter + 0.5);
    const y = -centralMassCurvature * 0.5 + 1; // Offset to float above fabric
    
    groupRef.current.position.set(x, y, z);
  });

  const radius = Math.log(mass + 1) * 0.3;

  return (
    <group ref={groupRef}>
      <mesh>
        <sphereGeometry args={[radius, 32, 32]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.5}
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>
    </group>
  );
};

const MetricDisplay: React.FC = () => {
  const textRef = useRef<any>(null);
  const startTime = useRef(Date.now() / 1000);

  useFrame(() => {
    if (!textRef.current) return;
    
    const elapsed = Date.now() / 1000 - startTime.current;
    const metric = ko42_1(elapsed, 1.0, 0.05);
    
    textRef.current.text = `Spacetime Metric | g_μν = ${metric.value.toFixed(4)} | α·sin(2π·1.287t) = ${metric.pulseTerm.toFixed(4)}`;
  });

  return (
    <Text
      ref={textRef}
      position={[0, 6, 0]}
      fontSize={0.35}
      color="#a855f7"
      anchorX="center"
      anchorY="middle"
    >
      Spacetime Metric | g_μν = 1.0000 | α·sin(2π·1.287t) = 0.0000
    </Text>
  );
};

const EquationDisplay: React.FC = () => {
  return (
    <Text
      position={[0, 5, 0]}
      fontSize={0.25}
      color="#6366f1"
      anchorX="center"
      anchorY="middle"
    >
      ds² = g_μν dx^μ dx^ν + α·sin(2π·1.287·t)·dt²
    </Text>
  );
};

export const SpacetimeDemo: React.FC = () => {
  return (
    <group>
      {/* Spacetime fabric */}
      <SpacetimeFabric />
      
      {/* Info displays */}
      <MetricDisplay />
      <EquationDisplay />
      
      {/* Lighting */}
      <ambientLight intensity={0.3} />
      <directionalLight position={[5, 10, 5]} intensity={0.8} />
      <directionalLight position={[-5, 5, -5]} intensity={0.3} color="#8b5cf6" />
      <pointLight position={[0, 5, 0]} intensity={1} color="#fbbf24" distance={20} />
    </group>
  );
};

export default SpacetimeDemo;
