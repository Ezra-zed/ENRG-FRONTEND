import { useMutation, useQuery } from '@tanstack/react-query';

export type SystemPreference = 'on-grid' | 'off-grid' | 'hybrid-grid';
export type ProductCategory = 'solar-module' | 'inverter' | 'cable' | 'structure' | 'BOS';
export type PropertyType = 'residential' | 'commercial' | 'industrial' | 'other';
export type SigninInputMethod = 'JWT-auth' | 'no-password' | 'O-auth';
export type SignupInputRole = 'user' | 'install-co' | 'seller-co';
export type LeadStatus = 'new' | 'accepted' | 'contacted' | 'site-visit' | 'quote-submitted' | 'won' | 'lost';
export type VerificationInputVerificationBadgesItem = 'Business Verified';

export type Company = {
  id: string;
  name: string;
  location?: string;
  projectsCompleted?: number;
  verificationBadges?: string[];
};

export type Customer = {
  id: string;
  name: string;
  mobile: string;
  location?: string;
  monthlyBillAmount?: number;
  requiredSystemSize?: string;
};

export type Lead = {
  id: string;
  customerName: string;
  location: string;
  createdAt?: string;
  systemSize?: string;
  monthlyBill?: number;
  status: LeadStatus;
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

export const getGetHomeContentQueryKey = ({ type }: { type: SystemPreference }) => ['home-content', type];
export const getListMarketplaceProductsQueryKey = (params: Record<string, unknown>) => ['marketplace-products', params];
export const getListProjectQuotesQueryKey = (id: string) => ['project-quotes', id];
export const getListCustomersQueryKey = (params: Record<string, unknown>) => ['customers', params];
export const getGetCompanyMetricsQueryKey = () => ['company-metrics'];
export const getListCompanyLeadsQueryKey = (params: Record<string, unknown>) => ['company-leads', params];
export const getGetAdminDashboardQueryKey = () => ['admin-dashboard'];
export const getGetAdminManagementQueryKey = () => ['admin-management'];

const makeDelay = () => 350;
const withLatency = <T>(value: T): Promise<T> => new Promise((resolve) => setTimeout(() => resolve(value), makeDelay()));

const fallbackHome = {
  'on-grid': {
    headline: 'Your rooftop, working smarter.',
    description: 'See what fits your home, your habits, and the way power reaches you.',
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

const mockProducts: Product[] = [
  { id: 'p1', name: 'Monocrystalline Rooftop Panel', description: 'High-output solar module for residential rooftops.', category: 'solar-module', price: 6800, unit: 'panel', badge: 'Best seller' },
  { id: 'p2', name: 'Hybrid Solar Inverter', description: 'Smart inverter for grid-tied and backup use.', category: 'inverter', price: 54000, unit: 'unit' },
  { id: 'p3', name: 'MC4 Solar Cable Kit', description: 'Weather-safe cable set for rooftop installation.', category: 'cable', price: 2200, unit: 'kit' },
  { id: 'p4', name: 'Galvanized Roof Structure', description: 'Durable mounting structure designed for Indian rooftops.', category: 'structure', price: 16500, unit: 'set' },
  { id: 'p5', name: 'Complete BOS Pack', description: 'Balance of system essentials for large commercial installs.', category: 'BOS', price: 31000, unit: 'pack' },
  { id: 'p6', name: 'Battery Backup Module', description: 'Compact backup unit for hybrid energy systems.', category: 'inverter', price: 72000, unit: 'unit' },
];

const mockCompanyMetrics = {
  totalLeads: 48,
  activeLeads: 12,
  quotesSubmitted: 16,
  wonProjects: 7,
  pipelineValue: 1250000,
};

const mockAdminDashboard = {
  totalCustomers: 112,
  totalCompanies: 34,
  totalProjects: 68,
  pendingVerifications: 5,
  recentCompanies: [
    { id: 'c1', name: 'Sunrise Solar Co.', location: 'Pune', projectsCompleted: 23, verificationBadges: ['Business Verified'] },
    { id: 'c2', name: 'Mira Energy', location: 'Bengaluru', projectsCompleted: 17 },
    { id: 'c3', name: 'GreenGrid Installations', location: 'Ahmedabad', projectsCompleted: 11, verificationBadges: ['Business Verified'] },
  ],
};

const mockManagement = {
  companies: [
    { id: 'c1', name: 'Sunrise Solar Co.', location: 'Pune', projectsCompleted: 23, verificationBadges: ['Business Verified'] },
    { id: 'c2', name: 'Mira Energy', location: 'Bengaluru', projectsCompleted: 17 },
    { id: 'c3', name: 'GreenGrid Installations', location: 'Ahmedabad', projectsCompleted: 11, verificationBadges: ['Business Verified'] },
  ],
  customers: [
    { id: 'u1', name: 'Aarav Sharma', mobile: '+91 98765 43210', location: 'Pune', monthlyBillAmount: 4200, requiredSystemSize: '3.5 kW' },
    { id: 'u2', name: 'Neha Patel', mobile: '+91 98111 22334', location: 'Surat', monthlyBillAmount: 5100, requiredSystemSize: '5 kW' },
  ],
};

const mockLeads: Lead[] = [
  { id: 'l1', customerName: 'Aarav Sharma', location: 'Pune', createdAt: '2025-01-12T09:00:00.000Z', systemSize: '3.5 kW', monthlyBill: 4200, status: 'new' },
  { id: 'l2', customerName: 'Meera Iyer', location: 'Bengaluru', createdAt: '2025-01-14T11:15:00.000Z', systemSize: '5 kW', monthlyBill: 5100, status: 'accepted' },
  { id: 'l3', customerName: 'Rahul Singh', location: 'Jaipur', createdAt: '2025-01-18T16:40:00.000Z', systemSize: '2.2 kW', monthlyBill: 2600, status: 'contacted' },
];

export function useHealthCheck() {
  return useQuery({ queryKey: ['health'], queryFn: () => withLatency({ ok: true }) });
}

export function useGetHomeContent({ type }: { type: SystemPreference }, options?: { query?: { queryKey?: unknown[] } }) {
  return useQuery({
    queryKey: options?.query?.queryKey ?? getGetHomeContentQueryKey({ type }),
    queryFn: () => withLatency(fallbackHome[type]),
  });
}

export function useListMarketplaceProducts(params: Record<string, unknown>, options?: { query?: { queryKey?: unknown[] } }) {
  return useQuery({
    queryKey: options?.query?.queryKey ?? getListMarketplaceProductsQueryKey(params),
    queryFn: async () => {
      const items = [...mockProducts].sort((a, b) => (b.price ?? 0) - (a.price ?? 0));
      return withLatency({ items });
    },
  });
}

export function useRequestProjectQuote() {
  return useMutation({
    mutationFn: async ({ data }: { data: any }) => withLatency({ id: `PRJ-${Math.random().toString(36).slice(2, 8).toUpperCase()}`, ...data }),
  });
}

export function useListProjectQuotes(id: string, options?: { query?: { enabled?: boolean; queryKey?: unknown[] } }) {
  return useQuery({
    queryKey: options?.query?.queryKey ?? getListProjectQuotesQueryKey(id),
    enabled: options?.query?.enabled ?? Boolean(id),
    queryFn: () => withLatency([
      { id: 'quote-1', companyName: 'Sunrise Solar Co.', estimatedPrice: 260000, warrantyYears: 8 },
      { id: 'quote-2', companyName: 'GreenGrid Installations', estimatedPrice: 285000, warrantyYears: 10 },
    ]),
  });
}

export function useRegisterCustomer() {
  return useMutation({
    mutationFn: async ({ data }: { data: any }) => withLatency({ ok: true, ...data }),
  });
}

export function useSignup() {
  return useMutation({
    mutationFn: async ({ data }: { data: any }) => withLatency({ user: { id: 'user-1', role: data.role ?? 'user', name: data.name, email: data.email } }),
  });
}

export function useSignin() {
  return useMutation({
    mutationFn: async ({ data }: { data: any }) => withLatency({ user: { id: 'user-1', role: data.email === 'admin@example.com' ? 'admin' : 'user', name: 'Demo User', email: data.email ?? 'demo@example.com' } }),
  });
}

export function useCreateCompanyProfile() {
  return useMutation({
    mutationFn: async ({ data }: { data: any }) => withLatency({ ok: true, ...data }),
  });
}

export function useUpdateCompanyLead() {
  return useMutation({
    mutationFn: async ({ data }: { data: any }) => withLatency({ ok: true, ...data }),
  });
}

export function useGetCompanyMetrics(options?: { query?: { queryKey?: unknown[] } }) {
  return useQuery({
    queryKey: options?.query?.queryKey ?? getGetCompanyMetricsQueryKey(),
    queryFn: () => withLatency(mockCompanyMetrics),
  });
}

export function useListCompanyLeads(params: Record<string, unknown>, options?: { query?: { queryKey?: unknown[] } }) {
  return useQuery({
    queryKey: options?.query?.queryKey ?? getListCompanyLeadsQueryKey(params),
    queryFn: () => withLatency({ items: mockLeads }),
  });
}

export function useGetAdminDashboard(options?: { query?: { queryKey?: unknown[] } }) {
  return useQuery({
    queryKey: options?.query?.queryKey ?? getGetAdminDashboardQueryKey(),
    queryFn: () => withLatency(mockAdminDashboard),
  });
}

export function useGetAdminManagement(options?: { query?: { queryKey?: unknown[] } }) {
  return useQuery({
    queryKey: options?.query?.queryKey ?? getGetAdminManagementQueryKey(),
    queryFn: () => withLatency(mockManagement),
  });
}

export function useListCustomers(params: Record<string, unknown>, options?: { query?: { queryKey?: unknown[] } }) {
  return useQuery({
    queryKey: options?.query?.queryKey ?? getListCustomersQueryKey(params),
    queryFn: () => withLatency({ items: mockManagement.customers }),
  });
}

export function useVerifyCompany() {
  return useMutation({
    mutationFn: async ({ data }: { data: any }) => withLatency({ ok: true, ...data }),
  });
}
