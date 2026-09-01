import { useMutation, useQuery } from '@tanstack/react-query';

// ---------------------------------------------------------------------------
// Shared contract types for the ENRG backend (http://localhost:5000).
// The backend wraps every response as { success, data, message, error }.
// ---------------------------------------------------------------------------

export type SystemPreference = 'on-grid' | 'off-grid' | 'hybrid-grid';
export type ProductCategory = 'solar-module' | 'inverter' | 'cable' | 'structure' | 'BOS';
export type PropertyType = 'residential' | 'commercial' | 'industrial' | 'other';
export type SigninInputMethod = 'JWT-auth' | 'no-password' | 'O-auth';
export type SignupInputRole = 'user' | 'install-co' | 'seller-co';
export type LeadStatus = 'new' | 'accepted' | 'contacted' | 'site-visit' | 'quote-submitted' | 'won' | 'lost' | 'rejected';
export type VerificationInputVerificationBadgesItem = 'Business Verified';

export type Company = {
  id: string;
  name: string;
  location?: string;
  projectsCompleted?: number;
  verificationBadges?: string[];
  email?: string;
  role?: string;
  rating?: number;
};

export type Customer = {
  id: string;
  name: string;
  mobile: string;
  location?: string;
  monthlyBillAmount?: number;
  requiredSystemSize?: string;
};

export type LeadQuote = {
  estimatedPrice?: number;
  warrantyYears?: number;
  notes?: string;
  submittedAt?: string;
};

export type Lead = {
  id: string;
  customerName: string;
  location: string;
  createdAt?: string;
  systemSize?: string;
  monthlyBill?: number;
  status: LeadStatus;
  quote?: LeadQuote | null;
};

export type Product = {
  id: string;
  name: string;
  description: string;
  category: ProductCategory;
  price?: number;
  unit?: string;
  imageUrl?: string;
  badge?: string;
};

// ---------------------------------------------------------------------------
// Query-key helpers (kept stable so invalidations shared by the app keep working)
// ---------------------------------------------------------------------------

export const getGetHomeContentQueryKey = ({ type }: { type: SystemPreference }) => ['home-content', type];
export const getListMarketplaceProductsQueryKey = (params: Record<string, unknown>) => ['marketplace-products', params];
export const getListProjectQuotesQueryKey = (id: string) => ['project-quotes', id];
export const getListCustomersQueryKey = (params: Record<string, unknown>) => ['customers', params];
export const getGetCompanyMetricsQueryKey = () => ['company-metrics'];
export const getListCompanyLeadsQueryKey = (params: Record<string, unknown>) => ['company-leads', params];
export const getGetAdminDashboardQueryKey = () => ['admin-dashboard'];
export const getGetAdminManagementQueryKey = () => ['admin-management'];

// ---------------------------------------------------------------------------
// HTTP plumbing — talks to the ENRG backend directly.
// VITE_API_URL (default http://localhost:5000) configures the base host.
// ---------------------------------------------------------------------------

const API_BASE_URL: string =
  (import.meta as any).env?.VITE_API_URL || 'http://localhost:5000';

const TOKEN_KEY = 'enrg_token';

function getStoredToken(): string | null {
  if (typeof localStorage === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}

function storeToken(token?: string | null): void {
  if (typeof localStorage === 'undefined') return;
  if (token) localStorage.setItem(TOKEN_KEY, token);
}

type ApiEnvelope<T> = {
  success: boolean;
  data: T;
  message?: string;
  error?: unknown;
};

type RequestOptions = {
  method?: string;
  json?: unknown;      // JSON body — serialised & sent with Content-Type: application/json
  formData?: FormData; // multipart/form-data body
};

/**
 * Thin fetch wrapper around the backend's unified envelope:
 *   { success: boolean, data: T, message: string, error: any }
 * Throws an Error(message) on HTTP errors or `success: false` responses.
 * A stored JWT is attached as `Authorization: Bearer <token>` automatically.
 */
async function apiFetch<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const headers: Record<string, string> = {
    Accept: 'application/json',
  };
  const token = getStoredToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  let body: BodyInit | undefined;
  if (options.formData) {
    body = options.formData;
  } else if (options.json !== undefined) {
    headers['Content-Type'] = 'application/json';
    body = JSON.stringify(options.json);
  }

  const res = await fetch(`${API_BASE_URL}${path}`, {
    method: options.method || 'GET',
    headers,
    body,
  });

  let envelope: ApiEnvelope<T> | null = null;
  try {
    envelope = (await res.json()) as ApiEnvelope<T>;
  } catch {
    envelope = null;
  }

  if (!res.ok || !envelope?.success) {
    throw new Error(
      envelope?.message || res.statusText || `Request failed (${res.status})`,
    );
  }

  return envelope.data;
}

