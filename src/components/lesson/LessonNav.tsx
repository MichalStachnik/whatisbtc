import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { Lesson, Track } from '@/types/content';

interface LessonNavProps {
  trackSlug: string;
  prevLesson: Lesson | null;
  nextLesson: Lesson | null;
  isCompleted: boolean;
  onComplete: () => void;
  nextTrack?: Track | null;
}

export function LessonNav({ trackSlug, prevLesson, nextLesson, isCompleted, onComplete, nextTrack }: LessonNavProps) {
  const isLastLesson = !nextLesson;

  return (
    <div className="flex items-center justify-between border-t border-border pt-6 mt-8">
      <div>
        {prevLesson ? (
          <Button variant="ghost" asChild className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
            <Link to={`/tracks/${trackSlug}/${prevLesson.slug}`}>
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:block max-w-[160px] truncate text-sm">{prevLesson.title}</span>
            </Link>
          </Button>
        ) : (
          <Button variant="ghost" asChild className="text-muted-foreground">
            <Link to={`/tracks/${trackSlug}`}>
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back to Track
            </Link>
          </Button>
        )}
      </div>

      <div className="flex items-center gap-3">
        {!isCompleted ? (
          <Button
            onClick={onComplete}
            className="bg-btc-orange text-black hover:bg-btc-orange-dim font-semibold flex items-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4" />
            Mark Complete
          </Button>
        ) : (
          <div className="flex items-center gap-1.5 text-emerald-500 text-sm font-medium">
            <CheckCircle2 className="w-4 h-4" />
            Completed
          </div>
        )}

        {nextLesson && (
          <Button variant="outline" asChild className="flex items-center gap-2">
            <Link to={`/tracks/${trackSlug}/${nextLesson.slug}`}>
              <span className="hidden sm:block max-w-[160px] truncate text-sm">{nextLesson.title}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </Button>
        )}

        {isLastLesson && isCompleted && nextTrack && (
          <Button
            asChild
            className="flex items-center gap-2 font-semibold"
            style={{ backgroundColor: nextTrack.colorAccent, color: '#000' }}
          >
            <Link to={`/tracks/${nextTrack.slug}`}>
              <span className="hidden sm:block text-sm">Next: {nextTrack.title}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </Button>
        )}
      </div>
    </div>
  );
}
