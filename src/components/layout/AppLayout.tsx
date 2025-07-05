
import type { ReactNode } from 'react';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarTrigger,
  SidebarInset,
} from '@/components/ui/sidebar';
import { PanelLeft } from 'lucide-react';
import { TrendsetterProLogo } from '@/components/icons';
import Link from 'next/link';
import { SidebarNav } from './SidebarNav';
import { HeaderControls } from './HeaderControls';

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <SidebarProvider defaultOpen>
      <Sidebar
        variant="sidebar" // or "floating" or "inset"
        collapsible="icon" // or "offcanvas" or "none"
        className="border-r border-sidebar-border"
      >
        <SidebarHeader className="p-4 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2 group-data-[collapsible=icon]:hidden">
            <TrendsetterProLogo className="h-8 w-8 text-primary" />
            <span className="font-semibold text-lg text-sidebar-foreground">Trendsetter Pro</span>
          </Link>
          <Link href="/dashboard" className="hidden group-data-[collapsible=icon]:flex items-center justify-center w-full">
             <TrendsetterProLogo className="h-8 w-8 text-primary" />
          </Link>
        </SidebarHeader>
        <SidebarContent>
          <SidebarNav />
        </SidebarContent>
        <SidebarFooter className="p-2">
          {/* You can add footer items here if needed */}
        </SidebarFooter>
      </Sidebar>
      <SidebarInset className="flex flex-col bg-page-background">
        <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b bg-background px-4 sm:px-6 shadow-sm">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="md:hidden">
              <PanelLeft />
            </SidebarTrigger>
            <span className="text-xl font-semibold text-foreground">Dashboard</span> {/* This title can be dynamic */}
          </div>
          <HeaderControls />
        </header>
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
