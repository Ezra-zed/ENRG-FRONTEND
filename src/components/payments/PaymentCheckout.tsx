import { useCallback, useEffect, useRef, useState } from 'react';
import { AlertCircle, BadgeCheck, CheckCircle2, Clock3, CreditCard, Loader2, LockKeyhole, RotateCcw, ShieldCheck, XCircle } from 'lucide-react';
import { cancelPayment, createPaymentOrder, getPaymentStatus, verifyPayment, type EnrgPayment, type ProjectQuote } from '@workspace/api-client-react';
import { useAuth } from '@/auth/auth-context';

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, any>) => {
      open: () => void;
      on: (event: string, callback: (response: any) => void) => void;
    };
  }
}

type FlowState = 'ready' | 'creating' | 'opening' | 'processing' | 'paid' | 'failed' | 'cancelled' | 'interrupted';

function loadRazorpay(): Promise<void> {
  if (window.Razorpay) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>('script[data-enrg-razorpay]');
    const script = existing || document.createElement('script');
    const fail = () => reject(new Error('Razorpay Checkout could not be loaded. Check your connection and try again.'));
    script.addEventListener('load', () => window.Razorpay ? resolve() : fail(), { once: true });
    script.addEventListener('error', fail, { once: true });
    if (!existing) {
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      script.dataset.enrgRazorpay = 'true';
      document.head.appendChild(script);
    }
  });
}

