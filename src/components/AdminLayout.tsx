import { Link, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

const navItems = [
  { path: '/admin', label: 'DASHBOARD' },
  { path: '/admin/products', label: 'PRODUCTS' },
  { path: '/admin/categories', label: 'CATEGORIES' },
  { path: '/admin/brands', label: 'BRANDS' },
  { path: '/admin/deals', label: 'DEALS' },
  { path: '/admin/orders', label: 'ORDERS' },
  { path: '/admin/coupons', label: 'COUPONS' },
  { path: '/admin/reviews', label: 'REVIEWS' },
  { path: '/admin/blog', label: 'BLOG' },
  { path: '/admin/subscribers', label: 'SUBSCRIBERS' },
  { path: '/admin/users', label: 'USERS' },
  { path: '/admin/settings', label: 'SETTINGS' },
];

export default function AdminLayout() {
  const location = useLocation();
  const { profile, signOut } = useAuth();

  const currentTitle = navItems.find((item) =>
    item.path === '/admin'
      ? location.pathname === '/admin'
      : location.pathname.startsWith(item.path)
  )?.label ?? 'ADMIN';

  return (
    <div className="flex min-h-screen">
      <aside className="fixed left-0 top-0 z-40 flex h-screen w-[220px] flex-col border-r-2 border-foreground bg-sidebar">
        <div className="border-b border-sidebar-border p-4">
          <Link to="/" className="font-mono text-xs font-bold uppercase tracking-widest text-sidebar-foreground">
            ← STORE
          </Link>
        </div>
        <nav className="flex-1 overflow-y-auto py-2">
          {navItems.map((item) => {
            const isActive = item.path === '/admin'
              ? location.pathname === '/admin'
              : location.pathname.startsWith(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`block px-4 py-2 font-mono text-xs uppercase tracking-widest ${
                  isActive
                    ? 'border-l-2 border-sidebar-primary bg-sidebar-accent font-bold text-sidebar-foreground'
                    : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground'
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      <div className="ml-[220px] flex flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-12 items-center justify-between border-b-2 border-foreground bg-background px-6">
          <span className="font-mono text-xs font-bold uppercase tracking-widest">{currentTitle}</span>
          <div className="flex items-center gap-4">
            <span className="font-mono text-xs text-muted-foreground">{profile?.email}</span>
            <button onClick={signOut} className="font-mono text-xs text-destructive hover:underline">LOGOUT</button>
          </div>
        </header>
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
