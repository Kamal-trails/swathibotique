/**
 * Admin Service - Product Management
 * Following Single Responsibility Principle - only handles admin operations
 */

import { Product, ProductCategory, ProductSubcategory, Occasion, Fabric } from '@/types/product';

export interface ProductFormData {
  name: string;
  price: number;
  category: ProductCategory | '';
  subcategory: ProductSubcategory | '';
  description: string;
  fabric: Fabric | '';
  occasion: Occasion[];
  colors: string[];
  sizes: string[];
  isNew: boolean;
  discount: number;
  inStock: boolean;
  rating: number;
  reviews: number;
  careInstructions: string;
  origin: string;
  sku: string;
}

export interface AdminProduct extends Product {
  createdAt: Date;
  updatedAt: Date;
  status: 'active' | 'inactive' | 'draft';
  tags: string[];
  viewCount: number;
}

// Generate tags based on product data
export const generateProductTags = (productData: ProductFormData): string[] => {
  const tags: string[] = [];
  
  // Basic category tags
  if (productData.category) tags.push(productData.category);
  if (productData.subcategory) tags.push(productData.subcategory);
  if (productData.fabric) tags.push(productData.fabric);
  
  // Occasion tags
  productData.occasion.forEach(occ => tags.push(occ));
  
  // Color tags
  productData.colors.forEach(color => tags.push(color));
  
  // Status tags
  if (productData.isNew) tags.push('New Arrival');
  if (productData.discount > 0) tags.push(`${productData.discount}% Off`);
  if (productData.rating >= 4.5) tags.push('Highly Rated');
  if (productData.reviews > 100) tags.push('Popular');
  if (!productData.inStock) tags.push('Out of Stock');
  
  // Price range tags
  if (productData.price < 1000) tags.push('Budget Friendly');
  else if (productData.price > 10000) tags.push('Premium');
  
  // Seasonal tags based on occasions
  if (productData.occasion.includes('Wedding')) tags.push('Wedding Collection');
  if (productData.occasion.includes('Festival')) tags.push('Festive Wear');
  if (productData.occasion.includes('Party')) tags.push('Party Wear');
  
  return [...new Set(tags)];
};

// Validate product data
export const validateProductData = (productData: ProductFormData): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (!productData.name.trim()) errors.push('Product name is required');
  if (!productData.category) errors.push('Category is required');
  if (!productData.subcategory) errors.push('Subcategory is required');
  if (!productData.description.trim()) errors.push('Description is required');
  if (productData.price <= 0) errors.push('Price must be greater than 0');
  if (productData.discount < 0 || productData.discount > 100) errors.push('Discount must be between 0 and 100');
  if (productData.rating < 0 || productData.rating > 5) errors.push('Rating must be between 0 and 5');
  if (productData.reviews < 0) errors.push('Reviews count cannot be negative');
  if (productData.colors.length === 0) errors.push('At least one color is required');
  if (productData.sizes.length === 0) errors.push('At least one size is required');
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Generate SKU
export const generateSKU = (category: ProductCategory, existingSKUs: string[]): string => {
  const categoryPrefix = category.replace(/[^A-Z]/g, '').substring(0, 3).toUpperCase();
  let counter = 1;
  let sku = `JB-${categoryPrefix}-${counter.toString().padStart(3, '0')}`;
  
  while (existingSKUs.includes(sku)) {
    counter++;
    sku = `JB-${categoryPrefix}-${counter.toString().padStart(3, '0')}`;
  }
  
  return sku;
};

// Convert form data to product
export const formDataToProduct = (
  formData: ProductFormData, 
  images: string[], 
  id?: number
): AdminProduct => {
  const now = new Date();
  
  return {
    id: id || Date.now(), // Generate ID if not provided
    name: formData.name,
    price: formData.price,
    image: images[0] || '/placeholder.svg',
    images: images,
    category: (formData.category || 'Sarees') as ProductCategory,
    subcategory: (formData.subcategory || 'Ethnic Wear') as ProductSubcategory,
    description: formData.description,
    fabric: formData.fabric,
    occasion: formData.occasion,
    colors: formData.colors,
    sizes: formData.sizes,
    isNew: formData.isNew,
    discount: formData.discount,
    inStock: formData.inStock,
    rating: formData.rating,
    reviews: formData.reviews,
    careInstructions: formData.careInstructions,
    origin: formData.origin,
    sku: formData.sku,
    createdAt: now,
    updatedAt: now,
    status: 'active',
    tags: generateProductTags(formData),
    viewCount: 0
  };
};

// Product analytics
export const getProductAnalytics = (products: AdminProduct[]) => {
  const totalProducts = products.length;
  const newProducts = products.filter(p => p.isNew).length;
  const outOfStock = products.filter(p => !p.inStock).length;
  const highRated = products.filter(p => (p.rating || 0) >= 4.5).length;
  const discounted = products.filter(p => (p.discount || 0) > 0).length;
  
  const categories = products.reduce((acc, product) => {
    acc[product.category] = (acc[product.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const avgRating = products.reduce((sum, product) => sum + (product.rating || 0), 0) / totalProducts;
  const avgPrice = products.reduce((sum, product) => sum + product.price, 0) / totalProducts;
  
  return {
    totalProducts,
    newProducts,
    outOfStock,
    highRated,
    discounted,
    categories,
    avgRating: avgRating.toFixed(1),
    avgPrice: avgPrice.toFixed(0),
    totalViews: products.reduce((sum, product) => sum + product.viewCount, 0)
  };
};

// Search products for admin
export const searchAdminProducts = (products: AdminProduct[], query: string): AdminProduct[] => {
  if (!query.trim()) return products;
  
  const searchTerm = query.toLowerCase();
  
  return products.filter(product => 
    product.name.toLowerCase().includes(searchTerm) ||
    product.category.toLowerCase().includes(searchTerm) ||
    product.subcategory.toLowerCase().includes(searchTerm) ||
    product.sku.toLowerCase().includes(searchTerm) ||
    product.tags.some(tag => tag.toLowerCase().includes(searchTerm))
  );
};

// Filter products for admin
export const filterAdminProducts = (
  products: AdminProduct[], 
  filters: {
    status?: 'active' | 'inactive' | 'draft';
    category?: string;
    isNew?: boolean;
    inStock?: boolean;
    minPrice?: number;
    maxPrice?: number;
  }
): AdminProduct[] => {
  return products.filter(product => {
    if (filters.status && product.status !== filters.status) return false;
    if (filters.category && product.category !== filters.category) return false;
    if (filters.isNew !== undefined && product.isNew !== filters.isNew) return false;
    if (filters.inStock !== undefined && product.inStock !== filters.inStock) return false;
    if (filters.minPrice && product.price < filters.minPrice) return false;
    if (filters.maxPrice && product.price > filters.maxPrice) return false;
    
    return true;
  });
};
