/**
 * Clean Data Service - No circular dependencies
 * Following Single Responsibility Principle - only handles data operations
 * Following Dependency Inversion Principle - no imports from other services
 */

import { Product, ProductCategory, ProductSubcategory, Occasion, Fabric } from "@/types/product";

// Static product data - no heavy imports
const STATIC_PRODUCTS: Product[] = [
  {
    id: 1,
    name: "Silk Saree with Zari Work",
    price: 4999,
    image: "/src/assets/saree-1.jpg",
    category: "Sarees",
    subcategory: "Ethnic Wear",
    isNew: true,
    description: "Exquisite silk saree with intricate zari work, perfect for special occasions",
    images: ["/src/assets/saree-1.jpg"],
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
    image: "/src/assets/saree-2.jpg",
    category: "Sarees",
    subcategory: "Ethnic Wear",
    discount: 15,
    description: "Authentic Banarasi silk saree with traditional motifs",
    images: ["/src/assets/saree-2.jpg"],
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
  {
    id: 3,
    name: "Bridal Lehenga Choli",
    price: 15999,
    image: "/src/assets/lehenga-1.jpg",
    category: "Lehengas",
    subcategory: "Bridal Wear",
    isNew: true,
    description: "Stunning bridal lehenga with heavy embroidery and sequins",
    images: ["/src/assets/lehenga-1.jpg"],
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
    name: "Anarkali Suit Set",
    price: 3499,
    image: "/src/assets/anarkali-1.jpg",
    category: "Salwar Suits",
    subcategory: "Ethnic Wear",
    isNew: true,
    description: "Beautiful Anarkali suit with elegant draping",
    images: ["/src/assets/anarkali-1.jpg"],
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
    id: 5,
    name: "Designer Kurti with Palazzo",
    price: 2499,
    image: "/src/assets/kurti-1.jpg",
    category: "Kurtis & Kurtas",
    subcategory: "Ethnic Wear",
    description: "Stylish kurti with matching palazzo pants",
    images: ["/src/assets/kurti-1.jpg"],
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
    id: 6,
    name: "Men's Kurta Pajama Set",
    price: 2999,
    image: "/src/assets/mens-kurta-1.jpg",
    category: "Men's Kurtas",
    subcategory: "Men's Ethnic Wear",
    isNew: true,
    description: "Comfortable kurta pajama set for men",
    images: ["/src/assets/mens-kurta-1.jpg"],
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
    id: 7,
    name: "Wedding Sherwani",
    price: 12999,
    image: "/src/assets/sherwani-1.jpg",
    category: "Sherwanis",
    subcategory: "Men's Bridal Wear",
    description: "Elegant sherwani for special occasions",
    images: ["/src/assets/sherwani-1.jpg"],
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
  {
    id: 8,
    name: "Embroidered Potli Bag",
    price: 799,
    image: "/src/assets/potli-bag.jpg",
    category: "Bags & Clutches",
    subcategory: "Accessories",
    isNew: true,
    description: "Beautiful embroidered potli bag for special occasions",
    images: ["/src/assets/potli-bag.jpg"],
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
  }
];

// Get static products
export const getStaticProducts = (): Product[] => {
  return [...STATIC_PRODUCTS];
};

// Get dynamic products from localStorage (admin-added)
export const getDynamicProducts = (): Product[] => {
  if (typeof window === 'undefined' || !window.localStorage) {
    return [];
  }

  try {
    const savedAdminProducts = localStorage.getItem('adminProducts');
    if (!savedAdminProducts) return [];

    const adminProducts = JSON.parse(savedAdminProducts);
    return adminProducts.map((adminProduct: any) => ({
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
    return [];
  }
};

// Get all products (static + dynamic)
export const getAllProducts = (): Product[] => {
  const staticProducts = getStaticProducts();
  const dynamicProducts = getDynamicProducts();
  
  // Dynamic products first (newest), then static products
  return [...dynamicProducts, ...staticProducts];
};

// Save admin products to localStorage
export const saveAdminProducts = (products: any[]): void => {
  if (typeof window === 'undefined' || !window.localStorage) {
    return;
  }

  try {
    localStorage.setItem('adminProducts', JSON.stringify(products));
  } catch (error) {
    console.error('Error saving admin products:', error);
  }
};

// Add new admin product
export const addAdminProduct = (product: any): void => {
  const existingProducts = getDynamicProducts();
  const newProducts = [product, ...existingProducts];
  saveAdminProducts(newProducts);
};

// Update admin product
export const updateAdminProduct = (id: number, updates: any): void => {
  const existingProducts = getDynamicProducts();
  const updatedProducts = existingProducts.map(product =>
    product.id === id ? { ...product, ...updates } : product
  );
  saveAdminProducts(updatedProducts);
};

// Delete admin product
export const deleteAdminProduct = (id: number): void => {
  const existingProducts = getDynamicProducts();
  const filteredProducts = existingProducts.filter(product => product.id !== id);
  saveAdminProducts(filteredProducts);
};
