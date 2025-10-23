import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { Product } from '@/types/product';
import { AdminProduct } from '@/services/adminService';
import { formDataToProduct } from '@/services/adminService';
import { getAllProducts } from '@/services/productService';

// Product State interface
interface ProductState {
  products: Product[];
  adminProducts: AdminProduct[];
  lastUpdated: Date;
}

// Product Actions
type ProductAction =
  | { type: 'ADD_PRODUCT'; payload: AdminProduct }
  | { type: 'UPDATE_PRODUCT'; payload: { id: number; updates: Partial<AdminProduct> } }
  | { type: 'DELETE_PRODUCT'; payload: number }
  | { type: 'LOAD_PRODUCTS'; payload: Product[] }
  | { type: 'LOAD_ADMIN_PRODUCTS'; payload: AdminProduct[] };

// Initial state
const initialState: ProductState = {
  products: [],
  adminProducts: [],
  lastUpdated: new Date(),
};

// Product reducer
const productReducer = (state: ProductState, action: ProductAction): ProductState => {
  switch (action.type) {
    case 'ADD_PRODUCT': {
      const newAdminProduct = {
        ...action.payload,
        updatedAt: new Date(),
      };
      
      // Convert admin product to regular product for shopping catalog
      const regularProduct: Product = {
        id: newAdminProduct.id,
        name: newAdminProduct.name,
        price: newAdminProduct.price,
        image: newAdminProduct.image,
        category: newAdminProduct.category,
        subcategory: newAdminProduct.subcategory,
        isNew: newAdminProduct.isNew,
        discount: newAdminProduct.discount,
        description: newAdminProduct.description,
        images: newAdminProduct.images,
        sizes: newAdminProduct.sizes,
        colors: newAdminProduct.colors,
        fabric: newAdminProduct.fabric,
        occasion: newAdminProduct.occasion,
        inStock: newAdminProduct.inStock,
        rating: newAdminProduct.rating,
        reviews: newAdminProduct.reviews,
        sku: newAdminProduct.sku,
        careInstructions: newAdminProduct.careInstructions,
        origin: newAdminProduct.origin,
      };

      return {
        ...state,
        products: [regularProduct, ...state.products],
        adminProducts: [newAdminProduct, ...state.adminProducts],
        lastUpdated: new Date(),
      };
    }

    case 'UPDATE_PRODUCT': {
      const updatedAdminProducts = state.adminProducts.map(product =>
        product.id === action.payload.id
          ? { ...product, ...action.payload.updates, updatedAt: new Date() }
          : product
      );

      const updatedProducts = state.products.map(product =>
        product.id === action.payload.id
          ? { ...product, ...action.payload.updates }
          : product
      );

      // Also update localStorage for admin products
      if (updatedAdminProducts.length > 0) {
        localStorage.setItem('adminProducts', JSON.stringify(updatedAdminProducts));
      }

      return {
        ...state,
        products: updatedProducts,
        adminProducts: updatedAdminProducts,
        lastUpdated: new Date(),
      };
    }

    case 'DELETE_PRODUCT': {
      const updatedProducts = state.products.filter(product => product.id !== action.payload);
      const updatedAdminProducts = state.adminProducts.filter(product => product.id !== action.payload);
      
      // Update localStorage for admin products
      if (updatedAdminProducts.length > 0) {
        localStorage.setItem('adminProducts', JSON.stringify(updatedAdminProducts));
      } else {
        localStorage.removeItem('adminProducts');
      }

      return {
        ...state,
        products: updatedProducts,
        adminProducts: updatedAdminProducts,
        lastUpdated: new Date(),
      };
    }

    case 'LOAD_PRODUCTS': {
      return {
        ...state,
        products: action.payload,
        lastUpdated: new Date(),
      };
    }

    case 'LOAD_ADMIN_PRODUCTS': {
      return {
        ...state,
        adminProducts: action.payload,
        lastUpdated: new Date(),
      };
    }

    default:
      return state;
  }
};

// Product Context interface
interface ProductContextType {
  state: ProductState;
  addProduct: (productData: any, images: File[]) => void;
  updateProduct: (id: number, updates: Partial<AdminProduct>) => void;
  deleteProduct: (id: number) => void;
  getProducts: () => Product[];
  getAdminProducts: () => AdminProduct[];
}

// Create context
const ProductContext = createContext<ProductContextType | undefined>(undefined);

// Product Provider component
export const ProductProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(productReducer, initialState);

  // Load initial products from service
  useEffect(() => {
    try {
      const initialProducts = getAllProducts();
      dispatch({ type: 'LOAD_PRODUCTS', payload: initialProducts });
    } catch (error) {
      console.error('Error loading initial products:', error);
    }
  }, []);

  // Load admin products from localStorage on mount
  useEffect(() => {
    const savedAdminProducts = localStorage.getItem('adminProducts');
    if (savedAdminProducts) {
      try {
        const adminProducts = JSON.parse(savedAdminProducts);
        dispatch({ type: 'LOAD_ADMIN_PRODUCTS', payload: adminProducts });
      } catch (error) {
        console.error('Error loading admin products from localStorage:', error);
        // Clear corrupted data
        localStorage.removeItem('adminProducts');
      }
    }
  }, []);

  // Save admin products to localStorage whenever they change
  useEffect(() => {
    if (state.adminProducts.length > 0) {
      localStorage.setItem('adminProducts', JSON.stringify(state.adminProducts));
    }
  }, [state.adminProducts]);

  const addProduct = (productData: any, images: File[]) => {
    try {
      // Convert File objects to base64 strings for storage
      const imagePromises = images.map(file => {
        return new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (e) => resolve(e.target?.result as string);
          reader.onerror = () => reject(new Error('Failed to read file'));
          reader.readAsDataURL(file);
        });
      });

      Promise.all(imagePromises).then(imageUrls => {
        const newProduct = formDataToProduct(productData, imageUrls);
        dispatch({ type: 'ADD_PRODUCT', payload: newProduct });
      }).catch(error => {
        console.error('Error processing images:', error);
        throw error;
      });
    } catch (error) {
      console.error('Error adding product:', error);
      throw error;
    }
  };

  const updateProduct = (id: number, updates: Partial<AdminProduct>) => {
    dispatch({ type: 'UPDATE_PRODUCT', payload: { id, updates } });
  };

  const deleteProduct = (id: number) => {
    dispatch({ type: 'DELETE_PRODUCT', payload: id });
  };

  const getProducts = (): Product[] => {
    return state.products;
  };

  const getAdminProducts = (): AdminProduct[] => {
    return state.adminProducts;
  };

  const value: ProductContextType = {
    state,
    addProduct,
    updateProduct,
    deleteProduct,
    getProducts,
    getAdminProducts,
  };

  return (
    <ProductContext.Provider value={value}>
      {children}
    </ProductContext.Provider>
  );
};

// Custom hook to use product context
export const useProducts = () => {
  const context = useContext(ProductContext);
  if (context === undefined) {
    throw new Error('useProducts must be used within a ProductProvider');
  }
  return context;
};
