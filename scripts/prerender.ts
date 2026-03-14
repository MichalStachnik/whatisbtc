/**
 * Static Site Generation (SSG) prerender script.
 *
 * Usage (added automatically by `npm run build:ssg`):
 *   1. `vite build` — builds the client bundle into dist/
 *   2. `vite build --ssr src/entry-server.tsx` — builds the SSR bundle
 *   3. This script runs, renders each route, and writes dist/<route>/index.html
 *
 * Each output file contains the full HTML with:
 *   - Server-rendered React markup (no JS required to see content)
 *   - Per-page <title>, <meta>, JSON-LD <script> tags from react-helmet-async
 *   - The client bundle script tag so React hydrates on load
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distPath = path.resolve(__dirname, '../dist');
const templatePath = path.resolve(distPath, 'index.html');

// All routes to pre-render (must match App.tsx routes + actual data slugs)
const routes = [
  '/',
  '/tracks',
  // Bitcoin Basics
  '/tracks/bitcoin-basics',
  '/tracks/bitcoin-basics/history-of-money',
  '/tracks/bitcoin-basics/problems-with-modern-money',
  '/tracks/bitcoin-basics/what-is-bitcoin',
  '/tracks/bitcoin-basics/bitcoin-vs-crypto',
  // The Technology
  '/tracks/the-technology',
  '/tracks/the-technology/hash-functions',
  '/tracks/the-technology/what-is-blockchain',
  '/tracks/the-technology/proof-of-work',
  '/tracks/the-technology/nodes-network',
  // Using Bitcoin
  '/tracks/using-bitcoin',
  '/tracks/using-bitcoin/private-keys',
  '/tracks/using-bitcoin/types-of-wallets',
  '/tracks/using-bitcoin/how-transactions-work',
  // History & Economics
  '/tracks/history-economics',
  '/tracks/history-economics/satoshi-and-genesis',
  '/tracks/history-economics/bitcoin-milestones',
  '/tracks/history-economics/austrian-economics',
  // Lightning Network
  '/tracks/lightning-network',
  '/tracks/lightning-network/the-scaling-problem',
  '/tracks/lightning-network/payment-channels',
  '/tracks/lightning-network/routing-and-the-network',
  '/tracks/lightning-network/lightning-wallets-invoices',
  // Bitcoin Upgrades
  '/tracks/bitcoin-upgrades',
  '/tracks/bitcoin-upgrades/segwit',
  '/tracks/bitcoin-upgrades/taproot-schnorr',
  '/tracks/bitcoin-upgrades/bips-and-soft-forks',
];

async function prerender() {
  const template = fs.readFileSync(templatePath, 'utf-8');

  // Import the SSR bundle produced by `vite build --ssr`
  const serverEntry = await import(
    path.resolve(distPath, 'server/entry-server.js')
  );

  let rendered = 0;

  for (const route of routes) {
    try {
      const { html, headTags } = serverEntry.render(route);

      // Inject SSR content into the template placeholders
      const fullHtml = template
        .replace('<!--app-html-->', html)
        .replace('<!--app-head-->', headTags ?? '');

      // Write to dist/<route>/index.html
      const routePath = route === '/' ? '/index.html' : `${route}/index.html`;
      const outPath = path.join(distPath, routePath);

      fs.mkdirSync(path.dirname(outPath), { recursive: true });
      fs.writeFileSync(outPath, fullHtml);

      console.log(`  ✓ ${route}`);
      rendered++;
    } catch (err) {
      console.error(`  ✗ ${route}`, err);
    }
  }

  console.log(`\nPrerendered ${rendered}/${routes.length} routes → dist/`);
}

prerender();
