/**
 * Product Service - Centralized data management
 * Following Single Responsibility Principle - only handles product data operations
 * Following DRY Principle - reusable across all components
 */

import { Product, ProductFilter, SortOption, Occasion, ProductCategory, ProductSubcategory, Fabric } from "@/types/product";
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

// Helper function to generate product variations
const generateProductVariations = (baseProduct: Omit<Product, 'id'>, count: number): Product[] => {
  const variations: Product[] = [];
  const colors = ['Red', 'Blue', 'Green', 'Pink', 'Purple', 'Gold', 'Maroon', 'Navy', 'Coral', 'Teal'];
  const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'Free Size'];
  
  for (let i = 0; i < count; i++) {
    const baseId = 'id' in baseProduct ? (baseProduct as any).id : 1000;
    variations.push({
      ...baseProduct,
      id: baseId + i,
      name: `${baseProduct.name} - ${colors[i % colors.length]}`,
      price: baseProduct.price + (i * 500), // Vary price slightly
      colors: [colors[i % colors.length], colors[(i + 1) % colors.length]],
      sizes: baseProduct.sizes || sizes.slice(0, 3 + (i % 4)),
      rating: Math.max(3.5, Math.min(5, (baseProduct.rating || 4) + (Math.random() - 0.5) * 0.5)),
      reviews: (baseProduct.reviews || 50) + Math.floor(Math.random() * 100),
      isNew: i < 3, // First 3 variations are new
      discount: i % 4 === 0 ? Math.floor(Math.random() * 20) + 5 : undefined,
    });
  }
  return variations;
};

