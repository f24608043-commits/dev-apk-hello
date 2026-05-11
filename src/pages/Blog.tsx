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

  if (isLoading) return <div className="p-6 font-mono text-xs text-muted-foreground">FETCHING DATA...</div>;

  return (
    <div className="mx-auto max-w-7xl px-6 py-8">
      <h1 className="display-heading mb-8 text-2xl">BLOG</h1>
      {posts?.length === 0 ? (
        <p className="font-mono text-xs text-muted-foreground">NO POSTS YET.</p>
      ) : (
        <div className="grid grid-cols-1 gap-px border border-border bg-border sm:grid-cols-2 lg:grid-cols-3">
          {posts?.map((post) => (
            <div key={post.id} className="bg-background p-4">
              {post.cover_image_url ? (
                <div className="mb-4 aspect-video bg-muted overflow-hidden">
                  <img src={post.cover_image_url} alt={post.title} className="h-full w-full object-cover" />
                </div>
              ) : (
                <div className="mb-4 aspect-video bg-muted flex items-center justify-center">
                  <span className="font-mono text-xs text-muted-foreground">NO IMAGE</span>
                </div>
              )}
              <Link to={`/blog/${post.slug}`} className="display-heading text-lg hover:text-accent">{post.title}</Link>
              <p className="mt-2 text-xs text-muted-foreground">{post.content?.slice(0, 150)}...</p>
              <div className="mt-2 flex items-center gap-2 font-mono text-xs text-muted-foreground">
                <span>{(post.profiles as any)?.full_name ?? 'Admin'}</span>
                <span>·</span>
                <span>{new Date(post.created_at).toLocaleDateString()}</span>
              </div>
              <Link to={`/blog/${post.slug}`} className="mt-2 block font-mono text-xs text-accent hover:underline">READ MORE →</Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
