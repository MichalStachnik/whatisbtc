export type ContentBlockType =
  | 'heading'
  | 'paragraph'
  | 'callout'
  | 'code'
  | 'image'
  | 'divider'
  | 'three-scene'
  | 'quiz-inline'
  | 'satoshi-calculator';

export type CalloutVariant = 'info' | 'warning' | 'tip' | 'key-concept';

export interface ContentBlock {
  type: ContentBlockType;
  // heading / paragraph
  text?: string;
  level?: 1 | 2 | 3;
  // callout
  variant?: CalloutVariant;
  title?: string;
  // code
  language?: string;
  // image
  src?: string;
  alt?: string;
  caption?: string;
  // three-scene
  sceneName?: 'blockchain' | 'mining' | 'network' | 'utxo' | 'coin';
  sceneHeight?: number;
  // quiz-inline
  quizId?: string;
}

export interface QuizOption {
  id: string;
  text: string;
  isCorrect: boolean;
  explanation: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: QuizOption[];
  xpReward: number;
}

export interface Quiz {
  id: string;
  title: string;
  questions: QuizQuestion[];
}

export type LessonType = 'text' | 'interactive' | 'quiz';
export type LessonStatus = 'locked' | 'available' | 'in-progress' | 'completed';

export interface Lesson {
  id: string;
  moduleId: string;
  trackId: string;
  slug: string;
  title: string;
  description: string;
  type: LessonType;
  estimatedMinutes: number;
  xpReward: number;
  contentBlocks: ContentBlock[];
  quizId?: string;
  prerequisiteLessonIds: string[];
}

export interface Module {
  id: string;
  trackId: string;
  title: string;
  description: string;
  order: number;
  lessons: Lesson[];
}

export type TrackDifficulty = 'beginner' | 'intermediate' | 'practical' | 'advanced';

export interface Track {
  id: string;
  slug: string;
  title: string;
  tagline: string;
  description: string;
  difficulty: TrackDifficulty;
  estimatedHours: number;
  colorAccent: string;
  iconName: string;
  modules: Module[];
  prerequisiteTrackIds: string[];
}
