import { ReactNode } from 'react';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { cn } from '@/lib/cn';

interface PageWrapperProps {
  children: ReactNode;
  className?: string;
  fullBleed?: boolean;
}

export function PageWrapper({ children, className, fullBleed = false }: PageWrapperProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className={cn(
        'flex-1',
        !fullBleed && 'max-w-7xl mx-auto w-full px-4 sm:px-6 py-8',
        className
      )}>
        {children}
      </main>
      <Footer />
    </div>
  );
}
