import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';

export default function CheckoutPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const couponCode = (location.state as any)?.couponCode ?? null;

  const [form, setForm] = useState({
    full_name: '',
    address_line_1: '',
    address_line_2: '',
    city: '',
    state: '',
    postal_code: '',
    country: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [placing, setPlacing] = useState(false);
  const [orderError, setOrderError] = useState('');

  const { data: cartItems } = useQuery({
    queryKey: ['cart', user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from('cart_items')
        .select('*, products(id, name, price)')
        .eq('user_id', user!.id);
      return data ?? [];
    },
    enabled: !!user,
  });

  const subtotal = cartItems?.reduce((sum, item) => sum + Number((item.products as any).price) * item.quantity, 0) ?? 0;

  const { data: couponResult } = useQuery({
    queryKey: ['validate_coupon_checkout', couponCode, subtotal],
    queryFn: async () => {
      if (!couponCode) return null;
      const { data } = await supabase.rpc('validate_coupon', { coupon_code: couponCode, order_subtotal: subtotal });
      return (data as any)?.valid ? data : null;
    },
    enabled: !!couponCode && subtotal > 0,
  });

  const discount = (couponResult as any)?.discount_amount ?? 0;
  const total = subtotal - discount;

  function validate() {
    const errs: Record<string, string> = {};
    if (!form.full_name.trim()) errs.full_name = 'REQUIRED';
    if (!form.address_line_1.trim()) errs.address_line_1 = 'REQUIRED';
    if (!form.city.trim()) errs.city = 'REQUIRED';
    if (!form.state.trim()) errs.state = 'REQUIRED';
    if (!form.postal_code.trim()) errs.postal_code = 'REQUIRED';
    if (!form.country.trim()) errs.country = 'REQUIRED';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function placeOrder() {
    if (!validate()) return;
    setPlacing(true);
    setOrderError('');

    const items = cartItems!.map((item) => ({
      product_id: (item.products as any).id,
      quantity: item.quantity,
    }));

    const { data, error } = await supabase.rpc('place_order', {
      p_user_id: user!.id,
      p_items: items,
      p_shipping_address: form,
      p_coupon_code: couponCode,
    });

    if (error) {
      setOrderError(error.message);
      setPlacing(false);
    } else {
      navigate(`/order-confirmation?id=${data}`, { replace: true });
    }
  }

  const requiredFields = [
    { key: 'full_name', label: 'FULL NAME' },
    { key: 'address_line_1', label: 'ADDRESS LINE 1' },
    { key: 'address_line_2', label: 'ADDRESS LINE 2 (OPTIONAL)' },
    { key: 'city', label: 'CITY' },
    { key: 'state', label: 'STATE' },
    { key: 'postal_code', label: 'POSTAL CODE' },
    { key: 'country', label: 'COUNTRY' },
  ];

  return (
    <div className="mx-auto max-w-7xl px-6 py-8">
      <h1 className="display-heading mb-8 text-2xl">CHECKOUT</h1>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <div>
          <h2 className="label-text mb-4">SHIPPING ADDRESS</h2>
          <div className="space-y-4">
            {requiredFields.map(({ key, label }) => (
              <div key={key}>
                <label className="label-text mb-1 block">{label}</label>
                <input
                  type="text"
                  value={form[key as keyof typeof form]}
                  onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                  className="w-full border-2 border-border bg-background p-2 font-mono text-xs outline-none focus:border-foreground"
                />
                {errors[key] && <p className="mt-1 font-mono text-xs text-destructive">{errors[key]}</p>}
              </div>
            ))}
          </div>
        </div>

        <div className="border-2 border-foreground p-6">
          <h2 className="label-text mb-4">ORDER SUMMARY</h2>
          <div className="space-y-2">
            {cartItems?.map((item) => {
              const product = item.products as any;
              return (
                <div key={item.id} className="flex justify-between text-sm">
                  <span>{product.name} × {item.quantity}</span>
                  <span className="data-text">${(Number(product.price) * item.quantity).toFixed(2)}</span>
                </div>
              );
            })}
          </div>
          <div className="mt-4 space-y-2 border-t border-border pt-4 text-sm">
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
            <div className="flex justify-between font-bold">
              <span>TOTAL</span>
              <span className="data-text">${total.toFixed(2)}</span>
            </div>
          </div>

          {orderError && <p className="mt-4 font-mono text-xs text-destructive">{orderError}</p>}

          <button
            onClick={placeOrder}
            disabled={placing}
            className="mt-6 w-full bg-foreground py-3 text-xs font-bold uppercase tracking-widest text-background hover:bg-foreground/80 disabled:opacity-50"
          >
            {placing ? 'PLACING ORDER...' : 'PLACE ORDER'}
          </button>
        </div>
      </div>
    </div>
  );
}
