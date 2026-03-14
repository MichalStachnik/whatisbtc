import { useState } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { getLesson, getAdjacentLessons, getAdjacentTracks, TRACKS, getAllLessonsForTrack } from '@/data/tracks';
import { BADGES } from '@/data/badges';
import { useProgressStore } from '@/store/useProgressStore';
import { Sidebar } from '@/components/layout/Sidebar';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { TextLesson } from '@/components/lesson/TextLesson';
import { LessonNav } from '@/components/lesson/LessonNav';
import { XPToast } from '@/components/lesson/XPToast';
import { CurriculumCompleteDialog } from '@/components/donate/CurriculumCompleteDialog';
import { DonationMilestoneModal } from '@/components/donate/DonationMilestoneModal';
import { SEO } from '@/components/seo/SEO';
import { Badge } from '@/components/ui/badge';
import { Clock, Star, PlayCircle, FileQuestion, Circle } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/cn';

const typeIcons = { text: Circle, interactive: PlayCircle, quiz: FileQuestion };
const typeColors = { text: 'text-muted-foreground', interactive: 'text-blue-400', quiz: 'text-purple-400' };

export default function LessonPage() {
  const { trackSlug, lessonSlug } = useParams<{ trackSlug: string; lessonSlug: string }>();
  const { completeLesson, isLessonCompleted, completedLessonIds, awardBadge } = useProgressStore();
  const [showToast, setShowToast] = useState(false);
  const [toastXP, setToastXP] = useState(0);
  const [earnedXP, setEarnedXP] = useState(0);
  const [showComplete, setShowComplete] = useState(false);
  const [showDonationModal, setShowDonationModal] = useState(false);

  const result = getLesson(trackSlug ?? '', lessonSlug ?? '');

  if (!result) return <Navigate to="/tracks" replace />;

  const { lesson, track } = result;
  const isCompleted = isLessonCompleted(lesson.id);
  const { prev, next } = getAdjacentLessons(track, lesson.id);
  const { nextTrack } = getAdjacentTracks(track.id);
  const TypeIcon = typeIcons[lesson.type];

  const allCurriculumLessons = TRACKS.flatMap(t => getAllLessonsForTrack(t));

  const handleComplete = () => {
    if (!isCompleted) {
      completeLesson(lesson.id, lesson.xpReward + earnedXP);
      setToastXP(lesson.xpReward + earnedXP);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3500);

      const newCompleted = new Set([...completedLessonIds, lesson.id]);

      // first-lesson badge
      if (completedLessonIds.length === 0) {
        awardBadge('first-lesson');
      }

      // track_complete badge
      const trackLessons = getAllLessonsForTrack(track);
      if (trackLessons.every(l => newCompleted.has(l.id))) {
        const trackBadge = BADGES.find(b => b.condition === 'track_complete' && b.conditionValue === track.id);
        if (trackBadge) awardBadge(trackBadge.id);
      }

      // all_tracks badge
      if (TRACKS.every(t => getAllLessonsForTrack(t).every(l => newCompleted.has(l.id)))) {
        awardBadge('all-tracks');
      }

      // streak_7 badge — read updated streak after completeLesson (which calls recordActivity)
      const updatedStreak = useProgressStore.getState().currentStreak;
      if (updatedStreak >= 7) {
        awardBadge('streak-7');
      }

      // Donation modal every 3 completed tracks
      const completedTrackCount = TRACKS.filter(t =>
        getAllLessonsForTrack(t).every(l => newCompleted.has(l.id))
      ).length;
      if (completedTrackCount > 0 && completedTrackCount % 3 === 0) {
        setTimeout(() => setShowDonationModal(true), 600);
      }

      // Check if this was the last lesson in the entire curriculum
      if (allCurriculumLessons.every(l => newCompleted.has(l.id))) {
        setTimeout(() => setShowComplete(true), 500);
      }
    }
  };

  const handleInlineXP = (xp: number) => {
    setEarnedXP(prev => prev + xp);
  };

  const lessonJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'LearningResource',
    name: lesson.title,
    description: lesson.description,
    url: `https://whatisbtc.io/tracks/${track.slug}/${lesson.slug}`,
    learningResourceType: lesson.type === 'quiz' ? 'Quiz' : 'Lesson',
    timeRequired: `PT${lesson.estimatedMinutes}M`,
    isPartOf: {
      '@type': 'Course',
      name: track.title,
      url: `https://whatisbtc.io/tracks/${track.slug}`,
    },
    provider: { '@type': 'Organization', name: 'WhatIsBTC', url: 'https://whatisbtc.io' },
    isAccessibleForFree: true,
    educationalLevel: track.difficulty,
  };

  return (
    <div className="min-h-screen flex flex-col">
      <SEO
        title={`${lesson.title} — ${track.title}`}
        description={lesson.description}
        keywords={`${lesson.title}, ${track.title}, Bitcoin education, learn Bitcoin, ${track.difficulty} Bitcoin`}
        canonical={`/tracks/${track.slug}/${lesson.slug}`}
        ogType="article"
        jsonLd={lessonJsonLd}
      />
      <Navbar />
      <div className="flex flex-1">
        <Sidebar currentTrackId={track.id} currentLessonId={lesson.id} />

        <main className="flex-1 min-w-0">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Lesson header */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span className="text-foreground font-medium">{track.title}</span>
                  <span>›</span>
                  <span>{lesson.title}</span>
                </div>

                <h1 className="text-3xl sm:text-4xl font-bold text-foreground leading-tight">
                  {lesson.title}
                </h1>
                <p className="text-muted-foreground text-base leading-relaxed">{lesson.description}</p>

                <div className="flex items-center gap-3 flex-wrap">
                  <div className={cn('flex items-center gap-1.5 text-sm', typeColors[lesson.type])}>
                    <TypeIcon className="w-4 h-4" />
                    <span className="capitalize">{lesson.type}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <Clock className="w-3.5 h-3.5" />
                    {lesson.estimatedMinutes} min read
                  </div>
                  <div className="flex items-center gap-1.5 text-sm text-btc-orange">
                    <Star className="w-3.5 h-3.5" />
                    +{lesson.xpReward} XP
                  </div>
                  {isCompleted && (
                    <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-xs">
                      ✓ Completed
                    </Badge>
                  )}
                </div>

                <div className="border-b border-border" />
              </div>

              {/* Lesson content */}
              <TextLesson blocks={lesson.contentBlocks} onXPEarned={handleInlineXP} />

              {/* Navigation */}
              <LessonNav
                trackSlug={track.slug}
                prevLesson={prev}
                nextLesson={next}
                isCompleted={isCompleted}
                onComplete={handleComplete}
                nextTrack={nextTrack}
              />
            </motion.div>
          </div>
        </main>
      </div>
      <Footer />

      <XPToast show={showToast} xp={toastXP} />
      <CurriculumCompleteDialog open={showComplete} onClose={() => setShowComplete(false)} />
      <DonationMilestoneModal
        open={showDonationModal}
        onClose={() => setShowDonationModal(false)}
        nextTrack={nextTrack}
      />
    </div>
  );
}
