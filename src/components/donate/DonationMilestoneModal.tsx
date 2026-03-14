import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { DonateSection } from './DonateSection';
import type { Track } from '@/types/content';

interface DonationMilestoneModalProps {
  open: boolean;
  onClose: () => void;
  nextTrack?: Track | null;
}

export function DonationMilestoneModal({ open, onClose, nextTrack }: DonationMilestoneModalProps) {
  const navigate = useNavigate();

  const handleDismiss = () => {
    onClose();
    if (nextTrack) {
      navigate(`/tracks/${nextTrack.slug}`);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          onClick={(e) => { if (e.target === e.currentTarget) handleDismiss(); }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 16 }}
            transition={{ type: 'spring', duration: 0.4 }}
            className="relative w-full max-w-md bg-card border border-border rounded-2xl shadow-2xl overflow-hidden"
          >
            <button
              onClick={handleDismiss}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="px-8 pt-8 pb-2 text-center space-y-1">
              <div className="text-3xl">🎉</div>
              <h2 className="text-xl font-bold text-foreground">Track milestone reached!</h2>
              <p className="text-sm text-muted-foreground">
                You've completed another set of tracks. If this content has been valuable, consider supporting WhatIsBTC.
              </p>
            </div>

            <div className="px-8 py-6">
              <DonateSection />
            </div>

            <div className="px-8 pb-8 flex justify-center">
              <button
                onClick={handleDismiss}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors underline underline-offset-4"
              >
                No thanks{nextTrack ? ', next track →' : ''}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
