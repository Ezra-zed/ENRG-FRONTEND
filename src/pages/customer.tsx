import { AuthLayout } from '@/layouts/section-shells';
import { date } from '@/lib/format';
import { useAuth } from '@/auth/auth-context';
import React, { useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Link, useLocation } from 'wouter';
import { ArrowRight, CalendarDays, Check, CircleDollarSign, Clock3, Loader2, RefreshCw, Send, ShieldCheck, Upload, UserRound, Users } from 'lucide-react';
import { getListCustomersQueryKey, getListProjectQuotesQueryKey, useRegisterCustomer, useRequestProjectQuote, useListProjectQuotes, useMyProjectTracking, useRequestMaintenance, useMaintenanceReminder, PropertyType, type CustomerProjectTracking } from '@workspace/api-client-react';
import { SelectItem as DropdownItem } from '@/components/ui/select';
import { Button, Field, SelectField } from '@/components/form-controls';
import { QueryState, StatusPill } from '@/components/feedback';
import { PageHeader } from '@/components/PageHeader';
import { PaymentCheckout } from '@/components/payments/PaymentCheckout';
import { LocationCombobox } from '@/components/LocationCombobox';

function ProjectQuotesAndPayment({ project }: { project: CustomerProjectTracking }) {
  const quotes = useListProjectQuotes(project.projectId);
  if (quotes.isLoading) return <div className="mt-5 rounded-2xl border border-border bg-background/70 p-4 text-sm text-muted-foreground">Checking quote and payment options…</div>;
  if (quotes.error) return <div className="mt-5 flex flex-col gap-3 rounded-2xl border border-border bg-background/70 p-4 sm:flex-row sm:items-center sm:justify-between"><p className="text-sm text-muted-foreground">We couldn’t load the latest quote details.</p><button type="button" onClick={() => void quotes.refetch()} className="inline-flex min-h-10 items-center justify-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-xs font-bold"><RefreshCw size={13} className={quotes.isFetching ? 'animate-spin' : ''} />Try again</button></div>;
  const accepted = (quotes.data || []).filter((quote) => quote.status === 'accepted');
  if (accepted.length === 0) return null;
  return <div className="mt-6 border-t border-border pt-5"><h4 className="flex items-center gap-2 text-sm font-bold"><CircleDollarSign size={16} className="text-accent" />Accepted quote{accepted.length === 1 ? '' : 's'}</h4>{accepted.map((quote) => <PaymentCheckout key={quote.id} projectId={project.projectId} quote={quote} />)}</div>;
}

const ORDER_STAGES = [
  ['order-placed', 'Order Placed'], ['order-confirmed', 'Order Confirmed'], ['installer-assigned', 'Installer Assigned'],
  ['site-survey', 'Site Survey'], ['installation-scheduled', 'Installation Scheduled'],
  ['installation-in-progress', 'Installation In Progress'], ['installation-completed', 'Installation Completed'],
] as const;

