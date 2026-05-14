import { Link } from 'react-router-dom';
import SocialSection from '@/components/SocialSection';
import { Phone, MapPin, Mail, Globe } from 'lucide-react';

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
          <h1 className="text-[48px] md:text-[64px] font-bold text-black mb-4">About Us</h1>
          <p className="text-xl md:text-2xl font-bold text-black opacity-80 mb-2">Deva Pk Medicine in Pakistan Wholesale 100% Natural</p>
          <p className="text-gray-600">About Deva Pk Medicine in Rawalpindi!</p>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* Left Column */}
          <div className="space-y-8">
            {/* Our Story Card */}
            <div className="bg-[#e4ecdc]/80 backdrop-blur-sm p-8 md:p-10 rounded-[1.5rem] shadow-xl border border-white/30">
              <h2 className="text-2xl font-bold text-black mb-6">Our Story</h2>
              <div className="text-gray-700 space-y-4 leading-relaxed">
                <p>At Deva Pk Medicine in Rawalpindi you experience an easy & hassle free online shopping in Pakistan. Deva Pk Medicine in Pakistan is a platform where you can avail bundles of outrageous discounts on quality products & services. We work with the best companies to bring you goods/offers you wish for. At Deva Pk we strive to achieve the highest level of "customer satisfaction" possible.</p>
                <p>Our cutting edge e-commerce platform, highly experienced team & quality brands do it in style.</p>
              </div>
            </div>

            {/* Founder Card */}
            <div className="bg-[#e4ecdc]/80 backdrop-blur-sm p-8 md:p-10 rounded-[1.5rem] shadow-xl border border-white/30">
              <h2 className="text-2xl font-bold text-black mb-6">The Legend of Hakeem Muhammad Ameen</h2>
              <div className="text-gray-700 space-y-4 leading-relaxed">
                <p>
                  At the heart of our legacy is the visionary <strong>Hakeem Muhammad Ameen</strong>, the esteemed founder of 
                  <em> Badshah Di Hatti</em>. A master of traditional Tibb, Hakeem Sahab has dedicated his life to 
                  unlocking the secrets of nature, resulting in hundreds of unique, powerful medicines that bear 
                  his name and signature of quality.
                </p>
                <p>
                  Today, <strong>Badshah Di Hatti</strong> is celebrated as the most iconic and prestigious herbal 
                  medicine destination in Rawalpindi, Pakistan. Our name is a symbol of absolute purity, 
                  unmatched expertise, and a multi-generational commitment to healing that has made us the 
                  undisputed leaders in natural medicine.
                </p>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-8">


            {/* Our Mission Card */}
            <div className="bg-[#e4ecdc]/80 backdrop-blur-sm p-8 md:p-10 rounded-[1.5rem] shadow-xl border border-white/30">
              <h2 className="text-2xl font-bold text-black mb-6">Our Mission</h2>
              <p className="text-gray-700 leading-relaxed">
                We believe DevaPk Health to be a special company of people proud of their past and excited about their future. Above all, it is a company defined by character and integrity of its people. As we work to serve our customers, to build strong technology and product.
              </p>
            </div>
          </div>
        </div>

        {/* Heritage Section */}
        <section className="mt-20 max-w-6xl mx-auto">
          <h2 className="text-[32px] font-bold text-black text-center mb-12 uppercase tracking-widest">Heritage & Credentials</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-4 rounded-2xl shadow-lg border border-gray-100 transform hover:scale-[1.02] transition-transform duration-300">
              <img 
                alt="License to Practice" 
                className="w-full aspect-[4/5] object-cover rounded-xl mb-4" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCr6HNBO9000c_O00RIYohc0o1Env9Yxa49414xrJ3ejL-gtjZ_VOIs9HKc93ulAkCdndk6CPzlMbUAZubXyl6VHQevzHEZ-DTsiaXsxWtW7Rj6QuAJX2XILU0ph5R9hI26ybHRMGnybLouQJcRgj3xZlKkPKboPhdyNcnOkfdZcYwHQWqyWnA4Q4zEN0RCb9bWD_zT8xz5lZQuTEyRyT6D5Xkr31r7CiuAN3a3TW2hlc08TUMr1OSYggog2MgnQ50sq0ikbWipKcY" 
              />
              <p className="font-bold text-center text-black text-xs uppercase tracking-widest">National Council for Tibb</p>
            </div>
            <div className="bg-white p-4 rounded-2xl shadow-lg border border-gray-100 transform hover:scale-[1.02] transition-transform duration-300">
              <img 
                alt="Graduation Group" 
                className="w-full aspect-[4/5] object-cover rounded-xl mb-4" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCXUyt0GclFyzP3nJ0hiuJqzYXsEy23hNfvxjfcTq2og1hIfOE8zk5ogogzr7aSB2109MRlNyv2HvTU7hD-saGisU3V0CB-k8E2ocjzC3gfJMsIxSGDWLpEVa-R3sNXNh5ef4QWQFHGmZiEiy-bK31xMg13mkBoJPZROqtOWgEVotm9VbMM8zw0fqBy11QsL5Jthttc4-mQsjJwh9rpEj8-GxhprcqQha4E2Na_9p4TKNz-egzOXNSKmm6TZHvenhuaRXgCtVmMMkk" 
              />
              <p className="font-bold text-center text-black text-xs uppercase tracking-widest">Rawalpindi Tibbia Alumni</p>
            </div>
            <div className="grid grid-rows-2 gap-4">
              <div className="bg-white p-2 rounded-2xl shadow-lg border border-gray-100 transform hover:scale-[1.02] transition-transform duration-300">
                <img 
                  alt="Meeting 1" 
                  className="w-full h-full object-cover rounded-xl" 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuBD5WlNK0PZuAPSNQBXGSkCLTcRDb0HvJKnCW_7WOVFKEQMJcQA-UmriZ3LJL93dMMeSfYX1tpU0pngj78HfdcO2H0uyAZUT7xuKCU50Ads6LTz5ghFesFTsjaTxURamL2LeTGON2PbqbARQTaIqcjnXoYQfqJ3j3oUErf52ywYYItX_fEgS_rQYRZOU_n-2cnEUkbnqUFXiYMFh46h9_Av_iT9RfMN-t-jFhezeU4uJsd1lZC5FIsM-pKp3p7DLfiiBa7A6tCp4ZE" 
                />
              </div>
              <div className="bg-white p-2 rounded-2xl shadow-lg border border-gray-100 transform hover:scale-[1.02] transition-transform duration-300">
                <img 
                  alt="Meeting 2" 
                  className="w-full h-full object-cover rounded-xl" 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuAMwmNPWRxmf9UhQZ9AczEm9VHJ7439xzBfPc-Z2-SQywVTfHfwGHC0Nn0AoNj-apbeRcTLdqcOHqUimbsNfDFQ0H-nPKjsoHZyyxSfPN0kAlq3M4SUBkfqqt234Tb9T1xyqOD3bdJH7UmMPKJzVR4EGkcspmsUh1zQN2vW7R0lpSyMg4Q2RpU3hey36dFuM_hIVwbvZ4akxeAUKqQBf9IdzRXak61Ii-Rvx1Xo2382dvs6gDGH4UBQTWPhXq9wG9oYsb7nVzlFjiQ" 
                />
              </div>
            </div>
          </div>
        </section>

        {/* CTA Button */}
        <div className="flex justify-center mt-20 mb-20">
          <Link 
            to="/" 
            className="bg-black text-white px-10 py-4 rounded-full font-bold uppercase tracking-widest hover:bg-gray-900 transition-all shadow-xl transform hover:scale-105 text-sm"
          >
            Back to Home
          </Link>
        </div>

        {/* Social Channels */}
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
