import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';

export default function ShopPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const filters = {
    category: searchParams.get('category') || '',
    brand: searchParams.get('brand') || '',
    search: searchParams.get('search') || '',
    minPrice: searchParams.get('min_price') || '',
    maxPrice: searchParams.get('max_price') || '',
    sort: searchParams.get('sort') || 'newest',
    page: parseInt(searchParams.get('page') || '1'),
  };

  const perPage = 12;

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data } = await supabase.from('categories').select('*').order('name');
      return data ?? [];
    },
  });

  const { data: brands } = useQuery({
    queryKey: ['brands'],
    queryFn: async () => {
      const { data } = await supabase.from('brands').select('*').order('name');
      return data ?? [];
    },
  });

  // Group categories
  const parentCategories = categories?.filter(c => !c.parent_id) ?? [];
  const getSubcategories = (parentId: string) => categories?.filter(c => c.parent_id === parentId) ?? [];

  // Determine selected category and its subcategory IDs for filtering
  const selectedCategory = categories?.find(c => c.slug === filters.category);
  const isParentCategory = selectedCategory && !selectedCategory.parent_id;

  const { data: productsData, isLoading } = useQuery({
    queryKey: ['products', filters, categories],
    queryFn: async () => {
      let query = supabase
        .from('products')
        .select('*, categories(name, slug), brands(name, slug)', { count: 'exact' })
        .eq('is_active', true);

      if (filters.category && selectedCategory) {
        if (isParentCategory) {
          // Parent category: fetch products in parent + all subcategories
          const subIds = getSubcategories(selectedCategory.id).map(c => c.id);
          const allIds = [selectedCategory.id, ...subIds];
          query = query.in('category_id', allIds);
        } else {
          // Subcategory: fetch products in this subcategory only
          query = query.eq('category_id', selectedCategory.id);
        }
      }

      if (filters.brand) query = query.eq('brand_id', brands?.find(b => b.slug === filters.brand)?.id ?? '');
      if (filters.search) query = query.ilike('name', `%${filters.search}%`);
      if (filters.minPrice) query = query.gte('price', parseFloat(filters.minPrice));
      if (filters.maxPrice) query = query.lte('price', parseFloat(filters.maxPrice));

      if (filters.sort === 'price_asc') query = query.order('price', { ascending: true });
      else if (filters.sort === 'price_desc') query = query.order('price', { ascending: false });
      else if (filters.sort === 'name_asc') query = query.order('name', { ascending: true });
      else query = query.order('created_at', { ascending: false });

      const from = (filters.page - 1) * perPage;
      query = query.range(from, from + perPage - 1);

      const { data, error, count } = await query;
      if (error) throw error;
      return { products: data ?? [], total: count ?? 0 };
    },
    enabled: categories !== undefined && brands !== undefined,
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

  function updateParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams);
    if (value) params.set(key, value);
    else params.delete(key);
    if (key !== 'page') params.delete('page');
    setSearchParams(params);
  }

  const totalPages = Math.ceil((productsData?.total ?? 0) / perPage);

  return (
    <div className="min-h-screen bg-gray-50 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute top-20 left-20 w-72 h-72 bg-gray-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
      <div className="absolute top-40 right-20 w-72 h-72 bg-gray-400 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>
      <div className="absolute -bottom-8 left-40 w-72 h-72 bg-gray-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000"></div>

      <div className="relative z-10 container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-black mb-4">Shop</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">Discover our complete range of herbal remedies</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <aside className="lg:col-span-1 space-y-6">
            <div className="backdrop-blur-xl bg-white/20 border border-white/30 rounded-3xl p-6 shadow-2xl">
              <h3 className="text-lg font-bold text-black mb-4">Categories</h3>
              {parentCategories.map((parent) => {
                const subs = getSubcategories(parent.id);
                return (
                  <div key={parent.id} className="mb-4">
                    <label className="flex items-center gap-3 py-2 cursor-pointer hover:bg-white/10 rounded-lg px-2 transition-colors duration-300">
                      <input
                        type="checkbox"
                        checked={filters.category === parent.slug}
                        onChange={() => updateParam('category', filters.category === parent.slug ? '' : parent.slug)}
                        className="w-4 h-4 text-black bg-white border-gray-300 rounded focus:ring-black focus:ring-2"
                      />
                      <span className="text-sm font-medium text-black">{parent.name}</span>
                    </label>
                    {subs.map((sub) => (
                      <label key={sub.id} className="flex items-center gap-3 py-2 pl-8 cursor-pointer hover:bg-white/10 rounded-lg px-2 transition-colors duration-300">
                        <input
                          type="checkbox"
                          checked={filters.category === sub.slug}
                          onChange={() => updateParam('category', filters.category === sub.slug ? '' : sub.slug)}
                          className="w-4 h-4 text-black bg-white border-gray-300 rounded focus:ring-black focus:ring-2"
                        />
                        <span className="text-sm text-gray-600">{sub.name}</span>
                      </label>
                    ))}
                  </div>
                );
              })}
            </div>

            <div className="backdrop-blur-xl bg-white/20 border border-white/30 rounded-3xl p-6 shadow-2xl">
              <h3 className="text-lg font-bold text-black mb-4">Brands</h3>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {brands?.map((b) => (
                  <label key={b.id} className="flex items-center gap-3 py-2 cursor-pointer hover:bg-white/10 rounded-lg px-2 transition-colors duration-300">
                    <input
                      type="checkbox"
                      checked={filters.brand === b.slug}
                      onChange={() => updateParam('brand', filters.brand === b.slug ? '' : b.slug)}
                      className="w-4 h-4 text-black bg-white border-gray-300 rounded focus:ring-black focus:ring-2"
                    />
                    <span className="text-sm text-gray-600">{b.name}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="backdrop-blur-xl bg-white/20 border border-white/30 rounded-3xl p-6 shadow-2xl">
              <h3 className="text-lg font-bold text-black mb-4">Price Range</h3>
              <div className="flex gap-3">
                <input
                  type="number"
                  placeholder="MIN"
                  value={filters.minPrice}
                  onChange={(e) => updateParam('min_price', e.target.value)}
                  className="flex-1 bg-white/30 backdrop-blur-sm border-2 border-white/40 p-3 rounded-2xl font-mono text-sm text-gray-800 placeholder-gray-500 outline-none focus:border-black focus:bg-white/50 transition-all duration-300"
                />
                <input
                  type="number"
                  placeholder="MAX"
                  value={filters.maxPrice}
                  onChange={(e) => updateParam('max_price', e.target.value)}
                  className="flex-1 bg-white/30 backdrop-blur-sm border-2 border-white/40 p-3 rounded-2xl font-mono text-sm text-gray-800 placeholder-gray-500 outline-none focus:border-black focus:bg-white/50 transition-all duration-300"
                />
              </div>
            </div>
          </aside>

        {/* Main content */}
        <div className="lg:col-span-3">
          <div className="backdrop-blur-xl bg-white/20 border border-white/30 rounded-3xl p-6 shadow-2xl mb-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <input
                type="text"
                placeholder="SEARCH PRODUCTS..."
                value={filters.search}
                onChange={(e) => updateParam('search', e.target.value)}
                className="flex-1 bg-white/30 backdrop-blur-sm border-2 border-white/40 p-3 rounded-2xl font-mono text-sm text-gray-800 placeholder-gray-500 outline-none focus:border-black focus:bg-white/50 transition-all duration-300 sm:w-64"
              />
              <select
                value={filters.sort}
                onChange={(e) => updateParam('sort', e.target.value)}
                className="bg-white/30 backdrop-blur-sm border-2 border-white/40 p-3 rounded-2xl font-mono text-sm text-gray-800 outline-none focus:border-black focus:bg-white/50 transition-all duration-300"
              >
                <option value="newest">NEWEST</option>
                <option value="price_asc">PRICE: LOW → HIGH</option>
                <option value="price_desc">PRICE: HIGH → LOW</option>
                <option value="name_asc">NAME A → Z</option>
              </select>
            </div>
          </div>

          {/* Category banner */}
          {selectedCategory && (
            <div className="backdrop-blur-xl bg-white/20 border border-white/30 rounded-3xl p-6 shadow-2xl mb-6">
              {selectedCategory.banner_image_url && (
                <img src={selectedCategory.banner_image_url} alt={selectedCategory.name} className="mb-4 w-full object-cover rounded-2xl" style={{ maxHeight: 200 }} />
              )}
              <h2 className="text-2xl font-bold text-black">{selectedCategory.name}</h2>
            </div>
          )}

          {isLoading ? (
            <div className="backdrop-blur-xl bg-white/20 border border-white/30 rounded-3xl p-12 shadow-2xl text-center">
              <p className="font-mono text-sm text-gray-600">FETCHING DATA...</p>
            </div>
          ) : productsData?.products.length === 0 ? (
            <div className="backdrop-blur-xl bg-white/20 border border-white/30 rounded-3xl p-12 shadow-2xl text-center">
              <p className="font-mono text-sm text-gray-600">NO PRODUCTS FOUND.</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {productsData?.products.map((p) => (
                  <div key={p.id} className="backdrop-blur-xl bg-white/20 border border-white/30 rounded-3xl p-6 shadow-2xl hover:shadow-3xl transition-all duration-300">
                    <Link to={`/product/${p.slug}`}>
                      <div className="mb-6 aspect-square bg-gray-100 flex items-center justify-center overflow-hidden rounded-2xl">
                        {p.image_1 ? (
                          <img src={p.image_1} alt={p.name} className="h-full w-full object-cover hover:scale-105 transition-transform duration-300" />
                        ) : (
                          <span className="font-mono text-sm text-gray-500">{p.name}</span>
                        )}
                      </div>
                    </Link>
                    <Link to={`/product/${p.slug}`} className="block text-lg font-bold text-black hover:text-gray-700 transition-colors duration-300 mb-2">{p.name}</Link>
                    <div className="flex items-center gap-2 mb-4">
                      <span className="text-lg font-bold text-black">${Number(p.price).toFixed(2)}</span>
                      {p.compare_price && (
                        <span className="text-sm text-gray-500 line-through">${Number(p.compare_price).toFixed(2)}</span>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => addToCart.mutate(p.id)}
                        disabled={p.stock === 0 || addToCart.isPending}
                        className="flex-1 bg-black text-white py-2 px-4 rounded-2xl font-mono text-xs font-bold uppercase tracking-widest hover:bg-gray-900 transition-all duration-300 disabled:opacity-50"
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
                        className="flex-1 bg-gray-800 text-white py-2 px-4 rounded-2xl font-mono text-xs font-bold uppercase tracking-widest hover:bg-gray-700 transition-all duration-300 disabled:opacity-50"
                      >
                        {p.stock === 0 ? 'OUT OF STOCK' : 'BUY NOW'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {totalPages > 1 && (
                <div className="backdrop-blur-xl bg-white/20 border border-white/30 rounded-3xl p-6 shadow-2xl mt-6">
                  <div className="flex items-center justify-center gap-4">
                    <button
                      disabled={filters.page <= 1}
                      onClick={() => updateParam('page', String(filters.page - 1))}
                      className="bg-black text-white px-6 py-2 rounded-2xl font-mono text-xs font-bold uppercase tracking-widest hover:bg-gray-900 transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      ← PREV
                    </button>
                    <span className="font-mono text-sm text-gray-600">PAGE {filters.page} / {totalPages}</span>
                    <button
                      disabled={filters.page >= totalPages}
                      onClick={() => updateParam('page', String(filters.page + 1))}
                      className="bg-black text-white px-6 py-2 rounded-2xl font-mono text-xs font-bold uppercase tracking-widest hover:bg-gray-900 transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      NEXT →
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
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
