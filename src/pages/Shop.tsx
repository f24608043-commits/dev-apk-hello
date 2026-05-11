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
    <div className="mx-auto max-w-7xl px-6 py-8">
      <h1 className="display-heading mb-8 text-2xl">SHOP</h1>

      <div className="grid grid-cols-12 gap-8">
        {/* Sidebar */}
        <aside className="col-span-12 space-y-6 md:col-span-3">
          <div>
            <h3 className="label-text mb-3">CATEGORIES</h3>
            {parentCategories.map((parent) => {
              const subs = getSubcategories(parent.id);
              return (
                <div key={parent.id}>
                  <label className="flex items-center gap-2 py-1">
                    <input
                      type="checkbox"
                      checked={filters.category === parent.slug}
                      onChange={() => updateParam('category', filters.category === parent.slug ? '' : parent.slug)}
                      className="accent-foreground"
                    />
                    <span className="text-xs font-bold">{parent.name}</span>
                  </label>
                  {subs.map((sub) => (
                    <label key={sub.id} className="flex items-center gap-2 py-1" style={{ paddingLeft: 16 }}>
                      <input
                        type="checkbox"
                        checked={filters.category === sub.slug}
                        onChange={() => updateParam('category', filters.category === sub.slug ? '' : sub.slug)}
                        className="accent-foreground"
                      />
                      <span className="text-xs">{sub.name}</span>
                    </label>
                  ))}
                </div>
              );
            })}
          </div>

          <div>
            <h3 className="label-text mb-3">BRANDS</h3>
            {brands?.map((b) => (
              <label key={b.id} className="flex items-center gap-2 py-1">
                <input
                  type="checkbox"
                  checked={filters.brand === b.slug}
                  onChange={() => updateParam('brand', filters.brand === b.slug ? '' : b.slug)}
                  className="accent-foreground"
                />
                <span className="text-xs">{b.name}</span>
              </label>
            ))}
          </div>

          <div>
            <h3 className="label-text mb-3">PRICE RANGE</h3>
            <div className="flex gap-2">
              <input
                type="number"
                placeholder="MIN"
                value={filters.minPrice}
                onChange={(e) => updateParam('min_price', e.target.value)}
                className="w-full border-2 border-border bg-background p-2 font-mono text-xs outline-none focus:border-foreground"
              />
              <input
                type="number"
                placeholder="MAX"
                value={filters.maxPrice}
                onChange={(e) => updateParam('max_price', e.target.value)}
                className="w-full border-2 border-border bg-background p-2 font-mono text-xs outline-none focus:border-foreground"
              />
            </div>
          </div>
        </aside>

        {/* Main content */}
        <div className="col-span-12 md:col-span-9">
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <input
              type="text"
              placeholder="SEARCH PRODUCTS..."
              value={filters.search}
              onChange={(e) => updateParam('search', e.target.value)}
              className="border-2 border-border bg-background p-2 font-mono text-xs outline-none focus:border-foreground sm:w-64"
            />
            <select
              value={filters.sort}
              onChange={(e) => updateParam('sort', e.target.value)}
              className="border-2 border-border bg-background p-2 font-mono text-xs outline-none focus:border-foreground"
            >
              <option value="newest">NEWEST</option>
              <option value="price_asc">PRICE: LOW → HIGH</option>
              <option value="price_desc">PRICE: HIGH → LOW</option>
              <option value="name_asc">NAME A → Z</option>
            </select>
          </div>

          {/* Category banner */}
          {selectedCategory && (
            <div className="mb-6">
              {selectedCategory.banner_image_url && (
                <img src={selectedCategory.banner_image_url} alt={selectedCategory.name} className="mb-4 w-full object-cover" style={{ maxHeight: 200 }} />
              )}
              <h2 className="display-heading text-xl">{selectedCategory.name}</h2>
            </div>
          )}

          {isLoading ? (
            <p className="font-mono text-xs text-muted-foreground">FETCHING DATA...</p>
          ) : productsData?.products.length === 0 ? (
            <p className="font-mono text-xs text-muted-foreground">NO PRODUCTS FOUND.</p>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-2 border border-border bg-border sm:grid-cols-2 lg:grid-cols-3">
                {productsData?.products.map((p) => (
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

              {totalPages > 1 && (
                <div className="mt-6 flex items-center justify-center gap-4">
                  <button
                    disabled={filters.page <= 1}
                    onClick={() => updateParam('page', String(filters.page - 1))}
                    className="font-mono text-xs font-bold disabled:opacity-30"
                  >
                    ← PREV
                  </button>
                  <span className="font-mono text-xs">PAGE {filters.page} / {totalPages}</span>
                  <button
                    disabled={filters.page >= totalPages}
                    onClick={() => updateParam('page', String(filters.page + 1))}
                    className="font-mono text-xs font-bold disabled:opacity-30"
                  >
                    NEXT →
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
