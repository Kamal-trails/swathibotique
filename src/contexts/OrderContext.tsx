import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'sonner';
import { useAuth } from './AuthContext';
import {
  Order,
  ShippingAddress,
  OrderStatus,
  getUserOrders,
  getOrderById,
  getOrderByNumber,
  createOrder as createOrderService,
  getOrderStatusHistory,
  OrderStatusHistoryEntry,
} from '@/services/userActivitiesService';

// Order Context interface
interface OrderContextType {
  orders: Order[];
  isLoading: boolean;
  error: string | null;
  currentOrder: Order | null;
  orderStatusHistory: OrderStatusHistoryEntry[];
  
  // Actions
  loadOrders: () => Promise<void>;
  loadOrderById: (orderId: string) => Promise<void>;
  loadOrderByNumber: (orderNumber: string) => Promise<void>;
  createOrder: (
    shippingAddress: ShippingAddress,
    billingAddress: ShippingAddress,
    paymentMethod: string,
    customerNotes?: string
  ) => Promise<{ success: boolean; orderId?: string; orderNumber?: string }>;
  loadOrderStatusHistory: (orderId: string) => Promise<void>;
  refreshOrders: () => Promise<void>;
}

// Create context
const OrderContext = createContext<OrderContextType | undefined>(undefined);

// Order Provider component
export const OrderProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);
  const [orderStatusHistory, setOrderStatusHistory] = useState<OrderStatusHistoryEntry[]>([]);
  
  const { user } = useAuth();

  // Load user's orders
  const loadOrders = async () => {
    if (!user) {
      setOrders([]);
      return;
    }

    console.log('📦 Loading orders for user:', user.id);
    setIsLoading(true);
    setError(null);

    try {
      const userOrders = await getUserOrders(user.id);
      console.log('✅ Loaded orders:', userOrders.length);
      setOrders(userOrders);
    } catch (err) {
      console.error('❌ Error loading orders:', err);
      setError('Failed to load orders');
      toast.error('Failed to load orders');
    } finally {
      setIsLoading(false);
    }
  };

  // Load single order by ID
  const loadOrderById = async (orderId: string) => {
    console.log('📦 Loading order by ID:', orderId);
    setIsLoading(true);
    setError(null);

    try {
      const order = await getOrderById(orderId);
      if (order) {
        console.log('✅ Loaded order:', order.order_number);
        setCurrentOrder(order);
      } else {
        setError('Order not found');
        toast.error('Order not found');
      }
    } catch (err) {
      console.error('❌ Error loading order:', err);
      setError('Failed to load order');
      toast.error('Failed to load order');
    } finally {
      setIsLoading(false);
    }
  };

  // Load single order by number
  const loadOrderByNumber = async (orderNumber: string) => {
    console.log('📦 Loading order by number:', orderNumber);
    setIsLoading(true);
    setError(null);

    try {
      const order = await getOrderByNumber(orderNumber);
      if (order) {
        console.log('✅ Loaded order:', order.order_number);
        setCurrentOrder(order);
      } else {
        setError('Order not found');
        toast.error('Order not found');
      }
    } catch (err) {
      console.error('❌ Error loading order:', err);
      setError('Failed to load order');
      toast.error('Failed to load order');
    } finally {
      setIsLoading(false);
    }
  };

  // Create order from cart
  const createOrder = async (
    shippingAddress: ShippingAddress,
    billingAddress: ShippingAddress,
    paymentMethod: string,
    customerNotes?: string
  ) => {
    if (!user) {
      toast.error('Please login to place an order');
      return { success: false };
    }

    console.log('🛒 Creating order for user:', user.id);
    setIsLoading(true);
    setError(null);

    try {
      const result = await createOrderService(
        user.id,
        shippingAddress,
        billingAddress,
        paymentMethod,
        customerNotes
      );

      if (result.success) {
        console.log('✅ Order created:', result.orderNumber);
        toast.success(`Order ${result.orderNumber} placed successfully!`);
        
        // Refresh orders list
        await loadOrders();
        
        return result;
      } else {
        setError('Failed to create order');
        toast.error('Failed to create order');
        return { success: false };
      }
    } catch (err) {
      console.error('❌ Error creating order:', err);
      setError('Failed to create order');
      toast.error('Failed to create order');
      return { success: false };
    } finally {
      setIsLoading(false);
    }
  };

  // Load order status history
  const loadOrderStatusHistory = async (orderId: string) => {
    console.log('📋 Loading order status history:', orderId);
    
    try {
      const history = await getOrderStatusHistory(orderId);
      console.log('✅ Loaded status history:', history.length, 'entries');
      setOrderStatusHistory(history);
    } catch (err) {
      console.error('❌ Error loading status history:', err);
      toast.error('Failed to load order history');
    }
  };

  // Refresh orders
  const refreshOrders = async () => {
    await loadOrders();
  };

  // Load orders when user logs in
  useEffect(() => {
    if (user) {
      loadOrders();
    } else {
      setOrders([]);
      setCurrentOrder(null);
      setOrderStatusHistory([]);
    }
  }, [user?.id]);

  const value: OrderContextType = {
    orders,
    isLoading,
    error,
    currentOrder,
    orderStatusHistory,
    loadOrders,
    loadOrderById,
    loadOrderByNumber,
    createOrder,
    loadOrderStatusHistory,
    refreshOrders,
  };

  return (
    <OrderContext.Provider value={value}>
      {children}
    </OrderContext.Provider>
  );
};

// Custom hook to use order context
export const useOrders = () => {
  const context = useContext(OrderContext);
  if (context === undefined) {
    throw new Error('useOrders must be used within an OrderProvider');
  }
  return context;
};

