/**
 * GravityDemo - N-body simulation with KO42 modulated gravity
 * 
 * Demonstrates gravitational attraction between bodies with
 * gravity strength modulated by the 1.287 Hz HulyaPulse.
 */

import React, { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sphere, Line, Text } from '@react-three/drei';
import * as THREE from 'three';
import { HULYAPULSE_HZ, ko42 } from './useZeqSync';

const G_CONSTANT = 0.5; // Gravitational constant (scaled for visualization)
const NUM_BODIES = 12;
const SOFTENING = 0.5; // Prevents division by zero

interface Body {
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  mass: number;
  color: string;
  radius: number;
}

const GravitySystem: React.FC = () => {
  const groupRef = useRef<THREE.Group>(null);
  const meshRefs = useRef<THREE.Mesh[]>([]);
  const lineRefs = useRef<THREE.Line[]>([]);
  const startTime = useRef(Date.now() / 1000);
  
  // Initialize bodies
  const bodies = useMemo<Body[]>(() => {
    const colors = [
      '#6366f1', '#8b5cf6', '#a855f7', '#d946ef', 
      '#ec4899', '#f43f5e', '#f97316', '#eab308',
      '#22c55e', '#14b8a6', '#06b6d4', '#3b82f6'
    ];
    
    const result: Body[] = [];
    
    // Central massive body
    result.push({
      position: new THREE.Vector3(0, 0, 0),
      velocity: new THREE.Vector3(0, 0, 0),
      mass: 100,
      color: '#fbbf24',
      radius: 1.0
    });
    
    // Orbiting bodies
    for (let i = 1; i < NUM_BODIES; i++) {
      const angle = (i / (NUM_BODIES - 1)) * Math.PI * 2;
      const radius = 3 + Math.random() * 5;
      const height = (Math.random() - 0.5) * 2;
      
      // Calculate orbital velocity for roughly circular orbit
      const orbitalSpeed = Math.sqrt(G_CONSTANT * 100 / radius) * 0.8;
      
      result.push({
        position: new THREE.Vector3(
          Math.cos(angle) * radius,
          height,
          Math.sin(angle) * radius
        ),
        velocity: new THREE.Vector3(
          -Math.sin(angle) * orbitalSpeed,
          0,
          Math.cos(angle) * orbitalSpeed
        ),
        mass: 1 + Math.random() * 3,
        color: colors[i % colors.length],
        radius: 0.2 + Math.random() * 0.2
      });
    }
    
    return result;
  }, []);

  // Store force lines data
  const forceLines = useRef<{ start: THREE.Vector3; end: THREE.Vector3; strength: number }[]>([]);

  useFrame((state, delta) => {
    if (!groupRef.current) return;
    
    const elapsed = Date.now() / 1000 - startTime.current;
    
    // KO42 gravity modulation
    const syncValue = ko42(elapsed, 0.3);
    const modulatedG = G_CONSTANT * (1 + syncValue);
    
    // Clear force lines
    forceLines.current = [];
    
    // Calculate gravitational forces (N-body)
    const forces: THREE.Vector3[] = bodies.map(() => new THREE.Vector3());
    
    for (let i = 0; i < bodies.length; i++) {
      for (let j = i + 1; j < bodies.length; j++) {
        const bodyA = bodies[i];
        const bodyB = bodies[j];
        
        // Direction from A to B
        const direction = new THREE.Vector3().subVectors(bodyB.position, bodyA.position);
        const distance = direction.length();
        
        // Gravitational force magnitude: F = G * m1 * m2 / r²
        const forceMag = (modulatedG * bodyA.mass * bodyB.mass) / (distance * distance + SOFTENING);
        
        // Normalize and scale by force magnitude
        direction.normalize().multiplyScalar(forceMag);
        
        // Apply equal and opposite forces
        forces[i].add(direction);
        forces[j].sub(direction);
        
        // Store force line for visualization (only strong forces)
        if (forceMag > 0.1) {
          forceLines.current.push({
            start: bodyA.position.clone(),
            end: bodyB.position.clone(),
            strength: Math.min(forceMag / 5, 1)
          });
        }
      }
    }
    
    // Update velocities and positions (Euler integration)
    const dt = Math.min(delta, 0.05); // Cap delta time
    
    for (let i = 0; i < bodies.length; i++) {
      const body = bodies[i];
      
      // a = F / m
      const acceleration = forces[i].clone().divideScalar(body.mass);
      
      // v += a * dt
      body.velocity.add(acceleration.multiplyScalar(dt));
      
      // Apply damping for stability
      body.velocity.multiplyScalar(0.999);
      
      // p += v * dt
      body.position.add(body.velocity.clone().multiplyScalar(dt));
      
      // Update mesh position
      if (meshRefs.current[i]) {
        meshRefs.current[i].position.copy(body.position);
        
        // Pulse size with sync
        const scale = 1 + syncValue * 0.2;
        meshRefs.current[i].scale.setScalar(scale);
      }
    }
  });

  return (
    <group ref={groupRef}>
      {/* Bodies */}
      {bodies.map((body, i) => (
        <mesh
          key={i}
          ref={(el) => { if (el) meshRefs.current[i] = el; }}
          position={body.position}
        >
          <sphereGeometry args={[body.radius, 32, 32]} />
          <meshStandardMaterial
            color={body.color}
            emissive={body.color}
            emissiveIntensity={0.3}
          />
        </mesh>
      ))}
      
      {/* Force lines */}
      <ForceLines bodies={bodies} />
    </group>
  );
};

