import { CompanyShell } from '@/layouts/section-shells';
import { money, date } from '@/lib/format';
import { useAuth } from '@/auth/auth-context';
import { useQueryClient } from '@tanstack/react-query';
import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'wouter';
import { ArrowRight, Check, ClipboardList, FileText, Loader2, Plus, Send, Sparkles, Users, X } from 'lucide-react';
import { getGetCompanyMetricsQueryKey, getListCompanyLeadsQueryKey, getVendorProjectTrackingQueryKey, getVendorMaintenanceRequestsQueryKey, useCreateCompanyProfile, useListCompanyLeads, useUpdateCompanyLead, useGetCompanyMetrics, useVendorProjectTracking, useUpdateOrderTracking, useVendorMaintenanceRequests, useUpdateMaintenanceRequest, LeadStatus, type Lead, type CustomerProjectTracking } from '@workspace/api-client-react';
import { SelectItem as DropdownItem } from '@/components/ui/select';
import { Button, Field, EnrgSelect } from '@/components/form-controls';
import { PageHeader } from '@/components/PageHeader';
import { QueryState, StatusPill } from '@/components/feedback';


export function CompanyProfileSetup() {
  const { user } = useAuth();
  const mutation = useCreateCompanyProfile();
  const [form, setForm] = useState({
    installExperienceYears: '',
    serviceLocations: '',
    products: '',
    brands: '',
    pricingPackages: '',
  });
  const profileStorageKey = `enrg_company_profile_${user?.id || 'current'}`;
  useEffect(() => {
    try {
      const stored = localStorage.getItem(profileStorageKey);
      if (stored) setForm(JSON.parse(stored));
    } catch {}
  }, [profileStorageKey]);
  const update = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const nextValue = key === 'installExperienceYears' ? e.target.value.replace(/^-+/, '').replace(/\D/g, '') : e.target.value;
    setForm({ ...form, [key]: nextValue });
  };
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate(
      {
        data: {
          installExperienceYears: Number(form.installExperienceYears) || undefined,
          serviceLocations: JSON.stringify(
            form.serviceLocations
              .split(',')
              .map((v) => v.trim())
              .filter(Boolean),
          ),
          products: JSON.stringify(
            form.products
              .split(',')
              .map((v) => v.trim())
              .filter(Boolean),
          ),
          brands: JSON.stringify(
            form.brands
              .split(',')
              .map((v) => v.trim())
              .filter(Boolean),
          ),
          pricingPackages: form.pricingPackages,
        },
      },
      {
        onSuccess: () => {
          localStorage.setItem(profileStorageKey, JSON.stringify(form));
          window.location.href = '/company/profile';
        },
      },
    );
  };
  return (
    <CompanyShell>
      <PageHeader eyebrow="Company profile" title="Make your work easy to trust." description="Give homeowners the useful context behind your company." />
      <form onSubmit={submit} className="max-w-3xl rounded-3xl border border-border bg-card p-6 shadow-[var(--shadow-card)] sm:p-8">
        <div className="grid gap-5 sm:grid-cols-2">
          <Field type="number" min={0} inputMode="numeric" step="1" label="Installation experience (years)" placeholder="8" value={form.installExperienceYears} onChange={update('installExperienceYears')} data-testid="input-profile-experience" />
          <Field label="Service locations" placeholder="Pune, Mumbai, Nashik" value={form.serviceLocations} onChange={update('serviceLocations')} data-testid="input-profile-locations" />
          <Field label="Products you work with" placeholder="Rooftop solar, batteries" value={form.products} onChange={update('products')} data-testid="input-profile-products" />
          <Field label="Brands you install" placeholder="Waaree, Tata Power" value={form.brands} onChange={update('brands')} data-testid="input-profile-brands" />
        </div>
        <label className="mt-5 grid gap-1.5 text-sm font-medium">
          Pricing packages
          <textarea rows={4} placeholder="Describe what a typical package includes…" value={form.pricingPackages} onChange={update('pricingPackages')} data-testid="textarea-profile-packages" className="rounded-xl border border-input bg-card p-3 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-primary/25" />
        </label>
        {mutation.error && (
          <p data-testid="status-profile-error" className="mt-4 text-sm text-destructive">
            We couldn't save your profile.
          </p>
        )}
        <Button type="submit" data-testid="button-save-profile" disabled={mutation.isPending} className="mt-6">
          {mutation.isPending ? <Loader2 className="animate-spin" size={16} /> : <Check size={16} />} Save company profile
        </Button>
      </form>
    </CompanyShell>
  );
}

