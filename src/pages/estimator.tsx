import { money } from '@/lib/format';
import React, { useRef, useState } from 'react';
import { Link } from 'wouter';
import { ArrowRight, BatteryCharging, CircleDollarSign, Loader2, Sun, TrendingDown, Zap } from 'lucide-react';
import { useSolarEstimate, type SolarEstimateInput } from '@workspace/api-client-react';
import { SelectItem as DropdownItem } from '@/components/ui/select';
import { Button, Field, SelectField } from '@/components/form-controls';
import { LocationCombobox } from '@/components/LocationCombobox';
import { PageHeader } from '@/components/PageHeader';

export function EnergyEstimatorPage() {
  const estimateMutation = useSolarEstimate();
  const [form, setForm] = useState({ propertyType: 'residential' as 'residential' | 'commercial', location: '', monthlyBillAmount: '', monthlyConsumptionKwh: '', roofAreaSqFt: '', batteryRequired: false, backupHours: '4' });
  const [estimate, setEstimate] = useState<ReturnType<typeof useSolarEstimate>['data']>(undefined);
  const [locationError, setLocationError] = useState(false);
  const locationTriggerRef = useRef<HTMLButtonElement>(null);
  const update = (key: keyof typeof form) => (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setForm((current) => ({ ...current, [key]: event.target.value }));
  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!form.location.trim()) {
      setLocationError(true);
      locationTriggerRef.current?.focus();
      return;
    }
    setLocationError(false);
    setEstimate(undefined);
    const data: SolarEstimateInput = { propertyType: form.propertyType, location: form.location.trim(), ...(form.monthlyBillAmount ? { monthlyBillAmount: Number(form.monthlyBillAmount) } : {}), ...(form.monthlyConsumptionKwh ? { monthlyConsumptionKwh: Number(form.monthlyConsumptionKwh) } : {}), ...(form.roofAreaSqFt ? { roofAreaSqFt: Number(form.roofAreaSqFt) } : {}), batteryRequired: form.batteryRequired, backupHours: form.batteryRequired ? Number(form.backupHours) : 0 };
    estimateMutation.mutate({ data }, { onSuccess: setEstimate });
  };
  return <div className="mx-auto max-w-[1180px] px-5 py-10 lg:px-8 lg:py-14">
    <PageHeader eyebrow="Energy intelligent estimator" title="A useful first look at solar." description="Estimate a system size, energy generation, savings, and an installed price range from your energy use and location." />
    <div className="grid items-start gap-6 lg:grid-cols-[.9fr_1.1fr]">
      <form onSubmit={submit} className="grid gap-4 rounded-[2rem] border border-border bg-card p-6 shadow-[var(--shadow-card)] sm:p-8">
        <div><h2 className="font-display text-2xl font-bold">Your energy profile</h2><p className="mt-1 text-sm text-muted-foreground">Share your monthly bill or usage to calculate a planning estimate.</p></div>
        <SelectField label="Property type" value={form.propertyType} onValueChange={(value) => setForm((current) => ({ ...current, propertyType: value as typeof current.propertyType }))} placeholder="Select property type">
          <DropdownItem value="residential">Residential</DropdownItem><DropdownItem value="commercial">Commercial</DropdownItem>
        </SelectField>
        <label className="grid gap-1.5 text-sm font-medium text-foreground"><span>City or location <span className="text-destructive" aria-hidden="true">*</span></span><LocationCombobox value={form.location} onValueChange={(value) => { setForm((current) => ({ ...current, location: value })); if (value.trim()) setLocationError(false); }} placeholder="Choose or search a location" ariaLabel="City or location" testId="select-estimator-location" triggerRef={locationTriggerRef} required invalid={locationError} />{locationError && <span role="alert" id="estimator-location-error" className="text-xs font-normal text-destructive">Choose or enter a city or location.</span>}</label>
        <div className="grid gap-4 sm:grid-cols-2"><Field type="number" min="1" label="Monthly electricity bill (₹)" placeholder="4500" value={form.monthlyBillAmount} onChange={update('monthlyBillAmount')} /><Field type="number" min="1" label="Monthly use (kWh, optional)" placeholder="600" value={form.monthlyConsumptionKwh} onChange={update('monthlyConsumptionKwh')} /></div>
        <Field type="number" min="1" label="Available roof area (sq ft, optional)" placeholder="500" value={form.roofAreaSqFt} onChange={update('roofAreaSqFt')} />
        <label className="flex items-center gap-3 rounded-2xl bg-secondary/70 p-4 text-sm font-semibold"><input type="checkbox" checked={form.batteryRequired} onChange={(event) => setForm((current) => ({ ...current, batteryRequired: event.target.checked }))} className="size-4 accent-primary" /><BatteryCharging size={18} className="text-accent" />Include battery backup</label>
        {form.batteryRequired && <SelectField label="Backup duration" value={form.backupHours} onValueChange={(value) => setForm((current) => ({ ...current, backupHours: value }))} placeholder="Select backup duration"><DropdownItem value="2">2 hours</DropdownItem><DropdownItem value="4">4 hours</DropdownItem><DropdownItem value="6">6 hours</DropdownItem><DropdownItem value="8">8 hours</DropdownItem><DropdownItem value="12">12 hours</DropdownItem><DropdownItem value="24">24 hours</DropdownItem></SelectField>}
        {estimateMutation.error && <p role="alert" className="rounded-xl bg-[#fff2ef] p-3 text-sm text-[#8d3f34]">{(estimateMutation.error as Error).message || 'We could not calculate an estimate. Check your inputs and try again.'}</p>}
        <Button type="submit" disabled={estimateMutation.isPending || (!form.monthlyBillAmount && !form.monthlyConsumptionKwh)}>{estimateMutation.isPending ? <Loader2 size={16} className="animate-spin" /> : <Zap size={16} />}Calculate estimate</Button>
      </form>
      {estimate ? <section className="rounded-[2rem] bg-[#173b22] p-6 text-white shadow-[var(--shadow-card)] sm:p-8" aria-live="polite">
        <p className="text-xs font-bold uppercase tracking-[.16em] text-[#9ed3a8]">Your planning estimate</p><h2 className="mt-2 font-display text-3xl font-bold">{estimate.recommendedCapacityKw} kW solar</h2><p className="mt-1 text-sm text-white/65">About {estimate.panelCount} panels at {estimate.assumptions.panelWatts} W each</p>
        <div className="mt-6 grid gap-3 sm:grid-cols-2"><div className="rounded-2xl bg-white/10 p-4"><p className="flex items-center gap-2 text-sm text-white/70"><CircleDollarSign size={16} />Estimated system price</p><p className="mt-2 font-display text-xl font-bold">{money(estimate.estimatedPriceRange.min)}–{money(estimate.estimatedPriceRange.max)}</p></div><div className="rounded-2xl bg-white/10 p-4"><p className="flex items-center gap-2 text-sm text-white/70"><TrendingDown size={16} />Estimated monthly savings</p><p className="mt-2 font-display text-xl font-bold">{money(estimate.estimatedSavings.monthly)}</p><p className="mt-1 text-xs text-white/60">Around {money(estimate.estimatedSavings.annual)} per year</p></div><div className="rounded-2xl bg-white/10 p-4"><p className="flex items-center gap-2 text-sm text-white/70"><Sun size={16} />Monthly generation</p><p className="mt-2 font-display text-xl font-bold">{estimate.expectedGeneration.monthlyKwh.toLocaleString('en-IN')} kWh</p><p className="mt-1 text-xs text-white/60">{estimate.expectedGeneration.annualKwh.toLocaleString('en-IN')} kWh per year</p></div><div className="rounded-2xl bg-white/10 p-4"><p className="flex items-center gap-2 text-sm text-white/70"><BatteryCharging size={16} />Battery backup</p><p className="mt-2 font-display text-xl font-bold">{estimate.battery.required ? `${estimate.battery.recommendedCapacityKwh} kWh` : 'Not included'}</p></div></div>
        <p className="mt-5 rounded-2xl border border-white/15 bg-white/5 p-4 text-sm leading-6 text-white/75">{estimate.disclaimer}</p><Link href="/companies" className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-[#b5e6bd]">Compare solar companies <ArrowRight size={16} /></Link>
      </section> : <section className="grid min-h-64 place-items-center rounded-[2rem] border border-dashed border-border bg-card/60 p-8 text-center"><div><span className="mx-auto grid size-14 place-items-center rounded-2xl bg-[#e2eee5] text-accent"><Zap size={24} /></span><h2 className="mt-4 font-display text-xl font-bold">Your estimate will appear here</h2><p className="mt-2 max-w-sm text-sm leading-6 text-muted-foreground">Enter your monthly energy use and location to see estimated capacity, savings, and pricing.</p></div></section>}
    </div>
  </div>;
}
