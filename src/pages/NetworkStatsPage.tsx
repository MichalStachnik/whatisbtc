import { useEffect, useState, useCallback } from 'react';
import { Activity, Zap, Box, TrendingUp, Clock, BarChart3, RefreshCw } from 'lucide-react';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { cn } from '@/lib/cn';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Fees {
  fastestFee: number;
  halfHourFee: number;
  hourFee: number;
  economyFee: number;
  minimumFee: number;
}

interface Mempool {
  count: number;
  vsize: number;
  total_fee: number;
}

interface DifficultyAdjustment {
  progressPercent: number;
  difficultyChange: number;
  estimatedRetargetDate: number;
  remainingBlocks: number;
  nextRetargetHeight: number;
  timeAvg: number;
}

interface Block {
  id: string;
  height: number;
  timestamp: number;
  tx_count: number;
  size: number;
  weight: number;
}

interface Pool {
  poolId: number;
  name: string;
  blockCount: number;
  rank: number;
  slug: string;
}

interface NetworkData {
  fees: Fees | null;
  mempool: Mempool | null;
  difficulty: DifficultyAdjustment | null;
  blocks: Block[];
  pools: Pool[];
  blockHeight: number | null;
  btcPrice: number | null;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatBytes(bytes: number): string {
  if (bytes >= 1_000_000) return `${(bytes / 1_000_000).toFixed(1)} MB`;
  if (bytes >= 1_000) return `${(bytes / 1_000).toFixed(0)} KB`;
  return `${bytes} B`;
}

function formatAge(timestamp: number): string {
  const diff = Math.floor(Date.now() / 1000 - timestamp);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  return `${Math.floor(diff / 3600)}h ago`;
}

function formatBlockTime(ms: number): string {
  const mins = Math.round(ms / 1000 / 60);
  return `${mins}m`;
}

async function safeFetch<T>(url: string): Promise<T | null> {
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatCard({ label, value, sub, accent = false }: { label: string; value: string; sub?: string; accent?: boolean }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4 flex flex-col gap-1">
      <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{label}</div>
      <div className={cn('text-2xl font-bold font-mono', accent ? 'text-btc-orange' : 'text-foreground')}>{value}</div>
      {sub && <div className="text-xs text-muted-foreground">{sub}</div>}
    </div>
  );
}

function FeeCard({ label, fee, colorClass }: { label: string; fee: number; colorClass: string }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4 flex flex-col items-center gap-2">
      <div className={cn('w-2.5 h-2.5 rounded-full', colorClass)} />
      <div className={cn('text-2xl font-bold font-mono', colorClass.includes('green') ? 'text-emerald-400' : colorClass.includes('yellow') ? 'text-amber-400' : colorClass.includes('orange') ? 'text-orange-400' : 'text-red-400')}>
        {fee}
      </div>
      <div className="text-xs text-muted-foreground text-center leading-tight">sat/vB</div>
      <div className="text-xs font-medium text-foreground text-center">{label}</div>
    </div>
  );
}

function BlockRow({ block }: { block: Block }) {
  return (
    <div className="flex items-center gap-3 px-4 py-3 border-b border-border/50 last:border-0 hover:bg-btc-orange/5 transition-colors">
      <div className="w-8 h-8 rounded bg-btc-orange/10 border border-btc-orange/20 flex items-center justify-center flex-shrink-0">
        <Box className="w-3.5 h-3.5 text-btc-orange" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-mono font-semibold text-foreground text-sm">#{block.height.toLocaleString()}</div>
        <div className="text-xs text-muted-foreground">{formatAge(block.timestamp)}</div>
      </div>
      <div className="text-right">
        <div className="text-sm font-medium text-foreground">{block.tx_count.toLocaleString()} txs</div>
        <div className="text-xs text-muted-foreground">{formatBytes(block.size)}</div>
      </div>
    </div>
  );
}

