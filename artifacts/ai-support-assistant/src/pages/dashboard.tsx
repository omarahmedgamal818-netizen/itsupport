import { AlertCircle, Clock3, Inbox, Loader2, RefreshCw, TicketCheck, Timer } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useGetSupportOverview } from '@workspace/api-client-react';

function Metric({ label, value, detail }: { label: string; value: string | number; detail: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-xs">
      <div className="text-2xl font-extrabold tracking-[-0.05em]">{value}</div>
      <div className="mt-1 text-xs font-bold">{label}</div>
      <div className="mt-1 text-[11px] text-muted-foreground">{detail}</div>
    </div>
  );
}

export default function Dashboard() {
  const overview = useGetSupportOverview();

  if (overview.isLoading) {
    return <div className="flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="animate-spin" size={16} /> Loading dashboard…</div>;
  }

  if (overview.isError || !overview.data) {
    return (
      <div className="flex items-center justify-between rounded-2xl border border-accent/30 bg-accent/10 p-5 text-sm">
        <span className="flex items-center gap-2"><AlertCircle size={17} className="text-accent" /> Dashboard unavailable.</span>
        <button type="button" onClick={() => void overview.refetch()} className="focus-ring inline-flex items-center gap-2 rounded-lg bg-card px-3 py-2 text-xs font-bold"><RefreshCw size={13} /> Retry</button>
      </div>
    );
  }

  const data = overview.data;

  return (
    <div className="mx-auto max-w-[1280px]">
      <div className="mb-8">
        <div className="mb-3 flex items-center gap-2 font-mono text-[10px] font-medium uppercase tracking-[0.22em] text-muted-foreground">
          <span className="h-1.5 w-1.5 rounded-full bg-accent" />
          Support dashboard
        </div>
        <h1 className="text-3xl font-extrabold tracking-[-0.05em] sm:text-4xl">See SLA, categories, and movement.</h1>
        <p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground">A richer view of the queue: what is at risk, where work clusters, and how the week is trending.</p>
      </div>
      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <Metric label="Open" value={data.openTickets} detail="Waiting on a first move" />
        <Metric label="In progress" value={data.inProgressTickets} detail="Actively worked" />
        <Metric label="Resolved" value={data.resolvedToday} detail="Closed in this queue" />
        <Metric label="SLA at risk" value={data.slaAtRisk} detail="High and urgent items" />
        <Metric label="Avg. response" value={data.avgResponse} detail="First response" />
      </section>
      <section className="mt-7 grid gap-4 lg:grid-cols-2">
        <div className="rounded-[24px] border border-border bg-card p-5">
          <div className="flex items-center gap-2 text-sm font-extrabold"><Inbox size={16} className="text-accent" /> Tickets by category</div>
          <div className="mt-5 h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.categories}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="count" fill="hsl(var(--accent))" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="rounded-[24px] border border-border bg-card p-5">
          <div className="flex items-center gap-2 text-sm font-extrabold"><Clock3 size={16} className="text-chart-3" /> Opened vs resolved</div>
          <div className="mt-5 h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.trend}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="opened" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
                <Bar dataKey="resolved" fill="hsl(var(--secondary))" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>
      <section className="mt-4 rounded-[24px] border border-border bg-card p-5">
        <div className="flex items-center gap-2 text-sm font-extrabold"><Timer size={16} /> Priority mix</div>
        <div className="mt-4 flex flex-wrap gap-2">
          {data.priorities.map((item) => (
            <span key={item.name} className="rounded-full bg-muted px-3 py-1.5 text-xs font-bold">
              {item.name}: {item.count}
            </span>
          ))}
        </div>
        <div className="mt-6 space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground"><TicketCheck size={14} /> Recent tickets</div>
          {data.recentTickets.map((ticket) => (
            <div key={ticket.id} className="flex items-center justify-between rounded-xl bg-muted/50 px-3 py-2 text-sm">
              <span className="font-semibold">{ticket.title}</span>
              <span className="font-mono text-[11px] text-muted-foreground">{ticket.sla}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
