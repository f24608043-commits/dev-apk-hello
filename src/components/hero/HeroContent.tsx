import { motion } from 'framer-motion';

interface HeroContentProps {
  title: string;
  subtitle: string;
}

export default function HeroContent({ title, subtitle }: HeroContentProps) {
  return (
    <div className="absolute inset-0 z-10 flex items-center justify-center">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="max-w-2xl mx-auto"
        >
          <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-8 md:p-12 shadow-2xl text-center">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="text-6xl md:text-7xl lg:text-8xl font-bold text-white leading-tight"
            >
              DEVA
            </motion.h1>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
