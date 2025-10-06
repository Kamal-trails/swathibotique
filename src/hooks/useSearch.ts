/**
 * Global Search Hook
 * Following Single Responsibility Principle - only handles search state
 * Following DRY Principle - reusable across all components
 */

import { useState, useCallback, useMemo } from "react";
import { Product, ProductFilter } from "@/types/product";
import { SearchResult, searchProducts, getSearchSuggestions } from "@/services/searchService";
import { PRODUCTS, filterProducts, SORT_OPTIONS } from "@/services/productService";

interface UseSearchReturn {
  // Search state
  query: string;
  setQuery: (query: string) => void;
  isSearching: boolean;
  
  // Search results
  searchResults: SearchResult[];
  filteredProducts: Product[];
  suggestions: string[];
  
  // Filter state
  filters: ProductFilter;
  setFilters: (filters: ProductFilter) => void;
  clearFilters: () => void;
  
  // Sort state
  sortBy: string;
  setSortBy: (sort: string) => void;
  
  // Actions
  performSearch: (query: string) => void;
  clearSearch: () => void;
  applyFilters: () => void;
}

const DEFAULT_FILTERS: ProductFilter = {
  categories: [],
  subcategories: [],
  occasions: [],
  fabrics: [],
  priceRange: [0, 20000],
  sizes: [],
  colors: [],
  inStock: undefined,
  isNew: undefined,
  hasDiscount: undefined,
};

export const useSearch = (): UseSearchReturn => {
  const [query, setQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [filters, setFilters] = useState<ProductFilter>(DEFAULT_FILTERS);
  const [sortBy, setSortBy] = useState("featured");

  // Perform search with debouncing
  const performSearch = useCallback((searchQuery: string) => {
    setIsSearching(true);
    setQuery(searchQuery);
    
    // Simulate search delay for better UX
    setTimeout(() => {
      setIsSearching(false);
    }, 300);
  }, []);

  // Clear search
  const clearSearch = useCallback(() => {
    setQuery("");
    setIsSearching(false);
  }, []);

  // Clear all filters
  const clearFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
  }, []);

  // Apply filters
  const applyFilters = useCallback(() => {
    // This will trigger the useMemo below
  }, []);

  // Get search suggestions
  const suggestions = useMemo(() => {
    if (query.length < 2) return [];
    return getSearchSuggestions(PRODUCTS, query, 5);
  }, [query]);

  // Perform search and get results
  const searchResults = useMemo(() => {
    if (!query.trim()) {
      return PRODUCTS.map(product => ({
        product,
        score: 1,
        matchedFields: [],
        highlights: []
      }));
    }
    
    return searchProducts(PRODUCTS, query);
  }, [query]);

  // Apply filters to search results
  const filteredProducts = useMemo(() => {
    const products = searchResults.map(result => result.product);
    const filtered = filterProducts(products, filters);
    
    // Apply sorting
    const sortOption = SORT_OPTIONS.find(option => option.value === sortBy);
    if (sortOption) {
      return sortOption.sortFn(filtered);
    }
    
    return filtered;
  }, [searchResults, filters, sortBy]);

  return {
    // Search state
    query,
    setQuery,
    isSearching,
    
    // Search results
    searchResults,
    filteredProducts,
    suggestions,
    
    // Filter state
    filters,
    setFilters,
    clearFilters,
    
    // Sort state
    sortBy,
    setSortBy,
    
    // Actions
    performSearch,
    clearSearch,
    applyFilters,
  };
};