// Mock product data - in real app, this would come from API
export const PRODUCTS: Product[] = [
  // Sarees
  {
    id: 1,
    name: "Silk Saree with Zari Work",
    price: 4999,
    image: saree1,
    category: "Sarees",
    subcategory: "Ethnic Wear",
    isNew: true,
    description: "Exquisite silk saree with intricate zari work, perfect for special occasions",
    images: [saree1, saree1, saree1],
    sizes: ["Free Size"],
    colors: ["Red", "Gold", "Maroon"],
    fabric: "Silk",
    occasion: ["Wedding", "Festival", "Formal"],
    inStock: true,
    rating: 4.5,
    reviews: 128,
    sku: "JB-SAR-001",
    careInstructions: "Dry clean only",
    origin: "Made in India"
  },
  {
    id: 2,
    name: "Banarasi Silk Saree",
    price: 6999,
    image: saree2,
    category: "Sarees",
    subcategory: "Ethnic Wear",
    discount: 15,
    description: "Authentic Banarasi silk saree with traditional motifs",
    images: [saree2, saree2, saree2],
    sizes: ["Free Size"],
    colors: ["Green", "Pink", "Blue"],
    fabric: "Silk",
    occasion: ["Wedding", "Festival", "Traditional"],
    inStock: true,
    rating: 4.8,
    reviews: 95,
    sku: "JB-SAR-002",
    careInstructions: "Dry clean only",
    origin: "Made in India"
  },
  
  // Lehengas
  {
    id: 3,
    name: "Bridal Lehenga Choli",
    price: 15999,
    image: lehenga1,
    category: "Lehengas",
    subcategory: "Bridal Wear",
    isNew: true,
    description: "Stunning bridal lehenga with heavy embroidery and sequins",
    images: [lehenga1, lehenga1, lehenga1],
    sizes: ["S", "M", "L", "XL"],
    colors: ["Red", "Pink", "Maroon"],
    fabric: "Silk",
    occasion: ["Wedding", "Formal"],
    inStock: true,
    rating: 4.9,
    reviews: 67,
    sku: "JB-LEH-001",
    careInstructions: "Dry clean only",
    origin: "Made in India"
  },
  {
    id: 4,
    name: "Party Wear Lehenga",
    price: 8999,
    image: lehenga1,
    category: "Lehengas",
    subcategory: "Ethnic Wear",
    description: "Elegant party wear lehenga perfect for celebrations",
    images: [lehenga1, lehenga1, lehenga1],
    sizes: ["S", "M", "L", "XL"],
    colors: ["Blue", "Purple", "Green"],
    fabric: "Georgette",
    occasion: ["Party", "Festival", "Formal"],
    inStock: true,
    rating: 4.3,
    reviews: 89,
    sku: "JB-LEH-002",
    careInstructions: "Dry clean only",
    origin: "Made in India"
  },
  
  // Salwar Suits
  {
    id: 5,
    name: "Anarkali Suit Set",
    price: 3499,
    image: anarkali1,
    category: "Salwar Suits",
    subcategory: "Ethnic Wear",
    isNew: true,
    description: "Beautiful Anarkali suit with elegant draping",
    images: [anarkali1, anarkali1, anarkali1],
    sizes: ["S", "M", "L", "XL"],
    colors: ["Pink", "Blue", "Green"],
    fabric: "Cotton",
    occasion: ["Party", "Festival", "Casual"],
    inStock: true,
    rating: 4.4,
    reviews: 156,
    sku: "JB-ANK-001",
    careInstructions: "Machine wash cold",
    origin: "Made in India"
  },
  {
    id: 6,
    name: "Punjabi Suit with Dupatta",
    price: 2999,
    image: anarkali1,
    category: "Salwar Suits",
    subcategory: "Ethnic Wear",
    discount: 10,
    description: "Comfortable Punjabi suit perfect for daily wear",
    images: [anarkali1, anarkali1, anarkali1],
    sizes: ["S", "M", "L", "XL"],
    colors: ["Yellow", "Orange", "Red"],
    fabric: "Cotton",
    occasion: ["Casual", "Office", "Traditional"],
    inStock: true,
    rating: 4.2,
    reviews: 203,
    sku: "JB-PUN-001",
    careInstructions: "Machine wash cold",
    origin: "Made in India"
  },
  
  // Kurtis
  {
    id: 7,
    name: "Designer Kurti with Palazzo",
    price: 2499,
    image: kurti1,
    category: "Kurtis & Kurtas",
    subcategory: "Ethnic Wear",
    description: "Stylish kurti with matching palazzo pants",
    images: [kurti1, kurti1, kurti1],
    sizes: ["S", "M", "L", "XL"],
    colors: ["White", "Black", "Navy"],
    fabric: "Cotton",
    occasion: ["Office", "Casual", "Party"],
    inStock: true,
    rating: 4.1,
    reviews: 178,
    sku: "JB-KUR-001",
    careInstructions: "Machine wash cold",
    origin: "Made in India"
  },
  {
    id: 8,
    name: "Embroidered Cotton Kurti",
    price: 1499,
    image: kurti1,
    category: "Kurtis & Kurtas",
    subcategory: "Ethnic Wear",
    discount: 20,
    description: "Comfortable cotton kurti with beautiful embroidery",
    images: [kurti1, kurti1, kurti1],
    sizes: ["S", "M", "L", "XL"],
    colors: ["Pink", "Blue", "Green"],
    fabric: "Cotton",
    occasion: ["Casual", "Office", "Traditional"],
    inStock: true,
    rating: 4.0,
    reviews: 234,
    sku: "JB-KUR-002",
    careInstructions: "Machine wash cold",
    origin: "Made in India"
  },
  
  // Men's Wear
  {
    id: 9,
    name: "Men's Kurta Pajama Set",
    price: 2999,
    image: mensKurta1,
    category: "Men's Kurtas",
    subcategory: "Men's Ethnic Wear",
    isNew: true,
    description: "Comfortable kurta pajama set for men",
    images: [mensKurta1, mensKurta1, mensKurta1],
    sizes: ["S", "M", "L", "XL", "XXL"],
    colors: ["White", "Cream", "Blue"],
    fabric: "Cotton",
    occasion: ["Casual", "Traditional", "Festival"],
    inStock: true,
    rating: 4.3,
    reviews: 145,
    sku: "JB-MK-001",
    careInstructions: "Machine wash cold",
    origin: "Made in India"
  },
  {
    id: 10,
    name: "Wedding Sherwani",
    price: 12999,
    image: sherwani1,
    category: "Sherwanis",
    subcategory: "Men's Bridal Wear",
    description: "Elegant sherwani for special occasions",
    images: [sherwani1, sherwani1, sherwani1],
    sizes: ["S", "M", "L", "XL", "XXL"],
    colors: ["Cream", "Gold", "Maroon"],
    fabric: "Silk",
    occasion: ["Wedding", "Formal"],
    inStock: true,
    rating: 4.7,
    reviews: 89,
    sku: "JB-SHW-001",
    careInstructions: "Dry clean only",
    origin: "Made in India"
  },
  
  // Accessories
  {
    id: 11,
    name: "Embroidered Potli Bag",
    price: 799,
    image: potliBag,
    category: "Bags & Clutches",
    subcategory: "Accessories",
    isNew: true,
    description: "Beautiful embroidered potli bag for special occasions",
    images: [potliBag, potliBag, potliBag],
    sizes: ["One Size"],
    colors: ["Gold", "Silver", "Red"],
    fabric: "Silk",
    occasion: ["Wedding", "Party", "Festival"],
    inStock: true,
    rating: 4.2,
    reviews: 67,
    sku: "JB-BAG-001",
    careInstructions: "Spot clean only",
    origin: "Made in India"
  },
  {
    id: 12,
    name: "Kundan Jhumka Earrings",
    price: 1299,
    image: jewelryEarrings,
    category: "Jewelry",
    subcategory: "Accessories",
    discount: 25,
    description: "Traditional kundan jhumka earrings",
    images: [jewelryEarrings, jewelryEarrings, jewelryEarrings],
    sizes: ["One Size"],
    colors: ["Gold", "Silver"],
    fabric: "Metal",
    occasion: ["Wedding", "Party", "Festival", "Traditional"],
    inStock: true,
    rating: 4.5,
    reviews: 123,
    sku: "JB-JEW-001",
    careInstructions: "Store in dry place",
    origin: "Made in India"
  },
  
  // Dupattas
  {
    id: 13,
    name: "Chiffon Dupatta with Embroidery",
    price: 899,
    image: dupatta1,
    category: "Dupattas & Stoles",
    subcategory: "Ethnic Wear",
    description: "Elegant chiffon dupatta with intricate embroidery",
    images: [dupatta1, dupatta1, dupatta1],
    sizes: ["Free Size"],
    colors: ["Pink", "Blue", "Green"],
    fabric: "Chiffon",
    occasion: ["Party", "Festival", "Traditional"],
    inStock: true,
    rating: 4.0,
    reviews: 89,
    sku: "JB-DUP-001",
    careInstructions: "Dry clean only",
    origin: "Made in India"
  },
  {
    id: 14,
    name: "Banarasi Dupatta",
    price: 1499,
    image: dupatta1,
    category: "Dupattas & Stoles",
    subcategory: "Ethnic Wear",
    isNew: true,
    description: "Authentic Banarasi dupatta with traditional work",
    images: [dupatta1, dupatta1, dupatta1],
    sizes: ["Free Size"],
    colors: ["Red", "Gold", "Maroon"],
    fabric: "Silk",
    occasion: ["Wedding", "Festival", "Traditional"],
    inStock: true,
    rating: 4.6,
    reviews: 56,
    sku: "JB-DUP-002",
    careInstructions: "Dry clean only",
    origin: "Made in India"
  },
  
  // Kids Wear
  {
    id: 15,
    name: "Girl's Lehenga Choli",
    price: 1999,
    image: kidsLehenga,
    category: "Kids Wear",
    subcategory: "Kids Ethnic Wear",
    isNew: true,
    description: "Adorable lehenga choli for little girls",
    images: [kidsLehenga, kidsLehenga, kidsLehenga],
    sizes: ["2Y", "4Y", "6Y", "8Y", "10Y", "12Y"],
    colors: ["Pink", "Blue", "Green"],
    fabric: "Cotton",
    occasion: ["Festival", "Party", "Wedding"],
    inStock: true,
    rating: 4.8,
    reviews: 45,
    sku: "JB-KID-001",
    careInstructions: "Machine wash cold",
    origin: "Made in India"
  },
  {
    id: 16,
    name: "Girl's Festive Dress",
    price: 1499,
    image: kidsLehenga,
    category: "Kids Wear",
    subcategory: "Kids Ethnic Wear",
    discount: 15,
    description: "Beautiful festive dress for special occasions",
    images: [kidsLehenga, kidsLehenga, kidsLehenga],
    sizes: ["2Y", "4Y", "6Y", "8Y", "10Y", "12Y"],
    colors: ["Red", "Yellow", "Orange"],
    fabric: "Cotton",
    occasion: ["Festival", "Party"],
    inStock: true,
    rating: 4.4,
    reviews: 78,
    sku: "JB-KID-002",
    careInstructions: "Machine wash cold",
    origin: "Made in India"
  },
  
  // Indo-Western
  {
    id: 17,
    name: "Indo-Western Gown",
    price: 5999,
    image: indoWesternGown,
    category: "Gowns",
    subcategory: "Indo-Western",
    isNew: true,
    description: "Stylish Indo-Western gown perfect for modern occasions",
    images: [indoWesternGown, indoWesternGown, indoWesternGown],
    sizes: ["S", "M", "L", "XL"],
    colors: ["Black", "Navy", "Maroon"],
    fabric: "Georgette",
    occasion: ["Party", "Formal", "Modern"],
    inStock: true,
    rating: 4.3,
    reviews: 67,
    sku: "JB-GWN-001",
    careInstructions: "Dry clean only",
    origin: "Made in India"
  },
  {
    id: 18,
    name: "Fusion Party Gown",
    price: 4999,
    image: indoWesternGown,
    category: "Gowns",
    subcategory: "Indo-Western",
    discount: 10,
    description: "Elegant fusion gown for party wear",
    images: [indoWesternGown, indoWesternGown, indoWesternGown],
    sizes: ["S", "M", "L", "XL"],
    colors: ["Pink", "Blue", "Purple"],
    fabric: "Chiffon",
    occasion: ["Party", "Modern", "Formal"],
    inStock: true,
    rating: 4.1,
    reviews: 89,
    sku: "JB-GWN-002",
    careInstructions: "Dry clean only",
    origin: "Made in India"
  }
];

