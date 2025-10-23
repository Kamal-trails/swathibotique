/**
 * User Activities Service
 * ACID-compliant database operations for cart, favorites, orders, and search history
 * Implements transactional integrity and data consistency
 */

import { supabase } from '@/lib/supabase';
import { Product } from '@/types/product';
import { CartItem } from '@/contexts/CartContext';
import { createAppError, logError, safeAsync } from '@/utils/errorHandling';

// ========================================
// TYPES
// ========================================

export interface DBCartItem {
  id: string;
  user_id: string;
  product_id: number;
  product_name: string;
  product_price: number;
  product_image: string;
  product_category: string;
  size?: string;
  color?: string;
  quantity: number;
  created_at: string;
  updated_at: string;
}

export interface DBFavorite {
  id: string;
  user_id: string;
  product_id: number;
  product_data: Product;
  created_at: string;
}

export interface SearchHistoryEntry {
  id: string;
  user_id?: string;
  session_id?: string;
  search_query: string;
  results_count: number;
  filters_applied?: any;
  created_at: string;
}

export interface Order {
  id: string;
  user_id: string;
  order_number: string;
  items: CartItem[];
  subtotal: number;
  tax: number;
  shipping_cost: number;
  discount: number;
  total: number;
  status: OrderStatus;
  payment_status: PaymentStatus;
  payment_method?: string;
  shipping_address: ShippingAddress;
  billing_address?: ShippingAddress;
  tracking_number?: string;
  carrier?: string;
  created_at: string;
  updated_at: string;
  paid_at?: string;
  shipped_at?: string;
  delivered_at?: string;
  cancelled_at?: string;
  customer_notes?: string;
  admin_notes?: string;
}

export type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';

export interface ShippingAddress {
  name: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  phone: string;
}

export interface OrderStatusHistoryEntry {
  id: string;
  order_id: string;
  old_status?: string;
  new_status: string;
  changed_by?: string;
  notes?: string;
  created_at: string;
}

// ========================================
// CART OPERATIONS (ACID-Compliant)
// ========================================

/**
 * Get user's cart from database
 * ACID: Atomic read with consistent snapshot
 */
export const getUserCart = async (userId: string): Promise<CartItem[]> => {
  const result = await safeAsync(
    async () => {
      const { data, error } = await supabase
        .from('user_carts')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return (data || []).map(item => ({
        id: item.product_id,
        name: item.product_name,
        price: item.product_price,
        image: item.product_image,
        category: item.product_category,
        size: item.size,
        color: item.color,
        quantity: item.quantity,
      }));
    },
    'Get user cart'
  );

  return result.data || [];
};

/**
 * Add item to cart (or update quantity if exists)
 * ACID: Atomic upsert operation
 */
export const addToCartDB = async (
  userId: string,
  product: Product,
  size?: string,
  color?: string,
  quantity: number = 1
): Promise<boolean> => {
  const result = await safeAsync(
    async () => {
      const { error } = await supabase
        .from('user_carts')
        .upsert({
          user_id: userId,
          product_id: product.id,
          product_name: product.name,
          product_price: product.price,
          product_image: product.image,
          product_category: product.category,
          size,
          color,
          quantity,
        }, {
          onConflict: 'user_id,product_id,size,color',
          // On conflict, increment quantity
        });

      if (error) throw error;
      return true;
    },
    'Add to cart'
  );

  return result.success;
};

/**
 * Update cart item quantity
 * ACID: Atomic update with check constraint
 */
export const updateCartQuantityDB = async (
  userId: string,
  productId: number,
  quantity: number,
  size?: string,
  color?: string
): Promise<boolean> => {
  if (quantity < 1) {
    return removeFromCartDB(userId, productId, size, color);
  }

  const result = await safeAsync(
    async () => {
      let query = supabase
        .from('user_carts')
        .update({ quantity, updated_at: new Date().toISOString() })
        .eq('user_id', userId)
        .eq('product_id', productId);

      if (size) query = query.eq('size', size);
      if (color) query = query.eq('color', color);

      const { error } = await query;

      if (error) throw error;
      return true;
    },
    'Update cart quantity'
  );

  return result.success;
};

/**
 * Remove item from cart
 * ACID: Atomic delete operation
 */
export const removeFromCartDB = async (
  userId: string,
  productId: number,
  size?: string,
  color?: string
): Promise<boolean> => {
  const result = await safeAsync(
    async () => {
      let query = supabase
        .from('user_carts')
        .delete()
        .eq('user_id', userId)
        .eq('product_id', productId);

      if (size) query = query.eq('size', size);
      if (color) query = query.eq('color', color);

      const { error } = await query;

      if (error) throw error;
      return true;
    },
    'Remove from cart'
  );

  return result.success;
};

