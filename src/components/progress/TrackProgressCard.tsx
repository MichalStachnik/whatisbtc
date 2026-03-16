import { Link } from 'react-router-dom';
import { ArrowRight, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useProgressStore } from '@/store/useProgressStore';
import { getAllLessonsForTrack } from '@/data/tracks';
import type { Track } from '@/types/content';
import { cn } from '@/lib/cn';
import * as LucideIcons from 'lucide-react';

const difficultyLabels = {
  beginner: 'Beginner',
  intermediate: 'Intermediate',
  practical: 'Practical',
  advanced: 'Advanced',
};

const difficultyColors = {
  beginner: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  intermediate: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  practical: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  advanced: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
};

const difficultyIconColors = {
  beginner: { bg: 'bg-emerald-500/10', text: 'text-emerald-400' },
  intermediate: { bg: 'bg-blue-500/10', text: 'text-blue-400' },
  practical: { bg: 'bg-amber-500/10', text: 'text-amber-400' },
  advanced: { bg: 'bg-purple-500/10', text: 'text-purple-400' },
};

const difficultyAccents: Record<string, string> = {
  beginner: '#34d399',
  intermediate: '#60a5fa',
  practical: '#fbbf24',
  advanced: '#a78bfa',
};

interface TrackProgressCardProps {
  track: Track;
  index?: number;
}

export function TrackProgressCard({ track }: TrackProgressCardProps) {
  const { completedLessonIds } = useProgressStore();
  const allLessons = getAllLessonsForTrack(track);
  const completedCount = allLessons.filter(l => completedLessonIds.includes(l.id)).length;
  const progress = allLessons.length > 0 ? Math.round((completedCount / allLessons.length) * 100) : 0;
  const accent = difficultyAccents[track.difficulty];
  const iconColors = difficultyIconColors[track.difficulty];

  // Dynamically get icon — cast through unknown to avoid strict Lucide type constraints
  const IconComponent = ((LucideIcons as unknown) as Record<string, React.ComponentType<{ className?: string; style?: React.CSSProperties }>>)[track.iconName]
    ?? LucideIcons.BookOpen;

  return (
    <div className="h-full">
      <Link
        to={`/tracks/${track.slug}`}
        className={cn(
          'flex flex-col h-full group relative bg-card border border-border rounded-2xl p-6 transition-all duration-300',
          'hover:border-opacity-60 hover:shadow-lg card-hover',
        )}
      >
        {/* Glow accent on hover */}
        <div
          className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
          style={{ boxShadow: `inset 0 0 0 1px ${accent}40` }}
        />

        <div className="flex items-start justify-between mb-4">
          <div
            className={cn('w-12 h-12 rounded-xl flex items-center justify-center', iconColors.bg)}
          >
            <IconComponent className={cn('w-6 h-6', iconColors.text)} />
          </div>
          <div className="flex items-center gap-2">
            <Badge className={cn('text-xs border', difficultyColors[track.difficulty])}>
              {difficultyLabels[track.difficulty]}
            </Badge>
          </div>
        </div>

        <h3 className="font-bold text-lg text-foreground mb-1 group-hover:text-white transition-colors">
          {track.title}
        </h3>
        <p className="text-muted-foreground text-sm mb-4 leading-relaxed line-clamp-2 flex-1">
          {track.tagline}
        </p>

        <div className="space-y-2 mb-4">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{completedCount}/{allLessons.length} lessons</span>
            <span>{progress}%</span>
          </div>
          <Progress value={progress} className="h-1.5" style={{ '--progress-color': accent } as React.CSSProperties} />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="w-3 h-3" />
            <span>{track.estimatedHours}h estimated</span>
          </div>
            <ArrowRight
              className="w-4 h-4 text-[#F7931A] group-hover:translate-x-1 transition-transform"
          />
        </div>
      </Link>
    </div>
  );
}
