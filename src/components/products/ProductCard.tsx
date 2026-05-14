import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import ProductActions from './ProductActions';
import { ShoppingCart } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

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
  const navigate = useNavigate();
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const discount = product.compare_price
    ? Math.round(((product.compare_price - product.price) / product.compare_price) * 100)
    : 0;

  const isOutOfStock = (product.stock ?? 0) <= 0;

  const handleAddToCart = () => {
    if (!isOutOfStock) {
      onAddToCart(product.id);
    }
  };

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onWishlistToggle) {
      onWishlistToggle(product.id);
    }
  };

  const handleQuickView = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onQuickView) {
      onQuickView(product);
    }
  };

  const handleBuyNow = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isOutOfStock) {
      onAddToCart(product.id);
      navigate('/checkout');
    }
  };

  return (
    <Link to={`/product/${product.slug}`} className="block h-full">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="group relative bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer h-full flex flex-col"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Image Section */}
        <div className="relative w-full overflow-hidden bg-white flex items-center justify-center">
          {/* Product Image */}
          <motion.img
            src={product.image_1 || ''}
            alt={product.name}
            className={`w-full h-auto object-contain transition-all duration-500 ${
              isHovered ? 'scale-105' : 'scale-100'
            }`}
            initial={{ opacity: 1 }}
            onLoad={() => setImageLoaded(true)}
            loading="lazy"
          />

          {/* Out of Stock Overlay */}
          {isOutOfStock && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10">
              <span className="text-white font-bold text-sm uppercase tracking-wider">
                Out of Stock
              </span>
            </div>
          )}
        </div>

        {/* Content Section */}
        <div className="p-3 md:p-5 flex flex-col flex-1">
          <div className="flex-1">
            {/* Category */}
            {product.category && (
              <p className="text-[8px] md:text-[10px] text-gray-400 font-bold uppercase tracking-[0.1em] mb-1 md:mb-1.5">
                {product.category}
              </p>
            )}

            {/* Product Title */}
            <h3 className="font-bold text-gray-900 text-[11px] md:text-base mb-1 md:mb-2 line-clamp-2 leading-tight md:leading-snug hover:text-primary transition-colors duration-200">
              {product.name}
            </h3>

            {/* Price Section */}
            <div className="flex items-center flex-wrap gap-1 md:gap-2 mb-2 md:mb-4">
              <span className="font-extrabold text-gray-900 text-sm md:text-xl">
                Rs. {Number(product.price).toLocaleString()}
              </span>
              {product.compare_price && (
                <span className="text-[10px] md:text-sm text-gray-400 line-through">
                  Rs. {Number(product.compare_price).toFixed(0)}
                </span>
              )}
            </div>
          </div>

          {/* Action Buttons Section */}
          <div className="flex items-center gap-1.5 md:gap-2 mt-auto">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleBuyNow}
              disabled={isOutOfStock}
              className={`flex-1 py-2 md:py-3.5 rounded-lg md:rounded-xl font-bold text-[9px] md:text-xs uppercase tracking-[0.05em] md:tracking-[0.1em] transition-all duration-300 flex items-center justify-center gap-2 shadow-sm ${
                isOutOfStock
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-900 text-white hover:bg-black hover:shadow-md'
              }`}
            >
              {isOutOfStock ? 'Sold' : 'Buy Now'}
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleAddToCart}
              disabled={isOutOfStock}
              className={`w-8 h-8 md:w-12 md:h-12 flex-shrink-0 rounded-lg md:rounded-xl flex items-center justify-center transition-all duration-300 shadow-sm ${
                isOutOfStock
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
              }`}
              aria-label="Add to cart"
            >
              <ShoppingCart className="w-3.5 h-3.5 md:w-5 md:h-5" />
            </motion.button>
          </div>
        </div>
      </motion.div>
    </Link>
  );
}
