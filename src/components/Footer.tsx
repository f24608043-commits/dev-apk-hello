import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Youtube, Facebook, MapPin, Phone, Mail, ShieldCheck } from 'lucide-react';

export default function Footer() {
  const { data: storeName } = useQuery({
    queryKey: ['settings', 'store_name'],
    queryFn: async () => {
      const { data } = await supabase.from('settings').select('value').eq('key', 'store_name').single();
      return data?.value ?? 'Badshah Di Hatti';
    },
  });

  return (
    <footer className="bg-black text-white pt-20 pb-10 border-t border-white/10">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          {/* Brand & SEO Description */}
          <div className="space-y-6">
            <h3 className="text-2xl font-black uppercase tracking-tighter text-white">{storeName}</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Pakistan's premier destination for authentic herbal solutions. We specialize in 100% natural treatments for 
              <strong> men, women, and children</strong>. From specialized <strong>Sex Courses</strong> and <strong>Beauty products</strong> 
              to <strong>Digestive health</strong>, <strong>Fitness</strong>, and chronic <strong>Medications</strong>, 
              we provide holistic herbal remedies for every medical problem.
            </p>
            <div className="flex gap-4">
              <a href="https://www.youtube.com/@HakeemMuhammadAmin" className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center hover:bg-red-600 transition-all duration-300">
                <Youtube className="w-5 h-5" />
              </a>
              <a href="https://www.facebook.com/profile.php?id=100089422621139" className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center hover:bg-blue-600 transition-all duration-300">
                <Facebook className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-6">
            <h4 className="text-xs font-bold uppercase tracking-widest text-white/50">Navigation</h4>
            <ul className="space-y-4">
              <li><Link to="/" className="text-gray-400 hover:text-white transition-colors text-sm font-bold uppercase tracking-wider">Home</Link></li>
              <li><Link to="/shop" className="text-gray-400 hover:text-white transition-colors text-sm font-bold uppercase tracking-wider">Shop</Link></li>
              <li><Link to="/blog" className="text-gray-400 hover:text-white transition-colors text-sm font-bold uppercase tracking-wider">Blog</Link></li>
              <li><Link to="/about" className="text-gray-400 hover:text-white transition-colors text-sm font-bold uppercase tracking-wider">About Us</Link></li>
              <li><Link to="/contact" className="text-gray-400 hover:text-white transition-colors text-sm font-bold uppercase tracking-wider">Contact</Link></li>
            </ul>
          </div>

          {/* Categories / SEO Keywords */}
          <div className="space-y-6">
            <h4 className="text-xs font-bold uppercase tracking-widest text-white/50">Categories</h4>
            <ul className="space-y-4">
              <li><Link to="/shop?category=beauty" className="text-gray-400 hover:text-white transition-colors text-sm font-bold uppercase tracking-wider">Beauty</Link></li>
              <li><Link to="/shop?category=digestion" className="text-gray-400 hover:text-white transition-colors text-sm font-bold uppercase tracking-wider">Digestion</Link></li>
              <li><Link to="/shop?category=fitness" className="text-gray-400 hover:text-white transition-colors text-sm font-bold uppercase tracking-wider">Fitness</Link></li>
              <li><Link to="/shop?category=herbal-solution" className="text-gray-400 hover:text-white transition-colors text-sm font-bold uppercase tracking-wider">Herbal Solution</Link></li>
              <li><Link to="/shop?category=medications" className="text-gray-400 hover:text-white transition-colors text-sm font-bold uppercase tracking-wider">Medications</Link></li>
              <li><Link to="/shop?category=sex-course" className="text-gray-400 hover:text-white transition-colors text-sm font-bold uppercase tracking-wider">Sex Course</Link></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-6">
            <h4 className="text-xs font-bold uppercase tracking-widest text-white/50">Visit Us</h4>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-gray-400 shrink-0 mt-0.5" />
                <span className="text-gray-400 text-sm leading-relaxed">
                  Hakim Muhammad Amjal Khan Rd, Near Lal Haveli, Bohar Bazar, Rawalpindi.
                </span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-gray-400" />
                <span className="text-gray-400 text-sm font-bold">+92 345 700 0088</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-gray-400" />
                <span className="text-gray-400 text-sm">bdhdeva@yahoo.com</span>
              </div>
              <div className="pt-4 flex items-center gap-2 text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                <ShieldCheck className="w-4 h-4 text-green-600" />
                <span>100% Secure Checkout</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-[10px] text-gray-600 font-bold uppercase tracking-widest">
            Badshah di Hatti — All Rights Reserved.
          </p>
          <p className="text-[10px] text-gray-600 font-bold uppercase tracking-widest">
            A Product by <a href="https://nexagrowthsolution.com" target="_blank" rel="noopener noreferrer" className="text-white hover:text-green-500 transition-colors">Nexa Growth</a>
          </p>
          <div className="flex gap-6">
            <Link to="/privacy" className="text-[10px] text-gray-600 hover:text-white font-bold uppercase tracking-widest">Privacy</Link>
            <Link to="/terms" className="text-[10px] text-gray-600 hover:text-white font-bold uppercase tracking-widest">Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