function OrderProgressTracker({ project }: { project: CustomerProjectTracking }) {
  const maintenance = useRequestMaintenance();
  const reminder = useMaintenanceReminder(project.projectId, project.orderStage === 'installation-completed');
  const [requested, setRequested] = useState(false);
  const stageIndex = Math.max(0, ORDER_STAGES.findIndex(([status]) => status === project.orderStage));
  const events = project.orderHistory || [];
  return <section className="mt-6 rounded-2xl border border-border bg-background/70 p-4 sm:p-5" aria-label="Solar order progress">
    <div className="flex flex-wrap items-end justify-between gap-2"><div><p className="text-xs font-bold uppercase tracking-widest text-accent">Order journey</p><h4 className="mt-1 font-display text-lg font-bold">{project.orderStageLabel || 'Order Placed'}</h4></div><span className="text-sm font-bold text-accent">{project.orderProgressPercent || 0}%</span></div>
    <div className="mt-5 hidden grid-cols-7 gap-1 sm:grid">
      {ORDER_STAGES.map(([status, label], index) => <div key={status} className="relative min-w-0 text-center">
        {index < ORDER_STAGES.length - 1 && <span className={`absolute left-1/2 right-[-50%] top-[10px] h-0.5 ${index < stageIndex ? 'bg-primary' : 'bg-border'}`} />}
        <span className={`relative mx-auto grid size-5 place-items-center rounded-full border-2 ${index < stageIndex ? 'border-primary bg-primary text-white' : index === stageIndex ? 'border-primary bg-card ring-4 ring-primary/10' : 'border-border bg-card'}`}>{index < stageIndex && <Check size={12} />}</span>
        <span className={`mx-auto mt-2 block max-w-[7rem] text-[10px] leading-4 ${index <= stageIndex ? 'font-bold text-foreground' : 'text-muted-foreground'}`}>{label}</span>
      </div>)}
    </div>
    <ol className="mt-4 grid gap-2 sm:hidden">
      {ORDER_STAGES.map(([status, label], index) => <li key={status} className={`flex items-center gap-3 rounded-xl px-3 py-2 text-sm ${index === stageIndex ? 'bg-[#dfece0] font-bold text-accent' : index < stageIndex ? 'text-foreground' : 'text-muted-foreground'}`}><span className={`grid size-5 shrink-0 place-items-center rounded-full ${index < stageIndex ? 'bg-primary text-white' : index === stageIndex ? 'border-2 border-primary' : 'border border-border'}`}>{index < stageIndex && <Check size={12} />}</span>{label}</li>)}
    </ol>
    {events.length > 0 && <div className="mt-4 border-t border-border pt-3"><p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Latest update</p><p className="mt-1 text-sm">{events.at(-1)?.message || project.orderStageLabel}</p></div>}
    {project.orderStage === 'installation-completed' && <div className="mt-4 border-t border-border pt-4"><p className="text-sm text-muted-foreground">Installation completed {project.installationCompletedAt ? date(project.installationCompletedAt) : ''}. Need cleaning or a system check?</p>{reminder.data?.reminder && <p className="mt-2 text-xs text-muted-foreground">Maintenance reminder {reminder.data.reminder.status === 'sent' ? `sent ${reminder.data.reminder.sentAt ? date(reminder.data.reminder.sentAt) : ''}` : `scheduled for ${reminder.data.reminder.scheduledAt ? date(reminder.data.reminder.scheduledAt) : 'later'}`}.</p>}<button type="button" disabled={maintenance.isPending || requested} onClick={() => maintenance.mutate({ projectId: project.projectId }, { onSuccess: () => setRequested(true) })} className="mt-3 inline-flex min-h-10 items-center justify-center gap-2 rounded-full bg-accent px-4 py-2 text-sm font-bold text-accent-foreground disabled:opacity-60">{requested ? 'Maintenance requested' : maintenance.isPending ? 'Sending request…' : 'Request Maintenance'} <ArrowRight size={15} /></button>{maintenance.error && <p role="alert" className="mt-2 text-sm text-[#8d3f34]">We couldn’t send your request. Please try again.</p>}</div>}
  </section>;
}


