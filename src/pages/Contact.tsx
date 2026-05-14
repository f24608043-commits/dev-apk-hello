import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import SocialSection from '@/components/SocialSection';

interface ContactFormData {
  name: string;
  email: string;
  phone: string;
  message: string;
}

export default function ContactPage() {
  const [formData, setFormData] = useState<ContactFormData>({
    name: '',
    email: '',
    phone: '',
    message: ''
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errors, setErrors] = useState<Partial<ContactFormData>>({});

  const queryClient = useQueryClient();

  const submitContact = useMutation({
    mutationFn: async (data: ContactFormData) => {
      const submissionData = {
        key: `contact_${Date.now()}`,
        value: JSON.stringify({
          name: data.name,
          email: data.email,
          phone: data.phone,
          message: data.message,
          timestamp: new Date().toISOString()
        })
      };
      
      const { error } = await supabase
        .from('settings')
        .insert([submissionData]);
      
      if (error) throw error;
      return true;
    },
    onSuccess: () => {
      setIsSubmitted(true);
      setFormData({ name: '', email: '', phone: '', message: '' });
      setErrors({});
    },
    onError: (error) => {
      console.error('Contact form submission error:', error);
    }
  });

  const validateForm = (): boolean => {
    const newErrors: Partial<ContactFormData> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^[\d\s\-\+\(\)]+$/.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    if (!formData.message.trim()) {
      newErrors.message = 'Message is required';
    } else if (formData.message.trim().length < 10) {
      newErrors.message = 'Message must be at least 10 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      submitContact.mutate(formData);
    }
  };

  const handleInputChange = (field: keyof ContactFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="backdrop-blur-xl bg-[#DCEDC8]/60 border border-white/30 rounded-3xl p-8 shadow-2xl max-w-md w-full">
          <div className="w-20 h-20 bg-black/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
            <svg className="w-10 h-10 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-black mb-4 text-center">Message Sent!</h2>
          <p className="text-gray-600 mb-6 text-center">
            Thank you for contacting us. We'll get back to you within 24 hours.
          </p>
          <button
            onClick={() => setIsSubmitted(false)}
            className="w-full bg-black text-white py-3 rounded-2xl font-semibold hover:bg-gray-900 transition-all duration-300 shadow-lg transform hover:scale-105"
          >
            Send Another Message
          </button>
        </div>
      </div>
    );
  }

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
            Contact Us
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Have questions about our herbal remedies? Our team of experts is here to help you on your wellness journey.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
          
          {/* Contact Information */}
          <div className="space-y-8">
            <div className="backdrop-blur-xl bg-[#DCEDC8]/60 border border-white/30 rounded-3xl p-8 shadow-2xl">
              <h2 className="text-3xl font-bold text-black mb-6">Get in Touch</h2>
              <p className="text-gray-600 mb-8 leading-relaxed">
                Our team of herbal medicine experts is ready to assist you with product recommendations, 
                dosage guidance, and any questions about traditional remedies.
              </p>

              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-14 h-14 bg-black/20 backdrop-blur-sm rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg">
                    <svg className="w-7 h-7 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-bold text-black mb-1">Phone / WhatsApp</h3>
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
                    <h3 className="font-bold text-black mb-1">Location</h3>
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
                    <h3 className="font-bold text-black mb-1">Email / Web</h3>
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
                    <h3 className="font-bold text-black mb-1">Facebook</h3>
                    <p className="text-gray-600">facebook.com/devaherbalpro</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Business Hours Card */}
            <div className="backdrop-blur-xl bg-[#DCEDC8]/60 border border-white/30 rounded-3xl p-8 shadow-2xl">
              <h3 className="text-2xl font-bold text-black mb-4">Business Hours</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Monday - Sunday</span>
                  <span className="font-semibold text-black">10:00 AM - 09:00 PM (PST)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="backdrop-blur-xl bg-[#DCEDC8]/60 border border-white/30 rounded-3xl p-8 shadow-2xl">
            <h2 className="text-3xl font-bold text-black mb-6">Send a Message</h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className={`w-full px-4 py-3 rounded-2xl bg-white/30 backdrop-blur-sm border-2 ${
                      errors.name ? 'border-red-400' : 'border-white/40'
                    } text-gray-800 placeholder-gray-500 focus:outline-none focus:border-black focus:bg-white/50 transition-all duration-300`}
                    placeholder="John Doe"
                  />
                  {errors.name && (
                    <p className="text-red-500 text-sm mt-2">{errors.name}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className={`w-full px-4 py-3 rounded-2xl bg-white/30 backdrop-blur-sm border-2 ${
                      errors.email ? 'border-red-400' : 'border-white/40'
                    } text-gray-800 placeholder-gray-500 focus:outline-none focus:border-black focus:bg-white/50 transition-all duration-300`}
                    placeholder="john@example.com"
                  />
                  {errors.email && (
                    <p className="text-red-500 text-sm mt-2">{errors.email}</p>
                  )}
                </div>
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-semibold text-gray-700 mb-2">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className={`w-full px-4 py-3 rounded-2xl bg-white/30 backdrop-blur-sm border-2 ${
                    errors.phone ? 'border-red-400' : 'border-white/40'
                  } text-gray-800 placeholder-gray-500 focus:outline-none focus:border-black focus:bg-white/50 transition-all duration-300`}
                  placeholder="0300-1234567"
                />
                {errors.phone && (
                  <p className="text-red-500 text-sm mt-2">{errors.phone}</p>
                )}
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-semibold text-gray-700 mb-2">
                  Message *
                </label>
                <textarea
                  id="message"
                  rows={5}
                  value={formData.message}
                  onChange={(e) => handleInputChange('message', e.target.value)}
                  className={`w-full px-4 py-3 rounded-2xl bg-white/30 backdrop-blur-sm border-2 ${
                    errors.message ? 'border-red-400' : 'border-white/40'
                  } text-gray-800 placeholder-gray-500 focus:outline-none focus:border-black focus:bg-white/50 transition-all duration-300 resize-none`}
                  placeholder="Tell us about your question or the herbal remedy you're looking for..."
                />
                {errors.message && (
                  <p className="text-red-500 text-sm mt-2">{errors.message}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={submitContact.isPending}
                className="w-full bg-black text-white py-4 px-6 rounded-2xl font-semibold hover:bg-gray-900 transition-all duration-300 shadow-lg transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {submitContact.isPending ? 'Sending...' : 'Send Message'}
              </button>
            </form>
          </div>
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
