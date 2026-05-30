import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { useState, useEffect } from 'react';
import ProductCard from '@/components/products/ProductCard';
import { addToLocalCart } from '@/lib/cart';
import Breadcrumb from '@/components/Breadcrumb';
import SchemaMarkupInjector from '@/components/SchemaMarkupInjector';
import {
  setMetaTags,
  generateProductTitle,
  generateProductDescription,
  generateProductSlug,
  generateImageAlt,
  generateProductBreadcrumbs,
  generateProductSchema,
  generateFAQSchema,
  generateProductIntroduction,
  SEOMetadata,
  ProductSEO,
} from '@/lib/seo-utils';

export default function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'description' | 'reviews' | 'faqs'>('description');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewStatus, setReviewStatus] = useState('');
  const [cartStatus, setCartStatus] = useState('');

  const { data: product, isLoading } = useQuery({
    queryKey: ['product', slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*, categories(name, slug, id), brands(name, slug)')
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

  const { data: relatedProducts } = useQuery({
    queryKey: ['related_products', product?.category_id],
    queryFn: async () => {
      if (!product?.category_id) return [];
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('category_id', product.category_id)
        .neq('id', product.id)
        .eq('is_active', true)
        .limit(4);
      if (error) throw error;
      return data;
    },
    enabled: !!product?.category_id,
  });

  const addRelatedToCart = useMutation({
    mutationFn: async ({ productId, onSuccess }: { productId: string; onSuccess?: () => void }) => {
      if (!user) {
        addToLocalCart(productId, 1);
        return;
      }
      const { data: existing, error: fetchError } = await supabase
        .from('cart_items')
        .select('id, quantity')
        .eq('user_id', user.id)
        .eq('product_id', productId)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') throw fetchError;

      if (existing) {
        const { error: updateError } = await supabase.from('cart_items').update({ quantity: existing.quantity + 1 }).eq('id', existing.id);
        if (updateError) throw updateError;
      } else {
        const { error: insertError } = await supabase.from('cart_items').insert({ user_id: user.id, product_id: productId, quantity: 1 });
        if (insertError) throw insertError;
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['cart_count'] });
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      if (variables.onSuccess) variables.onSuccess();
    },
  });

  const addToCart = useMutation({
    mutationFn: async () => {
      if (!user) {
        addToLocalCart(product!.id, quantity);
        setCartStatus('ADDED TO CART');
        return;
      }
      setCartStatus('');

      const { data: existing, error: fetchError } = await supabase.from('cart_items').select('id, quantity').eq('user_id', user.id).eq('product_id', product!.id).single();

      if (fetchError && fetchError.code !== 'PGRST116') {
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
      setReviewComment('');
      setReviewRating(5);
    },
    onError: (err: any) => setReviewStatus(`ERROR: ${err.message}`),
  });

  // ============================================================================
  // SEO OPTIMIZATION
  // ============================================================================

  useEffect(() => {
    if (!product?.name) return;

    const category = product.categories as any;
    const categoryName = category?.name || 'Herbal Products';

    // Generate optimized metadata
    const title = generateProductTitle(product.name, categoryName);
    const description = generateProductDescription(product.name, categoryName);
    const breadcrumbs = generateProductBreadcrumbs(categoryName, category?.slug || '', product.name, slug!);

    // Set meta tags
    const metadata: SEOMetadata = {
      title,
      description,
      keywords: [
        product.name,
        `${product.name} Pakistan`,
        `buy ${product.name}`,
        categoryName,
        `${categoryName} online`,
        'herbal medicine',
        'tibbi products',
      ],
      canonical: `/product/${slug}`,
      ogTitle: title,
      ogDescription: description,
      ogImage: product.image_1 || undefined,
      ogType: 'product',
      twitterCard: 'product',
      author: 'Badshah Di Hatti',
    };

    setMetaTags(metadata);

    // Update document title
    document.title = title;

    return () => {
      // Cleanup if needed
    };
  }, [product?.id, product?.name, slug, product?.categories]);

  // Generate schema markup for product
  useEffect(() => {
    if (!product) return;

    const productSchema: ProductSEO = {
      id: product.id,
      name: product.name,
      slug: slug || '',
      description: product.description,
      price: product.price,
      image_1: product.image_1,
      category_id: product.category_id,
      brand_id: product.brand_id,
      rating: reviews && reviews.length > 0 ? reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length : undefined,
      reviewCount: reviews?.length || 0,
      inStock: product.stock > 0,
    };

    const schema = generateProductSchema(productSchema);
    
    return () => {
      // Cleanup
    };
  }, [product, reviews, slug]);

  if (isLoading) return <div className="p-6 font-mono text-xs text-muted-foreground">FETCHING DATA...</div>;
  if (!product) return <div className="p-6 font-mono text-xs text-destructive">PRODUCT_NOT_FOUND.</div>;

  const allImages = [product.image_1, product.image_2, product.image_3].filter(Boolean) as string[];
  const mainImage = selectedImage ?? allImages[0];
  const brand = product.brands as any;
  const category = product.categories as any;

  // FAQ data
  const faqs = [
    {
      question: `What is ${product.name}?`,
      answer: `${product.name} is an authentic herbal medicine supplied by Badshah Di Hatti. ${product.description || 'It is made from premium natural ingredients and traditional methods.'}`,
    },
    {
      question: `Where can I buy ${product.name} in Pakistan?`,
      answer: `You can buy ${product.name} directly from Badshah Di Hatti through our website or WhatsApp at +92 300 2500026. We offer wholesale and bulk prices.`,
    },
    {
      question: `Is ${product.name} authentic?`,
      answer: `Yes, all our products including ${product.name} are 100% authentic and sourced directly from trusted suppliers. We guarantee quality and authenticity.`,
    },
    {
      question: `What is the delivery time for ${product.name}?`,
      answer: 'We offer fast delivery throughout Pakistan. Delivery time depends on your location and is typically 2-5 business days. Contact us for exact delivery dates.',
    },
    {
      question: `Do you offer wholesale prices for ${product.name}?`,
      answer: 'Yes, we offer competitive wholesale prices for bulk orders of any product including ${product.name}. Contact us on WhatsApp for special bulk pricing.',
    },
  ];

  return (
    <div className="mx-auto max-w-7xl px-6 py-8">
      {/* Schema Markup Injection */}
      <SchemaMarkupInjector 
        schema={generateProductSchema({
          id: product.id,
          name: product.name,
          slug: slug || '',
          description: product.description,
          price: product.price,
          image_1: product.image_1,
          category_id: product.category_id,
          brand_id: product.brand_id,
          rating: reviews && reviews.length > 0 ? reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length : undefined,
          reviewCount: reviews?.length || 0,
          inStock: product.stock > 0,
        })}
        id={`product-schema-${product.id}`}
      />

      {/* Breadcrumb Navigation with Schema */}
      <div className="mb-8">
        <Breadcrumb 
          items={generateProductBreadcrumbs(category?.name || 'Products', category?.slug || '', product.name, slug!)}
          className="mb-4"
        />
      </div>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        {/* Images Section */}
        <div>
          <div className="w-full h-[500px] bg-gray-100 rounded-2xl overflow-hidden flex items-center justify-center">
            {mainImage ? (
              <img 
                src={mainImage} 
                alt={generateImageAlt(product.name, 1, category?.name)} 
                loading="lazy"
                className="w-full h-full object-contain object-center transition-opacity duration-300" 
              />
            ) : (
              <span className="font-mono text-sm text-muted-foreground">{product.name}</span>
            )}
          </div>
          {allImages.length > 1 && (
            <div className="mt-4 flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
              {allImages.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(img)}
                  className={`relative h-20 w-20 flex-shrink-0 rounded-xl overflow-hidden border-2 transition-all duration-300 ${(selectedImage ?? allImages[0]) === img
                    ? 'border-gray-900 shadow-md ring-2 ring-gray-900/5'
                    : 'border-transparent hover:border-gray-200'
                    }`}
                  aria-label={`View ${generateImageAlt(product.name, (i + 1) as 1 | 2 | 3, category?.name)}`}
                >
                  <img 
                    src={img} 
                    alt={generateImageAlt(product.name, (i + 1) as 1 | 2 | 3, category?.name)} 
                    loading="lazy"
                    className="h-full w-full object-cover" 
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Details Section */}
        <div>
          {/* H1 - Main Product Title (SEO Important) */}
          <h1 className="display-heading text-2xl md:text-4xl font-bold">{product.name}</h1>
          
          {/* Product Meta Information */}
          <div className="mt-2 flex gap-4 text-xs">
            {brand && (
              <Link 
                to={`/shop?brand=${brand.slug}`} 
                className="text-muted-foreground hover:text-accent transition-colors"
                title={`View more products from ${brand.name}`}
              >
                Brand: <span className="font-semibold">{brand.name}</span>
              </Link>
            )}
            {category && (
              <Link 
                to={`/shop?category=${category.slug}`} 
                className="text-muted-foreground hover:text-accent transition-colors"
                title={`View more products in ${category.name}`}
              >
                Category: <span className="font-semibold">{category.name}</span>
              </Link>
            )}
          </div>

          {/* Rating Display */}
          {reviews && reviews.length > 0 && (
            <div className="mt-3 flex items-center gap-2 text-sm">
              <span className="font-mono">
                {'★'.repeat(Math.round(reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length))}
                {'☆'.repeat(5 - Math.round(reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length))}
              </span>
              <span className="text-muted-foreground">({reviews.length} reviews)</span>
            </div>
          )}

          {/* Quantity Selector */}
          <div className="mt-6 flex items-center gap-4">
            <label className="label-text">QUANTITY</label>
            <input
              type="number"
              min={1}
              max={product.stock}
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, Math.min(product.stock, parseInt(e.target.value) || 1)))}
              className="w-20 border-2 border-border bg-background p-2 font-mono text-xs outline-none focus:border-foreground"
              aria-label="Product quantity"
            />
            <span className="text-xs text-muted-foreground">
              {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
            </span>
          </div>

          {/* Action Buttons */}
          <div className="mt-6 flex flex-col gap-3 sticky top-4">
            <button
              onClick={() => addToCart.mutate()}
              disabled={product.stock === 0 || addToCart.isPending}
              className="flex-1 bg-foreground py-3 text-xs font-bold uppercase tracking-widest text-background hover:bg-foreground/80 disabled:opacity-50 transition-all rounded"
              aria-label="Add product to cart"
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
              className="flex-1 bg-accent py-3 text-xs font-bold uppercase tracking-widest text-accent-foreground hover:bg-accent/80 disabled:opacity-50 transition-all rounded"
              aria-label="Buy now"
            >
              {product.stock === 0 ? 'OUT OF STOCK' : 'BUY NOW'}
            </button>
            
            {/* WhatsApp Order Button */}
            <a
              href={`https://wa.me/923002500026?text=${encodeURIComponent(`Hello, I'm interested in ordering: ${product?.name}\n\nQuantity: ${quantity}\n\nLink: ${window.location.href}\n\nPlease confirm availability and payment details.`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 bg-green-600 py-3 text-xs font-bold uppercase tracking-widest text-white hover:bg-green-700 disabled:opacity-50 flex items-center justify-center gap-2 transition-all rounded"
              aria-label="Order on WhatsApp"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              Order on WhatsApp
            </a>
          </div>

          {/* Status Message */}
          {cartStatus && (
            <p className={`mt-2 font-mono text-xs ${cartStatus.includes('ERROR') ? 'text-destructive' : 'text-success'}`}>
              {cartStatus}
            </p>
          )}

          {/* Trust Badges */}
          <div className="mt-6 pt-4 border-t border-border flex gap-4 text-xs text-muted-foreground">
            <div>✓ 100% Authentic</div>
            <div>✓ Wholesale Prices</div>
            <div>✓ Fast Delivery</div>
          </div>
        </div>
      </div>

      {/* Tabs Section */}
      <div className="mt-16 border-t-2 border-foreground">
        <div className="flex gap-0 flex-wrap">
          <button
            onClick={() => setActiveTab('description')}
            className={`border-b-2 px-6 py-3 text-xs font-bold uppercase tracking-widest ${activeTab === 'description' ? 'border-foreground text-foreground' : 'border-transparent text-muted-foreground'}`}
            aria-selected={activeTab === 'description'}
            role="tab"
          >
            DESCRIPTION
          </button>
          <button
            onClick={() => setActiveTab('faqs')}
            className={`border-b-2 px-6 py-3 text-xs font-bold uppercase tracking-widest ${activeTab === 'faqs' ? 'border-foreground text-foreground' : 'border-transparent text-muted-foreground'}`}
            aria-selected={activeTab === 'faqs'}
            role="tab"
          >
            FAQS
          </button>
          <button
            onClick={() => setActiveTab('reviews')}
            className={`border-b-2 px-6 py-3 text-xs font-bold uppercase tracking-widest ${activeTab === 'reviews' ? 'border-foreground text-foreground' : 'border-transparent text-muted-foreground'}`}
            aria-selected={activeTab === 'reviews'}
            role="tab"
          >
            REVIEWS ({reviews?.length ?? 0})
          </button>
        </div>

        <div className="py-8">
          {activeTab === 'description' && (
            <div className="prose prose-sm max-w-none">
              <div className="mb-6">
                <h2 className="text-xl font-bold mb-3">About {product.name}</h2>
                <p className="text-muted-foreground leading-relaxed">
                  {product.description || `${product.name} is a premium herbal product from Badshah Di Hatti, Pakistan's trusted supplier of authentic herbal medicines. It is made from the finest natural ingredients using traditional preparation methods.`}
                </p>
              </div>

              <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-lg font-bold mb-3">Benefits</h3>
                  <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
                    <li>Made from natural ingredients</li>
                    <li>Authentic herbal formula</li>
                    <li>Trusted by thousands of customers</li>
                    <li>Wholesale prices available</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-bold mb-3">Shipping Information</h3>
                  <ul className="list-disc list-inside space-y-2 text-sm text-muted-foreground">
                    <li>Fast delivery throughout Pakistan</li>
                    <li>Cash on Delivery available</li>
                    <li>Order WhatsApp for details</li>
                    <li>Bulk order discounts</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'faqs' && (
            <div className="space-y-4">
              <SchemaMarkupInjector 
                schema={generateFAQSchema(faqs)}
                id={`product-faq-${product.id}`}
              />
              {faqs.map((faq, index) => (
                <details key={index} className="border border-border rounded-lg p-4 cursor-pointer hover:bg-muted/50 transition-colors" open={index === 0}>
                  <summary className="font-semibold text-sm flex items-center justify-between">
                    {faq.question}
                    <span className="text-lg">+</span>
                  </summary>
                  <p className="mt-3 text-sm text-muted-foreground">{faq.answer}</p>
                </details>
              ))}
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="space-y-6">
              {reviews?.length === 0 && <p className="font-mono text-xs text-muted-foreground">NO REVIEWS YET.</p>}
              {reviews?.map((r) => (
                <div key={r.id} className="border-b border-border pb-4">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="font-mono text-sm">{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</span>
                    <span className="text-xs font-medium text-foreground">{(r.profiles as any)?.full_name || 'Anonymous'}</span>
                    <span className="font-mono text-xs text-muted-foreground">{new Date(r.created_at!).toLocaleDateString()}</span>
                  </div>
                  {r.comment && <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{r.comment}</p>}
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
                        className="border-2 border-border bg-background p-2 font-mono text-xs outline-none focus:border-foreground rounded"
                        aria-label="Select rating"
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
                        className="w-full border-2 border-border bg-background p-2 font-mono text-xs outline-none focus:border-foreground rounded"
                        placeholder="Share your experience with this product..."
                        aria-label="Review comment"
                      />
                    </div>
                    <button
                      onClick={() => submitReview.mutate()}
                      disabled={submitReview.isPending}
                      className="bg-foreground px-6 py-2 text-xs font-bold uppercase tracking-widest text-background hover:bg-foreground/80 disabled:opacity-50 transition-all rounded"
                    >
                      {submitReview.isPending ? 'SUBMITTING...' : 'SUBMIT REVIEW'}
                    </button>
                    {reviewStatus && (
                      <p className={`font-mono text-xs ${reviewStatus.includes('ERROR') ? 'text-destructive' : 'text-success'}`}>
                        {reviewStatus}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Related Products Section */}
      {relatedProducts && relatedProducts.length > 0 && (
        <div className="mt-16 border-t border-border pt-12">
          <h2 className="text-2xl font-bold uppercase tracking-widest text-foreground mb-8">Related Products</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
            {relatedProducts.map((p) => (
              <ProductCard
                key={p.id}
                product={p as any}
                onAddToCart={(id, cb) => addRelatedToCart.mutate({ productId: id, onSuccess: cb })}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
