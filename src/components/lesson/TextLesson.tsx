import { Suspense, lazy } from 'react';
import type { ContentBlock } from '@/types/content';
import { QuizBlock } from './QuizBlock';
import { BlockchainInteractive } from './BlockchainInteractive';
import { SatoshiCalculator } from './SatoshiCalculator';
import { SceneWrapper } from '@/components/three/SceneWrapper';
import { cn } from '@/lib/cn';

const BitcoinCoin = lazy(() => import('@/components/three/BitcoinCoin').then(m => ({ default: m.BitcoinCoin })));
const BlockchainScene = lazy(() => import('@/components/three/BlockchainScene').then(m => ({ default: m.BlockchainScene })));
const MiningScene = lazy(() => import('@/components/three/MiningScene').then(m => ({ default: m.MiningScene })));
const NetworkScene = lazy(() => import('@/components/three/NetworkScene').then(m => ({ default: m.NetworkScene })));
const UTXOScene = lazy(() => import('@/components/three/UTXOScene').then(m => ({ default: m.UTXOScene })));

const calloutStyles = {
  info: 'border-blue-500/30 bg-blue-500/5',
  warning: 'border-amber-500/30 bg-amber-500/5',
  tip: 'border-emerald-500/30 bg-emerald-500/5',
  'key-concept': 'border-btc-orange/30 bg-btc-orange/5',
};

const calloutAccents = {
  info: 'text-blue-400',
  warning: 'text-amber-400',
  tip: 'text-emerald-400',
  'key-concept': 'text-btc-orange',
};

const calloutLabels = {
  info: 'ℹ Info',
  warning: '⚠ Note',
  tip: '💡 Tip',
  'key-concept': '🔑 Key Concept',
};

const sceneComponents: Record<string, React.ComponentType> = {
  coin: BitcoinCoin,
  blockchain: BlockchainScene,
  mining: MiningScene,
  network: NetworkScene,
  utxo: UTXOScene,
};

const sceneCameras: Record<string, { position: [number, number, number]; fov?: number }> = {
  coin: { position: [0, 0, 4], fov: 50 },
  blockchain: { position: [0, 0.35, 3.2], fov: 68 },
  mining: { position: [0, 0.6, 3.0], fov: 60 },
  network: { position: [0, 0, 6], fov: 65 },
  utxo: { position: [0, 0, 4.2], fov: 62 },
};

interface TextLessonProps {
  blocks: ContentBlock[];
  onXPEarned?: (xp: number) => void;
}

export function TextLesson({ blocks, onXPEarned }: TextLessonProps) {
  return (
    <div className="prose-bitcoin max-w-none">
      {blocks.map((block, idx) => (
        <BlockRenderer key={idx} block={block} onXPEarned={onXPEarned} />
      ))}
    </div>
  );
}

function BlockRenderer({ block, onXPEarned }: { block: ContentBlock; onXPEarned?: (xp: number) => void }) {
  switch (block.type) {
    case 'heading':
      return block.level === 1
        ? <h1 className="text-3xl font-bold text-foreground mb-6 mt-0">{block.text}</h1>
        : block.level === 2
        ? <h2 className="text-2xl font-semibold text-foreground mb-4 mt-8">{block.text}</h2>
        : <h3 className="text-xl font-semibold text-foreground mb-3 mt-6">{block.text}</h3>;

    case 'paragraph':
      return (
        <p className="text-muted-foreground leading-relaxed mb-5 text-base">
          {block.text}
        </p>
      );

    case 'callout': {
      const variant = block.variant ?? 'info';
      return (
        <div className={cn('border-l-4 rounded-r-lg px-5 py-4 my-5', calloutStyles[variant])}>
          <div className={cn('text-xs font-semibold uppercase tracking-wider mb-1.5', calloutAccents[variant])}>
            {calloutLabels[variant]}{block.title ? `: ${block.title}` : ''}
          </div>
          <div className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
            {block.text}
          </div>
        </div>
      );
    }

    case 'code':
      return (
        <pre className="bg-muted rounded-lg p-4 overflow-x-auto text-sm font-mono text-foreground my-5">
          <code>{block.text}</code>
        </pre>
      );

    case 'image':
      return block.src ? (
        <figure className="my-6">
          <img src={block.src} alt={block.alt ?? ''} className="w-full rounded-lg border border-border" />
          {block.caption && <figcaption className="text-xs text-muted-foreground text-center mt-2">{block.caption}</figcaption>}
        </figure>
      ) : null;

    case 'divider':
      return <hr className="border-border my-8" />;

    case 'three-scene': {
      const sceneName = block.sceneName ?? 'coin';

      // Blockchain uses a native CSS interactive component instead of Three.js
      if (sceneName === 'blockchain') {
        return (
          <div className="my-8">
            <BlockchainInteractive />
          </div>
        );
      }

      const SceneComponent = sceneComponents[sceneName];
      const camera = sceneCameras[sceneName];
      if (!SceneComponent) return null;
      return (
        <div className="my-8">
          <SceneWrapper
            height={block.sceneHeight ?? 500}
            camera={camera}
            frameloop="always"
          >
            <Suspense fallback={null}>
              <SceneComponent />
            </Suspense>
          </SceneWrapper>
        </div>
      );
    }

    case 'quiz-inline':
      return block.quizId ? (
        <QuizBlock quizId={block.quizId} onAnswer={(_, xp) => onXPEarned?.(xp)} />
      ) : null;

    case 'satoshi-calculator':
      return <SatoshiCalculator />;

    default:
      return null;
  }
}
