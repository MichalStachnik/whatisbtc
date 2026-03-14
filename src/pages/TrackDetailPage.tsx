import { useParams, Link, Navigate } from 'react-router-dom';
import { SEO } from '@/components/seo/SEO';
import { ArrowLeft, CheckCircle2, Circle, PlayCircle, FileQuestion, Clock, Star } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { getTrack, getAllLessonsForTrack } from '@/data/tracks';
import { useProgressStore } from '@/store/useProgressStore';
import { cn } from '@/lib/cn';
import { motion } from 'framer-motion';

const typeIcons = { text: Circle, interactive: PlayCircle, quiz: FileQuestion };
const typeLabels = { text: 'Reading', interactive: 'Interactive', quiz: 'Quiz' };

export default function TrackDetailPage() {
  const { trackSlug } = useParams<{ trackSlug: string }>();
  const track = getTrack(trackSlug ?? '');
  const { isLessonCompleted } = useProgressStore();

  if (!track) return <Navigate to="/tracks" replace />;

  const allLessons = getAllLessonsForTrack(track);
  const completedCount = allLessons.filter(l => isLessonCompleted(l.id)).length;
  const progress = allLessons.length > 0 ? Math.round((completedCount / allLessons.length) * 100) : 0;

  // Find the first incomplete lesson as the CTA
  const nextLesson = allLessons.find(l => !isLessonCompleted(l.id)) ?? allLessons[0];

  const trackJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Course',
    name: track.title,
    description: track.description,
    url: `https://whatisbtc.io/tracks/${track.slug}`,
    provider: { '@type': 'Organization', name: 'WhatIsBTC', url: 'https://whatisbtc.io' },
    educationalLevel: track.difficulty,
    timeRequired: `PT${track.estimatedHours}H`,
    isAccessibleForFree: true,
    hasCourseInstance: {
      '@type': 'CourseInstance',
      courseMode: 'online',
      instructor: { '@type': 'Organization', name: 'WhatIsBTC' },
    },
    numberOfCredits: allLessons.length,
  };

  return (
    <PageWrapper>
      <SEO
        title={`${track.title} — Bitcoin Course`}
        description={`${track.description} ${allLessons.length} interactive lessons. Free forever.`}
        keywords={`${track.title}, Bitcoin ${track.difficulty} course, ${track.modules.map(m => m.title).join(', ')}`}
        canonical={`/tracks/${track.slug}`}
        jsonLd={trackJsonLd}
      />
      <div className="max-w-4xl mx-auto space-y-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Link to="/tracks" className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground text-sm mb-4 transition-colors">
            <ArrowLeft className="w-3 h-3" /> All Tracks
          </Link>

          {/* Header */}
          <div className="bg-card border border-border rounded-2xl p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: track.colorAccent }} />
                  <span className="text-sm text-muted-foreground capitalize">{track.difficulty}</span>
                </div>
                <h1 className="text-3xl font-bold text-foreground">{track.title}</h1>
                <p className="text-muted-foreground max-w-lg leading-relaxed">{track.description}</p>
              </div>
              <div className="shrink-0 text-right space-y-1">
                <div className="text-3xl font-bold" style={{ color: track.colorAccent }}>{progress}%</div>
                <div className="text-xs text-muted-foreground">{completedCount}/{allLessons.length} complete</div>
              </div>
            </div>

            <div className="space-y-2 mb-6">
              <Progress value={progress} className="h-2" />
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <Button
                className="font-bold"
                style={{ backgroundColor: track.colorAccent, color: '#000' }}
                asChild
              >
                <Link to={`/tracks/${track.slug}/${nextLesson.slug}`}>
                  {completedCount === 0 ? 'Start Track' : completedCount === allLessons.length ? 'Review' : 'Continue'}
                </Link>
              </Button>
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <Clock className="w-3.5 h-3.5" />
                {track.estimatedHours} hours · {allLessons.length} lessons
              </div>
            </div>
          </div>
        </motion.div>

        {/* Modules */}
        <div className="space-y-4">
          {track.modules.map((mod, modIdx) => (
            <motion.div
              key={mod.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: modIdx * 0.1 }}
              className="bg-card border border-border rounded-xl overflow-hidden"
            >
              <div className="px-5 py-4 border-b border-border/50">
                <h2 className="font-semibold text-foreground">{mod.title}</h2>
                <p className="text-sm text-muted-foreground mt-0.5">{mod.description}</p>
              </div>

              <div className="divide-y divide-border/50">
                {mod.lessons.map((lesson) => {
                  const completed = isLessonCompleted(lesson.id);
                  const TypeIcon = typeIcons[lesson.type];

                  return (
                    <Link
                      key={lesson.id}
                      to={`/tracks/${track.slug}/${lesson.slug}`}
                      className={cn(
                        'flex items-center gap-4 px-5 py-4 hover:bg-muted/50 transition-colors group',
                      )}
                    >
                      <span className="shrink-0">
                        {completed ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                        ) : (
                          <TypeIcon className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
                        )}
                      </span>

                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm text-foreground truncate">{lesson.title}</div>
                        <div className="text-xs text-muted-foreground">{lesson.description}</div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <Badge variant="outline" className="text-xs hidden sm:flex">
                          {typeLabels[lesson.type]}
                        </Badge>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="w-3 h-3" />
                          {lesson.estimatedMinutes}m
                        </div>
                        <div className="flex items-center gap-0.5 text-xs text-btc-orange">
                          <Star className="w-3 h-3" />
                          {lesson.xpReward}
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </PageWrapper>
  );
}
