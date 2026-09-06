import { useEffect, useMemo, useState } from 'react';
import { QueryClient, QueryClientProvider, useQueryClient } from '@tanstack/react-query';
import {
  AlertCircle,
  ArrowRight,
  Bell,
  BookOpen,
  Check,
  CheckCircle2,
  ChevronDown,
  CircleHelp,
  Clock3,
  FilePlus2,
  Filter,
  Headphones,
  Inbox,
  KeyRound,
  LayoutDashboard,
  LifeBuoy,
  Loader2,
  LogOut,
  Mail,
  Menu,
  MessageSquareText,
  Paperclip,
  PanelLeftClose,
  Printer,
  RefreshCw,
  Search,
  Send,
  Shield,
  ShieldCheck,
  Sparkles,
  TicketCheck,
  Timer,
  UserRound,
  UsersRound,
  Wifi,
  X,
  XCircle,
  Zap,
} from 'lucide-react';
import {
  getGetSupportOverviewQueryKey,
  getListNotificationsQueryKey,
  getListTicketActivityQueryKey,
  getListTicketAttachmentsQueryKey,
  getListTicketCommentsQueryKey,
  getListSimilarTicketsQueryKey,
  getListTicketsQueryKey,
  useAdvanceTroubleshooting,
  useCreateTicket,
  useCreateTicketAttachment,
  useCreateTicketComment,
  useGetSupportOverview,
  useHealthCheck,
  useListNotifications,
  useListSimilarTickets,
  useListTicketActivity,
  useListTicketAttachments,
  useListTicketComments,
  useListTickets,
  useMarkNotificationRead,
  useStartTroubleshooting,
  useUpdateTicket,
} from '@workspace/api-client-react';
import type { AuthUser, Ticket, TroubleshootAdvanceInput, TroubleshootSession } from '@workspace/api-client-react';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import Login from '@/pages/login';
import Knowledge from '@/pages/knowledge';
import Dashboard from '@/pages/dashboard';
import { AuthProvider, useAuth } from '@/lib/auth';
import { ThemeProvider, ThemeToggle } from '@/lib/theme';
import { Link, Route, Switch, Router as WouterRouter, useLocation } from 'wouter';

const queryClient = new QueryClient();

