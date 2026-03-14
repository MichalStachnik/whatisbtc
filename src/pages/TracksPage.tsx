import { PageWrapper } from '@/components/layout/PageWrapper';
import { SEO } from '@/components/seo/SEO';
import { TrackProgressCard } from '@/components/progress/TrackProgressCard';
import { TRACKS } from '@/data/tracks';
import { useProgressStore } from '@/store/useProgressStore';
import { getAllLessonsForTrack } from '@/data/tracks';
import { motion } from 'framer-motion';

export default function TracksPage() {
  const { completedLessonIds, totalXP } = useProgressStore();

  const totalLessons = TRACKS.flatMap(t => getAllLessonsForTrack(t)).length;
  const completedTotal = TRACKS.flatMap(t => getAllLessonsForTrack(t)).filter(l => completedLessonIds.includes(l.id)).length;

  const tracksJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Bitcoin Learning Tracks',
    description: 'Nine structured Bitcoin education tracks from beginner to advanced.',
    numberOfItems: TRACKS.length,
    itemListElement: TRACKS.map((track, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      item: {
        '@type': 'Course',
        name: track.title,
        description: track.description,
        url: `https://whatisbtc.io/tracks/${track.slug}`,
        provider: { '@type': 'Organization', name: 'WhatIsBTC' },
      },
    })),
  };

  return (
    <PageWrapper>
      <SEO
        title="Bitcoin Learning Tracks"
        description="Nine structured Bitcoin learning tracks — from complete beginner to advanced economics. Free interactive lessons, quizzes, and 3D visualizations."
        keywords="Bitcoin learning tracks, Bitcoin course, learn Bitcoin online, Bitcoin curriculum, blockchain course, Bitcoin basics, Bitcoin economics"
        canonical="/tracks"
        jsonLd={tracksJsonLd}
      />
      <div className="space-y-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-2">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Learning Tracks</h1>
              <p className="text-muted-foreground mt-1">
                Nine tracks to take you from curious to sovereign.
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-btc-orange">{totalXP.toLocaleString()} XP</div>
              <div className="text-sm text-muted-foreground">{completedTotal} / {totalLessons} lessons complete</div>
            </div>
          </div>
        </motion.div>

        <div className="grid sm:grid-cols-2 gap-5">
          {TRACKS.map((track, i) => {
            return (
              <TrackProgressCard
                key={track.id}
                track={track}
                index={i}
              />
            );
          })}
        </div>
      </div>
    </PageWrapper>
  );
}
