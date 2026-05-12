import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export default function AdminOrders() {
  const queryClient = useQueryClient();

  const { data: orders } = useQuery({
    queryKey: ['admin_orders'],
    queryFn: async () => { const { data } = await supabase.from('orders').select('*, profiles(email, full_name), order_items(*, products(name))').order('created_at', { ascending: false }); return data ?? []; },
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => { await supabase.from('orders').update({ status }).eq('id', id); },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin_orders'] }),
  });

  const statuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

  return (
    <div>
      <table className="w-full"><thead><tr className="border-b-2 border-foreground">
        <th className="label-text pb-2 text-left">ID</th><th className="label-text pb-2 text-left">CUSTOMER</th><th className="label-text pb-2 text-left">DATE</th><th className="label-text pb-2 text-left">STATUS</th><th className="label-text pb-2 text-right">TOTAL</th>
      </tr></thead><tbody>
      {orders?.map(o => (
        <tr key={o.id} className="border-b border-border">
          <td className="py-2 font-mono text-xs">{o.id.slice(0,8)}</td>
          <td className="py-2 font-mono text-xs">{(o.profiles as any)?.email ?? '—'}</td>
          <td className="py-2 font-mono text-xs">{new Date(o.created_at).toLocaleDateString()}</td>
          <td className="py-2">
            <select value={o.status ?? 'pending'} onChange={(e) => updateStatus.mutate({ id: o.id, status: e.target.value })} className="border border-border bg-background p-1 font-mono text-xs outline-none">
              {statuses.map(s => <option key={s} value={s}>{s.toUpperCase()}</option>)}
            </select>
          </td>
          <td className="py-2 text-right data-text text-sm">${Number(o.total).toFixed(2)}</td>
        </tr>
      ))}
      </tbody></table>
    </div>
  );
}
