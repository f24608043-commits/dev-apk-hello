import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useState } from 'react';

export default function AdminOrders() {
  const queryClient = useQueryClient();
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

  const { data: orders } = useQuery({
    queryKey: ['admin_orders'],
    queryFn: async () => { 
      const { data } = await supabase
        .from('orders')
        .select('*, profiles(email, full_name), order_items(*, products(name, image_1))')
        .order('created_at', { ascending: false }); 
      return data ?? []; 
    },
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => { 
      await supabase.from('orders').update({ status }).eq('id', id); 
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin_orders'] }),
  });

  const statuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

  const toggleExpand = (orderId: string) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
  };

  return (
    <div>
      <table className="w-full">
        <thead>
          <tr className="border-b-2 border-foreground">
            <th className="label-text pb-2 text-left">ID</th>
            <th className="label-text pb-2 text-left">CUSTOMER</th>
            <th className="label-text pb-2 text-left">DATE</th>
            <th className="label-text pb-2 text-left">STATUS</th>
            <th className="label-text pb-2 text-right">TOTAL</th>
            <th className="label-text pb-2 text-left">ACTIONS</th>
          </tr>
        </thead>
        <tbody>
          {orders?.map(o => (
            <>
              <tr key={o.id} className="border-b border-border">
                <td className="py-2 font-mono text-xs">{o.id.slice(0,8)}</td>
                <td className="py-2 font-mono text-xs">{(o.profiles as any)?.full_name ?? '—'}</td>
                <td className="py-2 font-mono text-xs">{new Date(o.created_at).toLocaleDateString()}</td>
                <td className="py-2">
                  <select 
                    value={o.status ?? 'pending'} 
                    onChange={(e) => updateStatus.mutate({ id: o.id, status: e.target.value })} 
                    className="border border-border bg-background p-1 font-mono text-xs outline-none"
                  >
                    {statuses.map(s => <option key={s} value={s}>{s.toUpperCase()}</option>)}
                  </select>
                </td>
                <td className="py-2 text-right data-text text-sm">${Number(o.total).toFixed(2)}</td>
                <td className="py-2">
                  <button 
                    onClick={() => toggleExpand(o.id)}
                    className="font-mono text-xs text-muted-foreground hover:text-foreground"
                  >
                    {expandedOrder === o.id ? '▼' : '▶'}
                  </button>
                </td>
              </tr>
              {expandedOrder === o.id && (
                <tr key={`${o.id}-details`}>
                  <td colSpan={6} className="p-4 bg-muted/30">
                    <div className="space-y-4">
                      {/* Customer Details */}
                      <div>
                        <h4 className="font-bold text-sm mb-2">CUSTOMER DETAILS</h4>
                        <div className="space-y-1 font-mono text-xs">
                          <p><span className="text-muted-foreground">Name:</span> {(o.profiles as any)?.full_name ?? '—'}</p>
                          <p><span className="text-muted-foreground">Email:</span> {(o.profiles as any)?.email ?? '—'}</p>
                        </div>
                      </div>

                      {/* Shipping Address */}
                      {o.shipping_address && (
                        <div>
                          <h4 className="font-bold text-sm mb-2">SHIPPING ADDRESS</h4>
                          <p className="font-mono text-xs text-muted-foreground whitespace-pre-wrap">{typeof o.shipping_address === 'string' ? o.shipping_address : JSON.stringify(o.shipping_address)}</p>
                        </div>
                      )}

                      {/* Order Items */}
                      <div>
                        <h4 className="font-bold text-sm mb-2">ORDERED PRODUCTS</h4>
                        <div className="space-y-2">
                          {(o.order_items as any)?.map((item: any) => (
                            <div key={item.id} className="flex items-center gap-3 p-2 bg-background rounded">
                              {item.products?.image_1 && (
                                <img 
                                  src={item.products.image_1} 
                                  alt={item.products.name} 
                                  className="w-12 h-12 object-cover rounded"
                                />
                              )}
                              <div className="flex-1">
                                <p className="font-bold text-sm">{item.products?.name ?? 'Unknown Product'}</p>
                                <p className="font-mono text-xs text-muted-foreground">
                                  Qty: {item.quantity} × ${Number(item.price).toFixed(2)}
                                </p>
                              </div>
                              <p className="font-mono text-xs font-bold">
                                ${Number(item.quantity * item.price).toFixed(2)}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </td>
                </tr>
              )}
            </>
          ))}
        </tbody>
      </table>
    </div>
  );
}
