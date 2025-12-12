import { Link } from "react-router-dom";
import { ArrowRight, Truck, Shield, Clock, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { SearchBar } from "@/components/SearchBar";
import { useSearch } from "@/hooks/useSearch";

// Import images properly for Vite production builds
import heroBanner from "@/assets/hero-banner.jpg";
import categoryEthnic from "@/assets/category-ethnic.jpg";
import categoryBridal from "@/assets/category-bridal.jpg";
import categoryMens from "@/assets/category-mens.jpg";
import categoryAccessories from "@/assets/category-accessories.jpg";
import saree1 from "@/assets/saree-1.jpg";
import lehenga1 from "@/assets/lehenga-1.jpg";
import anarkali1 from "@/assets/anarkali-1.jpg";
import kurti1 from "@/assets/kurti-1.jpg";
import mensKurta1 from "@/assets/mens-kurta-1.jpg";
import sherwani1 from "@/assets/sherwani-1.jpg";
import potliBag from "@/assets/potli-bag.jpg";
import jewelryEarrings from "@/assets/jewelry-earrings.jpg";

const Index = () => {
  const { 
    query, 
    setQuery, 
    filteredProducts, 
    suggestions, 
    performSearch, 
    clearSearch,
    isSearching 
  } = useSearch();

  const popularSearches = ["Saree", "Lehenga", "Kurta", "Wedding", "Bridal"];

  const featuredProducts = [
    { id: 1, name: "Silk Saree with Zari Work", price: 4999, image: saree1, category: "Sarees" as const, subcategory: "Ethnic Wear" as const, isNew: true },
    { id: 2, name: "Bridal Lehenga Choli", price: 15999, image: lehenga1, category: "Lehengas" as const, subcategory: "Bridal Wear" as const, discount: 20 },
    { id: 3, name: "Anarkali Suit Set", price: 3499, image: anarkali1, category: "Salwar Suits" as const, subcategory: "Ethnic Wear" as const, isNew: true },
    { id: 4, name: "Designer Kurti with Palazzo", price: 2499, image: kurti1, category: "Kurtis & Kurtas" as const, subcategory: "Ethnic Wear" as const },
    { id: 5, name: "Men's Kurta Pajama Set", price: 2999, image: mensKurta1, category: "Men's Kurtas" as const, subcategory: "Men's Ethnic Wear" as const, isNew: true },
    { id: 6, name: "Wedding Sherwani", price: 12999, image: sherwani1, category: "Sherwanis" as const, subcategory: "Men's Bridal Wear" as const },
    { id: 7, name: "Embroidered Potli Bag", price: 799, image: potliBag, category: "Bags & Clutches" as const, subcategory: "Accessories" as const, isNew: true },
    { id: 8, name: "Kundan Jhumka Earrings", price: 1299, image: jewelryEarrings, category: "Jewelry" as const, subcategory: "Accessories" as const, discount: 25 },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      
      <main className="flex-1">
        {/* Search Results Section - Shows when searching */}
        {query && (
          <section className="py-8 bg-background">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="font-heading text-2xl md:text-3xl font-bold mb-2">
                    Search Results for "{query}"
                  </h2>
                  <p className="text-muted-foreground">
                    Found {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'}
                  </p>
                </div>
                <Button
                  variant="outline"
                  onClick={clearSearch}
                  className="gap-2"
                >
                  <X className="h-4 w-4" />
                  Clear Search
                </Button>
              </div>

              {isSearching ? (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
                </div>
              ) : filteredProducts.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {filteredProducts.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-muted-foreground mb-4">
                    No products found matching "{query}"
                  </p>
                  <Button onClick={clearSearch} variant="outline">
                    Clear Search
                  </Button>
                </div>
              )}
            </div>
          </section>
        )}

        {/* Hero Section - Hidden when searching */}
        {!query && (
          <>
        <section className="relative h-[600px] md:h-[700px] overflow-hidden">
          <div className="absolute inset-0">
            <img
              src={heroBanner}
              alt="Swathi Botique Fashion"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-primary/60 to-transparent" />
          </div>
          
          <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center">
            <div className="max-w-2xl animate-fade-in-up">
              <h1 className="font-heading text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
                Timeless Elegance,<br />Ethnic Artistry
              </h1>
              <p className="text-lg md:text-xl text-white/90 mb-8 max-w-lg">
                Discover our curated collection of exquisite sarees, lehengas, and ethnic wear that celebrates Indian fashion and craftsmanship.
              </p>
              
              {/* Search Bar in Hero */}
              <div className="mb-8 max-w-xl">
                <SearchBar
                  query={query}
                  onQueryChange={setQuery}
                  onSearch={performSearch}
                  suggestions={suggestions}
                  popularSearches={popularSearches}
                  isSearching={isSearching}
                  placeholder="Search sarees, lehengas, kurtas..."
                  className="bg-white/95 backdrop-blur-sm rounded-lg"
                />
              </div>

              <div className="flex flex-wrap gap-4">
                <Link to="/shop">
                  <Button size="lg" className="btn-gold text-base">
                    Shop Collection
                    <ArrowRight className="ml-2 h-5 w-5" />
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
              Explore our exquisite range of Indian ethnic and fusion wear
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Link to="/shop?category=ethnic" className="group relative overflow-hidden rounded-lg h-[350px] hover-lift">
              <img
                src={categoryEthnic}
                alt="Ethnic Wear Collection"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary/80 to-transparent flex items-end p-6">
                <div className="text-white">
                  <h3 className="font-heading text-2xl font-bold mb-2">Ethnic Wear</h3>
                  <p className="mb-3 opacity-90 text-sm">Sarees, Lehengas & Suits</p>
                  <Button variant="outline" size="sm" className="btn-outline-gold bg-white/10 backdrop-blur-sm border-white text-white hover:bg-white hover:text-primary">
                    Explore
                    <ArrowRight className="ml-2 h-3 w-3" />
                  </Button>
                </div>
              </div>
            </Link>

            <Link to="/shop?category=bridal" className="group relative overflow-hidden rounded-lg h-[350px] hover-lift">
              <img
                src={categoryBridal}
                alt="Bridal Wear Collection"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary/80 to-transparent flex items-end p-6">
                <div className="text-white">
                  <h3 className="font-heading text-2xl font-bold mb-2">Bridal Wear</h3>
                  <p className="mb-3 opacity-90 text-sm">Wedding Lehengas & Sarees</p>
                  <Button variant="outline" size="sm" className="btn-outline-gold bg-white/10 backdrop-blur-sm border-white text-white hover:bg-white hover:text-primary">
                    Explore
                    <ArrowRight className="ml-2 h-3 w-3" />
                  </Button>
                </div>
              </div>
            </Link>

            <Link to="/shop?category=mens" className="group relative overflow-hidden rounded-lg h-[350px] hover-lift">
              <img
                src={categoryMens}
                alt="Men's Ethnic Collection"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary/80 to-transparent flex items-end p-6">
                <div className="text-white">
                  <h3 className="font-heading text-2xl font-bold mb-2">Men's Ethnic</h3>
                  <p className="mb-3 opacity-90 text-sm">Kurtas & Sherwanis</p>
                  <Button variant="outline" size="sm" className="btn-outline-gold bg-white/10 backdrop-blur-sm border-white text-white hover:bg-white hover:text-primary">
                    Explore
                    <ArrowRight className="ml-2 h-3 w-3" />
                  </Button>
                </div>
              </div>
            </Link>

            <Link to="/shop?category=accessories" className="group relative overflow-hidden rounded-lg h-[350px] hover-lift">
              <img
                src={categoryAccessories}
                alt="Accessories Collection"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary/80 to-transparent flex items-end p-6">
                <div className="text-white">
                  <h3 className="font-heading text-2xl font-bold mb-2">Accessories</h3>
                  <p className="mb-3 opacity-90 text-sm">Jewelry, Bags & More</p>
                  <Button variant="outline" size="sm" className="btn-outline-gold bg-white/10 backdrop-blur-sm border-white text-white hover:bg-white hover:text-primary">
                    Explore
                    <ArrowRight className="ml-2 h-3 w-3" />
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
                <h2 className="font-heading text-3xl md:text-4xl font-bold mb-4">Featured Collections</h2>
                <p className="text-muted-foreground">Handpicked ethnic wear for the discerning fashionista</p>
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
                <ProductCard key={product.id} product={product} />
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

        {/* Special Collections Highlight */}
        <section className="py-16 bg-background container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-heading text-3xl md:text-4xl font-bold mb-4">Special Collections</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Curated selections for every occasion and celebration
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-muted rounded-lg p-8 text-center hover-lift">
              <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">💍</span>
              </div>
              <h3 className="font-heading text-xl font-bold mb-2">Bridal Collection</h3>
              <p className="text-muted-foreground text-sm mb-4">
                Exquisite bridal lehengas, sarees, and wedding ensembles with intricate embroidery
              </p>
              <Link to="/shop?category=bridal">
                <Button variant="ghost" size="sm" className="text-accent hover:text-accent">
                  View Collection
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>

            <div className="bg-muted rounded-lg p-8 text-center hover-lift">
              <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🧵</span>
              </div>
              <h3 className="font-heading text-xl font-bold mb-2">Handloom Treasures</h3>
              <p className="text-muted-foreground text-sm mb-4">
                Authentic handwoven sarees and fabrics celebrating traditional Indian craftsmanship
              </p>
              <Link to="/shop?category=handloom">
                <Button variant="ghost" size="sm" className="text-accent hover:text-accent">
                  View Collection
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>

            <div className="bg-muted rounded-lg p-8 text-center hover-lift">
              <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">✨</span>
              </div>
              <h3 className="font-heading text-xl font-bold mb-2">Festive Wear</h3>
              <p className="text-muted-foreground text-sm mb-4">
                Designer pieces perfect for Diwali, weddings, and special celebrations
              </p>
              <Link to="/shop?category=festive">
                <Button variant="ghost" size="sm" className="text-accent hover:text-accent">
                  View Collection
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
              Join the Swathi Family
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
              Subscribe to our newsletter and get 10% off your first purchase. Stay updated with latest ethnic wear collections, festive offers, and styling tips.
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
        </>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Index;
