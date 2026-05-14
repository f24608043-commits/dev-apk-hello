import { motion } from 'framer-motion';
import HeroSlider, { Banner } from './HeroSlider';

interface HeroProps {
  banners: Banner[];
}

export default function Hero({ banners }: HeroProps) {
  return (
    <section className="relative w-full py-8">
      {/* Floating Herbal Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-4 h-4 bg-green-200/30 rounded-full blur-sm"
            initial={{
              x: Math.random() * 100 + '%',
              y: Math.random() * 100 + '%',
              scale: Math.random() * 0.5 + 0.5,
            }}
            animate={{
              y: [0, -30, 0],
              x: [0, 20, 0],
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{
              duration: 4 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
          />
        ))}
      </div>

      {/* Main Hero Slider */}
      <div className="relative z-10">
        <HeroSlider banners={banners} autoPlay={true} interval={3000} />
      </div>

      {/* Decorative Gradient Blobs */}
      <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-green-200/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -top-20 -right-20 w-64 h-64 bg-blue-200/20 rounded-full blur-3xl pointer-events-none" />
    </section>
  );
}
