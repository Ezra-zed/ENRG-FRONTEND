import { AdminShell } from '@/layouts/section-shells';
import { money, date } from '@/lib/format';
import { useQueryClient } from '@tanstack/react-query';
import React, { useState } from 'react';
import { Link } from 'wouter';
import { BadgeCheck, Building2, Phone, Search, ShieldCheck, Sun, Users } from 'lucide-react';
import { getGetAdminDashboardQueryKey, getGetAdminManagementQueryKey, getListCustomersQueryKey, getListAdminLeadsQueryKey, useListCustomers, useVerifyCompany, useGetAdminDashboard, useGetAdminManagement, useListAdminLeads, type Company } from '@workspace/api-client-react';
import { Button } from '@/components/form-controls';
import { PageHeader } from '@/components/PageHeader';
import { QueryState, StatusPill } from '@/components/feedback';


export function AdminDashboard() {
  const query = useGetAdminDashboard({
    query: { queryKey: getGetAdminDashboardQueryKey() },
  });
  const leadsQuery = useListAdminLeads({ page: 1, limit: 100 }, { query: { queryKey: getListAdminLeadsQueryKey({ page: 1, limit: 100 }) } });
  const [leadFilter, setLeadFilter] = useState('');
  const d = query.data;
  const metrics = [
    { label: 'Customers', value: d?.totalCustomers ?? 0, icon: Users },
    { label: 'Companies', value: d?.totalCompanies ?? 0, icon: Building2 },
    { label: 'Projects', value: d?.totalProjects ?? 0, icon: Sun },
    {
      label: 'Pending verification',
      value: d?.pendingVerifications ?? 0,
      icon: ShieldCheck,
    },
  ];
  const leads = (leadsQuery.data?.items || []).filter((lead) => `${lead.customerName} ${lead.customerPhone || ''} ${lead.location} ${lead.status}`.toLowerCase().includes(leadFilter.toLowerCase()));
  return (
    <AdminShell>
      <PageHeader eyebrow="Admin console" title="Keep the marketplace healthy." description="Monitor every project request, customer conversation, and lead moving through enrg." />
      <QueryState loading={query.isLoading} error={query.error} onRetry={() => query.refetch()}>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {metrics.map((metric) => (
            <div key={metric.label} className="rounded-2xl border border-border bg-card p-5">
              <span className="grid size-9 place-items-center rounded-xl bg-secondary text-accent">
                <metric.icon size={18} />
              </span>
              <p data-testid={`text-admin-${metric.label.toLowerCase().replaceAll(' ', '-')}`} className="mt-5 font-display text-4xl font-bold">
                {metric.value}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">{metric.label}</p>
            </div>
          ))}
        </div>
        <div className="mt-7 rounded-3xl border border-border bg-card p-6">
          <div className="flex flex-col gap-4 border-b border-border pb-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-accent">Lead monitor</p>
              <h2 className="mt-1 font-display text-2xl font-bold">All customer requests</h2>
              <p className="mt-1 text-sm text-muted-foreground">Review contact details and project requirements in one place.</p>
            </div>
            <label className="relative">
              <Search className="absolute left-3 top-2.5 text-muted-foreground" size={16} />
              <input data-testid="input-admin-lead-search" value={leadFilter} onChange={(e) => setLeadFilter(e.target.value)} placeholder="Search leads" className="h-10 w-full rounded-full border border-input bg-card pl-9 pr-3 text-sm outline-none focus:border-accent sm:w-64" />
            </label>
          </div>
          <QueryState loading={leadsQuery.isLoading} error={leadsQuery.error} onRetry={() => leadsQuery.refetch()} empty={!leadsQuery.isLoading && !leadsQuery.error && leads.length === 0} emptyText="No customer leads found.">
            <div className="mt-5 grid gap-3">
              {leads.map((lead) => (
                <article key={lead.id} data-testid={`row-admin-lead-${lead.id}`} className="rounded-2xl border border-border bg-secondary/35 p-4">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 data-testid={`text-admin-lead-customer-${lead.id}`} className="font-semibold">
                          {lead.customerName}
                        </h3>
                        <StatusPill status={lead.status} />
                      </div>
                      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                        <span className="inline-flex items-center gap-1.5">
                          <Phone size={14} />
                          {lead.customerPhone || 'Phone not provided'}
                        </span>
                        <span>{lead.location}</span>
                        <span>{date(lead.createdAt)}</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm lg:min-w-[300px] lg:text-right">
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Monthly bill</p>
                        <p className="mt-1 font-semibold">{money(lead.monthlyBill)}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">System need</p>
                        <p className="mt-1 font-semibold capitalize">{lead.systemSize || 'To assess'}</p>
                      </div>
                      {lead.quote?.estimatedPrice ? (
                        <div className="col-span-2">
                          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Latest quote</p>
                          <p className="mt-1 font-semibold">
                            {money(lead.quote.estimatedPrice)}
                            {lead.quote.warrantyYears ? ` · ${lead.quote.warrantyYears} year warranty` : ''}
                          </p>
                        </div>
                      ) : null}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </QueryState>
        </div>
        <div className="mt-7 rounded-3xl border border-border bg-card p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-xl font-bold">Recently joined companies</h2>
            <Link href="/admin/management" data-testid="link-admin-management" className="text-sm font-bold text-accent">
              View all
            </Link>
          </div>
          <div className="mt-4 grid gap-3">
            {(d?.recentCompanies || []).map((company) => (
              <CompanyRow key={company.id} company={company} />
            ))}
          </div>
          {!d?.recentCompanies?.length && <p className="py-8 text-center text-sm text-muted-foreground">No recent companies to review.</p>}
        </div>
      </QueryState>
    </AdminShell>
  );
}

export function CompanyRow({ company, action }: { company: Company; action?: React.ReactNode }) {
  return (
    <div data-testid={`row-company-${company.id}`} className="flex flex-col gap-3 rounded-2xl bg-secondary/60 p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        <span className="grid size-10 place-items-center rounded-xl bg-accent text-accent-foreground">
          <Building2 size={18} />
        </span>
        <div>
          <p data-testid={`text-company-name-${company.id}`} className="font-semibold">
            {company.name}
          </p>
          <p className="text-xs text-muted-foreground">
            {company.location || 'Location pending'} · {company.projectsCompleted || 0} projects
          </p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        {company.verificationBadges?.length ? <StatusPill status="verified" /> : <StatusPill status="pending" />}
        {action}
      </div>
    </div>
  );
}

export function AdminManagement() {
  const queryClient = useQueryClient();
  const query = useGetAdminManagement({
    query: { queryKey: getGetAdminManagementQueryKey() },
  });
  const customerQuery = useListCustomers({ page: 1, limit: 50 }, { query: { queryKey: getListCustomersQueryKey({ page: 1, limit: 50 }) } });
  const verify = useVerifyCompany();
  const [tab, setTab] = useState<'companies' | 'customers'>('companies');
  const [filter, setFilter] = useState('');
  const data = query.data;
  const companies = (data?.companies || []).filter((c) => c.name.toLowerCase().includes(filter.toLowerCase()));
  const customers = (customerQuery.data?.items || []).filter((c) => (c.name || '').toLowerCase().includes(filter.toLowerCase()) || c.mobile.includes(filter));
  return (
    <AdminShell>
      <PageHeader eyebrow="Management" title="The people behind the progress." description="Review marketplace participants and keep trust signals up to date." />
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex rounded-xl bg-secondary p-1">
          <button data-testid="button-management-companies" onClick={() => setTab('companies')} className={`rounded-lg px-4 py-2 text-sm font-bold ${tab === 'companies' ? 'bg-card text-accent shadow-sm' : 'text-muted-foreground'}`}>
            Companies
          </button>
          <button data-testid="button-management-customers" onClick={() => setTab('customers')} className={`rounded-lg px-4 py-2 text-sm font-bold ${tab === 'customers' ? 'bg-card text-accent shadow-sm' : 'text-muted-foreground'}`}>
            Customers
          </button>
        </div>
        <label className="relative">
          <Search className="absolute left-3 top-2.5 text-muted-foreground" size={16} />
          <input data-testid="input-management-search" value={filter} onChange={(e) => setFilter(e.target.value)} placeholder={`Search ${tab}`} className="h-10 w-full rounded-full border border-input bg-card pl-9 pr-3 text-sm outline-none focus:border-accent sm:w-60" />
        </label>
      </div>
      <QueryState loading={query.isLoading} error={query.error} onRetry={() => query.refetch()} empty={!query.isLoading && !query.error && (tab === 'companies' ? companies.length : customers.length) === 0} emptyText={`No ${tab} found.`}>
        <div className="grid gap-3">
          {tab === 'companies'
            ? companies.map((company) => (
                <CompanyRow
                  key={company.id}
                  company={company}
                  action={
                    <>
                      {!company.verificationBadges?.includes('Business Verified') && (
                        <Button
                          data-testid={`button-verify-company-${company.id}`}
                          variant="quiet"
                          className="px-3 py-2 text-xs"
                          disabled={verify.isPending}
                          onClick={() =>
                            verify.mutate(
                              {
                                data: {
                                  companyId: company.id,
                                  verificationBadges: ['Business Verified'],
                                },
                              },
                              {
                                onSuccess: () =>
                                  queryClient.invalidateQueries({
                                    queryKey: getGetAdminManagementQueryKey(),
                                  }),
                              },
                            )
                          }
                        >
                          <BadgeCheck size={14} /> Verify
                        </Button>
                      )}
                    </>
                  }
                />
              ))
            : customers.map((customer) => (
                <div key={customer.id} data-testid={`row-customer-${customer.id}`} className="flex flex-col gap-2 rounded-2xl border border-border bg-card p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p data-testid={`text-customer-name-${customer.id}`} className="font-semibold">
                      {customer.name || 'Unnamed customer'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {customer.mobile} · {customer.location || 'Location pending'}
                    </p>
                  </div>
                  <div className="text-left sm:text-right">
                    <p className="font-display font-bold">{money(customer.monthlyBillAmount)}</p>
                    <p className="text-xs text-muted-foreground">{customer.requiredSystemSize || 'Size not set'}</p>
                  </div>
                </div>
              ))}
        </div>
      </QueryState>
    </AdminShell>
  );
}
