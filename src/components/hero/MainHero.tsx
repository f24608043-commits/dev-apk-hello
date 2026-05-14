import { Calendar, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function MainHero() {
  return (
    <section className="relative pt-12 pb-20 md:py-24 px-4 max-w-7xl mx-auto overflow-hidden">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-12 items-center">
        {/* Hero Content */}
        <div className="md:col-span-7 z-10">
          <h1 className="text-[40px] md:text-[64px] font-bold text-black mb-6 leading-tight font-display">
            Authentic Herbal Care <br className="hidden md:block"/>Since 2006
          </h1>
          
          <p className="text-lg md:text-xl text-gray-700 mb-10 max-w-xl leading-relaxed">
            Experience the wisdom of Hakeem Muhammad Amin, Pakistan's trusted voice in Unani and Herbal medicine. Bridging centuries of tradition with modern clinical precision.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <Link 
              to="/contact"
              className="bg-black text-white px-8 py-4 rounded-xl font-bold uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-gray-900 active:scale-95 transition-all shadow-xl text-xs"
            >
              Book a Consultation
              <Calendar className="w-4 h-4" />
            </Link>
            <Link 
              to="/shop"
              className="border-2 border-black text-black px-8 py-4 rounded-xl font-bold uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-black/5 active:scale-95 transition-all text-xs"
            >
              Explore Herbal Products
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Hero Image & Card */}
        <div className="md:col-span-5 relative">
          <div className="relative z-10 rounded-3xl overflow-hidden border-4 border-white bg-white p-2 shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-tr from-green-100/20 to-transparent pointer-events-none"></div>
            <img 
              alt="Hakeem Muhammad Amin" 
              className="w-full h-auto rounded-2xl object-cover grayscale-[0.1] contrast-[1.05]" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBEWCAIp2T7RvT3jDKGCyo2ckZ9Z4oYgrFvYhpiEnhT4hYYUUAB4TdpKp83r4TkRTNmbYgFK-MhhAjiGihUx6pKWhdd6aBMfa4FrC_nMrpOz5fz0kAv3Awff2BehPNqr7pEAAMOVTXreFBLp2Np-P7KuoBPF5PVoqUrI3Mhox8509bjQZcgaAIy8zGPPp8cxdku5bv1gSsLSon254HM39eODpCWnYIXfuraQViDFYxhMtHOersN0897EtgLHskIxEErAPfYJraHiBI" 
            />
            <div className="absolute bottom-6 left-6 right-6 bg-black/90 backdrop-blur-md p-5 rounded-2xl border border-white/10">
              <h3 className="text-xl font-bold text-white mb-0.5 font-display">Hakeem Muhammad Amin</h3>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/60">Chief Practitioner & Herbalist</p>
            </div>
          </div>
          
          {/* Decorative Elements */}
          <div className="absolute -top-6 -right-6 w-32 h-32 bg-[#DCEDC8] rounded-full blur-3xl opacity-50"></div>
          <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-[#DCEDC8] rounded-full blur-3xl opacity-30"></div>
        </div>
      </div>
    </section>
  );
}
