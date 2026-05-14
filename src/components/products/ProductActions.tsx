import { motion } from 'framer-motion';
import { Heart, ShoppingCart, Eye } from 'lucide-react';
import { useState } from 'react';

interface ProductActionsProps {
  onAddToCart: () => void;
  onWishlistToggle: () => void;
  onQuickView?: () => void;
  isWishlisted: boolean;
  isOutOfStock: boolean;
}

export default function ProductActions({
  onAddToCart,
  onWishlistToggle,
  onQuickView,
  isWishlisted,
  isOutOfStock,
}: ProductActionsProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="absolute inset-0 bg-black/40 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={onWishlistToggle}
        className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg hover:bg-rose-500 hover:text-white transition-colors duration-300"
        aria-label="Add to wishlist"
      >
        <Heart
          className={`w-5 h-5 ${isWishlisted ? 'fill-rose-500 text-rose-500' : ''}`}
        />
      </motion.button>

      {onQuickView && (
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={onQuickView}
          className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg hover:bg-gray-800 hover:text-white transition-colors duration-300"
          aria-label="Quick view"
        >
          <Eye className="w-5 h-5" />
        </motion.button>
      )}

      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={onAddToCart}
        disabled={isOutOfStock}
        className={`w-10 h-10 rounded-full flex items-center justify-center shadow-lg transition-colors duration-300 ${
          isOutOfStock
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-white hover:bg-black hover:text-white'
        }`}
        aria-label="Add to cart"
      >
        <ShoppingCart className="w-5 h-5" />
      </motion.button>
    </motion.div>
  );
}
