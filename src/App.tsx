import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/context/AuthContext";
import { ProtectedRoute, AdminRoute } from "@/components/RouteGuards";
import StoreLayout from "@/components/StoreLayout";
import AdminLayout from "@/components/AdminLayout";
import HomePage from "@/pages/Home";
import ShopPage from "@/pages/Shop";
import ProductDetailPage from "@/pages/ProductDetail";
import CartPage from "@/pages/Cart";
import CheckoutPage from "@/pages/Checkout";
import OrderConfirmationPage from "@/pages/OrderConfirmation";
import BlogPage from "@/pages/Blog";
import BlogPostPage from "@/pages/BlogPost";
import AccountPage from "@/pages/Account";
import OrderDetailPage from "@/pages/OrderDetail";
import LoginPage from "@/pages/Login";
import AdminDashboard from "@/pages/admin/Dashboard";
import AdminProducts from "@/pages/admin/Products";
import AdminCategories from "@/pages/admin/Categories";
import AdminBrands from "@/pages/admin/Brands";
import AdminDeals from "@/pages/admin/Deals";
import AdminOrders from "@/pages/admin/Orders";
import AdminCoupons from "@/pages/admin/Coupons";
import AdminReviews from "@/pages/admin/Reviews";
import AdminBlog from "@/pages/admin/BlogAdmin";
import AdminSubscribers from "@/pages/admin/Subscribers";
import AdminUsers from "@/pages/admin/Users";
import AdminSettings from "@/pages/admin/Settings";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route element={<StoreLayout />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/shop" element={<ShopPage />} />
              <Route path="/product/:slug" element={<ProductDetailPage />} />
              <Route path="/blog" element={<BlogPage />} />
              <Route path="/blog/:slug" element={<BlogPostPage />} />
              <Route path="/cart" element={<ProtectedRoute><CartPage /></ProtectedRoute>} />
              <Route path="/checkout" element={<ProtectedRoute><CheckoutPage /></ProtectedRoute>} />
              <Route path="/order-confirmation" element={<ProtectedRoute><OrderConfirmationPage /></ProtectedRoute>} />
              <Route path="/account" element={<ProtectedRoute><AccountPage /></ProtectedRoute>} />
              <Route path="/account/orders" element={<ProtectedRoute><AccountPage /></ProtectedRoute>} />
              <Route path="/account/orders/:id" element={<ProtectedRoute><OrderDetailPage /></ProtectedRoute>} />
            </Route>
            <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
              <Route index element={<AdminDashboard />} />
              <Route path="products" element={<AdminProducts />} />
              <Route path="categories" element={<AdminCategories />} />
              <Route path="brands" element={<AdminBrands />} />
              <Route path="deals" element={<AdminDeals />} />
              <Route path="orders" element={<AdminOrders />} />
              <Route path="coupons" element={<AdminCoupons />} />
              <Route path="reviews" element={<AdminReviews />} />
              <Route path="blog" element={<AdminBlog />} />
              <Route path="subscribers" element={<AdminSubscribers />} />
              <Route path="users" element={<AdminUsers />} />
              <Route path="settings" element={<AdminSettings />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
