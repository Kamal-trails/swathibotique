/**
 * Inventory Management Service
 * Comprehensive stock management, tracking, and analytics
 * Following Single Responsibility Principle - only inventory operations
 */

import { 
  InventoryItem, 
  StockMovement, 
  InventoryAlert, 
  InventoryReport, 
  ReorderSuggestion,
  InventorySettings,
  StockAdjustment,
  InventoryAnalytics
} from '@/types/inventory';
import { Product } from '@/types/product';

// Default inventory settings
const DEFAULT_SETTINGS: InventorySettings = {
  lowStockThreshold: 10,
  reorderPointMultiplier: 1.5,
  defaultWarehouse: 'Main Warehouse',
  enableAlerts: true,
  autoReorder: false,
  costTracking: true,
  expiryTracking: false,
  expiryWarningDays: 30
};

// Storage keys
const STORAGE_KEYS = {
  INVENTORY_ITEMS: 'inventoryItems',
  STOCK_MOVEMENTS: 'stockMovements',
  INVENTORY_ALERTS: 'inventoryAlerts',
  INVENTORY_SETTINGS: 'inventorySettings',
  STOCK_ADJUSTMENTS: 'stockAdjustments'
};

// Get inventory items from localStorage
export const getInventoryItems = (): InventoryItem[] => {
  if (typeof window === 'undefined' || !window.localStorage) {
    return [];
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEYS.INVENTORY_ITEMS);
    if (!stored) return [];
    
    const items = JSON.parse(stored);
    return items.map((item: any) => ({
      ...item,
      lastRestocked: new Date(item.lastRestocked),
      lastSold: new Date(item.lastSold),
      createdAt: new Date(item.createdAt),
      updatedAt: new Date(item.updatedAt)
    }));
  } catch (error) {
    console.error('Error loading inventory items:', error);
    return [];
  }
};

// Save inventory items to localStorage
export const saveInventoryItems = (items: InventoryItem[]): void => {
  if (typeof window === 'undefined' || !window.localStorage) {
    return;
  }

  try {
    localStorage.setItem(STORAGE_KEYS.INVENTORY_ITEMS, JSON.stringify(items));
  } catch (error) {
    console.error('Error saving inventory items:', error);
  }
};

// Get stock movements from localStorage
export const getStockMovements = (): StockMovement[] => {
  if (typeof window === 'undefined' || !window.localStorage) {
    return [];
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEYS.STOCK_MOVEMENTS);
    if (!stored) return [];
    
    const movements = JSON.parse(stored);
    return movements.map((movement: any) => ({
      ...movement,
      timestamp: new Date(movement.timestamp)
    }));
  } catch (error) {
    console.error('Error loading stock movements:', error);
    return [];
  }
};

// Save stock movements to localStorage
export const saveStockMovements = (movements: StockMovement[]): void => {
  if (typeof window === 'undefined' || !window.localStorage) {
    return;
  }

  try {
    localStorage.setItem(STORAGE_KEYS.STOCK_MOVEMENTS, JSON.stringify(movements));
  } catch (error) {
    console.error('Error saving stock movements:', error);
  }
};

// Create inventory item from product
export const createInventoryItem = (product: Product, inventoryData: Partial<InventoryItem>): InventoryItem => {
  const now = new Date();
  
  return {
    id: `inv_${product.id}_${Date.now()}`,
    productId: product.id,
    sku: product.sku || `SKU-${product.id}`,
    name: product.name,
    category: product.category,
    subcategory: product.subcategory,
    
    // Stock Information
    currentStock: inventoryData.currentStock || 0,
    reservedStock: inventoryData.reservedStock || 0,
    availableStock: (inventoryData.currentStock || 0) - (inventoryData.reservedStock || 0),
    minimumStock: inventoryData.minimumStock || 5,
    maximumStock: inventoryData.maximumStock || 100,
    
    // Pricing
    costPrice: inventoryData.costPrice || product.price * 0.6, // Assume 40% margin
    sellingPrice: product.price,
    margin: product.price - (inventoryData.costPrice || product.price * 0.6),
    
    // Location & Organization
    warehouse: inventoryData.warehouse || DEFAULT_SETTINGS.defaultWarehouse,
    shelf: inventoryData.shelf || 'A1',
    bin: inventoryData.bin || 'B1',
    
    // Status & Tracking
    status: inventoryData.status || 'active',
    lastRestocked: inventoryData.lastRestocked || now,
    lastSold: inventoryData.lastSold || now,
    reorderPoint: inventoryData.reorderPoint || (inventoryData.minimumStock || 5) * DEFAULT_SETTINGS.reorderPointMultiplier,
    reorderQuantity: inventoryData.reorderQuantity || 20,
    
    // Analytics
    totalSold: inventoryData.totalSold || 0,
    totalRevenue: inventoryData.totalRevenue || 0,
    averageMonthlySales: inventoryData.averageMonthlySales || 0,
    turnoverRate: inventoryData.turnoverRate || 0,
    
    // Metadata
    createdAt: now,
    updatedAt: now,
    createdBy: inventoryData.createdBy || 'admin',
    notes: inventoryData.notes || ''
  };
};

