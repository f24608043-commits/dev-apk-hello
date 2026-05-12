import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';

function FeaturedProducts() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: products } = useQuery({
    queryKey: ['featured_products'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_featured', true)
        .eq('is_active', true)
        .limit(8);
      if (error) throw error;
      return data;
    },
  });

  const addToCart = useMutation({
    mutationFn: async (productId: string) => {
      if (!user) { navigate('/login'); return; }
      const { data: existing, error: fetchError } = await supabase.from('cart_items').select('id, quantity').eq('user_id', user.id).eq('product_id', productId).single();
      
      if (fetchError && fetchError.code !== 'PGRST116') {
        throw fetchError;
      }
      
      if (existing) {
        const { error: updateError } = await supabase.from('cart_items').update({ quantity: existing.quantity + 1 }).eq('id', existing.id);
        if (updateError) throw updateError;
      } else {
        const { error: insertError } = await supabase.from('cart_items').insert({ user_id: user.id, product_id: productId, quantity: 1 });
        if (insertError) throw insertError;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart_count'] });
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });

  if (!products?.length) return null;

  return (
    <section className="border-t-2 border-foreground py-12">
      <div className="mx-auto max-w-7xl px-6">
        <h2 className="display-heading mb-8 text-xl">FEATURED PRODUCTS</h2>
        <div className="grid grid-cols-2 gap-2 border border-border bg-border sm:grid-cols-2 lg:grid-cols-4">
          {products.map((p) => (
            <div key={p.id} className="bg-background p-3">
              <Link to={`/product/${p.slug}`}>
                <div className="mb-4 aspect-square bg-muted flex items-center justify-center overflow-hidden">
                  {p.image_1 ? (
                    <img src={p.image_1} alt={p.name} className="h-full w-full object-cover" />
                  ) : (
                    <span className="font-mono text-xs text-muted-foreground">{p.name}</span>
                  )}
                </div>
              </Link>
              <Link to={`/product/${p.slug}`} className="block text-sm font-medium hover:text-accent">{p.name}</Link>
              <div className="mt-1 flex items-center gap-2">
                <span className="data-text text-sm">${Number(p.price).toFixed(2)}</span>
                {p.compare_price && (
                  <span className="data-text text-xs text-muted-foreground line-through">${Number(p.compare_price).toFixed(2)}</span>
                )}
              </div>
              <div className="mt-4 flex gap-2">
                <button
                  onClick={() => addToCart.mutate(p.id)}
                  disabled={p.stock === 0 || addToCart.isPending}
                  className="flex-1 bg-foreground py-2 text-xs font-bold uppercase tracking-widest text-background hover:bg-foreground/80 disabled:opacity-50"
                >
                  {p.stock === 0 ? 'OUT OF STOCK' : 'ADD TO CART'}
                </button>
                <button
                  onClick={() => {
                    addToCart.mutate(p.id, {
                      onSuccess: () => {
                        navigate('/checkout');
                      }
                    });
                  }}
                  disabled={p.stock === 0 || addToCart.isPending}
                  className="flex-1 bg-accent py-2 text-xs font-bold uppercase tracking-widest text-accent-foreground hover:bg-accent/80 disabled:opacity-50"
                >
                  {p.stock === 0 ? 'OUT OF STOCK' : 'BUY NOW'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ActiveDeals() {
  const [, setTick] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  const { data: deals } = useQuery({
    queryKey: ['active_deals'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('deals')
        .select('*, products(*)')
        .eq('is_active', true)
        .gt('end_date', new Date().toISOString());
      if (error) throw error;
      return data;
    },
  });

  if (!deals?.length) return null;

  function countdown(endDate: string) {
    const diff = new Date(endDate).getTime() - Date.now();
    if (diff <= 0) return '00:00:00:00';
    const d = Math.floor(diff / 86400000);
    const h = Math.floor((diff % 86400000) / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);
    return `${String(d).padStart(2, '0')}:${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }

  return (
    <section className="border-t-2 border-foreground py-12">
      <div className="mx-auto max-w-7xl px-6">
        <h2 className="display-heading mb-8 text-xl">ACTIVE DEALS</h2>
        <div className="grid grid-cols-1 gap-px border border-border bg-border sm:grid-cols-2 lg:grid-cols-3">
          {deals.map((deal) => {
            const product = deal.products as any;
            if (!product) return null;
            const discounted = Number(product.price) * (1 - Number(deal.discount_percent) / 100);
            return (
              <div key={deal.id} className="bg-background p-4">
                <Link to={`/product/${product.slug}`} className="text-sm font-medium hover:text-accent">{product.name}</Link>
                <div className="mt-2 flex items-center gap-2">
                  <span className="data-text text-sm">${discounted.toFixed(2)}</span>
                  <span className="data-text text-xs text-muted-foreground line-through">${Number(product.price).toFixed(2)}</span>
                  <span className="bg-destructive px-1 text-[10px] font-bold text-destructive-foreground">-{Number(deal.discount_percent)}%</span>
                </div>
                <div className="mt-2 font-mono text-xs text-muted-foreground">
                  ENDS IN: {countdown(deal.end_date)}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function CategoriesSection() {
  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data, error } = await supabase.from('categories').select('*');
      if (error) throw error;
      return data;
    },
  });

  if (!categories?.length) return null;

  const parentCategories = categories.filter(c => !c.parent_id);

  return (
    <section className="border-t-2 border-foreground py-12">
      <div className="mx-auto max-w-7xl px-6">
        <h2 className="display-heading mb-8 text-xl">CATEGORIES</h2>
        <div className="grid grid-cols-2 gap-px border border-border bg-border sm:grid-cols-3 lg:grid-cols-4">
          {parentCategories.map((cat) => (
            <Link key={cat.id} to={`/shop?category=${cat.slug}`} className="bg-background p-6 text-center hover:bg-muted">
              <span className="text-sm font-bold uppercase tracking-widest">{cat.name}</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

function NewsletterSection() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'success' | 'error' | 'loading'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  async function handleSubscribe(e: React.FormEvent) {
    e.preventDefault();
    setStatus('loading');
    const { error } = await supabase.from('subscribers').insert({ email });
    if (error) {
      if (error.code === '23505') {
        setErrorMsg('ALREADY_SUBSCRIBED');
      } else {
        setErrorMsg(error.message);
      }
      setStatus('error');
    } else {
      setStatus('success');
    }
  }

  return (
    <section className="border-t-2 border-foreground py-12">
      <div className="mx-auto max-w-7xl px-6 text-center">
        <h2 className="display-heading mb-4 text-xl">NEWSLETTER</h2>
        <p className="mb-6 font-mono text-xs text-muted-foreground">SUBSCRIBE FOR UPDATES AND OFFERS.</p>
        {status === 'success' ? (
          <p className="font-mono text-xs text-success">SUBSCRIBED_SUCCESSFULLY.</p>
        ) : (
          <form onSubmit={handleSubscribe} className="mx-auto flex max-w-md">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="EMAIL ADDRESS"
              required
              className="flex-1 border-2 border-foreground bg-background p-2 font-mono text-xs outline-none"
            />
            <button
              type="submit"
              disabled={status === 'loading'}
              className="bg-foreground px-6 py-2 text-xs font-bold uppercase tracking-widest text-background hover:bg-foreground/80 disabled:opacity-50"
            >
              SUBSCRIBE
            </button>
          </form>
        )}
        {status === 'error' && <p className="mt-2 font-mono text-xs text-destructive">{errorMsg}</p>}
      </div>
    </section>
  );
}

export default function HomePage() {
  const { data: heroHeading } = useQuery({
    queryKey: ['settings', 'hero_heading'],
    queryFn: async () => {
      const { data } = await supabase.from('settings').select('value').eq('key', 'hero_heading').single();
      return data?.value ?? 'PROVISIONS FOR THE MODERN STACK.';
    },
  });

  const { data: heroSubheading } = useQuery({
    queryKey: ['settings', 'hero_subheading'],
    queryFn: async () => {
      const { data } = await supabase.from('settings').select('value').eq('key', 'hero_subheading').single();
      return data?.value ?? 'QUALITY GOODS. ZERO COMPROMISE.';
    },
  });

  return (
    <div>
      <section className="flex min-h-[60vh] flex-col items-center justify-center px-6 py-24">
        <h1 className="display-heading mb-4 text-center text-4xl md:text-5xl">{heroHeading}</h1>
        <p className="mb-8 font-mono text-sm text-muted-foreground">{heroSubheading}</p>
        <Link
          to="/shop"
          className="bg-foreground px-8 py-3 text-xs font-bold uppercase tracking-widest text-background hover:bg-foreground/80"
        >
          SHOP NOW
        </Link>
      </section>
      <FeaturedProducts />
      <ActiveDeals />
      <CategoriesSection />
      <NewsletterSection />
    </div>
  );
}
