export interface BadgeDefinition {
  id: string;
  name: string;
  description: string;
  icon: string;
  condition: 'track_complete' | 'first_lesson' | 'streak_7' | 'streak_30' | 'all_tracks' | 'quiz_perfect';
  conditionValue?: string;
}

export interface EarnedBadge {
  badgeId: string;
  earnedAt: string;
}

export interface ProgressState {
  completedLessonIds: string[];
  quizScores: Record<string, number>;
  totalXP: number;
  lastActivityDate: string | null;
  currentStreak: number;
  longestStreak: number;
  earnedBadges: EarnedBadge[];
}

export type XPLevel = 'beginner' | 'learner' | 'expert' | 'sovereign';

export interface LevelInfo {
  level: XPLevel;
  label: string;
  minXP: number;
  maxXP: number;
  color: string;
}
