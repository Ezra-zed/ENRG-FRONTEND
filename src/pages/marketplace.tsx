import { money } from '@/lib/format';
import React, { useMemo, useState } from 'react';
import { Link } from 'wouter';
import { ArrowRight, FileText, Search } from 'lucide-react';
import { getListMarketplaceProductsQueryKey, useListMarketplaceProducts, ProductCategory, type Product } from '@workspace/api-client-react';
import { SelectItem as DropdownItem } from '@/components/ui/select';
import { EnrgSelect } from '@/components/form-controls';
import { QueryState } from '@/components/feedback';
import { PageHeader } from '@/components/PageHeader';

export function Marketplace() {
  const [category, setCategory] = useState<ProductCategory | undefined>();
  const [sort, setSort] = useState<'price' | 'newest'>('newest');
  const [search, setSearch] = useState('');
  const params = useMemo(
    () => ({
      page: 1,
      limit: 50,
      ...(category ? { category } : {}),
      sortBy: sort,
    }),
    [category, sort],
  );
  const query = useListMarketplaceProducts(params, {
    query: { queryKey: getListMarketplaceProductsQueryKey(params) },
  });
  const products = (query.data?.items || []).filter((p) => p.name.toLowerCase().includes(search.toLowerCase()) || p.description.toLowerCase().includes(search.toLowerCase()));
  const categories: Array<{
    value: ProductCategory | undefined;
    label: string;
  }> = [
    { value: undefined, label: 'All equipment' },
    { value: 'solar-module', label: 'Solar modules' },
    { value: 'inverter', label: 'Inverters' },
    { value: 'cable', label: 'Cables' },
    { value: 'structure', label: 'Structures' },
    { value: 'BOS', label: 'Balance of system' },
  ];
  return (
    <div className="mx-auto max-w-[1320px] px-5 py-10 lg:px-8 lg:py-14">
      <PageHeader
        eyebrow="The marketplace"
        title="Solar Equipment Marketplace."
        description="Explore solar panels, inverters, cables, structures, and other solar equipment from brands and sellers."
        action={
          <Link href="/quote" data-testid="link-marketplace-quote" className="inline-flex items-center gap-2 rounded-full bg-accent px-4 py-2.5 text-sm font-bold text-accent-foreground">
            <FileText size={16} /> Need help choosing?
          </Link>
        }
      />
      <div className="mb-8 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex gap-2 overflow-x-auto pb-1">
          {categories.map((c) => (
            <button key={c.label} data-testid={`button-filter-${c.label.toLowerCase().replaceAll(' ', '-')}`} onClick={() => setCategory(c.value)} className={`whitespace-nowrap rounded-full px-3.5 py-2 text-xs font-bold ${category === c.value ? 'bg-accent text-accent-foreground' : 'bg-secondary text-secondary-foreground hover:bg-muted'}`}>
              {c.label}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <label className="relative flex-1">
            <Search className="absolute left-3 top-2.5 text-muted-foreground" size={16} />
            <input data-testid="input-product-search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search equipment" className="h-10 w-full rounded-full border border-input bg-card pl-9 pr-3 text-sm outline-none focus:border-accent sm:w-56" />
          </label>
          <EnrgSelect aria-label="Sort products" data-testid="select-product-sort" value={sort} onValueChange={(value) => setSort(value as 'price' | 'newest')} className="w-auto text-xs font-semibold">
            <DropdownItem value="newest">Newest first</DropdownItem>
            <DropdownItem value="price">Price</DropdownItem>
          </EnrgSelect>
        </div>
      </div>
      <QueryState loading={query.isLoading} error={query.error} onRetry={() => query.refetch()} empty={!query.isLoading && !query.error && products.length === 0} emptyText="No equipment matches that search.">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </QueryState>
    </div>
  );
}
export function ProductCard({ product }: { product: Product }) {
  return (
    <article data-testid={`card-product-${product.id}`} className="group overflow-hidden rounded-3xl border border-border bg-card shadow-[var(--shadow-card)] hover:-translate-y-1.5 hover:shadow-xl">
      <div className="relative flex h-48 items-center justify-center overflow-hidden bg-[#dcebe0]">
        {product.imageUrl ? (
          <img src={product.imageUrl} alt={product.name} className="h-full w-full object-cover" loading="lazy" decoding="async" />
        ) : (
          <div className="relative size-28 rotate-[-8deg] rounded-xl border-2 border-[#6f9b7f] bg-[#abcab6] shadow-xl">
            <div className="grid h-full grid-cols-3 gap-1 p-2">
              {Array.from({ length: 9 }).map((_, i) => (
                <span key={i} className="rounded-sm border border-[#75a080] bg-[#c6dec3]" />
              ))}
            </div>
          </div>
        )}
        {product.badge && (
          <span data-testid={`text-badge-${product.id}`} className="absolute left-4 top-4 rounded-full bg-primary px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider">
            {product.badge}
          </span>
        )}
      </div>
      <div className="p-5">
        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{product.category.replaceAll('-', ' ')}</p>
        <h3 data-testid={`text-product-name-${product.id}`} className="mt-1 font-display text-lg font-bold">
          {product.name}
        </h3>
        <p className="mt-2 line-clamp-2 min-h-10 text-sm leading-5 text-muted-foreground">{product.description}</p>
        <div className="mt-5 flex items-end justify-between gap-2">
          <div>
            <span data-testid={`text-product-price-${product.id}`} className="font-display text-xl font-bold">
              {money(product.price)}
            </span>
            <span className="ml-1 text-xs text-muted-foreground">/ {product.unit || 'unit'}</span>
          </div>
          <Link href="/quote" data-testid={`link-product-quote-${product.id}`} className="grid size-9 place-items-center rounded-full bg-secondary text-accent hover:bg-primary">
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </article>
  );
}
