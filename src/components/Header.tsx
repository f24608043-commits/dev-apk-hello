import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useState } from 'react';

export default function Header() {
  const { user, profile, isAdmin, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);

  const { data: storeName } = useQuery({
    queryKey: ['settings', 'store_name'],
    queryFn: async () => {
      const { data } = await supabase.from('settings').select('value').eq('key', 'store_name').single();
      return data?.value ?? 'STORE';
    },
  });

  const { data: cartCount } = useQuery({
    queryKey: ['cart_count', user?.id],
    queryFn: async () => {
      if (!user) return 0;
      const { data } = await supabase.from('cart_items').select('quantity').eq('user_id', user.id);
      return data?.reduce((sum, item) => sum + item.quantity, 0) ?? 0;
    },
    enabled: !!user,
    refetchOnWindowFocus: true,
  });

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data } = await supabase.from('categories').select('*').order('name');
      return data ?? [];
    },
  });

  const parentCategories = categories ?? [];
  const getSubcategories = (parentId: string) => []; // No subcategories in current schema

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (searchValue.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchValue.trim())}`);
      setSearchOpen(false);
      setSearchValue('');
    }
  }

  return (
    <header className="sticky top-0 z-50 border-b-2 border-foreground bg-background">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-6">
        <Link to="/" className="font-mono text-sm font-bold uppercase tracking-widest text-foreground">
          {storeName}
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          <Link to="/" className="text-xs font-bold uppercase tracking-widest text-foreground hover:text-accent">HOME</Link>
          <Link to="/shop" className="text-xs font-bold uppercase tracking-widest text-foreground hover:text-accent">SHOP</Link>
          <Link to="/blog" className="text-xs font-bold uppercase tracking-widest text-foreground hover:text-accent">BLOG</Link>
          {parentCategories.map((category) => (
            <Link key={category.id} to={`/shop?category=${category.slug}`} className="text-xs font-bold uppercase tracking-widest text-foreground hover:text-accent">
              {category.name}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          {searchOpen ? (
            <form onSubmit={handleSearch} className="flex items-center border-2 border-foreground">
              <input
                type="text"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                placeholder="SEARCH..."
                className="h-8 w-48 bg-background px-2 font-mono text-xs outline-none"
                autoFocus
              />
              <button type="button" onClick={() => setSearchOpen(false)} className="px-2 font-mono text-xs">✕</button>
            </form>
          ) : (
            <button onClick={() => setSearchOpen(true)} className="font-mono text-xs font-bold uppercase tracking-widest hover:text-accent">
              🔍 SEARCH
            </button>
          )}

          <button
            onClick={toggleTheme}
            className="font-mono text-xs font-bold uppercase tracking-widest hover:text-accent"
            title="Toggle theme"
          >
            {theme === 'light' ? '🌙' : '☀️'}
          </button>

          <Link to="/cart" className="relative font-mono text-xs font-bold uppercase tracking-widest hover:text-accent">
              🛒 CART
            {(cartCount ?? 0) > 0 && (
              <span className="absolute -right-3 -top-2 flex h-4 w-4 items-center justify-center bg-accent text-[10px] font-bold text-accent-foreground">
                {cartCount}
              </span>
            )}
          </Link>

          {user ? (
            <div className="relative">
              <button onClick={() => setMenuOpen(!menuOpen)} className="font-mono text-xs font-bold uppercase tracking-widest hover:text-accent">
                👤 ACCOUNT
              </button>
              {menuOpen && (
                <div className="absolute right-0 top-full z-50 mt-1 w-48 border-2 border-foreground bg-background">
                  <Link to="/account" onClick={() => setMenuOpen(false)} className="block px-4 py-2 font-mono text-xs hover:bg-muted">PROFILE</Link>
                  <Link to="/account/orders" onClick={() => setMenuOpen(false)} className="block px-4 py-2 font-mono text-xs hover:bg-muted">ORDERS</Link>
                  {isAdmin && (
                    <Link to="/admin" onClick={() => setMenuOpen(false)} className="block px-4 py-2 font-mono text-xs hover:bg-muted">ADMIN PANEL</Link>
                  )}
                  <button onClick={() => { signOut(); setMenuOpen(false); }} className="block w-full px-4 py-2 text-left font-mono text-xs text-destructive hover:bg-muted">
                    LOGOUT
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link to="/login" className="font-mono text-xs font-bold uppercase tracking-widest hover:text-accent">LOGIN</Link>
          )}

          <button onClick={() => setMenuOpen(!menuOpen)} className="font-mono text-xs font-bold md:hidden">☰</button>
        </div>
      </div>

      {/* Mobile nav */}
      {menuOpen && (
        <div className="border-t border-border px-6 py-4 md:hidden">
          <Link to="/" onClick={() => setMenuOpen(false)} className="block py-2 text-xs font-bold uppercase tracking-widest">HOME</Link>
          {parentCategories.map((category) => (
            <Link key={category.id} to={`/shop?category=${category.slug}`} onClick={() => setMenuOpen(false)} className="block py-2 text-xs font-bold uppercase tracking-widest">{category.name}</Link>
          ))}
          <Link to="/blog" onClick={() => setMenuOpen(false)} className="block py-2 text-xs font-bold uppercase tracking-widest">BLOG</Link>
        </div>
      )}
    </header>
  );
}
