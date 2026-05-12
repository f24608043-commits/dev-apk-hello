import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

type ProductForm = {
  id?: string;
  name: string;
  slug: string;
  description: string;
  price: string;
  compare_price: string;
  stock: string;
  category_id: string;
  brand_id: string;
  image_1: string;
  image_2: string;
  image_3: string;
  is_featured: boolean;
  is_active: boolean;
};

const emptyForm: ProductForm = {
  name: '', slug: '', description: '', price: '', compare_price: '', stock: '0',
  category_id: '', brand_id: '', image_1: '', image_2: '', image_3: '', is_featured: false, is_active: true,
};

export default function AdminProducts() {
  const queryClient = useQueryClient();
  const [form, setForm] = useState<ProductForm | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCat, setFilterCat] = useState('');
  const [filterBrand, setFilterBrand] = useState('');

  const { data: products } = useQuery({
    queryKey: ['admin_products', searchTerm, filterCat, filterBrand],
    queryFn: async () => {
      let query = supabase.from('products').select('*, categories(name), brands(name)').order('created_at', { ascending: false });
      if (searchTerm) query = query.ilike('name', `%${searchTerm}%`);
      if (filterCat) query = query.eq('category_id', filterCat);
      if (filterBrand) query = query.eq('brand_id', filterBrand);
      const { data } = await query;
      return data ?? [];
    },
  });

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => { const { data } = await supabase.from('categories').select('*').order('name'); return data ?? []; },
  });

  const { data: brands } = useQuery({
    queryKey: ['brands'],
    queryFn: async () => { const { data } = await supabase.from('brands').select('*').order('name'); return data ?? []; },
  });

  // Group categories: parents first, then subs indented
  const parentCategories = categories?.filter(c => !c.parent_id) ?? [];
  const getSubcategories = (parentId: string) => categories?.filter(c => c.parent_id === parentId) ?? [];

  const saveMutation = useMutation({
    mutationFn: async (f: ProductForm) => {
      const payload = {
        name: f.name,
        slug: f.slug,
        description: f.description || null,
        price: parseFloat(f.price),
        compare_price: f.compare_price ? parseFloat(f.compare_price) : null,
        stock: parseInt(f.stock),
        category_id: f.category_id || null,
        brand_id: f.brand_id || null,
        image_1: f.image_1 || null,
        image_2: f.image_2 || null,
        image_3: f.image_3 || null,
        is_featured: f.is_featured,
        is_active: f.is_active,
      };
      if (f.id) {
        const { error } = await supabase.from('products').update(payload).eq('id', f.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('products').insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin_products'] }); setForm(null); },
  });

  const toggleActive = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      await supabase.from('products').update({ is_active: !is_active }).eq('id', id);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin_products'] }),
  });

  const deleteProduct = useMutation({
    mutationFn: async (id: string) => {
      await supabase.from('products').delete().eq('id', id);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin_products'] }),
  });

  function autoSlug(name: string) {
    return name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center gap-4">
        <input
          type="text"
          placeholder="SEARCH PRODUCTS..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="border-2 border-border bg-background p-2 font-mono text-xs outline-none focus:border-foreground"
        />
        <select value={filterCat} onChange={(e) => setFilterCat(e.target.value)} className="border-2 border-border bg-background p-2 font-mono text-xs outline-none">
          <option value="">ALL CATEGORIES</option>
          {parentCategories.map((p) => {
            const subs = getSubcategories(p.id);
            return [
              <option key={p.id} value={p.id}>{p.name} (Parent)</option>,
              ...subs.map(s => <option key={s.id} value={s.id}>{"— " + s.name + " (Sub)"}</option>),
            ];
          })}
        </select>
        <select value={filterBrand} onChange={(e) => setFilterBrand(e.target.value)} className="border-2 border-border bg-background p-2 font-mono text-xs outline-none">
          <option value="">ALL BRANDS</option>
          {brands?.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
        </select>
        <button
          onClick={() => setForm({ ...emptyForm })}
          className="bg-foreground px-4 py-2 text-xs font-bold uppercase tracking-widest text-background hover:bg-foreground/80"
        >
          ADD PRODUCT
        </button>
      </div>

      {form && (
        <div className="mb-8 border-2 border-foreground p-6">
          <h2 className="label-text mb-4">{form.id ? 'EDIT PRODUCT' : 'NEW PRODUCT'}</h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="label-text mb-1 block">NAME *</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value, slug: form.id ? form.slug : autoSlug(e.target.value) })}
                className="w-full border-2 border-border bg-background p-2 font-mono text-xs outline-none focus:border-foreground"
              />
            </div>
            <div>
              <label className="label-text mb-1 block">SLUG *</label>
              <input
                type="text"
                value={form.slug}
                onChange={(e) => setForm({ ...form, slug: e.target.value })}
                className="w-full border-2 border-border bg-background p-2 font-mono text-xs outline-none focus:border-foreground"
              />
            </div>
            <div className="md:col-span-2">
              <label className="label-text mb-1 block">DESCRIPTION</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={3}
                className="w-full border-2 border-border bg-background p-2 font-mono text-xs outline-none focus:border-foreground"
              />
            </div>
            <div>
              <label className="label-text mb-1 block">PRICE *</label>
              <input type="number" step="0.01" min="0" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className="w-full border-2 border-border bg-background p-2 font-mono text-xs outline-none focus:border-foreground" />
            </div>
            <div>
              <label className="label-text mb-1 block">COMPARE PRICE</label>
              <input type="number" step="0.01" min="0" value={form.compare_price} onChange={(e) => setForm({ ...form, compare_price: e.target.value })} className="w-full border-2 border-border bg-background p-2 font-mono text-xs outline-none focus:border-foreground" />
            </div>
            <div>
              <label className="label-text mb-1 block">STOCK *</label>
              <input type="number" min="0" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} className="w-full border-2 border-border bg-background p-2 font-mono text-xs outline-none focus:border-foreground" />
            </div>
            <div>
              <label className="label-text mb-1 block">CATEGORY</label>
              <select value={form.category_id} onChange={(e) => setForm({ ...form, category_id: e.target.value })} className="w-full border-2 border-border bg-background p-2 font-mono text-xs outline-none">
                <option value="">NONE</option>
                {parentCategories.map((p) => {
                  const subs = getSubcategories(p.id);
                  return [
                    <option key={p.id} value={p.id}>{p.name} (Parent)</option>,
                    ...subs.map(s => <option key={s.id} value={s.id}>{"— " + s.name + " (Sub)"}</option>),
                  ];
                })}
              </select>
            </div>
            <div>
              <label className="label-text mb-1 block">BRAND</label>
              <select value={form.brand_id} onChange={(e) => setForm({ ...form, brand_id: e.target.value })} className="w-full border-2 border-border bg-background p-2 font-mono text-xs outline-none">
                <option value="">NONE</option>
                {brands?.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="label-text mb-1 block">IMAGE 1 (MAIN)</label>
              <input type="text" value={form.image_1} onChange={(e) => setForm({ ...form, image_1: e.target.value })} placeholder="https://..." className="w-full border-2 border-border bg-background p-2 font-mono text-xs outline-none focus:border-foreground" />
            </div>
            <div>
              <label className="label-text mb-1 block">IMAGE 2</label>
              <input type="text" value={form.image_2} onChange={(e) => setForm({ ...form, image_2: e.target.value })} placeholder="https://..." className="w-full border-2 border-border bg-background p-2 font-mono text-xs outline-none focus:border-foreground" />
            </div>
            <div>
              <label className="label-text mb-1 block">IMAGE 3</label>
              <input type="text" value={form.image_3} onChange={(e) => setForm({ ...form, image_3: e.target.value })} placeholder="https://..." className="w-full border-2 border-border bg-background p-2 font-mono text-xs outline-none focus:border-foreground" />
            </div>
            <div className="flex gap-6">
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={form.is_featured} onChange={(e) => setForm({ ...form, is_featured: e.target.checked })} className="accent-foreground" />
                <span className="text-xs">FEATURED</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} className="accent-foreground" />
                <span className="text-xs">ACTIVE</span>
              </label>
            </div>
          </div>
          <div className="mt-4 flex gap-4">
            <button onClick={() => saveMutation.mutate(form)} className="bg-foreground px-6 py-2 text-xs font-bold uppercase tracking-widest text-background hover:bg-foreground/80">SAVE</button>
            <button onClick={() => setForm(null)} className="px-6 py-2 text-xs font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground">CANCEL</button>
          </div>
        </div>
      )}

      <table className="w-full">
        <thead>
          <tr className="border-b-2 border-foreground">
            <th className="label-text pb-2 text-left">IMG</th>
            <th className="label-text pb-2 text-left">NAME</th>
            <th className="label-text pb-2 text-left">CATEGORY</th>
            <th className="label-text pb-2 text-left">BRAND</th>
            <th className="label-text pb-2 text-right">PRICE</th>
            <th className="label-text pb-2 text-right">STOCK</th>
            <th className="label-text pb-2 text-center">ACTIVE</th>
            <th className="label-text pb-2 text-right">ACTIONS</th>
          </tr>
        </thead>
        <tbody>
          {products?.map((p) => (
            <tr key={p.id} className="border-b border-border">
              <td className="py-2">
                <div className="h-10 w-10 bg-muted flex items-center justify-center overflow-hidden">
                  {p.image_1 ? <img src={p.image_1} alt="" className="h-full w-full object-cover" /> : <span className="text-[8px] text-muted-foreground">—</span>}
                </div>
              </td>
              <td className="py-2 text-sm font-medium">{p.name}</td>
              <td className="py-2 text-xs">{(p.categories as any)?.name ?? '—'}</td>
              <td className="py-2 text-xs">{(p.brands as any)?.name ?? '—'}</td>
              <td className="py-2 text-right data-text text-sm">${Number(p.price).toFixed(2)}</td>
              <td className="py-2 text-right data-text text-sm">{p.stock}</td>
              <td className="py-2 text-center">
                <button onClick={() => toggleActive.mutate({ id: p.id, is_active: p.is_active ?? true })} className={`font-mono text-xs font-bold ${p.is_active ? 'text-success' : 'text-destructive'}`}>
                  {p.is_active ? 'ON' : 'OFF'}
                </button>
              </td>
              <td className="py-2 text-right">
                <button
                  onClick={() => setForm({
                    id: p.id, name: p.name, slug: p.slug, description: p.description ?? '',
                    price: String(p.price), compare_price: p.compare_price ? String(p.compare_price) : '',
                    stock: String(p.stock), category_id: p.category_id ?? '', brand_id: p.brand_id ?? '',
                    image_1: p.image_1 ?? '', image_2: p.image_2 ?? '', image_3: p.image_3 ?? '',
                    is_featured: p.is_featured ?? false, is_active: p.is_active ?? true,
                  })}
                  className="mr-2 font-mono text-xs text-accent hover:underline"
                >
                  EDIT
                </button>
                <button
                  onClick={() => { if (confirm('Delete this product?')) deleteProduct.mutate(p.id); }}
                  className="font-mono text-xs text-destructive hover:underline"
                >
                  DELETE
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
