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
import saree1 from "@/assets/saree-1.jpg";
import saree2 from "@/assets/saree-2.jpg";
import lehenga1 from "@/assets/lehenga-1.jpg";
import anarkali1 from "@/assets/anarkali-1.jpg";
import kurti1 from "@/assets/kurti-1.jpg";
import mensKurta1 from "@/assets/mens-kurta-1.jpg";
import sherwani1 from "@/assets/sherwani-1.jpg";
import potliBag from "@/assets/potli-bag.jpg";
import jewelryEarrings from "@/assets/jewelry-earrings.jpg";
import dupatta1 from "@/assets/dupatta-1.jpg";
import kidsLehenga from "@/assets/kids-lehenga.jpg";
import indoWesternGown from "@/assets/indo-western-gown.jpg";

const Shop = () => {
  const [priceRange, setPriceRange] = useState([0, 10000]);

  const allProducts = [
    // Ethnic Wear - Sarees
    { id: 1, name: "Silk Saree with Zari Work", price: 4999, image: saree1, category: "Sarees", subcategory: "Ethnic Wear", isNew: true },
    { id: 2, name: "Banarasi Silk Saree", price: 6999, image: saree2, category: "Sarees", subcategory: "Ethnic Wear", discount: 15 },
    
    // Ethnic Wear - Lehengas
    { id: 3, name: "Bridal Lehenga Choli", price: 15999, image: lehenga1, category: "Lehengas", subcategory: "Bridal Wear", isNew: true },
    { id: 4, name: "Party Wear Lehenga", price: 8999, image: lehenga1, category: "Lehengas", subcategory: "Ethnic Wear" },
    
    // Ethnic Wear - Salwar Suits
    { id: 5, name: "Anarkali Suit Set", price: 3499, image: anarkali1, category: "Salwar Suits", subcategory: "Ethnic Wear", isNew: true },
    { id: 6, name: "Punjabi Suit with Dupatta", price: 2999, image: anarkali1, category: "Salwar Suits", subcategory: "Ethnic Wear", discount: 10 },
    
    // Ethnic Wear - Kurtis
    { id: 7, name: "Designer Kurti with Palazzo", price: 2499, image: kurti1, category: "Kurtis & Kurtas", subcategory: "Ethnic Wear" },
    { id: 8, name: "Embroidered Cotton Kurti", price: 1499, image: kurti1, category: "Kurtis & Kurtas", subcategory: "Ethnic Wear", discount: 20 },
    
    // Men's Wear
    { id: 9, name: "Men's Kurta Pajama Set", price: 2999, image: mensKurta1, category: "Men's Kurtas", subcategory: "Men's Ethnic Wear", isNew: true },
    { id: 10, name: "Wedding Sherwani", price: 12999, image: sherwani1, category: "Sherwanis", subcategory: "Men's Bridal Wear" },
    
    // Accessories
    { id: 11, name: "Embroidered Potli Bag", price: 799, image: potliBag, category: "Bags & Clutches", subcategory: "Accessories", isNew: true },
    { id: 12, name: "Kundan Jhumka Earrings", price: 1299, image: jewelryEarrings, category: "Jewelry", subcategory: "Accessories", discount: 25 },
    
    // Dupattas
    { id: 13, name: "Chiffon Dupatta with Embroidery", price: 899, image: dupatta1, category: "Dupattas & Stoles", subcategory: "Ethnic Wear" },
    { id: 14, name: "Banarasi Dupatta", price: 1499, image: dupatta1, category: "Dupattas & Stoles", subcategory: "Ethnic Wear", isNew: true },
    
    // Kids Wear
    { id: 15, name: "Girl's Lehenga Choli", price: 1999, image: kidsLehenga, category: "Kids Wear", subcategory: "Kids Ethnic Wear", isNew: true },
    { id: 16, name: "Girl's Festive Dress", price: 1499, image: kidsLehenga, category: "Kids Wear", subcategory: "Kids Ethnic Wear", discount: 15 },
    
    // Indo-Western
    { id: 17, name: "Indo-Western Gown", price: 5999, image: indoWesternGown, category: "Gowns", subcategory: "Indo-Western", isNew: true },
    { id: 18, name: "Fusion Party Gown", price: 4999, image: indoWesternGown, category: "Gowns", subcategory: "Indo-Western", discount: 10 },
  ];

  const categories = [
    "Sarees",
    "Lehengas", 
    "Salwar Suits",
    "Kurtis & Kurtas",
    "Gowns",
    "Dupattas & Stoles",
    "Men's Kurtas",
    "Sherwanis",
    "Kids Wear",
    "Jewelry",
    "Bags & Clutches"
  ];

  const subcategories = [
    "Ethnic Wear",
    "Bridal Wear",
    "Indo-Western",
    "Men's Ethnic Wear",
    "Men's Bridal Wear",
    "Kids Ethnic Wear",
    "Accessories"
  ];

  const FilterSidebar = () => (
    <div className="space-y-6">
      <div>
        <h3 className="font-heading text-lg font-semibold mb-4">Categories</h3>
        <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
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
        <h3 className="font-heading text-lg font-semibold mb-4">Collection</h3>
        <div className="space-y-3">
          {subcategories.map((subcategory) => (
            <div key={subcategory} className="flex items-center space-x-2">
              <Checkbox id={subcategory} />
              <label
                htmlFor={subcategory}
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                {subcategory}
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
          max={20000}
          step={500}
          className="mb-4"
        />
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>₹{priceRange[0]}</span>
          <span>₹{priceRange[1]}</span>
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
            <h1 className="font-heading text-4xl md:text-5xl font-bold mb-4">Shop All Collections</h1>
            <p className="text-muted-foreground">Discover our exquisite range of ethnic and fusion wear</p>
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
                  <SheetContent side="left" className="w-[300px] overflow-y-auto">
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

                {/* Pagination */}
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
