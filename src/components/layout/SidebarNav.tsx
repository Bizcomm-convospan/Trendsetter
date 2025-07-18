
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Wand2, ScanText, User, BrainCircuit, MessageCircleQuestion, ClipboardCheck, Target, Users as UsersIcon, Mail, Key } from 'lucide-react';
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';

export function SidebarNav() {
  const pathname = usePathname();
  const { t } = useTranslation();

  const navItems = [
    { href: '/dashboard', label: t('sidebar.dashboard'), icon: LayoutDashboard },
    { href: '/dashboard/content-creation', label: 'Content Creation', icon: Wand2 },
    { href: '/dashboard/keyword-strategy', label: 'Keyword Strategy', icon: Key },
    { href: '/dashboard/question-spy', label: t('sidebar.questionSpy'), icon: MessageCircleQuestion },
    { href: '/dashboard/competitor-analyzer', label: t('sidebar.competitorAnalyzer'), icon: Target },
    { href: '/dashboard/answer-the-ai', label: t('sidebar.answerTheAI'), icon: BrainCircuit },
    { href: '/dashboard/ai-detector', label: t('sidebar.aiDetector'), icon: ScanText },
    { href: '/dashboard/humanizer', label: t('sidebar.aiHumanizer'), icon: Wand2 },
    { href: '/dashboard/prospecting', label: t('sidebar.prospecting'), icon: ClipboardCheck },
    { href: '/dashboard/prospects', label: t('sidebar.viewProspects'), icon: UsersIcon },
    { href: '/dashboard/profile', label: t('sidebar.myProfile'), icon: User },
    { href: '/contact', label: 'Contact Us', icon: Mail },
  ];

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
