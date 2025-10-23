/**
 * Clean Product Context - No circular dependencies
 * Following Single Responsibility Principle - only handles product state
 * Following Dependency Inversion Principle - depends on data service abstraction
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Product } from '@/types/product';
import { getAllProducts, addAdminProduct, updateAdminProduct, deleteAdminProduct } from '@/services/dataService';

// Product Context State
interface ProductContextState {
  products: Product[];
  isLoading: boolean;
  error: string | null;
}

// Product Context Actions
interface ProductContextActions {
  refreshProducts: () => void;
  addProduct: (productData: any, images: File[]) => Promise<void>;
  updateProduct: (id: number, updates: any) => void;
  deleteProduct: (id: number) => void;
}

// Combined Context Type
type ProductContextType = ProductContextState & ProductContextActions;

// Create Context
const ProductContext = createContext<ProductContextType | undefined>(undefined);

// Product Provider Props
interface ProductProviderProps {
  children: ReactNode;
}

// Product Provider Component
export const ProductProvider: React.FC<ProductProviderProps> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load products on mount
  const loadProducts = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Get products from clean data service
      const allProducts = getAllProducts();
      setProducts(allProducts);
    } catch (err) {
      console.error('ProductContext: Error loading products:', err);
      setError(err instanceof Error ? err.message : 'Failed to load products');
    } finally {
      setIsLoading(false);
    }
  };

  // Refresh products
  const refreshProducts = () => {
    loadProducts();
  };

  // Add new product
  const addProduct = async (productData: any, images: File[]): Promise<void> => {
    try {
      // Convert images to base64
      const imagePromises = images.map(file => {
        return new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (e) => resolve(e.target?.result as string);
          reader.onerror = () => reject(new Error('Failed to read file'));
          reader.readAsDataURL(file);
        });
      });

      const imageUrls = await Promise.all(imagePromises);
      
      // Create new product
      const newProduct = {
        id: Date.now(), // Simple ID generation
        name: productData.name,
        price: productData.price,
        image: imageUrls[0] || '/placeholder.svg',
        images: imageUrls,
        category: productData.category,
        subcategory: productData.subcategory,
        description: productData.description,
        fabric: productData.fabric,
        occasion: productData.occasion || [],
        colors: productData.colors || [],
        sizes: productData.sizes || [],
        isNew: productData.isNew || false,
        discount: productData.discount || 0,
        inStock: productData.inStock !== false,
        rating: productData.rating || 4.0,
        reviews: productData.reviews || 0,
        careInstructions: productData.careInstructions || '',
        origin: productData.origin || 'Made in India',
        sku: productData.sku || `JB-${Date.now()}`,
      };

      // Add to data service
      addAdminProduct(newProduct);
      
      // Refresh products
      refreshProducts();
      
      console.log('ProductContext: Product added successfully:', newProduct.name);
    } catch (err) {
      console.error('ProductContext: Error adding product:', err);
      throw err;
    }
  };

  // Update product
  const updateProduct = (id: number, updates: any) => {
    try {
      updateAdminProduct(id, updates);
      refreshProducts();
      console.log('ProductContext: Product updated successfully:', id);
    } catch (err) {
      console.error('ProductContext: Error updating product:', err);
    }
  };

  // Delete product
  const deleteProduct = (id: number) => {
    try {
      deleteAdminProduct(id);
      refreshProducts();
      console.log('ProductContext: Product deleted successfully:', id);
    } catch (err) {
      console.error('ProductContext: Error deleting product:', err);
    }
  };

  // Load products on mount
  useEffect(() => {
    loadProducts();
  }, []);

  // Context value
  const value: ProductContextType = {
    // State
    products,
    isLoading,
    error,
    
    // Actions
    refreshProducts,
    addProduct,
    updateProduct,
    deleteProduct,
  };

  return (
    <ProductContext.Provider value={value}>
      {children}
    </ProductContext.Provider>
  );
};

// Custom hook to use product context
export const useProducts = (): ProductContextType => {
  const context = useContext(ProductContext);
  
  if (context === undefined) {
    throw new Error('useProducts must be used within a ProductProvider');
  }
  
  return context;
};
