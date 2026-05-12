import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export default function AdminBrands() {
  const queryClient = useQueryClient();
  const [form, setForm] = useState<{ id?: string; name: string; slug: string; logo_url: string } | null>(null);
  const [error, setError] = useState('');

  const { data: brands } = useQuery({
    queryKey: ['admin_brands'],
    queryFn: async () => {
      const { data } = await supabase.from('brands').select('*, products(id)').order('name');
      return data ?? [];
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (f: typeof form) => {
      if (!f) return;
      const payload = { name: f.name, slug: f.slug, logo_url: f.logo_url || null };
      if (f.id) {
        const { error } = await supabase.from('brands').update(payload).eq('id', f.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('brands').insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin_brands'] }); setForm(null); setError(''); },
    onError: (e: any) => setError(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const brand = brands?.find(b => b.id === id);
      if (brand && (brand as any).products?.length > 0) throw new Error('CANNOT_DELETE: BRAND_HAS_PRODUCTS');
      const { error } = await supabase.from('brands').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin_brands'] }),
    onError: (e: any) => setError(e.message),
  });

  function autoSlug(name: string) { return name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''); }

  return (
    <div>
      <div className="mb-6">
        <button onClick={() => setForm({ name: '', slug: '', logo_url: '' })} className="bg-foreground px-4 py-2 text-xs font-bold uppercase tracking-widest text-background hover:bg-foreground/80">ADD BRAND</button>
      </div>
      {error && <p className="mb-4 font-mono text-xs text-destructive">{error}</p>}
      {form && (
        <div className="mb-8 border-2 border-foreground p-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div><label className="label-text mb-1 block">NAME *</label><input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value, slug: form.id ? form.slug : autoSlug(e.target.value) })} className="w-full border-2 border-border bg-background p-2 font-mono text-xs outline-none focus:border-foreground" /></div>
            <div><label className="label-text mb-1 block">SLUG *</label><input type="text" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} className="w-full border-2 border-border bg-background p-2 font-mono text-xs outline-none focus:border-foreground" /></div>
            <div><label className="label-text mb-1 block">LOGO URL</label><input type="text" value={form.logo_url} onChange={(e) => setForm({ ...form, logo_url: e.target.value })} className="w-full border-2 border-border bg-background p-2 font-mono text-xs outline-none focus:border-foreground" /></div>
          </div>
          <div className="mt-4 flex gap-4">
            <button onClick={() => saveMutation.mutate(form)} className="bg-foreground px-6 py-2 text-xs font-bold uppercase tracking-widest text-background">SAVE</button>
            <button onClick={() => { setForm(null); setError(''); }} className="px-6 py-2 text-xs font-bold uppercase tracking-widest text-muted-foreground">CANCEL</button>
          </div>
        </div>
      )}
      <table className="w-full">
        <thead><tr className="border-b-2 border-foreground">
          <th className="label-text pb-2 text-left">LOGO</th>
          <th className="label-text pb-2 text-left">NAME</th>
          <th className="label-text pb-2 text-left">SLUG</th>
          <th className="label-text pb-2 text-right">ACTIONS</th>
        </tr></thead>
        <tbody>
          {brands?.map((b) => (
            <tr key={b.id} className="border-b border-border">
              <td className="py-2"><div className="h-10 w-10 bg-muted flex items-center justify-center overflow-hidden">{b.logo_url ? <img src={b.logo_url} alt="" className="h-full w-full object-cover" /> : <span className="text-[8px] text-muted-foreground">—</span>}</div></td>
              <td className="py-2 text-sm font-medium">{b.name}</td>
              <td className="py-2 font-mono text-xs">{b.slug}</td>
              <td className="py-2 text-right">
                <button onClick={() => setForm({ id: b.id, name: b.name, slug: b.slug, logo_url: b.logo_url ?? '' })} className="mr-2 font-mono text-xs text-accent hover:underline">EDIT</button>
                <button onClick={() => { if (confirm('Delete?')) deleteMutation.mutate(b.id); }} className="font-mono text-xs text-destructive hover:underline">DELETE</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
