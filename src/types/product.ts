/**
 * Product-related TypeScript interfaces
 * Following Single Responsibility Principle - only product-related types
 */

export interface Product {
  id: number;
  name: string;
  price: number;
  image: string;
  category: ProductCategory;
  subcategory: ProductSubcategory;
  isNew?: boolean;
  discount?: number;
  description?: string;
  images?: string[];
  sizes?: string[];
  colors?: string[];
  fabric?: string;
  occasion?: Occasion[];
  inStock?: boolean;
  rating?: number;
  reviews?: number;
  sku?: string;
  careInstructions?: string;
  origin?: string;
  
  // Inventory Management Fields
  inventory?: {
    currentStock: number;
    reservedStock: number;
    availableStock: number;
    minimumStock: number;
    maximumStock: number;
    reorderPoint: number;
    reorderQuantity: number;
    costPrice: number;
    margin: number;
    warehouse: string;
    shelf: string;
    bin: string;
    lastRestocked: Date;
    lastSold: Date;
    totalSold: number;
    totalRevenue: number;
    averageMonthlySales: number;
    turnoverRate: number;
    status: 'active' | 'inactive' | 'discontinued';
    notes: string;
  };
}

export type ProductCategory = 
  | "Sarees"
  | "Lehengas"
  | "Salwar Suits"
  | "Kurtis & Kurtas"
  | "Gowns"
  | "Dupattas & Stoles"
  | "Men's Kurtas"
  | "Sherwanis"
  | "Kids Wear"
  | "Jewelry"
  | "Bags & Clutches";

export type ProductSubcategory =
  | "Ethnic Wear"
  | "Bridal Wear"
  | "Indo-Western"
  | "Men's Ethnic Wear"
  | "Men's Bridal Wear"
  | "Kids Ethnic Wear"
  | "Accessories";

export type Occasion =
  | "Wedding"
  | "Festival"
  | "Party"
  | "Office"
  | "Casual"
  | "Formal"
  | "Traditional"
  | "Modern";

export type Fabric =
  | "Silk"
  | "Cotton"
  | "Georgette"
  | "Chiffon"
  | "Velvet"
  | "Linen"
  | "Crepe"
  | "Net"
  | "Organza";

export interface ProductFilter {
  categories: ProductCategory[];
  subcategories: ProductSubcategory[];
  occasions: Occasion[];
  fabrics: Fabric[];
  priceRange: [number, number];
  sizes: string[];
  colors: string[];
  inStock?: boolean;
  isNew?: boolean;
  hasDiscount?: boolean;
}

export interface SortOption {
  value: string;
  label: string;
  sortFn: (products: Product[]) => Product[];
}

export interface ProductReview {
  id: string;
  productId: number;
  userId: string;
  userName: string;
  rating: number;
  title: string;
  comment: string;
  images?: string[];
  verified: boolean;
  helpful: number;
  createdAt: Date;
  size?: string;
  occasion?: string;
}
