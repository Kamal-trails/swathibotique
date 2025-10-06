/**
 * Advanced Search Bar Component
 * Following Single Responsibility Principle - only handles search input and suggestions
 * Following Clean Code principles - clear, maintainable implementation
 */

import { useState, useRef, useEffect } from "react";
import { Search, X, Clock, TrendingUp } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SearchBarProps {
  query: string;
  onQueryChange: (query: string) => void;
  onSearch: (query: string) => void;
  suggestions: string[];
  popularSearches: string[];
  isSearching?: boolean;
  placeholder?: string;
  className?: string;
  showSuggestions?: boolean;
}

export const SearchBar = ({
  query,
  onQueryChange,
  onSearch,
  suggestions,
  popularSearches,
  isSearching = false,
  placeholder = "Search sarees, lehengas, kurtas...",
  className,
  showSuggestions = true,
}: SearchBarProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Handle input change
  const handleInputChange = (value: string) => {
    onQueryChange(value);
    setIsOpen(value.length > 0);
    setSelectedIndex(-1);
  };

  // Handle search
  const handleSearch = (searchQuery: string = query) => {
    if (searchQuery.trim()) {
      onSearch(searchQuery);
      setIsOpen(false);
      inputRef.current?.blur();
    }
  };

  // Handle key navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return;

    const totalItems = suggestions.length + popularSearches.length;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % totalItems);
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 + totalItems) % totalItems);
        break;
      case "Enter":
        e.preventDefault();
        if (selectedIndex >= 0) {
          const selectedItem = selectedIndex < suggestions.length 
            ? suggestions[selectedIndex]
            : popularSearches[selectedIndex - suggestions.length];
          handleSearch(selectedItem);
        } else {
          handleSearch();
        }
        break;
      case "Escape":
        setIsOpen(false);
        setSelectedIndex(-1);
        inputRef.current?.blur();
        break;
    }
  };

  // Handle suggestion click
  const handleSuggestionClick = (suggestion: string) => {
    onQueryChange(suggestion);
    handleSearch(suggestion);
  };

  // Handle popular search click
  const handlePopularClick = (popular: string) => {
    onQueryChange(popular);
    handleSearch(popular);
  };

  // Clear search
  const handleClear = () => {
    onQueryChange("");
    setIsOpen(false);
    setSelectedIndex(-1);
    inputRef.current?.focus();
  };

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className={cn("relative w-full", className)}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={(e) => handleInputChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsOpen(query.length > 0)}
          className="pl-10 pr-10"
        />
        {query && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8"
            onClick={handleClear}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
        {isSearching && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-accent border-t-transparent" />
          </div>
        )}
      </div>

      {/* Search Suggestions Dropdown */}
      {isOpen && showSuggestions && (
        <div
          ref={suggestionsRef}
          className="absolute top-full left-0 right-0 mt-1 bg-background border border-border rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto"
        >
          {/* Search Suggestions */}
          {suggestions.length > 0 && (
            <div className="p-2">
              <div className="flex items-center gap-2 px-2 py-1 text-xs font-medium text-muted-foreground">
                <Search className="h-3 w-3" />
                Suggestions
              </div>
              {suggestions.map((suggestion, index) => (
                <button
                  key={suggestion}
                  className={cn(
                    "w-full text-left px-2 py-2 rounded hover:bg-muted transition-colors",
                    selectedIndex === index && "bg-muted"
                  )}
                  onClick={() => handleSuggestionClick(suggestion)}
                >
                  <div className="flex items-center gap-2">
                    <Search className="h-3 w-3 text-muted-foreground" />
                    <span className="text-sm">{suggestion}</span>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Popular Searches */}
          {suggestions.length === 0 && popularSearches.length > 0 && (
            <div className="p-2">
              <div className="flex items-center gap-2 px-2 py-1 text-xs font-medium text-muted-foreground">
                <TrendingUp className="h-3 w-3" />
                Popular Searches
              </div>
              {popularSearches.map((popular, index) => (
                <button
                  key={popular}
                  className={cn(
                    "w-full text-left px-2 py-2 rounded hover:bg-muted transition-colors",
                    selectedIndex === suggestions.length + index && "bg-muted"
                  )}
                  onClick={() => handlePopularClick(popular)}
                >
                  <div className="flex items-center gap-2">
                    <Clock className="h-3 w-3 text-muted-foreground" />
                    <span className="text-sm">{popular}</span>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* No Results */}
          {suggestions.length === 0 && popularSearches.length === 0 && query.length > 0 && (
            <div className="p-4 text-center text-muted-foreground">
              <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No suggestions found</p>
              <p className="text-xs">Try searching for "saree", "lehenga", or "kurta"</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
