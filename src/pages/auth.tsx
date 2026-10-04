import { AuthLayout } from '@/layouts/section-shells';
import { useAuth, getAuthReturnTo, getAccountPath } from '@/auth/auth-context';
import React, { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { FcGoogle } from 'react-icons/fc';
import { ArrowRight, Loader2, LogIn, Send, ShieldCheck, X } from 'lucide-react';
import { API_BASE_URL, useSignup, useSignin, SigninInputMethod, SignupInputRole } from '@workspace/api-client-react';
import { Button, Field } from '@/components/form-controls';


export function Signup() {
  const mutation = useSignup();
  const { refresh } = useAuth();
  const [, setLocation] = useLocation();
  const [location] = useLocation();
  const [role, setRole] = useState<SignupInputRole>('user');
  const [authConfirmError, setAuthConfirmError] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    businessName: '',
    gstin: '',
    licenseNumber: '',
  });
  const update = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, [key]: e.target.value });
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const returnTo = new URLSearchParams(location.split('?')[1] || '').get('returnTo');
    mutation.mutate(
      {
        data: {
          ...form,
          role,
          ...(role === 'user'
            ? {}
            : {
                businessName: form.businessName,
                gstin: form.gstin,
                licenseNumber: form.licenseNumber,
              }),
        },
      },
      {
        onSuccess: async (session) => {
          setAuthConfirmError(null);
          const currentUser = await refresh();
          const sameAccount = Boolean(currentUser && session.user && (
            (session.user.id && currentUser.id ? currentUser.id === session.user.id : currentUser.email && session.user.email && currentUser.email.toLowerCase() === session.user.email.toLowerCase())
          ));
          if (!currentUser || !sameAccount || currentUser.role !== session.user?.role || currentUser.role !== role) {
            setAuthConfirmError('Your account was created, but we could not confirm your sign-in. Check your connection and sign in to continue.');
            return;
          }
          const destination = role === 'user'
            ? getAuthReturnTo(currentUser, returnTo)
            : getAuthReturnTo(currentUser, role === 'install-co' || role === 'seller-co' ? '/company/profile/setup' : null);
          setLocation(destination);
        },
      },
    );
  };
  return (
    <AuthLayout eyebrow="Join the network" title="Your next chapter runs on sunlight.">
      <div className="mb-6">
        <p className="text-sm font-semibold">I’m joining as</p>
        <div className="mt-2 grid grid-cols-3 gap-2">
          {(
            [
              { value: 'user', label: 'Homeowner' },
              { value: 'install-co', label: 'Installer' },
              { value: 'seller-co', label: 'Seller' },
            ] as Array<{ value: SignupInputRole; label: string }>
          ).map((item) => (
            <button key={item.value} data-testid={`button-role-${item.value}`} onClick={() => setRole(item.value)} className={`rounded-xl border px-2 py-3 text-xs font-bold ${role === item.value ? 'border-accent bg-accent text-accent-foreground' : 'border-border bg-card hover:bg-secondary'}`}>
              {item.label}
            </button>
          ))}
        </div>
      </div>
      <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
        <Field required autoComplete="name" label="Full name" placeholder="Your name" value={form.name} onChange={update('name')} data-testid="input-signup-name" />
        <Field required autoComplete="email" type="email" label="Email address" placeholder="you@example.com" value={form.email} onChange={update('email')} data-testid="input-signup-email" />
        <Field required autoComplete="tel" inputMode="tel" type="tel" label="Phone number" placeholder="98765 43210" value={form.phone} onChange={update('phone')} data-testid="input-signup-phone" />
        <Field required autoComplete="new-password" type="password" label="Password" placeholder="At least 6 characters" value={form.password} onChange={update('password')} data-testid="input-signup-password" />
        {role !== 'user' && (
          <>
            <div className="sm:col-span-2">
              <Field required label="Business name" placeholder="Your company" value={form.businessName} onChange={update('businessName')} data-testid="input-signup-business" />
            </div>
            <Field required label="GSTIN" placeholder="GST number" value={form.gstin} onChange={update('gstin')} data-testid="input-signup-gstin" />
            <Field required label="License number" placeholder="Registration number" value={form.licenseNumber} onChange={update('licenseNumber')} data-testid="input-signup-license" />
          </>
        )}
        <div className="sm:col-span-2">
          {mutation.error && (
            <p data-testid="status-signup-error" className="mb-4 rounded-xl bg-[#fff2ef] p-3 text-sm text-[#8d3f34]">
              We couldn't create that account. Check your details and try again.
            </p>
          )}
          {authConfirmError && (
            <p role="alert" data-testid="status-signup-auth-error" className="mb-4 rounded-xl border border-[#e4b5aa] bg-[#fff2ef] p-3 text-sm text-[#8d3f34]">
              {authConfirmError} <Link href="/signin" className="font-bold underline">Sign in</Link>
            </p>
          )}
          <Button type="submit" data-testid="button-submit-signup" disabled={mutation.isPending} className="w-full">
            {mutation.isPending ? <Loader2 className="animate-spin" size={17} /> : <ArrowRight size={17} />} Create my account
          </Button>
          {role === 'user' && (
            <>
              <div className="my-4 flex items-center gap-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                <span className="h-px flex-1 bg-border" />
                or
                <span className="h-px flex-1 bg-border" />
              </div>
              <button
                type="button"
                data-testid="button-signup-google"
                onClick={() => window.location.assign(`${API_BASE_URL}/auth/google`)}
                className="flex w-full items-center justify-center gap-3 rounded-full border border-border bg-card px-4 py-3 text-sm font-bold text-foreground transition hover:bg-secondary"
              >
                <FcGoogle size={20} />
                Sign up with Google
              </button>
            </>
          )}
          <p className="mt-4 text-center text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link href="/signin" data-testid="link-signup-signin" className="font-bold text-accent">
              Sign in
            </Link>
          </p>
        </div>
      </form>
    </AuthLayout>
  );
}

