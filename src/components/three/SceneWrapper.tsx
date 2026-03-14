import { Suspense, ReactNode, Component, ErrorInfo } from 'react';
import { Canvas } from '@react-three/fiber';
import { cn } from '@/lib/cn';

interface SceneWrapperProps {
  children: ReactNode;
  height?: number;
  className?: string;
  frameloop?: 'always' | 'demand' | 'never';
  camera?: { position: [number, number, number]; fov?: number };
}

// WebGL/Canvas is browser-only — skip rendering on the server
const isClient = typeof window !== 'undefined';

// Error boundary to catch 3D scene errors without crashing the page
class CanvasErrorBoundary extends Component<
  { children: ReactNode; fallback: ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: ReactNode; fallback: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.warn('[SceneWrapper] 3D scene error:', error.message, info.componentStack?.split('\n')[1]?.trim());
  }

  render() {
    if (this.state.hasError) return this.props.fallback;
    return this.props.children;
  }
}

export function SceneWrapper({
  children,
  height = 400,
  className,
  frameloop = 'always',
  camera = { position: [0, 0, 6], fov: 60 },
}: SceneWrapperProps) {
  const containerClass = cn(
    'w-full rounded-xl overflow-hidden border border-border bg-card/30',
    className,
  );

  if (!isClient) {
    // Server: render a placeholder div — no WebGL on the server
    return <div className={containerClass} style={{ height }} />;
  }

  const fallback = <div className={containerClass} style={{ height }} />;

  return (
    <CanvasErrorBoundary fallback={fallback}>
      <div className={containerClass} style={{ height }}>
        <Canvas
          frameloop={frameloop}
          camera={camera}
          gl={{ antialias: true }}
          dpr={[1, 2]}
        >
          <Suspense fallback={null}>
            {children}
          </Suspense>
        </Canvas>
      </div>
    </CanvasErrorBoundary>
  );
}
