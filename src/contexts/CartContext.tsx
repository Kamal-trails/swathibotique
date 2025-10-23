import React, { createContext, useContext, useReducer, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { Product } from '@/types/product';
import { useAuth } from './AuthContext';
import {
  getUserCart,
  addToCartDB,
  updateCartQuantityDB,
  removeFromCartDB,
  clearCartDB,
  mergeGuestCartToUserCart,
} from '@/services/userActivitiesService';

// Cart Item interface
export interface CartItem {
  id: number;
  name: string;
  price: number;
  image: string;
  category: string;
  size?: string;
  color?: string;
  quantity: number;
}

// Cart State interface
interface CartState {
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
  isLoading: boolean;
  isSyncing: boolean;
}

// Cart Actions
type CartAction =
  | { type: 'ADD_TO_CART'; payload: Omit<CartItem, 'quantity'> }
  | { type: 'REMOVE_FROM_CART'; payload: number }
  | { type: 'UPDATE_QUANTITY'; payload: { id: number; quantity: number } }
  | { type: 'CLEAR_CART' }
  | { type: 'LOAD_CART'; payload: CartItem[] }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_SYNCING'; payload: boolean };

// Initial state
const initialState: CartState = {
  items: [],
  totalItems: 0,
  totalPrice: 0,
  isLoading: false,
  isSyncing: false,
};

// Cart reducer
const cartReducer = (state: CartState, action: CartAction): CartState => {
  switch (action.type) {
    case 'ADD_TO_CART': {
      const existingItem = state.items.find(item => 
        item.id === action.payload.id && 
        item.size === action.payload.size && 
        item.color === action.payload.color
      );

      if (existingItem) {
        const updatedItems = state.items.map(item =>
          item.id === existingItem.id && 
          item.size === existingItem.size && 
          item.color === existingItem.color
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
        return {
          ...state,
          items: updatedItems,
          totalItems: updatedItems.reduce((sum, item) => sum + item.quantity, 0),
          totalPrice: updatedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0),
        };
      } else {
        const newItem = { ...action.payload, quantity: 1 };
        const updatedItems = [...state.items, newItem];
        return {
          ...state,
          items: updatedItems,
          totalItems: updatedItems.reduce((sum, item) => sum + item.quantity, 0),
          totalPrice: updatedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0),
        };
      }
    }

    case 'REMOVE_FROM_CART': {
      const updatedItems = state.items.filter(item => item.id !== action.payload);
      return {
        ...state,
        items: updatedItems,
        totalItems: updatedItems.reduce((sum, item) => sum + item.quantity, 0),
        totalPrice: updatedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0),
      };
    }

    case 'UPDATE_QUANTITY': {
      if (action.payload.quantity < 1) {
        return state;
      }
      
      const updatedItems = state.items.map(item =>
        item.id === action.payload.id
          ? { ...item, quantity: action.payload.quantity }
          : item
      );
      
      return {
        ...state,
        items: updatedItems,
        totalItems: updatedItems.reduce((sum, item) => sum + item.quantity, 0),
        totalPrice: updatedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0),
      };
    }

    case 'CLEAR_CART':
      return { ...initialState };

    case 'LOAD_CART': {
      return {
        ...state,
        items: action.payload,
        totalItems: action.payload.reduce((sum, item) => sum + item.quantity, 0),
        totalPrice: action.payload.reduce((sum, item) => sum + (item.price * item.quantity), 0),
        isLoading: false,
      };
    }

    case 'SET_LOADING': {
      return {
        ...state,
        isLoading: action.payload,
      };
    }

    case 'SET_SYNCING': {
      return {
        ...state,
        isSyncing: action.payload,
      };
    }

    default:
      return state;
  }
};