// Update stock for a product
export const updateStock = (
  productId: number, 
  quantity: number, 
  type: 'in' | 'out' | 'adjustment',
  reason: string,
  performedBy: string = 'admin',
  notes: string = ''
): boolean => {
  try {
    const items = getInventoryItems();
    const itemIndex = items.findIndex(item => item.productId === productId);
    
    if (itemIndex === -1) {
      console.error('Inventory item not found for product:', productId);
      return false;
    }

    const item = items[itemIndex];
    const oldStock = item.currentStock;
    
    // Update stock based on type
    switch (type) {
      case 'in':
        item.currentStock += quantity;
        item.lastRestocked = new Date();
        break;
      case 'out':
        item.currentStock = Math.max(0, item.currentStock - quantity);
        item.lastSold = new Date();
        item.totalSold += quantity;
        item.totalRevenue += quantity * item.sellingPrice;
        break;
      case 'adjustment':
        item.currentStock = quantity;
        break;
    }

    // Update available stock
    item.availableStock = item.currentStock - item.reservedStock;
    item.updatedAt = new Date();

    // Save updated items
    items[itemIndex] = item;
    saveInventoryItems(items);

    // Record stock movement
    const movement: StockMovement = {
      id: `mov_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      productId,
      sku: item.sku,
      type,
      quantity: type === 'adjustment' ? quantity : Math.abs(quantity),
      reason,
      reference: `ADJ-${Date.now()}`,
      location: item.warehouse,
      timestamp: new Date(),
      performedBy,
      notes
    };

    const movements = getStockMovements();
    movements.unshift(movement);
    saveStockMovements(movements);

    // Check for alerts
    checkAndCreateAlerts(item);

    console.log(`Stock updated for ${item.name}: ${oldStock} → ${item.currentStock} (${type}: ${quantity})`);
    return true;
  } catch (error) {
    console.error('Error updating stock:', error);
    return false;
  }
};

// Check and create inventory alerts
export const checkAndCreateAlerts = (item: InventoryItem): void => {
  const alerts = getInventoryAlerts();
  const settings = getInventorySettings();
  
  // Remove existing alerts for this product
  const filteredAlerts = alerts.filter(alert => alert.productId !== item.productId);
  
  // Check for low stock
  if (item.currentStock <= item.minimumStock) {
    const alert: InventoryAlert = {
      id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      productId: item.productId,
      sku: item.sku,
      type: item.currentStock === 0 ? 'out_of_stock' : 'low_stock',
      severity: item.currentStock === 0 ? 'critical' : 'high',
      message: item.currentStock === 0 
        ? `${item.name} is out of stock!`
        : `${item.name} is running low (${item.currentStock} remaining)`,
      currentValue: item.currentStock,
      thresholdValue: item.minimumStock,
      createdAt: new Date(),
      acknowledged: false
    };
    filteredAlerts.push(alert);
  }

  // Check for overstock
  if (item.currentStock > item.maximumStock) {
    const alert: InventoryAlert = {
      id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      productId: item.productId,
      sku: item.sku,
      type: 'overstock',
      severity: 'medium',
      message: `${item.name} is overstocked (${item.currentStock} units)`,
      currentValue: item.currentStock,
      thresholdValue: item.maximumStock,
      createdAt: new Date(),
      acknowledged: false
    };
    filteredAlerts.push(alert);
  }

  // Check for reorder point
  if (item.currentStock <= item.reorderPoint && item.currentStock > item.minimumStock) {
    const alert: InventoryAlert = {
      id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      productId: item.productId,
      sku: item.sku,
      type: 'reorder',
      severity: 'medium',
      message: `${item.name} has reached reorder point (${item.currentStock} units)`,
      currentValue: item.currentStock,
      thresholdValue: item.reorderPoint,
      createdAt: new Date(),
      acknowledged: false
    };
    filteredAlerts.push(alert);
  }

  saveInventoryAlerts(filteredAlerts);
};

// Get inventory alerts
export const getInventoryAlerts = (): InventoryAlert[] => {
  if (typeof window === 'undefined' || !window.localStorage) {
    return [];
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEYS.INVENTORY_ALERTS);
    if (!stored) return [];
    
    const alerts = JSON.parse(stored);
    return alerts.map((alert: any) => ({
      ...alert,
      createdAt: new Date(alert.createdAt),
      acknowledgedAt: alert.acknowledgedAt ? new Date(alert.acknowledgedAt) : undefined
    }));
  } catch (error) {
    console.error('Error loading inventory alerts:', error);
    return [];
  }
};

// Save inventory alerts
export const saveInventoryAlerts = (alerts: InventoryAlert[]): void => {
  if (typeof window === 'undefined' || !window.localStorage) {
    return;
  }

  try {
    localStorage.setItem(STORAGE_KEYS.INVENTORY_ALERTS, JSON.stringify(alerts));
  } catch (error) {
    console.error('Error saving inventory alerts:', error);
  }
};

// Get inventory settings
export const getInventorySettings = (): InventorySettings => {
  if (typeof window === 'undefined' || !window.localStorage) {
    return DEFAULT_SETTINGS;
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEYS.INVENTORY_SETTINGS);
    if (!stored) return DEFAULT_SETTINGS;
    
    return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
  } catch (error) {
    console.error('Error loading inventory settings:', error);
    return DEFAULT_SETTINGS;
  }
};

// Save inventory settings
export const saveInventorySettings = (settings: InventorySettings): void => {
  if (typeof window === 'undefined' || !window.localStorage) {
    return;
  }

  try {
    localStorage.setItem(STORAGE_KEYS.INVENTORY_SETTINGS, JSON.stringify(settings));
  } catch (error) {
    console.error('Error saving inventory settings:', error);
  }
};

// Get reorder suggestions
export const getReorderSuggestions = (): ReorderSuggestion[] => {
  const items = getInventoryItems();
  const suggestions: ReorderSuggestion[] = [];

  items.forEach(item => {
    if (item.currentStock <= item.reorderPoint) {
      const urgency = item.currentStock === 0 ? 'critical' :
                     item.currentStock <= item.minimumStock ? 'high' :
                     item.currentStock <= item.reorderPoint ? 'medium' : 'low';

      suggestions.push({
        productId: item.productId,
        sku: item.sku,
        name: item.name,
        currentStock: item.currentStock,
        reorderPoint: item.reorderPoint,
        suggestedQuantity: item.reorderQuantity,
        urgency,
        estimatedCost: item.reorderQuantity * item.costPrice
      });
    }
  });

  return suggestions.sort((a, b) => {
    const urgencyOrder = { critical: 4, high: 3, medium: 2, low: 1 };
    return urgencyOrder[b.urgency] - urgencyOrder[a.urgency];
  });
};

// Get inventory analytics
export const getInventoryAnalytics = (): InventoryAnalytics => {
  const items = getInventoryItems();
  const movements = getStockMovements();
  
  const totalProducts = items.length;
  const totalValue = items.reduce((sum, item) => sum + (item.currentStock * item.costPrice), 0);
  const lowStockItems = items.filter(item => item.currentStock <= item.minimumStock).length;
  const outOfStockItems = items.filter(item => item.currentStock === 0).length;
  const overstockItems = items.filter(item => item.currentStock > item.maximumStock).length;

  // Top selling products
  const topSellingProducts = items
    .filter(item => item.totalSold > 0)
    .sort((a, b) => b.totalSold - a.totalSold)
    .slice(0, 5)
    .map(item => ({
      productId: item.productId,
      name: item.name,
      quantitySold: item.totalSold,
      revenue: item.totalRevenue
    }));

  // Slow moving products
  const slowMovingProducts = items
    .filter(item => {
      const daysSinceLastSale = Math.floor((Date.now() - item.lastSold.getTime()) / (1000 * 60 * 60 * 24));
      return daysSinceLastSale > 30 && item.currentStock > 0;
    })
    .map(item => ({
      productId: item.productId,
      name: item.name,
      daysSinceLastSale: Math.floor((Date.now() - item.lastSold.getTime()) / (1000 * 60 * 60 * 24)),
      currentStock: item.currentStock
    }))
    .sort((a, b) => b.daysSinceLastSale - a.daysSinceLastSale)
    .slice(0, 5);

  // Category breakdown
  const categoryBreakdown = items.reduce((acc, item) => {
    const existing = acc.find(cat => cat.category === item.category);
    if (existing) {
      existing.totalValue += item.currentStock * item.costPrice;
      existing.totalItems += 1;
      existing.averageTurnover += item.turnoverRate;
    } else {
      acc.push({
        category: item.category,
        totalValue: item.currentStock * item.costPrice,
        totalItems: 1,
        averageTurnover: item.turnoverRate
      });
    }
    return acc;
  }, [] as Array<{ category: string; totalValue: number; totalItems: number; averageTurnover: number }>);

  return {
    totalProducts,
    totalValue,
    lowStockItems,
    outOfStockItems,
    overstockItems,
    totalMovements: movements.length,
    topSellingProducts,
    slowMovingProducts,
    categoryBreakdown
  };
};

// Acknowledge alert
export const acknowledgeAlert = (alertId: string, acknowledgedBy: string): boolean => {
  try {
    const alerts = getInventoryAlerts();
    const alertIndex = alerts.findIndex(alert => alert.id === alertId);
    
    if (alertIndex === -1) return false;
    
    alerts[alertIndex].acknowledged = true;
    alerts[alertIndex].acknowledgedBy = acknowledgedBy;
    alerts[alertIndex].acknowledgedAt = new Date();
    
    saveInventoryAlerts(alerts);
    return true;
  } catch (error) {
    console.error('Error acknowledging alert:', error);
    return false;
  }
};
