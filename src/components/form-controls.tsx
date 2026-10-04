import React from 'react';
import { Select as Dropdown, SelectContent as DropdownContent, SelectTrigger as DropdownTrigger, SelectValue as DropdownValue } from '@/components/ui/select';
export function Button({
  children,
  variant = 'primary',
  className = '',
  type = 'button',
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'quiet' | 'outline' | 'danger';
}) {
  const variants = {
    primary: 'bg-primary text-primary-foreground hover:-translate-y-0.5 hover:shadow-lg',
    quiet: 'bg-secondary text-secondary-foreground hover:bg-muted',
    outline: 'border border-border bg-card hover:border-accent hover:text-accent',
    danger: 'bg-destructive text-destructive-foreground hover:-translate-y-0.5',
  };
  return (
    <button type={type} className={`inline-flex items-center justify-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold ${variants[variant]} disabled:cursor-not-allowed disabled:opacity-50 ${className}`} {...props}>
      {children}
    </button>
  );
}

export function Field({ label, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return (
    <label className="grid gap-1.5 text-sm font-medium text-foreground">
      {label}
      <input className="h-11 w-full rounded-xl border border-input bg-card px-3.5 text-sm outline-none placeholder:text-muted-foreground focus:border-accent focus:ring-2 focus:ring-primary/25" {...props} />
    </label>
  );
}

type EnrgSelectProps = {
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  children: React.ReactNode;
  className?: string;
  'aria-label'?: string;
  'data-testid'?: string;
};

export function EnrgSelect({ value, onValueChange, placeholder = 'Select an option', children, className = '', 'aria-label': ariaLabel, 'data-testid': testId }: EnrgSelectProps) {
  return (
    <Dropdown value={value} onValueChange={onValueChange}>
      <DropdownTrigger aria-label={ariaLabel} data-testid={testId} className={`min-w-0 ${className}`}>
        <DropdownValue placeholder={placeholder} />
      </DropdownTrigger>
      <DropdownContent position="popper" sideOffset={6} collisionPadding={8} className="w-[var(--radix-select-trigger-width)]">
        {children}
      </DropdownContent>
    </Dropdown>
  );
}

export function SelectField({ label, children, ...props }: EnrgSelectProps & { label: string }) {
  return (
    <label className="grid gap-1.5 text-sm font-medium text-foreground">
      {label}
      <EnrgSelect aria-label={label} className="w-full" {...props}>{children}</EnrgSelect>
    </label>
  );
}
