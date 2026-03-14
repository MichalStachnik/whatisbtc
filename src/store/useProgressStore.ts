import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ProgressState, EarnedBadge } from '@/types/progress';

interface ProgressActions {
  completeLesson: (lessonId: string, xpReward: number) => void;
  recordQuizScore: (quizId: string, score: number) => void;
  recordActivity: () => void;
  awardBadge: (badgeId: string) => void;
  isLessonCompleted: (lessonId: string) => boolean;
  hasBadge: (badgeId: string) => boolean;
  resetProgress: () => void;
}

const initialState: ProgressState = {
  completedLessonIds: [],
  quizScores: {},
  totalXP: 0,
  lastActivityDate: null,
  currentStreak: 0,
  longestStreak: 0,
  earnedBadges: [],
};

export const useProgressStore = create<ProgressState & ProgressActions>()(
  persist(
    (set, get) => ({
      ...initialState,

      completeLesson: (lessonId, xpReward) => {
        const { completedLessonIds } = get();
        if (completedLessonIds.includes(lessonId)) return;
        set(state => ({
          completedLessonIds: [...state.completedLessonIds, lessonId],
          totalXP: state.totalXP + xpReward,
        }));
        get().recordActivity();
      },

      recordQuizScore: (quizId, score) => {
        set(state => ({
          quizScores: { ...state.quizScores, [quizId]: score },
        }));
      },

      recordActivity: () => {
        const today = new Date().toISOString().split('T')[0];
        const { lastActivityDate, currentStreak, longestStreak } = get();
        const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
        let newStreak = 1;
        if (lastActivityDate === today) {
          newStreak = currentStreak;
        } else if (lastActivityDate === yesterday) {
          newStreak = currentStreak + 1;
        }
        set({
          lastActivityDate: today,
          currentStreak: newStreak,
          longestStreak: Math.max(longestStreak, newStreak),
        });
      },

      awardBadge: (badgeId) => {
        const { earnedBadges } = get();
        if (earnedBadges.some(b => b.badgeId === badgeId)) return;
        const badge: EarnedBadge = { badgeId, earnedAt: new Date().toISOString() };
        set(state => ({ earnedBadges: [...state.earnedBadges, badge] }));
      },

      isLessonCompleted: (lessonId) => get().completedLessonIds.includes(lessonId),

      hasBadge: (badgeId) => get().earnedBadges.some(b => b.badgeId === badgeId),

      resetProgress: () => set(initialState),
    }),
    {
      name: 'whatisbtc-progress',
    }
  )
);
