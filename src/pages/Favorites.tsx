import { Link } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Heart, ArrowRight, ShoppingBag } from "lucide-react";
import { useFavorites } from "@/contexts/FavoritesContext";
import { useCart } from "@/contexts/CartContext";
import ProductCard from "@/components/ProductCard";

const Favorites = () => {
  const { state: favoritesState, removeFromFavorites, clearFavorites } = useFavorites();
  const { addToCart } = useCart();

  const handleAddToCart = (product: any) => {
    addToCart(product);
  };

  if (favoritesState.items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navigation />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center py-20">
            <Heart className="h-24 w-24 text-muted-foreground mx-auto mb-6" />
            <h2 className="font-heading text-3xl font-bold mb-4">Your Favorites is Empty</h2>
            <p className="text-muted-foreground mb-8">Looks like you haven't added anything to your favorites yet.</p>
            <Link to="/shop">
              <Button size="lg" className="btn-gold">
                Start Shopping
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />

      <main className="flex-1">
        {/* Page Header */}
        <section className="bg-muted py-12">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="font-heading text-4xl md:text-5xl font-bold mb-4">My Favorites</h1>
                <p className="text-muted-foreground">{favoritesState.count} {favoritesState.count === 1 ? 'item' : 'items'} in your favorites</p>
              </div>
              {favoritesState.items.length > 0 && (
                <Button 
                  variant="outline" 
                  onClick={clearFavorites}
                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                  Clear All
                </Button>
              )}
            </div>
          </div>
        </section>

        {/* Favorites Content */}
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {favoritesState.items.map((product) => (
              <div key={product.id} className="relative group">
                <ProductCard product={product} />
                <div className="absolute top-2 right-2 z-10">
                  <Button
                    size="icon"
                    variant="secondary"
                    className="rounded-full bg-background/80 backdrop-blur-sm hover:bg-background/90"
                    onClick={() => removeFromFavorites(product.id)}
                  >
                    <Heart className="h-4 w-4 fill-accent text-accent" />
                  </Button>
                </div>
                <div className="absolute bottom-2 right-2 z-10">
                  <Button
                    size="sm"
                    className="rounded-full bg-accent hover:bg-accent/90 text-primary-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => handleAddToCart(product)}
                  >
                    <ShoppingBag className="h-4 w-4 mr-2" />
                    Add to Cart
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <Link to="/shop">
              <Button variant="outline" size="lg">
                Continue Shopping
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Favorites;
