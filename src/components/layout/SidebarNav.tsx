
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, TrendingUp, Wand2, ScanText, UploadCloud, User, BrainCircuit, MessageCircleQuestion, ClipboardCheck, Target } from 'lucide-react';
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/dashboard/trends', label: 'Trend Discovery', icon: TrendingUp },
  { href: '/dashboard/question-spy', label: 'Question Spy', icon: MessageCircleQuestion },
  { href: '/dashboard/competitor-analyzer', label: 'Competitor Analyzer', icon: Target },
  { href: '/dashboard/answer-the-ai', label: 'Answer the AI', icon: BrainCircuit },
  { href: '/dashboard/humanizer', label: 'AI Humanizer', icon: Wand2 },
  { href: '/dashboard/ai-detector', label: 'AI Detector', icon: ScanText },
  { href: '/dashboard/content-creation', label: 'WordPress Publisher', icon: UploadCloud },
  { href: '/dashboard/profile', label: 'My Profile', icon: User },
];

export function SidebarNav() {
  const pathname = usePathname();

  return (
    <SidebarMenu>
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
        return (
          <SidebarMenuItem key={item.href}>
            <Link href={item.href}>
              <SidebarMenuButton
                isActive={isActive}
                tooltip={{ children: item.label, side: 'right', align: 'center' }}
                className={cn(
                  isActive ? 'bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90' : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                  'justify-start'
                )}
              >
                <Icon className="h-5 w-5" />
                <span>{item.label}</span>
              </SidebarMenuButton>
            </Link>
          </SidebarMenuItem>
        );
      })}
    </SidebarMenu>
  );
}
