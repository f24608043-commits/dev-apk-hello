import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export default function AdminCoupons() {
  const queryClient = useQueryClient();
  const [form, setForm] = useState<any>(null);

  const { data: coupons } = useQuery({
    queryKey: ['admin_coupons'],
    queryFn: async () => { const { data } = await supabase.from('coupons').select('*').order('created_at', { ascending: false }); return data ?? []; },
  });

  const save = useMutation({
    mutationFn: async (f: any) => {
      const payload = { code: f.code, discount_type: f.discount_type, discount_value: parseFloat(f.discount_value), min_order_amount: f.min_order_amount ? parseFloat(f.min_order_amount) : 0, max_uses: f.max_uses ? parseInt(f.max_uses) : null, expires_at: f.expires_at || null, is_active: f.is_active };
      if (f.id) { await supabase.from('coupons').update(payload).eq('id', f.id); }
      else { await supabase.from('coupons').insert(payload); }
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin_coupons'] }); setForm(null); },
  });

  const del = useMutation({
    mutationFn: async (id: string) => { await supabase.from('coupons').delete().eq('id', id); },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin_coupons'] }),
  });

  return (
    <div>
      <button onClick={() => setForm({ code: '', discount_type: 'percent', discount_value: '', min_order_amount: '', max_uses: '', expires_at: '', is_active: true })} className="mb-6 bg-foreground px-4 py-2 text-xs font-bold uppercase tracking-widest text-background">ADD COUPON</button>
      {form && (
        <div className="mb-8 border-2 border-foreground p-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div><label className="label-text mb-1 block">CODE *</label><input type="text" value={form.code} onChange={(e) => setForm({...form, code: e.target.value.toUpperCase()})} className="w-full border-2 border-border bg-background p-2 font-mono text-xs outline-none" /></div>
          <div><label className="label-text mb-1 block">TYPE</label><select value={form.discount_type} onChange={(e) => setForm({...form, discount_type: e.target.value})} className="w-full border-2 border-border bg-background p-2 font-mono text-xs outline-none"><option value="percent">PERCENT</option><option value="fixed">FIXED</option></select></div>
          <div><label className="label-text mb-1 block">VALUE *</label><input type="number" value={form.discount_value} onChange={(e) => setForm({...form, discount_value: e.target.value})} className="w-full border-2 border-border bg-background p-2 font-mono text-xs outline-none" /></div>
          <div><label className="label-text mb-1 block">MIN ORDER</label><input type="number" value={form.min_order_amount} onChange={(e) => setForm({...form, min_order_amount: e.target.value})} className="w-full border-2 border-border bg-background p-2 font-mono text-xs outline-none" /></div>
          <div><label className="label-text mb-1 block">MAX USES</label><input type="number" value={form.max_uses} onChange={(e) => setForm({...form, max_uses: e.target.value})} className="w-full border-2 border-border bg-background p-2 font-mono text-xs outline-none" /></div>
          <div><label className="label-text mb-1 block">EXPIRES AT</label><input type="datetime-local" value={form.expires_at?.slice(0,16)} onChange={(e) => setForm({...form, expires_at: e.target.value})} className="w-full border-2 border-border bg-background p-2 font-mono text-xs outline-none" /></div>
          <label className="flex items-center gap-2"><input type="checkbox" checked={form.is_active} onChange={(e) => setForm({...form, is_active: e.target.checked})} className="accent-foreground" /><span className="text-xs">ACTIVE</span></label>
          <div className="md:col-span-3 flex gap-4">
            <button onClick={() => save.mutate(form)} className="bg-foreground px-6 py-2 text-xs font-bold uppercase text-background">SAVE</button>
            <button onClick={() => setForm(null)} className="px-6 py-2 text-xs font-bold uppercase text-muted-foreground">CANCEL</button>
          </div>
        </div>
      )}
      <table className="w-full"><thead><tr className="border-b-2 border-foreground"><th className="label-text pb-2 text-left">CODE</th><th className="label-text pb-2 text-left">TYPE</th><th className="label-text pb-2 text-right">VALUE</th><th className="label-text pb-2 text-right">USED</th><th className="label-text pb-2 text-center">ACTIVE</th><th className="label-text pb-2 text-right">ACTIONS</th></tr></thead>
      <tbody>{coupons?.map(c => (
        <tr key={c.id} className="border-b border-border">
          <td className="py-2 font-mono text-xs font-bold">{c.code}</td>
          <td className="py-2 font-mono text-xs">{c.discount_type?.toUpperCase()}</td>
          <td className="py-2 text-right data-text text-sm">{c.discount_type === 'percent' ? `${Number(c.discount_value)}%` : `$${Number(c.discount_value).toFixed(2)}`}</td>
          <td className="py-2 text-right data-text text-sm">{c.used_count}{c.max_uses ? `/${c.max_uses}` : ''}</td>
          <td className="py-2 text-center font-mono text-xs">{c.is_active ? 'ON' : 'OFF'}</td>
          <td className="py-2 text-right">
            <button onClick={() => setForm({...c, discount_value: String(c.discount_value), min_order_amount: String(c.min_order_amount ?? ''), max_uses: c.max_uses ? String(c.max_uses) : ''})} className="mr-2 font-mono text-xs text-accent hover:underline">EDIT</button>
            <button onClick={() => { if(confirm('Delete?')) del.mutate(c.id); }} className="font-mono text-xs text-destructive hover:underline">DELETE</button>
          </td>
        </tr>
      ))}</tbody></table>
    </div>
  );
}
