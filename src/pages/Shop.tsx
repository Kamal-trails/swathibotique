import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import Pagination from "@/components/Pagination";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SlidersHorizontal } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { FilterSidebar } from "@/components/filters/FilterSidebar";
import { SearchBar } from "@/components/SearchBar";
import { useSearch } from "@/hooks/useSearch";
import { usePagination } from "@/hooks/usePagination";
import { getFilterOptions, SORT_OPTIONS, getAllProducts } from "@/services/productService";
import { getPopularSearches } from "@/services/searchService";
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
  const [searchParams, setSearchParams] = useSearchParams();
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  
  // Get all products from expanded catalog
  const allProducts = getAllProducts();
  
  // Use search hook for global state management
  const {
    query,
    setQuery,
    performSearch,
    filteredProducts,
    filters,
    setFilters,
    clearFilters,
    sortBy,
    setSortBy,
    suggestions,
    isSearching
  } = useSearch();
  
  // Use pagination hook
  const {
    currentPage,
    totalPages,
    paginatedItems,
    totalItems,
    goToPage,
    nextPage,
    prevPage,
    canGoNext,
    canGoPrev,
    startIndex,
    endIndex,
  } = usePagination({
    items: filteredProducts,
    itemsPerPage: 12,
  });
  
  const popularSearches = getPopularSearches();
  const filterOptions = getFilterOptions(allProducts);

  // Handle URL search params
  useEffect(() => {
    const searchQuery = searchParams.get('search');
    const category = searchParams.get('category');
    
    if (searchQuery) {
      setQuery(searchQuery);
      performSearch(searchQuery);
    }
    
    if (category) {
      setFilters({
        ...filters,
        categories: [category as any]
      });
    }
  }, [searchParams]);

  // Handle search with URL updates
  const handleSearch = (searchQuery: string) => {
    performSearch(searchQuery);
    const newParams = new URLSearchParams(searchParams);
    if (searchQuery) {
      newParams.set('search', searchQuery);
    } else {
      newParams.delete('search');
    }
    setSearchParams(newParams);
  };

  // Handle filter changes with URL updates
  const handleFiltersChange = (newFilters: any) => {
    setFilters(newFilters);
    const newParams = new URLSearchParams(searchParams);
    
    // Update URL with active filters
    if (newFilters.categories.length > 0) {
      newParams.set('category', newFilters.categories[0]);
    } else {
      newParams.delete('category');
    }
    
    setSearchParams(newParams);
  };

  // Get current search query from URL
  const currentSearchQuery = searchParams.get('search') || '';

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />

      <main className="flex-1">
        {/* Page Header */}
        <section className="bg-muted py-12">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="font-heading text-4xl md:text-5xl font-bold mb-4">
              {currentSearchQuery ? `Search Results for "${currentSearchQuery}"` : "Shop All Collections"}
            </h1>
            <p className="text-muted-foreground">
              {currentSearchQuery 
                ? `Found ${totalItems} products matching your search`
                : `Discover our exquisite range of ${totalItems} ethnic and fusion wear items`
              }
            </p>
            
            {/* Search Bar for Shop Page */}
            <div className="mt-6 max-w-md">
              <SearchBar
                query={query}
                onQueryChange={setQuery}
                onSearch={handleSearch}
                suggestions={suggestions}
                popularSearches={popularSearches}
                isSearching={isSearching}
                placeholder="Search sarees, lehengas, kurtas..."
              />
            </div>
          </div>
        </section>

        {/* Shop Content */}
        <section className="py-12">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
              <p className="text-muted-foreground">
                Showing <span className="font-semibold text-foreground">{startIndex}-{endIndex}</span> of <span className="font-semibold text-foreground">{totalItems}</span> products
                {currentSearchQuery && (
                  <span className="ml-2 text-sm">
                    for "<span className="font-medium">{currentSearchQuery}</span>"
                  </span>
                )}
              </p>

              <div className="flex gap-4 w-full sm:w-auto">
                {/* Mobile Filter */}
                <Sheet open={showMobileFilters} onOpenChange={setShowMobileFilters}>
                  <SheetTrigger asChild>
                    <Button variant="outline" className="flex-1 sm:hidden">
                      <SlidersHorizontal className="mr-2 h-4 w-4" />
                      Filters
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-[300px] overflow-y-auto">
                    <FilterSidebar
                      filters={filters}
                      onFiltersChange={handleFiltersChange}
                      onClearFilters={clearFilters}
                      availableCategories={filterOptions.categories}
                      availableSubcategories={filterOptions.subcategories}
                      availableOccasions={filterOptions.occasions}
                      availableFabrics={filterOptions.fabrics}
                      availableSizes={filterOptions.sizes}
                      availableColors={filterOptions.colors}
                    />
                  </SheetContent>
                </Sheet>

                {/* Sort */}
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    {SORT_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Products Grid with Sidebar */}
            <div className="flex gap-8">
              {/* Desktop Filter Sidebar */}
              <aside className="hidden lg:block w-64 shrink-0">
                <div className="sticky top-24">
                  <FilterSidebar
                    filters={filters}
                    onFiltersChange={handleFiltersChange}
                    onClearFilters={clearFilters}
                    availableCategories={filterOptions.categories}
                    availableSubcategories={filterOptions.subcategories}
                    availableOccasions={filterOptions.occasions}
                    availableFabrics={filterOptions.fabrics}
                    availableSizes={filterOptions.sizes}
                    availableColors={filterOptions.colors}
                  />
                </div>
              </aside>

              {/* Products Grid */}
              <div className="flex-1">
                {paginatedItems.length > 0 ? (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      {paginatedItems.map((product) => (
                        <ProductCard key={product.id} product={product} />
                      ))}
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                      <div className="mt-12">
                        <Pagination
                          currentPage={currentPage}
                          totalPages={totalPages}
                          onPageChange={goToPage}
                          onNext={nextPage}
                          onPrev={prevPage}
                          canGoNext={canGoNext}
                          canGoPrev={canGoPrev}
                        />
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">🔍</div>
                    <h3 className="font-heading text-2xl font-bold mb-2">No products found</h3>
                    <p className="text-muted-foreground mb-6">
                      {currentSearchQuery 
                        ? `No products match your search for "${currentSearchQuery}"`
                        : "No products match your current filters"
                      }
                    </p>
                    <div className="flex gap-4 justify-center">
                      {currentSearchQuery && (
                        <Button onClick={() => handleSearch("")} variant="outline">
                          Clear Search
                        </Button>
                      )}
                      <Button onClick={clearFilters} variant="outline">
                        Clear Filters
                      </Button>
                    </div>
                  </div>
                )}
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