/** Serialise a plain object into multipart/form-data for upload routes. */
function toFormData(data: Record<string, unknown>): FormData {
  const fd = new FormData();
  for (const [key, value] of Object.entries(data)) {
    if (value === undefined || value === null) continue;
    if (value instanceof File || value instanceof Blob) {
      fd.append(key, value);
    } else if (typeof value === 'object') {
      fd.append(key, JSON.stringify(value));
    } else {
      fd.append(key, String(value));
    }
  }
  return fd;
}

/** Build a query string from known params, skipping empty values. */
function toQueryString(params: Record<string, unknown>): string {
  const qs = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === '') continue;
    qs.append(key, String(value));
  }
  const encoded = qs.toString();
  return encoded ? `?${encoded}` : '';
}

// ---------------------------------------------------------------------------
// Response normalisers — the backend ships wire shapes, the UI expects the
// cleaner typed shapes below. Mapping happens here so components stay simple.
// ---------------------------------------------------------------------------

function normalizeProduct(raw: Record<string, any>): Product {
  const specs = raw?.specs && typeof raw.specs === 'object' ? raw.specs : {};
  const price = typeof raw?.price === 'number' ? raw.price : Number(raw?.price);
  return {
    id: (raw?.id ?? raw?._id)?.toString(),
    name: raw?.name ?? 'Untitled product',
    description:
      typeof raw?.description === 'string'
        ? raw.description
        : typeof specs.description === 'string'
          ? specs.description
          : `A ${raw?.category ?? 'solar'} product built for dependable power.`,
    category: raw?.category,
    price: Number.isFinite(price) ? price : undefined,
    unit: raw?.unit ?? specs.unit ?? 'unit',
    imageUrl: raw?.imageUrl ?? specs.imageUrl ?? undefined,
    badge: raw?.badge ?? specs.badge ?? undefined,
  };
}

function toLead(raw: Record<string, any>): Lead {
  const project = raw?.project && typeof raw.project === 'object' ? raw.project : {};
  const customer = project.customer && typeof project.customer === 'object' ? project.customer : {};
  const size = project.systemPreference
    ? String(project.systemPreference).replaceAll('-', ' ')
    : project.systemSize ?? undefined;
  return {
    id: (raw?.id ?? raw?._id)?.toString(),
    customerName: customer.name ?? raw.customerName ?? 'Customer',
    location: project.location ?? customer.location ?? 'Location pending',
    createdAt: raw?.createdAt ?? project.createdAt ?? undefined,
    systemSize: size ? `${size}` : undefined,
    monthlyBill: typeof project.monthlyBill === 'number' ? project.monthlyBill : undefined,
    status: raw?.status ?? 'new',
    quote: raw?.quote ?? null,
  };
}

function toCompany(raw: Record<string, any>): Company {
  return {
    id: (raw?.company?.id ?? raw?.id ?? raw?._id)?.toString(),
    name: raw?.company?.name ?? raw?.name ?? 'Company',
    location: raw?.serviceLocations?.[0] ?? raw?.location ?? raw?.company?.location ?? undefined,
    projectsCompleted: typeof raw?.projectsCompleted === 'number' ? raw.projectsCompleted : undefined,
    verificationBadges: raw?.verificationBadges ?? [],
    email: raw?.company?.email ?? raw?.email,
    role: raw?.company?.role ?? raw?.role,
    rating: typeof raw?.rating === 'number' ? raw.rating : undefined,
  };
}
// ---------------------------------------------------------------------------
// Queries & mutations
// ---------------------------------------------------------------------------

/** Lightweight health probe — proves the frontend can reach the backend API. */
export function useHealthCheck() {
  return useQuery({
    queryKey: ['health'],
    queryFn: async () => {
      await apiFetch<unknown>('/api/home?type=on-grid');
      return { ok: true };
    },
    retry: 1,
  });
}

