
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Wand2, ScanText, User, BrainCircuit, MessageCircleQuestion, Target, Key, TrendingUp, Search, FileSignature, BarChart2, Edit, Zap, Mail, ShieldCheck } from 'lucide-react';
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarSeparator
} from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';

interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
}

interface NavGroup {
  title: string;
  icon: React.ElementType;
  items: NavItem[];
}

export function SidebarNav() {
  const pathname = usePathname();
  const { t } = useTranslation();

  const navGroups: NavGroup[] = [
    {
      title: 'Strategy & Research',
      icon: Search,
      items: [
        { href: '/dashboard/keyword-strategy', label: 'Keyword Strategy', icon: Key },
        { href: '/dashboard/question-spy', label: t('sidebar.questionSpy'), icon: MessageCircleQuestion },
        { href: '/dashboard/competitor-analyzer', label: t('sidebar.competitorAnalyzer'), icon: Target },
        { href: '/dashboard/answer-the-ai', label: t('sidebar.answerTheAI'), icon: BrainCircuit },
      ]
    },
    {
      title: 'Creation & Refinement',
      icon: FileSignature,
      items: [
        { href: '/dashboard/content-creation', label: 'Content Editor & Hub', icon: Wand2 },
        { href: '/dashboard/ai-detector', label: t('sidebar.aiDetector'), icon: ScanText },
        { href: '/dashboard/humanizer', label: t('sidebar.aiHumanizer'), icon: Wand2 },
        { href: '/dashboard/plagiarism-checker', label: 'Plagiarism Checker', icon: ShieldCheck },
      ]
    },
    {
        title: 'Performance & Outreach',
        icon: BarChart2,
        items: [
            { href: '/dashboard/performance', label: 'Content Performance', icon: TrendingUp },
            { href: '/dashboard/email-outreach', label: 'Email Outreach', icon: Mail },
            { href: '/dashboard/integrations', label: 'Integrations', icon: Zap },
            { href: '/dashboard/profile', label: t('sidebar.myProfile'), icon: User },
        ]
    }
  ];

  const renderNavItem = (item: NavItem) => {
    const Icon = item.icon;
    const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
    return (
      <SidebarMenuItem key={item.href}>
        <Link href={item.href} passHref>
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
  };

  const dashboardItem = { href: '/dashboard', label: t('sidebar.dashboard'), icon: LayoutDashboard };

  return (
    <SidebarMenu>
      {renderNavItem(dashboardItem)}
      <SidebarSeparator className="my-2" />

      {navGroups.map((group) => {
        const GroupIcon = group.icon;
        return (
          <SidebarGroup key={group.title}>
            <SidebarGroupLabel className="flex items-center gap-2">
                <GroupIcon className="h-4 w-4" />
                {group.title}
            </SidebarGroupLabel>
            {group.items.map(renderNavItem)}
          </SidebarGroup>
        )
      })}
    </SidebarMenu>
  );
}
