import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, Line } from '@react-three/drei';
import * as THREE from 'three';

const BLOCKS = [
  { index: 0, hash: '000000a1b2c3...', prevHash: '0000000000...', txCount: 0, time: '2009-01-03' },
  { index: 1, hash: '000000d4e5f6...', prevHash: '000000a1b2c3...', txCount: 1, time: '2009-01-09' },
  { index: 2, hash: '000000g7h8i9...', prevHash: '000000d4e5f6...', txCount: 3, time: '2009-01-12' },
  { index: 3, hash: '000000j0k1l2...', prevHash: '000000g7h8i9...', txCount: 12, time: '2010-05-22' },
  { index: 4, hash: '000000m3n4o5...', prevHash: '000000j0k1l2...', txCount: 47, time: '2010-11-06' },
];

interface BlockMeshProps {
  position: [number, number, number];
  block: typeof BLOCKS[0];
  isSelected: boolean;
  onClick: () => void;
}

function BlockMesh({ position, block, isSelected, onClick }: BlockMeshProps) {
  const meshRef = useRef<THREE.Mesh>(null!);
  useFrame(() => {
    if (meshRef.current) {
      const target = isSelected ? 1.12 : 1;
      meshRef.current.scale.lerp(new THREE.Vector3(target, target, target), 0.1);
    }
  });

  return (
    <mesh
      ref={meshRef}
      position={position}
      onClick={(e) => { e.stopPropagation(); onClick(); }}
    >
      <boxGeometry args={[1.1, 2.2, 0.35]} />
      <meshStandardMaterial
        color={isSelected ? '#F7931A' : '#1A1A2E'}
        emissive={isSelected ? '#F7931A' : '#3B82F6'}
        emissiveIntensity={isSelected ? 0.3 : 0.05}
        metalness={0.5}
        roughness={0.3}
      />
      <Text
        position={[0, 0.6, 0.18]}
        fontSize={0.15}
        color={isSelected ? '#000' : '#94A3B8'}
        anchorX="center"
        anchorY="middle"
        maxWidth={1.0}
      >
        {`Block #${block.index}`}
      </Text>
      <Text
        position={[0, 0.15, 0.18]}
        fontSize={0.07}
        color={isSelected ? '#00000099' : '#64748B'}
        anchorX="center"
        anchorY="middle"
        maxWidth={1.0}
      >
        {block.hash}
      </Text>
      <Text
        position={[0, -0.3, 0.18]}
        fontSize={0.11}
        color={isSelected ? '#00000099' : '#3B82F6'}
        anchorX="center"
        anchorY="middle"
      >
        {block.txCount === 0 ? 'Genesis' : `${block.txCount} txs`}
      </Text>
      <Text
        position={[0, -0.65, 0.18]}
        fontSize={0.09}
        color={isSelected ? '#00000099' : '#475569'}
        anchorX="center"
        anchorY="middle"
      >
        {block.time}
      </Text>
    </mesh>
  );
}

interface BlockchainSceneProps {
  onBlockSelect?: (block: typeof BLOCKS[0] | null) => void;
}

export function BlockchainScene({ onBlockSelect }: BlockchainSceneProps) {
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const spacing = 1.4;

  const handleClick = (idx: number) => {
    const newIdx = selectedIdx === idx ? null : idx;
    setSelectedIdx(newIdx);
    onBlockSelect?.(newIdx !== null ? BLOCKS[newIdx] : null);
  };

  return (
    <>
      <ambientLight intensity={0.6} />
      <pointLight position={[0, 5, 5]} intensity={1} color="#3B82F6" />
      <pointLight position={[0, -3, 2]} intensity={0.5} color="#F7931A" />

      {/* Scene title */}
      <Text position={[0, 1.8, 0]} fontSize={0.24} color="#F7931A" anchorX="center" anchorY="middle">
        Bitcoin Blockchain
      </Text>

      {BLOCKS.map((block, i) => {
        const x = (i - 2) * spacing;
        return (
          <group key={block.index}>
            <BlockMesh
              position={[x, 0, 0]}
              block={block}
              isSelected={selectedIdx === i}
              onClick={() => handleClick(i)}
            />
            {i < BLOCKS.length - 1 && (
              <Line
                points={[[x + 0.55, 0, 0], [x + spacing - 0.55, 0, 0]]}
                color="#3B82F6"
                lineWidth={2}
                dashed={false}
              />
            )}
          </group>
        );
      })}
    </>
  );
}

export function BlockInfoPanel({ block }: { block: typeof BLOCKS[0] | null }) {
  if (!block) return (
    <div className="text-center text-muted-foreground text-sm py-4">
      Click a block to inspect its contents
    </div>
  );

  return (
    <div className="bg-card border border-btc-orange/30 rounded-lg p-4 text-sm space-y-2 animate-fade-in">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-2 h-2 rounded-full bg-btc-orange" />
        <span className="font-semibold text-foreground">Block #{block.index}</span>
        <span className="text-muted-foreground text-xs">{block.time}</span>
      </div>
      <div className="space-y-1.5 font-mono text-xs">
        <div className="flex gap-2">
          <span className="text-muted-foreground w-20 shrink-0">Hash:</span>
          <span className="text-btc-orange truncate">{block.hash}</span>
        </div>
        <div className="flex gap-2">
          <span className="text-muted-foreground w-20 shrink-0">Prev Hash:</span>
          <span className="text-blue-400 truncate">{block.prevHash}</span>
        </div>
        <div className="flex gap-2">
          <span className="text-muted-foreground w-20 shrink-0">Tx Count:</span>
          <span className="text-foreground">{block.txCount}</span>
        </div>
      </div>
    </div>
  );
}
