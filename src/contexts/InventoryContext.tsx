/**
 * Inventory Context - State Management for Inventory System
 * Following Single Responsibility Principle - only inventory state management
 * Following Clean Architecture - depends on inventory service abstraction
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  InventoryItem, 
  StockMovement, 
  InventoryAlert, 
  ReorderSuggestion,
  InventorySettings,
  InventoryAnalytics
} from '@/types/inventory';
import { Product } from '@/types/product';
import {
  getInventoryItems,
  saveInventoryItems,
  getStockMovements,
  saveStockMovements,
  getInventoryAlerts,
  saveInventoryAlerts,
  getInventorySettings,
  saveInventorySettings,
  getReorderSuggestions,
  getInventoryAnalytics,
  createInventoryItem,
  updateStock,
  acknowledgeAlert
} from '@/services/inventoryService';

// Inventory Context State
interface InventoryContextState {
  // Data
  inventoryItems: InventoryItem[];
  stockMovements: StockMovement[];
  alerts: InventoryAlert[];
  settings: InventorySettings;
  reorderSuggestions: ReorderSuggestion[];
  analytics: InventoryAnalytics;
  
  // Loading States
  isLoading: boolean;
  isUpdating: boolean;
  error: string | null;
}

// Inventory Context Actions
interface InventoryContextActions {
  // Inventory Management
  addInventoryItem: (product: Product, inventoryData: Partial<InventoryItem>) => Promise<boolean>;
  updateInventoryItem: (itemId: string, updates: Partial<InventoryItem>) => Promise<boolean>;
  deleteInventoryItem: (itemId: string) => Promise<boolean>;
  
  // Stock Operations
  updateStock: (productId: number, quantity: number, type: 'in' | 'out' | 'adjustment', reason: string, performedBy?: string, notes?: string) => Promise<boolean>;
  adjustStock: (productId: number, newQuantity: number, reason: string, performedBy?: string, notes?: string) => Promise<boolean>;
  reserveStock: (productId: number, quantity: number) => Promise<boolean>;
  releaseReservedStock: (productId: number, quantity: number) => Promise<boolean>;
  
  // Alerts Management
  acknowledgeAlert: (alertId: string, acknowledgedBy: string) => Promise<boolean>;
  dismissAlert: (alertId: string) => Promise<boolean>;
  
  // Settings Management
  updateSettings: (newSettings: Partial<InventorySettings>) => Promise<boolean>;
  
  // Data Refresh
  refreshData: () => Promise<void>;
  refreshAnalytics: () => Promise<void>;
}

// Combined Context Type
type InventoryContextType = InventoryContextState & InventoryContextActions;

// Create Context
const InventoryContext = createContext<InventoryContextType | undefined>(undefined);

// Inventory Provider Props
interface InventoryProviderProps {
  children: ReactNode;
}

// Inventory Provider Component
export const InventoryProvider: React.FC<InventoryProviderProps> = ({ children }) => {
  // State
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [stockMovements, setStockMovements] = useState<StockMovement[]>([]);
  const [alerts, setAlerts] = useState<InventoryAlert[]>([]);
  const [settings, setSettings] = useState<InventorySettings>(getInventorySettings());
  const [reorderSuggestions, setReorderSuggestions] = useState<ReorderSuggestion[]>([]);
  const [analytics, setAnalytics] = useState<InventoryAnalytics>({
    totalProducts: 0,
    totalValue: 0,
    lowStockItems: 0,
    outOfStockItems: 0,
    overstockItems: 0,
    totalMovements: 0,
    topSellingProducts: [],
    slowMovingProducts: [],
    categoryBreakdown: []
  });
  
  // Loading States
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load all inventory data
  const loadInventoryData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const [items, movements, alertsData, suggestions, analyticsData] = await Promise.all([
        Promise.resolve(getInventoryItems()),
        Promise.resolve(getStockMovements()),
        Promise.resolve(getInventoryAlerts()),
        Promise.resolve(getReorderSuggestions()),
        Promise.resolve(getInventoryAnalytics())
      ]);
      
      setInventoryItems(items);
      setStockMovements(movements);
      setAlerts(alertsData);
      setReorderSuggestions(suggestions);
      setAnalytics(analyticsData);
      
      console.log('InventoryContext: Data loaded successfully', {
        items: items.length,
        movements: movements.length,
        alerts: alertsData.length,
        suggestions: suggestions.length
      });
    } catch (err) {
      console.error('InventoryContext: Error loading data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load inventory data');
    } finally {
      setIsLoading(false);
    }
  };

  // Add inventory item
  const addInventoryItem = async (product: Product, inventoryData: Partial<InventoryItem>): Promise<boolean> => {
    try {
      setIsUpdating(true);
      setError(null);
      
      const newItem = createInventoryItem(product, inventoryData);
      const updatedItems = [...inventoryItems, newItem];
      
      setInventoryItems(updatedItems);
      saveInventoryItems(updatedItems);
      
      // Refresh analytics
      await refreshAnalytics();
      
      console.log('InventoryContext: Inventory item added:', newItem.name);
      return true;
    } catch (err) {
      console.error('InventoryContext: Error adding inventory item:', err);
      setError(err instanceof Error ? err.message : 'Failed to add inventory item');
      return false;
    } finally {
      setIsUpdating(false);
    }
  };

  // Update inventory item
  const updateInventoryItem = async (itemId: string, updates: Partial<InventoryItem>): Promise<boolean> => {
    try {
      setIsUpdating(true);
      setError(null);
      
      const updatedItems = inventoryItems.map(item => 
        item.id === itemId 
          ? { ...item, ...updates, updatedAt: new Date() }
          : item
      );
      
      setInventoryItems(updatedItems);
      saveInventoryItems(updatedItems);
      
      // Refresh analytics
      await refreshAnalytics();
      
      console.log('InventoryContext: Inventory item updated:', itemId);
      return true;
    } catch (err) {
      console.error('InventoryContext: Error updating inventory item:', err);
      setError(err instanceof Error ? err.message : 'Failed to update inventory item');
      return false;
    } finally {
      setIsUpdating(false);
    }
  };

  // Delete inventory item
  const deleteInventoryItem = async (itemId: string): Promise<boolean> => {
    try {
      setIsUpdating(true);
      setError(null);
      
      const updatedItems = inventoryItems.filter(item => item.id !== itemId);
      setInventoryItems(updatedItems);
      saveInventoryItems(updatedItems);
      
      // Refresh analytics
      await refreshAnalytics();
      
      console.log('InventoryContext: Inventory item deleted:', itemId);
      return true;
    } catch (err) {
      console.error('InventoryContext: Error deleting inventory item:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete inventory item');
      return false;
    } finally {
      setIsUpdating(false);
    }
  };

  // Update stock
  const updateStockOperation = async (
    productId: number, 
    quantity: number, 
    type: 'in' | 'out' | 'adjustment', 
    reason: string, 
    performedBy: string = 'admin', 
    notes: string = ''
  ): Promise<boolean> => {
    try {
      setIsUpdating(true);
      setError(null);
      
      // Import and use the service function (not recursive!)
      const { updateStock: updateStockService } = await import('@/services/inventoryService');
      const success = updateStockService(productId, quantity, type, reason, performedBy, notes);
      
      if (success) {
        // Refresh data
        await refreshData();
      }
      
      return success;
    } catch (err) {
      console.error('InventoryContext: Error updating stock:', err);
      setError(err instanceof Error ? err.message : 'Failed to update stock');
      return false;
    } finally {
      setIsUpdating(false);
    }
  };

  // Adjust stock
  const adjustStock = async (
    productId: number, 
    newQuantity: number, 
    reason: string, 
    performedBy: string = 'admin', 
    notes: string = ''
  ): Promise<boolean> => {
    return updateStockOperation(productId, newQuantity, 'adjustment', reason, performedBy, notes);
  };

  // Reserve stock
  const reserveStock = async (productId: number, quantity: number): Promise<boolean> => {
    try {
      setIsUpdating(true);
      setError(null);
      
      const item = inventoryItems.find(item => item.productId === productId);
      if (!item) {
        setError('Inventory item not found');
        return false;
      }
      
      if (item.availableStock < quantity) {
        setError('Insufficient available stock');
        return false;
      }
      
      const updatedItems = inventoryItems.map(invItem => 
        invItem.productId === productId 
          ? { 
              ...invItem, 
              reservedStock: invItem.reservedStock + quantity,
              availableStock: invItem.availableStock - quantity,
              updatedAt: new Date()
            }
          : invItem
      );
      
      setInventoryItems(updatedItems);
      saveInventoryItems(updatedItems);
      
      console.log('InventoryContext: Stock reserved:', productId, quantity);
      return true;
    } catch (err) {
      console.error('InventoryContext: Error reserving stock:', err);
      setError(err instanceof Error ? err.message : 'Failed to reserve stock');
      return false;
    } finally {
      setIsUpdating(false);
    }
  };

  // Release reserved stock
  const releaseReservedStock = async (productId: number, quantity: number): Promise<boolean> => {
    try {
      setIsUpdating(true);
      setError(null);
      
      const item = inventoryItems.find(item => item.productId === productId);
      if (!item) {
        setError('Inventory item not found');
        return false;
      }
      
      if (item.reservedStock < quantity) {
        setError('Insufficient reserved stock');
        return false;
      }
      
      const updatedItems = inventoryItems.map(invItem => 
        invItem.productId === productId 
          ? { 
              ...invItem, 
              reservedStock: invItem.reservedStock - quantity,
              availableStock: invItem.availableStock + quantity,
              updatedAt: new Date()
            }
          : invItem
      );
      
      setInventoryItems(updatedItems);
      saveInventoryItems(updatedItems);
      
      console.log('InventoryContext: Reserved stock released:', productId, quantity);
      return true;
    } catch (err) {
      console.error('InventoryContext: Error releasing reserved stock:', err);
      setError(err instanceof Error ? err.message : 'Failed to release reserved stock');
      return false;
    } finally {
      setIsUpdating(false);
    }
  };

  // Acknowledge alert
  const acknowledgeAlertOperation = async (alertId: string, acknowledgedBy: string): Promise<boolean> => {
    try {
      setIsUpdating(true);
      setError(null);
      
      // Import and use the service function (not recursive!)
      const { acknowledgeAlert: acknowledgeAlertService } = await import('@/services/inventoryService');
      const success = acknowledgeAlertService(alertId, acknowledgedBy);
      
      if (success) {
        // Refresh alerts
        const updatedAlerts = getInventoryAlerts();
        setAlerts(updatedAlerts);
      }
      
      return success;
    } catch (err) {
      console.error('InventoryContext: Error acknowledging alert:', err);
      setError(err instanceof Error ? err.message : 'Failed to acknowledge alert');
      return false;
    } finally {
      setIsUpdating(false);
    }
  };

  // Dismiss alert
  const dismissAlert = async (alertId: string): Promise<boolean> => {
    try {
      setIsUpdating(true);
      setError(null);
      
      const updatedAlerts = alerts.filter(alert => alert.id !== alertId);
      setAlerts(updatedAlerts);
      saveInventoryAlerts(updatedAlerts);
      
      console.log('InventoryContext: Alert dismissed:', alertId);
      return true;
    } catch (err) {
      console.error('InventoryContext: Error dismissing alert:', err);
      setError(err instanceof Error ? err.message : 'Failed to dismiss alert');
      return false;
    } finally {
      setIsUpdating(false);
    }
  };

  // Update settings
  const updateSettings = async (newSettings: Partial<InventorySettings>): Promise<boolean> => {
    try {
      setIsUpdating(true);
      setError(null);
      
      const updatedSettings = { ...settings, ...newSettings };
      setSettings(updatedSettings);
      saveInventorySettings(updatedSettings);
      
      console.log('InventoryContext: Settings updated');
      return true;
    } catch (err) {
      console.error('InventoryContext: Error updating settings:', err);
      setError(err instanceof Error ? err.message : 'Failed to update settings');
      return false;
    } finally {
      setIsUpdating(false);
    }
  };

  // Refresh data
  const refreshData = async (): Promise<void> => {
    await loadInventoryData();
  };

  // Refresh analytics
  const refreshAnalytics = async (): Promise<void> => {
    try {
      const analyticsData = getInventoryAnalytics();
      setAnalytics(analyticsData);
    } catch (err) {
      console.error('InventoryContext: Error refreshing analytics:', err);
    }
  };

  // Load data on mount
  useEffect(() => {
    loadInventoryData();
  }, []);

  // Context value
  const value: InventoryContextType = {
    // State
    inventoryItems,
    stockMovements,
    alerts,
    settings,
    reorderSuggestions,
    analytics,
    isLoading,
    isUpdating,
    error,
    
    // Actions
    addInventoryItem,
    updateInventoryItem,
    deleteInventoryItem,
    updateStock: updateStockOperation,
    adjustStock,
    reserveStock,
    releaseReservedStock,
    acknowledgeAlert: acknowledgeAlertOperation,
    dismissAlert,
    updateSettings,
    refreshData,
    refreshAnalytics
  };

  return (
    <InventoryContext.Provider value={value}>
      {children}
    </InventoryContext.Provider>
  );
};

// Custom hook to use inventory context
export const useInventory = (): InventoryContextType => {
  const context = useContext(InventoryContext);
  
  if (context === undefined) {
    throw new Error('useInventory must be used within an InventoryProvider');
  }
  
  return context;
};
