import { motion } from 'framer-motion';
import ProductCard, { Product } from './ProductCard';

interface ProductGridProps {
  products: Product[];
  onAddToCart: (productId: string) => void;
  onWishlistToggle?: (productId: string) => void;
  wishlistProductIds?: Set<string>;
  showQuickView?: boolean;
  onQuickView?: (product: Product) => void;
  columns?: {
    mobile?: number;
    tablet?: number;
    desktop?: number;
    large?: number;
  };
}

export default function ProductGrid({
  products,
  onAddToCart,
  onWishlistToggle,
  wishlistProductIds = new Set(),
  showQuickView = false,
  onQuickView,
  columns = {
    mobile: 2,
    tablet: 3,
    desktop: 4,
    large: 5,
  },
}: ProductGridProps) {
  const gridCols = `grid grid-cols-${columns.mobile} md:grid-cols-${columns.tablet} lg:grid-cols-${columns.desktop} xl:grid-cols-${columns.large}`;

  if (!products.length) {
    return (
      <div className="flex items-center justify-center py-16">
        <p className="text-gray-500 text-lg">No products found</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className={`${gridCols} gap-4 md:gap-6`}
    >
      {products.map((product, index) => (
        <motion.div
          key={product.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: index * 0.05 }}
        >
          <ProductCard
            product={product}
            onAddToCart={onAddToCart}
            onWishlistToggle={onWishlistToggle}
            isWishlisted={wishlistProductIds.has(product.id)}
            showQuickView={showQuickView}
            onQuickView={onQuickView}
          />
        </motion.div>
      ))}
    </motion.div>
  );
}