const ForceLines: React.FC<{ bodies: Body[] }> = ({ bodies }) => {
  const linesRef = useRef<THREE.Group>(null);
  const startTime = useRef(Date.now() / 1000);
  
  // Create line geometries for each potential connection
  const lineGeometries = useMemo(() => {
    const geoms: { geometry: THREE.BufferGeometry; indices: [number, number] }[] = [];
    
    for (let i = 0; i < bodies.length; i++) {
      for (let j = i + 1; j < bodies.length; j++) {
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(6);
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geoms.push({ geometry, indices: [i, j] });
      }
    }
    
    return geoms;
  }, [bodies.length]);

  useFrame(() => {
    if (!linesRef.current) return;
    
    const elapsed = Date.now() / 1000 - startTime.current;
    const syncValue = ko42(elapsed, 0.3);
    const modulatedG = G_CONSTANT * (1 + syncValue);
    
    lineGeometries.forEach(({ geometry, indices }, idx) => {
      const [i, j] = indices;
      const bodyA = bodies[i];
      const bodyB = bodies[j];
      
      const positions = geometry.attributes.position.array as Float32Array;
      positions[0] = bodyA.position.x;
      positions[1] = bodyA.position.y;
      positions[2] = bodyA.position.z;
      positions[3] = bodyB.position.x;
      positions[4] = bodyB.position.y;
      positions[5] = bodyB.position.z;
      
      geometry.attributes.position.needsUpdate = true;
      
      // Calculate force for opacity
      const distance = bodyA.position.distanceTo(bodyB.position);
      const forceMag = (modulatedG * bodyA.mass * bodyB.mass) / (distance * distance + SOFTENING);
      
      const line = linesRef.current?.children[idx] as THREE.Line;
      if (line && line.material) {
        const material = line.material as THREE.LineBasicMaterial;
        material.opacity = Math.min(forceMag / 3, 0.5);
      }
    });
  });

  return (
    <group ref={linesRef}>
      {lineGeometries.map(({ geometry }, idx) => (
        <line key={idx} geometry={geometry}>
          <lineBasicMaterial
            color="#6366f1"
            transparent
            opacity={0.1}
            blending={THREE.AdditiveBlending}
          />
        </line>
      ))}
    </group>
  );
};

const GravityIndicator: React.FC = () => {
  const textRef = useRef<any>(null);
  const startTime = useRef(Date.now() / 1000);

  useFrame(() => {
    if (!textRef.current) return;
    
    const elapsed = Date.now() / 1000 - startTime.current;
    const syncValue = ko42(elapsed, 0.3);
    const modulatedG = G_CONSTANT * (1 + syncValue);
    
    textRef.current.text = `N-Body Simulation | G = ${modulatedG.toFixed(3)} | ${NUM_BODIES} bodies`;
  });

  return (
    <Text
      ref={textRef}
      position={[0, 8, 0]}
      fontSize={0.4}
      color="#6366f1"
      anchorX="center"
      anchorY="middle"
    >
      N-Body Simulation | G = 0.500 | 12 bodies
    </Text>
  );
};

export const GravityDemo: React.FC = () => {
  return (
    <group>
      {/* N-body gravity system */}
      <GravitySystem />
      
      {/* Info display */}
      <GravityIndicator />
      
      {/* Lighting */}
      <ambientLight intensity={0.4} />
      <pointLight position={[0, 0, 0]} intensity={2} distance={50} />
      <directionalLight position={[10, 10, 5]} intensity={0.5} />
    </group>
  );
};

export default GravityDemo;
