import { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Phaser from 'phaser';
import { EventBus } from '@/game/EventBus';
import { OverworldScene } from '@/game/scenes/OverworldScene';
import { DojoScene } from '@/game/scenes/DojoScene';
import { CryptoDojo } from '@/game/scenes/CryptoDojo';
import { PracticalDojo } from '@/game/scenes/PracticalDojo';
import { useProgressStore } from '@/store/useProgressStore';
import { useSettingsStore } from '@/store/useSettingsStore';
import { AudioManager } from '@/game/AudioManager';
import { TRACKS } from '@/data/tracks';
import type { ContentBlock } from '@/types/content';
import confetti from 'canvas-confetti';

// --------------- Types ---------------
interface LessonActivatedPayload {
  lessonId: string;
  lessonTitle: string;
  xp: number;
  terminalIndex: number;
}

interface NpcDialoguePayload {
  npcId: string;
  npcName: string;
}

// --------------- NPC Dialogue Data ---------------
const NPC_DIALOGUES: Record<string, { name: string; icon: string; color: string; lines: string[] }> = {
  'cash-saver': {
    name: 'Dollar Dave',
    icon: '💵',
    color: '#00ff88',
    lines: [
      "I've been saving cash my whole life... my parents told me it was the safest thing to do.",
      "But every year, things get more expensive. My savings buy less and less.",
      "A coffee that cost $1 when I was young now costs $7. That's not the coffee getting expensive — it's the money losing value.",
      "They call it 'inflation'... but it feels more like theft. My time and labor, slowly evaporating.",
      "I wish I'd known earlier that saving in dollars means losing 2-3% of your purchasing power every single year.",
    ],
  },
  'gold-bug': {
    name: 'Aurum',
    icon: '🥇',
    color: '#ffd700',
    lines: [
      "Gold has been money for 5,000 years! I've done well holding it while others lost to inflation.",
      "But try sending gold across the world... it costs a fortune and takes weeks.",
      "Want to buy a coffee with gold? Good luck splitting a bar into tiny pieces.",
      "I have to trust vaults, custodians, and governments not to confiscate it. That's a lot of trust.",
      "Gold is great at storing value... but moving it or dividing it? That's where it falls short.",
    ],
  },
  'bitcoin-miner': {
    name: 'Satoshi',
    icon: '⛏️',
    color: '#F7931A',
    lines: [
      "Hey! I discovered Bitcoin a few years ago and it changed everything for me.",
      "I can send money to anyone, anywhere in the world, in minutes — no bank needed.",
      "There will only ever be 21 million bitcoin. No one can print more. It's the hardest money ever created.",
      "I run a mining rig — I help secure the network and earn bitcoin for it. It's like digital gold, but better.",
      "It's divisible to 8 decimal places, portable on a phone, and no government can freeze it. The future is here!",
    ],
  },
};

// --------------- NPC Dialogue Component ---------------
function NPCDialogue({
  npcId,
  onClose,
}: {
  npcId: string;
  onClose: () => void;
}) {
  const [lineIndex, setLineIndex] = useState(0);
  const dialogue = NPC_DIALOGUES[npcId];
  if (!dialogue) return null;

  const isLast = lineIndex >= dialogue.lines.length - 1;

  const advance = () => {
    AudioManager.playDialogueAdvance();
    if (isLast) {
      onClose();
    } else {
      setLineIndex((i) => i + 1);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center pb-4 pointer-events-none">
      <div
        className="pointer-events-auto w-full max-w-2xl mx-4 border-4 shadow-lg"
        style={{
          borderColor: dialogue.color,
          boxShadow: `0 0 30px ${dialogue.color}44`,
          background: '#0a0a0aee',
          imageRendering: 'pixelated',
          fontFamily: '"Press Start 2P", monospace',
        }}
      >
        {/* Header with name */}
        <div
          className="px-4 py-2 flex items-center gap-3"
          style={{ background: `${dialogue.color}22`, borderBottom: `2px solid ${dialogue.color}44` }}
        >
          <span className="text-lg">{dialogue.icon}</span>
          <span className="text-xs font-bold" style={{ color: dialogue.color }}>
            {dialogue.name}
          </span>
          <span className="ml-auto text-[8px] text-gray-500">
            {lineIndex + 1}/{dialogue.lines.length}
          </span>
        </div>

        {/* Dialogue text */}
        <div className="px-5 py-4 min-h-[80px] flex items-center">
          <p className="text-gray-200 text-[10px] leading-relaxed">
            "{dialogue.lines[lineIndex]}"
          </p>
        </div>

        {/* Footer */}
        <div className="px-4 py-2 flex justify-end gap-3" style={{ borderTop: `2px solid ${dialogue.color}22` }}>
          <button
            onClick={onClose}
            className="px-3 py-1.5 text-[9px] text-gray-500 border border-gray-700 hover:border-gray-400 hover:text-white transition-colors"
          >
            CLOSE
          </button>
          <button
            onClick={advance}
            className="px-4 py-1.5 text-[9px] font-bold transition-colors"
            style={{
              background: dialogue.color,
              color: '#000',
            }}
          >
            {isLast ? 'DONE' : 'NEXT ▶'}
          </button>
        </div>
      </div>
    </div>
  );
}

// --------------- Lesson Dialog ---------------
function LessonDialog({
  lessonId,
  lessonTitle,
  xp,
  alreadyCompleted,
  onComplete,
  onClose,
}: {
  lessonId: string;
  lessonTitle: string;
  xp: number;
  alreadyCompleted: boolean;
  onComplete: () => void;
  onClose: () => void;
}) {
  const lesson = TRACKS.flatMap((t) =>
    t.modules.flatMap((m) => m.lessons)
  ).find((l) => l.id === lessonId);

  const blocks: ContentBlock[] = lesson?.contentBlocks ?? [];
  const displayBlocks = blocks.filter(
    (b) =>
      b.type === 'heading' ||
      b.type === 'paragraph' ||
      b.type === 'callout'
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
      <div
        className="relative w-full max-w-2xl mx-4 border-4 border-[#F7931A] shadow-[0_0_40px_#F7931A66]"
        style={{
          background: '#0d0d0d',
          imageRendering: 'pixelated',
          fontFamily: '"Press Start 2P", monospace',
        }}
      >
        {/* Header */}
        <div className="bg-[#F7931A] px-4 py-3 flex items-center justify-between">
          <span className="text-black text-xs font-bold truncate">
            ⚡ {lessonTitle}
          </span>
          <span className="text-black text-xs opacity-75 ml-4 whitespace-nowrap">
            {xp} XP
          </span>
        </div>

        {/* Content */}
        <div
          className="p-4 max-h-[60vh] overflow-y-auto space-y-3"
          style={{ scrollbarColor: '#F7931A #1a1a1a' }}
        >
          {displayBlocks.map((block, i) => {
            if (block.type === 'heading') {
              return (
                <h3
                  key={i}
                  className="text-[#F7931A] text-xs leading-relaxed pt-2"
                >
                  {'> '}{block.text}
                </h3>
              );
            }
            if (block.type === 'paragraph') {
              return (
                <p
                  key={i}
                  className="text-gray-300 text-[10px] leading-relaxed"
                >
                  {block.text}
                </p>
              );
            }
            if (block.type === 'callout') {
              const colors: Record<string, string> = {
                'key-concept': '#F7931A',
                info: '#3b82f6',
                tip: '#22c55e',
                warning: '#ef4444',
              };
              const col = colors[block.variant ?? 'info'] ?? '#F7931A';
              return (
                <div
                  key={i}
                  className="p-3 text-[10px] leading-relaxed"
                  style={{
                    border: `2px solid ${col}`,
                    background: `${col}15`,
                    color: '#e5e5e5',
                  }}
                >
                  <div
                    className="text-[10px] mb-1 font-bold"
                    style={{ color: col }}
                  >
                    ★ {block.title}
                  </div>
                  <div className="whitespace-pre-line">{block.text}</div>
                </div>
              );
            }
            return null;
          })}
        </div>

        {/* Footer */}
        <div className="px-4 py-3 border-t-2 border-[#F7931A33] flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-[10px] border-2 border-gray-600 text-gray-400 hover:border-gray-400 hover:text-white transition-colors"
          >
            CLOSE
          </button>
          {alreadyCompleted ? (
            <div className="px-4 py-2 text-[10px] text-[#F7931A] border-2 border-[#F7931A] opacity-60">
              ✓ COMPLETED
            </div>
          ) : (
            <button
              onClick={onComplete}
              className="px-4 py-2 text-[10px] bg-[#F7931A] text-black font-bold hover:bg-[#ffaa44] transition-colors"
            >
              ★ MARK COMPLETE (+{xp} XP)
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// --------------- ESC / Pause Menu ---------------
function PauseMenu({
  onResume,
  onClassicMode,
  soundEnabled,
  onToggleSound,
}: {
  onResume: () => void;
  onClassicMode: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85">
      <div
        className="border-4 border-[#F7931A] shadow-[0_0_60px_#F7931A44] p-8 flex flex-col items-center gap-6 min-w-[300px]"
        style={{
          background: '#0a0a0a',
          fontFamily: '"Press Start 2P", monospace',
        }}
      >
        <div className="text-[#F7931A] text-sm tracking-widest">PAUSED</div>
        <div className="text-gray-500 text-[9px]">₿ WHATISBTC</div>
        <div className="w-full h-px bg-[#F7931A33]" />
        <button
          onClick={onResume}
          className="w-full py-3 text-[10px] bg-[#F7931A] text-black font-bold hover:bg-[#ffaa44] transition-colors"
        >
          ▶ RESUME GAME
        </button>
        <button
          onClick={onToggleSound}
          className="w-full py-3 text-[10px] border-2 border-gray-600 text-gray-400 hover:border-gray-400 hover:text-white transition-colors flex items-center justify-center gap-2"
        >
          {soundEnabled ? '🔊 SOUND ON' : '🔇 SOUND OFF'}
        </button>
        <button
          onClick={onClassicMode}
          className="w-full py-3 text-[10px] border-2 border-[#F7931A] text-[#F7931A] hover:bg-[#F7931A22] transition-colors"
        >
          ← CLASSIC MODE
        </button>
        <div className="text-gray-600 text-[8px] text-center">
          Progress is saved automatically
        </div>
      </div>
    </div>
  );
}

// --------------- Badge Modal ---------------
const BADGE_INFO: Record<string, { icon: string; name: string; desc: string; color: string }> = {
  'basics-complete': {
    icon: '₿',
    name: 'Bitcoin Basics',
    desc: 'You completed Bitcoin Basics!',
    color: '#ffd700',
  },
  'tech-complete': {
    icon: '🔐',
    name: 'Cryptographer',
    desc: 'You completed The Technology!',
    color: '#3B82F6',
  },
  'using-complete': {
    icon: '🔑',
    name: 'Self-Sovereign',
    desc: 'You completed Using Bitcoin!',
    color: '#22c55e',
  },
};

function BadgeModal({ badgeId, onClose }: { badgeId: string; onClose: () => void }) {
  const info = BADGE_INFO[badgeId] ?? BADGE_INFO['basics-complete'];

  useEffect(() => {
    const fire = () => {
      confetti({
        particleCount: 120,
        spread: 90,
        origin: { y: 0.5 },
        colors: [info.color, '#ffd700', '#ffffff', '#ff8c00'],
      });
    };
    fire();
    const t = setTimeout(fire, 600);
    return () => clearTimeout(t);
  }, [info.color]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85">
      <div
        className="border-4 p-8 flex flex-col items-center gap-5 max-w-sm text-center"
        style={{
          borderColor: info.color,
          boxShadow: `0 0 80px ${info.color}66`,
          background: '#0a0a00',
          fontFamily: '"Press Start 2P", monospace',
        }}
      >
        <div className="text-4xl animate-bounce" style={{ color: info.color }}>{info.icon}</div>
        <div className="text-xs tracking-widest" style={{ color: info.color }}>
          BADGE EARNED!
        </div>
        <div className="text-white text-[10px]">{info.name}</div>
        <div className="text-gray-400 text-[9px] leading-relaxed">
          {info.desc} Your progress is now reflected in Classic Mode.
        </div>
        <div className="w-full h-px" style={{ background: `${info.color}33` }} />
        <button
          onClick={onClose}
          className="w-full py-3 text-[10px] text-black font-bold hover:brightness-110 transition-colors"
          style={{ background: info.color }}
        >
          ★ AWESOME! CONTINUE ★
        </button>
      </div>
    </div>
  );
}

// --------------- Sensei Message ---------------
function SenseiMessage({
  text,
  onClose,
}: {
  text: string;
  onClose: () => void;
}) {
  return (
    <div className="fixed bottom-16 left-1/2 -translate-x-1/2 z-50">
      <div
        className="border-2 border-[#F7931A] px-5 py-3 text-[10px] text-white flex items-center gap-3"
        style={{
          background: '#0a0a0a',
          fontFamily: '"Press Start 2P", monospace',
          minWidth: 280,
        }}
      >
        <span className="text-[#F7931A] text-base">☯</span>
        <span>{text}</span>
        <button
          onClick={onClose}
          className="ml-auto text-gray-500 hover:text-white text-xs"
        >
          ✕
        </button>
      </div>
    </div>
  );
}

// --------------- Main GamePage ---------------
export default function GamePage() {
  const navigate = useNavigate();
  const { completeLesson, awardBadge, isLessonCompleted, completedLessonIds } =
    useProgressStore();
  const { soundEnabled, toggleSound } = useSettingsStore();

  const containerRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<Phaser.Game | null>(null);
  const audioInitRef = useRef(false);

  const [paused, setPaused] = useState(false);
  const [activeLesson, setActiveLesson] =
    useState<LessonActivatedPayload | null>(null);
  const [activeNpc, setActiveNpc] = useState<NpcDialoguePayload | null>(null);
  const [showBadge, setShowBadge] = useState<string | null>(null);
  const [senseiMsg, setSenseiMsg] = useState<string | null>(null);
  const [shownBadges, setShownBadges] = useState<Set<string>>(new Set());

  // Load Press Start 2P font
  useEffect(() => {
    const link = document.createElement('link');
    link.href =
      'https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
    return () => {
      document.head.removeChild(link);
    };
  }, []);

  // Initialize audio on first user interaction (browser autoplay policy)
  useEffect(() => {
    const initAudio = () => {
      if (audioInitRef.current) return;
      audioInitRef.current = true;
      AudioManager.init();
      AudioManager.setMuted(!useSettingsStore.getState().soundEnabled);
    };
    window.addEventListener('click', initAudio, { once: true });
    window.addEventListener('keydown', initAudio, { once: true });
    return () => {
      window.removeEventListener('click', initAudio);
      window.removeEventListener('keydown', initAudio);
    };
  }, []);

  // Sync mute state when soundEnabled changes
  useEffect(() => {
    AudioManager.setMuted(!soundEnabled);
  }, [soundEnabled]);

  // Cleanup audio on unmount
  useEffect(() => {
    return () => { AudioManager.dispose(); };
  }, []);

  // Initialize Phaser
  useEffect(() => {
    if (!containerRef.current || gameRef.current) return;

    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      parent: containerRef.current,
      width: 640,
      height: 512,
      pixelArt: true,
      backgroundColor: '#0d0d0d',
      render: {
        preserveDrawingBuffer: true,
      },
      scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
      },
      scene: [OverworldScene, DojoScene, CryptoDojo, PracticalDojo],
    };

    gameRef.current = new Phaser.Game(config);

    return () => {
      gameRef.current?.destroy(true);
      gameRef.current = null;
    };
  }, []);

  // EventBus: dojo ready → send completed lessons
  const handleDojoReady = useCallback(() => {
    const ids = useProgressStore.getState().completedLessonIds;
    EventBus.emit('setCompletedLessons', ids);
  }, []);

  // EventBus: lesson activated → show dialog
  const handleLessonActivated = useCallback(
    (payload: LessonActivatedPayload) => {
      AudioManager.playTerminalOpen();
      EventBus.emit('blockInput');
      setActiveLesson(payload);
    },
    []
  );

  // EventBus: award badge
  const handleAwardBadge = useCallback((badgeId?: string) => {
    const id = typeof badgeId === 'string' ? badgeId : 'basics-complete';
    if (shownBadges.has(id)) return;
    awardBadge(id);
    setShownBadges((prev) => new Set(prev).add(id));
    EventBus.emit('blockInput');
    setShowBadge(id);
  }, [awardBadge, shownBadges]);

  // EventBus: sensei message
  const handleSenseiMessage = useCallback((msg: string) => {
    setSenseiMsg(msg);
    setTimeout(() => setSenseiMsg(null), 3000);
  }, []);

  // EventBus: NPC dialogue
  const handleNpcDialogue = useCallback((payload: NpcDialoguePayload) => {
    AudioManager.playNpcGreeting();
    EventBus.emit('blockInput');
    setActiveNpc(payload);
  }, []);

  const closeNpcDialogue = useCallback(() => {
    setActiveNpc(null);
    EventBus.emit('unblockInput');
  }, []);

  useEffect(() => {
    EventBus.on('dojoReady', handleDojoReady);
    EventBus.on('lessonActivated', handleLessonActivated);
    EventBus.on('awardBadge', handleAwardBadge);
    EventBus.on('senseiMessage', handleSenseiMessage);
    EventBus.on('npcDialogue', handleNpcDialogue);

    return () => {
      EventBus.off('dojoReady', handleDojoReady);
      EventBus.off('lessonActivated', handleLessonActivated);
      EventBus.off('awardBadge', handleAwardBadge);
      EventBus.off('senseiMessage', handleSenseiMessage);
      EventBus.off('npcDialogue', handleNpcDialogue);
    };
  }, [
    handleDojoReady,
    handleLessonActivated,
    handleAwardBadge,
    handleSenseiMessage,
    handleNpcDialogue,
  ]);

  // ESC key: toggle pause
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (activeNpc) {
          closeNpcDialogue();
          return;
        }
        if (activeLesson) {
          closeLesson();
          return;
        }
        setPaused((p) => {
          const next = !p;
          EventBus.emit(next ? 'blockInput' : 'unblockInput');
          return next;
        });
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [activeLesson, activeNpc, closeNpcDialogue]);

  const closeLesson = useCallback(() => {
    AudioManager.playTerminalClose();
    setActiveLesson(null);
    EventBus.emit('unblockInput');
  }, []);

  const handleLessonComplete = useCallback(() => {
    if (!activeLesson) return;
    AudioManager.playLessonComplete();
    completeLesson(activeLesson.lessonId, activeLesson.xp);
    EventBus.emit('lessonComplete', activeLesson.lessonId);
    // Also update completed lessons list in registry
    const updatedIds = useProgressStore.getState().completedLessonIds;
    if (gameRef.current) {
      gameRef.current.registry.set('completedLessons', updatedIds);
    }
    setActiveLesson(null);
    EventBus.emit('unblockInput');
  }, [activeLesson, completeLesson]);

  const resumeGame = () => {
    setPaused(false);
    EventBus.emit('unblockInput');
  };

  const goToClassicMode = () => {
    navigate('/tracks');
  };

  const closeBadge = () => {
    setShowBadge(null);
    EventBus.emit('unblockInput');
  };

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center relative overflow-hidden">
      {/* Game canvas container */}
      <div ref={containerRef} className="w-full h-screen" />

      {/* Top HUD bar */}
      <div
        className="fixed top-0 left-0 right-0 h-8 flex items-center justify-between px-4 z-30"
        style={{
          background: '#0a0a0a',
          borderBottom: '2px solid #F7931A33',
          fontFamily: '"Press Start 2P", monospace',
        }}
      >
        <span className="text-[#F7931A] text-[9px]">₿ WHATISBTC</span>
        <div className="flex items-center gap-4">
          <span className="text-gray-500 text-[8px]">
            {completedLessonIds.filter((id) =>
              ['les-1-1-1', 'les-1-1-2', 'les-1-2-1', 'les-1-2-2',
               'les-2-1-1', 'les-2-1-2', 'les-2-2-1', 'les-2-2-2',
               'les-3-1-1', 'les-3-1-2', 'les-3-2-1', 'les-3-2-2'].includes(id)
            ).length}
            /12 lessons
          </span>
          <button
            onClick={() => {
              setPaused(true);
              EventBus.emit('blockInput');
            }}
            className="text-[8px] text-gray-400 hover:text-[#F7931A] transition-colors"
            style={{ fontFamily: 'inherit' }}
          >
            ESC
          </button>
        </div>
      </div>

      {/* Overlays */}
      {paused && !activeLesson && !showBadge && !activeNpc && (
        <PauseMenu
          onResume={resumeGame}
          onClassicMode={goToClassicMode}
          soundEnabled={soundEnabled}
          onToggleSound={toggleSound}
        />
      )}

      {activeLesson && (
        <LessonDialog
          lessonId={activeLesson.lessonId}
          lessonTitle={activeLesson.lessonTitle}
          xp={activeLesson.xp}
          alreadyCompleted={isLessonCompleted(activeLesson.lessonId)}
          onComplete={handleLessonComplete}
          onClose={closeLesson}
        />
      )}

      {activeNpc && (
        <NPCDialogue npcId={activeNpc.npcId} onClose={closeNpcDialogue} />
      )}

      {showBadge && <BadgeModal badgeId={showBadge} onClose={closeBadge} />}

      {senseiMsg && (
        <SenseiMessage text={senseiMsg} onClose={() => setSenseiMsg(null)} />
      )}

      {/* Floating mute button — bottom right */}
      <button
        onClick={toggleSound}
        className="fixed bottom-4 right-4 z-40 w-10 h-10 flex items-center justify-center border-2 transition-colors hover:border-[#F7931A] hover:text-[#F7931A]"
        style={{
          background: '#0a0a0acc',
          borderColor: soundEnabled ? '#555' : '#F7931A',
          color: soundEnabled ? '#888' : '#F7931A',
          fontFamily: '"Press Start 2P", monospace',
          fontSize: '14px',
        }}
        title={soundEnabled ? 'Mute sound' : 'Unmute sound'}
      >
        {soundEnabled ? '♪' : '✕'}
      </button>
    </div>
  );
}
