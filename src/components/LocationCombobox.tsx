import React, { useState } from 'react';
import { ChevronDown, MapPin } from 'lucide-react';
import { Command, CommandEmpty, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';


const solarServiceLocations = [
  'Ahmedabad, Gujarat', 'Bengaluru, Karnataka', 'Bhopal, Madhya Pradesh', 'Chandigarh', 'Chennai, Tamil Nadu',
  'Coimbatore, Tamil Nadu', 'Delhi', 'Hyderabad, Telangana', 'Indore, Madhya Pradesh', 'Jaipur, Rajasthan',
  'Kochi, Kerala', 'Kolkata, West Bengal', 'Lucknow, Uttar Pradesh', 'Mumbai, Maharashtra', 'Nagpur, Maharashtra',
  'Nashik, Maharashtra', 'Pune, Maharashtra', 'Surat, Gujarat', 'Thiruvananthapuram, Kerala', 'Visakhapatnam, Andhra Pradesh',
];

export function LocationCombobox({ value, onValueChange, placeholder, ariaLabel, testId, triggerRef, invalid = false, required = false }: { value: string; onValueChange: (value: string) => void; placeholder: string; ariaLabel: string; testId?: string; triggerRef?: React.Ref<HTMLButtonElement>; invalid?: boolean; required?: boolean }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const chooseLocation = (location: string) => {
    onValueChange(location);
    setSearch(location);
    setOpen(false);
  };
  return (
    <Popover open={open} onOpenChange={(nextOpen) => { setOpen(nextOpen); if (nextOpen) setSearch(''); }}>
      <PopoverTrigger asChild>
        <button ref={triggerRef} type="button" aria-label={ariaLabel} aria-haspopup="listbox" aria-expanded={open} aria-invalid={invalid || undefined} aria-required={required || undefined} aria-describedby={invalid ? 'estimator-location-error' : undefined} data-testid={testId} className={`flex h-10 w-full min-w-0 items-center justify-between gap-2 rounded-[13px] border bg-card px-3.5 text-left text-sm font-normal text-foreground shadow-sm shadow-black/[.035] transition-[border-color,box-shadow,background-color] duration-150 hover:border-accent/50 hover:shadow-md hover:shadow-black/[.045] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 data-[state=open]:border-accent data-[state=open]:ring-2 data-[state=open]:ring-primary/15 ${invalid ? 'border-destructive focus-visible:ring-destructive/20' : 'border-input focus-visible:border-accent'}`}>
          <span className={`flex min-w-0 items-center gap-2 truncate ${value ? '' : 'text-muted-foreground'}`}><MapPin size={16} className="shrink-0" aria-hidden="true" />{value || placeholder}</span>
          <ChevronDown size={16} className={`shrink-0 text-muted-foreground transition-transform duration-150 ${open ? 'rotate-180' : ''}`} aria-hidden="true" />
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" sideOffset={6} collisionPadding={8} className="w-[var(--radix-popover-trigger-width)] max-w-[calc(100vw-2rem)] rounded-[13px] border-border bg-card p-1.5 shadow-xl shadow-black/10">
        <Command>
          <CommandInput autoComplete="off" value={search} onValueChange={(next) => { setSearch(next); onValueChange(next); }} placeholder="Search a city or region" aria-label={`Search ${ariaLabel.toLowerCase()}`} />
          <CommandList className="max-h-60 overscroll-contain">
            <CommandEmpty>Type a city or region to use it.</CommandEmpty>
            <CommandItem value={`clear-location-filter ${search}`} onSelect={() => chooseLocation('')} className="rounded-lg px-3 py-2.5 text-sm text-muted-foreground data-[selected=true]:bg-accent/10 data-[selected=true]:text-accent">
              Clear location filter
            </CommandItem>
            {search.trim() && !solarServiceLocations.some((location) => location.toLocaleLowerCase() === search.trim().toLocaleLowerCase()) && (
              <CommandItem value={`use-location-${search}`} onSelect={() => chooseLocation(search.trim())} className="rounded-lg px-3 py-2.5 text-sm data-[selected=true]:bg-accent/10 data-[selected=true]:text-accent">
                Use “{search.trim()}”
              </CommandItem>
            )}
            {solarServiceLocations.map((location) => (
              <CommandItem key={location} value={location} onSelect={() => chooseLocation(location)} className="rounded-lg px-3 py-2.5 text-sm data-[selected=true]:bg-accent/10 data-[selected=true]:text-accent">
                {location}
              </CommandItem>
            ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
