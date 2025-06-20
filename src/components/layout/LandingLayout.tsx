
import type { ReactNode } from 'react';
import { LandingHeader } from './LandingHeader';
import { LandingFooter } from './LandingFooter';

interface LandingLayoutProps {
  children: ReactNode;
}

export function LandingLayout({ children }: LandingLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col bg-page-background">
      <LandingHeader />
      <main className="flex-1">{children}</main>
      <LandingFooter />
    </div>
  );
}
