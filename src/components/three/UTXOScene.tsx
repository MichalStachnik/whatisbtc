import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import * as THREE from 'three';

const INPUTS = [
  { label: 'Input UTXO\n0.5 BTC', y: 0.9 },
  { label: 'Input UTXO\n0.3 BTC', y: -0.9 },
];

const OUTPUTS = [
  { label: 'Recipient\n0.6 BTC', y: 0.9, color: '#10B981' },
  { label: 'Change\n0.19 BTC', y: -0.9, color: '#F7931A' },
];

function Box({ position, label, color = '#3B82F6' }: { position: [number, number, number]; label: string; color?: string }) {
  return (
    <group position={position}>
      <mesh>
        <boxGeometry args={[1.4, 0.85, 0.2]} />
        <meshStandardMaterial color={color} metalness={0.3} roughness={0.5} transparent opacity={0.8} />
      </mesh>
      <Text position={[0, 0, 0.11]} fontSize={0.13} color="#ffffff" anchorX="center" anchorY="middle" maxWidth={1.3}>
        {label}
      </Text>
    </group>
  );
}

export function UTXOScene() {
  const particle1 = useRef<THREE.Mesh>(null!);
  const particle2 = useRef<THREE.Mesh>(null!);
  const particle3 = useRef<THREE.Mesh>(null!);
  const particle4 = useRef<THREE.Mesh>(null!);

  const progress = useRef([0, 0.5, 0.25, 0.75]);

  useFrame(() => {
    progress.current = progress.current.map(p => (p + 0.008) % 1);

    const refs = [particle1, particle2, particle3, particle4];
    const routes = [
      { startY: 0.9, endY: 0.9 },
      { startY: 0.9, endY: -0.9 },
      { startY: -0.9, endY: 0.9 },
      { startY: -0.9, endY: -0.9 },
    ];

    refs.forEach((ref, i) => {
      if (!ref.current) return;
      const t = progress.current[i];
      const route = routes[i];
      const x = -1.85 + t * 3.7;
      const midY = (route.startY + route.endY) / 2;
      const y = route.startY * (1 - t) * (1 - t) + midY * 2 * t * (1 - t) + route.endY * t * t;
      ref.current.position.set(x, y, 0.1);
      const mat = ref.current.material as THREE.MeshStandardMaterial;
      mat.opacity = t > 0.05 && t < 0.95 ? 0.9 : 0;
    });
  });

  const particleMeshes = [particle1, particle2, particle3, particle4];
  const particleColors = ['#10B981', '#10B981', '#F7931A', '#F7931A'];

  return (
    <>
      <ambientLight intensity={0.6} />
      <pointLight position={[0, 3, 3]} intensity={1} color="#F7931A" />

      {/* Input boxes */}
      {INPUTS.map((inp, i) => (
        <Box key={i} position={[-2.2, inp.y, 0]} label={inp.label} color="#1D4ED8" />
      ))}

      {/* Center: transaction */}
      <group position={[0, 0, 0]}>
        <mesh>
          <boxGeometry args={[0.85, 2.2, 0.2]} />
          <meshStandardMaterial color="#F7931A" metalness={0.5} roughness={0.3} transparent opacity={0.3} />
        </mesh>
        <Text position={[0, 0.6, 0.11]} fontSize={0.16} color="#F7931A" anchorX="center">TX</Text>
        <Text position={[0, 0.1, 0.11]} fontSize={0.12} color="#ffffff" anchorX="center">0.8 BTC</Text>
        <Text position={[0, -0.45, 0.11]} fontSize={0.10} color="#94A3B8" anchorX="center">fee: 0.01</Text>
      </group>

      {/* Output boxes */}
      {OUTPUTS.map((out, i) => (
        <Box key={i} position={[2.2, out.y, 0]} label={out.label} color={out.color} />
      ))}

      {/* Animated particles */}
      {particleMeshes.map((ref, i) => (
        <mesh key={i} ref={ref} position={[-1.85, i < 2 ? 0.9 : -0.9, 0.1]}>
          <sphereGeometry args={[0.06, 8, 8]} />
          <meshStandardMaterial
            color={particleColors[i]}
            emissive={particleColors[i]}
            emissiveIntensity={1}
            transparent
            opacity={0}
          />
        </mesh>
      ))}
    </>
  );
}
