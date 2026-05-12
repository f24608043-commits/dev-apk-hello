import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export default function AdminCategories() {
  const queryClient = useQueryClient();
  const [form, setForm] = useState<{ id?: string; name: string; slug: string; description: string; parent_id: string; banner_image_url: string } | null>(null);
  const [error, setError] = useState('');

  const { data: categories } = useQuery({
    queryKey: ['admin_categories'],
    queryFn: async () => {
      const { data } = await supabase.from('categories').select('*').order('name');
      return data ?? [];
    },
  });

  // Fetch product counts per category
  const { data: productCounts } = useQuery({
    queryKey: ['admin_category_product_counts'],
    queryFn: async () => {
      const { data } = await supabase.from('products').select('id, category_id');
      const counts: Record<string, number> = {};
      for (const p of data ?? []) {
        if (p.category_id) {
          counts[p.category_id] = (counts[p.category_id] || 0) + 1;
        }
      }
      return counts;
    },
  });

  const parentCategories = categories?.filter(c => !c.parent_id) ?? [];
  const getSubcategories = (parentId: string) => categories?.filter(c => c.parent_id === parentId) ?? [];

  function getProductCount(catId: string): number {
    if (!productCounts || !categories) return 0;
    const cat = categories.find(c => c.id === catId);
    if (!cat) return 0;
    if (!cat.parent_id) {
      // Parent: count direct + all subcategory products
      const subIds = getSubcategories(catId).map(c => c.id);
      return [catId, ...subIds].reduce((sum, id) => sum + (productCounts[id] || 0), 0);
    }
    return productCounts[catId] || 0;
  }

  const saveMutation = useMutation({
    mutationFn: async (f: typeof form) => {
      if (!f) return;
      const payload = {
        name: f.name,
        slug: f.slug,
        description: f.description || null,
        parent_id: f.parent_id || null,
        banner_image_url: f.banner_image_url || null,
      };
      if (f.id) {
        const { error } = await supabase.from('categories').update(payload).eq('id', f.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('categories').insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin_categories'] }); queryClient.invalidateQueries({ queryKey: ['categories'] }); setForm(null); setError(''); },
    onError: (e: any) => setError(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const cat = categories?.find(c => c.id === id);
      if (!cat) return;
      // Check if parent has subcategories
      if (!cat.parent_id) {
        const subs = getSubcategories(id);
        if (subs.length > 0) throw new Error('CANNOT_DELETE: THIS CATEGORY HAS SUBCATEGORIES. DELETE OR REASSIGN SUBCATEGORIES FIRST.');
      }
      // Check if has products
      if ((productCounts?.[id] || 0) > 0) throw new Error('CANNOT_DELETE: CATEGORY HAS PRODUCTS ASSIGNED.');
      const { error } = await supabase.from('categories').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin_categories'] }); queryClient.invalidateQueries({ queryKey: ['categories'] }); },
    onError: (e: any) => setError(e.message),
  });

  function autoSlug(name: string) { return name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''); }

  // For parent select: only show parent categories (parent_id IS NULL), exclude self when editing
  const parentOptions = parentCategories.filter(c => c.id !== form?.id);

  function getParentName(parentId: string | null): string {
    if (!parentId) return '—';
    return categories?.find(c => c.id === parentId)?.name ?? '—';
  }

  return (
    <div>
      <div className="mb-6">
        <button onClick={() => setForm({ name: '', slug: '', description: '', parent_id: '', banner_image_url: '' })} className="bg-foreground px-4 py-2 text-xs font-bold uppercase tracking-widest text-background hover:bg-foreground/80">ADD CATEGORY</button>
      </div>

      {error && <p className="mb-4 font-mono text-xs text-destructive">{error}</p>}

      {form && (
        <div className="mb-8 border-2 border-foreground p-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="label-text mb-1 block">NAME *</label>
              <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value, slug: form.id ? form.slug : autoSlug(e.target.value) })} className="w-full border-2 border-border bg-background p-2 font-mono text-xs outline-none focus:border-foreground" />
            </div>
            <div>
              <label className="label-text mb-1 block">SLUG *</label>
              <input type="text" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} className="w-full border-2 border-border bg-background p-2 font-mono text-xs outline-none focus:border-foreground" />
            </div>
            <div className="md:col-span-2">
              <label className="label-text mb-1 block">DESCRIPTION</label>
              <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} className="w-full border-2 border-border bg-background p-2 font-mono text-xs outline-none focus:border-foreground" />
            </div>
            <div>
              <label className="label-text mb-1 block">PARENT CATEGORY</label>
              <select value={form.parent_id} onChange={(e) => setForm({ ...form, parent_id: e.target.value })} className="w-full border-2 border-border bg-background p-2 font-mono text-xs outline-none">
                <option value="">NONE — TOP-LEVEL CATEGORY</option>
                {parentOptions.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="label-text mb-1 block">BANNER IMAGE URL</label>
              <input type="text" value={form.banner_image_url} onChange={(e) => setForm({ ...form, banner_image_url: e.target.value })} placeholder="https://..." className="w-full border-2 border-border bg-background p-2 font-mono text-xs outline-none focus:border-foreground" />
            </div>
          </div>
          <div className="mt-4 flex gap-4">
            <button onClick={() => saveMutation.mutate(form)} className="bg-foreground px-6 py-2 text-xs font-bold uppercase tracking-widest text-background">SAVE</button>
            <button onClick={() => { setForm(null); setError(''); }} className="px-6 py-2 text-xs font-bold uppercase tracking-widest text-muted-foreground">CANCEL</button>
          </div>
        </div>
      )}

      <table className="w-full">
        <thead><tr className="border-b-2 border-foreground">
          <th className="label-text pb-2 text-left">NAME</th>
          <th className="label-text pb-2 text-left">TYPE</th>
          <th className="label-text pb-2 text-left">PARENT</th>
          <th className="label-text pb-2 text-left">BANNER</th>
          <th className="label-text pb-2 text-left">DESCRIPTION</th>
          <th className="label-text pb-2 text-right">PRODUCTS</th>
          <th className="label-text pb-2 text-right">ACTIONS</th>
        </tr></thead>
        <tbody>
          {categories?.map((c) => (
            <tr key={c.id} className="border-b border-border">
              <td className="py-2 text-sm font-medium">{c.parent_id ? <span className="pl-4">{c.name}</span> : c.name}</td>
              <td className="py-2 font-mono text-xs">{c.parent_id ? 'Sub' : 'Parent'}</td>
              <td className="py-2 text-xs text-muted-foreground">{getParentName(c.parent_id)}</td>
              <td className="py-2">
                {c.banner_image_url ? <img src={c.banner_image_url} alt="" className="h-10 w-10 object-cover" /> : <span className="text-xs text-muted-foreground">—</span>}
              </td>
              <td className="py-2 text-xs text-muted-foreground">{c.description ?? '—'}</td>
              <td className="py-2 text-right data-text text-sm">{getProductCount(c.id)}</td>
              <td className="py-2 text-right">
                <button onClick={() => setForm({ id: c.id, name: c.name, slug: c.slug, description: c.description ?? '', parent_id: c.parent_id ?? '', banner_image_url: c.banner_image_url ?? '' })} className="mr-2 font-mono text-xs text-accent hover:underline">EDIT</button>
                <button onClick={() => { if (confirm('Delete?')) deleteMutation.mutate(c.id); }} className="font-mono text-xs text-destructive hover:underline">DELETE</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
