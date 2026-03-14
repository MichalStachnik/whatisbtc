import { useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, Circle, PlayCircle, FileQuestion, ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';
import { useProgressStore } from '@/store/useProgressStore';
import { TRACKS, getAllLessonsForTrack } from '@/data/tracks';
import { cn } from '@/lib/cn';
import { ScrollArea } from '@/components/ui/scroll-area';

interface SidebarProps {
  currentTrackId: string;
  currentLessonId: string;
}

const lessonTypeIcons = {
  text: Circle,
  interactive: PlayCircle,
  quiz: FileQuestion,
};

export function Sidebar({ currentTrackId, currentLessonId }: SidebarProps) {
  const { isLessonCompleted } = useProgressStore();
  const [isOpen, setIsOpen] = useState(true);
  const [collapsedTracks, setCollapsedTracks] = useState<Set<string>>(
    () => new Set(TRACKS.filter(t => t.id !== currentTrackId).map(t => t.id))
  );

  const toggleTrack = (trackId: string) => {
    setCollapsedTracks(prev => {
      const next = new Set(prev);
      if (next.has(trackId)) next.delete(trackId);
      else next.add(trackId);
      return next;
    });
  };

  return (
    <div className="relative shrink-0 hidden lg:flex lg:flex-col">
      {/* Sliding panel */}
      <aside
        className={cn(
          'border-r border-border bg-card/50 overflow-hidden transition-all duration-300 ease-in-out flex-1',
          isOpen ? 'w-80' : 'w-0',
        )}
      >
        {/* Fixed-width inner so content doesn't reflow during animation */}
        <ScrollArea className="h-[calc(100vh-4rem)] sticky top-16 w-80">
          <div className="py-4 pl-4 pr-6">
            <h2 className="font-bold text-xs text-muted-foreground uppercase tracking-wider mb-4 px-1">
              Full Curriculum
            </h2>

            <nav className="space-y-2">
              {TRACKS.map((track) => {
                const isCurrentTrack = track.id === currentTrackId;
                const isCollapsed = collapsedTracks.has(track.id);
                const allLessons = getAllLessonsForTrack(track);
                const completedCount = allLessons.filter(l => isLessonCompleted(l.id)).length;
                const isTrackDone = completedCount === allLessons.length;

                return (
                  <div key={track.id} className="rounded-lg overflow-hidden">
                    {/* Track header */}
                    <button
                      onClick={() => toggleTrack(track.id)}
                      className={cn(
                        'w-full flex items-center gap-2 px-2 py-2 rounded-md text-left transition-colors',
                        isCurrentTrack
                          ? 'bg-btc-orange/10 text-foreground'
                          : 'text-muted-foreground hover:text-foreground hover:bg-muted',
                      )}
                    >
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: isTrackDone ? '#10b981' : track.colorAccent }}
                      />
                      <span className="flex-1 text-xs font-semibold truncate">{track.title}</span>
                      <span className="text-xs text-muted-foreground shrink-0">
                        {completedCount}/{allLessons.length}
                      </span>
                      <ChevronDown
                        className={cn(
                          'w-3 h-3 shrink-0 transition-transform',
                          isCollapsed ? '-rotate-90' : 'rotate-0',
                        )}
                      />
                    </button>

                    {/* Track lessons */}
                    {!isCollapsed && (
                      <div className="mt-1 space-y-4 pl-1">
                        {track.modules.map((mod) => (
                          <div key={mod.id}>
                            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1 px-2">
                              {mod.title}
                            </h3>
                            <ul className="space-y-0.5">
                              {mod.lessons.map((lesson) => {
                                const completed = isLessonCompleted(lesson.id);
                                const isCurrent = lesson.id === currentLessonId;
                                const TypeIcon = lessonTypeIcons[lesson.type];

                                return (
                                  <li key={lesson.id}>
                                    <Link
                                      to={`/tracks/${track.slug}/${lesson.slug}`}
                                      className={cn(
                                        'flex items-center gap-2 px-2 py-1.5 rounded-md text-sm transition-colors group',
                                        isCurrent
                                          ? 'bg-btc-orange/10 text-btc-orange border border-btc-orange/20'
                                          : 'text-muted-foreground hover:text-foreground hover:bg-muted',
                                      )}
                                    >
                                      <span className="shrink-0">
                                        {completed ? (
                                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                                        ) : isCurrent ? (
                                          <TypeIcon className="w-3.5 h-3.5 text-btc-orange" />
                                        ) : (
                                          <TypeIcon className="w-3.5 h-3.5" />
                                        )}
                                      </span>
                                      <span className="flex-1 truncate text-xs font-medium">{lesson.title}</span>
                                      <span className="shrink-0 text-xs text-muted-foreground">{lesson.estimatedMinutes}m</span>
                                    </Link>
                                  </li>
                                );
                              })}
                            </ul>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </nav>
          </div>
        </ScrollArea>
      </aside>

      {/* Toggle button — sits on the right edge of the sidebar */}
      <button
        onClick={() => setIsOpen(prev => !prev)}
        aria-label={isOpen ? 'Collapse sidebar' : 'Expand sidebar'}
        className={cn(
          'absolute top-8 z-20',
          'flex items-center justify-center',
          'w-5 h-10 rounded-r-md',
          'bg-card border border-l-0 border-border',
          'text-muted-foreground hover:text-foreground hover:bg-muted',
          'transition-all duration-300 ease-in-out',
          isOpen ? 'right-0 translate-x-full' : 'right-0 translate-x-full',
        )}
      >
        {isOpen
          ? <ChevronLeft className="w-3 h-3" />
          : <ChevronRight className="w-3 h-3" />}
      </button>
    </div>
  );
}
