import { useState, useEffect, useCallback } from 'react';
import { cn } from '@/lib/cn';

const SATS_PER_BTC = 100_000_000;

const PRESETS = [
  { label: '1 sat', sats: 1 },
  { label: '1,000 sats', sats: 1_000 },
  { label: '10,000 sats', sats: 10_000 },
  { label: '100,000 sats', sats: 100_000 },
  { label: '1M sats', sats: 1_000_000 },
  { label: '1 BTC', sats: SATS_PER_BTC },
];

function formatUsd(value: number): string {
  if (value === 0) return '0.00';
  if (value < 0.01) return value.toFixed(8);
  if (value < 1) return value.toFixed(4);
  return value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatSats(value: number): string {
  if (!isFinite(value)) return '';
  return Math.round(value).toLocaleString('en-US');
}

export function SatoshiCalculator() {
  const [btcPrice, setBtcPrice] = useState<number | null>(null);
  const [priceError, setPriceError] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const [satsInput, setSatsInput] = useState('100000');
  const [usdInput, setUsdInput] = useState('');
  const [activeField, setActiveField] = useState<'sats' | 'usd'>('sats');

  const fetchPrice = useCallback(async () => {
    try {
      const res = await fetch(
        'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd',
        { signal: AbortSignal.timeout(8000) }
      );
      if (!res.ok) throw new Error('API error');
      const data = await res.json();
      const price = data?.bitcoin?.usd;
      if (typeof price === 'number' && price > 0) {
        setBtcPrice(price);
        setLastUpdated(new Date());
        setPriceError(false);
      } else {
        throw new Error('Invalid price data');
      }
    } catch {
      setPriceError(true);
    }
  }, []);

  useEffect(() => {
    fetchPrice();
    const interval = setInterval(fetchPrice, 60_000);
    return () => clearInterval(interval);
  }, [fetchPrice]);

  // Sync USD when sats input changes
  useEffect(() => {
    if (activeField !== 'sats' || !btcPrice) return;
    const sats = parseFloat(satsInput.replace(/,/g, ''));
    if (isNaN(sats)) { setUsdInput(''); return; }
    const usd = (sats / SATS_PER_BTC) * btcPrice;
    setUsdInput(formatUsd(usd));
  }, [satsInput, btcPrice, activeField]);

  // Sync sats when usd input changes
  useEffect(() => {
    if (activeField !== 'usd' || !btcPrice) return;
    const usd = parseFloat(usdInput.replace(/,/g, ''));
    if (isNaN(usd)) { setSatsInput(''); return; }
    const sats = (usd / btcPrice) * SATS_PER_BTC;
    setSatsInput(formatSats(sats));
  }, [usdInput, btcPrice, activeField]);

  function handlePreset(sats: number) {
    setActiveField('sats');
    setSatsInput(formatSats(sats));
  }

  const btcFromSats = btcPrice && satsInput
    ? parseFloat(satsInput.replace(/,/g, '')) / SATS_PER_BTC
    : null;

  return (
    <div className="rounded-xl border border-border bg-card my-8 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-border bg-btc-orange/5">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-btc-orange flex items-center justify-center text-black font-bold text-sm">₿</div>
          <div>
            <div className="font-semibold text-foreground text-sm">Satoshi ↔ USD Calculator</div>
            <div className="text-xs text-muted-foreground">Live Bitcoin price</div>
          </div>
        </div>
        <div className="text-right">
          {btcPrice ? (
            <>
              <div className="text-btc-orange font-bold text-lg">${btcPrice.toLocaleString('en-US')}</div>
              <div className="text-xs text-muted-foreground">
                {lastUpdated ? `Updated ${lastUpdated.toLocaleTimeString()}` : 'Live'}
              </div>
            </>
          ) : priceError ? (
            <div className="text-xs text-amber-400">Price unavailable</div>
          ) : (
            <div className="text-xs text-muted-foreground animate-pulse">Fetching price…</div>
          )}
        </div>
      </div>

      <div className="p-5 space-y-5">
        {/* Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_1fr] gap-3 items-center">
          {/* Satoshis */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Satoshis (sats)</label>
            <div className="relative">
              <input
                type="text"
                inputMode="decimal"
                value={satsInput}
                onFocus={() => setActiveField('sats')}
                onChange={e => setSatsInput(e.target.value)}
                placeholder="Enter satoshis"
                className={cn(
                  'w-full rounded-lg border bg-background px-4 py-3 text-base font-mono text-foreground placeholder:text-muted-foreground/50 outline-none transition-colors',
                  activeField === 'sats'
                    ? 'border-btc-orange ring-1 ring-btc-orange/30'
                    : 'border-border hover:border-btc-orange/50'
                )}
              />
            </div>
            {btcFromSats !== null && isFinite(btcFromSats) && (
              <div className="text-xs text-muted-foreground pl-1">
                = {btcFromSats < 0.001 ? btcFromSats.toFixed(8) : btcFromSats.toFixed(6)} BTC
              </div>
            )}
          </div>

          {/* Arrow */}
          <div className="flex justify-center items-center pt-5">
            <div className="text-btc-orange text-xl font-light select-none">⇄</div>
          </div>

          {/* USD */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">US Dollars (USD)</label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground font-medium pointer-events-none">$</span>
              <input
                type="text"
                inputMode="decimal"
                value={usdInput}
                onFocus={() => setActiveField('usd')}
                onChange={e => setUsdInput(e.target.value)}
                placeholder="Enter USD"
                className={cn(
                  'w-full rounded-lg border bg-background pl-8 pr-4 py-3 text-base font-mono text-foreground placeholder:text-muted-foreground/50 outline-none transition-colors',
                  activeField === 'usd'
                    ? 'border-btc-orange ring-1 ring-btc-orange/30'
                    : 'border-border hover:border-btc-orange/50'
                )}
              />
            </div>
          </div>
        </div>

        {/* Presets */}
        <div>
          <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Quick amounts</div>
          <div className="flex flex-wrap gap-2">
            {PRESETS.map(preset => (
              <button
                key={preset.label}
                onClick={() => handlePreset(preset.sats)}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors',
                  satsInput === formatSats(preset.sats)
                    ? 'bg-btc-orange text-black border-btc-orange'
                    : 'bg-transparent text-muted-foreground border-border hover:border-btc-orange/50 hover:text-foreground'
                )}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        {/* Reference table */}
        {btcPrice && (
          <div>
            <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Reference</div>
            <div className="rounded-lg border border-border overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="text-left px-4 py-2 text-xs font-medium text-muted-foreground">Satoshis</th>
                    <th className="text-left px-4 py-2 text-xs font-medium text-muted-foreground">Name</th>
                    <th className="text-right px-4 py-2 text-xs font-medium text-muted-foreground">USD Value</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { sats: 1, name: '1 Satoshi' },
                    { sats: 1_000, name: '1,000 sats' },
                    { sats: 10_000, name: '10k sats' },
                    { sats: 100_000, name: '100k sats (1 bit)' },
                    { sats: 1_000_000, name: '1M sats (0.01 BTC)' },
                    { sats: SATS_PER_BTC, name: '1 Bitcoin' },
                  ].map(row => (
                    <tr
                      key={row.sats}
                      className="border-b border-border/50 last:border-0 hover:bg-btc-orange/5 cursor-pointer transition-colors"
                      onClick={() => handlePreset(row.sats)}
                    >
                      <td className="px-4 py-2.5 font-mono text-foreground">{row.sats.toLocaleString()}</td>
                      <td className="px-4 py-2.5 text-muted-foreground">{row.name}</td>
                      <td className="px-4 py-2.5 font-mono text-btc-orange text-right">
                        ${formatUsd((row.sats / SATS_PER_BTC) * btcPrice)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <p className="text-xs text-muted-foreground/60 text-center">
          Price from CoinGecko · Refreshes every 60s · Not financial advice
        </p>
      </div>
    </div>
  );
}
