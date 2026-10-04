import { QueryClientProvider } from '@tanstack/react-query';
import { Router as WouterRouter } from 'wouter';
import { AuthProvider } from '@/auth/auth-context';
import { queryClient } from '@/app/query-client';
import { Router } from '@/app/router';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';


export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
            <Router />
          </WouterRouter>
        </AuthProvider>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}
