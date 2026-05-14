import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Hero from '@/components/hero/Hero';
import { Banner } from '@/components/hero/HeroSlider';

import ProductCard from '@/components/products/ProductCard';
import SocialSection from '@/components/SocialSection';

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
    <section className="py-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-black mb-4">Featured Products</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">Discover our most popular herbal remedies</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
          {products.map((p) => (
            <div key={p.id} className="h-full">
              <ProductCard 
                product={p as any} 
                onAddToCart={(id) => addToCart.mutate(id)} 
              />
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
    <section className="py-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-black mb-4">Active Deals</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">Limited time offers on our best products</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {deals.map((deal) => {
            const product = deal.products as any;
            if (!product) return null;
            const discounted = Number(product.price) * (1 - Number(deal.discount_percent) / 100);
            return (
              <div key={deal.id} className="backdrop-blur-xl bg-[#DCEDC8]/60 border border-white/30 rounded-3xl p-6 shadow-2xl hover:shadow-3xl transition-all duration-300">
                <Link to={`/product/${product.slug}`} className="block text-lg font-bold text-black hover:text-gray-700 transition-colors duration-300 mb-4">{product.name}</Link>
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-xl font-bold text-black">Rs. {discounted.toFixed(2)}</span>
                  <span className="text-sm text-gray-500 line-through">Rs. {Number(product.price).toFixed(2)}</span>
                  <span className="bg-red-500 text-white px-2 py-1 text-xs font-bold rounded-full">-{Number(deal.discount_percent)}%</span>
                </div>
                <div className="font-mono text-sm text-gray-600 mb-4">
                  ⏰ ENDS IN: {countdown(deal.end_date)}
                </div>
                <Link 
                  to={`/product/${product.slug}`}
                  className="block w-full bg-black text-white py-2 px-4 rounded-2xl font-mono text-xs font-bold uppercase tracking-widest hover:bg-gray-900 transition-all duration-300 text-center"
                >
                  VIEW DEAL
                </Link>
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
    <section className="py-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-black mb-4">Categories</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">Browse our herbal remedies by category</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {parentCategories.map((cat) => (
            <Link 
              key={cat.id} 
              to={`/shop?category=${cat.slug}`} 
              className="backdrop-blur-xl bg-[#DCEDC8]/60 border border-white/30 rounded-3xl p-8 text-center shadow-2xl hover:shadow-3xl transition-all duration-300 group"
            >
              <div className="w-16 h-16 bg-black/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-black/30 transition-colors duration-300">
                <svg className="w-8 h-8 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <span className="text-sm font-bold uppercase tracking-widest text-black group-hover:text-gray-700 transition-colors duration-300">{cat.name}</span>
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
    <section className="py-16">
      <div className="container mx-auto px-4">
        <div className="backdrop-blur-xl bg-[#DCEDC8]/60 border border-white/30 rounded-3xl p-12 shadow-2xl max-w-2xl mx-auto text-center">
          <div className="w-20 h-20 bg-black/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-black mb-4">Newsletter</h2>
          <p className="text-gray-600 mb-8 max-w-md mx-auto">Subscribe for updates and exclusive offers on our herbal remedies</p>
          {status === 'success' ? (
            <div className="backdrop-blur-xl bg-green-100/50 border border-green-200/30 rounded-2xl p-6">
              <p className="font-mono text-sm text-green-800 font-bold">✓ SUBSCRIBED SUCCESSFULLY</p>
            </div>
          ) : (
            <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="EMAIL ADDRESS"
                required
                className="flex-1 bg-white/30 backdrop-blur-sm border-2 border-white/40 p-3 rounded-2xl font-mono text-sm text-gray-800 placeholder-gray-500 outline-none focus:border-black focus:bg-white/50 transition-all duration-300"
              />
              <button
                type="submit"
                disabled={status === 'loading'}
                className="bg-black text-white px-8 py-3 rounded-2xl font-mono text-sm font-bold uppercase tracking-widest hover:bg-gray-900 transition-all duration-300 shadow-lg disabled:opacity-50"
              >
                {status === 'loading' ? 'SUBSCRIBING...' : 'SUBSCRIBE'}
              </button>
            </form>
          )}
          {status === 'error' && <p className="mt-4 font-mono text-sm text-red-600">{errorMsg}</p>}
        </div>
      </div>
    </section>
  );
}

import MainHero from '@/components/hero/MainHero';

export default function HomePage() {
  const banners: Banner[] = [
    {
      id: '1',
      image: 'https://lh3.googleusercontent.com/pw/AP1GczOhwkUAMxu5IsvpAQoq7s1nMwtvQMovRx5JcA4omfHZkgdAOtfW-LShlm4kI381WQtVCTATK4PsLdeg6Ebz66Ftc_dAT6N8VAN5OjQc8pBOdlySf90SbK2zT76AjIBwZgv2-9sMzWGKHSpp4_jKjwg=w1631-h667-s-no-gm',
      title: 'Badshah Di Hatti',
      subtitle: 'Authentic Herbal Solutions for Generations',
    },
    {
      id: '2',
      image: 'https://lh3.googleusercontent.com/pw/AP1GczMd3XoTegfD7jcRcR8_Eh3bsw8WXCJAu4jYcsMOgNb5dloBVjZbFhyBgLEdLIisCge51VYvpy2YKeEJ_GB8MS-H6XWRqOyY7RI75VrNIEZKTgaXb5onSUWMqsmK2AQLZXPAq8TdBsKGOC9XYUtqMSM=w1162-h467-s-no-gm',
      title: '100% Natural Treatments',
      subtitle: 'Preserving the Heritage of Tibb',
    },
    {
      id: '3',
      image: 'https://lh3.googleusercontent.com/pw/AP1GczMcRfiM3k2uao8llvnzOygGpYPpM8eQgAPbulvbV0ClQzbyKtYuaf88KvHA9_P_BMX0DNOHM5g0Gq8Hi2y888VvUQNxKyrL6QpqlrB-KRFRZFp2tcpH1JAETzonNFe47Q-ZE6iuH67L9oLNMB3Pmw0=w1376-h768-s-no-gm?authuser=0',
      title: 'Premium Herbal Care',
      subtitle: 'Expert Remedies for Men, Women & Children',
    },
  ];

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute top-20 left-20 w-72 h-72 bg-gray-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
      <div className="absolute top-40 right-20 w-72 h-72 bg-gray-400 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>
      <div className="absolute -bottom-8 left-40 w-72 h-72 bg-gray-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000"></div>

      <div className="relative z-10">
        {/* Main Profile Hero */}
        <MainHero />

        {/* Banner Slider Hero */}
        <div className="container mx-auto px-4 mb-16">
          <Hero banners={banners} />
        </div>

        <div className="container mx-auto px-4 py-16">
          <FeaturedProducts />
          <ActiveDeals />
          <CategoriesSection />
          <NewsletterSection />
          <SocialSection />
        </div>
      </div>

      <style>{`
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
}