function NotificationBell({ user }: { user: AuthUser | null }) {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();
  const notificationParams = { user: user?.name ?? '' };
  const notifications = useListNotifications(notificationParams, {
    query: {
      enabled: Boolean(user),
      refetchInterval: 8000,
      queryKey: getListNotificationsQueryKey(notificationParams),
    },
  });
  const markRead = useMarkNotificationRead();
  const items = notifications.data ?? [];
  const unread = items.filter((item) => !item.read).length;

  return (
    <div className="relative">
      <button
        type="button"
        aria-label="Notifications"
        onClick={() => setOpen((value) => !value)}
        className="focus-ring relative rounded-lg p-1.5 text-sidebar-foreground/70 hover:bg-sidebar-accent"
        data-testid="button-notifications"
      >
        <Bell size={16} />
        {unread > 0 && <span className="absolute right-0.5 top-0.5 h-2 w-2 rounded-full bg-accent" />}
      </button>
      {open && (
        <div className="absolute bottom-10 left-0 z-50 w-[280px] rounded-2xl border border-sidebar-border bg-sidebar p-3 shadow-2xl">
          <div className="mb-2 text-[10px] font-bold uppercase tracking-[0.16em] text-sidebar-foreground/55">Notifications</div>
          {items.length === 0 ? (
            <p className="text-[11px] text-sidebar-foreground/55">Nothing new yet.</p>
          ) : (
            <div className="max-h-64 space-y-2 overflow-y-auto">
              {items.slice(0, 8).map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    if (!item.read) {
                      markRead.mutate(
                        { id: item.id },
                        { onSuccess: () => void queryClient.invalidateQueries({ queryKey: getListNotificationsQueryKey({ user: user?.name ?? '' }) }) },
                      );
                    }
                  }}
                  className={`w-full rounded-xl px-2 py-2 text-left text-[11px] leading-4 ${item.read ? 'text-sidebar-foreground/55' : 'bg-sidebar-accent text-sidebar-foreground'}`}
                >
                  <div className="font-bold">{item.title}</div>
                  <div className="mt-0.5 line-clamp-2">{item.body}</div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

type TicketStatusValue = 'all' | 'open' | 'in_progress' | 'resolved';
type StatusValue = 'open' | 'in_progress' | 'resolved';
type PriorityValue = 'low' | 'medium' | 'high' | 'urgent';

const statusLabels: Record<TicketStatusValue, string> = {
  all: 'All tickets',
  open: 'Open',
  in_progress: 'In progress',
  resolved: 'Resolved',
};

const priorityLabels: Record<PriorityValue, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  urgent: 'Urgent',
};

function AppShell({ children }: { children: React.ReactNode }) {
  const [location, setLocation] = useLocation();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const health = useHealthCheck();
  const { user, logout } = useAuth();

  const navigation = user?.role === 'support'
    ? [
        { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { href: '/tickets', label: 'Service desk', icon: Inbox },
        { href: '/knowledge', label: 'Knowledge', icon: BookOpen },
      ]
    : [
        { href: '/', label: 'Support home', icon: LifeBuoy },
        { href: '/my-tickets', label: 'My tickets', icon: Inbox },
        { href: '/knowledge', label: 'Knowledge', icon: BookOpen },
      ];

  return (
    <div className="noise app-shell flex min-h-[100dvh] flex-col text-foreground lg:flex-row">
      <header className="flex h-[72px] items-center justify-between border-b border-border/80 bg-card/80 px-5 backdrop-blur-md lg:hidden">
        <Link href="/" className="focus-ring flex items-center gap-3" data-testid="link-mobile-logo">
          <BrandMark />
          <span className="font-extrabold tracking-[-0.04em]">IT Support AI Assistant</span>
        </Link>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <button
            type="button"
            aria-label="Open navigation"
            onClick={() => setMobileNavOpen((value) => !value)}
            className="focus-ring rounded-xl border border-border p-2.5 transition hover:bg-muted"
            data-testid="button-toggle-navigation"
          >
            {mobileNavOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </header>

      <aside className="hidden min-h-[100dvh] w-[258px] shrink-0 flex-col bg-sidebar text-sidebar-foreground lg:flex">
        <div className="flex h-[92px] items-center gap-3 px-7">
          <BrandMark />
          <div>
            <div className="text-[15px] font-extrabold tracking-[-0.04em]">IT Support AI Assistant</div>
            <div className="font-mono text-[9px] uppercase tracking-[0.22em] text-sidebar-foreground/55">Signal desk</div>
          </div>
        </div>
        <div className="mx-5 mb-8 h-px bg-sidebar-border" />
        <div className="px-5 text-[10px] font-bold uppercase tracking-[0.2em] text-sidebar-foreground/45">Workspace</div>
        <nav className="mt-3 space-y-1.5 px-3" aria-label="Primary navigation">
          {navigation.map((item) => {
            const active = location === item.href;
            const Icon = item.icon;
            return (
              <Link
                href={item.href}
                key={item.href}
                className={`focus-ring group flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition ${
                  active
                    ? 'bg-sidebar-primary text-sidebar-primary-foreground shadow-[0_8px_20px_hsl(65_91%_64%/0.12)]'
                    : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                }`}
                data-testid={`link-navigation-${item.label.toLowerCase().replaceAll(' ', '-')}`}
              >
                <Icon size={18} strokeWidth={active ? 2.4 : 1.8} />
                <span>{item.label}</span>
                {item.href === '/tickets' && (
                  <span className={`ml-auto rounded-full px-1.5 py-0.5 font-mono text-[10px] ${active ? 'bg-sidebar-primary-foreground/10' : 'bg-sidebar-accent'}`}>
                    live
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
        <div className="mt-auto px-5 pb-6">
          <div className="rounded-2xl border border-sidebar-border bg-sidebar-accent/70 p-4">
            <div className="flex items-center gap-2 text-xs font-semibold">
              <span className={`h-2 w-2 rounded-full bg-secondary ${health.isLoading ? 'pulse-dot' : ''}`} />
              Support systems {health.isError ? 'degraded' : 'online'}
            </div>
            <p className="mt-2 text-[11px] leading-relaxed text-sidebar-foreground/55">
              Your issue context stays attached from first check to human handoff.
            </p>
          </div>
          <div className="mt-5 flex items-center gap-3 border-t border-sidebar-border pt-5">
            <NotificationBell user={user} />
            <ThemeToggle variant="sidebar" />
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-accent text-sm font-extrabold text-accent-foreground">{user?.initials ?? '—'}</div>
            <div className="min-w-0">
              <div className="truncate text-xs font-bold">{user?.name ?? 'Guest'}</div>
              <div className="truncate text-[11px] text-sidebar-foreground/50">{user?.role === 'support' ? 'IT Support' : user?.department}</div>
            </div>
            <button
              type="button"
              aria-label="Sign out"
              onClick={() => { logout(); setLocation('/login'); }}
              className="ml-auto text-sidebar-foreground/40 transition hover:text-sidebar-foreground"
              data-testid="button-sign-out"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {mobileNavOpen && (
        <div className="absolute inset-x-0 top-[72px] z-40 border-b border-border bg-card p-3 shadow-lg lg:hidden">
          <nav className="space-y-1" aria-label="Mobile navigation">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileNavOpen(false)}
                  className="focus-ring flex items-center gap-3 rounded-xl px-4 py-3 font-semibold hover:bg-muted"
                  data-testid={`link-mobile-${item.label.toLowerCase().replaceAll(' ', '-')}`}
                >
                  <Icon size={18} />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      )}

      <main className="min-w-0 flex-1">
        <div className="mx-auto min-h-[calc(100dvh-72px)] max-w-[1500px] px-5 py-7 sm:px-8 lg:min-h-[100dvh] lg:px-12 lg:py-10">
          {children}
        </div>
      </main>
    </div>
  );
}

function BrandMark() {
  return (
    <div className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-secondary text-primary">
      <Zap size={18} fill="currentColor" strokeWidth={2.5} />
      <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full border-2 border-sidebar bg-accent" />
    </div>
  );
}

function PageHeader({ eyebrow, title, description, action }: { eyebrow: string; title: string; description: string; action?: React.ReactNode }) {
  return (
    <div className="reveal mb-8 flex flex-col justify-between gap-5 md:flex-row md:items-end">
      <div>
        <div className="mb-3 flex items-center gap-2 font-mono text-[10px] font-medium uppercase tracking-[0.22em] text-muted-foreground">
          <span className="h-1.5 w-1.5 rounded-full bg-accent" />
          {eyebrow}
        </div>
        <h1 className="max-w-3xl text-3xl font-extrabold leading-[1.08] tracking-[-0.055em] text-foreground sm:text-4xl lg:text-[46px]">{title}</h1>
        <p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground sm:text-[15px]">{description}</p>
      </div>
      {action}
    </div>
  );
}

const WIFI_PRESET = 'I am connected to Wi-Fi but websites don\'t work.';
const PERFORMANCE_PRESET = 'My laptop is very slow.';
const VPN_PRESET = 'VPN disconnects every 10 minutes.';
const ACCESS_PRESET = 'I forgot my password.';
const EMAIL_PRESET = 'Outlook is not sending email.';
const PRINTER_PRESET = 'My printer will not print.';

const slaForPriority: Record<PriorityValue, string> = {
  urgent: '1h',
  high: '4h',
  medium: '8h',
  low: '2d',
};

function buildDiagnosticLog(session: TroubleshootSession): string {
  const lines = session.steps
    .filter((step) => step.status !== 'pending')
    .map((step) => {
      const finding = step.finding ? ` (${step.finding.replaceAll('_', ' ')})` : '';
      const remediations =
        step.status === 'failed' && step.remediations.length > 0
          ? `\n  Remediations: ${step.remediations.join('; ')}`
          : '';
      return `- ${step.label}: ${step.status}${finding}${remediations}`;
    });
  const { category, device, priority } = session.classification;
  return `${session.issue}\n\nCategory: ${category}\nDevice: ${device}\nPriority: ${priority}\n\nRecommendation: ${session.recommendation}\n\nDiagnostic log:\n${lines.join('\n')}`;
}

function stepRowClass(status: TroubleshootSession['steps'][number]['status']) {
  if (status === 'running') return 'border-chart-3/40 bg-chart-3/5';
  if (status === 'passed') return 'border-secondary/30 bg-secondary/5';
  if (status === 'failed') return 'border-destructive/30 bg-destructive/5';
  return 'border-border bg-background/45';
}

function StepActions({
  current,
  pending,
  onAdvance,
}: {
  current: TroubleshootSession['steps'][number];
  pending: boolean;
  onAdvance: (outcome: TroubleshootAdvanceInput['outcome'], finding?: string | null) => void;
}) {
  const actionClass =
    'focus-ring inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-xs font-extrabold transition hover:-translate-y-0.5 disabled:opacity-55';

  if (current.kind === 'handoff') return null;

  if (current.status === 'failed') {
    return (
      <div className="mt-4">
        {current.remediations.length > 0 && (
          <ul className="space-y-2" data-testid="list-step-remediations">
            {current.remediations.map((item) => (
              <li key={item} className="flex items-start gap-2 rounded-xl border border-border bg-background/70 px-3 py-2 text-xs leading-5">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                {item}
              </li>
            ))}
          </ul>
        )}
        <div className="mt-4 flex flex-wrap gap-2">
          <button type="button" disabled={pending} onClick={() => onAdvance('fixed')} className={`${actionClass} bg-secondary text-secondary-foreground`} data-testid="button-step-fixed">
            {pending ? <Loader2 size={15} className="animate-spin" /> : <CheckCircle2 size={15} />} That fixed it
          </button>
          <button type="button" disabled={pending} onClick={() => onAdvance('still_broken')} className={`${actionClass} bg-primary text-primary-foreground`} data-testid="button-step-still-broken">
            Still not working
          </button>
        </div>
      </div>
    );
  }

  if (current.status !== 'running') return null;

  if (current.kind === 'action') {
    return (
      <div className="mt-4 flex flex-wrap gap-2">
        <button type="button" disabled={pending} onClick={() => onAdvance('passed')} className={`${actionClass} bg-primary text-primary-foreground`} data-testid="button-step-did-this">
          {pending ? <Loader2 size={15} className="animate-spin" /> : <Check size={15} />} I did this
        </button>
        <button type="button" disabled={pending} onClick={() => onAdvance('still_broken')} className={`${actionClass} border border-border bg-card`} data-testid="button-step-skip">
          Skip for now
        </button>
      </div>
    );
  }

  if (current.id === 'test-website') {
    return (
      <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
        <button type="button" disabled={pending} onClick={() => onAdvance('fixed')} className={`${actionClass} bg-secondary text-secondary-foreground`} data-testid="button-sites-work">
          Sites work now
        </button>
        <button type="button" disabled={pending} onClick={() => onAdvance('failed', 'one_site')} className={`${actionClass} border border-border bg-card`} data-testid="button-one-site">
          Only one website fails
        </button>
        <button type="button" disabled={pending} onClick={() => onAdvance('failed', 'all_sites')} className={`${actionClass} bg-primary text-primary-foreground`} data-testid="button-all-sites">
          Many websites fail
        </button>
      </div>
    );
  }

  if (current.id === 'retest-performance' || current.id.endsWith('-retest')) {
    return (
      <div className="mt-4 flex flex-col gap-2 sm:flex-row">
        <button type="button" disabled={pending} onClick={() => onAdvance('fixed')} className={`${actionClass} bg-secondary text-secondary-foreground`} data-testid="button-retest-resolved">
          {pending ? <Loader2 size={15} className="animate-spin" /> : <CheckCircle2 size={15} />} It’s working now
        </button>
        <button type="button" disabled={pending} onClick={() => onAdvance('failed')} className={`${actionClass} bg-primary text-primary-foreground`} data-testid="button-retest-failed">
          <XCircle size={15} /> Still broken
        </button>
      </div>
    );
  }

  if (current.id === 'other-device') {
    return (
      <div className="mt-4 flex flex-col gap-2 sm:flex-row">
        <button type="button" disabled={pending} onClick={() => onAdvance('failed', 'other_devices')} className={`${actionClass} bg-primary text-primary-foreground`} data-testid="button-other-devices">
          Other devices also fail
        </button>
        <button type="button" disabled={pending} onClick={() => onAdvance('failed', 'this_device')} className={`${actionClass} border border-border bg-card`} data-testid="button-this-device">
          Only this laptop fails
        </button>
      </div>
    );
  }

  return (
    <div className="mt-4 flex flex-wrap gap-2">
      <button type="button" disabled={pending} onClick={() => onAdvance('passed')} className={`${actionClass} bg-primary text-primary-foreground`} data-testid="button-step-passed">
        {pending ? <Loader2 size={15} className="animate-spin" /> : <Check size={15} />} This passed
      </button>
      <button type="button" disabled={pending} onClick={() => onAdvance('failed')} className={`${actionClass} border border-border bg-card`} data-testid="button-step-failed">
        <XCircle size={15} /> This failed
      </button>
    </div>
  );
}

function Home() {
  const { user } = useAuth();
  const [issue, setIssue] = useState('');
  const [session, setSession] = useState<TroubleshootSession | null>(null);
  const [createdTicket, setCreatedTicket] = useState<Ticket | null>(null);
  const [closedTicket, setClosedTicket] = useState<Ticket | null>(null);
  const [escalated, setEscalated] = useState(false);
  const supportOverview = useGetSupportOverview();
  const startTroubleshooting = useStartTroubleshooting();
  const advanceTroubleshooting = useAdvanceTroubleshooting();
  const createTicket = useCreateTicket();
  const updateTicket = useUpdateTicket();
  const queryClient = useQueryClient();
  const similarNeedle = (session?.issue ?? issue).trim();
  const similarParams = { q: similarNeedle || 'issue' };
  const similarTickets = useListSimilarTickets(similarParams, {
    query: {
      enabled: similarNeedle.length >= 8,
      queryKey: getListSimilarTicketsQueryKey(similarParams),
    },
  });

  const currentStep = session ? session.steps[session.currentStep] : undefined;
  const passedSteps = session?.steps.filter((step) => step.status === 'passed').length ?? 0;
  const completion = session ? Math.round((passedSteps / session.steps.length) * 100) : 0;

  const beginWithIssue = (nextIssue: string) => {
    if (!nextIssue.trim()) return;
    setCreatedTicket(null);
    setClosedTicket(null);
    setEscalated(false);
    startTroubleshooting.mutate(
      { data: { issue: nextIssue.trim() } },
      { onSuccess: (nextSession) => setSession(nextSession) },
    );
  };

  const begin = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    beginWithIssue(issue);
  };

  const advance = (outcome: TroubleshootAdvanceInput['outcome'], finding?: string | null) => {
    if (!session) return;
    advanceTroubleshooting.mutate(
      { id: session.id, data: { outcome, finding } },
      { onSuccess: (nextSession) => setSession(nextSession) },
    );
  };

  const refreshDesk = () => {
    void queryClient.invalidateQueries({ queryKey: getListTicketsQueryKey() });
    void queryClient.invalidateQueries({ queryKey: getGetSupportOverviewQueryKey() });
    void queryClient.invalidateQueries({ queryKey: getListSimilarTicketsQueryKey(similarParams) });
  };

  const makeTicket = (escalate = false) => {
    if (!session) return;
    const priority = escalate ? 'urgent' : session.classification.priority;
    createTicket.mutate(
      {
        data: {
          title: session.issue,
          requester: user?.name ?? 'Unknown employee',
          department: user?.department ?? 'Unassigned',
          status: 'open',
          priority,
          category: session.classification.category,
          description: buildDiagnosticLog(session),
          assignee: escalate ? 'Level 2' : null,
          sla: slaForPriority[priority],
        },
      },
      {
        onSuccess: (created) => {
          setCreatedTicket(created);
          if (escalate) setEscalated(true);
          refreshDesk();
          if (currentStep?.kind === 'handoff') {
            advanceTroubleshooting.mutate(
              { id: session.id, data: { outcome: 'passed' } },
              { onSuccess: (nextSession) => setSession(nextSession) },
            );
          }
        },
      },
    );
  };

  const escalateTicket = () => {
    if (!session) return;
    if (!createdTicket) {
      makeTicket(true);
      return;
    }
    updateTicket.mutate(
      { id: createdTicket.id, data: { priority: 'urgent', assignee: 'Level 2', sla: '1h' } },
      {
        onSuccess: (updated) => {
          setCreatedTicket(updated);
          setEscalated(true);
          refreshDesk();
          if (currentStep?.id === 'escalate-l2') {
            advanceTroubleshooting.mutate(
              { id: session.id, data: { outcome: 'passed' } },
              { onSuccess: (nextSession) => setSession(nextSession) },
            );
          }
        },
      },
    );
  };

  const recordClosed = (ticket: Ticket) => {
    setCreatedTicket(ticket);
    setClosedTicket(ticket);
    refreshDesk();
  };

  const closeTicketFromSession = () => {
    if (!session) return;
    if (createdTicket && createdTicket.status !== 'resolved') {
      updateTicket.mutate(
        { id: createdTicket.id, data: { status: 'resolved', sla: 'Resolved' } },
        { onSuccess: recordClosed },
      );
      return;
    }
    const match = (similarTickets.data ?? []).find(
      (item) => item.status !== 'resolved' && (user?.role === 'support' || item.requester === user?.name),
    );
    if (match) {
      updateTicket.mutate(
        { id: match.id, data: { status: 'resolved', sla: 'Resolved' } },
        { onSuccess: recordClosed },
      );
      return;
    }
    createTicket.mutate(
      {
        data: {
          title: session.issue,
          requester: user?.name ?? 'Unknown employee',
          department: user?.department ?? 'Unassigned',
          status: 'resolved',
          priority: session.classification.priority,
          category: session.classification.category,
          description: `${buildDiagnosticLog(session)}\n\nResolution: Employee confirmed the guided checks restored the service.`,
          assignee: null,
          sla: 'Resolved',
        },
      },
      { onSuccess: recordClosed },
    );
  };

  return (
    <div className="mx-auto max-w-[1160px]">
      <PageHeader
        eyebrow="Employee support / 01"
        title="Let’s turn the vague bit into a next step."
        description="Describe what’s going wrong in plain language. We’ll run a few safe checks, then tell you exactly what to do — or bring in a person with the context attached."
        action={
          <div className="flex items-center gap-2 rounded-full border border-border bg-card px-3 py-2 text-xs font-semibold text-muted-foreground shadow-xs">
            <ShieldCheck size={15} className="text-chart-3" />
            Private by default
          </div>
        }
      />

      <section className="reveal reveal-delay-1 grid overflow-hidden rounded-[28px] border border-primary/10 bg-primary text-primary-foreground shadow-2xl lg:grid-cols-[1.1fr_0.9fr]" aria-label="Start troubleshooting">
        <div className="soft-grid relative p-6 sm:p-9 lg:p-12">
          <div className="absolute right-9 top-8 hidden rounded-full border border-primary-foreground/15 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.16em] text-primary-foreground/50 sm:block">
            Guided session
          </div>
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-secondary text-primary">
            <MessageSquareText size={21} />
          </div>
          <h2 className="mt-7 max-w-lg text-2xl font-extrabold leading-tight tracking-[-0.04em] sm:text-3xl">What’s the thing that isn’t working?</h2>
          <p className="mt-3 max-w-md text-sm leading-6 text-primary-foreground/62">No need to know the right words. Include what you expected, what happened, and when you first noticed it.</p>
          <form onSubmit={begin} className="mt-8">
            <label htmlFor="issue" className="sr-only">Describe your issue</label>
            <textarea
              id="issue"
              value={issue}
              onChange={(event) => setIssue(event.target.value)}
              placeholder="For example: I can connect to Wi-Fi, but internal tools keep timing out…"
              className="focus-ring min-h-[132px] w-full resize-none rounded-2xl border border-primary-foreground/15 bg-primary-foreground/[0.08] p-4 text-sm leading-6 text-primary-foreground placeholder:text-primary-foreground/35 transition focus:border-secondary focus:bg-primary-foreground/[0.12]"
              data-testid="input-issue-description"
            />
            <div className="mt-3 flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
              <span className="text-[11px] text-primary-foreground/45">Your description is only shared with Support if you create a ticket.</span>
              <button
                type="submit"
                disabled={!issue.trim() || startTroubleshooting.isPending}
                className="focus-ring inline-flex items-center gap-2 rounded-xl bg-secondary px-4 py-3 text-xs font-extrabold text-secondary-foreground shadow-[0_8px_18px_hsl(65_91%_64%/0.16)] transition hover:-translate-y-0.5 hover:shadow-[0_12px_20px_hsl(65_91%_64%/0.22)] disabled:cursor-not-allowed disabled:opacity-50"
                data-testid="button-start-troubleshooting"
              >
                {startTroubleshooting.isPending ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                {startTroubleshooting.isPending ? 'Preparing checks…' : 'Start guided check'}
                {!startTroubleshooting.isPending && <ArrowRight size={15} />}
              </button>
            </div>
          </form>
          <div className="mt-4 flex flex-wrap gap-2">
            {[
              { preset: WIFI_PRESET, icon: Wifi, testId: 'button-wifi-preset' },
              { preset: PERFORMANCE_PRESET, icon: Zap, testId: 'button-performance-preset' },
              { preset: VPN_PRESET, icon: Shield, testId: 'button-vpn-preset' },
              { preset: ACCESS_PRESET, icon: KeyRound, testId: 'button-access-preset' },
              { preset: EMAIL_PRESET, icon: Mail, testId: 'button-email-preset' },
              { preset: PRINTER_PRESET, icon: Printer, testId: 'button-printer-preset' },
            ].map(({ preset, icon: Icon, testId }) => (
              <button
                key={preset}
                type="button"
                onClick={() => {
                  setIssue(preset);
                  beginWithIssue(preset);
                }}
                disabled={startTroubleshooting.isPending}
                className="focus-ring inline-flex items-center gap-2 rounded-full border border-primary-foreground/20 bg-primary-foreground/[0.08] px-3 py-1.5 text-[11px] font-semibold text-primary-foreground/80 transition hover:bg-primary-foreground/[0.14] disabled:opacity-50"
                data-testid={testId}
              >
                <Icon size={13} /> {preset}
              </button>
            ))}
          </div>
          {startTroubleshooting.isError && (
            <div className="mt-4 flex items-center gap-2 rounded-xl border border-accent/30 bg-accent/10 px-3 py-2 text-xs text-primary-foreground" role="alert" data-testid="status-start-error">
              <AlertCircle size={15} className="text-accent" /> We couldn’t start the session. Check your connection and try again.
            </div>
          )}
        </div>
        <div className="relative flex min-h-[300px] flex-col justify-between border-t border-primary-foreground/10 bg-primary-foreground/[0.045] p-6 sm:p-9 lg:border-l lg:border-t-0 lg:p-12">
          <div>
            <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.18em] text-primary-foreground/45">
              <span>What happens next</span>
              <span>01 — 03</span>
            </div>
            <div className="mt-7 space-y-5">
              {[
                ['01', 'Listen first', 'We classify the issue and match it to the right playbook — Wi-Fi, performance, VPN, password, email, or printer.'],
                ['02', 'Check safely', 'You confirm each result. Failures show the exact remediations to try.'],
                ['03', 'Make it clear', 'Close the ticket when it is fixed, or hand off with the diagnostic log.'],
              ].map(([number, label, detail]) => (
                <div key={number} className="flex gap-4">
                  <span className="font-mono text-[11px] text-secondary">{number}</span>
                  <div>
                    <div className="text-sm font-bold">{label}</div>
                    <div className="mt-1 text-xs leading-5 text-primary-foreground/48">{detail}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-10 flex items-center gap-2 text-xs font-semibold text-primary-foreground/55">
            <span className="pulse-dot h-2 w-2 rounded-full bg-secondary" />
            Average first check: under 30 seconds
          </div>
        </div>
      </section>

      {(similarTickets.data ?? []).length > 0 && (
        <section className="reveal mt-7 rounded-[25px] border border-border bg-card p-5 shadow-xs sm:p-6" aria-label="Similar past tickets" data-testid="section-similar-tickets">
          <div className="flex items-center gap-2 text-xs font-extrabold">
            <Search size={15} className="text-accent" /> Known solutions from similar tickets
          </div>
          <p className="mt-2 text-xs leading-5 text-muted-foreground">Past work that looks like this issue. Reuse the resolution if it still applies, or keep walking the playbook.</p>
          <div className="mt-4 space-y-3">
            {(similarTickets.data ?? []).slice(0, 4).map((item) => (
              <article key={item.id} className="rounded-2xl border border-border bg-background/60 p-4" data-testid={`similar-ticket-${item.id}`}>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-extrabold">{item.title}</span>
                  <span className="rounded-full bg-muted px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">{item.status.replaceAll('_', ' ')}</span>
                  <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-bold text-muted-foreground">{item.category}</span>
                </div>
                <p className="mt-2 text-sm leading-6 text-foreground/80">{item.solution}</p>
              </article>
            ))}
          </div>
        </section>
      )}

      {session && (
        <section className="reveal reveal-delay-2 mt-7 rounded-[25px] border border-border bg-card p-5 shadow-lg sm:p-8" aria-label="Troubleshooting session">
          <div className="flex flex-col justify-between gap-5 border-b border-border pb-6 sm:flex-row sm:items-start">
            <div>
              <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                <span className={`h-2 w-2 rounded-full ${session.status === 'running' ? 'pulse-dot bg-chart-3' : session.status === 'resolved' ? 'bg-secondary' : 'bg-accent'}`} />
                {session.status === 'running' ? 'Session in progress' : session.status === 'resolved' ? 'Issue path found' : 'Human help recommended'}
              </div>
              <h2 className="mt-3 max-w-2xl text-xl font-extrabold tracking-[-0.035em] sm:text-2xl">{session.issue}</h2>
              <div className="mt-4 flex flex-wrap items-center gap-2" data-testid="group-classification">
                <span className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                  <Sparkles size={12} className="text-accent" /> Identified
                </span>
                {[
                  { label: 'Category', value: session.classification.category, testId: 'badge-category' },
                  { label: 'Device', value: session.classification.device, testId: 'badge-device' },
                  { label: 'Priority', value: priorityLabels[session.classification.priority], testId: 'badge-priority' },
                ].map(({ label, value, testId }) => (
                  <span key={label} className="rounded-full bg-muted px-2.5 py-1 text-[11px] font-bold" data-testid={testId}>
                    <span className="text-muted-foreground">{label}:</span> {value}
                  </span>
                ))}
              </div>
            </div>
            <div className="rounded-xl bg-muted px-3 py-2 text-right">
              <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">Session</div>
              <div className="mt-1 font-mono text-xs font-medium">#{session.id.toString().padStart(4, '0')}</div>
            </div>
          </div>
          <div className="grid gap-8 pt-7 lg:grid-cols-[1fr_0.72fr]">
            <div>
              <div className="mb-5 flex items-center justify-between">
                <div className="text-xs font-bold">System checks</div>
                <div className="font-mono text-[11px] text-muted-foreground">{passedSteps} of {session.steps.length} passed</div>
              </div>
              <div className="mb-6 h-1.5 overflow-hidden rounded-full bg-muted">
                <div className="h-full rounded-full bg-secondary transition-all duration-500" style={{ width: `${Math.max(completion, session.status === 'running' ? 8 : 100)}%` }} />
              </div>
              <div className="space-y-2">
                {session.steps.map((step, index) => {
                  const active = index === session.currentStep && session.status !== 'resolved';
                  return (
                    <div key={step.id} className={`rounded-xl border p-3 transition ${stepRowClass(step.status)}`} data-testid={`status-check-${step.id}`}>
                      <div className="flex items-center gap-3">
                        <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${step.status === 'passed' ? 'bg-secondary text-secondary-foreground' : step.status === 'running' ? 'bg-chart-3/15 text-chart-3' : step.status === 'failed' ? 'bg-destructive/15 text-destructive' : 'bg-muted text-muted-foreground'}`}>
                          {step.status === 'passed' ? <Check size={15} strokeWidth={3} /> : step.status === 'running' ? <Loader2 size={15} className="animate-spin" /> : step.status === 'failed' ? <XCircle size={15} /> : <span className="font-mono text-[11px]">{String(index + 1).padStart(2, '0')}</span>}
                        </div>
                        <div className="min-w-0">
                          <div className="text-sm font-bold">{step.label}</div>
                          <div className={`mt-0.5 text-xs text-muted-foreground ${active ? '' : 'truncate'}`}>{step.detail}</div>
                        </div>
                        <div className="ml-auto shrink-0 font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
                          {step.status === 'running' ? 'Checking' : step.status === 'passed' ? 'Passed' : step.status === 'failed' ? 'Failed' : 'Queued'}
                        </div>
                      </div>
                      {active && currentStep && (
                        <StepActions current={currentStep} pending={advanceTroubleshooting.isPending} onAdvance={advance} />
                      )}
                    </div>
                  );
                })}
              </div>
              {advanceTroubleshooting.isError && <p className="mt-3 text-xs text-destructive" role="alert" data-testid="status-advance-error">The check paused. Please run it again.</p>}
            </div>
            <div className={`rounded-2xl p-5 ${session.status === 'needs_ticket' ? 'border border-accent/25 bg-accent/10' : session.status === 'resolved' ? 'border border-secondary/40 bg-secondary/10' : 'bg-muted/65'}`}>
              <div className="flex items-center gap-2 text-xs font-bold">
                {session.status === 'needs_ticket' ? <Headphones size={16} className="text-accent" /> : session.status === 'resolved' ? <CheckCircle2 size={16} className="text-chart-4" /> : <CircleHelp size={16} className="text-chart-3" />}
                {session.status === 'needs_ticket' ? 'A person should take this one' : session.status === 'resolved' ? 'This path worked' : 'Working recommendation'}
              </div>
              <p className="mt-4 text-sm leading-6 text-foreground/78" data-testid="text-recommendation">{session.recommendation}</p>
              {session.status === 'resolved' && !closedTicket && createdTicket?.status !== 'resolved' && (
                <button
                  type="button"
                  onClick={closeTicketFromSession}
                  disabled={createTicket.isPending || updateTicket.isPending}
                  className="focus-ring mt-6 flex w-full items-center justify-between rounded-xl bg-secondary px-4 py-3 text-left text-xs font-extrabold text-secondary-foreground transition hover:-translate-y-0.5 disabled:opacity-55"
                  data-testid="button-close-ticket-from-session"
                >
                  <span className="flex items-center gap-2">{createTicket.isPending || updateTicket.isPending ? <Loader2 size={15} className="animate-spin" /> : <TicketCheck size={15} />} Close ticket</span>
                  <ArrowRight size={15} />
                </button>
              )}
              {closedTicket && (
                <div className="mt-5 rounded-xl border border-secondary/40 bg-secondary/20 p-3 text-xs font-bold text-foreground" data-testid="status-ticket-closed">
                  <div className="flex items-center gap-2"><CheckCircle2 size={16} className="text-chart-4" /> Ticket #{String(closedTicket.id).padStart(4, '0')} marked resolved with the diagnostic log.</div>
                  <Link href={user?.role === 'support' ? '/tickets' : '/my-tickets'} className="mt-2 inline-flex items-center gap-1 text-[11px] underline underline-offset-2">View tickets <ArrowRight size={12} /></Link>
                </div>
              )}
              {session.status === 'needs_ticket' && !createdTicket && (
                <button
                  type="button"
                  onClick={() => makeTicket(false)}
                  disabled={createTicket.isPending}
                  className="focus-ring mt-6 flex w-full items-center justify-between rounded-xl bg-accent px-4 py-3 text-left text-xs font-extrabold text-accent-foreground transition hover:-translate-y-0.5 disabled:opacity-55"
                  data-testid="button-create-ticket-from-session"
                >
                  <span className="flex items-center gap-2">{createTicket.isPending ? <Loader2 size={15} className="animate-spin" /> : <FilePlus2 size={15} />} Create support ticket</span>
                  <ArrowRight size={15} />
                </button>
              )}
              {createdTicket && (
                <div className="mt-5 rounded-xl border border-secondary/40 bg-secondary/20 p-3 text-xs font-bold text-foreground" data-testid="status-ticket-created">
                  <div className="flex items-center gap-2"><CheckCircle2 size={16} className="text-chart-4" /> Ticket #{String(createdTicket.id).padStart(4, '0')} created with the diagnostic log.</div>
                  <Link href="/tickets" className="mt-2 inline-flex items-center gap-1 text-[11px] underline underline-offset-2" data-testid="link-view-created-ticket">View service desk <ArrowRight size={12} /></Link>
                </div>
              )}
              {session.status === 'needs_ticket' && currentStep?.id === 'escalate-l2' && !escalated && (
                <button
                  type="button"
                  onClick={escalateTicket}
                  disabled={createTicket.isPending || updateTicket.isPending}
                  className="focus-ring mt-3 flex w-full items-center justify-between rounded-xl bg-primary px-4 py-3 text-left text-xs font-extrabold text-primary-foreground transition hover:-translate-y-0.5 disabled:opacity-55"
                  data-testid="button-escalate-level-2"
                >
                  <span className="flex items-center gap-2">{createTicket.isPending || updateTicket.isPending ? <Loader2 size={15} className="animate-spin" /> : <Headphones size={15} />} Escalate to Level 2</span>
                  <ArrowRight size={15} />
                </button>
              )}
              {escalated && (
                <div className="mt-3 rounded-xl border border-accent/30 bg-accent/10 p-3 text-xs font-bold" data-testid="status-escalated">
                  Escalated to Level 2 as urgent {session.classification.category.toLowerCase()} work.
                </div>
              )}
              {createTicket.isError && <p className="mt-3 text-xs text-destructive" role="alert" data-testid="status-ticket-error">We couldn’t create the ticket. Please try once more.</p>}
              {updateTicket.isError && <p className="mt-3 text-xs text-destructive" role="alert">The escalation didn’t save. Please try again.</p>}
            </div>
          </div>
        </section>
      )}

      <div className="reveal reveal-delay-3 mt-8 grid gap-4 sm:grid-cols-3">
        {[
          { icon: ShieldCheck, label: 'Safe checks', text: 'Nothing changes on your device without your say-so.' },
          { icon: Timer, label: 'Clear timing', text: 'See what’s running and what still needs attention.' },
          { icon: UsersRound, label: 'Easy handoff', text: 'A support person gets the useful context, not a blank form.' },
        ].map(({ icon: Icon, label, text }) => (
          <div key={label} className="rounded-2xl border border-border/70 bg-card/55 p-4">
            <Icon size={17} className="text-accent" />
            <div className="mt-3 text-xs font-extrabold">{label}</div>
            <div className="mt-1 text-xs leading-5 text-muted-foreground">{text}</div>
          </div>
        ))}
      </div>

      <div className="reveal mt-8 flex flex-col gap-4 rounded-2xl border border-border/70 bg-card/55 p-4 sm:flex-row sm:items-center sm:justify-between sm:px-5" data-testid="support-pulse">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-chart-3/15 text-chart-3"><ActivityIcon /></div>
          <div>
            <div className="text-xs font-extrabold">Support pulse</div>
            <div className="mt-0.5 text-[11px] text-muted-foreground">
              {supportOverview.isLoading ? 'Checking the desk now…' : supportOverview.isError ? 'Desk status is temporarily unavailable.' : `${supportOverview.data?.openTickets ?? 0} open requests · ${supportOverview.data?.avgResponse ?? '—'} average first response`}
            </div>
          </div>
        </div>
        <Link href={user?.role === 'support' ? '/tickets' : '/my-tickets'} className="focus-ring inline-flex items-center gap-2 self-start rounded-lg px-2 py-1.5 text-xs font-extrabold text-accent-foreground underline decoration-accent/40 underline-offset-4 transition hover:text-accent sm:self-auto" data-testid="link-open-service-desk">
          {user?.role === 'support' ? 'Open service desk' : 'View my tickets'} <ArrowRight size={14} />
        </Link>
      </div>
    </div>
  );
}

function ActivityIcon() {
  return <span className="relative block h-4 w-4"><span className="absolute bottom-0 left-0 h-2 w-1.5 rounded-sm bg-current" /><span className="absolute bottom-0 left-[6px] h-3 w-1.5 rounded-sm bg-current opacity-70" /><span className="absolute bottom-0 right-0 h-4 w-1.5 rounded-sm bg-current opacity-45" /></span>;
}

function Tickets() {
  const { user } = useAuth();
  const [location] = useLocation();
  const mineOnly = location === '/my-tickets' || user?.role === 'employee';
  const [statusFilter, setStatusFilter] = useState<TicketStatusValue>('all');
  const [search, setSearch] = useState('');
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const overview = useGetSupportOverview();
  const ticketsQuery = useListTickets({
    ...(statusFilter === 'all' ? {} : { status: statusFilter }),
    ...(mineOnly && user ? { requester: user.name } : {}),
  });
  const updateTicket = useUpdateTicket();
  const createTicket = useCreateTicket();
  const queryClient = useQueryClient();
  const [newTicket, setNewTicket] = useState({ title: '', requester: '', department: '', category: 'General', priority: 'medium' as PriorityValue, description: '' });

  const tickets = useMemo(() => {
    const allTickets = ticketsQuery.data ?? [];
    const query = search.trim().toLowerCase();
    if (!query) return allTickets;
    return allTickets.filter((ticket) => [ticket.title, ticket.requester, ticket.department, ticket.category].some((value) => value.toLowerCase().includes(query)));
  }, [ticketsQuery.data, search]);

  const refreshDesk = () => {
    void queryClient.invalidateQueries({ queryKey: getListTicketsQueryKey() });
    void queryClient.invalidateQueries({ queryKey: getGetSupportOverviewQueryKey() });
  };

  const patchTicket = (id: number, data: { status?: StatusValue; priority?: PriorityValue; assignee?: string | null }) => {
    updateTicket.mutate({ id, data }, { onSuccess: (updated) => { setSelectedTicket(updated); refreshDesk(); } });
  };

  const submitNewTicket = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const requester = newTicket.requester.trim() || user?.name || '';
    const department = newTicket.department.trim() || user?.department || '';
    if (!newTicket.title.trim() || !requester || !department || !newTicket.description.trim()) return;
    createTicket.mutate(
      {
        data: {
          ...newTicket,
          title: newTicket.title.trim(),
          requester,
          department,
          description: newTicket.description.trim(),
          status: 'open',
          sla: newTicket.priority === 'urgent' ? '1h' : newTicket.priority === 'high' ? '4h' : '8h',
          assignee: null,
        },
      },
      { onSuccess: (created) => { setCreateOpen(false); setSelectedTicket(created); setNewTicket({ title: '', requester: '', department: '', category: 'General', priority: 'medium', description: '' }); refreshDesk(); } },
    );
  };

  return (
    <div className="mx-auto max-w-[1280px]">
      <PageHeader
        eyebrow={mineOnly ? 'Employee / My tickets' : 'Support team / Service desk'}
        title={mineOnly ? 'Your requests, still in view.' : 'Keep the signal moving.'}
        description={mineOnly ? 'Track the tickets you opened, add comments or screenshots, and see when Support moves them.' : 'A calm queue for turning employee friction into resolved work. Filter the incoming, update the owner, and keep the next handoff obvious.'}
        action={
          <button
            type="button"
            onClick={() => setCreateOpen(true)}
            className="focus-ring inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-xs font-extrabold text-primary-foreground transition hover:-translate-y-0.5 hover:shadow-lg"
            data-testid="button-open-create-ticket"
          >
            <FilePlus2 size={16} /> Log a ticket
          </button>
        }
      />

      <section className="reveal reveal-delay-1 grid gap-3 sm:grid-cols-2 xl:grid-cols-4" aria-label="Support overview">
        {overview.isLoading ? <OverviewSkeleton /> : overview.isError ? (
          <div className="col-span-full flex items-center justify-between rounded-2xl border border-accent/30 bg-accent/10 p-5 text-sm" data-testid="status-overview-error">
            <span className="flex items-center gap-2"><AlertCircle size={17} className="text-accent" /> Overview unavailable right now.</span>
            <button type="button" onClick={() => void overview.refetch()} className="focus-ring inline-flex items-center gap-2 rounded-lg bg-card px-3 py-2 text-xs font-bold" data-testid="button-retry-overview"><RefreshCw size={13} /> Retry</button>
          </div>
        ) : (
          <>
            <MetricCard label="Open tickets" value={overview.data?.openTickets ?? 0} detail="Need a first response" icon={Inbox} accent="bg-accent/15 text-accent" testId="metric-open-tickets" />
            <MetricCard label="In progress" value={overview.data?.inProgressTickets ?? 0} detail="Being actively worked" icon={Clock3} accent="bg-chart-3/15 text-chart-3" testId="metric-in-progress" />
            <MetricCard label="Resolved today" value={overview.data?.resolvedToday ?? 0} detail="Good work, made visible" icon={TicketCheck} accent="bg-secondary text-primary" testId="metric-resolved-today" />
            <MetricCard label="Avg. first response" value={overview.data?.avgResponse ?? '—'} detail="Across the current queue" icon={Timer} accent="bg-primary text-primary-foreground" testId="metric-average-response" />
          </>
        )}
      </section>

      <section className="reveal reveal-delay-2 mt-7 overflow-hidden rounded-[25px] border border-border bg-card shadow-lg" aria-label="Ticket queue">
        <div className="flex flex-col gap-4 border-b border-border p-5 sm:p-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex items-center gap-2 text-sm font-extrabold"><Inbox size={17} className="text-accent" /> Incoming queue</div>
            <div className="mt-1 text-xs text-muted-foreground">{tickets.length} visible ticket{tickets.length === 1 ? '' : 's'} · latest activity first</div>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <div className="relative">
              <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search tickets"
                className="focus-ring h-10 w-full rounded-xl border border-input bg-background pl-9 pr-3 text-xs outline-none transition focus:border-accent sm:w-[210px]"
                data-testid="input-search-tickets"
              />
            </div>
            <div className="relative">
              <Filter size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value as TicketStatusValue)}
                className="focus-ring h-10 w-full appearance-none rounded-xl border border-input bg-background pl-9 pr-9 text-xs font-semibold outline-none transition focus:border-accent sm:w-[155px]"
                data-testid="select-ticket-status-filter"
              >
                {(Object.keys(statusLabels) as TicketStatusValue[]).map((value) => <option key={value} value={value}>{statusLabels[value]}</option>)}
              </select>
              <ChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            </div>
          </div>
        </div>

        {ticketsQuery.isLoading ? <TicketListSkeleton /> : ticketsQuery.isError ? (
          <div className="flex flex-col items-center justify-center px-6 py-20 text-center" data-testid="status-tickets-error">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent/15 text-accent"><AlertCircle size={22} /></div>
            <h3 className="mt-4 text-sm font-extrabold">The queue is taking a breather.</h3>
            <p className="mt-1 max-w-xs text-xs leading-5 text-muted-foreground">We couldn’t load tickets. Your existing work is safe — try reconnecting.</p>
            <button type="button" onClick={() => void ticketsQuery.refetch()} className="focus-ring mt-5 inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs font-bold text-primary-foreground" data-testid="button-retry-tickets"><RefreshCw size={14} /> Try again</button>
          </div>
        ) : tickets.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-6 py-20 text-center" data-testid="status-tickets-empty">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-border bg-muted text-muted-foreground"><Search size={23} /></div>
            <h3 className="mt-4 text-sm font-extrabold">No tickets match that view.</h3>
            <p className="mt-1 max-w-xs text-xs leading-5 text-muted-foreground">Try a different filter or clear your search. Quiet queues are good queues.</p>
            <button type="button" onClick={() => { setSearch(''); setStatusFilter('all'); }} className="focus-ring mt-5 rounded-xl border border-border bg-card px-4 py-2.5 text-xs font-bold transition hover:bg-muted" data-testid="button-clear-ticket-filters">Clear filters</button>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {tickets.map((ticket) => <TicketRow key={ticket.id} ticket={ticket} onSelect={() => setSelectedTicket(ticket)} />)}
          </div>
        )}
      </section>

      {selectedTicket && (
        <TicketPanel
          ticket={selectedTicket}
          updating={updateTicket.isPending}
          updateError={updateTicket.isError}
          canManage={user?.role === 'support'}
          actor={user?.name ?? 'Someone'}
          onClose={() => setSelectedTicket(null)}
          onUpdate={patchTicket}
        />
      )}

      {createOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-primary/35 p-0 backdrop-blur-sm sm:items-center sm:p-5" role="dialog" aria-modal="true" aria-labelledby="create-ticket-title">
          <div className="max-h-[92dvh] w-full max-w-[560px] overflow-y-auto rounded-t-[25px] border border-border bg-card p-6 shadow-2xl sm:rounded-[25px] sm:p-8">
            <div className="flex items-start justify-between">
              <div><div className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">New work item</div><h2 id="create-ticket-title" className="mt-2 text-2xl font-extrabold tracking-[-0.04em]">Log a support ticket</h2></div>
              <button type="button" onClick={() => setCreateOpen(false)} className="focus-ring rounded-lg p-2 text-muted-foreground transition hover:bg-muted hover:text-foreground" data-testid="button-close-create-ticket"><X size={18} /></button>
            </div>
            <form onSubmit={submitNewTicket} className="mt-7 space-y-4">
              <Field label="Issue title" value={newTicket.title} placeholder="Short, useful summary" onChange={(value) => setNewTicket((current) => ({ ...current, title: value }))} testId="input-new-ticket-title" />
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Requester" value={newTicket.requester || user?.name || ''} placeholder="Name" onChange={(value) => setNewTicket((current) => ({ ...current, requester: value }))} testId="input-new-ticket-requester" />
                <Field label="Department" value={newTicket.department || user?.department || ''} placeholder="Team or department" onChange={(value) => setNewTicket((current) => ({ ...current, department: value }))} testId="input-new-ticket-department" />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block text-xs font-bold">Category<select value={newTicket.category} onChange={(event) => setNewTicket((current) => ({ ...current, category: event.target.value }))} className="focus-ring mt-2 h-11 w-full rounded-xl border border-input bg-background px-3 text-sm font-medium outline-none" data-testid="select-new-ticket-category"><option>General</option><option>Access</option><option>Hardware</option><option>Network</option><option>Software</option></select></label>
                <label className="block text-xs font-bold">Priority<select value={newTicket.priority} onChange={(event) => setNewTicket((current) => ({ ...current, priority: event.target.value as PriorityValue }))} className="focus-ring mt-2 h-11 w-full rounded-xl border border-input bg-background px-3 text-sm font-medium outline-none" data-testid="select-new-ticket-priority">{(Object.keys(priorityLabels) as PriorityValue[]).map((value) => <option key={value} value={value}>{priorityLabels[value]}</option>)}</select></label>
              </div>
              <label className="block text-xs font-bold">Description<textarea required value={newTicket.description} onChange={(event) => setNewTicket((current) => ({ ...current, description: event.target.value }))} placeholder="What should the support team know?" className="focus-ring mt-2 min-h-[120px] w-full resize-y rounded-xl border border-input bg-background p-3 text-sm leading-6 outline-none transition focus:border-accent" data-testid="input-new-ticket-description" /></label>
              {createTicket.isError && <p className="flex items-center gap-2 text-xs text-destructive" role="alert" data-testid="status-create-ticket-error"><AlertCircle size={14} /> Ticket couldn’t be saved. Please try again.</p>}
              <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
                <button type="button" onClick={() => setCreateOpen(false)} className="focus-ring rounded-xl border border-border px-4 py-3 text-xs font-bold transition hover:bg-muted" data-testid="button-cancel-create-ticket">Cancel</button>
                <button type="submit" disabled={createTicket.isPending} className="focus-ring inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-xs font-extrabold text-primary-foreground transition hover:-translate-y-0.5 disabled:opacity-55" data-testid="button-submit-create-ticket">{createTicket.isPending ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />} {createTicket.isPending ? 'Saving ticket…' : 'Create ticket'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function MetricCard({ label, value, detail, icon: Icon, accent, testId }: { label: string; value: string | number; detail: string; icon: typeof Inbox; accent: string; testId: string }) {
  return (
    <div className="rounded-2xl border border-border/80 bg-card p-4 shadow-xs transition hover:-translate-y-0.5 hover:shadow-md" data-testid={testId}>
      <div className="flex items-start justify-between"><div className={`flex h-9 w-9 items-center justify-center rounded-xl ${accent}`}><Icon size={17} /></div><ArrowRight size={14} className="text-muted-foreground/45" /></div>
      <div className="mt-5 text-2xl font-extrabold tracking-[-0.055em]">{value}</div>
      <div className="mt-1 text-xs font-bold">{label}</div>
      <div className="mt-1 text-[11px] text-muted-foreground">{detail}</div>
    </div>
  );
}

function OverviewSkeleton() {
  return <>{[1, 2, 3, 4].map((item) => <div key={item} className="h-[153px] rounded-2xl border border-border bg-card p-4" data-testid={`skeleton-overview-${item}`}><div className="skeleton h-9 w-9 rounded-xl" /><div className="skeleton mt-5 h-7 w-16 rounded-lg" /><div className="skeleton mt-2 h-3 w-28 rounded" /></div>)}</>;
}

function TicketListSkeleton() {
  return <div className="divide-y divide-border">{[1, 2, 3, 4].map((item) => <div className="flex gap-4 p-5" key={item} data-testid={`skeleton-ticket-${item}`}><div className="skeleton h-10 w-10 shrink-0 rounded-xl" /><div className="flex-1"><div className="skeleton h-4 w-2/3 rounded" /><div className="skeleton mt-3 h-3 w-1/3 rounded" /></div><div className="skeleton h-7 w-20 rounded-full" /></div>)}</div>;
}

function TicketRow({ ticket, onSelect }: { ticket: Ticket; onSelect: () => void }) {
  return (
    <button type="button" onClick={onSelect} className="focus-ring group grid w-full gap-4 px-5 py-5 text-left transition hover:bg-muted/45 sm:grid-cols-[minmax(0,1fr)_150px_112px_100px] sm:items-center sm:px-6" data-testid={`row-ticket-${ticket.id}`}>
      <div className="flex min-w-0 items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground"><span className="font-mono text-[10px]">#{String(ticket.id).padStart(3, '0')}</span></div>
        <div className="min-w-0"><div className="truncate text-sm font-extrabold tracking-[-0.02em] group-hover:text-accent">{ticket.title}</div><div className="mt-1 flex flex-wrap items-center gap-1.5 text-[11px] text-muted-foreground"><span>{ticket.requester}</span><span className="text-border">/</span><span>{ticket.department}</span><span className="text-border">/</span><span>{ticket.category}</span></div></div>
      </div>
      <div className="hidden sm:block"><div className="font-mono text-[10px] uppercase tracking-[0.1em] text-muted-foreground">SLA</div><div className={`mt-1 flex items-center gap-1.5 text-xs font-bold ${ticket.priority === 'urgent' ? 'text-destructive' : ''}`}><span className={`h-1.5 w-1.5 rounded-full ${ticket.priority === 'urgent' ? 'bg-destructive' : ticket.priority === 'high' ? 'bg-accent' : 'bg-chart-3'}`} />{ticket.sla}</div></div>
      <div><StatusBadge status={ticket.status} /><div className="mt-1 text-[11px] text-muted-foreground sm:hidden">{ticket.sla} SLA</div></div>
      <div className="hidden items-center justify-end gap-2 text-xs text-muted-foreground sm:flex"><span>{ticket.assignee ?? 'Unassigned'}</span><ArrowRight size={14} className="transition group-hover:translate-x-1 group-hover:text-accent" /></div>
    </button>
  );
}

function StatusBadge({ status }: { status: StatusValue }) {
  const styles = { open: 'bg-accent/15 text-accent-foreground', in_progress: 'bg-chart-3/15 text-chart-4', resolved: 'bg-secondary/35 text-chart-4' };
  const labels = { open: 'Open', in_progress: 'In progress', resolved: 'Resolved' };
  return <span className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-extrabold ${styles[status]}`} data-testid={`badge-status-${status}`}>{labels[status]}</span>;
}

function TicketPanel({ ticket, updating, updateError, canManage, actor, onClose, onUpdate }: { ticket: Ticket; updating: boolean; updateError: boolean; canManage: boolean; actor: string; onClose: () => void; onUpdate: (id: number, data: { status?: StatusValue; priority?: PriorityValue; assignee?: string | null }) => void }) {
  const queryClient = useQueryClient();
  const [assignee, setAssignee] = useState(ticket.assignee ?? '');
  const [comment, setComment] = useState('');
  const commentsQuery = useListTicketComments(ticket.id);
  const activityQuery = useListTicketActivity(ticket.id);
  const attachmentsQuery = useListTicketAttachments(ticket.id);
  const createComment = useCreateTicketComment();
  const createAttachment = useCreateTicketAttachment();

  const refreshThread = () => {
    void queryClient.invalidateQueries({ queryKey: getListTicketCommentsQueryKey(ticket.id) });
    void queryClient.invalidateQueries({ queryKey: getListTicketActivityQueryKey(ticket.id) });
    void queryClient.invalidateQueries({ queryKey: getListTicketAttachmentsQueryKey(ticket.id) });
  };

  const submitComment = (event: React.FormEvent) => {
    event.preventDefault();
    if (!comment.trim()) return;
    createComment.mutate(
      { id: ticket.id, data: { author: actor, body: comment.trim() } },
      { onSuccess: () => { setComment(''); refreshThread(); } },
    );
  };

  const onFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === 'string' ? reader.result : '';
      const data = result.includes(',') ? result.slice(result.indexOf(',') + 1) : result;
      createAttachment.mutate(
        { id: ticket.id, data: { filename: file.name, contentType: file.type || 'application/octet-stream', data, author: actor } },
        { onSuccess: () => refreshThread() },
      );
    };
    reader.readAsDataURL(file);
    event.target.value = '';
  };

  return (
    <div className="fixed inset-0 z-40 flex justify-end bg-primary/25 backdrop-blur-[2px]" role="dialog" aria-modal="true" aria-labelledby="ticket-panel-title">
      <div className="h-full w-full max-w-[520px] overflow-y-auto border-l border-border bg-card p-6 shadow-2xl sm:p-8">
        <div className="flex items-start justify-between"><div><div className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Ticket #{String(ticket.id).padStart(4, '0')}</div><h2 id="ticket-panel-title" className="mt-3 text-2xl font-extrabold leading-tight tracking-[-0.04em]">{ticket.title}</h2></div><button type="button" onClick={onClose} className="focus-ring rounded-lg p-2 text-muted-foreground hover:bg-muted" data-testid="button-close-ticket-panel"><PanelLeftClose size={18} /></button></div>
        <div className="mt-6 flex flex-wrap gap-2"><StatusBadge status={ticket.status} /><span className={`rounded-full px-2.5 py-1 text-[10px] font-extrabold ${ticket.priority === 'urgent' ? 'bg-destructive/15 text-destructive' : 'bg-muted text-muted-foreground'}`}>{priorityLabels[ticket.priority]}</span><span className="rounded-full bg-muted px-2.5 py-1 text-[10px] font-bold text-muted-foreground">{ticket.category}</span></div>
        <div className="mt-8 rounded-2xl bg-muted/65 p-4"><div className="text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground">Description</div><p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-foreground/80">{ticket.description}</p></div>
        {canManage && (
          <div className="mt-8 space-y-6">
            <div><label className="text-xs font-extrabold">Status<select value={ticket.status} onChange={(event) => onUpdate(ticket.id, { status: event.target.value as StatusValue })} disabled={updating} className="focus-ring mt-2 h-11 w-full rounded-xl border border-input bg-background px-3 text-sm font-semibold outline-none" data-testid={`select-ticket-status-${ticket.id}`}><option value="open">Open</option><option value="in_progress">In progress</option><option value="resolved">Resolved</option></select></label></div>
            <div><label className="text-xs font-extrabold">Priority<select value={ticket.priority} onChange={(event) => onUpdate(ticket.id, { priority: event.target.value as PriorityValue })} disabled={updating} className="focus-ring mt-2 h-11 w-full rounded-xl border border-input bg-background px-3 text-sm font-semibold outline-none" data-testid={`select-ticket-priority-${ticket.id}`}>{(Object.keys(priorityLabels) as PriorityValue[]).map((value) => <option key={value} value={value}>{priorityLabels[value]}</option>)}</select></label></div>
            <div><label className="text-xs font-extrabold">Assignee<input value={assignee} onChange={(event) => setAssignee(event.target.value)} onBlur={() => { const next = assignee.trim() || null; if (next !== ticket.assignee) onUpdate(ticket.id, { assignee: next }); }} placeholder="Assign a support teammate" disabled={updating} className="focus-ring mt-2 h-11 w-full rounded-xl border border-input bg-background px-3 text-sm outline-none transition focus:border-accent" data-testid={`input-ticket-assignee-${ticket.id}`} /></label><div className="mt-2 text-[11px] text-muted-foreground">Changes save as soon as you leave the field.</div></div>
          </div>
        )}
        <div className="mt-8">
          <div className="text-xs font-extrabold">Comments</div>
          <div className="mt-3 space-y-3">
            {(commentsQuery.data ?? []).map((item) => (
              <div key={item.id} className="rounded-xl bg-muted/60 p-3">
                <div className="text-[11px] font-bold">{item.author}</div>
                <p className="mt-1 text-sm leading-5">{item.body}</p>
              </div>
            ))}
          </div>
          <form onSubmit={submitComment} className="mt-3 flex gap-2">
            <input value={comment} onChange={(event) => setComment(event.target.value)} placeholder="Add a comment" className="focus-ring h-11 flex-1 rounded-xl border border-input bg-background px-3 text-sm" data-testid="input-ticket-comment" />
            <button type="submit" disabled={createComment.isPending} className="focus-ring rounded-xl bg-primary px-3 text-primary-foreground" data-testid="button-send-comment"><Send size={15} /></button>
          </form>
        </div>
        <div className="mt-8">
          <div className="flex items-center justify-between text-xs font-extrabold">
            <span>Attachments</span>
            <label className="focus-ring inline-flex cursor-pointer items-center gap-1 rounded-lg bg-muted px-2 py-1 text-[11px]">
              <Paperclip size={12} /> Add file
              <input type="file" className="hidden" accept="image/*,.log,.txt,.json" onChange={onFile} data-testid="input-ticket-attachment" />
            </label>
          </div>
          <div className="mt-3 space-y-2">
            {(attachmentsQuery.data ?? []).map((item) => (
              <div key={item.id} className="flex items-center justify-between rounded-xl border border-border px-3 py-2 text-xs">
                <span className="truncate font-semibold">{item.filename}</span>
                <span className="text-muted-foreground">{Math.max(1, Math.round(item.size / 1024))} KB</span>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-8">
          <div className="text-xs font-extrabold">Activity timeline</div>
          <div className="mt-3 space-y-2">
            {(activityQuery.data ?? []).map((item) => (
              <div key={item.id} className="border-l-2 border-border pl-3 text-[11px] leading-5">
                <div className="font-bold">{item.actor} · {item.action}</div>
                <div className="text-muted-foreground">{item.detail}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-9 flex items-center gap-2 border-t border-border pt-5 text-[11px] text-muted-foreground"><UserRound size={14} /> Requested by {ticket.requester} · {ticket.department}</div>
        {updating && <div className="mt-4 flex items-center gap-2 text-xs text-chart-3" data-testid="status-ticket-updating"><Loader2 size={14} className="animate-spin" /> Saving queue update…</div>}
        {updateError && <div className="mt-4 flex items-center gap-2 text-xs text-destructive" role="alert" data-testid="status-ticket-update-error"><AlertCircle size={14} /> That update didn’t stick. Please try again.</div>}
      </div>
    </div>
  );
}

function Field({ label, value, placeholder, onChange, testId }: { label: string; value: string; placeholder: string; onChange: (value: string) => void; testId: string }) {
  return <label className="block text-xs font-bold">{label}<input required value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} className="focus-ring mt-2 h-11 w-full rounded-xl border border-input bg-background px-3 text-sm outline-none transition focus:border-accent" data-testid={testId} /></label>;
}

function RoutedErrorBoundary({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  return <ErrorBoundary resetKey={location}>{children}</ErrorBoundary>;
}

function Router() {
  const { user } = useAuth();
  const [location, setLocation] = useLocation();

  useEffect(() => {
    if (!user && location !== '/login') {
      setLocation('/login');
      return;
    }
    if (user && location === '/login') {
      setLocation(user.role === 'support' ? '/dashboard' : '/');
      return;
    }
    if (user?.role === 'employee' && (location === '/tickets' || location === '/dashboard')) {
      setLocation('/');
    }
    if (user?.role === 'support' && location === '/') {
      setLocation('/dashboard');
    }
  }, [user, location, setLocation]);

  if (!user) {
    return (
      <Switch>
        <Route path="/login" component={Login} />
        <Route component={Login} />
      </Switch>
    );
  }

  return (
    <RoutedErrorBoundary>
      <AppShell>
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/tickets" component={Tickets} />
          <Route path="/my-tickets" component={Tickets} />
          <Route path="/knowledge" component={Knowledge} />
          <Route path="/dashboard" component={Dashboard} />
          <Route path="/login" component={Login} />
          <Route component={NotFound} />
        </Switch>
      </AppShell>
    </RoutedErrorBoundary>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <TooltipProvider>
            <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
              <Router />
            </WouterRouter>
            <Toaster />
          </TooltipProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;