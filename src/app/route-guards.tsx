import React, { useEffect } from 'react';
import { Redirect, useLocation } from 'wouter';
import { getAccountPath, useAuth } from '@/auth/auth-context';
import { PageLoadingState } from '@/components/PageLoadingState';


export function ProtectedRoute({ children, requiredRole }: { children: React.ReactNode; requiredRole?: string }) {
  const { user, loading } = useAuth();
  const [location] = useLocation();
  if (loading) {
    return <PageLoadingState message="Checking your session…" />;
  }
  if (!user) return <Redirect to={`/signin?returnTo=${encodeURIComponent(location)}`} />;
  if (requiredRole && user.role !== requiredRole) return <Redirect to={getAccountPath(user)} />;
  return <>{children}</>;
}

export function DashboardRedirect() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  useEffect(() => {
    if (user) setLocation(getAccountPath(user));
  }, [setLocation, user]);
  return <PageLoadingState message="Opening your dashboard…" />;
}
