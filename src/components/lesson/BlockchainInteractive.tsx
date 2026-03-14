import { useState, useEffect, useCallback, useRef } from 'react';
import { cn } from '@/lib/cn';

// ---------------------------------------------------------------------------
// Synchronous SHA-256 (no external deps, no async)
// ---------------------------------------------------------------------------
function sha256(message: string): string {
  const H = [
    0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a,
    0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19,
  ];
  const K = [
    0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
    0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
    0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
    0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
    0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
    0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
    0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
    0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2,
  ];

  const r = (x: number, n: number) => (x >>> n) | (x << (32 - n));

  // UTF-8 encode
  const bytes: number[] = [];
  for (let i = 0; i < message.length; i++) {
    const c = message.charCodeAt(i);
    if (c < 0x80) { bytes.push(c); }
    else if (c < 0x800) { bytes.push(0xc0 | (c >> 6), 0x80 | (c & 0x3f)); }
    else { bytes.push(0xe0 | (c >> 12), 0x80 | ((c >> 6) & 0x3f), 0x80 | (c & 0x3f)); }
  }

  const msgLen = bytes.length;
  bytes.push(0x80);
  while (bytes.length % 64 !== 56) bytes.push(0);
  const bitLen = msgLen * 8;
  for (let i = 7; i >= 0; i--) bytes.push(Math.floor(bitLen / Math.pow(2, i * 8)) & 0xff);

  const hash = [...H];
  for (let off = 0; off < bytes.length; off += 64) {
    const w = new Array<number>(64);
    for (let i = 0; i < 16; i++) {
      w[i] = (bytes[off + i * 4] << 24) | (bytes[off + i * 4 + 1] << 16) |
              (bytes[off + i * 4 + 2] << 8) | bytes[off + i * 4 + 3];
    }
    for (let i = 16; i < 64; i++) {
      const s0 = r(w[i - 15], 7) ^ r(w[i - 15], 18) ^ (w[i - 15] >>> 3);
      const s1 = r(w[i - 2], 17) ^ r(w[i - 2], 19) ^ (w[i - 2] >>> 10);
      w[i] = (w[i - 16] + s0 + w[i - 7] + s1) | 0;
    }
    let [a, b, c, d, e, f, g, h] = hash;
    for (let i = 0; i < 64; i++) {
      const S1 = r(e, 6) ^ r(e, 11) ^ r(e, 25);
      const ch = (e & f) ^ (~e & g);
      const t1 = (h + S1 + ch + K[i] + w[i]) | 0;
      const S0 = r(a, 2) ^ r(a, 13) ^ r(a, 22);
      const maj = (a & b) ^ (a & c) ^ (b & c);
      const t2 = (S0 + maj) | 0;
      h = g; g = f; f = e; e = (d + t1) | 0;
      d = c; c = b; b = a; a = (t1 + t2) | 0;
    }
    hash[0] = (hash[0] + a) | 0; hash[1] = (hash[1] + b) | 0;
    hash[2] = (hash[2] + c) | 0; hash[3] = (hash[3] + d) | 0;
    hash[4] = (hash[4] + e) | 0; hash[5] = (hash[5] + f) | 0;
    hash[6] = (hash[6] + g) | 0; hash[7] = (hash[7] + h) | 0;
  }
  return hash.map(v => (v >>> 0).toString(16).padStart(8, '0')).join('');
}

// Fast async SHA-256 via native Web Crypto (for mining)
async function sha256async(str: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(str));
  return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, '0')).join('');
}

// ---------------------------------------------------------------------------
// Types & helpers
// ---------------------------------------------------------------------------
const DIFFICULTY = '0000';
const GENESIS_PREV = '0000000000000000000000000000000000000000000000000000000000000000';

function blockInput(index: number, nonce: number, data: string, prevHash: string) {
  return `${index}${nonce}${data}${prevHash}`;
}

function computeHash(index: number, nonce: number, data: string, prevHash: string) {
  return sha256(blockInput(index, nonce, data, prevHash));
}

