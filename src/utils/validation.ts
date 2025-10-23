/**
 * Validation Utilities
 * Comprehensive validation for products, inventory, and admin operations
 * Following Single Responsibility Principle - only validation logic
 */

import { Product } from '@/types/product';
import { InventoryItem } from '@/types/inventory';

// Validation Result Interface
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Validate Product Data
 */
export const validateProduct = (product: Partial<Product>): ValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Required fields
  if (!product.name || product.name.trim().length === 0) {
    errors.push('Product name is required');
  } else if (product.name.length < 3) {
    errors.push('Product name must be at least 3 characters long');
  } else if (product.name.length > 200) {
    errors.push('Product name must be less than 200 characters');
  }

  if (!product.category || product.category.trim().length === 0) {
    errors.push('Category is required');
  }

  if (!product.subcategory || product.subcategory.trim().length === 0) {
    errors.push('Subcategory is required');
  }

  if (!product.description || product.description.trim().length === 0) {
    errors.push('Description is required');
  } else if (product.description.length < 10) {
    warnings.push('Description is very short - consider adding more details');
  }

  // Price validation
  if (product.price === undefined || product.price === null) {
    errors.push('Price is required');
  } else if (product.price <= 0) {
    errors.push('Price must be greater than 0');
  } else if (product.price > 1000000) {
    warnings.push('Price seems unusually high - please verify');
  }

  // Discount validation
  if (product.discount !== undefined && product.discount !== null) {
    if (product.discount < 0 || product.discount > 100) {
      errors.push('Discount must be between 0 and 100');
    }
  }

  // Rating validation
  if (product.rating !== undefined && product.rating !== null) {
    if (product.rating < 0 || product.rating > 5) {
      errors.push('Rating must be between 0 and 5');
    }
  }

  // Reviews validation
  if (product.reviews !== undefined && product.reviews !== null) {
    if (product.reviews < 0) {
      errors.push('Reviews count cannot be negative');
    }
  }

  // SKU validation
  if (product.sku && product.sku.trim().length > 0) {
    if (!/^[A-Z0-9\-]+$/.test(product.sku)) {
      warnings.push('SKU should contain only uppercase letters, numbers, and hyphens');
    }
  } else {
    warnings.push('No SKU provided - one will be auto-generated');
  }

  // Arrays validation
  if (product.colors && product.colors.length === 0) {
    warnings.push('No colors specified');
  }

  if (product.sizes && product.sizes.length === 0) {
    warnings.push('No sizes specified');
  }

  if (product.occasion && product.occasion.length === 0) {
    warnings.push('No occasions specified');
  }

  // Image validation
  if (product.images && product.images.length === 0) {
    errors.push('At least one product image is required');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
};

/**
 * Validate Inventory Item Data
 */