export function CompanyProfile() {
  const { user } = useAuth();
  const profileStorageKey = `enrg_company_profile_${user?.id || 'current'}`;
  const [profile, setProfile] = useState<Record<string, string> | null>(null);
  const [, setLocation] = useLocation();

  useEffect(() => {
    try {
      const stored = localStorage.getItem(profileStorageKey);
      if (stored) setProfile(JSON.parse(stored));
    } catch {}
  }, [profileStorageKey]);

  if (!profile) {
    return (
      <CompanyShell>
        <PageHeader eyebrow="Company profile" title="Finish your company profile." description="Add the details homeowners need before choosing your business." />
        <Button onClick={() => setLocation('/company/profile/setup')}>
          <Plus size={16} /> Complete profile
        </Button>
      </CompanyShell>
    );
  }

  return (
    <CompanyShell>
      <PageHeader eyebrow="Company profile" title="Your company profile is ready." description="This is the information homeowners will use to understand your business." />
      <div className="max-w-3xl rounded-3xl border border-border bg-card p-6 shadow-[var(--shadow-card)] sm:p-8">
        <div className="grid gap-6 sm:grid-cols-2">
          <ProfileDetail label="Installation experience" value={`${profile.installExperienceYears || '0'} years`} />
          <ProfileDetail label="Service locations" value={profile.serviceLocations} />
          <ProfileDetail label="Products" value={profile.products} />
          <ProfileDetail label="Brands" value={profile.brands} />
        </div>
        <div className="mt-6 border-t border-border pt-6">
          <p className="text-sm font-semibold">Pricing packages</p>
          <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-muted-foreground">{profile.pricingPackages || 'Not provided'}</p>
        </div>
      </div>
    </CompanyShell>
  );
}

export function ProfileDetail({ label, value }: { label: string; value?: string }) {
  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{label}</p>
      <p className="mt-2 text-base font-semibold">{value || 'Not provided'}</p>
    </div>
  );
}

export function CompanyDocs() {
  const docs = [
    {
      title: 'Company profile',
      summary: 'Keep your business story, service areas, and installation experience easy to trust.',
      action: 'Review profile',
      href: '/company/profile',
    },
    {
      title: 'Lead response guide',
      summary: 'Use a clear, consistent process for contact, site visits, and quoting customers.',
      action: 'Open leads',
      href: '/company/leads',
    },
    {
      title: 'Brand and compliance',
      summary: 'Track business verification, service coverage, and the materials or brands you install.',
      action: 'Check overview',
      href: '/company/dashboard',
    },
  ];
  return (
    <CompanyShell>
      <PageHeader eyebrow="Company docs" title="Everything your team needs to stay aligned." description="A working set of company documents and reference points for your sales and service flow." />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {docs.map((doc) => (
          <div key={doc.title} className="rounded-3xl border border-border bg-card p-6 shadow-[var(--shadow-card)]">
            <div className="flex items-center justify-between">
              <span className="grid size-11 place-items-center rounded-2xl bg-secondary text-accent">
                <FileText size={18} />
              </span>
              <span className="rounded-full bg-[#dfece0] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[#1f584d]">Ready</span>
            </div>
            <h2 className="mt-5 font-display text-2xl font-bold">{doc.title}</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">{doc.summary}</p>
            <Link href={doc.href} data-testid={`link-company-doc-${doc.title.toLowerCase().replaceAll(/[^a-z0-9]+/g, '-')}`} className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-accent">
              {doc.action} <ArrowRight size={15} />
            </Link>
          </div>
        ))}
      </div>
    </CompanyShell>
  );
}

