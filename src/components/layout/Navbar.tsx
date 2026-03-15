import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Bitcoin, BookOpen, LayoutDashboard, Menu, X, Activity, Gamepad2 } from 'lucide-react';
import { useState } from 'react';
import { useProgressStore } from '@/store/useProgressStore';
import { getLevelInfo } from '@/lib/xp';
import { cn } from '@/lib/cn';
import { motion, AnimatePresence } from 'framer-motion';

export function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { totalXP } = useProgressStore();
  const [mobileOpen, setMobileOpen] = useState(false);

  const levelInfo = getLevelInfo(totalXP);

  // Hide navbar in game mode (game has its own HUD)
  if (location.pathname === '/game') return null;

  const navLinks = [
    { to: '/tracks', label: 'Tracks', icon: BookOpen },
    { to: '/network', label: 'Network', icon: Activity },
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex h-16 items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-full bg-btc-orange flex items-center justify-center group-hover:shadow-[0_0_15px_#F7931A66] transition-shadow">
            <Bitcoin className="w-4 h-4 text-black" />
          </div>
          <span className="font-bold text-lg tracking-tight">
            <span className="text-gradient-orange">What</span>
            <span className="text-foreground">is</span>
            <span className="text-gradient-orange">BTC</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              className={cn(
                'flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                location.pathname.startsWith(to)
                  ? 'text-btc-orange bg-btc-orange/10'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              )}
            >
              <Icon className="w-4 h-4" />
              {label}
            </Link>
          ))}

          {/* Game Mode button */}
          <button
            onClick={() => navigate('/game')}
            className={cn(
              'flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium transition-all border',
              'border-btc-orange/60 text-btc-orange bg-btc-orange/5',
              'hover:bg-btc-orange hover:text-black hover:shadow-[0_0_12px_#F7931A55]'
            )}
          >
            <Gamepad2 className="w-4 h-4" />
            Game Mode
          </button>
        </nav>

        {/* XP display */}
        <div className="hidden md:flex items-center gap-2">
          <div className="text-right">
            <div className="text-xs text-muted-foreground">{levelInfo.label}</div>
            <div className="text-sm font-semibold text-btc-orange">{totalXP.toLocaleString()} XP</div>
          </div>
        </div>

        {/* Mobile menu button */}
        <button
          className="md:hidden p-2 text-muted-foreground hover:text-foreground"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-border bg-background"
          >
            <div className="px-4 py-3 space-y-1">
              {navLinks.map(({ to, label, icon: Icon }) => (
                <Link
                  key={to}
                  to={to}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    'flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                    location.pathname.startsWith(to)
                      ? 'text-btc-orange bg-btc-orange/10'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </Link>
              ))}
              {/* Game Mode mobile link */}
              <button
                onClick={() => { setMobileOpen(false); navigate('/game'); }}
                className="flex w-full items-center gap-2 px-3 py-2 rounded-md text-sm font-medium border border-btc-orange/50 text-btc-orange hover:bg-btc-orange/10 transition-colors"
              >
                <Gamepad2 className="w-4 h-4" />
                Game Mode
              </button>
              <div className="pt-2 border-t border-border">
                <div className="px-3 py-2 text-sm">
                  <span className="text-muted-foreground">{levelInfo.label} · </span>
                  <span className="text-btc-orange font-semibold">{totalXP.toLocaleString()} XP</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
