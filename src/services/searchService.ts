/**
 * Advanced Search Service with Elastic-like Features
 * Following Single Responsibility Principle - only handles search operations
 * Following Open/Closed Principle - easily extensible for new search features
 */

import { Product } from "@/types/product";

// Hindi to English mapping for better search
const HINDI_TO_ENGLISH_MAP: Record<string, string[]> = {
  "साड़ी": ["saree", "sari"],
  "लेहंगा": ["lehenga", "lehenga choli"],
  "कुर्ता": ["kurta", "kurti"],
  "सलवार": ["salwar", "salwar suit"],
  "अनारकली": ["anarkali", "anarkali suit"],
  "शेरवानी": ["sherwani"],
  "दुपट्टा": ["dupatta", "stole"],
  "गाउन": ["gown", "dress"],
  "ज्वेलरी": ["jewelry", "jewellery"],
  "बैग": ["bag", "clutch"],
  "शादी": ["wedding", "bridal"],
  "त्योहार": ["festival", "celebration"],
  "पार्टी": ["party"],
  "ऑफिस": ["office", "formal"],
  "कैजुअल": ["casual"],
  "रेशम": ["silk"],
  "कॉटन": ["cotton"],
  "जॉर्जेट": ["georgette"],
  "चिफॉन": ["chiffon"],
  "लाल": ["red"],
  "नीला": ["blue"],
  "हरा": ["green"],
  "गुलाबी": ["pink"],
  "सफेद": ["white"],
  "काला": ["black"],
  "सोना": ["gold", "golden"],
  "चांदी": ["silver"]
};

// Search configuration
interface SearchConfig {
  fuzzyMatch: boolean;
  includeSynonyms: boolean;
  minScore: number;
  maxResults: number;
}

const DEFAULT_SEARCH_CONFIG: SearchConfig = {
  fuzzyMatch: true,
  includeSynonyms: true,
  minScore: 0.3,
  maxResults: 50
};

// Search result with relevance score
export interface SearchResult {
  product: Product;
  score: number;
  matchedFields: string[];
  highlights: string[];
}

// Search term processing
const processSearchTerm = (query: string): string[] => {
  const terms = query.toLowerCase().trim().split(/\s+/);
  const processedTerms: string[] = [];
  
  terms.forEach(term => {
    processedTerms.push(term);
    
    // Add Hindi synonyms
    if (HINDI_TO_ENGLISH_MAP[term]) {
      processedTerms.push(...HINDI_TO_ENGLISH_MAP[term]);
    }
    
    // Add English synonyms
    Object.entries(HINDI_TO_ENGLISH_MAP).forEach(([hindi, english]) => {
      if (english.includes(term)) {
        processedTerms.push(hindi);
        processedTerms.push(...english);
      }
    });
  });
  
  return [...new Set(processedTerms)];
};

// Calculate relevance score
const calculateScore = (
  product: Product, 
  searchTerms: string[], 
  matchedFields: string[]
): number => {
  let score = 0;
  const fieldWeights = {
    name: 10,
    category: 8,
    subcategory: 6,
    description: 4,
    fabric: 3,
    occasion: 3,
    colors: 2,
    sku: 1
  };
  
  matchedFields.forEach(field => {
    const weight = fieldWeights[field as keyof typeof fieldWeights] || 1;
    score += weight;
  });
  
  // Boost score for exact matches
  searchTerms.forEach(term => {
    if (product.name.toLowerCase().includes(term)) {
      score += 5;
    }
    if (product.category.toLowerCase().includes(term)) {
      score += 3;
    }
  });
  
  // Boost score for new items and high ratings
  if (product.isNew) score += 2;
  if (product.rating && product.rating >= 4.5) score += 2;
  if (product.discount && product.discount > 0) score += 1;
  
  return score;
};

// Generate search highlights
const generateHighlights = (product: Product, searchTerms: string[]): string[] => {
  const highlights: string[] = [];
  
  searchTerms.forEach(term => {
    if (product.name.toLowerCase().includes(term)) {
      highlights.push(`Name: ${product.name}`);
    }
    if (product.description?.toLowerCase().includes(term)) {
      highlights.push(`Description: ${product.description.substring(0, 100)}...`);
    }
    if (product.category.toLowerCase().includes(term)) {
      highlights.push(`Category: ${product.category}`);
    }
  });
  
  return highlights.slice(0, 3); // Limit to 3 highlights
};

// Fuzzy string matching (Levenshtein distance)
const fuzzyMatch = (str1: string, str2: string, threshold: number = 0.8): boolean => {
  const longer = str1.length > str2.length ? str1 : str2;
  const shorter = str1.length > str2.length ? str2 : str1;
  
  if (longer.length === 0) return true;
  
  const distance = levenshteinDistance(longer, shorter);
  const similarity = (longer.length - distance) / longer.length;
  
  return similarity >= threshold;
};

