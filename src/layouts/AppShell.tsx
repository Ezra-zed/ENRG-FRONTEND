import { useEffect, useState, type ReactNode } from 'react';
import { Link, useLocation } from 'wouter';
import { FaFacebookF, FaInstagram, FaLinkedinIn } from 'react-icons/fa';
import { FaXTwitter } from 'react-icons/fa6';
import { BarChart3, Building2, ClipboardList, FileText, Home as HomeIcon, Menu, PanelLeft, ShoppingBag, Users, X, Zap } from 'lucide-react';
import { useHealthCheck } from '@workspace/api-client-react';
import { getAccountPath, useAuth } from '@/auth/auth-context';
import { Logo } from '@/components/Logo';

const primaryNav = [
  { href: '/', label: 'Home', icon: HomeIcon },
  { href: '/companies', label: 'Companies', icon: Building2 },
  { href: '/estimator', label: 'Solar estimator', icon: Zap },
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
const socialLinks = {
  instagram: (import.meta as any).env?.VITE_INSTAGRAM_URL || undefined,
  facebook: (import.meta as any).env?.VITE_FACEBOOK_URL || undefined,
  linkedin: (import.meta as any).env?.VITE_LINKEDIN_URL || undefined,
  x: (import.meta as any).env?.VITE_X_PROFILE_URL || undefined,
};


export function AppShell({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [healthCheckReady, setHealthCheckReady] = useState(false);
  const { user, signOut, error: authError } = useAuth();
  const [location, setLocation] = useLocation();
  useEffect(() => {
    const idleWindow = window as Window & {
      requestIdleCallback?: (callback: IdleRequestCallback, options?: IdleRequestOptions) => number;
      cancelIdleCallback?: (handle: number) => void;
    };
    if (idleWindow.requestIdleCallback) {
      const handle = idleWindow.requestIdleCallback(() => setHealthCheckReady(true), { timeout: 2500 });
      return () => idleWindow.cancelIdleCallback?.(handle);
    }
    const handle = window.setTimeout(() => setHealthCheckReady(true), 1200);
    return () => window.clearTimeout(handle);
  }, []);
  const logout = async () => {
    await signOut();
    setOpen(false);
    setLocation('/');
  };
  const isCompany = Boolean(user && user.role !== 'user' && user.role !== 'admin');
  const visibleNav = isCompany ? companyNav : user?.role === 'admin' ? adminNav : primaryNav;
  return (
    <div className="texture min-h-[100dvh] bg-background">
      <header className="sticky top-0 z-40 border-b border-border/70 bg-background/90 backdrop-blur-xl">
        <div className="mx-auto flex h-[72px] max-w-[1320px] items-center justify-between px-5 lg:px-8">
          <div className="flex items-center gap-9">
            <Logo />
            <nav className="hidden items-center gap-2 md:flex">
              {visibleNav.map((item) => {
                const active = location === item.href || (item.href !== '/' && location.startsWith(`${item.href}/`));
                return (
                  <Link key={item.href} href={item.href} data-testid={`link-nav-${item.label.toLowerCase().replaceAll(' ', '-')}`} className={`rounded-full px-3.5 py-2 text-sm font-semibold ${active ? 'bg-[#dfece0] text-accent shadow-sm' : 'text-muted-foreground hover:bg-secondary hover:text-foreground'}`}>
                    {active && <span className="mr-2 inline-block size-1.5 rounded-full bg-primary align-middle" />}
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>
          <div className="flex items-center gap-2.5">
            {user ? (
              <>
                <Link href={getAccountPath(user)} data-testid="link-account" className="rounded-full bg-accent px-4 py-2.5 text-sm font-semibold text-accent-foreground hover:-translate-y-0.5 hover:shadow-lg">
                  My account
                </Link>
                <button type="button" data-testid="button-logout" onClick={logout} className="hidden rounded-full border border-border px-3.5 py-2 text-sm font-semibold text-muted-foreground hover:border-accent hover:text-accent sm:block">
                  Log out
                </button>
              </>
            ) : (
              <>
                <Link href="/signin" data-testid="link-signin" className="hidden rounded-full px-3.5 py-2 text-sm font-semibold text-muted-foreground hover:bg-secondary hover:text-foreground sm:block">
                  Sign in
                </Link>
                <Link href="/signup" data-testid="link-signup" className="rounded-full bg-accent px-4 py-2.5 text-sm font-semibold text-accent-foreground hover:-translate-y-0.5 hover:shadow-lg">
                  Join ENRG
                </Link>
              </>
            )}
            <button aria-label="Open navigation" data-testid="button-open-navigation" onClick={() => setOpen(!open)} className="rounded-xl p-2.5 hover:bg-secondary md:hidden">
              {open ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
        {open && (
          <div className="border-t border-border bg-card p-4 md:hidden">
            <div className="grid gap-1">
              {visibleNav.map((item) => {
                const active = location === item.href || (item.href !== '/' && location.startsWith(`${item.href}/`));
                return (
                  <Link key={item.href} href={item.href} data-testid={`link-mobile-${item.label.toLowerCase().replaceAll(' ', '-')}`} onClick={() => setOpen(false)} className={`rounded-xl px-3 py-3 text-sm font-semibold ${active ? 'bg-[#dfece0] text-accent' : 'hover:bg-secondary'}`}>
                    {item.label}
                  </Link>
                );
              })}
              {user && (
                <button type="button" data-testid="button-mobile-logout" onClick={logout} className="mt-2 rounded-xl px-3 py-3 text-left text-sm font-semibold text-muted-foreground hover:bg-secondary">
                  Log out
                </button>
              )}
            </div>
          </div>
        )}
      </header>
      {authError && location !== '/signin' && (
        <div className="mx-auto max-w-[1320px] px-5 pt-4 lg:px-8">
          <p className="rounded-xl border border-[#e4b5aa] bg-[#fff2ef] p-3 text-sm text-[#8d3f34]">{authError}</p>
        </div>
      )}
      <main>{children}</main>
      {healthCheckReady && <HealthCheckProbe />}
      <footer className="border-t border-border bg-[#e7efe8]">
        <div className="mx-auto flex max-w-[1320px] flex-col gap-8 px-5 py-10 sm:flex-row sm:items-end sm:justify-between lg:px-8">
          <div>
            <Logo />
            <p className="mt-3 max-w-xs text-sm leading-6 text-muted-foreground">ENRG Solar Solution makes the move to clean energy clearer.</p>
          </div>
          <div className="flex flex-col gap-5 sm:items-end">
            <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm font-semibold text-muted-foreground">
              <Link href="/marketplace" data-testid="link-footer-marketplace">
                Marketplace
              </Link>
              <Link href="/quote" data-testid="link-footer-quote">
                Get a quote
              </Link>
              <Link href="/signup" data-testid="link-footer-company">
                For companies
              </Link>
              <Link href="/terms-and-conditions">Terms &amp; Conditions</Link>
              <Link href="/privacy-policy">Privacy Policy</Link>
            </div>
            <nav aria-label="Social media" className="flex items-center gap-2">
              <a href={socialLinks.instagram} target={socialLinks.instagram ? '_blank' : undefined} rel={socialLinks.instagram ? 'noopener noreferrer' : undefined} aria-label="ENRG Solar India on Instagram" title="Instagram" aria-disabled={!socialLinks.instagram} className="flex size-10 items-center justify-center rounded-full border border-white/20 text-white/80 hover:border-white/50 hover:text-white aria-disabled:cursor-not-allowed aria-disabled:opacity-60">
                <FaInstagram aria-hidden="true" size={18} />
              </a>
              <a href={socialLinks.facebook} target={socialLinks.facebook ? '_blank' : undefined} rel={socialLinks.facebook ? 'noopener noreferrer' : undefined} aria-label="ENRG Solar India on Facebook" title="Facebook" aria-disabled={!socialLinks.facebook} className="flex size-10 items-center justify-center rounded-full border border-white/20 text-white/80 hover:border-white/50 hover:text-white aria-disabled:cursor-not-allowed aria-disabled:opacity-60">
                <FaFacebookF aria-hidden="true" size={16} />
              </a>
              <a href={socialLinks.linkedin} target={socialLinks.linkedin ? '_blank' : undefined} rel={socialLinks.linkedin ? 'noopener noreferrer' : undefined} aria-label="ENRG Solar India on LinkedIn" title="LinkedIn" aria-disabled={!socialLinks.linkedin} className="flex size-10 items-center justify-center rounded-full border border-white/20 text-white/80 hover:border-white/50 hover:text-white aria-disabled:cursor-not-allowed aria-disabled:opacity-60">
                <FaLinkedinIn aria-hidden="true" size={18} />
              </a>
              <a href={socialLinks.x} target={socialLinks.x ? '_blank' : undefined} rel={socialLinks.x ? 'noopener noreferrer' : undefined} aria-label="ENRG on X" title={socialLinks.x ? 'X' : 'X profile coming soon'} aria-disabled={!socialLinks.x} className="flex size-10 items-center justify-center rounded-full border border-white/20 text-white/80 hover:border-white/50 hover:text-white aria-disabled:cursor-not-allowed aria-disabled:opacity-60">
                <FaXTwitter aria-hidden="true" size={17} />
              </a>
            </nav>
          </div>
        </div>
      </footer>
    </div>
  );
}

function HealthCheckProbe() {
  useHealthCheck();
  return null;
}
