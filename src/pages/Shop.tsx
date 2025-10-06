import { useState } from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SlidersHorizontal, X } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import product1 from "@/assets/product-1.jpg";
import product2 from "@/assets/product-2.jpg";
import product3 from "@/assets/product-3.jpg";
import product4 from "@/assets/product-4.jpg";

const Shop = () => {
  const [priceRange, setPriceRange] = useState([0, 500]);

  const allProducts = [
    { id: 1, name: "Elegant Cream Dress", price: 189.99, image: product1, category: "Women's Wear", isNew: true },
    { id: 2, name: "Blush Pink Blazer", price: 249.99, image: product2, category: "Women's Wear", discount: 20 },
    { id: 3, name: "Gold Accessories Set", price: 129.99, image: product3, category: "Accessories", isNew: true },
    { id: 4, name: "Charcoal Formal Suit", price: 399.99, image: product4, category: "Men's Wear" },
    { id: 5, name: "Summer Floral Dress", price: 159.99, image: product1, category: "Women's Wear" },
    { id: 6, name: "Classic Navy Blazer", price: 229.99, image: product2, category: "Women's Wear", discount: 15 },
    { id: 7, name: "Designer Handbag", price: 299.99, image: product3, category: "Accessories", isNew: true },
    { id: 8, name: "Premium Leather Shoes", price: 179.99, image: product4, category: "Accessories" },
  ];

  const categories = ["Women's Wear", "Men's Wear", "Accessories"];
  const sizes = ["XS", "S", "M", "L", "XL"];

  const FilterSidebar = () => (
    <div className="space-y-6">
      <div>
        <h3 className="font-heading text-lg font-semibold mb-4">Categories</h3>
        <div className="space-y-3">
          {categories.map((category) => (
            <div key={category} className="flex items-center space-x-2">
              <Checkbox id={category} />
              <label
                htmlFor={category}
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                {category}
              </label>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="font-heading text-lg font-semibold mb-4">Price Range</h3>
        <Slider
          value={priceRange}
          onValueChange={setPriceRange}
          max={500}
          step={10}
          className="mb-4"
        />
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>${priceRange[0]}</span>
          <span>${priceRange[1]}</span>
        </div>
      </div>

      <div>
        <h3 className="font-heading text-lg font-semibold mb-4">Size</h3>
        <div className="flex flex-wrap gap-2">
          {sizes.map((size) => (
            <Button
              key={size}
              variant="outline"
              size="sm"
              className="w-12 h-12 hover:border-accent hover:text-accent"
            >
              {size}
            </Button>
          ))}
        </div>
      </div>

      <Button variant="outline" className="w-full">
        <X className="mr-2 h-4 w-4" />
        Clear Filters
      </Button>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />

      <main className="flex-1">
        {/* Page Header */}
        <section className="bg-muted py-12">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="font-heading text-4xl md:text-5xl font-bold mb-4">Shop All</h1>
            <p className="text-muted-foreground">Discover our complete collection of curated fashion</p>
          </div>
        </section>

        {/* Shop Content */}
        <section className="py-12">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
              <p className="text-muted-foreground">
                Showing <span className="font-semibold text-foreground">{allProducts.length}</span> products
              </p>

              <div className="flex gap-4 w-full sm:w-auto">
                {/* Mobile Filter */}
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="outline" className="flex-1 sm:hidden">
                      <SlidersHorizontal className="mr-2 h-4 w-4" />
                      Filters
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-[300px]">
                    <h2 className="font-heading text-xl font-bold mb-6">Filters</h2>
                    <FilterSidebar />
                  </SheetContent>
                </Sheet>

                {/* Sort */}
                <Select defaultValue="featured">
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="featured">Featured</SelectItem>
                    <SelectItem value="price-low">Price: Low to High</SelectItem>
                    <SelectItem value="price-high">Price: High to Low</SelectItem>
                    <SelectItem value="newest">Newest</SelectItem>
                    <SelectItem value="popular">Most Popular</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Products Grid with Sidebar */}
            <div className="flex gap-8">
              {/* Desktop Filter Sidebar */}
              <aside className="hidden lg:block w-64 shrink-0">
                <div className="sticky top-24">
                  <FilterSidebar />
                </div>
              </aside>

              {/* Products Grid */}
              <div className="flex-1">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {allProducts.map((product) => (
                    <ProductCard key={product.id} {...product} />
                  ))}
                </div>

                {/* Pagination would go here */}
                <div className="mt-12 flex justify-center">
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">Previous</Button>
                    <Button size="sm" className="btn-gold">1</Button>
                    <Button variant="outline" size="sm">2</Button>
                    <Button variant="outline" size="sm">3</Button>
                    <Button variant="outline" size="sm">Next</Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Shop;