export function QuotePage() {
  const [location] = useLocation();
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const selectedCompany = new URLSearchParams(location.split('?')[1] || '');
  const companyId = selectedCompany.get('companyId') || '';
  const mutation = useRequestProjectQuote();
  const [done, setDone] = useState<{ id: string } | null>(null);
  const quoteQuery = useListProjectQuotes(done?.id || '', {
    query: {
      enabled: Boolean(done?.id),
      queryKey: getListProjectQuotesQueryKey(done?.id || ''),
    },
  });
  const [form, setForm] = useState({
    mobile: '',
    location: '',
    monthlyBill: '',
    propertyType: 'residential',
    systemPreference: 'on-grid',
    budget: '',
  });
  const [currentBill, setCurrentBill] = useState<File | null>(null);
  useEffect(() => {
    if (!user) setLocation(`/signin?returnTo=${encodeURIComponent(location)}`);
  }, [location, setLocation, user]);
  const update = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setForm({ ...form, [key]: e.target.value });
  const updateMonthlyBill = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === '' || Number(value) >= 0) setForm({ ...form, monthlyBill: value });
  };
  const updateCurrentBill = (e: React.ChangeEvent<HTMLInputElement>) => setCurrentBill(e.target.files?.[0] || null);
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setLocation(`/signin?returnTo=${encodeURIComponent(location)}`);
      return;
    }
    const formData = new FormData();
    formData.append('mobile', form.mobile);
    formData.append('location', form.location);
    if (companyId) formData.append('companyId', companyId);
    if (form.monthlyBill && Number(form.monthlyBill) >= 0) formData.append('monthlyBill', String(form.monthlyBill));
    if (form.propertyType) formData.append('propertyType', form.propertyType);
    if (form.systemPreference) formData.append('systemPreference', form.systemPreference);
    if (form.budget) formData.append('budget', String(form.budget));
    if (currentBill) formData.append('currentBill', currentBill, currentBill.name);
    mutation.mutate({ formData }, { onSuccess: (project) => setDone(project) });
  };
  if (!user) return null;
  if (done)
    return (
      <div className="mx-auto max-w-3xl px-5 py-20 lg:py-28">
        <div className="rounded-[2rem] bg-[#dfece0] p-8 text-center sm:p-14">
          <span className="mx-auto grid size-16 place-items-center rounded-2xl bg-primary text-primary-foreground">
            <Check size={30} />
          </span>
          <p className="mt-6 text-xs font-bold uppercase tracking-widest text-accent">Request received</p>
          <h1 className="mt-2 font-display text-4xl font-bold">A clearer next step.</h1>
          <p className="mx-auto mt-4 max-w-md leading-7 text-muted-foreground">
            Your project request is safely with us. Keep this reference handy: <strong className="text-foreground">{done.id}</strong>
          </p>
          {quoteQuery.data?.length ? (
            <div className="mx-auto mt-7 max-w-md rounded-2xl bg-card/80 p-4 text-left">
              <p className="text-xs font-bold uppercase tracking-widest text-accent">Quotes already available</p>
              <p data-testid="text-quote-count" className="mt-1 font-display text-xl font-bold">
                {quoteQuery.data.length} company response
                {quoteQuery.data.length === 1 ? '' : 's'}
              </p>
            </div>
          ) : null}
          <Link href="/" data-testid="link-quote-success-home" className="mt-8 inline-flex rounded-full bg-accent px-5 py-3 text-sm font-bold text-accent-foreground">
            Back to home
          </Link>
        </div>
      </div>
    );
  return (
    <div className="mx-auto grid max-w-[1100px] gap-12 px-5 py-10 lg:grid-cols-[.72fr_1.28fr] lg:px-8 lg:py-16">
      <div className="lg:pt-7">
        <p className="text-xs font-bold uppercase tracking-[.18em] text-accent">A better starting point</p>
        <h1 className="mt-3 font-display text-5xl font-bold leading-[.98] tracking-tight sm:text-6xl">Tell us about your roof.</h1>
        <p className="mt-5 max-w-sm leading-7 text-muted-foreground">No technical vocabulary required. Share what you know and we’ll help you understand what comes next.</p>
        <div className="mt-9 grid gap-3 text-sm">
          <div className="flex items-center gap-3">
            <span className="grid size-8 place-items-center rounded-lg bg-primary">
              <ShieldCheck size={16} />
            </span>{' '}
            Your request stays private
          </div>
          <div className="flex items-center gap-3">
            <span className="grid size-8 place-items-center rounded-lg bg-secondary text-accent">
              <Users size={16} />
            </span>{' '}
            Meet relevant local companies
          </div>
          <div className="flex items-center gap-3">
            <span className="grid size-8 place-items-center rounded-lg bg-secondary text-accent">
              <CircleDollarSign size={16} />
            </span>{' '}
            Compare with context, not pressure
          </div>
        </div>
      </div>
      <form onSubmit={submit} className="rounded-[2rem] border border-border bg-card p-6 shadow-[var(--shadow-card)] sm:p-9">
        <div className="mb-7">
          <h2 className="font-display text-2xl font-bold">Project details</h2>
          <p className="mt-1 text-sm text-muted-foreground">Fields marked required help companies prepare a useful response.</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field required autoComplete="tel" inputMode="tel" type="tel" label="Mobile number" placeholder="98765 43210" value={form.mobile} onChange={update('mobile')} data-testid="input-quote-mobile" />
          <Field required label="City or location" placeholder="For example, Pune" value={form.location} onChange={update('location')} data-testid="input-quote-location" />
          <Field type="number" min="0" step="1" label="Monthly electricity bill" placeholder="₹ 4,500" value={form.monthlyBill} onChange={updateMonthlyBill} data-testid="input-quote-bill" />
          <SelectField label="Property type" value={form.propertyType} onValueChange={(value) => setForm((current) => ({ ...current, propertyType: value }))} data-testid="select-quote-property">
            <DropdownItem value="residential">Residential</DropdownItem>
            <DropdownItem value="commercial">Commercial</DropdownItem>
            <DropdownItem value="industrial">Industrial</DropdownItem>
            <DropdownItem value="other">Other</DropdownItem>
          </SelectField>
          <SelectField label="System preference" value={form.systemPreference} onValueChange={(value) => setForm((current) => ({ ...current, systemPreference: value }))} data-testid="select-quote-system">
            <DropdownItem value="on-grid">On-grid</DropdownItem>
            <DropdownItem value="off-grid">Off-grid</DropdownItem>
            <DropdownItem value="hybrid-grid">Hybrid grid</DropdownItem>
          </SelectField>
          <Field type="number" label="Comfortable budget (optional)" placeholder="₹ 1,50,000" value={form.budget} onChange={update('budget')} data-testid="input-quote-budget" />
          <label className="group grid cursor-pointer gap-1.5 text-sm font-medium text-foreground sm:col-span-2">
            <span>
              Upload current electricity bill <span className="font-normal text-muted-foreground">(optional)</span>
            </span>
            <span className="flex min-h-11 items-center justify-center gap-2 rounded-xl border border-dashed border-input bg-card px-3.5 text-sm text-muted-foreground transition-colors group-hover:border-accent group-hover:text-accent">
              <Upload size={16} />
              {currentBill ? currentBill.name : 'Choose a PDF or image'}
              <input type="file" accept="application/pdf,image/png,image/jpeg" onChange={updateCurrentBill} className="sr-only" data-testid="input-quote-current-bill" />
            </span>
          </label>
        </div>
        {mutation.error && (
          <p data-testid="status-quote-error" className="mt-5 rounded-xl bg-[#fff2ef] p-3 text-sm text-[#8d3f34]">
            We couldn't send that request. Please check the details and try again.
          </p>
        )}
        <Button type="submit" data-testid="button-submit-quote" disabled={mutation.isPending} className="mt-8 w-full py-3.5">
          {mutation.isPending ? <Loader2 className="animate-spin" size={17} /> : <Send size={17} />} {mutation.isPending ? 'Sending request…' : 'Request my quote'}
        </Button>
        <p className="mt-3 text-center text-xs text-muted-foreground">You can register after this step to keep your project details together.</p>
      </form>
    </div>
  );
}

