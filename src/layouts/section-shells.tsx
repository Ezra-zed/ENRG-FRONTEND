import { type ReactNode } from 'react';
import { Link } from 'wouter';
import { PanelLeft } from 'lucide-react';
import { Logo } from '@/components/Logo';


export function AuthLayout({ eyebrow, title, children }: { eyebrow: string; title: string; children: ReactNode }) {
  return (
    <div className="auth-layout grid min-h-[calc(100dvh-72px)] lg:grid-cols-[.85fr_1.15fr]">
      <div className="hidden bg-accent p-10 text-accent-foreground lg:flex lg:flex-col lg:justify-between">
        <Logo />
        <div>
          <p className="text-xs font-bold uppercase tracking-[.2em] text-primary">{eyebrow}</p>
          <h1 className="mt-4 max-w-md font-display text-6xl font-bold leading-[.94] tracking-tight">{title}</h1>
          <p className="mt-6 max-w-sm text-base leading-7 text-accent-foreground/70">Solar is a big decision. enrg gives you the useful context, human support, and room to choose.</p>
        </div>
        <p className="text-xs text-accent-foreground/50">enrg / clean energy, clearly</p>
      </div>
      <div className="flex items-start justify-center px-5 py-12 sm:px-10 lg:items-center">
        <div className="w-full max-w-xl">
          <div className="mb-8 lg:hidden">
            <Logo />
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}

export function CompanyShell({ children }: { children: ReactNode }) {
  return <div className="mx-auto max-w-[1320px] px-5 py-10 lg:px-8 lg:py-14">{children}</div>;
}

export function AdminShell({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto max-w-[1320px] px-5 py-10 lg:px-8 lg:py-14">
      <div className="mb-8 flex items-center gap-2 overflow-x-auto border-b border-border pb-3">
        <PanelLeft size={18} className="mr-2 text-accent" />
        {[
          { href: '/admin/dashboard', label: 'Overview' },
          { href: '/admin/management', label: 'Management' },
        ].map((item) => (
          <Link key={item.href} href={item.href} data-testid={`link-admin-${item.label.toLowerCase()}`} className="whitespace-nowrap rounded-full px-3 py-2 text-sm font-semibold text-muted-foreground hover:bg-secondary hover:text-foreground">
            {item.label}
          </Link>
        ))}
      </div>
      {children}
    </div>
  );
}