const HOME_COPY = {
  'on-grid': {
    headline: 'Your rooftop, working smarter.',
    description: 'Grid-connected solar that trims your monthly bill while the city grid keeps the lights on.',
    benefits: ['Lower monthly electricity costs', 'One clear path from choice to installation', 'Support from verified local companies'],
    recommendedSize: '2–4 kW',
    startingPrice: 145000,
  },
  'off-grid': {
    headline: 'Power that stays with you.',
    description: 'Plan for independence, resilience, and the comfort of reliable power when the grid is not enough.',
    benefits: ['Battery-ready solar design', 'Energy independence for remote areas', 'Stronger backup during outages'],
    recommendedSize: '3–5 kW',
    startingPrice: 220000,
  },
  'hybrid-grid': {
    headline: 'The best of both worlds.',
    description: 'Use the grid when it helps and keep backup power ready for the times that matter most.',
    benefits: ['Grid support with battery backup', 'Reduced reliance on outages', 'More flexibility across seasons'],
    recommendedSize: '4–6 kW',
    startingPrice: 300000,
  },
} as const;

export function useGetHomeContent({ type }: { type: SystemPreference }, options?: { query?: { queryKey?: unknown[] } }) {
  return useQuery({
    queryKey: options?.query?.queryKey ?? getGetHomeContentQueryKey({ type }),
    queryFn: async () => {
      const data = await apiFetch<{ type: string; products: Record<string, any>[]; count: number }>(
        `/api/home?type=${encodeURIComponent(type)}`,
      );
      return {
        ...HOME_COPY[type],
        type: data.type,
        products: (data.products || []).map(normalizeProduct),
        count: data.count ?? 0,
      };
    },
  });
}

export function useListMarketplaceProducts(params: Record<string, unknown>, options?: { query?: { queryKey?: unknown[] } }) {
  return useQuery({
    queryKey: options?.query?.queryKey ?? getListMarketplaceProductsQueryKey(params),
    queryFn: async () => {
      const data = await apiFetch<{ items: Record<string, any>[]; pagination?: unknown }>(
        `/api/marketplace${toQueryString(params)}`,
      );
      return {
        ...data,
        items: (data.items || []).map(normalizeProduct),
      };
    },
  });
}

export function useRequestProjectQuote() {
  return useMutation({
    mutationFn: async ({ data }: { data: any }) => {
      const result = await apiFetch<{ project: { id: string } & Record<string, any>; distributedLeads?: number }>(
        '/api/projects/request',
        { method: 'POST', json: data },
      );
      // Return the project document so `onSuccess` receives `{ id, ... }`.
      return result.project;
    },
  });
}

export function useListProjectQuotes(id: string, options?: { query?: { enabled?: boolean; queryKey?: unknown[] } }) {
  return useQuery({
    queryKey: options?.query?.queryKey ?? getListProjectQuotesQueryKey(id),
    enabled: options?.query?.enabled ?? Boolean(id),
    queryFn: async () => {
      const data = await apiFetch<{ projectId: string; quotes: Record<string, any>[]; count: number }>(
        `/api/projects/${encodeURIComponent(id)}/quotes`,
      );
      return data.quotes ?? [];
    },
  });
}

export function useRegisterCustomer() {
  return useMutation({
    mutationFn: async ({ data }: { data: any }) => {
      const result = await apiFetch<{ customer: Record<string, any>; user: Record<string, any>; token?: string; userCreated?: boolean }>(
        '/api/customers/register',
        { method: 'POST', formData: toFormData(data) },
      );
      storeToken(result?.token);
      return { ok: true, ...data, ...result };
    },
  });
}
export function useSignup() {
  return useMutation({
    mutationFn: async ({ data }: { data: any }) => {
      const result = await apiFetch<{ user: Record<string, any>; token: string }>(
        '/api/signup',
        { method: 'POST', json: data },
      );
      storeToken(result?.token);
      return result;
    },
  });
}

export function useSignin() {
  return useMutation({
    mutationFn: async ({ data }: { data: any }) => {
      const result = await apiFetch<{ user: Record<string, any>; token: string }>(
        '/api/signin',
        { method: 'POST', json: data },
      );
      storeToken(result?.token);
      return result;
    },
  });
}

export function useCreateCompanyProfile() {
  return useMutation({
    mutationFn: async ({ data }: { data: any }) => {
      return apiFetch<Record<string, any>>(
        '/api/companies/profile',
        { method: 'POST', formData: toFormData(data) },
      );
    },
  });
}

export function useUpdateCompanyLead() {
  return useMutation({
    mutationFn: async ({ data }: { data: any }) => {
      const { leadId, ...body } = data || {};
      return apiFetch<Record<string, any>>(
        `/api/companies/leads/${encodeURIComponent(leadId)}`,
        { method: 'PUT', json: body },
      );
    },
  });
}

