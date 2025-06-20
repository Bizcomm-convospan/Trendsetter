
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { TrendsetterProLogo } from '@/components/icons'; // Assuming you have this

export function LandingHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 max-w-screen-2xl items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <TrendsetterProLogo className="h-8 w-8 text-primary" />
          <span className="font-bold text-lg text-foreground">Trendsetter Pro</span>
        </Link>
        <nav className="flex items-center gap-4">
          <Link href="/" className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary">
            Home
          </Link>
          <Link href="/pricing" className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary">
            Pricing
          </Link>
          <Button asChild>
            <Link href="/login">Login</Link>
          </Button>
           <Button asChild variant="outline">
            <Link href="/dashboard">Go to App</Link>
          </Button>
        </nav>
      </div>
    </header>
  );
}
