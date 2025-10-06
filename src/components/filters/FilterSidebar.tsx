/**
 * Comprehensive Filter Sidebar Component
 * Following Single Responsibility Principle - only handles filter UI
 * Following DRY Principle - uses reusable filter components
 */

import { ProductFilter, Occasion, ProductCategory, ProductSubcategory, Fabric } from "@/types/product";
import { FilterSection } from "./FilterSection";
import { CategoryFilter } from "./CategoryFilter";
import { OccasionFilter } from "./OccasionFilter";
import { PriceRangeFilter } from "./PriceRangeFilter";
import { FilterCheckbox } from "./FilterCheckbox";
import { Button } from "@/components/ui/button";
import { X, RotateCcw } from "lucide-react";
import { SizeGuide } from "../SizeGuide";

interface FilterSidebarProps {
  filters: ProductFilter;
  onFiltersChange: (filters: ProductFilter) => void;
  onClearFilters: () => void;
  availableCategories: ProductCategory[];
  availableSubcategories: ProductSubcategory[];
  availableOccasions: Occasion[];
  availableFabrics: Fabric[];
  availableSizes: string[];
  availableColors: string[];
  className?: string;
}

export const FilterSidebar = ({
  filters,
  onFiltersChange,
  onClearFilters,
  availableCategories,
  availableSubcategories,
  availableOccasions,
  availableFabrics,
  availableSizes,
  availableColors,
  className,
}: FilterSidebarProps) => {
  
  // Handle category filter change
  const handleCategoryChange = (categories: string[]) => {
    onFiltersChange({
      ...filters,
      categories: categories as ProductCategory[]
    });
  };

  // Handle subcategory filter change
  const handleSubcategoryChange = (subcategories: string[]) => {
    onFiltersChange({
      ...filters,
      subcategories: subcategories as ProductSubcategory[]
    });
  };

  // Handle occasion filter change
  const handleOccasionChange = (occasions: Occasion[]) => {
    onFiltersChange({
      ...filters,
      occasions
    });
  };

  // Handle fabric filter change
  const handleFabricChange = (fabrics: string[]) => {
    onFiltersChange({
      ...filters,
      fabrics: fabrics as Fabric[]
    });
  };

  // Handle size filter change
  const handleSizeChange = (sizes: string[]) => {
    onFiltersChange({
      ...filters,
      sizes
    });
  };

  // Handle color filter change
  const handleColorChange = (colors: string[]) => {
    onFiltersChange({
      ...filters,
      colors
    });
  };

  // Handle price range change
  const handlePriceRangeChange = (priceRange: [number, number]) => {
    onFiltersChange({
      ...filters,
      priceRange
    });
  };

  // Handle stock filter change
  const handleStockChange = (inStock: boolean | undefined) => {
    onFiltersChange({
      ...filters,
      inStock
    });
  };

  // Handle new items filter change
  const handleNewItemsChange = (isNew: boolean | undefined) => {
    onFiltersChange({
      ...filters,
      isNew
    });
  };

  // Handle discount filter change
  const handleDiscountChange = (hasDiscount: boolean | undefined) => {
    onFiltersChange({
      ...filters,
      hasDiscount
    });
  };

  // Check if any filters are active
  const hasActiveFilters = 
    filters.categories.length > 0 ||
    filters.subcategories.length > 0 ||
    filters.occasions.length > 0 ||
    filters.fabrics.length > 0 ||
    filters.sizes.length > 0 ||
    filters.colors.length > 0 ||
    filters.priceRange[0] > 0 ||
    filters.priceRange[1] < 20000 ||
    filters.inStock !== undefined ||
    filters.isNew !== undefined ||
    filters.hasDiscount !== undefined;

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header with Clear Filters */}
      <div className="flex items-center justify-between">
        <h2 className="font-heading text-xl font-bold">Filters</h2>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearFilters}
            className="text-muted-foreground hover:text-foreground"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Clear All
          </Button>
        )}
      </div>

      {/* Categories */}
      <CategoryFilter
        title="Categories"
        selectedCategories={filters.categories}
        onCategoryChange={handleCategoryChange}
        availableCategories={availableCategories}
        maxHeight="max-h-[200px]"
      />

      {/* Collections */}
      <CategoryFilter
        title="Collections"
        selectedCategories={filters.subcategories}
        onCategoryChange={handleSubcategoryChange}
        availableCategories={availableSubcategories}
        maxHeight="max-h-[150px]"
      />

      {/* Occasions */}
      <OccasionFilter
        selectedOccasions={filters.occasions}
        onOccasionChange={handleOccasionChange}
        availableOccasions={availableOccasions}
      />

      {/* Price Range */}
      <PriceRangeFilter
        value={filters.priceRange}
        onChange={handlePriceRangeChange}
        min={0}
        max={20000}
        step={500}
        currency="₹"
      />

      {/* Fabrics */}
      {availableFabrics.length > 0 && (
        <CategoryFilter
          title="Fabrics"
          selectedCategories={filters.fabrics}
          onCategoryChange={handleFabricChange}
          availableCategories={availableFabrics}
          maxHeight="max-h-[150px]"
        />
      )}

      {/* Sizes */}
      {availableSizes.length > 0 && (
        <FilterSection title="Sizes">
          <div className="flex flex-wrap gap-2">
            {availableSizes.map((size) => (
              <button
                key={size}
                onClick={() => {
                  const newSizes = filters.sizes.includes(size)
                    ? filters.sizes.filter(s => s !== size)
                    : [...filters.sizes, size];
                  handleSizeChange(newSizes);
                }}
                className={`px-3 py-1 text-sm rounded-full border transition-colors ${
                  filters.sizes.includes(size)
                    ? "bg-accent text-accent-foreground border-accent"
                    : "bg-background text-foreground border-border hover:border-accent"
                }`}
              >
                {size}
              </button>
            ))}
          </div>
          <div className="mt-2">
            <SizeGuide category="women" />
          </div>
        </FilterSection>
      )}

      {/* Colors */}
      {availableColors.length > 0 && (
        <FilterSection title="Colors">
          <div className="grid grid-cols-2 gap-2">
            {availableColors.map((color) => (
              <FilterCheckbox
                key={color}
                id={`color-${color}`}
                label={color}
                checked={filters.colors.includes(color)}
                onChange={(checked) => {
                  const newColors = checked
                    ? [...filters.colors, color]
                    : filters.colors.filter(c => c !== color);
                  handleColorChange(newColors);
                }}
              />
            ))}
          </div>
        </FilterSection>
      )}

      {/* Quick Filters */}
      <FilterSection title="Quick Filters">
        <div className="space-y-3">
          <FilterCheckbox
            id="in-stock"
            label="In Stock Only"
            checked={filters.inStock === true}
            onChange={(checked) => handleStockChange(checked ? true : undefined)}
          />
          <FilterCheckbox
            id="new-items"
            label="New Arrivals"
            checked={filters.isNew === true}
            onChange={(checked) => handleNewItemsChange(checked ? true : undefined)}
          />
          <FilterCheckbox
            id="on-sale"
            label="On Sale"
            checked={filters.hasDiscount === true}
            onChange={(checked) => handleDiscountChange(checked ? true : undefined)}
          />
        </div>
      </FilterSection>

      {/* Active Filters Summary */}
      {hasActiveFilters && (
        <div className="bg-muted p-4 rounded-lg">
          <h4 className="font-medium mb-2">Active Filters:</h4>
          <div className="flex flex-wrap gap-2">
            {filters.categories.map(category => (
              <span key={category} className="text-xs bg-accent text-accent-foreground px-2 py-1 rounded">
                {category}
              </span>
            ))}
            {filters.occasions.map(occasion => (
              <span key={occasion} className="text-xs bg-accent text-accent-foreground px-2 py-1 rounded">
                {occasion}
              </span>
            ))}
            {filters.priceRange[0] > 0 && (
              <span className="text-xs bg-accent text-accent-foreground px-2 py-1 rounded">
                Min ₹{filters.priceRange[0]}
              </span>
            )}
            {filters.priceRange[1] < 20000 && (
              <span className="text-xs bg-accent text-accent-foreground px-2 py-1 rounded">
                Max ₹{filters.priceRange[1]}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