export function useGetCompanyMetrics(options?: { query?: { queryKey?: unknown[] } }) {
  return useQuery({
    queryKey: options?.query?.queryKey ?? getGetCompanyMetricsQueryKey(),
    queryFn: async () => {
      const data = await apiFetch<{
        funnel?: Array<{ label: string; value: number }>;
        totals?: Record<string, number>;
      }>('/api/companies/metrics');
      const totals = data?.totals ?? {};
      return {
        totalLeads: totals.leads ?? 0,
        activeLeads: totals.contacted ?? 0,
        quotesSubmitted: totals.quotes ?? 0,
        wonProjects: totals.projectsWon ?? 0,
        pipelineValue: undefined, // not exposed by the current backend metrics endpoint
        funnel: data?.funnel,
        totals,
      };
    },
  });
}

export function useListCompanyLeads(params: Record<string, unknown>, options?: { query?: { queryKey?: unknown[] } }) {
  return useQuery({
    queryKey: options?.query?.queryKey ?? getListCompanyLeadsQueryKey(params),
    queryFn: async () => {
      const data = await apiFetch<{ items: Record<string, any>[]; pagination?: unknown }>(
        `/api/companies/leads${toQueryString(params)}`,
      );
      return {
        ...data,
        items: (data.items || []).map(toLead),
      };
    },
  });
}

export function useGetAdminDashboard(options?: { query?: { queryKey?: unknown[] } }) {
  return useQuery({
    queryKey: options?.query?.queryKey ?? getGetAdminDashboardQueryKey(),
    queryFn: async () => {
      const dash = await apiFetch<{
        totals: Record<string, number>;
        meta?: Record<string, unknown>;
      }>('/api/admin/dashboard');
      const totals = dash?.totals ?? {};

      // The dashboard endpoint has no "recent companies" list — pull the
      // management list for that; tolerate it failing (token/permissions).
      let recentCompanies: Company[] = [];
      try {
        const mgmt = await apiFetch<{ companies: Record<string, any>[] }>('/api/admin/management');
        recentCompanies = (mgmt.companies || []).slice(0, 6).map(toCompany);
      } catch {
        recentCompanies = [];
      }

      return {
        totalCustomers: totals.totalCustomers ?? 0,
        totalCompanies: totals.totalCompanies ?? 0,
        totalProjects: (totals.activeProjects ?? 0) + (totals.completedProjects ?? 0),
        pendingVerifications: Math.max(0, (totals.totalCompanies ?? 0) - (totals.verifiedCompanies ?? 0)),
        recentCompanies,
      };
    },
  });
}

export function useGetAdminManagement(options?: { query?: { queryKey?: unknown[] } }) {
  return useQuery({
    queryKey: options?.query?.queryKey ?? getGetAdminManagementQueryKey(),
    queryFn: async () => {
      const data = await apiFetch<{
        companies: Record<string, any>[];
        complaints?: unknown[];
        payments?: unknown[];
      }>('/api/admin/management');
      return {
        ...data,
        companies: (data.companies || []).map(toCompany),
      };
    },
  });
}

export function useListCustomers(params: Record<string, unknown>, options?: { query?: { queryKey?: unknown[] } }) {
  return useQuery({
    queryKey: options?.query?.queryKey ?? getListCustomersQueryKey(params),
    queryFn: async () => {
      const data = await apiFetch<{ items: Record<string, any>[]; total?: number }>(
        `/api/customers${toQueryString(params)}`,
      );
      const items: Customer[] = (data.items || []).map((c) => ({
        id: (c._id ?? c.id)?.toString(),
        name: c.name ?? 'Unnamed customer',
        mobile: c.mobile ?? '',
        location: c.location ?? undefined,
        monthlyBillAmount: typeof c.monthlyBillAmount === 'number' ? c.monthlyBillAmount : undefined,
        requiredSystemSize: c.requiredSystemSize ?? undefined,
      }));
      return {
        items,
        total: data.total ?? items.length,
      };
    },
  });
}

export function useVerifyCompany() {
  return useMutation({
    mutationFn: async ({ data }: { data: any }) => {
      const { companyId, verificationBadges } = data || {};
      return apiFetch<Record<string, any>>(
        `/api/admin/companies/${encodeURIComponent(companyId)}/verify`,
        { method: 'PUT', json: { verificationBadges: verificationBadges ?? [] } },
      );
    },
  });
}