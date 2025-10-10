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

// Calculate relevance score with advanced elastic search-like scoring
const calculateScore = (
  product: Product, 
  searchTerms: string[], 
  matchedFields: string[]
): number => {
  let score = 0;
  
  // Field weights (higher = more important)
  const fieldWeights = {
    name: 20,           // Product name is most important
    category: 15,       // Category is very important
    subcategory: 12,    // Subcategory is important
    description: 8,     // Description is moderately important
    fabric: 6,          // Fabric is somewhat important
    occasion: 5,        // Occasion is somewhat important
    colors: 3,          // Colors are less important
    sku: 2             // SKU is least important
  };
  
  // Calculate base score from matched fields
  matchedFields.forEach(field => {
    const weight = fieldWeights[field as keyof typeof fieldWeights] || 1;
    score += weight;
  });
  
  // Advanced scoring based on match quality
  searchTerms.forEach(term => {
    const termLower = term.toLowerCase();
    
    // Exact match in name (highest priority)
    if (product.name.toLowerCase() === termLower) {
      score += 50; // Very high boost for exact name match
    } else if (product.name.toLowerCase().startsWith(termLower)) {
      score += 30; // High boost for name starting with term
    } else if (product.name.toLowerCase().includes(termLower)) {
      score += 20; // Good boost for name containing term
    }
    
    // Exact match in category
    if (product.category.toLowerCase() === termLower) {
      score += 25; // High boost for exact category match
    } else if (product.category.toLowerCase().includes(termLower)) {
      score += 15; // Good boost for category containing term
    }
    
    // Exact match in subcategory
    if (product.subcategory.toLowerCase() === termLower) {
      score += 20; // Good boost for exact subcategory match
    } else if (product.subcategory.toLowerCase().includes(termLower)) {
      score += 10; // Moderate boost for subcategory containing term
    }
    
    // Word boundary matches (more precise)
    const nameWords = product.name.toLowerCase().split(/\s+/);
    if (nameWords.some(word => word.startsWith(termLower))) {
      score += 15; // Boost for word boundary match in name
    }
    
    // Description matches
    if (product.description?.toLowerCase().includes(termLower)) {
      score += 8; // Moderate boost for description match
    }
    
    // Fabric matches
    if (product.fabric?.toLowerCase() === termLower) {
      score += 12; // Good boost for exact fabric match
    } else if (product.fabric?.toLowerCase().includes(termLower)) {
      score += 6; // Moderate boost for fabric containing term
    }
    
    // Occasion matches
    if (product.occasion?.some(occ => occ.toLowerCase() === termLower)) {
      score += 10; // Good boost for exact occasion match
    } else if (product.occasion?.some(occ => occ.toLowerCase().includes(termLower))) {
      score += 5; // Moderate boost for occasion containing term
    }
    
    // Color matches
    if (product.colors?.some(color => color.toLowerCase() === termLower)) {
      score += 8; // Good boost for exact color match
    } else if (product.colors?.some(color => color.toLowerCase().includes(termLower))) {
      score += 4; // Moderate boost for color containing term
    }
  });
  
  // Boost factors for product quality and popularity
  if (product.isNew) score += 5; // New items get a boost
  if (product.rating && product.rating >= 4.5) score += 8; // High-rated items get boost
  if (product.rating && product.rating >= 4.0) score += 4; // Good-rated items get smaller boost
  if (product.discount && product.discount > 0) score += 3; // Discounted items get boost
  if (product.reviews && product.reviews > 100) score += 2; // Popular items get boost
  if (product.inStock) score += 2; // In-stock items get boost
  
  // Penalize out-of-stock items
  if (!product.inStock) score *= 0.5;
  
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

// Advanced fuzzy string matching with multiple algorithms
const fuzzyMatch = (str1: string, str2: string, threshold: number = 0.7): boolean => {
  const s1 = str1.toLowerCase().trim();
  const s2 = str2.toLowerCase().trim();
  
  if (s1 === s2) return true; // Exact match
  
  // Check for substring matches first (faster)
  if (s1.includes(s2) || s2.includes(s1)) return true;
  
  // Check for word-level matches
  const words1 = s1.split(/\s+/);
  const words2 = s2.split(/\s+/);
  
  // If any word from search term matches any word in product text
  for (const word1 of words1) {
    for (const word2 of words2) {
      if (word1 === word2) return true;
      if (word1.includes(word2) || word2.includes(word1)) return true;
      if (word1.length >= 3 && word2.length >= 3 && 
          levenshteinSimilarity(word1, word2) >= threshold) return true;
    }
  }
  
  // Full string fuzzy matching for shorter strings
  if (s1.length <= 20 && s2.length <= 20) {
    return levenshteinSimilarity(s1, s2) >= threshold;
  }
  
  return false;
};

// Calculate similarity ratio (0-1) using Levenshtein distance
const levenshteinSimilarity = (str1: string, str2: string): number => {
  const longer = str1.length > str2.length ? str1 : str2;
  const shorter = str1.length > str2.length ? str2 : str1;
  
  if (longer.length === 0) return 1;
  
  const distance = levenshteinDistance(longer, shorter);
  return (longer.length - distance) / longer.length;
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

// Enhanced search function with better matching logic
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
    
    // Check each search term against product fields with improved matching
    searchTerms.forEach(term => {
      const termLower = term.toLowerCase();
      
      // Exact and partial name matching
      if (product.name.toLowerCase().includes(termLower) || 
          fuzzyMatch(product.name, term)) {
        matchedFields.push("name");
        hasMatch = true;
      }
      
      // Description matching with fuzzy support
      if (product.description && 
          (product.description.toLowerCase().includes(termLower) ||
           fuzzyMatch(product.description, term))) {
        matchedFields.push("description");
        hasMatch = true;
      }
      
      // Category matching
      if (product.category.toLowerCase().includes(termLower) ||
          fuzzyMatch(product.category, term)) {
        matchedFields.push("category");
        hasMatch = true;
      }
      
      // Subcategory matching
      if (product.subcategory.toLowerCase().includes(termLower) ||
          fuzzyMatch(product.subcategory, term)) {
        matchedFields.push("subcategory");
        hasMatch = true;
      }
      
      // Fabric matching
      if (product.fabric && 
          (product.fabric.toLowerCase().includes(termLower) ||
           fuzzyMatch(product.fabric, term))) {
        matchedFields.push("fabric");
        hasMatch = true;
      }
      
      // Occasion matching
      if (product.occasion?.some(occ => 
          occ.toLowerCase().includes(termLower) ||
          fuzzyMatch(occ, term))) {
        matchedFields.push("occasion");
        hasMatch = true;
      }
      
      // Color matching
      if (product.colors?.some(color => 
          color.toLowerCase().includes(termLower) ||
          fuzzyMatch(color, term))) {
        matchedFields.push("colors");
        hasMatch = true;
      }
      
      // SKU matching (exact only)
      if (product.sku?.toLowerCase().includes(termLower)) {
        matchedFields.push("sku");
        hasMatch = true;
      }
      
      // Multi-word phrase matching
      if (searchTerms.length > 1) {
        const phrase = searchTerms.join(' ');
        if (product.name.toLowerCase().includes(phrase) ||
            product.description?.toLowerCase().includes(phrase)) {
          matchedFields.push("name");
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
    .sort((a, b) => {
      // Primary sort by score
      if (b.score !== a.score) {
        return b.score - a.score;
      }
      
      // Secondary sort by rating for same scores
      if (b.product.rating !== a.product.rating) {
        return (b.product.rating || 0) - (a.product.rating || 0);
      }
      
      // Tertiary sort by reviews for same scores and ratings
      return (b.product.reviews || 0) - (a.product.reviews || 0);
    })
    .slice(0, searchConfig.maxResults);
};

// Enhanced auto-complete suggestions with scoring
export const getSearchSuggestions = (products: Product[], query: string, limit: number = 5): string[] => {
  if (!query.trim()) return [];
  
  const suggestions = new Map<string, number>();
  const searchTerm = query.toLowerCase();
  
  products.forEach(product => {
    // Product names with scoring
    const nameWords = product.name.toLowerCase().split(/\s+/);
    nameWords.forEach(word => {
      if (word.startsWith(searchTerm)) {
        const currentScore = suggestions.get(product.name) || 0;
        suggestions.set(product.name, currentScore + 10); // High score for product names
      } else if (word.includes(searchTerm)) {
        const currentScore = suggestions.get(product.name) || 0;
        suggestions.set(product.name, currentScore + 5);
      }
    });
    
    // Categories with scoring
    if (product.category.toLowerCase().startsWith(searchTerm)) {
      const currentScore = suggestions.get(product.category) || 0;
      suggestions.set(product.category, currentScore + 8);
    } else if (product.category.toLowerCase().includes(searchTerm)) {
      const currentScore = suggestions.get(product.category) || 0;
      suggestions.set(product.category, currentScore + 4);
    }
    
    // Subcategories with scoring
    if (product.subcategory.toLowerCase().startsWith(searchTerm)) {
      const currentScore = suggestions.get(product.subcategory) || 0;
      suggestions.set(product.subcategory, currentScore + 6);
    }
    
    // Fabrics with scoring
    if (product.fabric?.toLowerCase().startsWith(searchTerm)) {
      const currentScore = suggestions.get(product.fabric) || 0;
      suggestions.set(product.fabric, currentScore + 5);
    }
    
    // Occasions with scoring
    product.occasion?.forEach(occ => {
      if (occ.toLowerCase().startsWith(searchTerm)) {
        const currentScore = suggestions.get(occ) || 0;
        suggestions.set(occ, currentScore + 4);
      } else if (occ.toLowerCase().includes(searchTerm)) {
        const currentScore = suggestions.get(occ) || 0;
        suggestions.set(occ, currentScore + 2);
      }
    });
    
    // Colors with scoring
    product.colors?.forEach(color => {
      if (color.toLowerCase().startsWith(searchTerm)) {
        const currentScore = suggestions.get(color) || 0;
        suggestions.set(color, currentScore + 3);
      }
    });
    
    // Add fuzzy matches for better suggestions
    if (fuzzyMatch(product.name, searchTerm, 0.6)) {
      const currentScore = suggestions.get(product.name) || 0;
      suggestions.set(product.name, currentScore + 2);
    }
  });
  
  // Sort by score and return top suggestions
  return Array.from(suggestions.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([suggestion]) => suggestion)
    .slice(0, limit);
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
