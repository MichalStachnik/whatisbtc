import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, Environment, Float } from '@react-three/drei';
import * as THREE from 'three';

export function BitcoinCoin() {
  const groupRef = useRef<THREE.Group>(null!);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += 0.004;
    }
  });

  return (
    <>
      {/* Lighting rig */}
      <ambientLight intensity={0.3} />
      <spotLight
        position={[5, 5, 5]}
        intensity={2}
        color="#F7931A"
        angle={0.4}
        penumbra={0.5}
        castShadow
      />
      <spotLight
        position={[-4, 3, 2]}
        intensity={1.2}
        color="#FFD080"
        angle={0.5}
        penumbra={0.8}
      />
      <pointLight position={[-3, -4, 4]} intensity={0.6} color="#ffffff" />
      <directionalLight position={[0, 0, 5]} intensity={0.4} color="#FFF5E0" />

      {/* Environment for realistic reflections */}
      <Environment preset="city" />

      <Float speed={1.8} rotationIntensity={0} floatIntensity={0.4} floatingRange={[-0.1, 0.1]}>
        <group ref={groupRef}>
          {/* Main coin body */}
          <mesh castShadow receiveShadow rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[1.4, 1.4, 0.15, 128]} />
            <meshPhysicalMaterial
              color="#E8890E"
              metalness={1}
              roughness={0.15}
              clearcoat={0.3}
              clearcoatRoughness={0.1}
              reflectivity={1}
              envMapIntensity={1.2}
            />
          </mesh>

          {/* Front face - raised disc */}
          <mesh position={[0, 0, 0.076]}>
            <circleGeometry args={[1.25, 128]} />
            <meshPhysicalMaterial
              color="#F7931A"
              metalness={1}
              roughness={0.12}
              clearcoat={0.4}
              clearcoatRoughness={0.08}
              envMapIntensity={1.4}
            />
          </mesh>

          {/* Back face - raised disc */}
          <mesh position={[0, 0, -0.076]} rotation={[0, Math.PI, 0]}>
            <circleGeometry args={[1.25, 128]} />
            <meshPhysicalMaterial
              color="#F7931A"
              metalness={1}
              roughness={0.12}
              clearcoat={0.4}
              clearcoatRoughness={0.08}
              envMapIntensity={1.4}
            />
          </mesh>

          {/* Outer decorative ring - front */}
          <mesh position={[0, 0, 0.077]}>
            <ringGeometry args={[1.1, 1.18, 128]} />
            <meshPhysicalMaterial
              color="#D4800F"
              metalness={1}
              roughness={0.1}
              clearcoat={0.6}
              envMapIntensity={1.2}
            />
          </mesh>

          {/* Outer decorative ring - back */}
          <mesh position={[0, 0, -0.077]} rotation={[0, Math.PI, 0]}>
            <ringGeometry args={[1.1, 1.18, 128]} />
            <meshPhysicalMaterial
              color="#D4800F"
              metalness={1}
              roughness={0.1}
              clearcoat={0.6}
              envMapIntensity={1.2}
            />
          </mesh>

          {/* Inner ring detail - front */}
          <mesh position={[0, 0, 0.078]}>
            <ringGeometry args={[0.92, 0.95, 128]} />
            <meshPhysicalMaterial
              color="#C4760D"
              metalness={1}
              roughness={0.15}
              envMapIntensity={1}
            />
          </mesh>

          {/* Inner ring detail - back */}
          <mesh position={[0, 0, -0.078]} rotation={[0, Math.PI, 0]}>
            <ringGeometry args={[0.92, 0.95, 128]} />
            <meshPhysicalMaterial
              color="#C4760D"
              metalness={1}
              roughness={0.15}
              envMapIntensity={1}
            />
          </mesh>

          {/* Bitcoin ₿ symbol - front */}
          <Text
            position={[0, 0, 0.08]}
            fontSize={1.0}
            color="#1A1A1A"
            anchorX="center"
            anchorY="middle"
            font={undefined}
            outlineWidth={0.02}
            outlineColor="#C4760D"
          >
            ₿
          </Text>

          {/* Bitcoin ₿ symbol - back */}
          <Text
            position={[0, 0, -0.08]}
            rotation={[0, Math.PI, 0]}
            fontSize={1.0}
            color="#1A1A1A"
            anchorX="center"
            anchorY="middle"
            font={undefined}
            outlineWidth={0.02}
            outlineColor="#C4760D"
          >
            ₿
          </Text>

        </group>
      </Float>

      {/* Floating particles */}
      <ParticleSystem />
    </>
  );
}

function ParticleSystem() {
  const count = 120;
  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2;
      const r = 2.2 + Math.random() * 2.5;
      pos[i * 3] = Math.cos(theta) * r;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 3;
      pos[i * 3 + 2] = Math.sin(theta) * r;
      sizes[i] = 0.01 + Math.random() * 0.04;
    }
    return { pos, sizes };
  }, []);

  const pointsRef = useRef<THREE.Points>(null!);
  useFrame((state) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y += 0.001;
      // Gentle vertical wave
      pointsRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.05;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions.pos, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        color="#F7931A"
        size={0.03}
        transparent
        opacity={0.5}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}