export const validateInventoryItem = (item: Partial<InventoryItem>): ValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Required fields
  if (!item.name || item.name.trim().length === 0) {
    errors.push('Item name is required');
  }

  if (!item.sku || item.sku.trim().length === 0) {
    errors.push('SKU is required');
  }

  if (!item.productId) {
    errors.push('Product ID is required');
  }

  // Stock validation
  if (item.currentStock === undefined || item.currentStock === null) {
    errors.push('Current stock is required');
  } else if (item.currentStock < 0) {
    errors.push('Current stock cannot be negative');
  }

  if (item.minimumStock === undefined || item.minimumStock === null) {
    errors.push('Minimum stock is required');
  } else if (item.minimumStock < 0) {
    errors.push('Minimum stock cannot be negative');
  }

  if (item.maximumStock === undefined || item.maximumStock === null) {
    errors.push('Maximum stock is required');
  } else if (item.maximumStock < 0) {
    errors.push('Maximum stock cannot be negative');
  }

  // Stock logic validation
  if (item.minimumStock !== undefined && item.maximumStock !== undefined) {
    if (item.minimumStock > item.maximumStock) {
      errors.push('Minimum stock cannot be greater than maximum stock');
    }
  }

  if (item.currentStock !== undefined && item.maximumStock !== undefined) {
    if (item.currentStock > item.maximumStock * 1.5) {
      warnings.push('Current stock is significantly higher than maximum - consider adjusting maximum');
    }
  }

  if (item.currentStock !== undefined && item.minimumStock !== undefined) {
    if (item.currentStock <= item.minimumStock) {
      warnings.push('Current stock is at or below minimum - restock needed');
    }
  }

  // Reserved stock validation
  if (item.reservedStock !== undefined && item.reservedStock < 0) {
    errors.push('Reserved stock cannot be negative');
  }

  if (item.currentStock !== undefined && item.reservedStock !== undefined) {
    if (item.reservedStock > item.currentStock) {
      errors.push('Reserved stock cannot exceed current stock');
    }
  }

  // Price validation
  if (item.costPrice === undefined || item.costPrice === null) {
    errors.push('Cost price is required');
  } else if (item.costPrice < 0) {
    errors.push('Cost price cannot be negative');
  }

  if (item.sellingPrice === undefined || item.sellingPrice === null) {
    errors.push('Selling price is required');
  } else if (item.sellingPrice < 0) {
    errors.push('Selling price cannot be negative');
  }

  if (item.costPrice !== undefined && item.sellingPrice !== undefined) {
    if (item.costPrice > item.sellingPrice) {
      warnings.push('Cost price is higher than selling price - negative margin');
    }
    
    const margin = item.sellingPrice - item.costPrice;
    const marginPercent = (margin / item.sellingPrice) * 100;
    
    if (marginPercent < 10) {
      warnings.push(`Low profit margin: ${marginPercent.toFixed(1)}% - consider adjusting prices`);
    }
  }

  // Reorder point validation
  if (item.reorderPoint !== undefined && item.reorderPoint < 0) {
    errors.push('Reorder point cannot be negative');
  }

  if (item.reorderQuantity !== undefined && item.reorderQuantity <= 0) {
    errors.push('Reorder quantity must be greater than 0');
  }

  // Location validation
  if (!item.warehouse || item.warehouse.trim().length === 0) {
    warnings.push('No warehouse specified');
  }

  // Status validation
  if (item.status && !['active', 'inactive', 'discontinued'].includes(item.status)) {
    errors.push('Invalid status - must be active, inactive, or discontinued');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
};

/**
 * Validate SKU uniqueness
 */
export const validateSKUUniqueness = (sku: string, existingProducts: Product[], currentProductId?: number): boolean => {
  if (!sku || sku.trim().length === 0) {
    return true; // Empty SKU will be handled by product validation
  }

  const duplicate = existingProducts.find(p => 
    p.sku === sku && p.id !== currentProductId
  );

  return !duplicate;
};

/**
 * Validate stock movement
 */
export const validateStockMovement = (
  currentStock: number,
  quantity: number,
  type: 'in' | 'out' | 'adjustment'
): ValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (quantity === undefined || quantity === null) {
    errors.push('Quantity is required');
    return { isValid: false, errors, warnings };
  }

  if (type === 'in') {
    if (quantity <= 0) {
      errors.push('Quantity for stock-in must be greater than 0');
    }
    if (quantity > 10000) {
      warnings.push('Large stock-in quantity - please verify');
    }
  } else if (type === 'out') {
    if (quantity <= 0) {
      errors.push('Quantity for stock-out must be greater than 0');
    }
    if (quantity > currentStock) {
      errors.push(`Cannot remove ${quantity} units - only ${currentStock} available`);
    }
  } else if (type === 'adjustment') {
    if (quantity < 0) {
      errors.push('Stock adjustment quantity cannot be negative');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
};

/**
 * Validate bulk operation
 */
export const validateBulkOperation = (
  selectedIds: number[],
  operation: string
): ValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!selectedIds || selectedIds.length === 0) {
    errors.push('No items selected for bulk operation');
  }

  if (selectedIds.length > 100) {
    warnings.push(`Selected ${selectedIds.length} items - this may take a while`);
  }

  if (!operation || operation.trim().length === 0) {
    errors.push('No operation specified');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
};

/**
 * Sanitize input string
 */
export const sanitizeInput = (input: string): string => {
  if (!input) return '';
  
  return input
    .trim()
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove script tags
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+\s*=/gi, ''); // Remove event handlers
};

/**
 * Validate image file
 */
export const validateImageFile = (file: File): ValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];

  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
  const maxSize = 5 * 1024 * 1024; // 5MB

  if (!allowedTypes.includes(file.type)) {
    errors.push('Invalid file type - only JPG, PNG, WebP, and GIF are allowed');
  }

  if (file.size > maxSize) {
    errors.push(`File size ${(file.size / 1024 / 1024).toFixed(2)}MB exceeds maximum of 5MB`);
  }

  if (file.size > maxSize * 0.8) {
    warnings.push('Large file size - consider compressing the image');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
};

