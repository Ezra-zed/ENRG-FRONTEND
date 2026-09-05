import { useEffect, useMemo, useRef, useState } from 'react';
import { QueryClient, QueryClientProvider, useQueryClient } from '@tanstack/react-query';
import { Link, Route, Switch, useLocation, Router as WouterRouter } from 'wouter';
import { FcGoogle } from 'react-icons/fc';
import {
  ArrowRight, BadgeCheck, BarChart3, Building2, Check, CircleDollarSign,
  ClipboardList, FileText, Home as HomeIcon, Loader2,
  LogIn, Menu, Package, PanelLeft, Phone, Plus, RefreshCw, Search, Send, ShieldCheck,
  ShoppingBag, Sparkles, Sun, UserRound, Users, X, Zap,
} from 'lucide-react';
import {
  getGetAdminDashboardQueryKey, getGetAdminManagementQueryKey, getGetCompanyMetricsQueryKey,
  getGetHomeContentQueryKey, getListCompanyLeadsQueryKey, getListCustomersQueryKey,
  getListMarketplaceProductsQueryKey, getListProjectQuotesQueryKey,
  useHealthCheck, useSignup, useSignin, useRegisterCustomer, useListCustomers,
  useRequestProjectQuote, useListProjectQuotes, useCreateCompanyProfile, useListCompanyLeads,
  useUpdateCompanyLead, useGetCompanyMetrics, useListMarketplaceProducts, useGetHomeContent,
  useVerifyCompany, useGetAdminDashboard, useGetAdminManagement,
} from '@workspace/api-client-react';
import {
  LeadStatus, ProductCategory, PropertyType, SigninInputMethod, SignupInputRole,
  SystemPreference, VerificationInputVerificationBadgesItem,
  type Company, type Lead, type Product,
} from '@workspace/api-client-react';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';

const queryClient = new QueryClient();
const money = (n?: number | null) => typeof n === 'number' ? `₹${n.toLocaleString('en-IN')}` : '—';
const date = (value?: string) => value ? new Date(value).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';
const getStoredUser = (): Record<string, any> | null => {
  try {
    const value = localStorage.getItem('enrg_user');
    return value ? JSON.parse(value) : null;
  } catch {
    return null;
  }
};
const getAccountPath = (user: Record<string, any> | null) => user?.role === 'user' ? '/customer/dashboard' : user?.role === 'admin' ? '/admin/dashboard' : '/company/dashboard';
const notifyAuthChanged = () => window.dispatchEvent(new Event('enrg-auth-changed'));

function Button({ children, variant = 'primary', className = '', type = 'button', ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'quiet' | 'outline' | 'danger' }) {
  const variants = {
    primary: 'bg-primary text-primary-foreground hover:-translate-y-0.5 hover:shadow-lg',
    quiet: 'bg-secondary text-secondary-foreground hover:bg-muted',
    outline: 'border border-border bg-card hover:border-accent hover:text-accent',
    danger: 'bg-destructive text-destructive-foreground hover:-translate-y-0.5',
  };
  return <button type={type} className={`inline-flex items-center justify-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold ${variants[variant]} disabled:cursor-not-allowed disabled:opacity-50 ${className}`} {...props}>{children}</button>;
}