function PoolBar({ pool, totalBlocks }: { pool: Pool; totalBlocks: number }) {
  const pct = totalBlocks > 0 ? (pool.blockCount / totalBlocks) * 100 : 0;
  const colors = [
    'bg-btc-orange', 'bg-blue-500', 'bg-emerald-500', 'bg-purple-500',
    'bg-pink-500', 'bg-cyan-500', 'bg-amber-500', 'bg-rose-500',
  ];
  const color = colors[(pool.rank - 1) % colors.length];

  return (
    <div className="flex items-center gap-3">
      <div className="w-24 text-xs text-muted-foreground truncate text-right">{pool.name}</div>
      <div className="flex-1 h-5 bg-muted rounded overflow-hidden">
        <div
          className={cn('h-full rounded transition-all', color)}
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="w-16 text-xs font-mono text-foreground text-right">{pct.toFixed(1)}%</div>
      <div className="w-12 text-xs text-muted-foreground text-right">{pool.blockCount}b</div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function NetworkStatsPage() {
  const [data, setData] = useState<NetworkData>({
    fees: null, mempool: null, difficulty: null,
    blocks: [], pools: [], blockHeight: null, btcPrice: null,
  });
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchAll = useCallback(async () => {
    const [fees, mempool, difficulty, blocks, poolsRes, blockHeight, priceRes] = await Promise.all([
      safeFetch<Fees>('https://mempool.space/api/v1/fees/recommended'),
      safeFetch<Mempool>('https://mempool.space/api/mempool'),
      safeFetch<DifficultyAdjustment>('https://mempool.space/api/v1/difficulty-adjustment'),
      safeFetch<Block[]>('https://mempool.space/api/blocks'),
      safeFetch<{ pools: Pool[] }>('https://mempool.space/api/v1/mining/pools/3d'),
      safeFetch<number>('https://mempool.space/api/blocks/tip/height'),
      safeFetch<{ bitcoin: { usd: number } }>(
        'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd'
      ),
    ]);

    setData({
      fees,
      mempool,
      difficulty,
      blocks: blocks?.slice(0, 10) ?? [],
      pools: poolsRes?.pools?.slice(0, 8) ?? [],
      blockHeight: typeof blockHeight === 'number' ? blockHeight : null,
      btcPrice: priceRes?.bitcoin?.usd ?? null,
    });
    setLastUpdated(new Date());
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchAll();
    const id = setInterval(fetchAll, 30_000);
    return () => clearInterval(id);
  }, [fetchAll]);

  const totalPoolBlocks = data.pools.reduce((s, p) => s + p.blockCount, 0);

  return (
    <PageWrapper fullBleed>
      {/* Page header */}
      <div className="border-b border-border/50 bg-card/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Activity className="w-5 h-5 text-btc-orange" />
                <h1 className="text-2xl font-bold text-foreground">Bitcoin Network Stats</h1>
                <span className={cn(
                  'inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border',
                  loading
                    ? 'text-muted-foreground border-border'
                    : 'text-emerald-400 border-emerald-400/30 bg-emerald-400/5'
                )}>
                  <span className={cn('w-1.5 h-1.5 rounded-full', loading ? 'bg-muted-foreground' : 'bg-emerald-400 animate-pulse')} />
                  {loading ? 'Loading…' : 'Live'}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                Real-time data from the Bitcoin network via mempool.space
                {lastUpdated && ` · Updated ${lastUpdated.toLocaleTimeString()}`}
              </p>
            </div>
            <div className="flex items-center gap-4">
              {data.btcPrice && (
                <div className="text-right">
                  <div className="text-xs text-muted-foreground">BTC Price</div>
                  <div className="text-xl font-bold text-btc-orange font-mono">
                    ${data.btcPrice.toLocaleString('en-US')}
                  </div>
                </div>
              )}
              {data.blockHeight && (
                <div className="text-right">
                  <div className="text-xs text-muted-foreground">Block Height</div>
                  <div className="text-xl font-bold text-foreground font-mono">
                    #{data.blockHeight.toLocaleString()}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">

        {/* Fee rates */}
        <section>
          <SectionHeader icon={<Zap className="w-4 h-4" />} title="Transaction Fees" sub="sat/vByte — current recommended fee rates" />
          {data.fees ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <FeeCard label="No Priority" fee={data.fees.economyFee} colorClass="bg-emerald-400" />
              <FeeCard label="1 Hour" fee={data.fees.hourFee} colorClass="bg-yellow-400" />
              <FeeCard label="30 Minutes" fee={data.fees.halfHourFee} colorClass="bg-orange-400" />
              <FeeCard label="Next Block" fee={data.fees.fastestFee} colorClass="bg-red-400" />
            </div>
          ) : (
            <SkeletonGrid cols={4} />
          )}
        </section>

        {/* Mempool */}
        <section>
          <SectionHeader icon={<BarChart3 className="w-4 h-4" />} title="Mempool" sub="Unconfirmed transactions waiting for confirmation" />
          {data.mempool ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <StatCard
                label="Pending Transactions"
                value={data.mempool.count.toLocaleString()}
                sub="unconfirmed txs"
                accent
              />
              <StatCard
                label="Memory Usage"
                value={formatBytes(data.mempool.vsize)}
                sub="virtual bytes"
              />
              <StatCard
                label="Total Fees"
                value={`${(data.mempool.total_fee / 100_000_000).toFixed(4)} BTC`}
                sub={data.btcPrice
                  ? `≈ $${((data.mempool.total_fee / 100_000_000) * data.btcPrice).toLocaleString('en-US', { maximumFractionDigits: 0 })}`
                  : undefined}
              />
            </div>
          ) : (
            <SkeletonGrid cols={3} />
          )}
        </section>

        {/* Difficulty adjustment */}
        <section>
          <SectionHeader icon={<TrendingUp className="w-4 h-4" />} title="Difficulty Adjustment" sub="Bitcoin adjusts difficulty every 2016 blocks (~2 weeks)" />
          {data.difficulty ? (
            <div className="rounded-xl border border-border bg-card p-5 space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="space-y-0.5">
                  <div className="text-xs text-muted-foreground uppercase tracking-wider">Progress to next retarget</div>
                  <div className="text-3xl font-bold font-mono text-foreground">
                    {data.difficulty.progressPercent.toFixed(1)}%
                  </div>
                </div>
                <div className="flex gap-6">
                  <div className="text-right">
                    <div className="text-xs text-muted-foreground">Est. Change</div>
                    <div className={cn('text-lg font-bold font-mono', data.difficulty.difficultyChange >= 0 ? 'text-emerald-400' : 'text-red-400')}>
                      {data.difficulty.difficultyChange >= 0 ? '+' : ''}{data.difficulty.difficultyChange.toFixed(2)}%
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-muted-foreground">Remaining Blocks</div>
                    <div className="text-lg font-bold font-mono text-foreground">{data.difficulty.remainingBlocks.toLocaleString()}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-muted-foreground">Next Retarget</div>
                    <div className="text-lg font-bold font-mono text-foreground">#{data.difficulty.nextRetargetHeight.toLocaleString()}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-muted-foreground">Avg Block Time</div>
                    <div className="text-lg font-bold font-mono text-foreground">{formatBlockTime(data.difficulty.timeAvg)}</div>
                  </div>
                </div>
              </div>
              {/* Progress bar */}
              <div className="h-3 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-btc-orange rounded-full transition-all"
                  style={{ width: `${Math.min(data.difficulty.progressPercent, 100)}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Last retarget</span>
                <span>
                  Est. {new Date(data.difficulty.estimatedRetargetDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-border bg-card p-5 h-36 animate-pulse" />
          )}
        </section>

        {/* Recent blocks + Mining pools */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent blocks */}
          <section>
            <SectionHeader icon={<Box className="w-4 h-4" />} title="Recent Blocks" sub="Latest confirmed blocks" />
            <div className="rounded-xl border border-border bg-card overflow-hidden">
              {data.blocks.length > 0 ? (
                data.blocks.map(block => <BlockRow key={block.id} block={block} />)
              ) : (
                <div className="space-y-0.5 p-1">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="h-14 bg-muted/30 rounded animate-pulse" />
                  ))}
                </div>
              )}
            </div>
          </section>

          {/* Mining pools */}
          <section>
            <SectionHeader icon={<Clock className="w-4 h-4" />} title="Mining Pools" sub="Block share over last 3 days" />
            <div className="rounded-xl border border-border bg-card p-5 space-y-3">
              {data.pools.length > 0 ? (
                data.pools.map(pool => (
                  <PoolBar key={pool.poolId} pool={pool} totalBlocks={totalPoolBlocks} />
                ))
              ) : (
                <div className="space-y-2">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="h-5 bg-muted/30 rounded animate-pulse" />
                  ))}
                </div>
              )}
            </div>
          </section>
        </div>

        {/* Refresh info */}
        <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground/60 pb-4">
          <RefreshCw className="w-3 h-3" />
          Data refreshes every 30 seconds · Powered by mempool.space API
        </div>
      </div>
    </PageWrapper>
  );
}

// ─── Tiny helpers ─────────────────────────────────────────────────────────────

function SectionHeader({ icon, title, sub }: { icon: React.ReactNode; title: string; sub: string }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <div className="text-btc-orange">{icon}</div>
      <div>
        <h2 className="text-base font-semibold text-foreground leading-none">{title}</h2>
        <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>
      </div>
    </div>
  );
}

function SkeletonGrid({ cols }: { cols: number }) {
  return (
    <div className={cn('grid gap-3', cols === 4 ? 'grid-cols-2 sm:grid-cols-4' : 'grid-cols-2 sm:grid-cols-3')}>
      {Array.from({ length: cols }).map((_, i) => (
        <div key={i} className="rounded-xl border border-border bg-card h-28 animate-pulse" />
      ))}
    </div>
  );
}
