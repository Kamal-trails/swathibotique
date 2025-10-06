/**
 * Category Filter Component
 * Following Single Responsibility Principle - only handles category filtering
 * Following DRY Principle - reusable for both main categories and subcategories
 */

import { ProductCategory, ProductSubcategory } from "@/types/product";
import { FilterSection } from "./FilterSection";
import { FilterCheckbox } from "./FilterCheckbox";

interface CategoryFilterProps {
  title: string;
  selectedCategories: string[];
  onCategoryChange: (categories: string[]) => void;
  availableCategories: string[];
  className?: string;
  maxHeight?: string;
}

export const CategoryFilter = ({
  title,
  selectedCategories,
  onCategoryChange,
  availableCategories,
  className,
  maxHeight,
}: CategoryFilterProps) => {
  const handleCategoryToggle = (category: string, checked: boolean) => {
    if (checked) {
      onCategoryChange([...selectedCategories, category]);
    } else {
      onCategoryChange(selectedCategories.filter(c => c !== category));
    }
  };

  return (
    <FilterSection title={title} className={className} maxHeight={maxHeight}>
      {availableCategories.map((category) => (
        <FilterCheckbox
          key={category}
          id={`category-${category}`}
          label={category}
          checked={selectedCategories.includes(category)}
          onChange={(checked) => handleCategoryToggle(category, checked)}
        />
      ))}
    </FilterSection>
  );
};