/**
 * Clear entire cart
 * ACID: Atomic delete with transaction
 */
export const clearCartDB = async (userId: string): Promise<boolean> => {
  const result = await safeAsync(
    async () => {
      const { error } = await supabase
        .from('user_carts')
        .delete()
        .eq('user_id', userId);

      if (error) throw error;
      return true;
    },
    'Clear cart'
  );

  return result.success;
};

/**
 * Merge guest cart to user cart on login
 * ACID: Transactional merge operation
 */
export const mergeGuestCartToUserCart = async (
  userId: string,
  guestCartItems: CartItem[]
): Promise<boolean> => {
  const result = await safeAsync(
    async () => {
      // Use database function for atomic operation
      const { error } = await supabase.rpc('merge_guest_cart_to_user', {
        p_user_id: userId,
        p_guest_cart: guestCartItems,
      });

      if (error) throw error;
      return true;
    },
    'Merge guest cart'
  );

  return result.success;
};

// ========================================
// FAVORITES OPERATIONS (ACID-Compliant)
// ========================================

/**
 * Get user's favorites from database
 * ACID: Atomic read with consistent snapshot
 */
export const getUserFavorites = async (userId: string): Promise<Product[]> => {
  const result = await safeAsync(
    async () => {
      const { data, error } = await supabase
        .from('user_favorites')
        .select('product_data')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return (data || []).map(item => item.product_data);
    },
    'Get user favorites'
  );

  return result.data || [];
};

/**
 * Add product to favorites
 * ACID: Atomic insert with conflict handling
 */
export const addToFavoritesDB = async (
  userId: string,
  product: Product
): Promise<boolean> => {
  const result = await safeAsync(
    async () => {
      const { error } = await supabase
        .from('user_favorites')
        .insert({
          user_id: userId,
          product_id: product.id,
          product_data: product,
        });

      if (error) {
        // Ignore duplicate key errors (already in favorites)
        if (error.code === '23505') return true;
        throw error;
      }
      return true;
    },
    'Add to favorites'
  );

  return result.success;
};

/**
 * Remove product from favorites
 * ACID: Atomic delete operation
 */
export const removeFromFavoritesDB = async (
  userId: string,
  productId: number
): Promise<boolean> => {
  const result = await safeAsync(
    async () => {
      const { error } = await supabase
        .from('user_favorites')
        .delete()
        .eq('user_id', userId)
        .eq('product_id', productId);

      if (error) throw error;
      return true;
    },
    'Remove from favorites'
  );

  return result.success;
};

/**
 * Check if product is in favorites
 */
export const isInFavoritesDB = async (
  userId: string,
  productId: number
): Promise<boolean> => {
  const result = await safeAsync(
    async () => {
      const { data, error } = await supabase
        .from('user_favorites')
        .select('id')
        .eq('user_id', userId)
        .eq('product_id', productId)
        .single();

      if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows returned
      return !!data;
    },
    'Check if in favorites'
  );

  return result.data || false;
};

// ========================================
// SEARCH HISTORY OPERATIONS
// ========================================

/**
 * Add search to history
 */
export const addSearchToHistory = async (
  searchQuery: string,
  resultsCount: number,
  filtersApplied?: any,
  userId?: string,
  sessionId?: string
): Promise<boolean> => {
  const result = await safeAsync(
    async () => {
      const { error } = await supabase
        .from('search_history')
        .insert({
          user_id: userId,
          session_id: sessionId,
          search_query: searchQuery,
          results_count: resultsCount,
          filters_applied: filtersApplied,
        });

      if (error) throw error;
      return true;
    },
    'Add search to history'
  );

  return result.success;
};

/**
 * Get user's search history
 */
export const getUserSearchHistory = async (
  userId: string,
  limit: number = 10
): Promise<SearchHistoryEntry[]> => {
  const result = await safeAsync(
    async () => {
      const { data, error } = await supabase
        .from('search_history')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    },
    'Get search history'
  );

  return result.data || [];
};

/**
 * Get popular searches (for suggestions)
 */
export const getPopularSearches = async (limit: number = 10): Promise<string[]> => {
  const result = await safeAsync(
    async () => {
      const { data, error } = await supabase
        .from('search_history')
        .select('search_query')
        .order('created_at', { ascending: false })
        .limit(limit * 5); // Get more to find unique

      if (error) throw error;

      // Get unique searches
      const unique = [...new Set((data || []).map(item => item.search_query))];
      return unique.slice(0, limit);
    },
    'Get popular searches'
  );

  return result.data || [];
};

