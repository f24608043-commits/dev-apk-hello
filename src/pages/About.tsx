import { Link } from 'react-router-dom';
import SocialSection from '@/components/SocialSection';

export default function AboutPage() {
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute top-20 left-20 w-72 h-72 bg-gray-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
      <div className="absolute top-40 right-20 w-72 h-72 bg-gray-400 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>
      <div className="absolute -bottom-8 left-40 w-72 h-72 bg-gray-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000"></div>

      <div className="relative z-10 container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold text-black mb-6">
            About Us
          </h1>
          <h2 className="text-2xl md:text-3xl font-semibold text-gray-700 mb-4">
            Deva Pk Medicine in Pakistan Wholesale 100% Natural
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            About Deva Pk Medicine in Rawalpindi!
          </p>
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
          
          {/* Left Column */}
          <div className="space-y-8">
            <div className="backdrop-blur-xl bg-[#DCEDC8]/60 border border-white/30 rounded-3xl p-8 shadow-2xl">
              <h3 className="text-2xl font-bold text-black mb-6">Our Story</h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                At Deva Pk Medicine in Rawalpindi you experience an easy & hassle free online shopping in Pakistan. 
                Deva Pk Medicine in Pakistan is a platform where you can avail bundles of outrageous discounts on 
                quality products & services. We work with the best companies to bring you goods/offers you wish for. 
                At Deva Pk we strive to achieve the highest level of "customer satisfaction" possible.
              </p>
              <p className="text-gray-600 leading-relaxed">
                Our cutting edge e-commerce platform, highly experienced team & quality brands do it in style.
              </p>
            </div>

            <div className="backdrop-blur-xl bg-[#DCEDC8]/60 border border-white/30 rounded-3xl p-8 shadow-2xl">
              <h3 className="text-2xl font-bold text-black mb-6">What is Herbalism?</h3>
              <p className="text-gray-600 mb-4 leading-relaxed">
                Herbalism (also herbal medicine or phytotherapy) is the study of botany and use of plants intended 
                for medicinal purposes or for supplementing a diet. Plants have been the basis for medical 
                treatments through much of human history, and such traditional medicine is still widely practiced 
                today.
              </p>
              <p className="text-gray-600 leading-relaxed">
                Modern medicine recognizes herbalism as a form of alternative medicine. We embrace traditional wisdom 
                while ensuring quality and safety in all our herbal remedies.
              </p>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-8">
            <div className="backdrop-blur-xl bg-[#DCEDC8]/60 border border-white/30 rounded-3xl p-8 shadow-2xl">
              <h3 className="text-2xl font-bold text-black mb-6">Contact Information</h3>
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-14 h-14 bg-black/20 backdrop-blur-sm rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg">
                    <svg className="w-7 h-7 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-bold text-black mb-1">Phone</h4>
                    <p className="text-gray-600">+92 345 700 0088</p>
                    <p className="text-gray-600">+92 300 250 0026</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-14 h-14 bg-black/20 backdrop-blur-sm rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg">
                    <svg className="w-7 h-7 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-bold text-black mb-1">Location</h4>
                    <p className="text-gray-600">Hakim Muhammad Amjal Khan Rd, Near Lal Haveli, Bohar Bazar, Rawalpindi.</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-14 h-14 bg-black/20 backdrop-blur-sm rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg">
                    <svg className="w-7 h-7 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-bold text-black mb-1">Email / Web</h4>
                    <p className="text-gray-600">bdhdeva@yahoo.com</p>
                    <p className="text-gray-600">www.devapk.com</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-14 h-14 bg-black/20 backdrop-blur-sm rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg">
                    <svg className="w-7 h-7 text-black" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-bold text-black mb-1">Facebook</h4>
                    <p className="text-gray-600">facebook.com/devaherbalpro</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="backdrop-blur-xl bg-[#DCEDC8]/60 border border-white/30 rounded-3xl p-8 shadow-2xl">
              <h3 className="text-2xl font-bold text-black mb-6">Our Mission</h3>
              <p className="text-gray-600 leading-relaxed">
                We believe DevaPk Health to be a special company of people proud of their past and excited about 
                their future. Above all, it is a company defined by character and integrity of its people. 
                As we work to serve our customers, to build strong technology and product.
              </p>
            </div>
          </div>
        </div>

        {/* Back to Home */}
        <div className="mt-16 text-center">
          <Link 
            to="/" 
            className="inline-block bg-black text-white px-8 py-4 rounded-2xl font-mono text-sm font-bold uppercase tracking-widest hover:bg-gray-900 transition-all duration-300 shadow-lg transform hover:scale-105"
          >
            Back to Home
          </Link>
        </div>

        <SocialSection />
      </div>

      <style>{`
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
}
