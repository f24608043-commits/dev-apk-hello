import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();

  const { data: order, isLoading } = useQuery({
    queryKey: ['order_detail', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select('*, order_items(*, products(name))')
        .eq('id', id!)
        .eq('user_id', user!.id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!id && !!user,
  });

  if (isLoading) return <div className="p-6 font-mono text-xs text-muted-foreground">FETCHING DATA...</div>;
  if (!order) return <div className="p-6 font-mono text-xs text-destructive">ORDER_NOT_FOUND.</div>;

  const address = order.shipping_address as any;

  return (
    <div className="mx-auto max-w-3xl px-6 py-8">
      <h1 className="display-heading mb-2 text-2xl">ORDER DETAIL</h1>
      <p className="mb-6 font-mono text-xs text-muted-foreground">ID: {order.id.slice(0, 8).toUpperCase()}</p>

      <div className="mb-4">
        <span className="label-text">STATUS: </span>
        <span className={`status-${order.status}`}>{order.status?.toUpperCase()}</span>
      </div>

      <table className="mb-6 w-full">
        <thead>
          <tr className="border-b border-border">
            <th className="label-text pb-2 text-left">PRODUCT</th>
            <th className="label-text pb-2 text-right">QTY</th>
            <th className="label-text pb-2 text-right">UNIT PRICE</th>
            <th className="label-text pb-2 text-right">TOTAL</th>
          </tr>
        </thead>
        <tbody>
          {(order.order_items as any[])?.map((item: any) => (
            <tr key={item.id} className="border-b border-border">
              <td className="py-2 text-sm">{item.products?.name ?? 'Unknown'}</td>
              <td className="py-2 text-right data-text text-sm">{item.quantity}</td>
              <td className="py-2 text-right data-text text-sm">Rs. {Number(item.price_at_purchase).toFixed(2)}</td>
              <td className="py-2 text-right data-text text-sm">Rs. {(Number(item.price_at_purchase) * item.quantity).toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="space-y-1 text-sm">
        <div className="flex justify-between"><span>SUBTOTAL</span><span className="data-text">Rs. {Number(order.subtotal).toFixed(2)}</span></div>
        {Number(order.discount) > 0 && (
          <div className="flex justify-between text-success"><span>DISCOUNT</span><span className="data-text">-Rs. {Number(order.discount).toFixed(2)}</span></div>
        )}
        <div className="flex justify-between font-bold"><span>TOTAL</span><span className="data-text">Rs. {Number(order.total).toFixed(2)}</span></div>
      </div>

      <div className="mt-6 border-t border-border pt-4">
        <h3 className="label-text mb-2">SHIPPING ADDRESS</h3>
        <p className="text-sm">{address?.full_name}</p>
        <p className="text-sm">{address?.address_line_1}</p>
        {address?.address_line_2 && <p className="text-sm">{address.address_line_2}</p>}
        <p className="text-sm">{address?.city}, {address?.state} {address?.postal_code}</p>
        <p className="text-sm">{address?.country}</p>
      </div>
    </div>
  );
}
