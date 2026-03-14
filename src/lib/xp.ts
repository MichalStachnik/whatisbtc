import type { LevelInfo } from '@/types/progress';

export const LEVELS: LevelInfo[] = [
  { level: 'beginner', label: 'Beginner', minXP: 0, maxXP: 500, color: '#6B7280' },
  { level: 'learner', label: 'Learner', minXP: 501, maxXP: 1500, color: '#3B82F6' },
  { level: 'expert', label: 'Expert', minXP: 1501, maxXP: 3000, color: '#8B5CF6' },
  { level: 'sovereign', label: 'Sovereign', minXP: 3001, maxXP: Infinity, color: '#F7931A' },
];

export function getLevelInfo(xp: number): LevelInfo {
  return LEVELS.find(l => xp >= l.minXP && xp <= l.maxXP) ?? LEVELS[0];
}

export function getLevelProgress(xp: number): number {
  const level = getLevelInfo(xp);
  if (level.maxXP === Infinity) return 100;
  const range = level.maxXP - level.minXP;
  const progress = xp - level.minXP;
  return Math.min(100, Math.round((progress / range) * 100));
}

export function getNextLevelXP(xp: number): number {
  const level = getLevelInfo(xp);
  return level.maxXP === Infinity ? xp : level.maxXP;
}
