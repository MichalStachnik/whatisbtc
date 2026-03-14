import { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Copy, Check, Bitcoin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/cn';

const BTC_ADDRESS = 'bc1qfnxculaenmf52r4j209mw6z3zlmr0axd4d05tq';
const BTC_URI = `bitcoin:${BTC_ADDRESS}`;

interface DonateSectionProps {
  className?: string;
}

export function DonateSection({ className }: DonateSectionProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(BTC_ADDRESS);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={cn('flex flex-col items-center gap-4 text-center', className)}>
      <div className="flex items-center gap-2 text-btc-orange">
        <Bitcoin className="w-5 h-5" />
        <span className="font-semibold text-sm">Support WhatIsBTC</span>
      </div>

      <p className="text-sm text-muted-foreground max-w-xs leading-relaxed">
        If you enjoyed this content, please consider donating to help us keep building free Bitcoin education.
      </p>

      {/* QR Code */}
      <div className="bg-white p-3 rounded-xl">
        <QRCodeSVG
          value={BTC_URI}
          size={160}
          level="M"
          marginSize={1}
        />
      </div>

      {/* Address + copy */}
      <div className="flex items-center gap-2 bg-muted/50 border border-border rounded-lg px-3 py-2 max-w-full">
        <span className="text-xs text-muted-foreground font-mono truncate select-all">
          {BTC_ADDRESS}
        </span>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleCopy}
          className={cn(
            'shrink-0 h-6 px-2 text-xs gap-1 transition-colors',
            copied ? 'text-emerald-500' : 'text-muted-foreground hover:text-foreground',
          )}
        >
          {copied ? (
            <>
              <Check className="w-3 h-3" />
              Copied
            </>
          ) : (
            <>
              <Copy className="w-3 h-3" />
              Copy
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
