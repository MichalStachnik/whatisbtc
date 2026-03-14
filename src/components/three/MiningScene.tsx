import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';

function simpleHash(input: string): string {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  const hex = Math.abs(hash).toString(16).padStart(8, '0');
  return (hex + hex + hex + hex + hex + hex + hex + hex).slice(0, 64);
}

export function MiningScene() {
  const nonceRef = useRef(0);
  const [displayNonce, setDisplayNonce] = useState(0);
  const [displayHash, setDisplayHash] = useState('0000000000000000000000000000000000000000000000000000000000000000');
  const [found, setFound] = useState(false);
  const frameCount = useRef(0);

  const TARGET_NONCE = 14237;
  const TARGET_PREFIX = '0000';

  useFrame(() => {
    if (found) return;
    frameCount.current++;
    if (frameCount.current % 3 !== 0) return;

    nonceRef.current = (nonceRef.current + 1) % 100000;
    const hash = simpleHash(`block_data_nonce_${nonceRef.current}`);
    setDisplayNonce(nonceRef.current);
    setDisplayHash(hash);

    if (nonceRef.current === TARGET_NONCE) {
      setFound(true);
    }

    if (nonceRef.current > TARGET_NONCE && found) {
      nonceRef.current = 0;
      setFound(false);
    }
  });

  const isValid = displayHash.startsWith(TARGET_PREFIX);
  const hashColor = isValid ? '#10B981' : found ? '#10B981' : '#94A3B8';

  return (
    <>
      <ambientLight intensity={0.5} />
      <pointLight position={[0, 3, 3]} intensity={1} color={isValid ? '#10B981' : '#3B82F6'} />

      {/* Title */}
      <Text position={[0, 1.55, 0]} fontSize={0.30} color="#F7931A" anchorX="center" anchorY="middle" font={undefined}>
        Mining Simulator
      </Text>

      {/* Nonce */}
      <Text position={[0, 0.75, 0]} fontSize={0.22} color="#94A3B8" anchorX="center" anchorY="middle">
        Nonce: {displayNonce.toString().padStart(6, '0')}
      </Text>

      {/* Hash output */}
      <Text position={[0, 0.1, 0]} fontSize={0.13} color={hashColor} anchorX="center" anchorY="middle" maxWidth={7}>
        {displayHash.slice(0, 32)}
      </Text>
      <Text position={[0, -0.2, 0]} fontSize={0.13} color={hashColor} anchorX="center" anchorY="middle" maxWidth={7}>
        {displayHash.slice(32, 64)}
      </Text>

      {/* Status */}
      <Text position={[0, -0.7, 0]} fontSize={0.20} color={isValid ? '#10B981' : '#EF4444'} anchorX="center" anchorY="middle">
        {isValid ? '✓ Valid Hash Found!' : `Target: starts with "${TARGET_PREFIX}"`}
      </Text>

      {/* Progress bar background */}
      <mesh position={[0, -1.2, 0]}>
        <boxGeometry args={[5.5, 0.15, 0.01]} />
        <meshStandardMaterial color="#2A2A2A" />
      </mesh>

      {/* Progress bar fill */}
      <mesh position={[(-5.5 + Math.min(displayNonce / TARGET_NONCE, 1) * 5.5) / 2, -1.2, 0.01]}>
        <boxGeometry args={[Math.min(displayNonce / TARGET_NONCE, 1) * 5.5, 0.13, 0.01]} />
        <meshStandardMaterial color={isValid ? '#10B981' : '#F7931A'} emissive={isValid ? '#10B981' : '#F7931A'} emissiveIntensity={0.3} />
      </mesh>
    </>
  );
}
