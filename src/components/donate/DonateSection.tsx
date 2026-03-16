import { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Copy, Check, Bitcoin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/cn';

const BTC_ADDRESS = 'bc1qfnxculaenmf52r4j209mw6z3zlmr0axd4d05tq';
const BTC_URI = `bitcoin:${BTC_ADDRESS}`;
const ETH_ADDRESS = '0x961B26f710f4Da30411CD7470508feb8e7129343';
const ETH_URI = `ethereum:${ETH_ADDRESS}`;

type TabId = 'btc' | 'eth';

interface DonateSectionProps {
  className?: string;
}

function AddressBlock({
  address,
  uri,
  copied,
  onCopy,
}: {
  address: string;
  uri: string;
  copied: boolean;
  onCopy: () => void;
}) {
  return (
    <div className="flex flex-col items-center gap-4">
      <div className="bg-white p-3 rounded-xl">
        <QRCodeSVG value={uri} size={160} level="M" marginSize={1} />
      </div>
      <div className="flex items-center gap-2 bg-muted/50 border border-border rounded-lg px-3 py-2 max-w-full w-full">
        <span className="text-xs text-muted-foreground font-mono truncate select-all flex-1 min-w-0">
          {address}
        </span>
        <Button
          variant="ghost"
          size="sm"
          onClick={onCopy}
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

export function DonateSection({ className }: DonateSectionProps) {
  const [copiedTab, setCopiedTab] = useState<TabId | null>(null);

  const handleCopy = async (tab: TabId, address: string) => {
    await navigator.clipboard.writeText(address);
    setCopiedTab(tab);
    setTimeout(() => setCopiedTab(null), 2000);
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

      <Tabs defaultValue="btc" className="w-full max-w-md">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="btc">BTC</TabsTrigger>
          <TabsTrigger value="eth">ETH</TabsTrigger>
        </TabsList>
        <TabsContent value="btc">
          <AddressBlock
            address={BTC_ADDRESS}
            uri={BTC_URI}
            copied={copiedTab === 'btc'}
            onCopy={() => handleCopy('btc', BTC_ADDRESS)}
          />
        </TabsContent>
        <TabsContent value="eth">
          <AddressBlock
            address={ETH_ADDRESS}
            uri={ETH_URI}
            copied={copiedTab === 'eth'}
            onCopy={() => handleCopy('eth', ETH_ADDRESS)}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