export function LegacySignin() {
  const mutation = useSignin();
  const { refresh } = useAuth();
  const [, setLocation] = useLocation();
  const [method, setMethod] = useState<SigninInputMethod>('JWT-auth');
  const [form, setForm] = useState({
    email: '',
    password: '',
    phone: '',
    otp: '',
  });
  const update = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, [key]: e.target.value });
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const data =
      method === 'JWT-auth'
        ? { method, email: form.email, password: form.password }
        : method === 'no-password'
          ? { method, phone: form.phone, otp: form.otp }
              : undefined;
            if (!data) return;
    mutation.mutate(
      { data },
      {
        onSuccess: async (session) => {
          const currentUser = await refresh();
          if (!currentUser || currentUser.id !== session.user?.id || currentUser.role !== session.user?.role) return;
          setLocation(getAccountPath(currentUser));
        },
      },
    );
  };
  return (
    <AuthLayout eyebrow="Welcome back" title="Good to see you again.">
      <div className="mb-6 flex rounded-xl bg-secondary p-1">
        {(
          [
            { value: 'JWT-auth', label: 'Password' },
            { value: 'no-password', label: 'One-time code' },
            { value: 'O-auth', label: 'Google' },
          ] as Array<{ value: SigninInputMethod; label: string }>
        ).map((item) => (
          <button key={item.value} data-testid={`button-signin-method-${item.value}`} onClick={() => setMethod(item.value)} className={`flex-1 rounded-lg px-2 py-2 text-xs font-bold ${method === item.value ? 'bg-card text-accent shadow-sm' : 'text-muted-foreground'}`}>
            {item.label}
          </button>
        ))}
      </div>
      <form onSubmit={submit} className="grid gap-4">
        {method === 'JWT-auth' && (
          <>
            <Field required type="email" label="Email address" placeholder="you@example.com" value={form.email} onChange={update('email')} data-testid="input-signin-email" />
            <Field required type="password" label="Password" placeholder="Your password" value={form.password} onChange={update('password')} data-testid="input-signin-password" />
          </>
        )}
        {method === 'no-password' && (
          <>
            <Field required label="Mobile number" placeholder="98765 43210" value={form.phone} onChange={update('phone')} data-testid="input-signin-phone" />
            <Field required label="One-time code" placeholder="Enter code" value={form.otp} onChange={update('otp')} data-testid="input-signin-otp" />
          </>
        )}
        {method === 'O-auth' && (
          <div className="rounded-2xl bg-[#dfece0] p-5">
            <div className="flex items-center gap-3">
              <span className="grid size-10 place-items-center rounded-full bg-card font-display font-bold">G</span>
              <div>
                <p className="font-semibold">Continue with Google</p>
                <p className="text-xs text-muted-foreground">A secure sign-in without another password.</p>
              </div>
            </div>
          </div>
        )}
        {mutation.error && (
          <p data-testid="status-signin-error" className="rounded-xl bg-[#fff2ef] p-3 text-sm text-[#8d3f34]">
            Sign in was not completed. Check your details and try again.
          </p>
        )}
        <Button type="submit" data-testid="button-submit-signin" disabled={mutation.isPending} className="w-full">
          {mutation.isPending ? <Loader2 className="animate-spin" size={17} /> : <LogIn size={17} />} Continue
        </Button>
        <p className="mt-2 text-center text-sm text-muted-foreground">
          New to enrg?{' '}
          <Link href="/signup" data-testid="link-signin-signup" className="font-bold text-accent">
            Create an account
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}