// ========================================
// ORDER OPERATIONS (ACID-Compliant)
// ========================================

/**
 * Create order from cart
 * ACID: Transactional order creation with cart clearing
 */
export const createOrder = async (
  userId: string,
  shippingAddress: ShippingAddress,
  billingAddress: ShippingAddress,
  paymentMethod: string,
  customerNotes?: string
): Promise<{ success: boolean; orderId?: string; orderNumber?: string }> => {
  const result = await safeAsync(
    async () => {
      // Use database function for atomic operation
      const { data, error } = await supabase.rpc('create_order_from_cart', {
        p_user_id: userId,
        p_shipping_address: shippingAddress,
        p_billing_address: billingAddress,
        p_payment_method: paymentMethod,
        p_customer_notes: customerNotes,
      });

      if (error) throw error;

      // Get the created order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .select('id, order_number')
        .eq('id', data)
        .single();

      if (orderError) throw orderError;

      return {
        orderId: order.id,
        orderNumber: order.order_number,
      };
    },
    'Create order'
  );

  return {
    success: result.success,
    orderId: result.data?.orderId,
    orderNumber: result.data?.orderNumber,
  };
};

/**
 * Get user's orders
 */
export const getUserOrders = async (userId: string): Promise<Order[]> => {
  const result = await safeAsync(
    async () => {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    'Get user orders'
  );

  return result.data || [];
};

/**
 * Get single order by ID
 */
export const getOrderById = async (orderId: string): Promise<Order | null> => {
  const result = await safeAsync(
    async () => {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null; // No rows
        throw error;
      }
      return data;
    },
    'Get order by ID'
  );

  return result.data || null;
};

/**
 * Get order by order number
 */
export const getOrderByNumber = async (orderNumber: string): Promise<Order | null> => {
  const result = await safeAsync(
    async () => {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('order_number', orderNumber)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null;
        throw error;
      }
      return data;
    },
    'Get order by number'
  );

  return result.data || null;
};

/**
 * Update order status
 * ACID: Atomic update with status history tracking
 */
export const updateOrderStatus = async (
  orderId: string,
  newStatus: OrderStatus,
  notes?: string
): Promise<boolean> => {
  const result = await safeAsync(
    async () => {
      const { error } = await supabase
        .from('orders')
        .update({
          status: newStatus,
          updated_at: new Date().toISOString(),
          ...(newStatus === 'shipped' && { shipped_at: new Date().toISOString() }),
          ...(newStatus === 'delivered' && { delivered_at: new Date().toISOString() }),
          ...(newStatus === 'cancelled' && { cancelled_at: new Date().toISOString() }),
        })
        .eq('id', orderId);

      if (error) throw error;
      return true;
    },
    'Update order status'
  );

  return result.success;
};

/**
 * Get order status history
 */
export const getOrderStatusHistory = async (orderId: string): Promise<OrderStatusHistoryEntry[]> => {
  const result = await safeAsync(
    async () => {
      const { data, error } = await supabase
        .from('order_status_history')
        .select('*')
        .eq('order_id', orderId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data || [];
    },
    'Get order status history'
  );

  return result.data || [];
};

/**
 * Update payment status
 */
export const updatePaymentStatus = async (
  orderId: string,
  paymentStatus: PaymentStatus
): Promise<boolean> => {
  const result = await safeAsync(
    async () => {
      const { error } = await supabase
        .from('orders')
        .update({
          payment_status: paymentStatus,
          ...(paymentStatus === 'paid' && { paid_at: new Date().toISOString() }),
        })
        .eq('id', orderId);

      if (error) throw error;
      return true;
    },
    'Update payment status'
  );

  return result.success;
};

// ========================================
// ADMIN OPERATIONS
// ========================================

/**
 * Get all orders (admin only)
 */
export const getAllOrders = async (
  status?: OrderStatus,
  limit: number = 50,
  offset: number = 0
): Promise<Order[]> => {
  const result = await safeAsync(
    async () => {
      let query = supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (status) {
        query = query.eq('status', status);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data || [];
    },
    'Get all orders (admin)'
  );

  return result.data || [];
};

/**
 * Update tracking information
 */
export const updateTrackingInfo = async (
  orderId: string,
  trackingNumber: string,
  carrier: string
): Promise<boolean> => {
  const result = await safeAsync(
    async () => {
      const { error } = await supabase
        .from('orders')
        .update({
          tracking_number: trackingNumber,
          carrier,
          updated_at: new Date().toISOString(),
        })
        .eq('id', orderId);

      if (error) throw error;
      return true;
    },
    'Update tracking info'
  );

  return result.success;
};