export function CustomerDashboard() {
  const { user } = useAuth();
  const projectsQuery = useMyProjectTracking();
  const name = user?.name || 'there';
  return (
    <div className="mx-auto max-w-[1100px] px-5 py-10 lg:px-8 lg:py-14">
      <PageHeader
        eyebrow="Your solar journey"
        title={`Good to see you, ${name}.`}
        description="Keep your project moving from one clear place."
        action={
          <Link href="/quote" data-testid="link-customer-dashboard-quote" className="inline-flex items-center gap-2 rounded-full bg-accent px-4 py-2.5 text-sm font-bold text-accent-foreground">
            Request a quote <ArrowRight size={16} />
          </Link>
        }
      />
      <div className="grid gap-5 lg:grid-cols-[1.2fr_.8fr]">
        <section className="rounded-3xl bg-[#dfece0] p-7 text-[#0b1d2b] sm:p-9">
          <p className="text-xs font-bold uppercase tracking-widest text-accent">Next step</p>
          <h2 className="mt-3 max-w-lg font-display text-3xl font-bold text-[#0b1d2b]">Understand what your home needs.</h2>
          <p className="mt-3 max-w-lg text-sm leading-6 text-[#385565]">Tell us about your roof and electricity use to get relevant system options and connect with trusted companies.</p>
          <Link href="/quote" data-testid="link-customer-start-quote" className="mt-7 inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground">
            Start your project <ArrowRight size={16} />
          </Link>
        </section>
        <section className="rounded-3xl border border-border bg-card p-7 shadow-[var(--shadow-card)]">
          <p className="text-xs font-bold uppercase tracking-widest text-accent">Your account</p>
          <p className="mt-4 font-display text-2xl font-bold">Ready when you are.</p>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">Compare equipment, request a quote, and keep your next solar decision in one place.</p>
          <Link href="/marketplace" data-testid="link-customer-marketplace" className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-accent">
            Browse equipment <ArrowRight size={15} />
          </Link>
        </section>
      </div>
      <section className="mt-10">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-widest text-accent">Project tracker</p><h2 className="mt-2 font-display text-2xl font-bold">Your solar projects</h2></div><div className="flex items-center gap-4"><button type="button" onClick={() => projectsQuery.refetch()} disabled={projectsQuery.isFetching} className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-accent"><RefreshCw size={14} className={projectsQuery.isFetching ? 'animate-spin' : ''} />Refresh updates</button><Link href="/quote" className="text-sm font-bold text-accent">Start another project <ArrowRight size={15} className="ml-1 inline" /></Link></div></div>
        <QueryState loading={projectsQuery.isLoading} error={projectsQuery.error} onRetry={() => projectsQuery.refetch()} empty={!projectsQuery.isLoading && !projectsQuery.error && (projectsQuery.data?.items || []).length === 0} emptyText="Your project updates will appear here.">
          <div className="grid gap-4">{(projectsQuery.data?.items || []).map((project) => <article key={project.projectId} data-testid={`card-project-${project.projectId}`} className="rounded-3xl border border-border bg-card p-5 shadow-[var(--shadow-card)] sm:p-7">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between"><div><div className="flex flex-wrap items-center gap-2"><StatusPill status={project.status} /><span className="text-sm text-muted-foreground">{project.location || 'Location pending'} · {project.propertyType || 'Residential'}</span></div><h3 className="mt-3 font-display text-xl font-bold">{project.statusLabel}</h3><p className="mt-1 text-sm text-muted-foreground">Project reference {project.projectId}</p></div><div className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm sm:min-w-[300px]"><div><p className="text-xs text-muted-foreground">Vendor</p><p className="mt-1 font-semibold">{project.vendor?.name || 'Matching with companies'}</p></div><div><p className="text-xs text-muted-foreground">Expected completion</p><p className="mt-1 flex items-center gap-1 font-semibold"><CalendarDays size={14} />{project.expectedCompletionAt ? date(project.expectedCompletionAt) : 'Not scheduled'}</p></div></div></div>
            <OrderProgressTracker project={project} />
            <ProjectQuotesAndPayment project={project} />
            <div className="mt-6 border-t border-border pt-5"><h4 className="mb-4 flex items-center gap-2 text-sm font-bold"><Clock3 size={16} className="text-accent" />Timeline and updates</h4>{project.history?.length ? <ol className="grid gap-0">{[...project.history].reverse().map((event, index) => <li key={event.id || `${event.status}-${index}`} className="relative flex gap-3 pb-4 last:pb-0"><span className={`relative z-10 mt-1 grid size-5 shrink-0 place-items-center rounded-full ${index === 0 ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground'}`}>{index === 0 ? <Check size={12} /> : <span className="size-1.5 rounded-full bg-current" />}</span>{index < project.history.length - 1 && <span className="absolute left-[9px] top-6 h-[calc(100%-1rem)] w-px bg-border" />}<div className="min-w-0 flex-1"><div className="flex flex-wrap items-center justify-between gap-2"><p className="text-sm font-semibold">{event.statusLabel}</p><time className="text-xs text-muted-foreground">{date(event.createdAt)}</time></div>{event.message && <p className="mt-1 text-sm leading-5 text-muted-foreground">{event.message}</p>}{event.important && <span className="mt-2 inline-block rounded-full bg-[#fff0c9] px-2 py-1 text-[10px] font-bold text-[#765300]">Important update</span>}</div></li>)}</ol> : <p className="text-sm text-muted-foreground">Project created {date(project.createdAt)}. Updates will appear here.</p>}</div>
          </article>)}</div>
        </QueryState>
      </section>
    </div>
  );
}

