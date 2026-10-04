import { money } from '@/lib/format';
import React, { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { ArrowRight, BadgeCheck, Building2, FileText, MapPin, Search, Star } from 'lucide-react';
import { getListCompaniesQueryKey, useListCompanies, useGetPublicCompany, type Company } from '@workspace/api-client-react';
import { SelectItem as DropdownItem } from '@/components/ui/select';
import { EnrgSelect } from '@/components/form-controls';
import { LocationCombobox } from '@/components/LocationCombobox';
import { QueryState } from '@/components/feedback';
import { PageHeader } from '@/components/PageHeader';

export function CompanyCard({ company }: { company: Company }) {
  const companyType = company.role === 'install-co' ? 'Installer' : 'Solar provider';
  return (
    <article data-testid={`card-company-${company.id}`} className="flex h-full flex-col rounded-3xl border border-border bg-card p-6 shadow-[var(--shadow-card)] transition-transform hover:-translate-y-1">
      <div className="flex items-start justify-between gap-4">
        {company.logo ? <img src={company.logo} alt={`${company.name} logo`} className="size-12 rounded-2xl object-cover" loading="lazy" decoding="async" /> : <span className="grid size-12 place-items-center rounded-2xl bg-[#e2eee5] text-accent"><Building2 size={22} /></span>}
        {company.verified || company.verificationBadges?.length ? <span className="inline-flex items-center gap-1 rounded-full bg-[#dcefe4] px-2.5 py-1 text-[11px] font-bold text-[#21624b]"><BadgeCheck size={13} /> Verified</span> : null}
      </div>
      <p className="mt-6 text-[10px] font-bold uppercase tracking-[.16em] text-accent">{companyType}</p>
      <h2 data-testid={`text-directory-company-${company.id}`} className="mt-2 font-display text-2xl font-bold"><Link href={`/companies/${company.id}`} data-testid={`link-company-detail-${company.id}`} className="hover:text-accent">{company.name}</Link></h2>
      <div className="mt-3 flex items-center gap-1 text-sm font-semibold">
        <Star size={15} className="fill-[#d49318] text-[#d49318]" />
        {company.rating ? company.rating.toFixed(1) : 'New'}
        <span className="ml-1 font-normal text-muted-foreground">rating</span>
      </div>
      <p className="mt-4 min-h-12 text-sm leading-6 text-muted-foreground">
        {company.location || 'Serving your area'} · {company.projectsCompleted || 0} completed projects
      </p>
      <div className="mt-auto grid grid-cols-2 gap-2 pt-6">
        <Link href={`/companies/${company.id}`} className="inline-flex items-center justify-center rounded-full border border-border px-3 py-3 text-sm font-bold hover:border-accent hover:text-accent">Details</Link>
        <Link href={`/quote?companyId=${encodeURIComponent(company.id)}&companyName=${encodeURIComponent(company.name)}`} data-testid={`link-company-quote-${company.id}`} className="inline-flex items-center justify-center gap-2 rounded-full bg-accent px-3 py-3 text-sm font-bold text-accent-foreground">Get Quote <ArrowRight size={16} /></Link>
      </div>
    </article>
  );
}
export function CompaniesPage() {
  const [type, setType] = useState<'all' | 'install-co' | 'seller-co'>('all');
  const [search, setSearch] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [minRating, setMinRating] = useState('');
  const params = { page: 1, limit: 100, ...(type !== 'all' ? { role: type } : {}), ...(search.trim() ? { search: search.trim() } : {}), ...(locationFilter.trim() ? { location: locationFilter.trim() } : {}), ...(verifiedOnly ? { verified: true } : {}), ...(minRating ? { minRating } : {}) };
  const query = useListCompanies(params, {
    query: { queryKey: getListCompaniesQueryKey(params) },
  });
  const companies = query.data?.companies || [];
  return (
    <div className="mx-auto max-w-[1320px] px-5 py-10 lg:px-8 lg:py-14">
      <PageHeader
        eyebrow="Find your solar team"
        title="Solar Companies and Installers"
        description="Find solar companies, installers, and solar providers for residential and commercial solar projects."
        action={
          <Link href="/quote" className="inline-flex items-center gap-2 rounded-full bg-accent px-4 py-2.5 text-sm font-bold text-accent-foreground">
            <FileText size={16} /> Tell us about your home
          </Link>
        }
      />
      <div className="mb-6 grid gap-4 rounded-2xl border border-border bg-card p-3.5 shadow-[var(--shadow-card)] sm:p-4">
        <div role="group" aria-label="Company type" className="inline-flex w-full max-w-full overflow-x-auto rounded-xl border border-border bg-secondary/60 p-1 sm:w-fit">
          <button type="button" aria-pressed={type === 'all'} data-testid="button-company-type-all" onClick={() => setType('all')} className={`min-h-9 flex-1 whitespace-nowrap rounded-lg px-3 py-2 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1 sm:flex-none sm:px-4 sm:text-sm ${type === 'all' ? 'bg-card text-accent shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}>
            All companies
          </button>
          <button type="button" aria-pressed={type === 'install-co'} data-testid="button-company-type-installer" onClick={() => setType('install-co')} className={`min-h-9 flex-1 whitespace-nowrap rounded-lg px-3 py-2 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1 sm:flex-none sm:px-4 sm:text-sm ${type === 'install-co' ? 'bg-card text-accent shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}>
            Installers
          </button>
          <button type="button" aria-pressed={type === 'seller-co'} data-testid="button-company-type-provider" onClick={() => setType('seller-co')} className={`min-h-9 flex-1 whitespace-nowrap rounded-lg px-3 py-2 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1 sm:flex-none sm:px-4 sm:text-sm ${type === 'seller-co' ? 'bg-card text-accent shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}>
            Solar providers
          </button>
        </div>
        <div className="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-[minmax(220px,1.35fr)_minmax(190px,1.1fr)_minmax(155px,.85fr)_auto] lg:items-end">
          <label className="grid min-w-0 gap-1.5 text-xs font-semibold text-foreground">
            Search
            <span className="relative block">
              <Search aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
              <input data-testid="input-company-search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Name or city" aria-label="Search companies by name or city" className="h-10 w-full rounded-lg border border-input bg-card pl-9 pr-3 text-sm font-normal outline-none placeholder:text-muted-foreground/80 focus:border-accent focus:ring-2 focus:ring-primary/20" />
            </span>
          </label>
          <label className="grid min-w-0 gap-1.5 text-xs font-semibold text-foreground">
            Service location
            <LocationCombobox value={locationFilter} onValueChange={setLocationFilter} placeholder="Choose or search a location" ariaLabel="Filter by service location" testId="select-company-location" />
          </label>
          <label className="grid min-w-0 gap-1.5 text-xs font-semibold text-foreground">
            Minimum rating
            <EnrgSelect value={minRating} onValueChange={setMinRating} placeholder="Any rating" className="w-full font-normal">
              <DropdownItem value="3">3+ stars</DropdownItem><DropdownItem value="4">4+ stars</DropdownItem><DropdownItem value="4.5">4.5+ stars</DropdownItem>
            </EnrgSelect>
          </label>
          <label className="flex min-h-10 cursor-pointer items-center gap-2.5 rounded-lg border border-border bg-card px-3 text-sm font-medium text-foreground focus-within:border-accent focus-within:ring-2 focus-within:ring-primary/20 sm:col-span-2 lg:col-span-1">
            <input type="checkbox" checked={verifiedOnly} onChange={(event) => setVerifiedOnly(event.target.checked)} className="size-4 shrink-0 accent-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2" />
            Verified only
          </label>
        </div>
      </div>
      <p className="mb-4 text-sm text-muted-foreground">{query.isLoading ? 'Finding companies…' : `${companies.length} ${companies.length === 1 ? 'company' : 'companies'} found`}</p>
      <QueryState loading={query.isLoading} error={query.error} onRetry={() => query.refetch()} empty={!query.isLoading && !query.error && companies.length === 0} emptyText="No companies match that search.">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {companies.map((company) => (
            <CompanyCard key={company.id} company={company} />
          ))}
        </div>
      </QueryState>
    </div>
  );
}
export function CompanyDetailPage() {
  const [location] = useLocation();
  const companyId = location.split('?')[0].split('/').filter(Boolean).at(-1) || '';
  const query = useGetPublicCompany(companyId);
  const company = query.data as (Company & { ratingCount?: number; installExperienceYears?: number; products?: string[]; brands?: string[]; pricingPackages?: Array<Record<string, any>>; completedProjectPhotos?: string[] }) | undefined;
  if (query.isLoading) return <div className="mx-auto max-w-5xl px-5 py-16"><QueryState loading><div /></QueryState></div>;
  if (query.error || !company) return <div className="mx-auto max-w-5xl px-5 py-16"><QueryState error={query.error || new Error('Company not found')} onRetry={() => query.refetch()}><div /></QueryState></div>;
  const quoteHref = `/quote?companyId=${encodeURIComponent(company.id)}&companyName=${encodeURIComponent(company.name)}`;
  return <div className="mx-auto max-w-5xl px-5 py-10 lg:px-8 lg:py-14">
    <Link href="/companies" className="text-sm font-bold text-accent">← All companies</Link>
    <section className="mt-5 rounded-[2rem] border border-border bg-card p-6 shadow-[var(--shadow-card)] sm:p-10">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-4">{company.logo ? <img src={company.logo} alt={`${company.name} logo`} className="size-16 rounded-2xl object-cover" /> : <span className="grid size-16 place-items-center rounded-2xl bg-[#e2eee5] text-accent"><Building2 size={28} /></span>}<div><p className="text-xs font-bold uppercase tracking-widest text-accent">{company.role === 'install-co' ? 'Solar installer' : 'Solar provider'}</p><h1 className="mt-1 font-display text-3xl font-bold sm:text-4xl">{company.name}</h1><div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">{(company.locations || []).length > 0 && <span className="flex items-center gap-1"><MapPin size={15} />{company.locations?.join(' · ')}</span>}<span className="flex items-center gap-1"><Star size={15} className="fill-[#d49318] text-[#d49318]" />{company.rating ? company.rating.toFixed(1) : 'New'}{company.ratingCount ? ` (${company.ratingCount} ratings)` : ''}</span></div></div></div>
        <div className="flex flex-wrap items-center gap-2">{company.verified || company.verificationBadges?.length ? <span className="inline-flex items-center gap-1.5 rounded-full bg-[#dcefe4] px-3 py-2 text-sm font-bold text-[#21624b]"><BadgeCheck size={16} /> Business verified</span> : <span className="rounded-full bg-secondary px-3 py-2 text-sm font-semibold text-muted-foreground">Verification pending</span>}</div>
      </div>
      <div className="mt-8 grid gap-4 sm:grid-cols-3"><div className="rounded-2xl bg-secondary/70 p-4"><p className="text-xs text-muted-foreground">Experience</p><p className="mt-1 font-display text-xl font-bold">{company.installExperienceYears || '—'}{company.installExperienceYears ? ' years' : ''}</p></div><div className="rounded-2xl bg-secondary/70 p-4"><p className="text-xs text-muted-foreground">Customer rating</p><p className="mt-1 font-display text-xl font-bold">{company.rating ? `${company.rating.toFixed(1)} / 5` : 'Not rated yet'}</p></div><div className="rounded-2xl bg-secondary/70 p-4"><p className="text-xs text-muted-foreground">Service locations</p><p className="mt-1 font-display text-xl font-bold">{company.locations?.length || 0}</p></div></div>
      {!!company.products?.length && <div className="mt-8"><h2 className="font-display text-xl font-bold">Services and products</h2><div className="mt-3 flex flex-wrap gap-2">{company.products.map((item) => <span key={item} className="rounded-full bg-secondary px-3 py-2 text-sm font-medium">{item}</span>)}</div></div>}
      {!!company.brands?.length && <div className="mt-7"><h2 className="font-display text-xl font-bold">Brands</h2><div className="mt-3 flex flex-wrap gap-2">{company.brands.map((item) => <span key={item} className="rounded-full border border-border px-3 py-2 text-sm">{item}</span>)}</div></div>}
      {!!company.pricingPackages?.length && <div className="mt-7"><h2 className="font-display text-xl font-bold">Packages</h2><div className="mt-3 grid gap-3 sm:grid-cols-2">{company.pricingPackages.map((pkg, i) => <article key={pkg.name || i} className="rounded-2xl border border-border p-4"><h3 className="font-bold">{pkg.name || `Package ${i + 1}`}</h3>{pkg.systemSize && <p className="mt-1 text-sm text-muted-foreground">{pkg.systemSize}</p>}{pkg.price && <p className="mt-2 font-display text-xl font-bold">{money(Number(pkg.price))}</p>}{pkg.description && <p className="mt-2 text-sm leading-6 text-muted-foreground">{pkg.description}</p>}</article>)}</div></div>}
      {!!company.completedProjectPhotos?.length && <div className="mt-7"><h2 className="font-display text-xl font-bold">Recent work</h2><div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">{company.completedProjectPhotos.map((photo, i) => <img key={photo} src={photo} alt={`${company.name} completed solar project ${i + 1}`} className="aspect-[4/3] w-full rounded-2xl object-cover" loading="lazy" decoding="async" />)}</div></div>}
      <Link href={quoteHref} className="mt-9 inline-flex w-full items-center justify-center gap-2 rounded-full bg-accent px-5 py-3.5 text-sm font-bold text-accent-foreground sm:w-auto">Get Quote <ArrowRight size={16} /></Link>
    </section>
  </div>;
}
