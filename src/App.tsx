import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { CartProvider } from "./contexts/CartContext";
import { FavoritesProvider } from "./contexts/FavoritesContext";
import { ProductProvider } from "./contexts/ProductContextClean";
import { InventoryProvider } from "./contexts/InventoryContext";
import ScrollToTop from "./components/ScrollToTop";
import ProtectedRoute from "./components/ProtectedRoute";
import ErrorBoundary from "./components/ErrorBoundary";
import Index from "./pages/Index";
import Shop from "./pages/Shop";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import Favorites from "./pages/Favorites";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ForgotPassword from "./pages/ForgotPassword";
import EmailConfirmation from "./pages/EmailConfirmation";
import UserProfile from "./pages/UserProfile";
import AdminDashboard from "./pages/AdminDashboard";
import AdminAddProduct from "./pages/AdminAddProductClean";
import AdminManageProducts from "./pages/AdminManageProductsClean";
import AdminEditProduct from "./pages/AdminEditProduct";
import AdminManageProductsTest from "./pages/AdminManageProductsTest";
import AdminManageProductsMinimal from "./pages/AdminManageProductsMinimal";
import AdminManageProductsNoContext from "./pages/AdminManageProductsNoContext";
import InventoryDashboard from "./pages/InventoryDashboard";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <ErrorBoundary>
        <AuthProvider>
          <ProductProvider>
            <InventoryProvider>
              <CartProvider>
                <FavoritesProvider>
                <Toaster />
                <Sonner />
                <BrowserRouter>
                  <ScrollToTop />
                  <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Index />} />
                <Route path="/shop" element={<Shop />} />
                <Route path="/new-arrivals" element={<Shop />} />
                <Route path="/collections" element={<Shop />} />
                <Route path="/product/:id" element={<ProductDetail />} />
                <Route path="/about" element={<About />} />
                <Route path="/contact" element={<Contact />} />
                
                {/* Auth Routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/auth/callback" element={<EmailConfirmation />} />
                <Route path="/email-confirmation" element={<EmailConfirmation />} />
                
                {/* Protected Customer Routes */}
                <Route path="/profile" element={
                  <ProtectedRoute>
                    <UserProfile />
                  </ProtectedRoute>
                } />
                <Route path="/cart" element={
                  <ProtectedRoute>
                    <Cart />
                  </ProtectedRoute>
                } />
                <Route path="/wishlist" element={
                  <ProtectedRoute>
                    <Favorites />
                  </ProtectedRoute>
                } />
                
                {/* Protected Admin Routes */}
                <Route path="/admin" element={
                  <ProtectedRoute requireAdmin>
                    <AdminDashboard />
                  </ProtectedRoute>
                } />
                <Route path="/admin/add-product" element={
                  <ProtectedRoute requireAdmin>
                    <AdminAddProduct />
                  </ProtectedRoute>
                } />
                <Route path="/admin/manage-products" element={
                  <ProtectedRoute requireAdmin>
                    <AdminManageProducts />
                  </ProtectedRoute>
                } />
                <Route path="/admin/manage-products-test" element={
                  <ProtectedRoute requireAdmin>
                    <AdminManageProductsTest />
                  </ProtectedRoute>
                } />
                <Route path="/admin/manage-products-minimal" element={
                  <ProtectedRoute requireAdmin>
                    <AdminManageProductsMinimal />
                  </ProtectedRoute>
                } />
                <Route path="/admin/manage-products-no-context" element={
                  <ProtectedRoute requireAdmin>
                    <AdminManageProductsNoContext />
                  </ProtectedRoute>
                } />
                <Route path="/admin/edit-product/:id" element={
                  <ProtectedRoute requireAdmin>
                    <AdminEditProduct />
                  </ProtectedRoute>
                } />
                <Route path="/admin/inventory" element={
                  <ProtectedRoute requireAdmin>
                    <InventoryDashboard />
                  </ProtectedRoute>
                } />
                
                {/* 404 - ADD ALL CUSTOM ROUTES ABOVE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
              </BrowserRouter>
              </FavoritesProvider>
            </CartProvider>
          </InventoryProvider>
        </ProductProvider>
      </ErrorBoundary>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
