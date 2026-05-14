import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import ProductBadge, { BadgeType } from './ProductBadge';
import ProductActions from './ProductActions';
import { useState } from 'react';

export interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  compare_price?: number;
  image_1?: string;
  image_2?: string;
  category?: string;
  is_active?: boolean;
  is_featured?: boolean;
  stock?: number;
}

interface ProductCardProps {
  product: Product;
  onAddToCart: (productId: string) => void;
  onWishlistToggle?: (productId: string) => void;
  isWishlisted?: boolean;
  showQuickView?: boolean;
  onQuickView?: (product: Product) => void;
}

export default function ProductCard({
  product,
  onAddToCart,
  onWishlistToggle,
  isWishlisted = false,
  showQuickView = false,
  onQuickView,
}: ProductCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const discount = product.compare_price
    ? Math.round(((product.compare_price - product.price) / product.compare_price) * 100)
    : 0;

  const isOutOfStock = (product.stock ?? 0) <= 0;
  const badgeType: BadgeType = isOutOfStock
    ? 'outofstock'
    : discount > 0
    ? 'sale'
    : product.is_featured
    ? 'bestseller'
    : 'new';

  const handleAddToCart = () => {
    if (!isOutOfStock) {
      onAddToCart(product.id);
    }
  };

  const handleWishlistToggle = () => {
    if (onWishlistToggle) {
      onWishlistToggle(product.id);
    }
  };

  const handleQuickView = () => {
    if (onQuickView) {
      onQuickView(product);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="group relative bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image Section */}
      <div className="relative aspect-square overflow-hidden bg-gray-100">
        {/* Badge */}
        {(badgeType === 'sale' || badgeType === 'bestseller' || badgeType === 'new' || isOutOfStock) && (
          <ProductBadge type={badgeType} discount={discount} />
        )}

        {/* Wishlist Icon */}
        {onWishlistToggle && (
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleWishlistToggle}
            className="absolute top-3 right-3 z-20 w-9 h-9 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-md hover:bg-white transition-colors duration-300"
            aria-label="Add to wishlist"
          >
            <svg
              className={`w-5 h-5 ${isWishlisted ? 'fill-rose-500 text-rose-500' : 'text-gray-600'}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
          </motion.button>
        )}

        {/* Product Image */}
        <Link to={`/product/${product.slug}`}>
          <motion.img
            src={product.image_1 || ''}
            alt={product.name}
            className={`w-full h-full object-cover transition-transform duration-500 ${
              isHovered ? 'scale-110' : 'scale-100'
            }`}
            initial={{ opacity: 0 }}
            animate={{ opacity: imageLoaded ? 1 : 0 }}
            onLoad={() => setImageLoaded(true)}
            loading="lazy"
          />
        </Link>

        {/* Out of Stock Overlay */}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="text-white font-bold text-sm uppercase tracking-wider">
              Out of Stock
            </span>
          </div>
        )}

        {/* Quick Actions Overlay */}
        {!isOutOfStock && (
          <ProductActions
            onAddToCart={handleAddToCart}
            onWishlistToggle={handleWishlistToggle}
            onQuickView={showQuickView ? handleQuickView : undefined}
            isWishlisted={isWishlisted}
            isOutOfStock={isOutOfStock}
          />
        )}
      </div>

      {/* Content Section */}
      <div className="p-4">
        {/* Category */}
        {product.category && (
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">
            {product.category}
          </p>
        )}

        {/* Product Title */}
        <Link to={`/product/${product.slug}`}>
          <h3 className="font-semibold text-gray-900 text-sm mb-2 line-clamp-2 hover:text-gray-600 transition-colors duration-200">
            {product.name}
          </h3>
        </Link>

        {/* Price Section */}
        <div className="flex items-center gap-2">
          <span className="font-bold text-gray-900 text-lg">
            ${Number(product.price).toFixed(2)}
          </span>
          {product.compare_price && (
            <span className="text-sm text-gray-400 line-through">
              ${Number(product.compare_price).toFixed(2)}
            </span>
          )}
          {discount > 0 && (
            <span className="text-xs font-semibold text-rose-500 bg-rose-50 px-2 py-0.5 rounded-full">
              -{discount}%
            </span>
          )}
        </div>

        {/* Add to Cart Button (Mobile) */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleAddToCart}
          disabled={isOutOfStock}
          className={`mt-3 w-full py-2.5 rounded-xl font-semibold text-sm uppercase tracking-wider transition-all duration-300 ${
            isOutOfStock
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-gray-900 text-white hover:bg-gray-800'
          }`}
        >
          {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
        </motion.button>
      </div>
    </motion.div>
  );
}
