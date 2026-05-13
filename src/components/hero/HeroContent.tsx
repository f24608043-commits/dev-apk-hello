import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

interface HeroContentProps {
  title: string;
  subtitle: string;
}

export default function HeroContent({ title, subtitle }: HeroContentProps) {
  return (
    <div className="absolute inset-0 z-10 flex items-center">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="max-w-2xl"
        >
          <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-8 md:p-12 shadow-2xl">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight"
            >
              {title}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.7 }}
              className="text-lg md:text-xl text-white/90 mb-8 font-light"
            >
              {subtitle}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.9 }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <Link
                to="/shop"
                className="group relative px-8 py-4 bg-white text-black font-bold text-sm uppercase tracking-widest rounded-2xl overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-2xl"
              >
                <span className="relative z-10">Shop Now</span>
                <div className="absolute inset-0 bg-gradient-to-r from-gray-100 to-gray-200 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
              </Link>

              <Link
                to="/shop"
                className="group relative px-8 py-4 bg-transparent border-2 border-white text-white font-bold text-sm uppercase tracking-widest rounded-2xl overflow-hidden transition-all duration-300 hover:scale-105 hover:bg-white hover:text-black"
              >
                <span className="relative z-10">Explore Collection</span>
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
