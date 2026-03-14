import { useState } from 'react';
import { useProgressStore } from '@/store/useProgressStore';
import { SEO } from '@/components/seo/SEO';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { Progress } from '@/components/ui/progress';
import { TRACKS, getAllLessonsForTrack } from '@/data/tracks';
import { BADGES } from '@/data/badges';
import { getLevelInfo, getLevelProgress, LEVELS } from '@/lib/xp';
import { Flame, Star, Trophy, Zap, RotateCcw } from 'lucide-react';
import { TrackProgressCard } from '@/components/progress/TrackProgressCard';
import { motion } from 'framer-motion';

export default function DashboardPage() {
  const { totalXP, currentStreak, completedLessonIds, earnedBadges, resetProgress } = useProgressStore();
  const [confirmReset, setConfirmReset] = useState(false);

  const levelInfo = getLevelInfo(totalXP);
  const levelProgress = getLevelProgress(totalXP);
  const nextLevel = LEVELS.find(l => l.minXP > levelInfo.maxXP);

  const totalLessons = TRACKS.flatMap(t => getAllLessonsForTrack(t)).length;
  const completedTotal = completedLessonIds.length;

  return (
    <PageWrapper>
      <SEO
        title="Learning Dashboard"
        description="Track your Bitcoin learning progress — XP earned, lessons completed, streaks, and badges. Pick up where you left off."
        canonical="/dashboard"
        noIndex={true}
      />
      <div className="max-w-5xl mx-auto space-y-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-bold text-foreground">
            Your <span className="text-gradient-orange">Progress</span>
          </h1>
          <p className="text-muted-foreground mt-1">Keep learning — every lesson brings you closer to mastery.</p>
        </motion.div>

        {/* Stats row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { icon: Zap, label: 'Total XP', value: totalXP.toLocaleString(), color: 'text-btc-orange' },
            { icon: Flame, label: 'Current Streak', value: `${currentStreak} days`, color: 'text-orange-400' },
            { icon: Star, label: 'Lessons Done', value: `${completedTotal}/${totalLessons}`, color: 'text-blue-400' },
            { icon: Trophy, label: 'Badges Earned', value: `${earnedBadges.length}/${BADGES.length}`, color: 'text-purple-400' },
          ].map(({ icon: Icon, label, value, color }, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-card border border-border rounded-xl p-4 space-y-2"
            >
              <Icon className={`w-5 h-5 ${color}`} />
              <div className="text-2xl font-bold text-foreground">{value}</div>
              <div className="text-xs text-muted-foreground">{label}</div>
            </motion.div>
          ))}
        </div>

        {/* Level progress */}
        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="text-sm text-muted-foreground">Current Level</div>
              <div className="text-xl font-bold" style={{ color: levelInfo.color }}>{levelInfo.label}</div>
            </div>
            {nextLevel && (
              <div className="text-right">
                <div className="text-sm text-muted-foreground">Next: {nextLevel.label}</div>
                <div className="text-sm text-foreground">{(nextLevel.minXP - totalXP - 1).toLocaleString()} XP to go</div>
              </div>
            )}
          </div>
          <Progress value={levelProgress} className="h-3" />
          <div className="flex justify-between mt-2 text-xs text-muted-foreground">
            <span>{levelInfo.minXP.toLocaleString()} XP</span>
            <span>{totalXP.toLocaleString()} / {levelInfo.maxXP === Infinity ? '∞' : levelInfo.maxXP.toLocaleString()} XP</span>
          </div>
        </div>

        {/* Badges */}
        <div className="bg-card border border-border rounded-xl p-6">
          <h2 className="font-semibold text-foreground mb-4">Badges</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {BADGES.map((badge) => {
              const earned = earnedBadges.some(b => b.badgeId === badge.id);
              return (
                <div
                  key={badge.id}
                  className={`flex flex-col items-center gap-1.5 p-3 rounded-lg border text-center ${
                    earned ? 'border-btc-orange/30 bg-btc-orange/5' : 'border-border bg-muted/30 opacity-50'
                  }`}
                >
                  <span className="text-2xl">{badge.icon}</span>
                  <span className={`text-xs font-medium ${earned ? 'text-foreground' : 'text-muted-foreground'}`}>
                    {badge.name}
                  </span>
                  <span className="text-xs text-muted-foreground leading-tight">{badge.description}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Track progress */}
        <div>
          <h2 className="font-semibold text-foreground mb-4">Your Progress</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {TRACKS.map((track, i) => (
              <TrackProgressCard key={track.id} track={track} index={i} />
            ))}
          </div>
        </div>

        {/* Reset progress */}
        <div className="border border-border rounded-xl p-6 flex items-center justify-between">
          <div>
            <div className="font-semibold text-foreground">Reset Progress</div>
            <div className="text-sm text-muted-foreground mt-0.5">Wipe all XP, streaks, lessons, and badges. This cannot be undone.</div>
          </div>
          {confirmReset ? (
            <div className="flex items-center gap-2">
              <span className="text-sm text-destructive font-medium">Are you sure?</span>
              <button
                onClick={() => { resetProgress(); setConfirmReset(false); }}
                className="px-3 py-1.5 rounded-lg bg-destructive text-destructive-foreground text-sm font-semibold hover:bg-destructive/90 transition-colors"
              >
                Yes, reset
              </button>
              <button
                onClick={() => setConfirmReset(false)}
                className="px-3 py-1.5 rounded-lg border border-border text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => setConfirmReset(true)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border text-sm text-muted-foreground hover:text-destructive hover:border-destructive transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              Reset
            </button>
          )}
        </div>
      </div>
    </PageWrapper>
  );
}
