import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export default function Footer() {
  const { data: storeName } = useQuery({
    queryKey: ['settings', 'store_name'],
    queryFn: async () => {
      const { data } = await supabase.from('settings').select('value').eq('key', 'store_name').single();
      return data?.value ?? 'STORE';
    },
  });

  return (
    <footer className="border-t-2 border-foreground bg-background py-8">
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          <span className="font-mono text-xs font-bold uppercase tracking-widest">{storeName}</span>
          <nav className="flex gap-6">
            <Link to="/" className="font-mono text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground">HOME</Link>
            <Link to="/shop" className="font-mono text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground">SHOP</Link>
            <Link to="/blog" className="font-mono text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground">BLOG</Link>
          </nav>
          <span className="font-mono text-xs text-muted-foreground">© {new Date().getFullYear()} {storeName}. ALL RIGHTS RESERVED.</span>
        </div>
      </div>
    </footer>
  );
}
