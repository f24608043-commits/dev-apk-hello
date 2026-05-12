import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useState } from 'react';
import { SearchIcon, CartIcon, AccountIcon, SunIcon, MoonIcon } from '@/components/Icons';

export default function Header() {
  const { user, profile, isAdmin, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState<string | null>(null);

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
  const getSubcategories = (parentId: string) => categories?.filter(c => c.parent_id === parentId) ?? [];

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
          
          {/* Dynamic Categories in Top Bar */}
          {parentCategories.map((category) => {
            const subcategories = getSubcategories(category.id);
            const hasSubcategories = subcategories && subcategories.length > 0;
            
            if (hasSubcategories) {
              // Category with dropdown
              return (
                <div key={category.id} className="relative">
                  <button
                    onMouseEnter={() => setCategoryDropdownOpen(category.id)}
                    onMouseLeave={() => setCategoryDropdownOpen(null)}
                    className="text-xs font-bold uppercase tracking-widest text-foreground hover:text-accent flex items-center"
                    style={{ cursor: 'pointer' }}
                  >
                    {category.name} ▾
                  </button>
                  
                  {categoryDropdownOpen === category.id && (
                    <div 
                      className="absolute top-full left-0 bg-background border border-foreground shadow-lg z-50"
                      style={{ minWidth: '200px' }}
                      onMouseEnter={() => setCategoryDropdownOpen(category.id)}
                      onMouseLeave={() => setCategoryDropdownOpen(null)}
                    >
                      <Link
                        to={`/shop?category=${category.slug}`}
                        className="block px-4 py-2 text-xs font-bold uppercase tracking-widest text-foreground hover:bg-muted hover:text-accent"
                        style={{ cursor: 'pointer' }}
                        onClick={() => setCategoryDropdownOpen(null)}
                      >
                        {category.name}
                      </Link>
                      <div className="pl-4 bg-muted">
                        {subcategories.map((subcategory) => (
                          <Link
                            key={subcategory.id}
                            to={`/shop?category=${category.slug}&subcategory=${subcategory.slug}`}
                            className="block px-4 py-2 text-xs uppercase tracking-widest text-muted-foreground hover:text-accent"
                            style={{ cursor: 'pointer' }}
                            onClick={() => setCategoryDropdownOpen(null)}
                          >
                            {subcategory.name}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            } else {
              // Category without dropdown - direct link
              return (
                <Link 
                  key={category.id}
                  to={`/shop?category=${category.slug}`} 
                  className="text-xs font-bold uppercase tracking-widest text-foreground hover:text-accent"
                >
                  {category.name}
                </Link>
              );
            }
          })}

          <Link to="/blog" className="text-xs font-bold uppercase tracking-widest text-foreground hover:text-accent">BLOG</Link>
          <Link to="/contact" className="text-xs font-bold uppercase tracking-widest text-foreground hover:text-accent">CONTACT</Link>
          <Link to="/about" className="text-xs font-bold uppercase tracking-widest text-foreground hover:text-accent">ABOUT</Link>
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
            <button onClick={() => setSearchOpen(true)} className="p-2 hover:text-accent" title="Search">
              <SearchIcon className="w-5 h-5" />
            </button>
          )}

          <button
            onClick={toggleTheme}
            className="p-2 hover:text-accent"
            title="Toggle theme"
          >
            {theme === 'light' ? <MoonIcon className="w-5 h-5" /> : <SunIcon className="w-5 h-5" />}
          </button>

          <Link to="/cart" className="relative p-2 hover:text-accent" title="Cart">
              <CartIcon className="w-5 h-5" />
            {(cartCount ?? 0) > 0 && (
              <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center bg-accent text-[10px] font-bold text-accent-foreground">
                {cartCount}
              </span>
            )}
          </Link>

          {user ? (
            <div className="relative">
              <button onClick={() => setMenuOpen(!menuOpen)} className="p-2 hover:text-accent" title="Account">
                <AccountIcon className="w-5 h-5" />
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
          <Link to="/shop" onClick={() => setMenuOpen(false)} className="block py-2 text-xs font-bold uppercase tracking-widest">SHOP</Link>
          
          {/* Mobile Categories - directly in nav */}
          {parentCategories.map((category) => {
            const subcategories = getSubcategories(category.id);
            const hasSubcategories = subcategories && subcategories.length > 0;
            
            if (hasSubcategories) {
              // Category with dropdown
              return (
                <div key={category.id}>
                  <button
                    onClick={() => setCategoryDropdownOpen(categoryDropdownOpen === category.id ? null : category.id)}
                    className="block py-2 text-xs font-bold uppercase tracking-widest text-foreground hover:text-accent flex items-center"
                  >
                    {category.name} ▾
                  </button>
                  
                  {categoryDropdownOpen === category.id && (
                    <div className="pl-4 bg-muted">
                      {subcategories.map((subcategory) => (
                        <Link 
                          key={subcategory.id}
                          to={`/shop?category=${category.slug}&subcategory=${subcategory.slug}`} 
                          onClick={() => setMenuOpen(false)} 
                          className="block pl-4 py-1 text-xs uppercase tracking-widest text-muted-foreground hover:text-accent"
                        >
                          {subcategory.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            } else {
              // Category without dropdown - direct link
              return (
                <Link 
                  key={category.id}
                  to={`/shop?category=${category.slug}`} 
                  onClick={() => setMenuOpen(false)} 
                  className="block py-2 text-xs font-bold uppercase tracking-widest"
                >
                  {category.name}
                </Link>
              );
            }
          })}
          
          <Link to="/blog" onClick={() => setMenuOpen(false)} className="block py-2 text-xs font-bold uppercase tracking-widest">BLOG</Link>
          <Link to="/contact" onClick={() => setMenuOpen(false)} className="block py-2 text-xs font-bold uppercase tracking-widest">CONTACT</Link>
          <Link to="/about" onClick={() => setMenuOpen(false)} className="block py-2 text-xs font-bold uppercase tracking-widest">ABOUT</Link>
        </div>
      )}
    </header>
  );
}
