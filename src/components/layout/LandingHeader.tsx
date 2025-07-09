
'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { TrendsetterProLogo } from '@/components/icons';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export function LandingHeader() {
  const { t } = useTranslation();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 max-w-screen-2xl items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <TrendsetterProLogo className="h-8 w-8 text-primary" />
          <span className="font-bold text-lg text-foreground">Trendsetter Pro</span>
        </Link>
        
        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-4">
          <Link href="/" className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary">
            {t('nav.home')}
          </Link>
          <Link href="/pricing" className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary">
            {t('nav.pricing')}
          </Link>
          <Link href="/faq" className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary">
            FAQ
          </Link>
          <Button asChild>
            <Link href="/login">{t('nav.login')}</Link>
          </Button>
           <Button asChild variant="outline">
            <Link href="/dashboard">{t('nav.goToApp')}</Link>
          </Button>
        </nav>

        {/* Mobile Navigation */}
        <div className="md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <nav className="flex flex-col gap-6 p-6">
                <Link href="/" className="text-lg font-medium text-foreground transition-colors hover:text-primary">
                  {t('nav.home')}
                </Link>
                <Link href="/pricing" className="text-lg font-medium text-foreground transition-colors hover:text-primary">
                  {t('nav.pricing')}
                </Link>
                <Link href="/faq" className="text-lg font-medium text-foreground transition-colors hover:text-primary">
                  FAQ
                </Link>
                <div className="flex flex-col gap-4 mt-4">
                  <Button asChild>
                    <Link href="/login">{t('nav.login')}</Link>
                  </Button>
                  <Button asChild variant="outline">
                    <Link href="/dashboard">{t('nav.goToApp')}</Link>
                  </Button>
                </div>
              </nav>
            </SheetContent>
          </Sheet>
        </div>

      </div>
    </header>
  );
}
