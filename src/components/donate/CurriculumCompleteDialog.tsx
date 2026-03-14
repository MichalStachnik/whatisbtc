import { useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { DonateSection } from './DonateSection';
import { Trophy } from 'lucide-react';

interface CurriculumCompleteDialogProps {
  open: boolean;
  onClose: () => void;
}

export function CurriculumCompleteDialog({ open, onClose }: CurriculumCompleteDialogProps) {
  const firedRef = useRef(false);

  useEffect(() => {
    if (!open || firedRef.current) return;
    firedRef.current = true;

    const fire = (opts: confetti.Options) =>
      confetti({ zIndex: 9999, ...opts });

    const duration = 3500;
    const end = Date.now() + duration;

    const frame = () => {
      fire({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#F7931A', '#FFD700', '#FFA500'],
      });
      fire({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#F7931A', '#FFD700', '#FFA500'],
      });
      if (Date.now() < end) requestAnimationFrame(frame);
    };

    frame();

    return () => {
      firedRef.current = false;
    };
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent className="max-w-md text-center">
        <DialogHeader className="items-center">
          <div className="w-16 h-16 rounded-full bg-btc-orange/10 border border-btc-orange/20 flex items-center justify-center mb-2">
            <Trophy className="w-8 h-8 text-btc-orange" />
          </div>
          <DialogTitle className="text-2xl font-bold">
            Curriculum Complete!
          </DialogTitle>
          <DialogDescription className="text-base mt-1">
            You've finished every lesson across all tracks. You now have a solid understanding of Bitcoin — from the basics all the way through the economics and history.
          </DialogDescription>
        </DialogHeader>

        <div className="border-t border-border pt-4">
          <DonateSection />
        </div>
      </DialogContent>
    </Dialog>
  );
}