function idempotencyKey() {
  return globalThis.crypto?.randomUUID?.() || `enrg-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

type SavedCheckout = { idempotencyKey: string; paymentId?: string };
function checkoutStorageKey(projectId: string, quoteId: string) {
  return `enrg_checkout_${projectId}_${quoteId}`;
}
function readSavedCheckout(projectId: string, quoteId: string): SavedCheckout | null {
  try {
    const value = sessionStorage.getItem(checkoutStorageKey(projectId, quoteId));
    if (!value) return null;
    const parsed = JSON.parse(value) as Partial<SavedCheckout>;
    return typeof parsed.idempotencyKey === 'string' ? { idempotencyKey: parsed.idempotencyKey, paymentId: typeof parsed.paymentId === 'string' ? parsed.paymentId : undefined } : null;
  } catch { return null; }
}
function saveCheckout(projectId: string, quoteId: string, checkout: SavedCheckout) {
  try { sessionStorage.setItem(checkoutStorageKey(projectId, quoteId), JSON.stringify(checkout)); } catch { /* Checkout still works when storage is unavailable. */ }
}

function money(amount: number, currency: string, isPaise = false) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency, maximumFractionDigits: 2 }).format(isPaise ? amount / 100 : amount);
}

const terminalStatuses = new Set(['paid', 'failed', 'cancelled', 'interrupted', 'creation_failed']);

export function PaymentCheckout({ projectId, quote }: { projectId: string; quote: ProjectQuote }) {
  const [state, setState] = useState<FlowState>('ready');
  const [payment, setPayment] = useState<EnrgPayment | null>(null);
  const [message, setMessage] = useState('');
  const [retryOrderKey] = useState(() => {
    const saved = readSavedCheckout(projectId, quote.id);
    if (saved) return saved.idempotencyKey;
    const next = idempotencyKey();
    saveCheckout(projectId, quote.id, { idempotencyKey: next });
    return next;
  });
  const [polling, setPolling] = useState(false);
  const [recovering, setRecovering] = useState(() => Boolean(readSavedCheckout(projectId, quote.id)?.paymentId));
  const requestLock = useRef(false);
  const callbackStarted = useRef(false);
  const { user } = useAuth();
  const paid = state === 'paid' || payment?.status === 'paid';

  useEffect(() => {
    const saved = readSavedCheckout(projectId, quote.id);
    if (!saved?.paymentId) return;
    let active = true;
    getPaymentStatus(saved.paymentId).then((result) => {
      if (!active) return;
      const restored = result?.payment;
      if (!restored?.id || restored.id !== saved.paymentId || restored.projectId !== projectId || restored.quoteId !== quote.id || !restored.status) throw new Error('Payment status response did not match the saved checkout.');
      setPayment(restored);
      if (restored.status === 'paid') {
        setState('paid'); setMessage('Your payment is confirmed.');
      } else if (restored.status === 'failed' || restored.status === 'creation_failed') {
        setState('failed'); setMessage('The payment was not completed. You can retry securely.');
      } else if (restored.status === 'cancelled') {
        setState('cancelled'); setMessage('Checkout was closed before completion. You can safely try again.'); setPolling(true);
      } else {
        setState('interrupted'); setMessage('A previous checkout may still be finishing. We’re checking its status.'); setPolling(true);
      }
    }).catch((error) => {
      if (!active) return;
      setState('interrupted');
      setMessage(error instanceof Error ? `${error.message} You can refresh the status or retry the same order.` : 'We could not restore this checkout. Refresh its status or retry the same order.');
    }).finally(() => { if (active) setRecovering(false); });
    return () => { active = false; };
  }, [projectId, quote.id]);

  const syncStatus = useCallback(async (paymentId: string) => {
    try {
      const result = await getPaymentStatus(paymentId);
      if (!result?.payment?.id || result.payment.id !== paymentId || !result.payment.status) throw new Error('The payment status response was incomplete or did not match this checkout.');
      setPayment(result.payment);
      if (result.payment.status === 'paid') {
        setState('paid'); setMessage('Your payment is confirmed.'); setPolling(false);
      } else if (result.payment.status === 'failed' || result.payment.status === 'creation_failed') {
        setState('failed'); setMessage('The payment was not completed. You can try again using the same secure order.'); setPolling(false);
      } else if (result.payment.status === 'interrupted') {
        setState('interrupted'); setMessage('This checkout was interrupted. Start again to check the latest payment status.'); setPolling(false);
      } else if (result.payment.status === 'cancelled') {
        setState('cancelled'); setMessage('Checkout was closed before completion. You can safely try again.');
      } else {
        setState((current) => current === 'cancelled' || current === 'interrupted' ? current : 'processing');
        setMessage((current) => current.startsWith('Checkout was closed') ? 'Checkout was closed. We’re checking if Razorpay has a final update.' : current.startsWith('A previous checkout') ? 'A previous checkout may still be finishing. We’re checking its status.' : 'We’re waiting for Razorpay to confirm your payment.');
      }
      return result.payment;
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'We could not refresh the payment status.');
      return null;
    }
  }, []);

  useEffect(() => {
    if (!polling || !payment?.id) return;
    let active = true;
    const startedAt = Date.now();
    const check = async () => {
      if (!active) return;
      const current = await syncStatus(payment.id);
      if (!active) return;
      if (!current || !terminalStatuses.has(current.status) || current.status === 'cancelled') {
        if (Date.now() - startedAt < 90_000) return;
        setPolling(false);
        setState(current?.status === 'cancelled' ? 'cancelled' : 'interrupted');
        setMessage('Confirmation is taking longer than expected. Refresh the status or retry shortly.');
      } else setPolling(false);
    };
    void check();
    const timer = window.setInterval(() => void check(), 3500);
    return () => { active = false; window.clearInterval(timer); };
  }, [polling, payment?.id, syncStatus]);

  const startCheckout = async () => {
    if (requestLock.current || paid) return;
    requestLock.current = true;
    callbackStarted.current = false;
    setPolling(false);
    setMessage('');
    setState('creating');
    try {
      // Retain this key across retries so a lost order response cannot mint a
      // second Razorpay order for the same quote.
      const order = await createPaymentOrder(projectId, quote.id, retryOrderKey);
      if (!order?.payment?.id || order.payment.projectId !== projectId || order.payment.quoteId !== quote.id || !Number.isSafeInteger(order.payment.amount) || order.payment.amount <= 0 || !order.payment.currency || !order.checkout?.keyId || !order.checkout.orderId || (order.checkout.amount !== undefined && order.checkout.amount !== order.payment.amount) || (order.checkout.currency !== undefined && order.checkout.currency !== order.payment.currency)) {
        throw new Error('The payment service returned incomplete order details. Please retry in a moment.');
      }
      setPayment(order.payment);
      saveCheckout(projectId, quote.id, { idempotencyKey: retryOrderKey, paymentId: order.payment.id });
      setState('opening');
      await loadRazorpay();
      if (!window.Razorpay) throw new Error('Razorpay Checkout is unavailable in this browser.');
      const checkout = new window.Razorpay({
        key: order.checkout.keyId,
        order_id: order.checkout.orderId,
        amount: order.checkout.amount ?? order.payment.amount,
        currency: order.checkout.currency ?? order.payment.currency,
        name: 'ENRG',
        description: `Solar project quote · ${quote.companyName || 'ENRG partner'}`,
        image: `${window.location.origin}/favicon.ico`,
        prefill: { name: user?.name, email: user?.email, contact: user?.mobile },
        notes: { projectId, quoteId: quote.id },
        theme: { color: '#25835e' },
        retry: { enabled: true },
        modal: {
          ondismiss: async () => {
            if (callbackStarted.current) return;
            requestLock.current = false;
            try {
              const result = await cancelPayment(order.payment.id);
              if (result?.payment) setPayment(result.payment);
              setState(result?.payment?.status === 'paid' ? 'paid' : 'cancelled');
              setMessage(result?.payment?.status === 'paid' ? 'Your payment is confirmed.' : 'Checkout was closed before completion. You can safely try again.');
              setPolling(result?.payment?.status !== 'paid');
            } catch {
              setState('cancelled');
              setMessage('Checkout was closed. We could not refresh its status just now. Check again before retrying.');
              setPolling(true);
            }
          },
        },
        handler: async (response: { razorpay_payment_id?: string; razorpay_order_id?: string; razorpay_signature?: string }) => {
          callbackStarted.current = true;
          setState('processing');
          setMessage('Payment received by Razorpay. Confirming securely…');
          const paymentId = order.payment.id;
          requestLock.current = true;
          if (!response.razorpay_payment_id || !response.razorpay_order_id || !response.razorpay_signature) {
            setMessage('Razorpay returned incomplete confirmation. We are checking the payment status.');
            requestLock.current = false;
            setPolling(true);
            return;
          }
          try {
            const verified = await verifyPayment({
              paymentId,
              orderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            });
            if (!verified?.payment?.id || verified.payment.id !== paymentId || verified.payment.projectId !== projectId || verified.payment.quoteId !== quote.id || !verified.payment.status) throw new Error('Payment verification returned an incomplete or mismatched response.');
            setPayment(verified.payment);
            if (verified.payment.status === 'paid') {
              setState('paid'); setMessage('Your payment is confirmed.'); requestLock.current = false;
            } else {
              setMessage('Your payment is being confirmed. This can take a few moments.'); requestLock.current = false; setPolling(true);
            }
          } catch (error) {
            requestLock.current = false;
            setMessage(error instanceof Error ? `${error.message} We’re checking the latest payment status.` : 'We could not complete verification. Checking the latest payment status.');
            setPolling(true);
          }
        },
      });
      checkout.on('payment.failed', (event) => {
        callbackStarted.current = true;
        requestLock.current = false;
        setState('failed');
        setMessage(event?.error?.description || 'Razorpay could not complete this payment. You can try again.');
      });
      checkout.open();
      // The active overlay prevents another start; dismiss handler releases it.
    } catch (error) {
      requestLock.current = false;
      setState('failed');
      setMessage(error instanceof Error ? error.message : 'We could not start checkout. Please try again.');
    }
  };

  const refreshStatus = async () => {
    if (!payment?.id) return;
    setState('processing'); setMessage('Refreshing your payment status…');
    const current = await syncStatus(payment.id);
    if (current && !terminalStatuses.has(current.status)) setPolling(true);
  };

  const busy = recovering || state === 'creating' || state === 'opening' || state === 'processing';
  const status = paid ? 'Paid' : recovering ? 'Restoring checkout' : state === 'creating' ? 'Preparing' : state === 'opening' ? 'Opening checkout' : state === 'processing' ? 'Processing' : state === 'failed' ? 'Failed' : state === 'cancelled' ? 'Cancelled' : state === 'interrupted' ? 'Interrupted' : payment?.status ? payment.status.replaceAll('_', ' ') : 'Not started';
  const Icon = paid ? CheckCircle2 : state === 'failed' || state === 'interrupted' ? AlertCircle : state === 'cancelled' ? XCircle : busy ? Loader2 : ShieldCheck;
  const statusColor = paid ? 'text-emerald-700 bg-emerald-50' : state === 'failed' || state === 'interrupted' ? 'text-rose-700 bg-rose-50' : state === 'cancelled' ? 'text-amber-800 bg-amber-50' : 'text-slate-600 bg-slate-100';

  return (
    <section aria-label={`Payment for ${quote.companyName || 'accepted quote'}`} className="mt-5 overflow-hidden rounded-2xl border border-emerald-200/80 bg-[linear-gradient(135deg,#f2faf4,#fff_72%)] p-4 sm:p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-2.5 py-1 text-xs font-bold text-emerald-800 ring-1 ring-emerald-200"><BadgeCheck size={14} />Accepted quote</span>
            <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold capitalize ${statusColor}`}><Icon size={14} className={busy ? 'animate-spin' : ''} />{busy && state !== 'processing' ? recovering ? 'Restoring checkout' : state === 'creating' ? 'Preparing' : 'Opening checkout' : status}</span>
          </div>
          <p className="mt-3 font-display text-xl font-bold tabular-nums">{payment ? money(payment.amount, payment.currency, true) : money(quote.estimatedPrice, 'INR')}</p>
          <p className="mt-1 text-sm text-muted-foreground">{quote.companyName || 'Solar partner'}{quote.warrantyYears ? ` · ${quote.warrantyYears}-year warranty` : ''}</p>
          {payment?.id && <p className="mt-1 break-all text-xs text-muted-foreground">Payment reference {payment.id}</p>}
        </div>
        <div className="flex w-full flex-col gap-2 sm:w-auto sm:min-w-44">
          {!paid && <button type="button" onClick={() => void startCheckout()} disabled={busy || requestLock.current} aria-busy={busy} className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-accent px-5 py-3 text-sm font-bold text-accent-foreground shadow-sm hover:-translate-y-0.5 hover:shadow-md disabled:translate-y-0 disabled:cursor-wait disabled:opacity-60 sm:w-auto">
            {busy ? <Loader2 size={16} className="animate-spin" /> : state === 'ready' ? <CreditCard size={16} /> : <RotateCcw size={15} />}
            {busy ? recovering ? 'Checking…' : state === 'processing' ? 'Confirming…' : state === 'creating' ? 'Preparing…' : 'Opening…' : paid ? 'Paid' : state === 'ready' ? 'Pay securely' : 'Try payment again'}
          </button>}
          {payment?.id && !paid && <button type="button" onClick={() => void refreshStatus()} disabled={busy} className="inline-flex min-h-10 items-center justify-center gap-2 rounded-full border border-border bg-white px-4 py-2 text-xs font-bold text-foreground hover:border-accent disabled:opacity-60"><RotateCcw size={13} />Refresh status</button>}
        </div>
      </div>
      {message && <p role="status" aria-live="polite" className={`mt-4 flex gap-2 rounded-xl px-3.5 py-3 text-sm leading-5 ${state === 'failed' || state === 'interrupted' ? 'bg-rose-50 text-rose-800' : state === 'paid' ? 'bg-emerald-50 text-emerald-800' : 'bg-white/80 text-slate-700'}`}>
        {state === 'paid' ? <CheckCircle2 size={16} className="mt-0.5 shrink-0" /> : state === 'failed' || state === 'interrupted' ? <AlertCircle size={16} className="mt-0.5 shrink-0" /> : <Clock3 size={16} className="mt-0.5 shrink-0" />}{message}
      </p>}
      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-emerald-900/10 pt-3 text-[11px] text-muted-foreground"><span className="inline-flex items-center gap-1"><LockKeyhole size={12} />Secure Razorpay checkout</span><span>Amount confirmed by ENRG</span><span className="break-all">Project {projectId} · Quote {quote.id}</span></div>
    </section>
  );
}
