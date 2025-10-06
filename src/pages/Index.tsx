import { Link } from "react-router-dom";
import { ArrowRight, Truck, Shield, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import heroBanner from "@/assets/hero-banner.jpg";
import womenCategory from "@/assets/women-category.jpg";
import menCategory from "@/assets/men-category.jpg";
import product1 from "@/assets/product-1.jpg";
import product2 from "@/assets/product-2.jpg";
import product3 from "@/assets/product-3.jpg";
import product4 from "@/assets/product-4.jpg";

const Index = () => {
  const featuredProducts = [
    { id: 1, name: "Elegant Cream Dress", price: 189.99, image: product1, category: "Women's Wear", isNew: true },
    { id: 2, name: "Blush Pink Blazer", price: 249.99, image: product2, category: "Women's Wear", discount: 20 },
    { id: 3, name: "Gold Accessories Set", price: 129.99, image: product3, category: "Accessories", isNew: true },
    { id: 4, name: "Charcoal Formal Suit", price: 399.99, image: product4, category: "Men's Wear" },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative h-[600px] md:h-[700px] overflow-hidden">
          <div className="absolute inset-0">
            <img
              src={heroBanner}
              alt="JAANU BOUTIQUE Fashion"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-primary/60 to-transparent" />
          </div>
          
          <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center">
            <div className="max-w-2xl animate-fade-in-up">
              <h1 className="font-heading text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
                Timeless Elegance,<br />Modern Style
              </h1>
              <p className="text-lg md:text-xl text-white/90 mb-8 max-w-lg">
                Discover our curated collection of sophisticated fashion pieces designed to elevate your wardrobe.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link to="/shop">
                  <Button size="lg" className="btn-gold text-base">
                    Shop Collection
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link to="/new-arrivals">
                  <Button size="lg" variant="outline" className="btn-outline-gold text-base bg-white/10 backdrop-blur-sm border-white text-white hover:bg-white hover:text-primary">
                    New Arrivals
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Trust Badges */}
        <section className="py-12 bg-muted">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="flex items-center gap-4 justify-center md:justify-start">
                <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center">
                  <Truck className="h-6 w-6 text-accent" />
                </div>
                <div>
                  <h3 className="font-heading font-semibold">Free Shipping</h3>
                  <p className="text-sm text-muted-foreground">On orders over $100</p>
                </div>
              </div>
              <div className="flex items-center gap-4 justify-center md:justify-start">
                <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center">
                  <Shield className="h-6 w-6 text-accent" />
                </div>
                <div>
                  <h3 className="font-heading font-semibold">Secure Payment</h3>
                  <p className="text-sm text-muted-foreground">100% secure transactions</p>
                </div>
              </div>
              <div className="flex items-center gap-4 justify-center md:justify-start">
                <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center">
                  <Clock className="h-6 w-6 text-accent" />
                </div>
                <div>
                  <h3 className="font-heading font-semibold">Easy Returns</h3>
                  <p className="text-sm text-muted-foreground">30-day return policy</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Categories */}
        <section className="py-16 container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-heading text-3xl md:text-4xl font-bold mb-4">Shop by Category</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Explore our carefully curated collections for every style and occasion
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Link to="/shop?category=womens" className="group relative overflow-hidden rounded-lg h-[400px] hover-lift">
              <img
                src={womenCategory}
                alt="Women's Collection"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary/80 to-transparent flex items-end p-8">
                <div className="text-white">
                  <h3 className="font-heading text-3xl font-bold mb-2">Women's Collection</h3>
                  <p className="mb-4 opacity-90">Elegant dresses, blazers & accessories</p>
                  <Button variant="outline" className="btn-outline-gold bg-white/10 backdrop-blur-sm border-white text-white hover:bg-white hover:text-primary">
                    Shop Women's
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Link>

            <Link to="/shop?category=mens" className="group relative overflow-hidden rounded-lg h-[400px] hover-lift">
              <img
                src={menCategory}
                alt="Men's Collection"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary/80 to-transparent flex items-end p-8">
                <div className="text-white">
                  <h3 className="font-heading text-3xl font-bold mb-2">Men's Collection</h3>
                  <p className="mb-4 opacity-90">Sophisticated suits & accessories</p>
                  <Button variant="outline" className="btn-outline-gold bg-white/10 backdrop-blur-sm border-white text-white hover:bg-white hover:text-primary">
                    Shop Men's
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Link>
          </div>
        </section>

        {/* Featured Products */}
        <section className="py-16 bg-muted">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-end mb-12">
              <div>
                <h2 className="font-heading text-3xl md:text-4xl font-bold mb-4">Featured Products</h2>
                <p className="text-muted-foreground">Handpicked pieces for the discerning fashionista</p>
              </div>
              <Link to="/shop">
                <Button variant="ghost" className="hidden sm:flex hover:text-accent">
                  View All
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} {...product} />
              ))}
            </div>

            <div className="text-center mt-8 sm:hidden">
              <Link to="/shop">
                <Button variant="outline" className="btn-outline-gold">
                  View All Products
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* CTA Banner */}
        <section className="py-20 bg-gradient-to-r from-boutique-cream to-boutique-rose/30">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="font-heading text-3xl md:text-5xl font-bold mb-6">
              Join the JAANU Family
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
              Subscribe to our newsletter and get 10% off your first purchase. Stay updated with our latest collections and exclusive offers.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-6 py-3 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-accent"
              />
              <Button size="lg" className="btn-gold">
                Subscribe
              </Button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Index;
