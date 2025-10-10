import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { toast } from 'sonner';
import { Product } from '@/types/product';

// Favorites State interface
interface FavoritesState {
  items: Product[];
  count: number;
}

// Favorites Actions
type FavoritesAction =
  | { type: 'ADD_TO_FAVORITES'; payload: Product }
  | { type: 'REMOVE_FROM_FAVORITES'; payload: number }
  | { type: 'CLEAR_FAVORITES' }
  | { type: 'LOAD_FAVORITES'; payload: Product[] };

// Initial state
const initialState: FavoritesState = {
  items: [],
  count: 0,
};

// Favorites reducer
const favoritesReducer = (state: FavoritesState, action: FavoritesAction): FavoritesState => {
  switch (action.type) {
    case 'ADD_TO_FAVORITES': {
      const existingItem = state.items.find(item => item.id === action.payload.id);
      
      if (existingItem) {
        return state; // Item already in favorites
      }
      
      const updatedItems = [...state.items, action.payload];
      return {
        items: updatedItems,
        count: updatedItems.length,
      };
    }

    case 'REMOVE_FROM_FAVORITES': {
      const updatedItems = state.items.filter(item => item.id !== action.payload);
      return {
        items: updatedItems,
        count: updatedItems.length,
      };
    }

    case 'CLEAR_FAVORITES':
      return initialState;

    case 'LOAD_FAVORITES': {
      return {
        items: action.payload,
        count: action.payload.length,
      };
    }

    default:
      return state;
  }
};

// Favorites Context interface
interface FavoritesContextType {
  state: FavoritesState;
  addToFavorites: (product: Product) => void;
  removeFromFavorites: (id: number) => void;
  clearFavorites: () => void;
  isFavorite: (id: number) => boolean;
  toggleFavorite: (product: Product) => void;
}

// Create context
const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

// Favorites Provider component
export const FavoritesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(favoritesReducer, initialState);

  // Load favorites from localStorage on mount
  useEffect(() => {
    const savedFavorites = localStorage.getItem('favorites');
    if (savedFavorites) {
      try {
        const favorites = JSON.parse(savedFavorites);
        dispatch({ type: 'LOAD_FAVORITES', payload: favorites });
      } catch (error) {
        console.error('Error loading favorites from localStorage:', error);
      }
    }
  }, []);

  // Save favorites to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('favorites', JSON.stringify(state.items));
  }, [state.items]);

  const addToFavorites = (product: Product) => {
    dispatch({ type: 'ADD_TO_FAVORITES', payload: product });
    toast.success(`${product.name} added to favorites!`);
  };

  const removeFromFavorites = (id: number) => {
    const product = state.items.find(item => item.id === id);
    dispatch({ type: 'REMOVE_FROM_FAVORITES', payload: id });
    if (product) {
      toast.success(`${product.name} removed from favorites!`);
    }
  };

  const clearFavorites = () => {
    dispatch({ type: 'CLEAR_FAVORITES' });
  };

  const isFavorite = (id: number): boolean => {
    return state.items.some(item => item.id === id);
  };

  const toggleFavorite = (product: Product) => {
    if (isFavorite(product.id)) {
      removeFromFavorites(product.id);
    } else {
      addToFavorites(product);
    }
  };

  const value: FavoritesContextType = {
    state,
    addToFavorites,
    removeFromFavorites,
    clearFavorites,
    isFavorite,
    toggleFavorite,
  };

  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  );
};

// Custom hook to use favorites context
export const useFavorites = () => {
  const context = useContext(FavoritesContext);
  if (context === undefined) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
};