// Levenshtein distance calculation
const levenshteinDistance = (str1: string, str2: string): number => {
  const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null));
  
  for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
  for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;
  
  for (let j = 1; j <= str2.length; j++) {
    for (let i = 1; i <= str1.length; i++) {
      const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
      matrix[j][i] = Math.min(
        matrix[j][i - 1] + 1,
        matrix[j - 1][i] + 1,
        matrix[j - 1][i - 1] + indicator
      );
    }
  }
  
  return matrix[str2.length][str1.length];
};

// Main search function
export const searchProducts = (
  products: Product[], 
  query: string, 
  config: Partial<SearchConfig> = {}
): SearchResult[] => {
  const searchConfig = { ...DEFAULT_SEARCH_CONFIG, ...config };
  
  if (!query.trim()) {
    return products.map(product => ({
      product,
      score: 1,
      matchedFields: [],
      highlights: []
    }));
  }
  
  const searchTerms = processSearchTerm(query);
  const results: SearchResult[] = [];
  
  products.forEach(product => {
    const matchedFields: string[] = [];
    let hasMatch = false;
    
    // Check each search term against product fields
    searchTerms.forEach(term => {
      // Name matching
      if (product.name.toLowerCase().includes(term)) {
        matchedFields.push("name");
        hasMatch = true;
      }
      
      // Description matching
      if (product.description?.toLowerCase().includes(term)) {
        matchedFields.push("description");
        hasMatch = true;
      }
      
      // Category matching
      if (product.category.toLowerCase().includes(term)) {
        matchedFields.push("category");
        hasMatch = true;
      }
      
      // Subcategory matching
      if (product.subcategory.toLowerCase().includes(term)) {
        matchedFields.push("subcategory");
        hasMatch = true;
      }
      
      // Fabric matching
      if (product.fabric?.toLowerCase().includes(term)) {
        matchedFields.push("fabric");
        hasMatch = true;
      }
      
      // Occasion matching
      if (product.occasion?.some(occ => occ.toLowerCase().includes(term))) {
        matchedFields.push("occasion");
        hasMatch = true;
      }
      
      // Color matching
      if (product.colors?.some(color => color.toLowerCase().includes(term))) {
        matchedFields.push("colors");
        hasMatch = true;
      }
      
      // SKU matching
      if (product.sku?.toLowerCase().includes(term)) {
        matchedFields.push("sku");
        hasMatch = true;
      }
      
      // Fuzzy matching if enabled
      if (searchConfig.fuzzyMatch) {
        if (fuzzyMatch(product.name.toLowerCase(), term)) {
          matchedFields.push("name");
          hasMatch = true;
        }
        if (product.description && fuzzyMatch(product.description.toLowerCase(), term)) {
          matchedFields.push("description");
          hasMatch = true;
        }
      }
    });
    
    if (hasMatch) {
      const score = calculateScore(product, searchTerms, matchedFields);
      const highlights = generateHighlights(product, searchTerms);
      
      if (score >= searchConfig.minScore) {
        results.push({
          product,
          score,
          matchedFields: [...new Set(matchedFields)],
          highlights
        });
      }
    }
  });
  
  // Sort by relevance score and limit results
  return results
    .sort((a, b) => b.score - a.score)
    .slice(0, searchConfig.maxResults);
};

// Auto-complete suggestions
export const getSearchSuggestions = (products: Product[], query: string, limit: number = 5): string[] => {
  if (!query.trim()) return [];
  
  const suggestions = new Set<string>();
  const searchTerm = query.toLowerCase();
  
  products.forEach(product => {
    // Add product names that start with the query
    if (product.name.toLowerCase().startsWith(searchTerm)) {
      suggestions.add(product.name);
    }
    
    // Add categories that start with the query
    if (product.category.toLowerCase().startsWith(searchTerm)) {
      suggestions.add(product.category);
    }
    
    // Add subcategories that start with the query
    if (product.subcategory.toLowerCase().startsWith(searchTerm)) {
      suggestions.add(product.subcategory);
    }
    
    // Add fabrics that start with the query
    if (product.fabric?.toLowerCase().startsWith(searchTerm)) {
      suggestions.add(product.fabric);
    }
    
    // Add occasions that start with the query
    product.occasion?.forEach(occ => {
      if (occ.toLowerCase().startsWith(searchTerm)) {
        suggestions.add(occ);
      }
    });
    
    // Add colors that start with the query
    product.colors?.forEach(color => {
      if (color.toLowerCase().startsWith(searchTerm)) {
        suggestions.add(color);
      }
    });
  });
  
  return Array.from(suggestions).slice(0, limit);
};

// Popular search terms
export const getPopularSearches = (): string[] => {
  return [
    "saree",
    "lehenga",
    "kurta",
    "wedding",
    "festival",
    "party",
    "silk",
    "cotton",
    "red",
    "blue",
    "gold",
    "bridal",
    "anarkali",
    "sherwani",
    "jewelry"
  ];
};

// Search analytics (for future use)
export const trackSearch = (query: string, resultsCount: number): void => {
  // In a real app, this would send analytics data
  console.log(`Search: "${query}" returned ${resultsCount} results`);
};
