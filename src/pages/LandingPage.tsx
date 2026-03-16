import { Suspense, lazy } from 'react';
import { Link } from 'react-router-dom';
import { SEO } from '@/components/seo/SEO';
import { ArrowRight, Zap, Shield, BookOpen, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { TrackProgressCard } from '@/components/progress/TrackProgressCard';
import { SceneWrapper } from '@/components/three/SceneWrapper';
import { TRACKS } from '@/data/tracks';
import { motion } from 'framer-motion';

const BitcoinCoin = lazy(() => import('@/components/three/BitcoinCoin').then(m => ({ default: m.BitcoinCoin })));

const features = [
  { icon: BookOpen, title: 'Structured Learning', description: 'Six carefully crafted tracks from beginner to advanced, with clear prerequisites.' },
  { icon: Zap, title: 'Interactive Lessons', description: 'Explore 3D blockchain visualizations, mining simulations, and network diagrams.' },
  { icon: Shield, title: 'Earn as You Learn', description: 'Collect XP, unlock badges, and track your streak as you progress through tracks.' },
  { icon: Globe, title: 'Open & Free', description: 'Bitcoin education should be accessible to everyone. No paywall, no ads.' },
];

const landingJsonLd = [
  {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'WhatIsBTC',
    url: 'https://whatisbtc.io',
    description: 'The most comprehensive interactive Bitcoin education platform.',
    potentialAction: {
      '@type': 'SearchAction',
      target: 'https://whatisbtc.io/tracks',
      'query-input': 'required name=search_term_string',
    },
  },
  {
    '@context': 'https://schema.org',
    '@type': 'EducationalOrganization',
    name: 'WhatIsBTC',
    url: 'https://whatisbtc.io',
    description: 'Free interactive Bitcoin education for everyone.',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
      availability: 'https://schema.org/InStock',
    },
  },
];

export default function LandingPage() {
  return (
    <PageWrapper fullBleed>
      <SEO
        title="WhatIsBTC — Learn Bitcoin from First Principles"
        description="The most comprehensive interactive Bitcoin education platform. Learn how Bitcoin works — from money theory to wallets, blockchain, and economics. Free forever."
        keywords="Bitcoin education, learn Bitcoin, what is Bitcoin, Bitcoin for beginners, Bitcoin course, Bitcoin explained, blockchain explained, how Bitcoin works, cryptocurrency basics"
        canonical="/"
        jsonLd={landingJsonLd}
      />
      {/* Hero Section */}
      <section className="relative min-h-[calc(100vh-4rem)] flex items-center overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-btc-orange-glow via-transparent to-blue-900/10 pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,#F7931A0D,transparent_60%)] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 w-full grid lg:grid-cols-2 gap-12 items-center py-16">
          {/* Left: Copy */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            <div className="inline-flex items-center gap-2 bg-btc-orange/10 border border-btc-orange/20 rounded-full px-4 py-1.5 text-sm text-btc-orange font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-btc-orange animate-pulse" />
              Free Bitcoin Education
            </div>

            <h1 className="text-5xl sm:text-6xl font-extrabold tracking-tight leading-tight">
              <span className="text-foreground">Understand</span>{' '}
              <span className="text-gradient-orange">Bitcoin.</span>
              <br />
              <span className="text-foreground">Be Sovereign.</span>
            </h1>

            <p className="text-xl text-muted-foreground leading-relaxed max-w-lg">
              The most comprehensive interactive Bitcoin education platform.
              From first principles to self-custody — learn by doing.
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                size="lg"
                className="bg-btc-orange text-black hover:bg-btc-orange-dim font-bold text-base px-8 glow-orange"
                asChild
              >
                <Link to="/tracks">
                  Start Learning Free
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="font-medium" asChild>
                <a href="https://bitcoin.org/bitcoin.pdf" target="_blank" rel="noopener noreferrer">
                  Read the Whitepaper
                </a>
              </Button>
            </div>

            <div className="flex items-center gap-6 pt-2">
              <div className="text-center">
                <div className="text-2xl font-bold text-foreground">9</div>
                <div className="text-xs text-muted-foreground">Learning Tracks</div>
              </div>
              <div className="w-px h-8 bg-border" />
              <div className="text-center">
                <div className="text-2xl font-bold text-foreground">30+</div>
                <div className="text-xs text-muted-foreground">Lessons</div>
              </div>
              <div className="w-px h-8 bg-border" />
              <div className="text-center">
                <div className="text-2xl font-bold text-foreground">&infin;</div>
                <div className="text-xs text-muted-foreground">Sovereignty</div>
              </div>
            </div>
          </motion.div>

          {/* Right: 3D Scene */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="hidden lg:block h-[420px] lg:h-[500px]"
          >
            <SceneWrapper
              height={500}
              camera={{ position: [0, 0, 5], fov: 50 }}
              className="border-btc-orange/20 bg-transparent"
              frameloop="always"
            >
              <Suspense fallback={null}>
                <BitcoinCoin />
              </Suspense>
            </SceneWrapper>
          </motion.div>
        </div>
      </section>

      {/* Tracks Preview */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl font-bold text-foreground mb-3">Choose Your Path</h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Nine structured learning tracks to take you from curious beginner to confident Bitcoiner.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {TRACKS.map((track, i) => (
            <TrackProgressCard key={track.id} track={track} index={i} />
          ))}
        </div>

        <div className="text-center mt-8">
          <Button variant="outline" size="lg" asChild>
            <Link to="/tracks">View All Tracks <ArrowRight className="w-4 h-4 ml-2" /></Link>
          </Button>
        </div>
      </section>

      {/* Features */}
      <section className="bg-card/30 border-y border-border py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-foreground mb-3">Why WhatIsBTC?</h2>
            <p className="text-muted-foreground">Bitcoin education built for the 21st century.</p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map(({ icon: Icon, title, description }, i) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center space-y-3"
              >
                <div className="w-12 h-12 rounded-xl bg-btc-orange/10 border border-btc-orange/20 flex items-center justify-center mx-auto">
                  <Icon className="w-5 h-5 text-btc-orange" />
                </div>
                <h3 className="font-semibold text-foreground">{title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-24 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="space-y-6"
        >
          <h2 className="text-4xl font-bold text-foreground">
            Ready to stack <span className="text-gradient-orange">sats</span> and knowledge?
          </h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            Join thousands of people learning Bitcoin from first principles.
          </p>
          <Button
            size="lg"
            className="bg-btc-orange text-black hover:bg-btc-orange-dim font-bold text-base px-10 glow-orange-strong"
            asChild
          >
            <Link to="/tracks">
              Start for Free
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </Button>
        </motion.div>
      </section>

      {/* Footer is part of PageWrapper */}
    </PageWrapper>
  );
}