// Generate expanded product catalog for pagination
const baseProducts = PRODUCTS;
const expandedProducts: Product[] = [];

// Duplicate each base product with variations to create a larger catalog
baseProducts.forEach((product, index) => {
  // Add the original product
  expandedProducts.push(product);
  
  // Generate 4-6 variations of each product
  const variationCount = 4 + (index % 3); // 4-6 variations
  const variations = generateProductVariations(product, variationCount);
  expandedProducts.push(...variations);
});

// Export the expanded product catalog
export const ALL_PRODUCTS = expandedProducts;

// Get all products - now includes both static and dynamic products
export const getAllProducts = (): Product[] => {
  // Get static products
  const staticProducts = ALL_PRODUCTS;
  
  // Get dynamic products from localStorage (added via admin)
  // Check if we're in a browser environment
  let dynamicProducts: Product[] = [];
  
  if (typeof window !== 'undefined' && window.localStorage) {
    const savedAdminProducts = localStorage.getItem('adminProducts');
    
    if (savedAdminProducts) {
      try {
        const adminProducts = JSON.parse(savedAdminProducts);
        dynamicProducts = adminProducts.map((adminProduct: any) => ({
          id: adminProduct.id,
          name: adminProduct.name,
          price: adminProduct.price,
          image: adminProduct.image,
          category: adminProduct.category,
          subcategory: adminProduct.subcategory,
          isNew: adminProduct.isNew,
          discount: adminProduct.discount,
          description: adminProduct.description,
          images: adminProduct.images,
          sizes: adminProduct.sizes,
          colors: adminProduct.colors,
          fabric: adminProduct.fabric,
          occasion: adminProduct.occasion,
          inStock: adminProduct.inStock,
          rating: adminProduct.rating,
          reviews: adminProduct.reviews,
          sku: adminProduct.sku,
          careInstructions: adminProduct.careInstructions,
          origin: adminProduct.origin,
        }));
      } catch (error) {
        console.error('Error loading dynamic products:', error);
      }
    }
  }
  
  // Combine static and dynamic products, with dynamic products first (newest)
  const allProducts = [...dynamicProducts, ...staticProducts];
  return allProducts;
};

