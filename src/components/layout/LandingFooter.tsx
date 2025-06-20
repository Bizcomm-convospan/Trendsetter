
import Link from 'next/link';

export function LandingFooter() {
  const currentYear = new Date().getFullYear();
  return (
    <footer className="border-t border-border/40 bg-background">
      <div className="container flex flex-col items-center justify-between gap-4 py-10 md:h-20 md:flex-row md:py-0">
        <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
          &copy; {currentYear} Trendsetter Pro. All rights reserved.
        </p>
        <nav className="flex gap-4">
          <Link href="/terms" className="text-sm text-muted-foreground hover:text-primary">
            Terms of Service
          </Link>
          <Link href="/privacy" className="text-sm text-muted-foreground hover:text-primary">
            Privacy Policy
          </Link>
        </nav>
      </div>
    </footer>
  );
}
