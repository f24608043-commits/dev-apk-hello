import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { useState } from 'react';

export default function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'description' | 'reviews'>('description');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewStatus, setReviewStatus] = useState('');
  const [cartStatus, setCartStatus] = useState('');

  const { data: product, isLoading } = useQuery({
    queryKey: ['product', slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*, categories(name, slug), brands(name, slug)')
        .eq('slug', slug!)
        .single();
      if (error) throw error;
      return data;
    },
  });

  const { data: reviews } = useQuery({
    queryKey: ['reviews', product?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from('reviews')
        .select('*, profiles(full_name)')
        .eq('product_id', product!.id)
        .eq('is_approved', true)
        .order('created_at', { ascending: false });
      return data ?? [];
    },
    enabled: !!product?.id,
  });

  const { data: canReview } = useQuery({
    queryKey: ['can_review', product?.id, user?.id],
    queryFn: async () => {
      if (!user || !product) return { canSubmit: false, alreadyReviewed: false };
      
      const { data: existingReview } = await supabase
        .from('reviews')
        .select('id')
        .eq('product_id', product.id)
        .eq('user_id', user.id)
        .single();

      if (existingReview) return { canSubmit: false, alreadyReviewed: true };

      const { data: deliveredOrder } = await supabase
        .from('order_items')
        .select('id, orders!inner(status, user_id)')
        .eq('product_id', product.id)
        .eq('orders.user_id', user.id)
        .eq('orders.status', 'delivered')
        .limit(1);

      return { canSubmit: (deliveredOrder?.length ?? 0) > 0, alreadyReviewed: false };
    },
    enabled: !!product?.id && !!user,
  });

  const addToCart = useMutation({
    mutationFn: async () => {
      if (!user) { 
        setCartStatus('PLEASE LOGIN TO ADD ITEMS TO CART');
        navigate('/login'); 
        return; 
      }
      setCartStatus('');
      
      const { data: existing, error: fetchError } = await supabase.from('cart_items').select('id, quantity').eq('user_id', user.id).eq('product_id', product!.id).single();
      
      if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 is "not found" error
        throw fetchError;
      }
      
      if (existing) {
        const { error: updateError } = await supabase.from('cart_items').update({ quantity: existing.quantity + quantity }).eq('id', existing.id);
        if (updateError) throw updateError;
        setCartStatus(`UPDATED QUANTITY TO ${existing.quantity + quantity}`);
      } else {
        const { error: insertError } = await supabase.from('cart_items').insert({ user_id: user.id, product_id: product!.id, quantity });
        if (insertError) throw insertError;
        setCartStatus('ADDED TO CART');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart_count'] });
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
    onError: (error: any) => {
      setCartStatus(`ERROR: ${error.message}`);
    },
  });

  const submitReview = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from('reviews').insert({
        product_id: product!.id,
        user_id: user!.id,
        rating: reviewRating,
        comment: reviewComment || null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      setReviewStatus('REVIEW_SUBMITTED_FOR_APPROVAL.');
      queryClient.invalidateQueries({ queryKey: ['can_review'] });
    },
    onError: (err: any) => setReviewStatus(`ERROR: ${err.message}`),
  });

  if (isLoading) return <div className="p-6 font-mono text-xs text-muted-foreground">FETCHING DATA...</div>;
  if (!product) return <div className="p-6 font-mono text-xs text-destructive">PRODUCT_NOT_FOUND.</div>;

  const allImages = (product.images || []).filter(Boolean) as string[];
  const mainImage = selectedImage ?? allImages[0];
  const brand = product.brands as any;
  const category = product.categories as any;

  return (
    <div className="mx-auto max-w-7xl px-6 py-8">
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        {/* Images */}
        <div>
          <div className="aspect-square bg-muted flex items-center justify-center overflow-hidden">
            {mainImage ? (
              <img src={mainImage} alt={product.name} className="h-full w-full object-cover" />
            ) : (
              <span className="font-mono text-sm text-muted-foreground">{product.name}</span>
            )}
          </div>
          {allImages.length > 0 && (
            <div className="mt-2 flex gap-2">
              {allImages.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(img)}
                  className={`h-16 w-16 border-2 overflow-hidden ${(selectedImage ?? allImages[0]) === img ? 'border-foreground' : 'border-border'}`}
                >
                  <img src={img} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div>
          <h1 className="display-heading text-2xl">{product.name}</h1>
          <div className="mt-2 flex gap-4 text-xs">
            {brand && <Link to={`/shop?brand=${brand.slug}`} className="text-muted-foreground hover:text-accent">{brand.name}</Link>}
            {category && <Link to={`/shop?category=${category.slug}`} className="text-muted-foreground hover:text-accent">{category.name}</Link>}
          </div>

          <div className="mt-4 flex items-center gap-3">
            <span className="data-text text-2xl">${Number(product.price).toFixed(2)}</span>
            {product.compare_price && (
              <span className="data-text text-lg text-muted-foreground line-through">${Number(product.compare_price).toFixed(2)}</span>
            )}
          </div>

          <div className="mt-4 font-mono text-xs">
            {product.stock > 0 ? (
              <span className="text-success">IN STOCK ({product.stock} LEFT)</span>
            ) : (
              <span className="text-destructive">OUT OF STOCK</span>
            )}
          </div>

          {product.stock > 0 && (
            <div className="mt-4 flex items-center gap-4">
              <label className="label-text">QTY</label>
              <input
                type="number"
                min={1}
                max={product.stock}
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, Math.min(product.stock, parseInt(e.target.value) || 1)))}
                className="w-20 border-2 border-border bg-background p-2 font-mono text-xs outline-none focus:border-foreground"
              />
            </div>
          )}

          <div className="mt-6 flex gap-4">
            <button
              onClick={() => addToCart.mutate()}
              disabled={product.stock === 0 || addToCart.isPending}
              className="flex-1 bg-foreground py-3 text-xs font-bold uppercase tracking-widest text-background hover:bg-foreground/80 disabled:opacity-50"
            >
              {addToCart.isPending ? 'ADDING...' : product.stock === 0 ? 'OUT OF STOCK' : 'ADD TO CART'}
            </button>
            <button
              onClick={() => {
                addToCart.mutate(undefined, {
                  onSuccess: () => {
                    navigate('/checkout');
                  }
                });
              }}
              disabled={product.stock === 0 || addToCart.isPending}
              className="flex-1 bg-accent py-3 text-xs font-bold uppercase tracking-widest text-accent-foreground hover:bg-accent/80 disabled:opacity-50"
            >
              {product.stock === 0 ? 'OUT OF STOCK' : 'BUY NOW'}
            </button>
          </div>
          {cartStatus && (
            <p className={`mt-2 font-mono text-xs ${cartStatus.includes('ERROR') ? 'text-destructive' : 'text-success'}`}>
              {cartStatus}
            </p>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-12 border-t-2 border-foreground">
        <div className="flex gap-0">
          <button
            onClick={() => setActiveTab('description')}
            className={`border-b-2 px-6 py-3 text-xs font-bold uppercase tracking-widest ${activeTab === 'description' ? 'border-foreground text-foreground' : 'border-transparent text-muted-foreground'}`}
          >
            DESCRIPTION
          </button>
          <button
            onClick={() => setActiveTab('reviews')}
            className={`border-b-2 px-6 py-3 text-xs font-bold uppercase tracking-widest ${activeTab === 'reviews' ? 'border-foreground text-foreground' : 'border-transparent text-muted-foreground'}`}
          >
            REVIEWS ({reviews?.length ?? 0})
          </button>
        </div>

        <div className="py-6">
          {activeTab === 'description' ? (
            <p className="text-sm leading-relaxed text-muted-foreground">{product.description || 'No description available.'}</p>
          ) : (
            <div className="space-y-6">
              {reviews?.length === 0 && <p className="font-mono text-xs text-muted-foreground">NO REVIEWS YET.</p>}
              {reviews?.map((r) => (
                <div key={r.id} className="border-b border-border pb-4">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm">{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</span>
                    <span className="text-xs font-medium">{(r.profiles as any)?.full_name || 'Anonymous'}</span>
                    <span className="font-mono text-xs text-muted-foreground">{new Date(r.created_at!).toLocaleDateString()}</span>
                  </div>
                  {r.comment && <p className="mt-2 text-sm text-muted-foreground">{r.comment}</p>}
                </div>
              ))}

              {user && canReview?.alreadyReviewed && (
                <p className="font-mono text-xs text-muted-foreground">YOU HAVE ALREADY REVIEWED THIS PRODUCT.</p>
              )}

              {user && canReview?.canSubmit && (
                <div className="border-t border-border pt-6">
                  <h3 className="label-text mb-4">WRITE A REVIEW</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="label-text mb-1 block">RATING</label>
                      <select
                        value={reviewRating}
                        onChange={(e) => setReviewRating(parseInt(e.target.value))}
                        className="border-2 border-border bg-background p-2 font-mono text-xs outline-none focus:border-foreground"
                      >
                        {[5, 4, 3, 2, 1].map((n) => (
                          <option key={n} value={n}>{n} {'★'.repeat(n)}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="label-text mb-1 block">COMMENT</label>
                      <textarea
                        value={reviewComment}
                        onChange={(e) => setReviewComment(e.target.value)}
                        rows={3}
                        className="w-full border-2 border-border bg-background p-2 font-mono text-xs outline-none focus:border-foreground"
                      />
                    </div>
                    <button
                      onClick={() => submitReview.mutate()}
                      className="bg-foreground px-6 py-2 text-xs font-bold uppercase tracking-widest text-background hover:bg-foreground/80"
                    >
                      SUBMIT REVIEW
                    </button>
                    {reviewStatus && <p className="font-mono text-xs text-success">{reviewStatus}</p>}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
