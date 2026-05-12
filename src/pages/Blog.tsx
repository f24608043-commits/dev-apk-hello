import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Link } from 'react-router-dom';

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
      <div className="backdrop-blur-xl bg-white/20 border border-white/30 rounded-3xl p-8 shadow-2xl">
        <div className="font-mono text-sm text-gray-600">FETCHING DATA...</div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 relative overflow-hidden">
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
          <div className="backdrop-blur-xl bg-white/20 border border-white/30 rounded-3xl p-12 shadow-2xl max-w-2xl mx-auto text-center">
            <div className="font-mono text-lg text-gray-600">NO POSTS YET.</div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {posts?.map((post) => (
              <div key={post.id} className="backdrop-blur-xl bg-white/20 border border-white/30 rounded-3xl p-6 shadow-2xl hover:shadow-3xl transition-all duration-300">
                {post.cover_image_url ? (
                  <div className="mb-6 aspect-video bg-gray-100 overflow-hidden rounded-2xl">
                    <img 
                      src={post.cover_image_url} 
                      alt={post.title} 
                      className="h-full w-full object-cover hover:scale-105 transition-transform duration-300" 
                    />
                  </div>
                ) : (
                  <div className="mb-6 aspect-video bg-gray-100 flex items-center justify-center rounded-2xl">
                    <span className="font-mono text-sm text-gray-500">NO IMAGE</span>
                  </div>
                )}
                
                <Link 
                  to={`/blog/${post.slug}`} 
                  className="block text-xl font-bold text-black hover:text-gray-700 transition-colors duration-300 mb-4"
                >
                  {post.title}
                </Link>
                
                <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                  {post.content?.slice(0, 150)}...
                </p>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-mono text-xs text-gray-500">
                    <span>{(post.profiles as any)?.full_name ?? 'Admin'}</span>
                    <span>·</span>
                    <span>{new Date(post.created_at).toLocaleDateString()}</span>
                  </div>
                  
                  <Link 
                    to={`/blog/${post.slug}`} 
                    className="font-mono text-xs text-black hover:text-gray-700 hover:underline transition-all duration-300"
                  >
                    READ MORE →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
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
