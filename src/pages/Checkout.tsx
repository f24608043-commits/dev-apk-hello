import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { getLocalCart, clearLocalCart } from '@/lib/cart';

export default function CheckoutPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const couponCode = (location.state as any)?.couponCode ?? null;

  const [form, setForm] = useState({
    full_name: '',
    email: '',
    address_line_1: '',
    address_line_2: '',
    city: '',
    phone_number: '',
    additional_information: '',
    country: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [placing, setPlacing] = useState(false);
  const [orderError, setOrderError] = useState('');

  // Authenticated user cart from Supabase
  const { data: supabaseCartItems } = useQuery({
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

  // Guest cart: get product details for local storage items
  const localCart = getLocalCart();
  const localProductIds = localCart.map(i => i.product_id);

  const { data: guestProducts } = useQuery({
    queryKey: ['guest_checkout_products', ...localProductIds],
    queryFn: async () => {
      if (localProductIds.length === 0) return [];
      const { data, error } = await supabase
        .from('products')
        .select('id, name, price')
        .in('id', localProductIds);
      if (error) throw error;
      return data ?? [];
    },
    enabled: !user && localProductIds.length > 0,
  });

  // Normalize into unified shape
  const cartItems = user
    ? (supabaseCartItems ?? []).map(item => ({
      product_id: (item.products as any).id,
      name: (item.products as any).name,
      price: Number((item.products as any).price),
      quantity: item.quantity,
    }))
    : localCart.map(item => {
      const product = guestProducts?.find(p => p.id === item.product_id);
      return product
        ? { product_id: product.id, name: product.name, price: Number(product.price), quantity: item.quantity }
        : null;
    }).filter(Boolean) as { product_id: string; name: string; price: number; quantity: number }[];

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

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
    if (!form.phone_number.trim()) errs.phone_number = 'REQUIRED';
    if (!form.country.trim()) errs.country = 'REQUIRED';
    // Email is required for guests, optional for logged-in users
    if (!user && !form.email.trim()) errs.email = 'REQUIRED';
    if (form.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) errs.email = 'INVALID EMAIL';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function placeOrder() {
    if (!validate()) return;
    setPlacing(true);
    setOrderError('');

    const items = cartItems.map((item) => ({
      product_id: item.product_id,
      quantity: item.quantity,
    }));

    const shippingAddress = { ...form };

    const { data, error } = await supabase.rpc('place_order', {
      p_user_id: user?.id ?? null,
      p_items: items,
      p_shipping_address: shippingAddress,
      p_coupon_code: couponCode,
    });

    if (error) {
      setOrderError(error.message);
      setPlacing(false);
    } else {
      // Clear local cart for guests
      if (!user) {
        clearLocalCart();
      }
      navigate(`/order-confirmation?id=${data}`, { replace: true });
    }
  }

  const allFields = [
    { key: 'full_name', label: 'FULL NAME' },
    ...(!user ? [{ key: 'email', label: 'EMAIL ADDRESS' }] : []),
    { key: 'address_line_1', label: 'ADDRESS LINE 1' },
    { key: 'address_line_2', label: 'ADDRESS LINE 2 (OPTIONAL)' },
    { key: 'city', label: 'CITY' },
    { key: 'phone_number', label: 'PHONE NUMBER' },
    { key: 'additional_information', label: 'ADDITIONAL INFORMATION (OPTIONAL)' },
    { key: 'country', label: 'COUNTRY' },
  ];

  return (
    <div className="mx-auto max-w-7xl px-6 py-8">
      <h1 className="display-heading mb-8 text-2xl">CHECKOUT</h1>

      {!user && (
        <div className="mb-6 border-2 border-accent bg-accent/5 p-4">
          <p className="font-mono text-xs text-muted-foreground">
            CHECKING OUT AS GUEST. <a href="/login" className="text-accent hover:underline font-bold">LOGIN</a> FOR A FASTER EXPERIENCE.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <div>
          <h2 className="label-text mb-4">SHIPPING ADDRESS</h2>
          <div className="space-y-4">
            {allFields.map(({ key, label }) => (
              <div key={key}>
                <label className="label-text mb-1 block">{label}</label>
                <input
                  type={key === 'email' ? 'email' : 'text'}
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
            {cartItems.map((item) => (
              <div key={item.product_id} className="flex justify-between text-sm">
                <span>{item.name} × {item.quantity}</span>
                <span className="data-text">Rs. {(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 space-y-2 border-t border-border pt-4 text-sm">
            <div className="flex justify-between">
              <span>SUBTOTAL</span>
              <span className="data-text">Rs. {subtotal.toFixed(2)}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-success">
                <span>DISCOUNT</span>
                <span className="data-text">-Rs. {discount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between font-bold">
              <span>TOTAL</span>
              <span className="data-text">Rs. {total.toFixed(2)}</span>
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