export function CompanyAssistant() {
  const [message, setMessage] = useState('');
  const [reply, setReply] = useState('Ask me about leads, quotes, or your next company move.');
  const suggestions = ['What should I do next?', 'Summarize my lead desk', 'Help me win more projects'];
  const respond = (prompt: string) => {
    setMessage(prompt);
    setReply(prompt.includes('lead') ? 'Start with the newest lead and send a useful first response today.' : prompt.includes('win') ? 'Keep response times short, show clear packages, and follow up after every site visit.' : 'Your next best move is to review the newest lead and keep its status up to date.');
  };
  return (
    <div className="company-assistant">
      <div className="company-assistant-glow" />
      <div className="relative">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-[.18em] text-[#b8f2d0]">ENRG assistant</p>
            <h2 className="mt-2 font-display text-2xl font-bold text-white">A second mind for your next move.</h2>
          </div>
          <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-white/10 text-[#b8f2d0]">
            <Sparkles size={19} />
          </span>
        </div>
        <p className="mt-3 text-sm leading-6 text-white/65">{reply}</p>
        <div className="mt-5 flex flex-wrap gap-2">
          {suggestions.map((prompt) => (
            <button key={prompt} type="button" onClick={() => respond(prompt)} className="rounded-full border border-white/15 px-3 py-2 text-left text-xs font-semibold text-white/80 hover:border-[#b8f2d0]/70 hover:text-[#b8f2d0]">
              {prompt}
            </button>
          ))}
        </div>
        <form
          className="mt-4 flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            if (message.trim()) respond(message.trim());
          }}
        >
          <input aria-label="Ask ENRG assistant" value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Ask your assistant..." className="min-w-0 flex-1 rounded-xl border border-white/15 bg-white/10 px-3 py-2.5 text-sm text-white outline-none placeholder:text-white/45 focus:border-[#b8f2d0]" />
          <button type="submit" aria-label="Send message" className="grid size-11 shrink-0 place-items-center rounded-xl bg-[#b8f2d0] text-[#123b2b] hover:bg-white">
            <Send size={16} />
          </button>
        </form>
      </div>
    </div>
  );
}

export function CompanyDashboardLegacy() {
  const query = useGetCompanyMetrics({
    query: { queryKey: getGetCompanyMetricsQueryKey() },
  });
  const m = query.data;
  const metrics = [
    { label: 'Total leads', value: m?.totalLeads ?? 0, icon: Users },
    {
      label: 'Ongoing projects',
      value: m?.activeLeads ?? 0,
      icon: ClipboardList,
    },
    { label: 'Quotes submitted', value: m?.quotesSubmitted ?? 0, icon: Send },
    { label: 'Won projects', value: m?.wonProjects ?? 0, icon: Check },
  ];
  return (
    <CompanyShell>
      <PageHeader
        eyebrow="Company overview"
        title="A good day to grow."
        description="Your business, in the moments that matter."
        action={
          <Link href="/company/leads" data-testid="link-dashboard-leads" className="inline-flex items-center gap-2 rounded-full bg-accent px-4 py-2.5 text-sm font-bold text-accent-foreground">
            View leads <ArrowRight size={16} />
          </Link>
        }
      />
      <QueryState loading={query.isLoading} error={query.error} onRetry={() => query.refetch()}>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {metrics.map((metric) => (
            <div key={metric.label} className="rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-card)]">
              <div className="flex items-center justify-between">
                <span className="grid size-9 place-items-center rounded-xl bg-secondary text-accent">
                  <metric.icon size={18} />
                </span>
                <span className="text-xs font-bold text-accent">LIVE</span>
              </div>
              <p data-testid={`text-metric-${metric.label.toLowerCase().replaceAll(' ', '-')}`} className="mt-6 font-display text-4xl font-bold">
                {metric.value}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">{metric.label}</p>
            </div>
          ))}
        </div>
        <div className="mt-6 grid gap-6 lg:grid-cols-[1.2fr_.8fr]">
          <div className="rounded-3xl bg-accent p-7 text-accent-foreground">
            <p className="text-xs font-bold uppercase tracking-widest text-primary">Pipeline value</p>
            <p data-testid="text-pipeline-value" className="mt-2 font-display text-5xl font-bold">
              {money(m?.pipelineValue)}
            </p>
            <p className="mt-3 max-w-sm text-sm leading-6 text-accent-foreground/70">Every clear conversation is a project that can move forward.</p>
          </div>
          <div className="rounded-3xl border border-border bg-card p-7">
            <p className="text-xs font-bold uppercase tracking-widest text-accent">Profile strength</p>
            <div className="mt-5 h-3 overflow-hidden rounded-full bg-secondary">
              <div className="h-full w-[72%] rounded-full bg-primary" />
            </div>
            <p className="mt-3 text-sm text-muted-foreground">Complete your company profile to help homeowners choose with confidence.</p>
            <Link href="/company/profile" data-testid="link-dashboard-profile" className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-accent">
              Finish profile <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </QueryState>
    </CompanyShell>
  );
}

export function CompanyDashboard() {
  const { user } = useAuth();
  const query = useGetCompanyMetrics({
    query: { queryKey: getGetCompanyMetricsQueryKey() },
  });
  const m = query.data;
  const projectsQuery = useVendorProjectTracking();
  const trackingUpdate = useUpdateOrderTracking();
  const queryClient = useQueryClient();
  const metrics = [
    { label: 'Total leads', value: m?.totalLeads ?? 0, icon: Users },
    {
      label: 'Ongoing projects',
      value: m?.activeLeads ?? 0,
      icon: ClipboardList,
    },
    { label: 'Quotes submitted', value: m?.quotesSubmitted ?? 0, icon: Send },
    { label: 'Won projects', value: m?.wonProjects ?? 0, icon: Check },
  ];
  return (
    <CompanyShell>
      <PageHeader
        eyebrow="Company overview"
        title="A good day to grow."
        description="Your business, in the moments that matter."
        action={
          <Link href="/company/leads" data-testid="link-dashboard-leads" className="inline-flex items-center gap-2 rounded-full bg-accent px-4 py-2.5 text-sm font-bold text-accent-foreground">
            View leads <ArrowRight size={16} />
          </Link>
        }
      />
      <QueryState loading={query.isLoading} error={query.error} onRetry={() => query.refetch()}>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {metrics.map((metric) => (
            <div key={metric.label} className="rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-card)]">
              <div className="flex items-center justify-between">
                <span className="grid size-9 place-items-center rounded-xl bg-secondary text-accent">
                  <metric.icon size={18} />
                </span>
                <span className="text-xs font-bold text-accent">LIVE</span>
              </div>
              <p className="mt-6 font-display text-4xl font-bold">{metric.value}</p>
              <p className="mt-1 text-sm text-muted-foreground">{metric.label}</p>
            </div>
          ))}
        </div>
        {user?.role === 'install-co' && <>
        <section className="mt-8 rounded-3xl border border-border bg-card p-5 shadow-[var(--shadow-card)] sm:p-7">
          <div className="mb-4"><p className="text-xs font-bold uppercase tracking-widest text-accent">Order delivery</p><h2 className="mt-1 font-display text-2xl font-bold">Assigned installation projects</h2><p className="mt-1 text-sm text-muted-foreground">Advance one authorized milestone at a time.</p></div>
          <QueryState loading={projectsQuery.isLoading} error={projectsQuery.error} onRetry={() => projectsQuery.refetch()} empty={!projectsQuery.isLoading && !projectsQuery.error && !(projectsQuery.data?.items || []).length} emptyText="Accepted projects will appear here.">
            <div className="grid gap-3">{(projectsQuery.data?.items || []).map((project) => <InstallerProjectCard key={project.projectId} project={project} busy={trackingUpdate.isPending} onAdvance={(status) => trackingUpdate.mutate({ projectId: project.projectId, status }, { onSuccess: () => queryClient.invalidateQueries({ queryKey: getVendorProjectTrackingQueryKey() }) })} />)}</div>
          </QueryState>
          {trackingUpdate.error && <p role="alert" className="mt-3 text-sm text-[#8d3f34]">The project could not be updated. Reload and try again.</p>}
        </section>
        <MaintenanceRequests />
        </>}
        <div className="mt-6 grid gap-6 lg:grid-cols-[1.2fr_.8fr]">
          <div className="rounded-3xl bg-accent p-7 text-accent-foreground">
            <p className="text-xs font-bold uppercase tracking-widest text-primary">Pipeline value</p>
            <p className="mt-2 font-display text-5xl font-bold">{money(m?.pipelineValue)}</p>
            <p className="mt-3 max-w-sm text-sm leading-6 text-accent-foreground/70">Every clear conversation is a project that can move forward.</p>
          </div>
          <CompanyAssistant />
        </div>
      </QueryState>
    </CompanyShell>
  );
}

function MaintenanceRequests() {
  const queryClient = useQueryClient();
  const query = useVendorMaintenanceRequests();
  const mutation = useUpdateMaintenanceRequest();
  const items = query.data?.items || [];
  return <section className="mt-6 rounded-3xl border border-border bg-card p-5 shadow-[var(--shadow-card)] sm:p-7">
    <div className="mb-4"><p className="text-xs font-bold uppercase tracking-widest text-accent">Aftercare</p><h2 className="mt-1 font-display text-2xl font-bold">Maintenance requests</h2></div>
    <QueryState loading={query.isLoading} error={query.error} onRetry={() => query.refetch()} empty={!query.isLoading && !query.error && !items.length} emptyText="Customer maintenance requests will appear here.">
      <div className="grid gap-3">{items.map((item) => <article key={item.id} className="flex flex-col gap-3 rounded-2xl border border-border bg-background p-4 sm:flex-row sm:items-center sm:justify-between"><div><p className="font-semibold">{item.customerName} · {item.location || 'Project'}</p><p className="mt-1 text-sm text-muted-foreground">{item.message || 'Cleaning or maintenance requested'} · {date(item.createdAt)}</p><p className="mt-1 text-xs font-semibold capitalize text-accent">{item.status.replaceAll('-', ' ')}</p></div>{item.status !== 'resolved' && <Button type="button" disabled={mutation.isPending} variant={item.status === 'open' ? 'quiet' : 'primary'} onClick={() => mutation.mutate({ requestId: item.id, status: item.status === 'open' ? 'in-progress' : 'resolved' }, { onSuccess: () => queryClient.invalidateQueries({ queryKey: getVendorMaintenanceRequestsQueryKey() }) })}>{item.status === 'open' ? 'Start request' : 'Mark resolved'}</Button>}</article>)}</div>
    </QueryState>
    {mutation.error && <p role="alert" className="mt-3 text-sm text-[#8d3f34]">We couldn’t update that request. Please reload and try again.</p>}
  </section>;
}

const installationStages = [
  'order-placed', 'order-confirmed', 'installer-assigned', 'site-survey',
  'installation-scheduled', 'installation-in-progress', 'installation-completed',
] as const;
const installationLabels: Record<string, string> = {
  'site-survey': 'Site Survey', 'installation-scheduled': 'Installation Scheduled',
  'installation-in-progress': 'Installation In Progress', 'installation-completed': 'Installation Completed',
};
function InstallerProjectCard({ project, busy, onAdvance }: { project: CustomerProjectTracking; busy: boolean; onAdvance: (status: string) => void }) {
  const next = installationStages[installationStages.indexOf((project.orderStage || 'order-placed') as typeof installationStages[number]) + 1];
  return <article className="flex flex-col gap-3 rounded-2xl border border-border bg-background p-4 sm:flex-row sm:items-center sm:justify-between">
    <div><p className="font-semibold">{project.location || 'Solar project'}</p><p className="mt-1 text-sm text-muted-foreground">{project.orderStageLabel} · {project.orderProgressPercent || 0}% complete</p><p className="mt-1 text-xs text-muted-foreground">Ref {project.projectId}</p></div>
    {next ? <Button type="button" disabled={busy} onClick={() => onAdvance(next)} className="min-h-10 self-start sm:self-auto">{busy ? 'Saving…' : `Mark ${installationLabels[next]} complete`} <ArrowRight size={15} /></Button> : <span className="rounded-full bg-[#dfece0] px-3 py-2 text-xs font-bold text-accent">Installation complete</span>}
  </article>;
}

export function CompanyLeads() {
  const queryClient = useQueryClient();
  const query = useListCompanyLeads(
    { page: 1, limit: 50 },
    {
      query: { queryKey: getListCompanyLeadsQueryKey({ page: 1, limit: 50 }) },
    },
  );
  const mutation = useUpdateCompanyLead();
  const [active, setActive] = useState<Lead | null>(null);
  const [price, setPrice] = useState('');
  const [warranty, setWarranty] = useState('');
  const leads = query.data?.items || [];
  const updateStatus = (lead: Lead, status: LeadStatus) =>
    mutation.mutate(
      { data: { leadId: lead.id, status } },
      {
        onSuccess: () =>
          queryClient.invalidateQueries({
            queryKey: getListCompanyLeadsQueryKey({ page: 1, limit: 50 }),
          }),
      },
    );
  const submitQuote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!active) return;
    mutation.mutate(
      {
        data: {
          leadId: active.id,
          status: 'quote-submitted',
          quote: {
            estimatedPrice: Number(price),
            warrantyYears: Number(warranty) || undefined,
          },
        },
      },
      {
        onSuccess: () => {
          setActive(null);
          queryClient.invalidateQueries({
            queryKey: getListCompanyLeadsQueryKey({ page: 1, limit: 50 }),
          });
        },
      },
    );
  };
  return (
    <CompanyShell>
      <PageHeader eyebrow="Lead desk" title="People are looking for you." description="Respond thoughtfully. Momentum starts with the first useful reply." />
      <QueryState loading={query.isLoading} error={query.error} onRetry={() => query.refetch()} empty={!query.isLoading && !query.error && leads.length === 0} emptyText="Your lead desk is quiet for now.">
        <div className="overflow-hidden rounded-3xl border border-border bg-card shadow-[var(--shadow-card)]">
          <div className="hidden grid-cols-[1.3fr_1fr_.7fr_.7fr_1fr] gap-4 border-b border-border bg-secondary/60 px-5 py-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground md:grid">
            <span>Customer</span>
            <span>Need</span>
            <span>Bill</span>
            <span>Status</span>
            <span />
          </div>
          {leads.map((lead) => (
            <div key={lead.id} data-testid={`row-lead-${lead.id}`} className="grid gap-3 border-b border-border p-5 last:border-0 md:grid-cols-[1.3fr_1fr_.7fr_.7fr_1fr] md:items-center md:gap-4 md:py-4">
              <div>
                <p data-testid={`text-lead-customer-${lead.id}`} className="font-semibold">
                  {lead.customerName}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {lead.location} · {date(lead.createdAt)}
                </p>
              </div>
              <p className="text-sm text-muted-foreground">{lead.systemSize || 'Size to assess'}</p>
              <p className="text-sm font-semibold">{money(lead.monthlyBill)}</p>
              <StatusPill status={lead.status} />
              <div className="flex flex-wrap gap-2">
                <EnrgSelect aria-label={`Update status for ${lead.customerName}`} data-testid={`select-lead-status-${lead.id}`} value={lead.status} onValueChange={(value) => updateStatus(lead, value as LeadStatus)} className="w-auto text-xs font-semibold">
                  <DropdownItem value="new">New</DropdownItem>
                  <DropdownItem value="accepted">Accepted</DropdownItem>
                  <DropdownItem value="contacted">Contacted</DropdownItem>
                  <DropdownItem value="site-visit">Site visit</DropdownItem>
                  <DropdownItem value="won">Won</DropdownItem>
                  <DropdownItem value="lost">Lost</DropdownItem>
                </EnrgSelect>
                <Button
                  data-testid={`button-lead-quote-${lead.id}`}
                  variant="quiet"
                  className="px-3 py-2 text-xs"
                  onClick={() => {
                    setActive(lead);
                    setPrice(lead.quote?.estimatedPrice?.toString() || '');
                    setWarranty(lead.quote?.warrantyYears?.toString() || '');
                  }}
                >
                  <Plus size={14} /> Quote
                </Button>
              </div>
            </div>
          ))}
        </div>
      </QueryState>
      {active && (
        <div className="mobile-modal-backdrop fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-[#183d34]/35 backdrop-blur-sm">
          <form onSubmit={submitQuote} className="mobile-modal-panel w-full max-w-md rounded-3xl border border-border bg-card p-6 shadow-2xl">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-accent">Submit quote</p>
                <h2 className="mt-1 font-display text-2xl font-bold">{active.customerName}</h2>
              </div>
              <button type="button" data-testid="button-close-quote-modal" onClick={() => setActive(null)} className="rounded-full p-2 hover:bg-secondary">
                <X size={18} />
              </button>
            </div>
            <div className="mt-6 grid gap-4">
              <Field required type="number" label="Estimated price" placeholder="145000" value={price} onChange={(e) => setPrice(e.target.value)} data-testid="input-lead-price" />
              <Field type="number" label="Warranty (years)" placeholder="10" value={warranty} onChange={(e) => setWarranty(e.target.value)} data-testid="input-lead-warranty" />
            </div>
            <Button type="submit" data-testid="button-submit-lead-quote" disabled={mutation.isPending} className="mt-6 w-full">
              Submit quote
            </Button>
          </form>
        </div>
      )}
    </CompanyShell>
  );
}
