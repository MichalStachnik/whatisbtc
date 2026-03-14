import { Bitcoin, Github, Twitter } from 'lucide-react';
import { Link } from 'react-router-dom';

export function Footer() {
  return (
    <footer className="border-t border-border/50 bg-background mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-btc-orange flex items-center justify-center">
              <Bitcoin className="w-3 h-3 text-black" />
            </div>
            <span className="text-sm font-semibold text-foreground">WhatIsBTC</span>
            <span className="text-xs text-muted-foreground ml-2">Free Bitcoin education</span>
          </div>
          <div className="flex items-center gap-6">
            <Link to="/tracks" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
              Tracks
            </Link>
            <Link to="/dashboard" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
              Dashboard
            </Link>
            <Link to="/donate" className="text-xs text-muted-foreground hover:text-btc-orange transition-colors">
              Donate
            </Link>
            <a
              href="https://bitcoin.org/bitcoin.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-muted-foreground hover:text-btc-orange transition-colors"
            >
              Whitepaper
            </a>
          </div>
          <div className="flex items-center gap-2">
            <a
              href="https://github.com/bitcoin/bitcoin"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <Github className="w-4 h-4" />
            </a>
            <a
              href="https://x.com/Bitcoin"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 text-muted-foreground hover:text-btc-orange transition-colors"
            >
              <Twitter className="w-4 h-4" />
            </a>
          </div>
        </div>
        <div className="mt-6 pt-4 border-t border-border/30 text-center text-xs text-muted-foreground">
          Not financial advice. Bitcoin education only. DYOR.
        </div>
      </div>
    </footer>
  );
}
