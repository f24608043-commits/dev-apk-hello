import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export default function BlogPostPage() {
  const { slug } = useParams<{ slug: string }>();

  const { data: post, isLoading } = useQuery({
    queryKey: ['blog_post', slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*, profiles(full_name)')
        .eq('slug', slug!)
        .single();
      if (error) throw error;
      return data;
    },
  });

  if (isLoading) return <div className="p-6 font-mono text-xs text-muted-foreground">FETCHING DATA...</div>;
  if (!post) return <div className="p-6 font-mono text-xs text-destructive">POST_NOT_FOUND.</div>;

  return (
    <div className="mx-auto max-w-3xl px-6 py-8">
      {post.cover_image_url && (
        <div className="mb-6 aspect-video bg-muted overflow-hidden">
          <img src={post.cover_image_url} alt={post.title} className="h-full w-full object-cover" />
        </div>
      )}
      <h1 className="display-heading mb-4 text-3xl">{post.title}</h1>
      <div className="mb-8 font-mono text-xs text-muted-foreground">
        {(post.profiles as any)?.full_name ?? 'Admin'} · {new Date(post.created_at).toLocaleDateString()}
      </div>
      <div className="prose prose-sm max-w-none text-foreground" dangerouslySetInnerHTML={{ __html: post.content ?? '' }} />
    </div>
  );
}
