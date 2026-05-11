import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';

export default function CartPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [couponCode, setCouponCode] = useState('');
  const [couponResult, setCouponResult] = useState<any>(null);
  const [couponError, setCouponError] = useState('');

  const { data: cartItems, isLoading, error } = useQuery({
    queryKey: ['cart', user?.id],
    queryFn: async () => {
      if (!user?.id) throw new Error('User not authenticated');
      console.log('Fetching cart for user:', user.id);
      const { data, error } = await supabase
        .from('cart_items')
        .select('*, products(id, name, slug, price, stock, images)')
        .eq('user_id', user.id);
      if (error) throw error;
      console.log('Cart items fetched:', data);
      return data ?? [];
    },
    enabled: !!user?.id,
    retry: 2,
  });

  const updateQty = useMutation({
    mutationFn: async ({ id, quantity }: { id: string; quantity: number }) => {
      const { error } = quantity <= 0
        ? await supabase.from('cart_items').delete().eq('id', id)
        : await supabase.from('cart_items').update({ quantity }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      queryClient.invalidateQueries({ queryKey: ['cart_count'] });
    },
  });

  const removeItem = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('cart_items').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      queryClient.invalidateQueries({ queryKey: ['cart_count'] });
    },
  });

  async function applyCoupon() {
    setCouponError('');
    setCouponResult(null);
    const { data, error } = await supabase.rpc('validate_coupon', {
      coupon_code: couponCode,
      order_subtotal: subtotal,
    });
    if (error) {
      setCouponError(error.message);
    } else {
      const result = data as any;
      if (result.valid) {
        setCouponResult(result);
      } else {
        setCouponError(result.error);
      }
    }
  }

  if (isLoading) return <div className="p-6 font-mono text-xs text-muted-foreground">FETCHING DATA...</div>;

  if (error) {
    return (
      <div className="mx-auto max-w-7xl px-6 py-12 text-center">
        <p className="font-mono text-sm text-destructive">ERROR LOADING CART: {error.message}</p>
        <Link to="/shop" className="mt-4 inline-block font-mono text-xs text-accent hover:underline">→ CONTINUE SHOPPING</Link>
      </div>
    );
  }

  if (!cartItems?.length) {
    return (
      <div className="mx-auto max-w-7xl px-6 py-12 text-center">
        <p className="font-mono text-sm text-muted-foreground">YOUR CART IS EMPTY.</p>
        <Link to="/shop" className="mt-4 inline-block font-mono text-xs text-accent hover:underline">→ CONTINUE SHOPPING</Link>
      </div>
    );
  }

  const subtotal = cartItems.reduce((sum, item) => {
    const product = item.products as any;
    return sum + Number(product.price) * item.quantity;
  }, 0);

  const discount = couponResult?.discount_amount ?? 0;
  const total = subtotal - discount;

  return (
    <div className="mx-auto max-w-7xl px-6 py-8">
      <h1 className="display-heading mb-8 text-2xl">CART</h1>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-foreground">
                <th className="label-text pb-2 text-left">PRODUCT</th>
                <th className="label-text pb-2 text-right">PRICE</th>
                <th className="label-text pb-2 text-center">QTY</th>
                <th className="label-text pb-2 text-right">TOTAL</th>
                <th className="pb-2"></th>
              </tr>
            </thead>
            <tbody>
              {cartItems.map((item) => {
                const product = item.products as any;
                return (
                  <tr key={item.id} className="border-b border-border">
                    <td className="py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 flex-shrink-0 bg-muted flex items-center justify-center overflow-hidden">
                          {product.images?.[0] ? (
                            <img src={product.images[0]} alt="" className="h-full w-full object-cover" />
                          ) : (
                            <span className="text-[8px] text-muted-foreground">IMG</span>
                          )}
                        </div>
                        <Link to={`/product/${product.slug}`} className="text-sm font-medium hover:text-accent">{product.name}</Link>
                      </div>
                    </td>
                    <td className="py-4 text-right data-text text-sm">${Number(product.price).toFixed(2)}</td>
                    <td className="py-4 text-center">
                      <input
                        type="number"
                        min={1}
                        max={product.stock}
                        value={item.quantity}
                        onChange={(e) => updateQty.mutate({ id: item.id, quantity: parseInt(e.target.value) || 1 })}
                        className="w-16 border-2 border-border bg-background p-1 text-center font-mono text-xs outline-none focus:border-foreground"
                      />
                    </td>
                    <td className="py-4 text-right data-text text-sm">${(Number(product.price) * item.quantity).toFixed(2)}</td>
                    <td className="py-4 text-right">
                      <button
                        onClick={() => { if (confirm('Remove this item?')) removeItem.mutate(item.id); }}
                        className="font-mono text-xs text-destructive hover:underline"
                      >
                        ✕
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="border-2 border-foreground p-6">
          <h2 className="label-text mb-4">ORDER SUMMARY</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>SUBTOTAL</span>
              <span className="data-text">${subtotal.toFixed(2)}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-success">
                <span>DISCOUNT</span>
                <span className="data-text">-${discount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between border-t border-border pt-2 font-bold">
              <span>TOTAL</span>
              <span className="data-text">${total.toFixed(2)}</span>
            </div>
          </div>

          <div className="mt-6">
            <label className="label-text mb-2 block">COUPON CODE</label>
            <div className="flex">
              <input
                type="text"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                className="flex-1 border-2 border-border bg-background p-2 font-mono text-xs outline-none focus:border-foreground"
                placeholder="ENTER CODE"
              />
              <button onClick={applyCoupon} className="bg-foreground px-4 text-xs font-bold text-background hover:bg-foreground/80">
                APPLY
              </button>
            </div>
            {couponError && <p className="mt-1 font-mono text-xs text-destructive">{couponError}</p>}
            {couponResult && <p className="mt-1 font-mono text-xs text-success">COUPON_APPLIED: -${couponResult.discount_amount.toFixed(2)}</p>}
          </div>

          <button
            onClick={() => navigate('/checkout', { state: { couponCode: couponResult ? couponCode : null } })}
            className="mt-6 w-full bg-foreground py-3 text-xs font-bold uppercase tracking-widest text-background hover:bg-foreground/80"
          >
            PROCEED TO CHECKOUT
          </button>
        </div>
      </div>
    </div>
  );
}
