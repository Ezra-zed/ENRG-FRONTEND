export const money = (value?: number | null) => (typeof value === 'number' ? `₹${value.toLocaleString('en-IN')}` : '—');

export const date = (value?: string) =>
  value
    ? new Date(value).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
    : '—';