interface Block {
  index: number;
  nonce: number;
  data: string;
  prevHash: string;
  hash: string;
}

const DEFAULT_DATA = [
  '',
  'Alice → Bob: 50 BTC',
  'Bob → Carol: 25 BTC',
];

function buildInitialBlocks(): Block[] {
  const blocks: Block[] = [];
  for (let i = 0; i < 3; i++) {
    const prevHash = i === 0 ? GENESIS_PREV : blocks[i - 1].hash;
    const data = DEFAULT_DATA[i];
    blocks.push({ index: i, nonce: 0, data, prevHash, hash: computeHash(i, 0, data, prevHash) });
  }
  return blocks;
}

// ---------------------------------------------------------------------------
// Single block card
// ---------------------------------------------------------------------------
interface BlockCardProps {
  block: Block;
  isMining: boolean;
  onNonceChange: (v: number) => void;
  onDataChange: (v: string) => void;
  onMine: () => void;
  onStop: () => void;
}

function BlockCard({ block, isMining, onNonceChange, onDataChange, onMine, onStop }: BlockCardProps) {
  const valid = block.hash.startsWith(DIFFICULTY);

  return (
    <div
      className={cn(
        'blockchain-card flex-none w-72 rounded-xl border-2 p-4 flex flex-col gap-3 transition-all duration-300',
        valid ? 'border-emerald-500 bg-emerald-950/20' : 'border-red-500 bg-red-950/20',
        isMining && 'animate-mining-pulse',
      )}
      style={{ background: valid ? 'rgba(16,43,29,0.6)' : 'rgba(43,16,16,0.6)' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold tracking-widest uppercase text-muted-foreground">Block</span>
        <span
          className={cn(
            'text-lg font-bold font-mono',
            valid ? 'text-emerald-400' : 'text-red-400',
          )}
        >
          #{block.index}
        </span>
      </div>

      {/* Nonce */}
      <div className="flex flex-col gap-1">
        <label className="text-xs text-muted-foreground uppercase tracking-wide">Nonce</label>
        <input
          type="number"
          value={block.nonce}
          onChange={e => onNonceChange(parseInt(e.target.value, 10) || 0)}
          disabled={isMining}
          className={cn(
            'bg-background/60 border border-border rounded-md px-3 py-1.5 text-sm font-mono text-foreground',
            'focus:outline-none focus:ring-1 focus:ring-btc-orange/60 transition-colors',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            isMining && 'animate-nonce-spin text-yellow-400 border-yellow-500/50',
          )}
        />
      </div>

      {/* Data */}
      <div className="flex flex-col gap-1">
        <label className="text-xs text-muted-foreground uppercase tracking-wide">Data</label>
        <textarea
          value={block.data}
          onChange={e => onDataChange(e.target.value)}
          disabled={isMining}
          rows={2}
          placeholder="Transaction data..."
          className={cn(
            'bg-background/60 border border-border rounded-md px-3 py-2 text-sm font-mono text-foreground resize-none',
            'focus:outline-none focus:ring-1 focus:ring-btc-orange/60 transition-colors',
            'placeholder:text-muted-foreground/40 disabled:opacity-50 disabled:cursor-not-allowed',
          )}
        />
      </div>

      {/* Prev hash */}
      <div className="flex flex-col gap-1">
        <label className="text-xs text-muted-foreground uppercase tracking-wide">Prev</label>
        <div className="bg-background/40 border border-border/50 rounded-md px-3 py-1.5 text-xs font-mono text-blue-400 break-all leading-relaxed">
          {block.prevHash}
        </div>
      </div>

      {/* Hash */}
      <div className="flex flex-col gap-1">
        <label className="text-xs text-muted-foreground uppercase tracking-wide">Hash</label>
        <div
          className={cn(
            'rounded-md px-3 py-2 text-xs font-mono break-all leading-relaxed border transition-all duration-300',
            valid
              ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300'
              : 'bg-red-950/60 border-red-500/40 text-red-300',
            isMining && 'animate-hash-flicker',
          )}
        >
          {block.hash}
        </div>
      </div>

      {/* Mine button */}
      <button
        onClick={isMining ? onStop : onMine}
        className={cn(
          'mt-1 w-full rounded-lg px-4 py-2 text-sm font-semibold transition-all duration-200',
          isMining
            ? 'bg-yellow-500/20 border border-yellow-500/40 text-yellow-300 hover:bg-yellow-500/30'
            : valid
            ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/30 cursor-default'
            : 'bg-btc-orange/90 text-black hover:bg-btc-orange cursor-pointer active:scale-95',
        )}
      >
        {isMining ? (
          <span className="flex items-center justify-center gap-2">
            <span className="inline-block w-3 h-3 border-2 border-yellow-300 border-t-transparent rounded-full animate-spin" />
            Mining…
          </span>
        ) : valid ? '✓ Valid' : 'Mine'}
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Chain arrow
// ---------------------------------------------------------------------------
function ChainArrow({ valid }: { valid: boolean }) {
  return (
    <div className="flex-none flex flex-col items-center justify-center self-center gap-1 px-1">
      <div
        className={cn(
          'h-0.5 w-8 transition-colors duration-300',
          valid ? 'bg-emerald-500' : 'bg-red-500/50',
        )}
      />
      <svg
        width="12"
        height="8"
        viewBox="0 0 12 8"
        className={cn('transition-colors duration-300', valid ? 'text-emerald-500' : 'text-red-500/50')}
      >
        <path d="M0 4 L8 4 M6 1 L10 4 L6 7" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------
export function BlockchainInteractive() {
  const [blocks, setBlocks] = useState<Block[]>(() => buildInitialBlocks());
  const [mining, setMining] = useState<Record<number, boolean>>({});
  const stopFlags = useRef<Record<number, boolean>>({});

  // Recompute hashes for blocks at `fromIndex` and beyond
  const recomputeFrom = useCallback((fromIndex: number, base: Block[]): Block[] => {
    const updated = base.map(b => ({ ...b }));
    for (let i = fromIndex; i < updated.length; i++) {
      if (i > 0) updated[i].prevHash = updated[i - 1].hash;
      updated[i].hash = computeHash(updated[i].index, updated[i].nonce, updated[i].data, updated[i].prevHash);
    }
    return updated;
  }, []);

  const handleNonceChange = useCallback((index: number, nonce: number) => {
    setBlocks(prev => recomputeFrom(index, prev.map((b, i) => i === index ? { ...b, nonce } : b)));
  }, [recomputeFrom]);

  const handleDataChange = useCallback((index: number, data: string) => {
    setBlocks(prev => recomputeFrom(index, prev.map((b, i) => i === index ? { ...b, data } : b)));
  }, [recomputeFrom]);

  const handleStop = useCallback((index: number) => {
    stopFlags.current[index] = true;
    setMining(prev => ({ ...prev, [index]: false }));
  }, []);

  const handleMine = useCallback(async (index: number) => {
    stopFlags.current[index] = false;
    setMining(prev => ({ ...prev, [index]: true }));

    // Snapshot current block state
    let block!: Block;
    setBlocks(prev => { block = prev[index]; return prev; });
    await new Promise(r => setTimeout(r, 20)); // let state settle

    const BATCH = 2000;
    let nonce = 0;
    let found = false;

    outer: while (!stopFlags.current[index]) {
      // Batch: fire BATCH parallel async SHA-256s via native Web Crypto
      const inputs = Array.from({ length: BATCH }, (_, j) =>
        blockInput(block.index, nonce + j, block.data, block.prevHash)
      );
      const hashes = await Promise.all(inputs.map(sha256async));

      for (let j = 0; j < BATCH; j++) {
        if (hashes[j].startsWith(DIFFICULTY)) {
          found = true;
          nonce = nonce + j;
          const hash = hashes[j];
          setMining(m => ({ ...m, [index]: false }));
          setBlocks(p => {
            const updated = p.map((b, i) => i === index ? { ...b, nonce, hash } : b);
            return recomputeFrom(index + 1, updated);
          });
          break outer;
        }
      }

      // Show progress (last hash of batch)
      const progressNonce = nonce + BATCH - 1;
      const progressHash = hashes[BATCH - 1];
      setBlocks(p => p.map((b, i) => i === index ? { ...b, nonce: progressNonce, hash: progressHash } : b));
      nonce += BATCH;
      await new Promise(r => setTimeout(r, 0)); // yield to browser
    }

    if (!found) {
      setMining(m => ({ ...m, [index]: false }));
    }
  }, [recomputeFrom]);

  // Stop all mining on unmount
  useEffect(() => {
    return () => {
      Object.keys(stopFlags.current).forEach(k => { stopFlags.current[+k] = true; });
    };
  }, []);

  return (
    <div className="blockchain-interactive rounded-xl border border-border/40 bg-card/50 p-5 backdrop-blur-sm">
      <style>{`
        @keyframes miningPulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(234,179,8,0); }
          50% { box-shadow: 0 0 0 6px rgba(234,179,8,0.2); }
        }
        @keyframes hashFlicker {
          0%, 100% { opacity: 1; }
          25% { opacity: 0.4; }
          50% { opacity: 0.8; }
          75% { opacity: 0.3; }
        }
        @keyframes nonceSpin {
          0% { transform: translateY(0); }
          50% { transform: translateY(-2px); }
          100% { transform: translateY(0); }
        }
        .animate-mining-pulse { animation: miningPulse 1s ease-in-out infinite; }
        .animate-hash-flicker { animation: hashFlicker 0.15s ease-in-out infinite; }
        .animate-nonce-spin { animation: nonceSpin 0.08s ease-in-out infinite; }
      `}</style>

      {/* Header */}
      <div className="mb-5 flex items-center justify-between flex-wrap gap-2">
        <div>
          <h3 className="text-base font-semibold text-foreground">Interactive Blockchain</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Edit data or nonce — watch the chain break. Hit <span className="text-btc-orange font-medium">Mine</span> to find a valid hash.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="text-muted-foreground">difficulty:</span>
          <span className="text-btc-orange font-bold tracking-wider">{DIFFICULTY}…</span>
        </div>
      </div>

      {/* Legend */}
      <div className="flex gap-4 mb-4 text-xs">
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500 inline-block" />
          <span className="text-muted-foreground">Valid block</span>
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-sm bg-red-500 inline-block" />
          <span className="text-muted-foreground">Invalid block</span>
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-sm bg-blue-500 inline-block" />
          <span className="text-muted-foreground">Prev hash</span>
        </span>
      </div>

      {/* Blocks */}
      <div className="overflow-x-auto pb-2">
        <div className="flex items-stretch min-w-max gap-0">
          {blocks.map((block, i) => (
            <div key={block.index} className="flex items-center">
              <BlockCard
                block={block}
                isMining={!!mining[block.index]}
                onNonceChange={v => handleNonceChange(block.index, v)}
                onDataChange={v => handleDataChange(block.index, v)}
                onMine={() => handleMine(block.index)}
                onStop={() => handleStop(block.index)}
              />
              {i < blocks.length - 1 && (
                <ChainArrow valid={blocks[i + 1].prevHash === block.hash} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Footer callout */}
      <div className="mt-4 text-xs text-muted-foreground border-t border-border/30 pt-3 leading-relaxed">
        <span className="text-btc-orange font-medium">Why it's tamper-proof:</span>{' '}
        Change any block's data → its hash changes → the next block's "Prev" no longer matches → that block becomes invalid,
        and so on down the chain. An attacker must re-mine every subsequent block to cover their tracks — computationally infeasible in a real network.
      </div>
    </div>
  );
}
