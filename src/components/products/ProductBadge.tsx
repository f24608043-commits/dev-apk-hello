import { motion } from 'framer-motion';

export type BadgeType = 'new' | 'bestseller' | 'sale' | 'outofstock';

interface ProductBadgeProps {
  type: BadgeType;
  discount?: number;
}

const badgeStyles = {
  new: {
    bg: 'bg-emerald-500',
    text: 'text-white',
    label: 'NEW',
  },
  bestseller: {
    bg: 'bg-amber-500',
    text: 'text-white',
    label: 'BEST SELLER',
  },
  sale: {
    bg: 'bg-rose-500',
    text: 'text-white',
    label: 'SALE',
  },
  outofstock: {
    bg: 'bg-gray-500',
    text: 'text-white',
    label: 'OUT OF STOCK',
  },
};

export default function ProductBadge({ type, discount }: ProductBadgeProps) {
  const style = badgeStyles[type];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className={`absolute top-3 left-3 px-3 py-1.5 ${style.bg} ${style.text} text-xs font-bold uppercase tracking-wider rounded-full shadow-lg z-10`}
    >
      {type === 'sale' && discount ? `-${discount}%` : style.label}
    </motion.div>
  );
}