function Field({ label, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return <label className="grid gap-1.5 text-sm font-medium text-foreground">{label}<input className="h-11 w-full rounded-xl border border-input bg-card px-3.5 text-sm outline-none placeholder:text-muted-foreground focus:border-accent focus:ring-2 focus:ring-primary/25" {...props} /></label>;
}

function SelectField({ label, children, ...props }: React.SelectHTMLAttributes<HTMLSelectElement> & { label: string }) {
  return <label className="grid gap-1.5 text-sm font-medium text-foreground">{label}<select className="h-11 w-full rounded-xl border border-input bg-card px-3.5 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-primary/25" {...props}>{children}</select></label>;
}

function StatusPill({ status }: { status?: string }) {
  const label = status?.replaceAll('-', ' ') || 'unknown';
  const tone = ['won', 'accepted', 'verified'].includes(status || '') ? 'bg-[#dcefe4] text-[#21624b]' : ['lost', 'rejected'].includes(status || '') ? 'bg-[#f8e1dd] text-[#a03e31]' : 'bg-[#fff0c9] text-[#765300]';
  return <span data-testid={`status-${status || 'unknown'}`} className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold capitalize ${tone}`}>{label}</span>;
}

function QueryState({ loading, error, onRetry, children, empty = false, emptyText = 'Nothing to show yet.' }: { loading?: boolean; error?: unknown; onRetry?: () => void; children: React.ReactNode; empty?: boolean; emptyText?: string }) {
  if (loading) return <div className="grid gap-3">{[1, 2, 3].map(i => <div key={i} className="skeleton h-20 rounded-2xl" />)}</div>;
  if (error) return <div className="rounded-2xl border border-[#e4b5aa] bg-[#fff2ef] p-6 text-center"><p className="font-semibold text-[#8d3f34]">We couldn't load this just now.</p><p className="mt-1 text-sm text-[#a55a4d]">Your data has not been changed.</p><Button data-testid="button-retry" variant="outline" className="mt-4" onClick={onRetry}><RefreshCw size={15} /> Try again</Button></div>;
  if (empty) return <div className="rounded-2xl border border-dashed border-border bg-card/60 p-10 text-center"><Sparkles className="mx-auto text-primary" size={26} /><p className="mt-3 font-display text-lg font-semibold">{emptyText}</p><p className="mt-1 text-sm text-muted-foreground">New activity will appear here as it arrives.</p></div>;
  return <>{children}</>;
}

function Logo() {
  return <Link href="/" data-testid="link-logo" className="group flex items-center gap-2.5"><span className="enrg-logo-mark"><img src="/favicon.svg?v=2" alt="ENRG company logo" /></span><span className="font-display text-xl font-bold tracking-tight">ENRG<span className="text-accent">.</span></span></Link>;
}

function SolarVideoBackdrop() {
  return <div className="solar-video-backdrop" aria-hidden="true"><video autoPlay muted loop playsInline poster="https://images.unsplash.com/photo-1509391366360-2e959784a276?auto=format&fit=crop&w=1800&q=80"><source src="/intro-vid-enrg.mp4" type="video/mp4" /></video><div /></div>;
}

function AppShell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState<Record<string, any> | null>(() => getStoredUser());
  const [location, setLocation] = useLocation();
  useHealthCheck();
  useEffect(() => {
    const syncUser = () => setUser(getStoredUser());
    window.addEventListener('enrg-auth-changed', syncUser);
    window.addEventListener('storage', syncUser);
    return () => {
      window.removeEventListener('enrg-auth-changed', syncUser);
      window.removeEventListener('storage', syncUser);
    };
  }, []);
  const logout = () => {
    localStorage.removeItem('enrg_user');
    localStorage.removeItem('enrg_token');
    setUser(null);
    setOpen(false);
    setLocation('/');
  };
  const nav = [
    { href: '/', label: 'Home', icon: HomeIcon },
    { href: '/marketplace', label: 'Marketplace', icon: ShoppingBag },
    { href: '/quote', label: 'Request a quote', icon: FileText },
  ];
  const companyNav = [
    { href: '/company/dashboard', label: 'Overview', icon: BarChart3 },
    { href: '/company/leads', label: 'Leads', icon: ClipboardList },
    { href: '/company/docs', label: 'Company docs', icon: FileText },
    { href: '/company/profile', label: 'Company profile', icon: Building2 },
  ];
  const adminNav = [
    { href: '/admin/dashboard', label: 'Admin overview', icon: PanelLeft },
    { href: '/admin/management', label: 'Management', icon: Users },
  ];
  return <div className="texture min-h-[100dvh] bg-background">{location === '/' && <SolarVideoBackdrop />}
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/90 backdrop-blur-xl">
      <div className="mx-auto flex h-[72px] max-w-[1320px] items-center justify-between px-5 lg:px-8">
        <div className="flex items-center gap-9"><Logo /><nav className="hidden items-center gap-6 md:flex">{nav.map(item => <Link key={item.href} href={item.href} data-testid={`link-nav-${item.label.toLowerCase().replaceAll(' ', '-')}`} className={`text-sm font-semibold ${location === item.href ? 'text-accent' : 'text-muted-foreground hover:text-foreground'}`}>{item.label}</Link>)}</nav></div>
        <div className="flex items-center gap-2.5">{user ? <><Link href={getAccountPath(user)} data-testid="link-account" className="rounded-full bg-accent px-4 py-2.5 text-sm font-semibold text-accent-foreground hover:-translate-y-0.5 hover:shadow-lg">My account</Link><button type="button" data-testid="button-logout" onClick={logout} className="hidden rounded-full border border-border px-3.5 py-2 text-sm font-semibold text-muted-foreground hover:border-accent hover:text-accent sm:block">Log out</button></> : <><Link href="/signin" data-testid="link-signin" className="hidden rounded-full px-3.5 py-2 text-sm font-semibold text-muted-foreground hover:bg-secondary hover:text-foreground sm:block">Sign in</Link><Link href="/signup" data-testid="link-signup" className="rounded-full bg-accent px-4 py-2.5 text-sm font-semibold text-accent-foreground hover:-translate-y-0.5 hover:shadow-lg">Join ENRG</Link></>}<button aria-label="Open navigation" data-testid="button-open-navigation" onClick={() => setOpen(!open)} className="rounded-xl p-2.5 hover:bg-secondary md:hidden">{open ? <X size={20} /> : <Menu size={20} />}</button></div>
      </div>
      {open && <div className="border-t border-border bg-card p-4 md:hidden"><div className="grid gap-1">{[...nav, ...companyNav].map(item => <Link key={item.href} href={item.href} data-testid={`link-mobile-${item.label.toLowerCase().replaceAll(' ', '-')}`} onClick={() => setOpen(false)} className="rounded-xl px-3 py-3 text-sm font-semibold hover:bg-secondary">{item.label}</Link>)}{user && <button type="button" data-testid="button-mobile-logout" onClick={logout} className="mt-2 rounded-xl px-3 py-3 text-left text-sm font-semibold text-muted-foreground hover:bg-secondary">Log out</button>}</div></div>}
    </header>
    <main>{children}</main>
    <footer className="border-t border-border bg-[#e7efe8]"><div className="mx-auto flex max-w-[1320px] flex-col gap-8 px-5 py-10 sm:flex-row sm:items-end sm:justify-between lg:px-8"><div><Logo /><p className="mt-3 max-w-xs text-sm leading-6 text-muted-foreground">ENRG Solar Solution makes the move to clean energy clearer.</p></div><div className="flex flex-wrap gap-x-6 gap-y-2 text-sm font-semibold text-muted-foreground"><Link href="/marketplace" data-testid="link-footer-marketplace">Marketplace</Link><Link href="/quote" data-testid="link-footer-quote">Get a quote</Link><Link href="/signup" data-testid="link-footer-company">For companies</Link></div></div></footer>
  </div>;
}

function PageHeader({ eyebrow, title, description, action }: { eyebrow: string; title: string; description?: string; action?: React.ReactNode }) {
  return <div className="mb-8 flex flex-col gap-5 border-b border-border pb-7 sm:flex-row sm:items-end sm:justify-between"><div><p className="mb-2 text-xs font-bold uppercase tracking-[.18em] text-accent">{eyebrow}</p><h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">{title}</h1>{description && <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">{description}</p>}</div>{action}</div>;
}

function Home() {
  const [system, setSystem] = useState<SystemPreference>('on-grid');
  const query = useGetHomeContent({ type: system }, { query: { queryKey: getGetHomeContentQueryKey({ type: system }) } });
  const content = query.data;
  const fallback = { headline: system === 'on-grid' ? 'Your rooftop, working smarter.' : system === 'off-grid' ? 'Power that stays with you.' : 'The best of both worlds.', description: 'See what fits your home, your habits, and the way power reaches you.', benefits: ['Lower monthly electricity costs', 'One clear path from choice to installation', 'Support from verified local companies'], recommendedSize: system === 'on-grid' ? '2–4 kW' : '3–5 kW', startingPrice: 145000 };
  const item = content || fallback;
  return <div>
    <section className="relative overflow-hidden bg-[#dfece0]"><div className="mx-auto grid max-w-[1320px] items-center gap-10 px-5 py-16 sm:py-20 lg:grid-cols-[1.05fr_.95fr] lg:px-8 lg:py-24"><div className="rise"><div className="mb-5 inline-flex items-center gap-2 rounded-full border border-accent/20 bg-card/70 px-3 py-1.5 text-xs font-bold text-accent"><span className="size-2 rounded-full bg-primary" />Solar, made human</div><h1 data-testid="text-home-headline" className="max-w-2xl font-display text-[clamp(3.25rem,7vw,6.8rem)] font-bold leading-[.92] tracking-[-.07em] text-[#183d34]">Good energy<br /><span className="text-accent">starts here.</span></h1><p className="mt-7 max-w-lg text-lg leading-8 text-[#46645a]">Compare the right system, connect with people who install it well, and make a confident switch to solar.</p><div className="mt-8 flex flex-wrap gap-3"><Link href="/quote" data-testid="link-home-quote" className="inline-flex items-center gap-2 rounded-full bg-accent px-5 py-3.5 text-sm font-bold text-accent-foreground hover:-translate-y-0.5 hover:shadow-xl">Tell us about your home <ArrowRight size={17} /></Link><Link href="/marketplace" data-testid="link-home-marketplace" className="inline-flex items-center gap-2 rounded-full border border-accent/25 bg-card/60 px-5 py-3.5 text-sm font-bold text-accent hover:bg-card">Browse equipment</Link></div></div><div className="rise rise-delay-2 relative min-h-[380px] overflow-hidden rounded-[2.5rem] bg-[#b4d1bf]"><div className="absolute -right-16 -top-12 size-72 rounded-full border-[24px] border-primary/70" /><div className="absolute -bottom-28 -left-10 size-80 rounded-full border-[30px] border-accent/80" /><div className="absolute inset-8 rotate-[-7deg] rounded-[2rem] border-2 border-[#6c9b82] bg-[#d2e2d0]/70 p-5 shadow-2xl"><div className="grid h-full grid-cols-4 gap-2.5">{Array.from({ length: 20 }).map((_, i) => <div key={i} className="rounded-md border border-[#7ca58b] bg-[#a8c7b7]/80" />)}</div></div><div className="absolute bottom-5 left-5 rounded-2xl bg-card/90 px-4 py-3 shadow-xl backdrop-blur"><p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">The enrg approach</p><p className="mt-1 font-display text-lg font-bold text-accent">Less guesswork. More daylight.</p></div></div></div></section>
    <section className="mx-auto max-w-[1320px] px-5 py-16 lg:px-8 lg:py-24"><div className="grid gap-10 lg:grid-cols-[.75fr_1.25fr]"><div><p className="text-xs font-bold uppercase tracking-[.18em] text-accent">Start with what you know</p><h2 className="mt-3 max-w-sm font-display text-4xl font-bold leading-tight tracking-tight">Every home has a different kind of yes.</h2><p className="mt-4 max-w-sm text-sm leading-6 text-muted-foreground">Not sure what system type means? Choose a starting point and we’ll keep the rest clear.</p></div><div><div className="grid gap-2 sm:grid-cols-3">{(['on-grid', 'off-grid', 'hybrid-grid'] as SystemPreference[]).map(type => <button key={type} data-testid={`button-system-${type}`} onClick={() => setSystem(type)} className={`rounded-2xl border p-4 text-left ${system === type ? 'border-accent bg-accent text-accent-foreground' : 'border-border bg-card hover:-translate-y-1 hover:shadow-lg'}`}><span className="mb-8 grid size-9 place-items-center rounded-xl bg-primary text-primary-foreground"><Zap size={17} /></span><p className="font-display text-lg font-bold capitalize">{type.replaceAll('-', ' ')}</p><p className={`mt-1 text-xs ${system === type ? 'text-accent-foreground/75' : 'text-muted-foreground'}`}>{type === 'on-grid' ? 'Connected to the city grid' : type === 'off-grid' ? 'Independent power storage' : 'Grid plus battery backup'}</p></button>)}</div><div className="mt-3 rounded-3xl bg-[#f4e6bd] p-6 sm:p-8"><QueryState loading={query.isLoading} error={query.error} onRetry={() => query.refetch()}><div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-xs font-bold uppercase tracking-widest text-[#80651c]">A good fit for you</p><h3 data-testid="text-system-headline" className="mt-2 font-display text-2xl font-bold text-[#3c361e]">{item.headline}</h3><p className="mt-2 max-w-lg text-sm leading-6 text-[#665a32]">{item.description}</p><ul className="mt-4 grid gap-2 text-sm text-[#4a4326]">{item.benefits?.slice(0, 3).map(benefit => <li key={benefit} className="flex items-center gap-2"><Check size={15} className="text-accent" />{benefit}</li>)}</ul></div><div className="shrink-0 rounded-2xl bg-card/80 p-4"><p className="text-xs text-muted-foreground">Typical home</p><p data-testid="text-recommended-size" className="mt-1 font-display text-2xl font-bold">{item.recommendedSize || '2–4 kW'}</p><p className="mt-2 text-xs text-muted-foreground">From {money(item.startingPrice)}</p></div></div></QueryState></div></div></div></section>
    <section className="bg-accent text-accent-foreground"><div className="mx-auto grid max-w-[1320px] gap-8 px-5 py-16 sm:grid-cols-3 lg:px-8"><div><p className="font-display text-5xl font-bold">01</p><p className="mt-4 font-semibold">Tell us what you need</p><p className="mt-1 text-sm leading-6 text-accent-foreground/70">A few honest details about your home and your electricity use.</p></div><div><p className="font-display text-5xl font-bold text-primary">02</p><p className="mt-4 font-semibold">Meet your shortlist</p><p className="mt-1 text-sm leading-6 text-accent-foreground/70">Relevant products and companies, not an endless catalogue.</p></div><div><p className="font-display text-5xl font-bold">03</p><p className="mt-4 font-semibold">Make the switch</p><p className="mt-1 text-sm leading-6 text-accent-foreground/70">Compare quotes with the context to choose well.</p></div></div></section>
  </div>;
}

function Reveal({ children, className = '', delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const elementRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setVisible(true);
        observer.disconnect();
      }
    }, { threshold: 0.16 });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);
  return <div ref={elementRef} className={`sarn-reveal ${visible ? 'is-visible' : ''} ${className}`} style={{ transitionDelay: `${delay}ms` }}>{children}</div>;
}

function CountUp({ value, suffix = '' }: { value: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const elementRef = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      const started = performance.now();
      const tick = (now: number) => {
        const progress = Math.min((now - started) / 1200, 1);
        setCount(Math.round(value * (1 - Math.pow(1 - progress, 3))));
        if (progress < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
      observer.disconnect();
    }, { threshold: 0.6 });
    observer.observe(element);
    return () => observer.disconnect();
  }, [value]);
  return <span ref={elementRef}>{count.toLocaleString('en-IN')}{suffix}</span>;
}

function LandingPage() {
  const benefits = [
    { icon: Sun, number: '01', title: 'Know your return', text: 'See the economics of your rooftop before you commit, with a clear view of system fit and payback.' },
    { icon: Users, number: '02', title: 'Meet the right installer', text: 'Compare verified local companies with the context to ask better questions and choose with confidence.' },
    { icon: Zap, number: '03', title: 'Watch energy move', text: 'Bring equipment, quotes, and the next step into one calm, connected solar journey.' },
  ];
  return <div className="sarn-landing">
    <section className="sarn-hero">
      <video className="sarn-hero-video" autoPlay muted loop playsInline poster="https://images.unsplash.com/photo-1509391366360-2e959784a276?auto=format&fit=crop&w=2200&q=85" aria-label="Solar panels in sunlight"><source src="/intro-vid-enrg.mp4" type="video/mp4" /></video>
      <div className="sarn-hero-overlay" />
      <div className="sarn-hero-lines" />
      <div className="sarn-hero-content">
        <div className="sarn-hero-copy">
          <p className="sarn-kicker sarn-load-1"><span className="sarn-live-dot" /> ENRG SOLAR SOLUTION / ENERGY, REFINED</p>
          <h1 className="sarn-title sarn-load-2">Own the<br /><em>sunlight.</em></h1>
          <p className="sarn-hero-description sarn-load-3">A smarter solar marketplace for homes that want more from every ray.</p>
          <div className="sarn-hero-actions sarn-load-4"><Link href="/quote" className="sarn-glow-button" data-testid="link-sarn-hero-quote">Start your solar plan <ArrowRight size={17} /></Link><Link href="/marketplace" className="sarn-text-link" data-testid="link-sarn-hero-marketplace">Explore the marketplace <span>↗</span></Link></div>
        </div>
        <div className="sarn-hero-readout sarn-load-4"><span className="sarn-readout-label">LIVE SOLAR INDEX</span><strong>+24.8%</strong><span>potential annual yield</span><div className="sarn-sparkline"><i /><i /><i /><i /><i /><i /><i /><i /></div></div>
      </div>
      <div className="sarn-scroll-cue"><span>Scroll to explore</span><i /></div>
    </section>

    <section className="sarn-stats-band"><div className="sarn-stats-inner"><Reveal><span className="sarn-stat-label">THE ENRG SIGNAL</span></Reveal><Reveal delay={80}><div className="sarn-stat"><strong><CountUp value={2400} suffix="+" /></strong><span>homes exploring solar</span></div></Reveal><Reveal delay={160}><div className="sarn-stat"><strong><CountUp value={18} suffix=".4k" /></strong><span>tonnes CO₂ avoided</span></div></Reveal><Reveal delay={240}><div className="sarn-stat"><strong><CountUp value={96} suffix="%" /></strong><span>customer confidence</span></div></Reveal></div></section>

    <section className="sarn-section sarn-benefits"><div className="sarn-section-heading"><Reveal><p className="sarn-kicker">ONE CLEAR CURRENT</p><h2>Energy decisions,<br /><em>without the noise.</em></h2></Reveal><Reveal delay={120}><p>From first calculation to final connection, SARN gives your next move a sharper signal.</p></Reveal></div><div className="sarn-benefit-grid">{benefits.map((benefit, index) => <Reveal key={benefit.number} delay={index * 100} className="sarn-benefit-wrap"><article className="sarn-glass-card"><div className="sarn-card-top"><span>{benefit.number}</span><benefit.icon size={22} /></div><h3>{benefit.title}</h3><p>{benefit.text}</p><Link href={index === 1 ? '/signup' : '/quote'} aria-label={benefit.title} className="sarn-card-arrow"><ArrowRight size={18} /></Link></article></Reveal>)}</div></section>

    <section className="sarn-section sarn-split"><Reveal className="sarn-orbit-visual"><div className="sarn-orbit orbit-one" /><div className="sarn-orbit orbit-two" /><div className="sarn-orbit-core"><Sun size={32} /><span>POWER<br />IN MOTION</span></div><div className="sarn-orbit-tag tag-one">ROOFTOP / 04.2 KW</div><div className="sarn-orbit-tag tag-two">GRID READY / 98.6%</div></Reveal><Reveal className="sarn-split-copy" delay={120}><p className="sarn-kicker">DESIGNED FOR REAL LIFE</p><h2>Make the<br /><em>switch visible.</em></h2><p>Solar should feel less like a leap and more like a system you can understand. SARN connects the numbers, the people, and the hardware in one place.</p><Link href="/quote" className="sarn-outline-button">Find your fit <ArrowRight size={16} /></Link></Reveal></section>

    <section className="sarn-section sarn-trust"><Reveal><p className="sarn-kicker">A BETTER KIND OF ENERGY</p><blockquote>“We stopped comparing promises and started comparing what actually fit our home.”</blockquote><div className="sarn-quote-meta"><span className="sarn-avatar">AK</span><span><strong>Anika & Karan</strong><small>Pune / SARN homeowners</small></span></div></Reveal></section>

    <section className="sarn-final-cta"><div className="sarn-final-glow" /><Reveal><p className="sarn-kicker">YOUR ROOFTOP IS READY</p><h2>Let’s make<br /><em>sunlight useful.</em></h2><Link href="/quote" className="sarn-glow-button" data-testid="link-sarn-final-quote">Build your solar plan <ArrowRight size={17} /></Link></Reveal></section>
  </div>;
}

function Marketplace() {
  const [category, setCategory] = useState<ProductCategory | undefined>();
  const [sort, setSort] = useState<'price' | 'newest'>('newest');
  const [search, setSearch] = useState('');
  const params = useMemo(() => ({ page: 1, limit: 50, ...(category ? { category } : {}), sortBy: sort }), [category, sort]);
  const query = useListMarketplaceProducts(params, { query: { queryKey: getListMarketplaceProductsQueryKey(params) } });
  const products = (query.data?.items || []).filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || p.description.toLowerCase().includes(search.toLowerCase()));
  const categories: Array<{ value: ProductCategory | undefined; label: string }> = [{ value: undefined, label: 'All equipment' }, { value: 'solar-module', label: 'Solar modules' }, { value: 'inverter', label: 'Inverters' }, { value: 'cable', label: 'Cables' }, { value: 'structure', label: 'Structures' }, { value: 'BOS', label: 'Balance of system' }];
  return <div className="mx-auto max-w-[1320px] px-5 py-10 lg:px-8 lg:py-14"><PageHeader eyebrow="The marketplace" title="Equipment with a reason to be here." description="A considered range of solar essentials from brands and sellers ready to answer your questions." action={<Link href="/quote" data-testid="link-marketplace-quote" className="inline-flex items-center gap-2 rounded-full bg-accent px-4 py-2.5 text-sm font-bold text-accent-foreground"><FileText size={16} /> Need help choosing?</Link>} /><div className="mb-8 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between"><div className="flex gap-2 overflow-x-auto pb-1">{categories.map(c => <button key={c.label} data-testid={`button-filter-${c.label.toLowerCase().replaceAll(' ', '-')}`} onClick={() => setCategory(c.value)} className={`whitespace-nowrap rounded-full px-3.5 py-2 text-xs font-bold ${category === c.value ? 'bg-accent text-accent-foreground' : 'bg-secondary text-secondary-foreground hover:bg-muted'}`}>{c.label}</button>)}</div><div className="flex gap-2"><label className="relative flex-1"><Search className="absolute left-3 top-2.5 text-muted-foreground" size={16} /><input data-testid="input-product-search" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search equipment" className="h-10 w-full rounded-full border border-input bg-card pl-9 pr-3 text-sm outline-none focus:border-accent sm:w-56" /></label><select data-testid="select-product-sort" value={sort} onChange={e => setSort(e.target.value as 'price' | 'newest')} className="h-10 rounded-full border border-input bg-card px-3 text-xs font-semibold outline-none"><option value="newest">Newest first</option><option value="price">Price</option></select></div></div><QueryState loading={query.isLoading} error={query.error} onRetry={() => query.refetch()} empty={!query.isLoading && !query.error && products.length === 0} emptyText="No equipment matches that search."><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{products.map(product => <ProductCard key={product.id} product={product} />)}</div></QueryState></div>;
}

function ProductCard({ product }: { product: Product }) {
  return <article data-testid={`card-product-${product.id}`} className="group overflow-hidden rounded-3xl border border-border bg-card shadow-[var(--shadow-card)] hover:-translate-y-1.5 hover:shadow-xl"><div className="relative flex h-48 items-center justify-center overflow-hidden bg-[#dcebe0]">{product.imageUrl ? <img src={product.imageUrl} alt={product.name} className="h-full w-full object-cover" /> : <div className="relative size-28 rotate-[-8deg] rounded-xl border-2 border-[#6f9b7f] bg-[#abcab6] shadow-xl"><div className="grid h-full grid-cols-3 gap-1 p-2">{Array.from({ length: 9 }).map((_, i) => <span key={i} className="rounded-sm border border-[#75a080] bg-[#c6dec3]" />)}</div></div>}{product.badge && <span data-testid={`text-badge-${product.id}`} className="absolute left-4 top-4 rounded-full bg-primary px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider">{product.badge}</span>}</div><div className="p-5"><p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{product.category.replaceAll('-', ' ')}</p><h3 data-testid={`text-product-name-${product.id}`} className="mt-1 font-display text-lg font-bold">{product.name}</h3><p className="mt-2 line-clamp-2 min-h-10 text-sm leading-5 text-muted-foreground">{product.description}</p><div className="mt-5 flex items-end justify-between gap-2"><div><span data-testid={`text-product-price-${product.id}`} className="font-display text-xl font-bold">{money(product.price)}</span><span className="ml-1 text-xs text-muted-foreground">/ {product.unit || 'unit'}</span></div><Link href="/quote" data-testid={`link-product-quote-${product.id}`} className="grid size-9 place-items-center rounded-full bg-secondary text-accent hover:bg-primary"><ArrowRight size={16} /></Link></div></div></article>;
}

function QuotePage() {
  const mutation = useRequestProjectQuote();
  const [done, setDone] = useState<{ id: string } | null>(null);
  const quoteQuery = useListProjectQuotes(done?.id || '', { query: { enabled: Boolean(done?.id), queryKey: getListProjectQuotesQueryKey(done?.id || '') } });
  const [form, setForm] = useState({ location: '', monthlyBill: '', propertyType: 'residential', systemPreference: 'on-grid', budget: '' });
  const update = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setForm({ ...form, [key]: e.target.value });
  const submit = (e: React.FormEvent) => { e.preventDefault(); mutation.mutate({ data: { location: form.location, monthlyBill: Number(form.monthlyBill) || undefined, propertyType: form.propertyType as PropertyType, systemPreference: form.systemPreference as SystemPreference, budget: Number(form.budget) || undefined } }, { onSuccess: project => setDone(project) }); };
  if (done) return <div className="mx-auto max-w-3xl px-5 py-20 lg:py-28"><div className="rounded-[2rem] bg-[#dfece0] p-8 text-center sm:p-14"><span className="mx-auto grid size-16 place-items-center rounded-2xl bg-primary text-primary-foreground"><Check size={30} /></span><p className="mt-6 text-xs font-bold uppercase tracking-widest text-accent">Request received</p><h1 className="mt-2 font-display text-4xl font-bold">A clearer next step.</h1><p className="mx-auto mt-4 max-w-md leading-7 text-muted-foreground">Your project request is safely with us. Keep this reference handy: <strong className="text-foreground">{done.id}</strong></p>{quoteQuery.data?.length ? <div className="mx-auto mt-7 max-w-md rounded-2xl bg-card/80 p-4 text-left"><p className="text-xs font-bold uppercase tracking-widest text-accent">Quotes already available</p><p data-testid="text-quote-count" className="mt-1 font-display text-xl font-bold">{quoteQuery.data.length} company response{quoteQuery.data.length === 1 ? '' : 's'}</p></div> : null}<Link href="/" data-testid="link-quote-success-home" className="mt-8 inline-flex rounded-full bg-accent px-5 py-3 text-sm font-bold text-accent-foreground">Back to home</Link></div></div>;
  return <div className="mx-auto grid max-w-[1100px] gap-12 px-5 py-10 lg:grid-cols-[.72fr_1.28fr] lg:px-8 lg:py-16"><div className="lg:pt-7"><p className="text-xs font-bold uppercase tracking-[.18em] text-accent">A better starting point</p><h1 className="mt-3 font-display text-5xl font-bold leading-[.98] tracking-tight sm:text-6xl">Tell us about your roof.</h1><p className="mt-5 max-w-sm leading-7 text-muted-foreground">No technical vocabulary required. Share what you know and we’ll help you understand what comes next.</p><div className="mt-9 grid gap-3 text-sm"><div className="flex items-center gap-3"><span className="grid size-8 place-items-center rounded-lg bg-primary"><ShieldCheck size={16} /></span> Your request stays private</div><div className="flex items-center gap-3"><span className="grid size-8 place-items-center rounded-lg bg-secondary text-accent"><Users size={16} /></span> Meet relevant local companies</div><div className="flex items-center gap-3"><span className="grid size-8 place-items-center rounded-lg bg-secondary text-accent"><CircleDollarSign size={16} /></span> Compare with context, not pressure</div></div></div><form onSubmit={submit} className="rounded-[2rem] border border-border bg-card p-6 shadow-[var(--shadow-card)] sm:p-9"><div className="mb-7"><h2 className="font-display text-2xl font-bold">Project details</h2><p className="mt-1 text-sm text-muted-foreground">Fields marked required help companies prepare a useful response.</p></div><div className="grid gap-4 sm:grid-cols-2"><Field required label="City or location" placeholder="For example, Pune" value={form.location} onChange={update('location')} data-testid="input-quote-location" /><Field type="number" label="Monthly electricity bill" placeholder="₹ 4,500" value={form.monthlyBill} onChange={update('monthlyBill')} data-testid="input-quote-bill" /><SelectField label="Property type" value={form.propertyType} onChange={update('propertyType')} data-testid="select-quote-property"><option value="residential">Residential</option><option value="commercial">Commercial</option><option value="industrial">Industrial</option><option value="other">Other</option></SelectField><SelectField label="System preference" value={form.systemPreference} onChange={update('systemPreference')} data-testid="select-quote-system"><option value="on-grid">On-grid</option><option value="off-grid">Off-grid</option><option value="hybrid-grid">Hybrid grid</option></SelectField><Field type="number" label="Comfortable budget (optional)" placeholder="₹ 1,50,000" value={form.budget} onChange={update('budget')} data-testid="input-quote-budget" /></div>{mutation.error && <p data-testid="status-quote-error" className="mt-5 rounded-xl bg-[#fff2ef] p-3 text-sm text-[#8d3f34]">We couldn't send that request. Please check the details and try again.</p>}<Button type="submit" data-testid="button-submit-quote" disabled={mutation.isPending} className="mt-8 w-full py-3.5">{mutation.isPending ? <Loader2 className="animate-spin" size={17} /> : <Send size={17} />} {mutation.isPending ? 'Sending request…' : 'Request my quote'}</Button><p className="mt-3 text-center text-xs text-muted-foreground">You can register after this step to keep your project details together.</p></form></div>;
}

function CustomerDashboard() {
  const user = getStoredUser();
  const name = user?.name || 'there';
  return <div className="mx-auto max-w-[1100px] px-5 py-10 lg:px-8 lg:py-14"><PageHeader eyebrow="Your solar journey" title={`Good to see you, ${name}.`} description="Keep your project moving from one clear place." action={<Link href="/quote" data-testid="link-customer-dashboard-quote" className="inline-flex items-center gap-2 rounded-full bg-accent px-4 py-2.5 text-sm font-bold text-accent-foreground">Request a quote <ArrowRight size={16} /></Link>} /><div className="grid gap-5 lg:grid-cols-[1.2fr_.8fr]"><section className="rounded-3xl bg-[#dfece0] p-7 text-[#0b1d2b] sm:p-9"><p className="text-xs font-bold uppercase tracking-widest text-accent">Next step</p><h2 className="mt-3 max-w-lg font-display text-3xl font-bold text-[#0b1d2b]">Understand what your home needs.</h2><p className="mt-3 max-w-lg text-sm leading-6 text-[#385565]">Tell us about your roof and electricity use to get relevant system options and connect with trusted companies.</p><Link href="/quote" data-testid="link-customer-start-quote" className="mt-7 inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground">Start your project <ArrowRight size={16} /></Link></section><section className="rounded-3xl border border-border bg-card p-7 shadow-[var(--shadow-card)]"><p className="text-xs font-bold uppercase tracking-widest text-accent">Your account</p><p className="mt-4 font-display text-2xl font-bold">Ready when you are.</p><p className="mt-2 text-sm leading-6 text-muted-foreground">Compare equipment, request a quote, and keep your next solar decision in one place.</p><Link href="/marketplace" data-testid="link-customer-marketplace" className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-accent">Browse equipment <ArrowRight size={15} /></Link></section></div></div>;
}

function Register() {
  const mutation = useRegisterCustomer();
  const client = useQueryClient();
  const [done, setDone] = useState(false);
  const [form, setForm] = useState({ name: '', mobile: '', email: '', location: '', pincode: '', propertyType: 'residential', monthlyBillAmount: '', requiredSystemSize: '' });
  const update = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setForm({ ...form, [key]: e.target.value });
  const submit = (e: React.FormEvent) => { e.preventDefault(); mutation.mutate({ data: { ...form, monthlyBillAmount: Number(form.monthlyBillAmount) || undefined, propertyType: form.propertyType as PropertyType } }, { onSuccess: () => { client.invalidateQueries({ queryKey: getListCustomersQueryKey({ page: 1, limit: 50 }) }); setDone(true); } }); };
  if (done) return <AuthLayout eyebrow="Welcome to enrg" title="You’re on the right path."><div className="rounded-3xl bg-[#dfece0] p-7 text-center"><Check className="mx-auto text-accent" size={30} /><h2 className="mt-3 font-display text-2xl font-bold">Customer profile created</h2><p className="mt-2 text-sm leading-6 text-muted-foreground">Your solar details are ready for the next conversation.</p><Link href="/quote" data-testid="link-register-success-quote" className="mt-6 inline-flex rounded-full bg-accent px-5 py-3 text-sm font-bold text-accent-foreground">Request a project quote</Link></div></AuthLayout>;
  return <AuthLayout eyebrow="For homeowners" title="Put your home in the sun."><p className="mb-6 text-sm text-muted-foreground">Register your details once, then make better solar decisions.</p><form onSubmit={submit} className="grid gap-4 sm:grid-cols-2"><Field required label="Full name" placeholder="Your name" value={form.name} onChange={update('name')} data-testid="input-register-name" /><Field required label="Mobile number" placeholder="+91 98765 43210" value={form.mobile} onChange={update('mobile')} data-testid="input-register-mobile" /><Field type="email" label="Email address" placeholder="you@example.com" value={form.email} onChange={update('email')} data-testid="input-register-email" /><Field label="City or location" placeholder="Pune" value={form.location} onChange={update('location')} data-testid="input-register-location" /><Field label="Pincode" placeholder="411001" value={form.pincode} onChange={update('pincode')} data-testid="input-register-pincode" /><SelectField label="Property type" value={form.propertyType} onChange={update('propertyType')} data-testid="select-register-property"><option value="residential">Residential</option><option value="commercial">Commercial</option><option value="industrial">Industrial</option><option value="other">Other</option></SelectField><Field type="number" label="Monthly bill" placeholder="4500" value={form.monthlyBillAmount} onChange={update('monthlyBillAmount')} data-testid="input-register-bill" /><Field label="System size, if known" placeholder="2–4 kW" value={form.requiredSystemSize} onChange={update('requiredSystemSize')} data-testid="input-register-size" /><div className="sm:col-span-2">{mutation.error && <p data-testid="status-register-error" className="mb-4 rounded-xl bg-[#fff2ef] p-3 text-sm text-[#8d3f34]">We couldn't create your profile. Please review your details and try again.</p>}<Button type="submit" data-testid="button-submit-register" disabled={mutation.isPending} className="w-full">{mutation.isPending ? <Loader2 className="animate-spin" size={17} /> : <UserRound size={17} />} Create customer profile</Button></div></form></AuthLayout>;
}

function AuthLayout({ eyebrow, title, children }: { eyebrow: string; title: string; children: React.ReactNode }) {
  return <div className="grid min-h-[calc(100dvh-72px)] lg:grid-cols-[.85fr_1.15fr]"><div className="hidden bg-accent p-10 text-accent-foreground lg:flex lg:flex-col lg:justify-between"><Logo /><div><p className="text-xs font-bold uppercase tracking-[.2em] text-primary">{eyebrow}</p><h1 className="mt-4 max-w-md font-display text-6xl font-bold leading-[.94] tracking-tight">{title}</h1><p className="mt-6 max-w-sm text-base leading-7 text-accent-foreground/70">Solar is a big decision. enrg gives you the useful context, human support, and room to choose.</p></div><p className="text-xs text-accent-foreground/50">enrg / clean energy, clearly</p></div><div className="flex items-start justify-center px-5 py-12 sm:px-10 lg:items-center"><div className="w-full max-w-xl"><div className="mb-8 lg:hidden"><Logo /></div>{children}</div></div></div>;
}

function Signup() {
  const mutation = useSignup();
  const [, setLocation] = useLocation();
  const [role, setRole] = useState<SignupInputRole>('user');
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', businessName: '', gstin: '', licenseNumber: '' });
  const update = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, [key]: e.target.value });
  const submit = (e: React.FormEvent) => { e.preventDefault(); mutation.mutate({ data: { ...form, role, ...(role === 'user' ? {} : { businessName: form.businessName, gstin: form.gstin, licenseNumber: form.licenseNumber }) } }, { onSuccess: session => { localStorage.setItem('enrg_user', JSON.stringify(session.user)); notifyAuthChanged(); setLocation(role === 'user' ? '/customer/dashboard' : '/company/profile'); } }); };
  return <AuthLayout eyebrow="Join the network" title="Your next chapter runs on sunlight."><div className="mb-6"><p className="text-sm font-semibold">I’m joining as</p><div className="mt-2 grid grid-cols-3 gap-2">{([{ value: 'user', label: 'Homeowner' }, { value: 'install-co', label: 'Installer' }, { value: 'seller-co', label: 'Seller' }] as Array<{ value: SignupInputRole; label: string }>).map(item => <button key={item.value} data-testid={`button-role-${item.value}`} onClick={() => setRole(item.value)} className={`rounded-xl border px-2 py-3 text-xs font-bold ${role === item.value ? 'border-accent bg-accent text-accent-foreground' : 'border-border bg-card hover:bg-secondary'}`}>{item.label}</button>)}</div></div><form onSubmit={submit} className="grid gap-4 sm:grid-cols-2"><Field required label="Full name" placeholder="Your name" value={form.name} onChange={update('name')} data-testid="input-signup-name" /><Field required type="email" label="Email address" placeholder="you@example.com" value={form.email} onChange={update('email')} data-testid="input-signup-email" /><Field required label="Phone number" placeholder="+91 98765 43210" value={form.phone} onChange={update('phone')} data-testid="input-signup-phone" /><Field required type="password" label="Password" placeholder="At least 6 characters" value={form.password} onChange={update('password')} data-testid="input-signup-password" />{role !== 'user' && <><div className="sm:col-span-2"><Field required label="Business name" placeholder="Your company" value={form.businessName} onChange={update('businessName')} data-testid="input-signup-business" /></div><Field label="GSTIN (optional)" placeholder="GST number" value={form.gstin} onChange={update('gstin')} data-testid="input-signup-gstin" /><Field label="License number (optional)" placeholder="Registration number" value={form.licenseNumber} onChange={update('licenseNumber')} data-testid="input-signup-license" /></>}<div className="sm:col-span-2">{mutation.error && <p data-testid="status-signup-error" className="mb-4 rounded-xl bg-[#fff2ef] p-3 text-sm text-[#8d3f34]">We couldn't create that account. Check your details and try again.</p>}<Button type="submit" data-testid="button-submit-signup" disabled={mutation.isPending} className="w-full">{mutation.isPending ? <Loader2 className="animate-spin" size={17} /> : <ArrowRight size={17} />} Create my account</Button><p className="mt-4 text-center text-sm text-muted-foreground">Already have an account? <Link href="/signin" data-testid="link-signup-signin" className="font-bold text-accent">Sign in</Link></p></div></form></AuthLayout>;
}

function LegacySignin() {
  const mutation = useSignin();
  const [, setLocation] = useLocation();
  const [method, setMethod] = useState<SigninInputMethod>('JWT-auth');
  const [form, setForm] = useState({ email: '', password: '', phone: '', otp: '' });
  const update = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, [key]: e.target.value });
  const submit = (e: React.FormEvent) => { e.preventDefault(); const data = method === 'JWT-auth' ? { method, email: form.email, password: form.password } : method === 'no-password' ? { method, phone: form.phone, otp: form.otp } : { method, oauthProvider: 'google' as const, oauthToken: 'google-browser-session' }; mutation.mutate({ data }, { onSuccess: session => { localStorage.setItem('enrg_user', JSON.stringify(session.user)); notifyAuthChanged(); setLocation(session.user.role === 'user' ? '/customer/dashboard' : session.user.role === 'admin' ? '/admin/dashboard' : '/company/dashboard'); } }); };
  return <AuthLayout eyebrow="Welcome back" title="Good to see you again."><div className="mb-6 flex rounded-xl bg-secondary p-1">{([{ value: 'JWT-auth', label: 'Password' }, { value: 'no-password', label: 'One-time code' }, { value: 'O-auth', label: 'Google' }] as Array<{ value: SigninInputMethod; label: string }>).map(item => <button key={item.value} data-testid={`button-signin-method-${item.value}`} onClick={() => setMethod(item.value)} className={`flex-1 rounded-lg px-2 py-2 text-xs font-bold ${method === item.value ? 'bg-card text-accent shadow-sm' : 'text-muted-foreground'}`}>{item.label}</button>)}</div><form onSubmit={submit} className="grid gap-4">{method === 'JWT-auth' && <><Field required type="email" label="Email address" placeholder="you@example.com" value={form.email} onChange={update('email')} data-testid="input-signin-email" /><Field required type="password" label="Password" placeholder="Your password" value={form.password} onChange={update('password')} data-testid="input-signin-password" /></>}{method === 'no-password' && <><Field required label="Mobile number" placeholder="+91 98765 43210" value={form.phone} onChange={update('phone')} data-testid="input-signin-phone" /><Field required label="One-time code" placeholder="Enter code" value={form.otp} onChange={update('otp')} data-testid="input-signin-otp" /></>}{method === 'O-auth' && <div className="rounded-2xl bg-[#dfece0] p-5"><div className="flex items-center gap-3"><span className="grid size-10 place-items-center rounded-full bg-card font-display font-bold">G</span><div><p className="font-semibold">Continue with Google</p><p className="text-xs text-muted-foreground">A secure sign-in without another password.</p></div></div></div>}{mutation.error && <p data-testid="status-signin-error" className="rounded-xl bg-[#fff2ef] p-3 text-sm text-[#8d3f34]">Sign in was not completed. Check your details and try again.</p>}<Button type="submit" data-testid="button-submit-signin" disabled={mutation.isPending} className="w-full">{mutation.isPending ? <Loader2 className="animate-spin" size={17} /> : <LogIn size={17} />} Continue</Button><p className="mt-2 text-center text-sm text-muted-foreground">New to enrg? <Link href="/signup" data-testid="link-signin-signup" className="font-bold text-accent">Create an account</Link></p></form></AuthLayout>;
}

function Signin() {
  const mutation = useSignin();
  const [, setLocation] = useLocation();
  const [method, setMethod] = useState<SigninInputMethod>('O-auth');
  const [form, setForm] = useState({ email: '', password: '', phone: '', otp: '' });
  const update = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, [key]: e.target.value });
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = method === 'JWT-auth'
      ? { method, email: form.email, password: form.password }
      : method === 'no-password'
        ? { method, phone: form.phone, otp: form.otp }
        : { method, oauthProvider: 'google' as const, oauthToken: 'google-browser-session' };
    mutation.mutate({ data }, { onSuccess: session => {
      localStorage.setItem('enrg_user', JSON.stringify(session.user));
      notifyAuthChanged();
      setLocation(session.user.role === 'user' ? '/customer/dashboard' : session.user.role === 'admin' ? '/admin/dashboard' : '/company/dashboard');
    } });
  };
  return <div className="signin-modal-page">
    <div className="signin-modal-backdrop" />
    <section className="signin-modal" aria-label="Sign in to ENRG">
      <Link href="/" aria-label="Close sign-in" className="signin-modal-close"><X size={27} /></Link>
      <div className="signin-modal-brand"><span className="signin-modal-mark"><img src="/favicon.svg" alt="ENRG company logo" /></span><div><p className="text-xl font-bold tracking-tight">Sign in to ENRG</p><p className="mt-1 text-sm text-muted-foreground">Your solar journey starts here.</p></div></div>
      {method === 'O-auth' && <><button type="button" data-testid="button-signin-method-O-auth" onClick={submit} disabled={mutation.isPending} className="signin-google-button"><span className="signin-google-icon"><FcGoogle size={20} /></span>{mutation.isPending ? 'Signing you in...' : 'Continue with Google'}</button><button type="button" data-testid="button-signin-email" onClick={() => setMethod('JWT-auth')} className="signin-email-button"><span className="signin-mail-icon"><Send size={18} /></span>Sign in with Email</button><div className="signin-divider"><span>or</span></div><button type="button" data-testid="button-signin-method-no-password" onClick={() => setMethod('no-password')} className="signin-phone-link">Sign in with a one-time code</button></>}
      {method !== 'O-auth' && <form onSubmit={submit} className="grid gap-4"><div className="mb-1 flex items-center justify-between"><p className="font-semibold">{method === 'JWT-auth' ? 'Sign in with email' : 'Sign in with one-time code'}</p><button type="button" onClick={() => setMethod('O-auth')} className="text-xs font-bold text-accent hover:underline">Back to options</button></div>{method === 'JWT-auth' && <><Field required autoComplete="email" type="email" label="Email address" placeholder="you@example.com" value={form.email} onChange={update('email')} data-testid="input-signin-email" /><div><Field required autoComplete="current-password" type="password" label="Password" placeholder="Your password" value={form.password} onChange={update('password')} data-testid="input-signin-password" /><button type="button" className="mt-2 text-xs font-bold text-accent hover:underline">Forgot password?</button></div></>}{method === 'no-password' && <><Field required autoComplete="tel" label="Mobile number" placeholder="+91 98765 43210" value={form.phone} onChange={update('phone')} data-testid="input-signin-phone" /><Field required inputMode="numeric" autoComplete="one-time-code" label="One-time code" placeholder="Enter the 6-digit code" value={form.otp} onChange={update('otp')} data-testid="input-signin-otp" /></>} {mutation.error && <p data-testid="status-signin-error" className="rounded-xl border border-[#e4b5aa] bg-[#fff2ef] p-3 text-sm text-[#8d3f34]">Sign in was not completed. Check your details and try again.</p>}<Button type="submit" data-testid="button-submit-signin" disabled={mutation.isPending} className="w-full py-3.5">{mutation.isPending ? <Loader2 className="animate-spin" size={17} /> : <LogIn size={17} />}{mutation.isPending ? 'Signing you in...' : 'Sign in securely'}</Button></form>}
      {method === 'O-auth' && mutation.error && <p data-testid="status-signin-error" className="mt-4 rounded-xl border border-[#e4b5aa] bg-[#fff2ef] p-3 text-sm text-[#8d3f34]">Sign in was not completed. Please try again.</p>}
      <p className="signin-modal-join">New to ENRG? <Link href="/signup" data-testid="link-signin-signup">Join now</Link></p>
      <p className="signin-modal-privacy"><ShieldCheck size={14} /> Your information is protected.</p>
    </section>
  </div>;
}

function CompanyProfile() {
  const mutation = useCreateCompanyProfile();
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({ installExperienceYears: '', serviceLocations: '', products: '', brands: '', pricingPackages: '' });
  const profileStorageKey = `enrg_company_profile_${getStoredUser()?.id || 'current'}`;
  useEffect(() => {
    try {
      const stored = localStorage.getItem(profileStorageKey);
      if (stored) setForm(JSON.parse(stored));
    } catch {}
  }, [profileStorageKey]);
  const update = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setForm({ ...form, [key]: e.target.value });
  const submit = (e: React.FormEvent) => { e.preventDefault(); mutation.mutate({ data: { installExperienceYears: Number(form.installExperienceYears) || undefined, serviceLocations: JSON.stringify(form.serviceLocations.split(',').map(v => v.trim()).filter(Boolean)), products: JSON.stringify(form.products.split(',').map(v => v.trim()).filter(Boolean)), brands: JSON.stringify(form.brands.split(',').map(v => v.trim()).filter(Boolean)), pricingPackages: form.pricingPackages } }, { onSuccess: () => { localStorage.setItem(profileStorageKey, JSON.stringify(form)); setSaved(true); } }); };
  return <CompanyShell><PageHeader eyebrow="Company profile" title="Make your work easy to trust." description="Give homeowners the useful context behind your company." /><form onSubmit={submit} className="max-w-3xl rounded-3xl border border-border bg-card p-6 shadow-[var(--shadow-card)] sm:p-8"><div className="grid gap-5 sm:grid-cols-2"><Field type="number" label="Installation experience (years)" placeholder="8" value={form.installExperienceYears} onChange={update('installExperienceYears')} data-testid="input-profile-experience" /><Field label="Service locations" placeholder="Pune, Mumbai, Nashik" value={form.serviceLocations} onChange={update('serviceLocations')} data-testid="input-profile-locations" /><Field label="Products you work with" placeholder="Rooftop solar, batteries" value={form.products} onChange={update('products')} data-testid="input-profile-products" /><Field label="Brands you install" placeholder="Waaree, Tata Power" value={form.brands} onChange={update('brands')} data-testid="input-profile-brands" /></div><label className="mt-5 grid gap-1.5 text-sm font-medium">Pricing packages<textarea rows={4} placeholder="Describe what a typical package includes…" value={form.pricingPackages} onChange={update('pricingPackages')} data-testid="textarea-profile-packages" className="rounded-xl border border-input bg-card p-3 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-primary/25" /></label>{saved && <p data-testid="status-profile-success" className="mt-4 flex items-center gap-2 text-sm font-semibold text-accent"><Check size={16} /> Profile saved successfully.</p>}{mutation.error && <p data-testid="status-profile-error" className="mt-4 text-sm text-destructive">We couldn't save your profile.</p>}<Button type="submit" data-testid="button-save-profile" disabled={mutation.isPending} className="mt-6">{mutation.isPending ? <Loader2 className="animate-spin" size={16} /> : <Check size={16} />} Save company profile</Button></form></CompanyShell>;
}

function CompanyShell({ children }: { children: React.ReactNode }) {
  return <div className="mx-auto max-w-[1320px] px-5 py-10 lg:px-8 lg:py-14"><div className="mb-8 flex items-center gap-2 overflow-x-auto border-b border-border pb-3"><Building2 size={18} className="mr-2 text-accent" />{[{ href: '/company/dashboard', label: 'Overview' }, { href: '/company/leads', label: 'Leads' }, { href: '/company/docs', label: 'Docs' }, { href: '/company/profile', label: 'Profile' }].map(item => <Link key={item.href} href={item.href} data-testid={`link-company-${item.label.toLowerCase()}`} className="whitespace-nowrap rounded-full px-3 py-2 text-sm font-semibold text-muted-foreground hover:bg-secondary hover:text-foreground">{item.label}</Link>)}</div>{children}</div>;
}

function CompanyDocs() {
  const docs = [
    { title: 'Company profile', summary: 'Keep your business story, service areas, and installation experience easy to trust.', action: 'Review profile', href: '/company/profile' },
    { title: 'Lead response guide', summary: 'Use a clear, consistent process for contact, site visits, and quoting customers.', action: 'Open leads', href: '/company/leads' },
    { title: 'Brand and compliance', summary: 'Track business verification, service coverage, and the materials or brands you install.', action: 'Check overview', href: '/company/dashboard' },
  ];
  return <CompanyShell><PageHeader eyebrow="Company docs" title="Everything your team needs to stay aligned." description="A working set of company documents and reference points for your sales and service flow." /><div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{docs.map(doc => <div key={doc.title} className="rounded-3xl border border-border bg-card p-6 shadow-[var(--shadow-card)]"><div className="flex items-center justify-between"><span className="grid size-11 place-items-center rounded-2xl bg-secondary text-accent"><FileText size={18} /></span><span className="rounded-full bg-[#dfece0] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[#1f584d]">Ready</span></div><h2 className="mt-5 font-display text-2xl font-bold">{doc.title}</h2><p className="mt-2 text-sm leading-6 text-muted-foreground">{doc.summary}</p><Link href={doc.href} data-testid={`link-company-doc-${doc.title.toLowerCase().replaceAll(/[^a-z0-9]+/g, '-')}`} className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-accent">{doc.action} <ArrowRight size={15} /></Link></div>)}</div></CompanyShell>;
}

function CompanyDashboard() {
  const query = useGetCompanyMetrics({ query: { queryKey: getGetCompanyMetricsQueryKey() } });
  const m = query.data;
  const metrics = [{ label: 'Total leads', value: m?.totalLeads ?? 0, icon: Users }, { label: 'Active conversations', value: m?.activeLeads ?? 0, icon: Phone }, { label: 'Quotes submitted', value: m?.quotesSubmitted ?? 0, icon: Send }, { label: 'Won projects', value: m?.wonProjects ?? 0, icon: Check }];
  return <CompanyShell><PageHeader eyebrow="Company overview" title="A good day to grow." description="Your business, in the moments that matter." action={<Link href="/company/leads" data-testid="link-dashboard-leads" className="inline-flex items-center gap-2 rounded-full bg-accent px-4 py-2.5 text-sm font-bold text-accent-foreground">View leads <ArrowRight size={16} /></Link>} /><QueryState loading={query.isLoading} error={query.error} onRetry={() => query.refetch()}><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{metrics.map(metric => <div key={metric.label} className="rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-card)]"><div className="flex items-center justify-between"><span className="grid size-9 place-items-center rounded-xl bg-secondary text-accent"><metric.icon size={18} /></span><span className="text-xs font-bold text-accent">LIVE</span></div><p data-testid={`text-metric-${metric.label.toLowerCase().replaceAll(' ', '-')}`} className="mt-6 font-display text-4xl font-bold">{metric.value}</p><p className="mt-1 text-sm text-muted-foreground">{metric.label}</p></div>)}</div><div className="mt-6 grid gap-6 lg:grid-cols-[1.2fr_.8fr]"><div className="rounded-3xl bg-accent p-7 text-accent-foreground"><p className="text-xs font-bold uppercase tracking-widest text-primary">Pipeline value</p><p data-testid="text-pipeline-value" className="mt-2 font-display text-5xl font-bold">{money(m?.pipelineValue)}</p><p className="mt-3 max-w-sm text-sm leading-6 text-accent-foreground/70">Every clear conversation is a project that can move forward.</p></div><div className="rounded-3xl border border-border bg-card p-7"><p className="text-xs font-bold uppercase tracking-widest text-accent">Profile strength</p><div className="mt-5 h-3 overflow-hidden rounded-full bg-secondary"><div className="h-full w-[72%] rounded-full bg-primary" /></div><p className="mt-3 text-sm text-muted-foreground">Complete your company profile to help homeowners choose with confidence.</p><Link href="/company/profile" data-testid="link-dashboard-profile" className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-accent">Finish profile <ArrowRight size={15} /></Link></div></div></QueryState></CompanyShell>;
}

function CompanyLeads() {
  const query = useListCompanyLeads({ page: 1, limit: 50 }, { query: { queryKey: getListCompanyLeadsQueryKey({ page: 1, limit: 50 }) } });
  const mutation = useUpdateCompanyLead();
  const [active, setActive] = useState<Lead | null>(null);
  const [price, setPrice] = useState('');
  const [warranty, setWarranty] = useState('');
  const leads = query.data?.items || [];
  const updateStatus = (lead: Lead, status: LeadStatus) => mutation.mutate({ data: { leadId: lead.id, status } }, { onSuccess: () => queryClient.invalidateQueries({ queryKey: getListCompanyLeadsQueryKey({ page: 1, limit: 50 }) }) });
  const submitQuote = (e: React.FormEvent) => { e.preventDefault(); if (!active) return; mutation.mutate({ data: { leadId: active.id, status: 'quote-submitted', quote: { estimatedPrice: Number(price), warrantyYears: Number(warranty) || undefined } } }, { onSuccess: () => { setActive(null); queryClient.invalidateQueries({ queryKey: getListCompanyLeadsQueryKey({ page: 1, limit: 50 }) }); } }); };
  return <CompanyShell><PageHeader eyebrow="Lead desk" title="People are looking for you." description="Respond thoughtfully. Momentum starts with the first useful reply." /><QueryState loading={query.isLoading} error={query.error} onRetry={() => query.refetch()} empty={!query.isLoading && !query.error && leads.length === 0} emptyText="Your lead desk is quiet for now."><div className="overflow-hidden rounded-3xl border border-border bg-card shadow-[var(--shadow-card)]"><div className="hidden grid-cols-[1.3fr_1fr_.7fr_.7fr_1fr] gap-4 border-b border-border bg-secondary/60 px-5 py-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground md:grid"><span>Customer</span><span>Need</span><span>Bill</span><span>Status</span><span /></div>{leads.map(lead => <div key={lead.id} data-testid={`row-lead-${lead.id}`} className="grid gap-3 border-b border-border p-5 last:border-0 md:grid-cols-[1.3fr_1fr_.7fr_.7fr_1fr] md:items-center md:gap-4 md:py-4"><div><p data-testid={`text-lead-customer-${lead.id}`} className="font-semibold">{lead.customerName}</p><p className="mt-1 text-xs text-muted-foreground">{lead.location} · {date(lead.createdAt)}</p></div><p className="text-sm text-muted-foreground">{lead.systemSize || 'Size to assess'}</p><p className="text-sm font-semibold">{money(lead.monthlyBill)}</p><StatusPill status={lead.status} /><div className="flex flex-wrap gap-2"><select data-testid={`select-lead-status-${lead.id}`} value={lead.status} onChange={e => updateStatus(lead, e.target.value as LeadStatus)} className="h-9 rounded-full border border-input bg-card px-2 text-xs font-semibold"><option value="new">New</option><option value="accepted">Accepted</option><option value="contacted">Contacted</option><option value="site-visit">Site visit</option><option value="won">Won</option><option value="lost">Lost</option></select><Button data-testid={`button-lead-quote-${lead.id}`} variant="quiet" className="px-3 py-2 text-xs" onClick={() => { setActive(lead); setPrice(lead.quote?.estimatedPrice?.toString() || ''); setWarranty(lead.quote?.warrantyYears?.toString() || ''); }}><Plus size={14} /> Quote</Button></div></div>)}</div></QueryState>{active && <div className="fixed inset-0 z-50 grid place-items-center bg-[#183d34]/35 p-5 backdrop-blur-sm"><form onSubmit={submitQuote} className="w-full max-w-md rounded-3xl border border-border bg-card p-6 shadow-2xl"><div className="flex items-start justify-between"><div><p className="text-xs font-bold uppercase tracking-widest text-accent">Submit quote</p><h2 className="mt-1 font-display text-2xl font-bold">{active.customerName}</h2></div><button type="button" data-testid="button-close-quote-modal" onClick={() => setActive(null)} className="rounded-full p-2 hover:bg-secondary"><X size={18} /></button></div><div className="mt-6 grid gap-4"><Field required type="number" label="Estimated price" placeholder="145000" value={price} onChange={e => setPrice(e.target.value)} data-testid="input-lead-price" /><Field type="number" label="Warranty (years)" placeholder="10" value={warranty} onChange={e => setWarranty(e.target.value)} data-testid="input-lead-warranty" /></div><Button type="submit" data-testid="button-submit-lead-quote" disabled={mutation.isPending} className="mt-6 w-full">Submit quote</Button></form></div>}</CompanyShell>;
}

function AdminDashboard() {
  const query = useGetAdminDashboard({ query: { queryKey: getGetAdminDashboardQueryKey() } });
  const d = query.data;
  const metrics = [{ label: 'Customers', value: d?.totalCustomers ?? 0, icon: Users }, { label: 'Companies', value: d?.totalCompanies ?? 0, icon: Building2 }, { label: 'Projects', value: d?.totalProjects ?? 0, icon: Sun }, { label: 'Pending verification', value: d?.pendingVerifications ?? 0, icon: ShieldCheck }];
  return <AdminShell><PageHeader eyebrow="Admin console" title="Keep the marketplace healthy." description="A view of the people, companies, and projects moving through enrg." /><QueryState loading={query.isLoading} error={query.error} onRetry={() => query.refetch()}><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{metrics.map(metric => <div key={metric.label} className="rounded-2xl border border-border bg-card p-5"><span className="grid size-9 place-items-center rounded-xl bg-secondary text-accent"><metric.icon size={18} /></span><p data-testid={`text-admin-${metric.label.toLowerCase().replaceAll(' ', '-')}`} className="mt-5 font-display text-4xl font-bold">{metric.value}</p><p className="mt-1 text-sm text-muted-foreground">{metric.label}</p></div>)}</div><div className="mt-7 rounded-3xl border border-border bg-card p-6"><div className="flex items-center justify-between"><h2 className="font-display text-xl font-bold">Recently joined companies</h2><Link href="/admin/management" data-testid="link-admin-management" className="text-sm font-bold text-accent">View all</Link></div><div className="mt-4 grid gap-3">{(d?.recentCompanies || []).map(company => <CompanyRow key={company.id} company={company} />)}</div>{!d?.recentCompanies?.length && <p className="py-8 text-center text-sm text-muted-foreground">No recent companies to review.</p>}</div></QueryState></AdminShell>;
}

function CompanyRow({ company, action }: { company: Company; action?: React.ReactNode }) {
  return <div data-testid={`row-company-${company.id}`} className="flex flex-col gap-3 rounded-2xl bg-secondary/60 p-4 sm:flex-row sm:items-center sm:justify-between"><div className="flex items-center gap-3"><span className="grid size-10 place-items-center rounded-xl bg-accent text-accent-foreground"><Building2 size={18} /></span><div><p data-testid={`text-company-name-${company.id}`} className="font-semibold">{company.name}</p><p className="text-xs text-muted-foreground">{company.location || 'Location pending'} · {company.projectsCompleted || 0} projects</p></div></div><div className="flex items-center gap-3">{company.verificationBadges?.length ? <StatusPill status="verified" /> : <StatusPill status="pending" />}{action}</div></div>;
}

function AdminManagement() {
  const query = useGetAdminManagement({ query: { queryKey: getGetAdminManagementQueryKey() } });
  const customerQuery = useListCustomers({ page: 1, limit: 50 }, { query: { queryKey: getListCustomersQueryKey({ page: 1, limit: 50 }) } });
  const verify = useVerifyCompany();
  const [tab, setTab] = useState<'companies' | 'customers'>('companies');
  const [filter, setFilter] = useState('');
  const data = query.data;
  const companies = (data?.companies || []).filter(c => c.name.toLowerCase().includes(filter.toLowerCase()));
  const customers = (customerQuery.data?.items || []).filter(c => (c.name || '').toLowerCase().includes(filter.toLowerCase()) || c.mobile.includes(filter));
  return <AdminShell><PageHeader eyebrow="Management" title="The people behind the progress." description="Review marketplace participants and keep trust signals up to date." /><div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div className="flex rounded-xl bg-secondary p-1"><button data-testid="button-management-companies" onClick={() => setTab('companies')} className={`rounded-lg px-4 py-2 text-sm font-bold ${tab === 'companies' ? 'bg-card text-accent shadow-sm' : 'text-muted-foreground'}`}>Companies</button><button data-testid="button-management-customers" onClick={() => setTab('customers')} className={`rounded-lg px-4 py-2 text-sm font-bold ${tab === 'customers' ? 'bg-card text-accent shadow-sm' : 'text-muted-foreground'}`}>Customers</button></div><label className="relative"><Search className="absolute left-3 top-2.5 text-muted-foreground" size={16} /><input data-testid="input-management-search" value={filter} onChange={e => setFilter(e.target.value)} placeholder={`Search ${tab}`} className="h-10 w-full rounded-full border border-input bg-card pl-9 pr-3 text-sm outline-none focus:border-accent sm:w-60" /></label></div><QueryState loading={query.isLoading} error={query.error} onRetry={() => query.refetch()} empty={!query.isLoading && !query.error && (tab === 'companies' ? companies.length : customers.length) === 0} emptyText={`No ${tab} found.`}><div className="grid gap-3">{tab === 'companies' ? companies.map(company => <CompanyRow key={company.id} company={company} action={<>{!company.verificationBadges?.includes('Business Verified') && <Button data-testid={`button-verify-company-${company.id}`} variant="quiet" className="px-3 py-2 text-xs" disabled={verify.isPending} onClick={() => verify.mutate({ data: { companyId: company.id, verificationBadges: ['Business Verified'] } }, { onSuccess: () => queryClient.invalidateQueries({ queryKey: getGetAdminManagementQueryKey() }) })}><BadgeCheck size={14} /> Verify</Button>}</>} />) : customers.map(customer => <div key={customer.id} data-testid={`row-customer-${customer.id}`} className="flex flex-col gap-2 rounded-2xl border border-border bg-card p-4 sm:flex-row sm:items-center sm:justify-between"><div><p data-testid={`text-customer-name-${customer.id}`} className="font-semibold">{customer.name || 'Unnamed customer'}</p><p className="text-xs text-muted-foreground">{customer.mobile} · {customer.location || 'Location pending'}</p></div><div className="text-left sm:text-right"><p className="font-display font-bold">{money(customer.monthlyBillAmount)}</p><p className="text-xs text-muted-foreground">{customer.requiredSystemSize || 'Size not set'}</p></div></div>)}</div></QueryState></AdminShell>;
}

function AdminShell({ children }: { children: React.ReactNode }) {
  return <div className="mx-auto max-w-[1320px] px-5 py-10 lg:px-8 lg:py-14"><div className="mb-8 flex items-center gap-2 overflow-x-auto border-b border-border pb-3"><PanelLeft size={18} className="mr-2 text-accent" />{[{ href: '/admin/dashboard', label: 'Overview' }, { href: '/admin/management', label: 'Management' }].map(item => <Link key={item.href} href={item.href} data-testid={`link-admin-${item.label.toLowerCase()}`} className="whitespace-nowrap rounded-full px-3 py-2 text-sm font-semibold text-muted-foreground hover:bg-secondary hover:text-foreground">{item.label}</Link>)}</div>{children}</div>;
}

function AppRouter() {
  return <AppShell><Switch><Route path="/" component={LandingPage} /><Route path="/marketplace" component={Marketplace} /><Route path="/quote" component={QuotePage} /><Route path="/customer/dashboard" component={CustomerDashboard} /><Route path="/register" component={Register} /><Route path="/signup" component={Signup} /><Route path="/signin" component={Signin} /><Route path="/company/profile" component={CompanyProfile} /><Route path="/company/leads" component={CompanyLeads} /><Route path="/company/docs" component={CompanyDocs} /><Route path="/company/dashboard" component={CompanyDashboard} /><Route path="/admin/dashboard" component={AdminDashboard} /><Route path="/admin/management" component={AdminManagement} /><Route component={NotFound} /></Switch></AppShell>;
}

function Router() {
  const [location] = useLocation();
  return <ErrorBoundary resetKey={location}><AppRouter /></ErrorBoundary>;
}

export default function App() {
  return <QueryClientProvider client={queryClient}><TooltipProvider><WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}><Router /></WouterRouter><Toaster /></TooltipProvider></QueryClientProvider>;
}