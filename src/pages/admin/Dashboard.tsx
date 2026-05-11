import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Link } from 'react-router-dom';

export default function AdminDashboard() {
  const { data: revenue } = useQuery({
    queryKey: ['admin_revenue'],
    queryFn: async () => {
      const { data } = await supabase.from('orders').select('total').neq('status', 'cancelled');
      return data?.reduce((sum, o) => sum + Number(o.total), 0) ?? 0;
    },
  });

  const { data: orderCount } = useQuery({
    queryKey: ['admin_order_count'],
    queryFn: async () => {
      const { count } = await supabase.from('orders').select('*', { count: 'exact', head: true });
      return count ?? 0;
    },
  });

  const { data: productCount } = useQuery({
    queryKey: ['admin_product_count'],
    queryFn: async () => {
      const { count } = await supabase.from('products').select('*', { count: 'exact', head: true });
      return count ?? 0;
    },
  });

  const { data: customerCount } = useQuery({
    queryKey: ['admin_customer_count'],
    queryFn: async () => {
      const { count } = await supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'customer');
      return count ?? 0;
    },
  });

  const { data: recentOrders } = useQuery({
    queryKey: ['admin_recent_orders'],
    queryFn: async () => {
      const { data } = await supabase.from('orders').select('*, profiles(email)').order('created_at', { ascending: false }).limit(10);
      return data ?? [];
    },
  });

  const { data: lowStock } = useQuery({
    queryKey: ['admin_low_stock'],
    queryFn: async () => {
      const { data } = await supabase.from('products').select('id, name, stock, slug').eq('is_active', true).lt('stock', 10).order('stock');
      return data ?? [];
    },
  });

  const stats = [
    { label: 'TOTAL REVENUE', value: `$${(revenue ?? 0).toFixed(2)}` },
    { label: 'TOTAL ORDERS', value: String(orderCount ?? 0) },
    { label: 'TOTAL PRODUCTS', value: String(productCount ?? 0) },
    { label: 'TOTAL CUSTOMERS', value: String(customerCount ?? 0) },
  ];

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 gap-px border border-border bg-border sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="bg-background p-6">
            <p className="label-text mb-2">{s.label}</p>
            <p className="data-text text-2xl font-bold">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <div>
          <h2 className="label-text mb-4">RECENT ORDERS</h2>
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="label-text pb-2 text-left">ID</th>
                <th className="label-text pb-2 text-left">CUSTOMER</th>
                <th className="label-text pb-2 text-left">STATUS</th>
                <th className="label-text pb-2 text-right">TOTAL</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders?.map((o) => (
                <tr key={o.id} className="border-b border-border">
                  <td className="py-2 font-mono text-xs">{o.id.slice(0, 8)}</td>
                  <td className="py-2 font-mono text-xs">{(o.profiles as any)?.email ?? '-'}</td>
                  <td className="py-2"><span className={`status-${o.status}`}>{o.status?.toUpperCase()}</span></td>
                  <td className="py-2 text-right data-text text-xs">${Number(o.total).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div>
          <h2 className="label-text mb-4">LOW STOCK ALERT</h2>
          {lowStock?.length === 0 ? (
            <p className="font-mono text-xs text-muted-foreground">ALL STOCK LEVELS OK.</p>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="label-text pb-2 text-left">PRODUCT</th>
                  <th className="label-text pb-2 text-right">STOCK</th>
                  <th className="pb-2"></th>
                </tr>
              </thead>
              <tbody>
                {lowStock?.map((p) => (
                  <tr key={p.id} className="border-b border-border">
                    <td className="py-2 text-sm">{p.name}</td>
                    <td className="py-2 text-right data-text text-sm text-destructive">{p.stock}</td>
                    <td className="py-2 text-right">
                      <Link to="/admin/products" className="font-mono text-xs text-accent hover:underline">EDIT</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
