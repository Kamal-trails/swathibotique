/**
 * Product-Inventory Synchronization Service
 * Ensures consistency between product catalog and inventory system
 * Following Single Responsibility Principle - only handles synchronization
 */

import { Product } from '@/types/product';
import { InventoryItem } from '@/types/inventory';
import {
  getInventoryItems,
  saveInventoryItems,
  createInventoryItem as createInventoryItemService
} from '@/services/inventoryService';
import { getAllProducts } from '@/services/productService';

/**
 * Synchronize a single product with inventory
 * Creates inventory item if it doesn't exist
 */
export const syncProductToInventory = (product: Product): boolean => {
  try {
    const inventoryItems = getInventoryItems();
    const existingItem = inventoryItems.find(item => item.productId === product.id);
    
    if (existingItem) {
      console.log(`Product ${product.id} already has inventory item`);
      return true;
    }
    
    // Create new inventory item with sensible defaults
    const newInventoryItem = createInventoryItemService(product, {
      currentStock: product.inStock ? 10 : 0, // Default to 10 if in stock
      minimumStock: 5,
      maximumStock: 100,
      costPrice: product.price * 0.6, // 40% margin assumption
      status: product.inStock ? 'active' : 'inactive',
      createdBy: 'system'
    });
    
    inventoryItems.push(newInventoryItem);
    saveInventoryItems(inventoryItems);
    
    console.log(`✅ Created inventory item for product: ${product.name}`);
    return true;
  } catch (error) {
    console.error(`❌ Error syncing product ${product.id} to inventory:`, error);
    return false;
  }
};

/**
 * Synchronize inventory back to product
 * Updates product's inStock status based on inventory
 */
export const syncInventoryToProduct = (inventoryItem: InventoryItem): boolean => {
  try {
    const products = getAllProducts();
    const productIndex = products.findIndex(p => p.id === inventoryItem.productId);
    
    if (productIndex === -1) {
      console.warn(`Product ${inventoryItem.productId} not found for inventory sync`);
      return false;
    }
    
    // Update product's inStock status
    products[productIndex].inStock = inventoryItem.currentStock > 0;
    
    // Save products (only for admin-added products in localStorage)
    const adminProducts = products.filter(p => p.id > 1000);
    if (adminProducts.length > 0) {
      localStorage.setItem('adminProducts', JSON.stringify(adminProducts));
    }
    
    console.log(`✅ Synced inventory to product: ${products[productIndex].name}`);
    return true;
  } catch (error) {
    console.error(`❌ Error syncing inventory to product:`, error);
    return false;
  }
};

/**
 * Bulk synchronization: Sync all products to inventory
 * Creates missing inventory items
 */
export const syncAllProductsToInventory = (): { created: number; errors: number } => {
  console.log('🔄 Starting bulk product-to-inventory sync...');
  
  const products = getAllProducts();
  let created = 0;
  let errors = 0;
  
  products.forEach(product => {
    const result = syncProductToInventory(product);
    if (result) {
      created++;
    } else {
      errors++;
    }
  });
  
  console.log(`✅ Bulk sync complete: ${created} created, ${errors} errors`);
  return { created, errors };
};

/**
 * Bulk synchronization: Sync all inventory items to products
 * Updates product stock status
 */
export const syncAllInventoryToProducts = (): { updated: number; errors: number } => {
  console.log('🔄 Starting bulk inventory-to-product sync...');
  
  const inventoryItems = getInventoryItems();
  let updated = 0;
  let errors = 0;
  
  inventoryItems.forEach(item => {
    const result = syncInventoryToProduct(item);
    if (result) {
      updated++;
    } else {
      errors++;
    }
  });
  
  console.log(`✅ Bulk sync complete: ${updated} updated, ${errors} errors`);
  return { updated, errors };
};

/**
 * Validate synchronization consistency
 * Returns list of inconsistencies
 */
export interface SyncInconsistency {
  type: 'missing_inventory' | 'missing_product' | 'stock_mismatch';
  productId?: number;
  productName?: string;
  inventoryId?: string;
  details: string;
}

export const validateSync = (): SyncInconsistency[] => {
  const products = getAllProducts();
  const inventoryItems = getInventoryItems();
  const inconsistencies: SyncInconsistency[] = [];
  
  // Check for products without inventory
  products.forEach(product => {
    const hasInventory = inventoryItems.some(item => item.productId === product.id);
    if (!hasInventory) {
      inconsistencies.push({
        type: 'missing_inventory',
        productId: product.id,
        productName: product.name,
        details: `Product "${product.name}" (ID: ${product.id}) has no inventory item`
      });
    }
  });
  
  // Check for inventory without products
  inventoryItems.forEach(item => {
    const hasProduct = products.some(p => p.id === item.productId);
    if (!hasProduct) {
      inconsistencies.push({
        type: 'missing_product',
        inventoryId: item.id,
        productId: item.productId,
        details: `Inventory item "${item.name}" references non-existent product (ID: ${item.productId})`
      });
    }
  });
  
  // Check for stock mismatches
  products.forEach(product => {
    const inventoryItem = inventoryItems.find(item => item.productId === product.id);
    if (inventoryItem) {
      const productSaysInStock = product.inStock !== false; // Default true if undefined
      const inventoryHasStock = inventoryItem.currentStock > 0;
      
      if (productSaysInStock !== inventoryHasStock) {
        inconsistencies.push({
          type: 'stock_mismatch',
          productId: product.id,
          productName: product.name,
          details: `Stock mismatch: Product inStock=${productSaysInStock}, Inventory stock=${inventoryItem.currentStock}`
        });
      }
    }
  });
  
  return inconsistencies;
};

/**
 * Auto-fix all synchronization issues
 */
export const autoFixSync = (): { fixed: number; errors: number } => {
  console.log('🔧 Auto-fixing synchronization issues...');
  
  let fixed = 0;
  let errors = 0;
  
  // Sync products to inventory
  const productSync = syncAllProductsToInventory();
  fixed += productSync.created;
  errors += productSync.errors;
  
  // Sync inventory back to products
  const inventorySync = syncAllInventoryToProducts();
  fixed += inventorySync.updated;
  errors += inventorySync.errors;
  
  console.log(`✅ Auto-fix complete: ${fixed} fixed, ${errors} errors`);
  return { fixed, errors };
};