export function Signin() {
  const mutation = useSignin();
  const { error: authError, refresh } = useAuth();
  const [, setLocation] = useLocation();
  const [location] = useLocation();
  const [method, setMethod] = useState<SigninInputMethod>('O-auth');
  const [form, setForm] = useState({
    email: '',
    password: '',
    phone: '',
    otp: '',
  });
  const [authConfirmError, setAuthConfirmError] = useState<string | null>(null);
  const update = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, [key]: e.target.value });
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (method === 'O-auth') {
      window.location.assign(`${API_BASE_URL}/auth/google`);
      return;
    }
    const data =
      method === 'JWT-auth'
        ? { method, email: form.email, password: form.password }
        : method === 'no-password'
          ? { method, phone: form.phone, otp: form.otp }
          : undefined;
    if (!data) return;
    mutation.mutate(
      { data },
      {
        onSuccess: async (session) => {
          setAuthConfirmError(null);
          const currentUser = await refresh();
          const returnTo = new URLSearchParams(location.split('?')[1] || '').get('returnTo');
          const sameAccount = Boolean(currentUser && session.user && (
            (session.user.id && currentUser.id ? currentUser.id === session.user.id : currentUser.email && session.user.email && currentUser.email.toLowerCase() === session.user.email.toLowerCase())
          ));
          if (!currentUser || !sameAccount || currentUser.role !== session.user?.role) {
            setAuthConfirmError('Your credentials were accepted, but we could not confirm your session. Please try again.');
            return;
          }
          setLocation(getAuthReturnTo(currentUser, returnTo));
        },
      },
    );
  };
  return (
    <div className="signin-modal-page">
      <div className="signin-modal-backdrop" />
      <section className="signin-modal" aria-label="Sign in to ENRG">
        <Link href="/" aria-label="Close sign-in" className="signin-modal-close">
          <X size={27} />
        </Link>
        <div className="signin-modal-brand">
          <span className="signin-modal-mark">
            <img src="/favicon.svg?v=5" alt="ENRG company logo" />
          </span>
          <div>
            <p className="text-xl font-bold tracking-tight">Sign in to ENRG</p>
            <p className="mt-1 text-sm text-muted-foreground">Your solar journey starts here.</p>
          </div>
        </div>
        {method === 'O-auth' && (
          <>
            <button type="button" data-testid="button-signin-method-O-auth" onClick={submit} disabled={mutation.isPending} className="signin-google-button">
              <span className="signin-google-icon">
                <FcGoogle size={20} />
              </span>
              Sign in with Google
            </button>
            <button type="button" data-testid="button-signin-email" onClick={() => setMethod('JWT-auth')} className="signin-email-button">
              <span className="signin-mail-icon">
                <Send size={18} />
              </span>
              Sign in with Email
            </button>
            <div className="signin-divider">
              <span>or</span>
            </div>
            <button type="button" data-testid="button-signin-method-no-password" onClick={() => setMethod('no-password')} className="signin-phone-link">
              Sign in with a one-time code
            </button>
          </>
        )}
        {method !== 'O-auth' && (
          <form onSubmit={submit} className="grid gap-4">
            <div className="mb-1 flex items-center justify-between">
              <p className="font-semibold">{method === 'JWT-auth' ? 'Sign in with email' : 'Sign in with one-time code'}</p>
              <button type="button" onClick={() => setMethod('O-auth')} className="text-xs font-bold text-accent hover:underline">
                Back to options
              </button>
            </div>
            {method === 'JWT-auth' && (
              <>
            <Field required autoComplete="email" type="email" label="Email address" placeholder="you@example.com" value={form.email} onChange={update('email')} data-testid="input-signin-email" />
                <div>
                  <Field required autoComplete="current-password" type="password" label="Password" placeholder="Your password" value={form.password} onChange={update('password')} data-testid="input-signin-password" />
                  <button type="button" className="mt-2 text-xs font-bold text-accent hover:underline">
                    Forgot password?
                  </button>
                </div>
              </>
            )}
            {method === 'no-password' && (
              <>
                <Field required autoComplete="tel" inputMode="tel" type="tel" label="Mobile number" placeholder="98765 43210" value={form.phone} onChange={update('phone')} data-testid="input-signin-phone" />
                <Field required inputMode="numeric" autoComplete="one-time-code" label="One-time code" placeholder="Enter the 6-digit code" value={form.otp} onChange={update('otp')} data-testid="input-signin-otp" />
              </>
            )}{' '}
            {mutation.error && (
              <p data-testid="status-signin-error" className="rounded-xl border border-[#e4b5aa] bg-[#fff2ef] p-3 text-sm text-[#8d3f34]">
                Sign in was not completed. Check your details and try again.
              </p>
            )}
            {authConfirmError && (
              <p role="alert" data-testid="status-signin-auth-error" className="rounded-xl border border-[#e4b5aa] bg-[#fff2ef] p-3 text-sm text-[#8d3f34]">
                {authConfirmError}
              </p>
            )}
            <Button type="submit" data-testid="button-submit-signin" disabled={mutation.isPending} className="w-full py-3.5">
              {mutation.isPending ? <Loader2 className="animate-spin" size={17} /> : <LogIn size={17} />}
              {mutation.isPending ? 'Signing you in...' : 'Sign in securely'}
            </Button>
          </form>
        )}
        {method === 'O-auth' && (mutation.error || authError) && (
          <p data-testid="status-signin-error" className="mt-4 rounded-xl border border-[#e4b5aa] bg-[#fff2ef] p-3 text-sm text-[#8d3f34]">
            {authError || 'Sign in was not completed. Please try again.'}
          </p>
        )}
        <p className="signin-modal-join">
          New to ENRG?{' '}
          <Link href={`/signup${location.includes('?') ? `?${location.split('?')[1]}` : ''}`} data-testid="link-signin-signup">
            Join now
          </Link>
        </p>
        <p className="signin-modal-privacy">
          <ShieldCheck size={14} /> Your information is protected.
        </p>
      </section>
    </div>
  );
}