// Cart Context interface
interface CartContextType {
  state: CartState;
  addToCart: (product: Product, size?: string, color?: string) => Promise<void>;
  removeFromCart: (id: number) => Promise<void>;
  updateQuantity: (id: number, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  isInCart: (id: number, size?: string, color?: string) => boolean;
  refreshCart: () => Promise<void>;
}

// Create context
const CartContext = createContext<CartContextType | undefined>(undefined);

// Cart Provider component
export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState);
  const { user } = useAuth();
  const hasMergedRef = useRef(false);
  const isInitializedRef = useRef(false);

  // Load cart from localStorage (for guests) or database (for authenticated users)
  const loadCart = async () => {
    if (user) {
      // Load from database
      console.log('🛒 Loading cart from database for user:', user.id);
      dispatch({ type: 'SET_LOADING', payload: true });
      
      try {
        const cartItems = await getUserCart(user.id);
        console.log('✅ Loaded cart from database:', cartItems.length, 'items');
        dispatch({ type: 'LOAD_CART', payload: cartItems });
      } catch (error) {
        console.error('❌ Error loading cart from database:', error);
        toast.error('Failed to load cart');
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    } else {
      // Load from localStorage (guest user)
      console.log('🛒 Loading cart from localStorage (guest)');
      const savedCart = localStorage.getItem('cart');
      if (savedCart) {
        try {
          const cartItems = JSON.parse(savedCart);
          dispatch({ type: 'LOAD_CART', payload: cartItems });
        } catch (error) {
          console.error('Error loading cart from localStorage:', error);
        }
      }
    }
  };

  // Merge localStorage cart to database on login
  const mergeLocalStorageToDatabase = async () => {
    if (!user || hasMergedRef.current) return;

    console.log('🔄 Merging localStorage cart to database...');
    dispatch({ type: 'SET_SYNCING', payload: true });

    const localCart = localStorage.getItem('cart');
    if (localCart) {
      try {
        const cartItems: CartItem[] = JSON.parse(localCart);
        
        if (cartItems.length > 0) {
          console.log(`📤 Merging ${cartItems.length} cart items to database...`);
          
          const success = await mergeGuestCartToUserCart(user.id, cartItems);
          
          if (success) {
            console.log('✅ Cart merged successfully');
            toast.success(`${cartItems.length} items synced to your cart!`);
            
            // Clear localStorage after successful merge
            localStorage.removeItem('cart');
          }
        }
        
        hasMergedRef.current = true;
      } catch (error) {
        console.error('❌ Error merging cart:', error);
        toast.error('Failed to sync cart');
      }
    } else {
      hasMergedRef.current = true;
    }
    
    dispatch({ type: 'SET_SYNCING', payload: false });
  };

  // Initial load on mount
  useEffect(() => {
    if (!isInitializedRef.current) {
      loadCart();
      isInitializedRef.current = true;
    }
  }, []);

  // Handle user login/logout
  useEffect(() => {
    const handleUserChange = async () => {
      if (user) {
        // User logged in
        console.log('👤 User logged in, syncing cart...');
        
        // First merge any localStorage cart
        await mergeLocalStorageToDatabase();
        
        // Then load from database
        await loadCart();
      } else {
        // User logged out
        console.log('👋 User logged out, loading guest cart...');
        hasMergedRef.current = false;
        await loadCart();
      }
    };

    if (isInitializedRef.current) {
      handleUserChange();
    }
  }, [user?.id]); // Only trigger on user ID change

  // Save to localStorage for guests (not for authenticated users)
  useEffect(() => {
    if (!user && state.items.length >= 0) {
      localStorage.setItem('cart', JSON.stringify(state.items));
    }
  }, [state.items, user]);

  // Add to cart
  const addToCart = async (product: Product, size?: string, color?: string) => {
    const cartItem: Omit<CartItem, 'quantity'> = {
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      category: product.category,
      size,
      color,
    };
    
    // Optimistic update
    dispatch({ type: 'ADD_TO_CART', payload: cartItem });
    
    if (user) {
      // Save to database
      try {
        const success = await addToCartDB(user.id, product, size, color, 1);
        if (success) {
          console.log('✅ Added to cart in database:', product.name);
          toast.success(`${product.name} added to cart!`);
        } else {
          // Rollback on failure
          dispatch({ type: 'REMOVE_FROM_CART', payload: product.id });
          toast.error('Failed to add to cart');
        }
      } catch (error) {
        console.error('❌ Error adding to cart:', error);
        // Rollback on error
        dispatch({ type: 'REMOVE_FROM_CART', payload: product.id });
        toast.error('Failed to add to cart');
      }
    } else {
      // Guest user - just show toast
      toast.success(`${product.name} added to cart!`);
    }
  };

  // Remove from cart
  const removeFromCart = async (id: number) => {
    const item = state.items.find(item => item.id === id);
    
    // Optimistic update
    dispatch({ type: 'REMOVE_FROM_CART', payload: id });
    
    if (user && item) {
      // Remove from database
      try {
        const success = await removeFromCartDB(user.id, id, item.size, item.color);
        if (success) {
          console.log('✅ Removed from cart in database:', id);
        } else {
          // Rollback on failure
          dispatch({ type: 'ADD_TO_CART', payload: item });
          toast.error('Failed to remove from cart');
        }
      } catch (error) {
        console.error('❌ Error removing from cart:', error);
        // Rollback on error
        dispatch({ type: 'ADD_TO_CART', payload: item });
        toast.error('Failed to remove from cart');
      }
    }
  };

  // Update quantity
  const updateQuantity = async (id: number, quantity: number) => {
    const oldItem = state.items.find(item => item.id === id);
    
    // Optimistic update
    dispatch({ type: 'UPDATE_QUANTITY', payload: { id, quantity } });
    
    if (user && oldItem) {
      // Update in database
      try {
        const success = await updateCartQuantityDB(user.id, id, quantity, oldItem.size, oldItem.color);
        if (!success) {
          // Rollback on failure
          dispatch({ type: 'UPDATE_QUANTITY', payload: { id, quantity: oldItem.quantity } });
          toast.error('Failed to update quantity');
        }
      } catch (error) {
        console.error('❌ Error updating quantity:', error);
        // Rollback on error
        dispatch({ type: 'UPDATE_QUANTITY', payload: { id, quantity: oldItem.quantity } });
        toast.error('Failed to update quantity');
      }
    }
  };

  // Clear cart
  const clearCart = async () => {
    const oldItems = state.items;
    
    // Optimistic update
    dispatch({ type: 'CLEAR_CART' });
    
    if (user) {
      // Clear in database
      try {
        const success = await clearCartDB(user.id);
        if (!success) {
          // Rollback on failure
          dispatch({ type: 'LOAD_CART', payload: oldItems });
          toast.error('Failed to clear cart');
        }
      } catch (error) {
        console.error('❌ Error clearing cart:', error);
        // Rollback on error
        dispatch({ type: 'LOAD_CART', payload: oldItems });
        toast.error('Failed to clear cart');
      }
    } else {
      localStorage.removeItem('cart');
    }
  };

  // Check if item is in cart
  const isInCart = (id: number, size?: string, color?: string): boolean => {
    return state.items.some(item => 
      item.id === id && 
      item.size === size && 
      item.color === color
    );
  };

  // Refresh cart from database
  const refreshCart = async () => {
    await loadCart();
  };

  const value: CartContextType = {
    state,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    isInCart,
    refreshCart,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

// Custom hook to use cart context
export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
