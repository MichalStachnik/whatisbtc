import { useState } from 'react';
import { CheckCircle2, XCircle, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getQuiz } from '@/data/quizzes';
import { useProgressStore } from '@/store/useProgressStore';
import { cn } from '@/lib/cn';
import { motion, AnimatePresence } from 'framer-motion';

interface QuizBlockProps {
  quizId: string;
  onAnswer?: (correct: boolean, xp: number) => void;
}

export function QuizBlock({ quizId, onAnswer }: QuizBlockProps) {
  const quiz = getQuiz(quizId);
  const { recordQuizScore, awardBadge } = useProgressStore();
  const [currentQ, setCurrentQ] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);

  if (!quiz) return null;

  const question = quiz.questions[currentQ];

  const handleSubmit = () => {
    if (!selected) return;
    setSubmitted(true);
    const correct = question.options.find(o => o.id === selected)?.isCorrect ?? false;
    if (correct) {
      setScore(s => s + question.xpReward);
      onAnswer?.(true, question.xpReward);
    } else {
      onAnswer?.(false, 0);
    }
  };

  const handleNext = () => {
    if (currentQ < quiz.questions.length - 1) {
      setCurrentQ(q => q + 1);
      setSelected(null);
      setSubmitted(false);
    } else {
      const pct = Math.round((score / quiz.questions.reduce((a, q) => a + q.xpReward, 0)) * 100);
      recordQuizScore(quizId, pct);
      if (pct === 100) awardBadge('quiz-perfect');
      setDone(true);
    }
  };

  if (done) {
    const total = quiz.questions.reduce((a, q) => a + q.xpReward, 0);
    const pct = Math.round((score / total) * 100);
    return (
      <div className="bg-card border border-border rounded-xl p-6 text-center space-y-3">
        <div className="text-4xl">{pct >= 75 ? '🎉' : '📚'}</div>
        <div className="text-xl font-bold text-foreground">{pct}% Correct</div>
        <div className="text-muted-foreground text-sm">You earned <span className="text-btc-orange font-semibold">+{score} XP</span></div>
        <Button variant="outline" size="sm" onClick={() => { setCurrentQ(0); setSelected(null); setSubmitted(false); setScore(0); setDone(false); }}>
          Retry Quiz
        </Button>
      </div>
    );
  }

  return (
    <div className="bg-card border border-btc-orange/20 rounded-xl p-5 space-y-4 my-6">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-btc-orange uppercase tracking-wider">Quick Check</span>
        <span className="text-xs text-muted-foreground">{currentQ + 1} / {quiz.questions.length}</span>
      </div>

      <p className="font-semibold text-foreground text-sm leading-relaxed">{question.question}</p>

      <div className="space-y-2">
        {question.options.map((option) => {
          const isSelected = selected === option.id;
          const isCorrect = option.isCorrect;
          let variant: 'default' | 'correct' | 'wrong' | 'neutral' = 'neutral';
          if (submitted) {
            if (isCorrect) variant = 'correct';
            else if (isSelected && !isCorrect) variant = 'wrong';
          } else if (isSelected) {
            variant = 'default';
          }

          return (
            <button
              key={option.id}
              disabled={submitted}
              onClick={() => setSelected(option.id)}
              className={cn(
                'w-full text-left px-4 py-3 rounded-lg border text-sm transition-all',
                variant === 'neutral' && 'border-border hover:border-muted-foreground text-muted-foreground hover:text-foreground',
                variant === 'default' && 'border-btc-orange bg-btc-orange/10 text-btc-orange',
                variant === 'correct' && 'border-emerald-500 bg-emerald-500/10 text-emerald-400',
                variant === 'wrong' && 'border-red-500 bg-red-500/10 text-red-400',
                submitted && isCorrect && 'border-emerald-500 bg-emerald-500/10 text-emerald-400'
              )}
            >
              <div className="flex items-start gap-2">
                <span className="shrink-0 mt-0.5">
                  {submitted && isCorrect && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                  {submitted && isSelected && !isCorrect && <XCircle className="w-4 h-4 text-red-500" />}
                  {!submitted && (
                    <span className={cn(
                      'inline-flex w-4 h-4 rounded-full border items-center justify-center text-xs',
                      isSelected ? 'border-btc-orange bg-btc-orange text-black' : 'border-border'
                    )}>
                      {['A','B','C','D'][question.options.indexOf(option)]}
                    </span>
                  )}
                </span>
                <div>
                  {option.text}
                  <AnimatePresence>
                    {submitted && (isSelected || isCorrect) && (
                      <motion.p
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        className="text-xs text-muted-foreground mt-1.5 leading-relaxed"
                      >
                        {option.explanation}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <div className="flex justify-end">
        {!submitted ? (
          <Button
            size="sm"
            disabled={!selected}
            onClick={handleSubmit}
            className="bg-btc-orange text-black hover:bg-btc-orange-dim font-semibold"
          >
            Check Answer
          </Button>
        ) : (
          <Button size="sm" variant="outline" onClick={handleNext} className="flex items-center gap-1">
            {currentQ < quiz.questions.length - 1 ? 'Next Question' : 'Finish Quiz'}
            <ChevronRight className="w-3 h-3" />
          </Button>
        )}
      </div>
    </div>
  );
}
