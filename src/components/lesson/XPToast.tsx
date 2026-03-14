import { motion, AnimatePresence } from 'framer-motion';
import { Zap } from 'lucide-react';

interface XPToastProps {
  show: boolean;
  xp: number;
  message?: string;
}

export function XPToast({ show, xp, message = 'Lesson complete!' }: XPToastProps) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 60, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.9 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          className="fixed bottom-8 right-8 z-50 flex items-center gap-3 bg-card border border-btc-orange/50 rounded-xl px-5 py-3.5 shadow-2xl glow-orange"
        >
          <div className="w-8 h-8 rounded-full bg-btc-orange flex items-center justify-center shrink-0">
            <Zap className="w-4 h-4 text-black" />
          </div>
          <div>
            <div className="font-semibold text-foreground text-sm">{message}</div>
            <div className="text-btc-orange font-bold">+{xp} XP</div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
