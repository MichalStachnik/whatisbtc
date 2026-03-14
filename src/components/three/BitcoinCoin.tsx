import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import * as THREE from 'three';

export function BitcoinCoin() {
  const groupRef = useRef<THREE.Group>(null!);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += 0.003;
      groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.8) * 0.12;
    }
  });

  return (
    <>
      <ambientLight intensity={0.5} />
      <pointLight position={[5, 5, 5]} intensity={1.5} color="#F7931A" />
      <pointLight position={[-5, -3, 2]} intensity={0.8} color="#ffffff" />
      <directionalLight position={[0, 0, 5]} intensity={0.6} color="#FFD080" />

      <group ref={groupRef}>
        {/* Main coin */}
        <mesh castShadow rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[1.4, 1.4, 0.2, 64]} />
          <meshStandardMaterial
            color="#F7931A"
            metalness={0.7}
            roughness={0.3}
            emissive="#C4760D"
            emissiveIntensity={0.15}
          />
        </mesh>

        {/* Coin face ring detail */}
        <mesh position={[0, 0, 0.11]}>
          <ringGeometry args={[1.05, 1.15, 64]} />
          <meshStandardMaterial color="#C4760D" metalness={0.6} roughness={0.3} />
        </mesh>

        {/* Inner ring */}
        <mesh position={[0, 0, 0.11]}>
          <ringGeometry args={[0.95, 1.0, 64]} />
          <meshStandardMaterial color="#E8850F" metalness={0.6} roughness={0.3} />
        </mesh>

        {/* Bitcoin ₿ symbol - front */}
        <Text
          position={[0, 0, 0.12]}
          fontSize={1.1}
          color="#1A1A1A"
          anchorX="center"
          anchorY="middle"
          font={undefined}
        >
          ₿
        </Text>

        {/* Bitcoin ₿ symbol - back */}
        <Text
          position={[0, 0, -0.12]}
          rotation={[0, Math.PI, 0]}
          fontSize={1.1}
          color="#1A1A1A"
          anchorX="center"
          anchorY="middle"
          font={undefined}
        >
          ₿
        </Text>
      </group>

      {/* Floating particles */}
      <ParticleSystem />
    </>
  );
}

function ParticleSystem() {
  const count = 80;
  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const theta = Math.random() * Math.PI * 2;
    const r = 2.5 + Math.random() * 1.5;
    positions[i * 3] = Math.cos(theta) * r;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 3;
    positions[i * 3 + 2] = Math.sin(theta) * r;
  }

  const pointsRef = useRef<THREE.Points>(null!);
  useFrame(() => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y += 0.002;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        color="#F7931A"
        size={0.04}
        transparent
        opacity={0.7}
        sizeAttenuation
      />
    </points>
  );
}
