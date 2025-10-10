/**
 * Inventory Management Types
 * Comprehensive types for stock management, tracking, and analytics
 */

export interface InventoryItem {
  id: string;
  productId: number;
  sku: string;
  name: string;
  category: string;
  subcategory: string;
  
  // Stock Information
  currentStock: number;
  reservedStock: number;
  availableStock: number;
  minimumStock: number;
  maximumStock: number;
  
  // Pricing
  costPrice: number;
  sellingPrice: number;
  margin: number;
  
  // Location & Organization
  warehouse: string;
  shelf: string;
  bin: string;
  
  // Status & Tracking
  status: 'active' | 'inactive' | 'discontinued';
  lastRestocked: Date;
  lastSold: Date;
  reorderPoint: number;
  reorderQuantity: number;
  
  // Analytics
  totalSold: number;
  totalRevenue: number;
  averageMonthlySales: number;
  turnoverRate: number;
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  notes: string;
}

export interface StockMovement {
  id: string;
  productId: number;
  sku: string;
  type: 'in' | 'out' | 'adjustment' | 'transfer';
  quantity: number;
  reason: string;
  reference: string; // PO number, sale ID, etc.
  location: string;
  timestamp: Date;
  performedBy: string;
  notes: string;
}

export interface InventoryAlert {
  id: string;
  productId: number;
  sku: string;
  type: 'low_stock' | 'out_of_stock' | 'overstock' | 'reorder' | 'expiry';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  currentValue: number;
  thresholdValue: number;
  createdAt: Date;
  acknowledged: boolean;
  acknowledgedBy?: string;
  acknowledgedAt?: Date;
}

export interface InventoryReport {
  id: string;
  type: 'stock_summary' | 'movement_history' | 'low_stock' | 'valuation' | 'turnover';
  period: {
    start: Date;
    end: Date;
  };
  data: any;
  generatedAt: Date;
  generatedBy: string;
}

export interface ReorderSuggestion {
  productId: number;
  sku: string;
  name: string;
  currentStock: number;
  reorderPoint: number;
  suggestedQuantity: number;
  urgency: 'low' | 'medium' | 'high' | 'critical';
  estimatedCost: number;
  supplier?: string;
  leadTime?: number;
}

export interface InventorySettings {
  lowStockThreshold: number;
  reorderPointMultiplier: number;
  defaultWarehouse: string;
  enableAlerts: boolean;
  alertEmail?: string;
  autoReorder: boolean;
  costTracking: boolean;
  expiryTracking: boolean;
  expiryWarningDays: number;
}

export interface StockAdjustment {
  id: string;
  productId: number;
  sku: string;
  adjustmentType: 'increase' | 'decrease' | 'set';
  quantity: number;
  reason: string;
  reference?: string;
  timestamp: Date;
  performedBy: string;
  notes: string;
}

export interface InventoryAnalytics {
  totalProducts: number;
  totalValue: number;
  lowStockItems: number;
  outOfStockItems: number;
  overstockItems: number;
  totalMovements: number;
  topSellingProducts: Array<{
    productId: number;
    name: string;
    quantitySold: number;
    revenue: number;
  }>;
  slowMovingProducts: Array<{
    productId: number;
    name: string;
    daysSinceLastSale: number;
    currentStock: number;
  }>;
  categoryBreakdown: Array<{
    category: string;
    totalValue: number;
    totalItems: number;
    averageTurnover: number;
  }>;
}
