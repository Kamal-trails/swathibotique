import React, { createContext, useContext, useReducer, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { Product } from '@/types/product';
import { useAuth } from './AuthContext';
import {
  getUserFavorites,
  addToFavoritesDB,
  removeFromFavoritesDB,
} from '@/services/userActivitiesService';

// Favorites State interface
interface FavoritesState {
  items: Product[];
  count: number;
  isLoading: boolean;
  isSyncing: boolean;
}

// Favorites Actions
type FavoritesAction =
  | { type: 'ADD_TO_FAVORITES'; payload: Product }
  | { type: 'REMOVE_FROM_FAVORITES'; payload: number }
  | { type: 'CLEAR_FAVORITES' }
  | { type: 'LOAD_FAVORITES'; payload: Product[] }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_SYNCING'; payload: boolean };

// Initial state
const initialState: FavoritesState = {
  items: [],
  count: 0,
  isLoading: false,
  isSyncing: false,
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
        ...state,
        items: updatedItems,
        count: updatedItems.length,
      };
    }

    case 'REMOVE_FROM_FAVORITES': {
      const updatedItems = state.items.filter(item => item.id !== action.payload);
      return {
        ...state,
        items: updatedItems,
        count: updatedItems.length,
      };
    }

    case 'CLEAR_FAVORITES':
      return { ...initialState };

    case 'LOAD_FAVORITES': {
      return {
        ...state,
        items: action.payload,
        count: action.payload.length,
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

// Favorites Context interface
interface FavoritesContextType {
  state: FavoritesState;
  addToFavorites: (product: Product) => Promise<void>;
  removeFromFavorites: (id: number) => Promise<void>;
  clearFavorites: () => void;
  isFavorite: (id: number) => boolean;
  toggleFavorite: (product: Product) => Promise<void>;
  refreshFavorites: () => Promise<void>;
}

// Create context
const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

// Favorites Provider component
export const FavoritesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(favoritesReducer, initialState);
  const { user } = useAuth();
  const hasMergedRef = useRef(false);
  const isInitializedRef = useRef(false);

  // Load favorites from localStorage (for guests) or database (for authenticated users)
  const loadFavorites = async () => {
    if (user) {
      // Load from database
      console.log('📥 Loading favorites from database for user:', user.id);
      dispatch({ type: 'SET_LOADING', payload: true });
      
      try {
        const favorites = await getUserFavorites(user.id);
        console.log('✅ Loaded favorites from database:', favorites.length);
        dispatch({ type: 'LOAD_FAVORITES', payload: favorites });
      } catch (error) {
        console.error('❌ Error loading favorites from database:', error);
        toast.error('Failed to load favorites');
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    } else {
      // Load from localStorage (guest user)
      console.log('📥 Loading favorites from localStorage (guest)');
      const savedFavorites = localStorage.getItem('favorites');
      if (savedFavorites) {
        try {
          const favorites = JSON.parse(savedFavorites);
          dispatch({ type: 'LOAD_FAVORITES', payload: favorites });
        } catch (error) {
          console.error('Error loading favorites from localStorage:', error);
        }
      }
    }
  };

  // Merge localStorage favorites to database on login
  const mergeLocalStorageToDatabase = async () => {
    if (!user || hasMergedRef.current) return;

    console.log('🔄 Merging localStorage favorites to database...');
    dispatch({ type: 'SET_SYNCING', payload: true });

    const localFavorites = localStorage.getItem('favorites');
    if (localFavorites) {
      try {
        const favorites: Product[] = JSON.parse(localFavorites);
        
        if (favorites.length > 0) {
          console.log(`📤 Merging ${favorites.length} favorites to database...`);
          
          // Add each favorite to database
          const promises = favorites.map(product => 
            addToFavoritesDB(user.id, product)
          );
          
          await Promise.all(promises);
          
          console.log('✅ Favorites merged successfully');
          toast.success(`${favorites.length} favorites synced to your account!`);
          
          // Clear localStorage after successful merge
          localStorage.removeItem('favorites');
        }
        
        hasMergedRef.current = true;
      } catch (error) {
        console.error('❌ Error merging favorites:', error);
        toast.error('Failed to sync favorites');
      }
    } else {
      hasMergedRef.current = true;
    }
    
    dispatch({ type: 'SET_SYNCING', payload: false });
  };

  // Initial load on mount
  useEffect(() => {
    if (!isInitializedRef.current) {
      loadFavorites();
      isInitializedRef.current = true;
    }
  }, []);

  // Handle user login/logout
  useEffect(() => {
    const handleUserChange = async () => {
      if (user) {
        // User logged in
        console.log('👤 User logged in, syncing favorites...');
        
        // First merge any localStorage favorites
        await mergeLocalStorageToDatabase();
        
        // Then load from database
        await loadFavorites();
      } else {
        // User logged out
        console.log('👋 User logged out, loading guest favorites...');
        hasMergedRef.current = false;
        await loadFavorites();
      }
    };

    if (isInitializedRef.current) {
      handleUserChange();
    }
  }, [user?.id]); // Only trigger on user ID change

  // Save to localStorage for guests (not for authenticated users)
  useEffect(() => {
    if (!user && state.items.length >= 0) {
      localStorage.setItem('favorites', JSON.stringify(state.items));
    }
  }, [state.items, user]);

  // Add to favorites
  const addToFavorites = async (product: Product) => {
    // Optimistic update
    dispatch({ type: 'ADD_TO_FAVORITES', payload: product });
    
    if (user) {
      // Save to database
      try {
        const success = await addToFavoritesDB(user.id, product);
        if (success) {
          console.log('✅ Added to favorites in database:', product.name);
          toast.success(`${product.name} added to favorites!`);
        } else {
          // Rollback on failure
          dispatch({ type: 'REMOVE_FROM_FAVORITES', payload: product.id });
          toast.error('Failed to add to favorites');
        }
      } catch (error) {
        console.error('❌ Error adding to favorites:', error);
        // Rollback on error
        dispatch({ type: 'REMOVE_FROM_FAVORITES', payload: product.id });
        toast.error('Failed to add to favorites');
      }
    } else {
      // Guest user - just show toast
      toast.success(`${product.name} added to favorites!`);
    }
  };

  // Remove from favorites
  const removeFromFavorites = async (id: number) => {
    const product = state.items.find(item => item.id === id);
    
    // Optimistic update
    dispatch({ type: 'REMOVE_FROM_FAVORITES', payload: id });
    
    if (user) {
      // Remove from database
      try {
        const success = await removeFromFavoritesDB(user.id, id);
        if (success) {
          console.log('✅ Removed from favorites in database:', id);
          if (product) {
            toast.success(`${product.name} removed from favorites!`);
          }
        } else {
          // Rollback on failure
          if (product) {
            dispatch({ type: 'ADD_TO_FAVORITES', payload: product });
          }
          toast.error('Failed to remove from favorites');
        }
      } catch (error) {
        console.error('❌ Error removing from favorites:', error);
        // Rollback on error
        if (product) {
          dispatch({ type: 'ADD_TO_FAVORITES', payload: product });
        }
        toast.error('Failed to remove from favorites');
      }
    } else {
      // Guest user - just show toast
      if (product) {
        toast.success(`${product.name} removed from favorites!`);
      }
    }
  };

  // Clear all favorites
  const clearFavorites = () => {
    dispatch({ type: 'CLEAR_FAVORITES' });
    if (!user) {
      localStorage.removeItem('favorites');
    }
  };

  // Check if product is in favorites
  const isFavorite = (id: number): boolean => {
    return state.items.some(item => item.id === id);
  };

  // Toggle favorite
  const toggleFavorite = async (product: Product) => {
    if (isFavorite(product.id)) {
      await removeFromFavorites(product.id);
    } else {
      await addToFavorites(product);
    }
  };

  // Refresh favorites from database
  const refreshFavorites = async () => {
    await loadFavorites();
  };

  const value: FavoritesContextType = {
    state,
    addToFavorites,
    removeFromFavorites,
    clearFavorites,
    isFavorite,
    toggleFavorite,
    refreshFavorites,
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
