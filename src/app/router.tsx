import { lazy, Suspense, useLayoutEffect, useRef, useState } from 'react';
import { Route, Switch, useLocation } from 'wouter';
import { ErrorBoundary } from '@/components/error-boundary';
import { SEO } from '@/components/SEO';
import NotFound from '@/pages/not-found';
import { AppShell } from '@/layouts/AppShell';
import { DashboardRedirect, ProtectedRoute } from '@/app/route-guards';
import { LandingPage } from '@/pages/marketing';
import { PageLoadingState } from '@/components/PageLoadingState';


const Marketplace = lazy(() => import('@/pages/marketplace').then((module) => ({ default: module.Marketplace })));
const CompaniesPage = lazy(() => import('@/pages/companies').then((module) => ({ default: module.CompaniesPage })));
const CompanyDetailPage = lazy(() => import('@/pages/companies').then((module) => ({ default: module.CompanyDetailPage })));
const EnergyEstimatorPage = lazy(() => import('@/pages/estimator').then((module) => ({ default: module.EnergyEstimatorPage })));
const QuotePage = lazy(() => import('@/pages/customer').then((module) => ({ default: module.QuotePage })));
const CustomerDashboard = lazy(() => import('@/pages/customer').then((module) => ({ default: module.CustomerDashboard })));
const Register = lazy(() => import('@/pages/customer').then((module) => ({ default: module.Register })));
const Signup = lazy(() => import('@/pages/auth').then((module) => ({ default: module.Signup })));
const Signin = lazy(() => import('@/pages/auth').then((module) => ({ default: module.Signin })));
const CompanyProfileSetup = lazy(() => import('@/pages/company').then((module) => ({ default: module.CompanyProfileSetup })));
const CompanyProfile = lazy(() => import('@/pages/company').then((module) => ({ default: module.CompanyProfile })));
const CompanyDocs = lazy(() => import('@/pages/company').then((module) => ({ default: module.CompanyDocs })));
const CompanyLeads = lazy(() => import('@/pages/company').then((module) => ({ default: module.CompanyLeads })));
const CompanyDashboard = lazy(() => import('@/pages/company').then((module) => ({ default: module.CompanyDashboard })));
const AdminDashboard = lazy(() => import('@/pages/admin').then((module) => ({ default: module.AdminDashboard })));
const AdminManagement = lazy(() => import('@/pages/admin').then((module) => ({ default: module.AdminManagement })));
const TermsAndConditions = lazy(() => import('@/pages/policies').then((module) => ({ default: module.TermsAndConditions })));
const PrivacyPolicy = lazy(() => import('@/pages/policies').then((module) => ({ default: module.PrivacyPolicy })));
function RouteLoading() {
  return <PageLoadingState />;
}

function AppRoutes() {
  const [location] = useLocation();
  const previousLocation = useRef(location);
  const [animateRouteChange, setAnimateRouteChange] = useState(false);

  useLayoutEffect(() => {
    if (previousLocation.current === location) return;
    previousLocation.current = location;
    setAnimateRouteChange(true);
    const timeout = window.setTimeout(() => setAnimateRouteChange(false), 180);
    return () => window.clearTimeout(timeout);
  }, [location]);

  const seo = {
    title: 'ENRG | Solar Made Human',
    description: 'ENRG makes solar simpler. Compare solar equipment, find solar companies, and explore solutions for your home or business.',
    path: '/',
    noindex: false,
  };

  if (location === '/companies') {
    seo.title = 'Solar Companies | ENRG';
    seo.description = 'Find and compare solar installers and solar providers through ENRG.';
    seo.path = '/companies';
  } else if (location === '/marketplace') {
    seo.title = 'Solar Equipment Marketplace | ENRG';
    seo.description = 'Explore solar panels, inverters, cables, structures, and other solar equipment on the ENRG marketplace.';
    seo.path = '/marketplace';
  } else if (
    location === '/register' || location === '/signup' || location === '/signin' || location === '/quote' || location === '/dashboard' ||
    location.startsWith('/customer/') || location.startsWith('/company/') || location.startsWith('/admin/')
  ) {
    seo.title = 'ENRG';
    seo.description = 'ENRG solar platform.';
    seo.path = location;
    seo.noindex = true;
  } else if (location !== '/') {
    seo.title = 'ENRG';
    seo.description = 'ENRG solar platform.';
    seo.path = location;
    seo.noindex = true;
  }

  return (
    <AppShell>
      <SEO title={seo.title} description={seo.description} path={seo.path} noindex={seo.noindex} />
      <div className={animateRouteChange ? 'route-transition-enter' : undefined}>
        <Suspense fallback={<RouteLoading />}>
          <Switch>
            <Route path="/" component={LandingPage} />
            <Route path="/companies" component={CompaniesPage} />
            <Route path="/companies/:companyId" component={CompanyDetailPage} />
            <Route path="/estimator" component={EnergyEstimatorPage} />
            <Route path="/marketplace" component={Marketplace} />
            <Route path="/quote" component={() => <ProtectedRoute><QuotePage /></ProtectedRoute>} />
            <Route path="/customer/dashboard" component={() => <ProtectedRoute><CustomerDashboard /></ProtectedRoute>} />
            <Route path="/register" component={Register} />
            <Route path="/signup" component={Signup} />
            <Route path="/signin" component={Signin} />
            <Route path="/terms-and-conditions" component={TermsAndConditions} />
            <Route path="/privacy-policy" component={PrivacyPolicy} />
            <Route path="/dashboard" component={() => <ProtectedRoute><DashboardRedirect /></ProtectedRoute>} />
            <Route path="/company/profile/setup" component={() => <ProtectedRoute><CompanyProfileSetup /></ProtectedRoute>} />
            <Route path="/company/profile" component={() => <ProtectedRoute><CompanyProfile /></ProtectedRoute>} />
            <Route path="/company/leads" component={() => <ProtectedRoute><CompanyLeads /></ProtectedRoute>} />
            <Route path="/company/docs" component={() => <ProtectedRoute><CompanyDocs /></ProtectedRoute>} />
            <Route path="/company/dashboard" component={() => <ProtectedRoute><CompanyDashboard /></ProtectedRoute>} />
            <Route path="/admin/dashboard" component={() => <ProtectedRoute requiredRole="admin"><AdminDashboard /></ProtectedRoute>} />
            <Route path="/admin/management" component={() => <ProtectedRoute requiredRole="admin"><AdminManagement /></ProtectedRoute>} />
            <Route component={NotFound} />
          </Switch>
        </Suspense>
      </div>
    </AppShell>
  );
}

export function Router() {
  const [location] = useLocation();
  return <ErrorBoundary resetKey={location}><AppRoutes /></ErrorBoundary>;
}