// Sort options following Open/Closed Principle
export const SORT_OPTIONS: SortOption[] = [
  {
    value: "featured",
    label: "Featured",
    sortFn: (products) => products.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0))
  },
  {
    value: "price-low",
    label: "Price: Low to High",
    sortFn: (products) => products.sort((a, b) => a.price - b.price)
  },
  {
    value: "price-high",
    label: "Price: High to Low",
    sortFn: (products) => products.sort((a, b) => b.price - a.price)
  },
  {
    value: "newest",
    label: "Newest",
    sortFn: (products) => products.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0))
  },
  {
    value: "popular",
    label: "Most Popular",
    sortFn: (products) => products.sort((a, b) => (b.reviews || 0) - (a.reviews || 0))
  },
  {
    value: "rating",
    label: "Highest Rated",
    sortFn: (products) => products.sort((a, b) => (b.rating || 0) - (a.rating || 0))
  }
];

// Filter functions following Single Responsibility Principle
export const filterProducts = (products: Product[], filter: ProductFilter): Product[] => {
  return products.filter(product => {
    // Category filter
    if (filter.categories.length > 0 && !filter.categories.includes(product.category)) {
      return false;
    }
    
    // Subcategory filter
    if (filter.subcategories.length > 0 && !filter.subcategories.includes(product.subcategory)) {
      return false;
    }
    
    // Occasion filter
    if (filter.occasions.length > 0 && !product.occasion?.some(occ => filter.occasions.includes(occ))) {
      return false;
    }
    
    // Fabric filter
    if (filter.fabrics.length > 0 && product.fabric && !filter.fabrics.includes(product.fabric as any)) {
      return false;
    }
    
    // Price range filter
    if (product.price < filter.priceRange[0] || product.price > filter.priceRange[1]) {
      return false;
    }
    
    // Size filter
    if (filter.sizes.length > 0 && !product.sizes?.some(size => filter.sizes.includes(size))) {
      return false;
    }
    
    // Color filter
    if (filter.colors.length > 0 && !product.colors?.some(color => filter.colors.includes(color))) {
      return false;
    }
    
    // Stock filter
    if (filter.inStock !== undefined && product.inStock !== filter.inStock) {
      return false;
    }
    
    // New items filter
    if (filter.isNew !== undefined && product.isNew !== filter.isNew) {
      return false;
    }
    
    // Discount filter
    if (filter.hasDiscount !== undefined) {
      const hasDiscount = product.discount !== undefined && product.discount > 0;
      if (hasDiscount !== filter.hasDiscount) {
        return false;
      }
    }
    
    return true;
  });
};