export function Register() {
  const mutation = useRegisterCustomer();
  const client = useQueryClient();
  const [done, setDone] = useState(false);
  const [acceptPolicies, setAcceptPolicies] = useState(false);
  const [form, setForm] = useState({
    name: '',
    mobile: '',
    email: '',
    location: '',
    pincode: '',
    propertyType: 'residential',
    monthlyBillAmount: '',
    requiredSystemSize: '',
  });
  const update = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setForm({ ...form, [key]: e.target.value });
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate(
      {
        data: {
          ...form,
          acceptPolicies,
          monthlyBillAmount: Number(form.monthlyBillAmount) || undefined,
          propertyType: form.propertyType as PropertyType,
        },
      },
      {
        onSuccess: () => {
          client.invalidateQueries({
            queryKey: getListCustomersQueryKey({ page: 1, limit: 50 }),
          });
          setDone(true);
        },
      },
    );
  };
  if (done)
    return (
      <AuthLayout eyebrow="Welcome to enrg" title="You’re on the right path.">
        <div className="rounded-3xl bg-[#dfece0] p-7 text-center">
          <Check className="mx-auto text-accent" size={30} />
          <h2 className="mt-3 font-display text-2xl font-bold">Customer profile created</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">Your solar details are ready for the next conversation.</p>
          <Link href="/quote" data-testid="link-register-success-quote" className="mt-6 inline-flex rounded-full bg-accent px-5 py-3 text-sm font-bold text-accent-foreground">
            Request a project quote
          </Link>
        </div>
      </AuthLayout>
    );
  return (
    <AuthLayout eyebrow="For homeowners" title="Put your home in the sun.">
      <p className="mb-6 text-sm text-muted-foreground">Register your details once, then make better solar decisions.</p>
      <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
        <Field required autoComplete="name" label="Full name" placeholder="Your name" value={form.name} onChange={update('name')} data-testid="input-register-name" />
        <Field required autoComplete="tel" inputMode="tel" type="tel" label="Mobile number" placeholder="98765 43210" value={form.mobile} onChange={update('mobile')} data-testid="input-register-mobile" />
        <Field autoComplete="email" type="email" label="Email address" placeholder="you@example.com" value={form.email} onChange={update('email')} data-testid="input-register-email" />
        <label className="grid gap-1.5 text-sm font-medium text-foreground"><span>City or location</span><LocationCombobox value={form.location} onValueChange={(value) => setForm((current) => ({ ...current, location: value }))} placeholder="Choose or search a city" ariaLabel="City or location" testId="input-register-location" /></label>
        <Field inputMode="numeric" autoComplete="postal-code" label="Pincode" placeholder="411001" value={form.pincode} onChange={update('pincode')} data-testid="input-register-pincode" />
        <SelectField label="Property type" value={form.propertyType} onValueChange={(value) => setForm((current) => ({ ...current, propertyType: value }))} data-testid="select-register-property">
          <DropdownItem value="residential">Residential</DropdownItem>
          <DropdownItem value="commercial">Commercial</DropdownItem>
          <DropdownItem value="industrial">Industrial</DropdownItem>
          <DropdownItem value="other">Other</DropdownItem>
        </SelectField>
        <Field type="number" label="Monthly bill" placeholder="4500" value={form.monthlyBillAmount} onChange={update('monthlyBillAmount')} data-testid="input-register-bill" />
        <Field label="System size, if known" placeholder="2–4 kW" value={form.requiredSystemSize} onChange={update('requiredSystemSize')} data-testid="input-register-size" />
        <label className="sm:col-span-2 flex items-start gap-3 rounded-xl border border-border bg-card p-3 text-sm leading-5 text-muted-foreground">
          <input required type="checkbox" checked={acceptPolicies} onChange={(event) => setAcceptPolicies(event.target.checked)} className="mt-1 size-4 accent-[#1f584d]" data-testid="checkbox-register-accept-policies" />
          <span>I agree to ENRG’s <Link href="/terms-and-conditions" className="font-semibold text-accent underline">Terms &amp; Conditions</Link> and <Link href="/privacy-policy" className="font-semibold text-accent underline">Privacy Policy</Link>.</span>
        </label>
        <div className="sm:col-span-2">
          {mutation.error && (
            <p data-testid="status-register-error" className="mb-4 rounded-xl bg-[#fff2ef] p-3 text-sm text-[#8d3f34]">
              We couldn't create your profile. Please review your details and try again.
            </p>
          )}
          <Button type="submit" data-testid="button-submit-register" disabled={mutation.isPending} className="w-full">
            {mutation.isPending ? <Loader2 className="animate-spin" size={17} /> : <UserRound size={17} />} Create customer profile
          </Button>
        </div>
      </form>
    </AuthLayout>
  );
}
