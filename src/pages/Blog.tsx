import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Link } from 'react-router-dom';
import { Youtube } from 'lucide-react';

export default function BlogPage() {
  const { data: posts, isLoading } = useQuery({
    queryKey: ['blog_posts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*, profiles(full_name)')
        .eq('is_published', true)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  if (isLoading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="backdrop-blur-xl bg-[#DCEDC8]/60 border border-white/30 rounded-3xl p-8 shadow-2xl">
        <div className="font-mono text-sm text-gray-600">FETCHING DATA...</div>
      </div>
    </div>
  );

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
            Blog
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Discover insights about herbal medicine and natural remedies
          </p>
        </div>

        {posts?.length === 0 ? (
          <div className="backdrop-blur-xl bg-[#DCEDC8]/60 border border-white/30 rounded-3xl p-12 shadow-2xl max-w-2xl mx-auto text-center">
            <div className="font-mono text-lg text-gray-600">NO POSTS YET.</div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {posts?.map((post) => (
              <Link
                key={post.id}
                to={`/blog/${post.slug}`}
                className="block backdrop-blur-xl bg-[#DCEDC8]/60 border border-white/30 rounded-3xl p-6 shadow-2xl hover:shadow-3xl transition-all duration-300 group"
              >
                {post.cover_image_url ? (
                  <div className="mb-6 aspect-square bg-white overflow-hidden rounded-2xl">
                    <img
                      src={post.cover_image_url}
                      alt={post.title}
                      className="h-full w-full object-contain group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                ) : (
                  <div className="mb-6 aspect-square bg-white flex items-center justify-center rounded-2xl">
                    <span className="font-mono text-sm text-gray-500">NO IMAGE</span>
                  </div>
                )}

                <h3 className="block text-2xl font-bold text-black group-hover:text-gray-700 transition-colors duration-300 mb-4">
                  {post.title}
                </h3>

                <div className="text-sm text-gray-600 mb-8 leading-relaxed line-clamp-3">
                  {post.content ? (
                    <p>{post.content.slice(0, 150)}...</p>
                  ) : (
                    <div className="flex flex-col gap-2 opacity-50">
                      <div className="w-full border-b-2 border-dashed border-gray-400"></div>
                      <div className="w-full border-b-2 border-dashed border-gray-400"></div>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between mt-auto">
                  <div className="flex items-center gap-2 font-mono text-xs text-gray-500">
                    <span className="lowercase">{(post.profiles as any)?.full_name ?? 'abubakar'}</span>
                    <span>·</span>
                    <span>{new Date(post.created_at).toLocaleDateString()}</span>
                  </div>

                  <span className="font-mono text-xs text-black group-hover:text-gray-700 transition-all duration-300">
                    READ MORE →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Medical Videos Section */}
        <div className="mt-24 pt-16 border-t border-gray-200 backdrop-blur-sm">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-black mb-4">
              Medical Videos
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Expert advice and insights on natural health
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 max-w-7xl mx-auto px-4">
            {/* Video 1 */}
            <div className="aspect-video w-full rounded-3xl overflow-hidden shadow-2xl border border-white/30">
              <iframe
                width="100%"
                height="100%"
                src="https://www.youtube.com/embed/aAWxISpSBnw?si=lwLX66Mi5Tf6bD3S"
                title="Medical Video 1"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
                className="w-full h-full object-cover"
              ></iframe>
            </div>

            {/* Video 2 */}
            <div className="aspect-video w-full rounded-3xl overflow-hidden shadow-2xl border border-white/30">
              <iframe
                width="100%"
                height="100%"
                src="https://www.youtube.com/embed/4ARyGHjQvA4?si=FpNLEoNXe1NAl9ev"
                title="Medical Video 2"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
                className="w-full h-full object-cover"
              ></iframe>
            </div>

            {/* Video 3 */}
            <div className="aspect-video w-full rounded-3xl overflow-hidden shadow-2xl border border-white/30">
              <iframe
                width="100%"
                height="100%"
                src="https://www.youtube.com/embed/ISRwjD4GJhE?si=uS_g7V0WbZHhlLgp"
                title="Medical Video 3"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
                className="w-full h-full object-cover"
              ></iframe>
            </div>

            {/* Video 4 */}
            <div className="aspect-video w-full rounded-3xl overflow-hidden shadow-2xl border border-white/30">
              <iframe
                width="100%"
                height="100%"
                src="https://www.youtube.com/embed/m5nk8hVWCJs?si=V9QoXf1OJwrW5259"
                title="Medical Video 4"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
                className="w-full h-full object-cover"
              ></iframe>
            </div>

            {/* Video 5 */}
            <div className="aspect-video w-full rounded-3xl overflow-hidden shadow-2xl border border-white/30">
              <iframe
                width="100%"
                height="100%"
                src="https://www.youtube.com/embed/S8XmGyeF04U?si=6nkuA2RI44PvxCec"
                title="Medical Video 5"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
                className="w-full h-full object-cover"
              ></iframe>
            </div>

            {/* Video 6 */}
            <div className="aspect-video w-full rounded-3xl overflow-hidden shadow-2xl border border-white/30">
              <iframe
                width="100%"
                height="100%"
                src="https://www.youtube.com/embed/U2b7olSPJAw?si=YN4mNNweVQMPJjXc"
                title="Medical Video 6"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
                className="w-full h-full object-cover"
              ></iframe>
            </div>

            {/* Video 7 */}
            <div className="aspect-video w-full rounded-3xl overflow-hidden shadow-2xl border border-white/30">
              <iframe
                width="100%"
                height="100%"
                src="https://www.youtube.com/embed/4FDF3Y3B2dE?si=BN3uYgOqFTTK6DTC"
                title="Medical Video 7"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
                className="w-full h-full object-cover"
              ></iframe>
            </div>

            {/* Video 8 */}
            <div className="aspect-video w-full rounded-3xl overflow-hidden shadow-2xl border border-white/30">
              <iframe
                width="100%"
                height="100%"
                src="https://www.youtube.com/embed/S8XmGyeF04U?si=r2az11cbEJumX7vd"
                title="Medical Video 8"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
                className="w-full h-full object-cover"
              ></iframe>
            </div>
          </div>
        </div>

        {/* Pashto Videos Section */}
        <div className="mt-24 pt-16 border-t border-gray-200 backdrop-blur-sm">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-black mb-4">
              Pashto Videos
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
              Expert health insights in Pashto
            </p>

            {/* Channel Block */}
            <a
              href="https://www.youtube.com/@pashtohealthtube1185/videos"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 backdrop-blur-xl bg-white/40 border border-white/40 rounded-full px-6 py-3 shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 group"
            >
              <div className="bg-red-600 p-2 rounded-full text-white group-hover:bg-red-700 transition-colors">
                <Youtube size={24} />
              </div>
              <span className="font-bold text-lg text-black">Pashto Health Tube</span>
            </a>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto px-4">
            {/* Pashto Video 1 */}
            <div className="aspect-video w-full rounded-3xl overflow-hidden shadow-2xl border border-white/30">
              <iframe
                width="100%"
                height="100%"
                src="https://www.youtube.com/embed/rWyLkJ90bGQ?si=C2xN2_mvSDnlcu6_"
                title="Pashto Video 1"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
                className="w-full h-full object-cover"
              ></iframe>
            </div>

            {/* Pashto Video 2 */}
            <div className="aspect-video w-full rounded-3xl overflow-hidden shadow-2xl border border-white/30">
              <iframe
                width="100%"
                height="100%"
                src="https://www.youtube.com/embed/uZJRjnHEgHM?si=9g77G6TIt1LZimOI"
                title="Pashto Video 2"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
                className="w-full h-full object-cover"
              ></iframe>
            </div>

            {/* Pashto Video 3 */}
            <div className="aspect-video w-full rounded-3xl overflow-hidden shadow-2xl border border-white/30">
              <iframe
                width="100%"
                height="100%"
                src="https://www.youtube.com/embed/a3DxXvgxihQ?si=oV5O59O6Z01oYuUv"
                title="Pashto Video 3"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
                className="w-full h-full object-cover"
              ></iframe>
            </div>

            {/* Pashto Video 4 */}
            <div className="aspect-video w-full rounded-3xl overflow-hidden shadow-2xl border border-white/30">
              <iframe
                width="100%"
                height="100%"
                src="https://www.youtube.com/embed/1I3zRaaUgA0?si=hsKYBM3ZZDchiJyG"
                title="Pashto Video 4"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
                className="w-full h-full object-cover"
              ></iframe>
            </div>
          </div>
        </div>
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
