import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { OrbitControls, Line } from '@react-three/drei';
import * as THREE from 'three';

interface Node {
  position: THREE.Vector3;
  label: string;
}

function seededRandom(seed: number) {
  const x = Math.sin(seed + 1) * 10000;
  return x - Math.floor(x);
}

export function NetworkScene() {
  const NODE_COUNT = 14;

  const nodes = useMemo<Node[]>(() => {
    return Array.from({ length: NODE_COUNT }, (_, i) => ({
      position: new THREE.Vector3(
        (seededRandom(i * 3) - 0.5) * 7,
        (seededRandom(i * 3 + 1) - 0.5) * 4.5,
        (seededRandom(i * 3 + 2) - 0.5) * 2
      ),
      label: `Node ${i + 1}`,
    }));
  }, []);

  const connections = useMemo(() => {
    const conns: [number, number][] = [];
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dist = nodes[i].position.distanceTo(nodes[j].position);
        if (dist < 5.0) conns.push([i, j]);
      }
    }
    return conns;
  }, [nodes]);

  const groupRef = useRef<THREE.Group>(null!);
  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.rotation.y += 0.001;
    }
  });

  return (
    <>
      <ambientLight intensity={0.4} />
      <pointLight position={[0, 5, 5]} intensity={1} color="#3B82F6" />
      <OrbitControls enablePan={false} maxDistance={12} minDistance={3} enableDamping dampingFactor={0.05} />

      <group ref={groupRef}>
        {/* Connection lines */}
        {connections.map(([i, j]) => (
          <Line
            key={`${i}-${j}`}
            points={[nodes[i].position.toArray(), nodes[j].position.toArray()]}
            color="#1D4ED8"
            lineWidth={0.8}
            transparent
          />
        ))}

        {/* Nodes */}
        {nodes.map((node, i) => (
          <group key={i} position={node.position}>
            <mesh>
              <sphereGeometry args={[0.35, 16, 16]} />
              <meshStandardMaterial
                color="#3B82F6"
                emissive="#1D4ED8"
                emissiveIntensity={0.6}
                metalness={0.3}
                roughness={0.4}
              />
            </mesh>
            {/* Glow */}
            <mesh>
              <sphereGeometry args={[0.55, 16, 16]} />
              <meshStandardMaterial
                color="#3B82F6"
                transparent
                opacity={0.10}
              />
            </mesh>
          </group>
        ))}
      </group>
    </>
  );
}