// Search function with fuzzy matching
export const searchProducts = (products: Product[], query: string): Product[] => {
  if (!query.trim()) return products;
  
  const searchTerm = query.toLowerCase().trim();
  
  return products.filter(product => {
    // Search in name
    if (product.name.toLowerCase().includes(searchTerm)) return true;
    
    // Search in description
    if (product.description?.toLowerCase().includes(searchTerm)) return true;
    
    // Search in category
    if (product.category.toLowerCase().includes(searchTerm)) return true;
    
    // Search in subcategory
    if (product.subcategory.toLowerCase().includes(searchTerm)) return true;
    
    // Search in fabric
    if (product.fabric?.toLowerCase().includes(searchTerm)) return true;
    
    // Search in colors
    if (product.colors?.some(color => color.toLowerCase().includes(searchTerm))) return true;
    
    // Search in occasions
    if (product.occasion?.some(occ => occ.toLowerCase().includes(searchTerm))) return true;
    
    // Search in SKU
    if (product.sku?.toLowerCase().includes(searchTerm)) return true;
    
    return false;
  });
};

// Get unique values for filter options
export const getFilterOptions = (products: Product[]) => {
  const categories = [...new Set(products.map(p => p.category))];
  const subcategories = [...new Set(products.map(p => p.subcategory))];
  const occasions = [...new Set(products.flatMap(p => p.occasion || []))];
  const fabrics = [...new Set(products.map(p => p.fabric).filter(Boolean))] as Fabric[];
  const sizes = [...new Set(products.flatMap(p => p.sizes || []))];
  const colors = [...new Set(products.flatMap(p => p.colors || []))];
  
  return {
    categories: categories.sort(),
    subcategories: subcategories.sort(),
    occasions: occasions.sort(),
    fabrics: fabrics.sort() as Fabric[],
    sizes: sizes.sort(),
    colors: colors.sort()
  };
};
