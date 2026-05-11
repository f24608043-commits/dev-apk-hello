import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export default function AdminDeals() {
  const queryClient = useQueryClient();
  const [form, setForm] = useState<any>(null);

  const { data: deals } = useQuery({
    queryKey: ['admin_deals'],
    queryFn: async () => { const { data } = await supabase.from('deals').select('*, products(name)').order('end_date', { ascending: false }); return data ?? []; },
  });

  const { data: products } = useQuery({
    queryKey: ['products_list'],
    queryFn: async () => { const { data } = await supabase.from('products').select('id, name').order('name'); return data ?? []; },
  });

  const save = useMutation({
    mutationFn: async (f: any) => {
      const payload = { product_id: f.product_id, discount_percent: parseFloat(f.discount_percent), start_date: f.start_date, end_date: f.end_date, is_active: f.is_active };
      if (f.id) { await supabase.from('deals').update(payload).eq('id', f.id); }
      else { await supabase.from('deals').insert(payload); }
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin_deals'] }); setForm(null); },
  });

  const del = useMutation({
    mutationFn: async (id: string) => { await supabase.from('deals').delete().eq('id', id); },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin_deals'] }),
  });

  return (
    <div>
      <button onClick={() => setForm({ product_id: '', discount_percent: '', start_date: '', end_date: '', is_active: true })} className="mb-6 bg-foreground px-4 py-2 text-xs font-bold uppercase tracking-widest text-background">ADD DEAL</button>
      {form && (
        <div className="mb-8 border-2 border-foreground p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div><label className="label-text mb-1 block">PRODUCT *</label><select value={form.product_id} onChange={(e) => setForm({...form, product_id: e.target.value})} className="w-full border-2 border-border bg-background p-2 font-mono text-xs outline-none"><option value="">SELECT</option>{products?.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}</select></div>
          <div><label className="label-text mb-1 block">DISCOUNT %</label><input type="number" value={form.discount_percent} onChange={(e) => setForm({...form, discount_percent: e.target.value})} className="w-full border-2 border-border bg-background p-2 font-mono text-xs outline-none" /></div>
          <div><label className="label-text mb-1 block">START DATE</label><input type="datetime-local" value={form.start_date?.slice(0,16)} onChange={(e) => setForm({...form, start_date: e.target.value})} className="w-full border-2 border-border bg-background p-2 font-mono text-xs outline-none" /></div>
          <div><label className="label-text mb-1 block">END DATE</label><input type="datetime-local" value={form.end_date?.slice(0,16)} onChange={(e) => setForm({...form, end_date: e.target.value})} className="w-full border-2 border-border bg-background p-2 font-mono text-xs outline-none" /></div>
          <label className="flex items-center gap-2"><input type="checkbox" checked={form.is_active} onChange={(e) => setForm({...form, is_active: e.target.checked})} className="accent-foreground" /><span className="text-xs">ACTIVE</span></label>
          <div className="md:col-span-2 flex gap-4">
            <button onClick={() => save.mutate(form)} className="bg-foreground px-6 py-2 text-xs font-bold uppercase text-background">SAVE</button>
            <button onClick={() => setForm(null)} className="px-6 py-2 text-xs font-bold uppercase text-muted-foreground">CANCEL</button>
          </div>
        </div>
      )}
      <table className="w-full"><thead><tr className="border-b-2 border-foreground"><th className="label-text pb-2 text-left">PRODUCT</th><th className="label-text pb-2 text-right">DISCOUNT</th><th className="label-text pb-2 text-left">START</th><th className="label-text pb-2 text-left">END</th><th className="label-text pb-2 text-center">ACTIVE</th><th className="label-text pb-2 text-right">ACTIONS</th></tr></thead>
      <tbody>{deals?.map(d => (
        <tr key={d.id} className="border-b border-border">
          <td className="py-2 text-sm">{(d.products as any)?.name}</td>
          <td className="py-2 text-right data-text text-sm">{Number(d.discount_percent)}%</td>
          <td className="py-2 font-mono text-xs">{new Date(d.start_date).toLocaleDateString()}</td>
          <td className="py-2 font-mono text-xs">{new Date(d.end_date).toLocaleDateString()}</td>
          <td className="py-2 text-center font-mono text-xs">{d.is_active ? 'ON' : 'OFF'}</td>
          <td className="py-2 text-right">
            <button onClick={() => setForm({...d, discount_percent: String(d.discount_percent)})} className="mr-2 font-mono text-xs text-accent hover:underline">EDIT</button>
            <button onClick={() => { if(confirm('Delete?')) del.mutate(d.id); }} className="font-mono text-xs text-destructive hover:underline">DELETE</button>
          </td>
        </tr>
      ))}</tbody></table>
    </div>
  );
}
