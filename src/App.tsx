import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CartProvider } from "./contexts/CartContext";
import { FavoritesProvider } from "./contexts/FavoritesContext";
import { ProductProvider } from "./contexts/ProductContextClean";
import ScrollToTop from "./components/ScrollToTop";
import Index from "./pages/Index";
import Shop from "./pages/Shop";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import Favorites from "./pages/Favorites";
import About from "./pages/About";
import Contact from "./pages/Contact";
import AdminDashboard from "./pages/AdminDashboard";
import AdminAddProduct from "./pages/AdminAddProductClean";
import AdminManageProducts from "./pages/AdminManageProductsClean";
import AdminEditProduct from "./pages/AdminEditProduct";
import AdminManageProductsTest from "./pages/AdminManageProductsTest";
import AdminManageProductsMinimal from "./pages/AdminManageProductsMinimal";
import AdminManageProductsNoContext from "./pages/AdminManageProductsNoContext";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <ProductProvider>
        <CartProvider>
          <FavoritesProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <ScrollToTop />
              <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/shop" element={<Shop />} />
              <Route path="/new-arrivals" element={<Shop />} />
              <Route path="/collections" element={<Shop />} />
              <Route path="/product/:id" element={<ProductDetail />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/wishlist" element={<Favorites />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/add-product" element={<AdminAddProduct />} />
              <Route path="/admin/manage-products" element={<AdminManageProducts />} />
              <Route path="/admin/manage-products-test" element={<AdminManageProductsTest />} />
              <Route path="/admin/manage-products-minimal" element={<AdminManageProductsMinimal />} />
              <Route path="/admin/manage-products-no-context" element={<AdminManageProductsNoContext />} />
              <Route path="/admin/edit-product/:id" element={<AdminEditProduct />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
            </BrowserRouter>
          </FavoritesProvider>
        </CartProvider>
      </ProductProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
