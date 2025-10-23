/**
 * Clean Admin Add Product Component
 * Following Single Responsibility Principle - only handles product creation UI
 * Following Clean Architecture - minimal dependencies, clear separation of concerns
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { useProducts } from '@/contexts/ProductContextClean';
import { toast } from 'sonner';
import { validateProduct, validateImageFile } from '@/utils/validation';
import { createAppError, logError } from '@/utils/errorHandling';

const CATEGORIES = [
  "Sarees", "Lehengas", "Salwar Suits", "Kurtis & Kurtas", "Gowns",
  "Dupattas & Stoles", "Men's Kurtas", "Sherwanis", "Kids Wear", "Jewelry", "Bags & Clutches"
];

const SUBCATEGORIES = [
  "Ethnic Wear", "Bridal Wear", "Indo-Western", "Men's Ethnic Wear",
  "Men's Bridal Wear", "Kids Ethnic Wear", "Accessories"
];

const OCCASIONS = [
  "Wedding", "Festival", "Party", "Office", "Casual", "Formal", "Traditional", "Modern"
];

const FABRICS = [
  "Silk", "Cotton", "Georgette", "Chiffon", "Velvet", "Linen", "Crepe", "Net", "Organza"
];

const COMMON_COLORS = [
  "Red", "Blue", "Green", "Pink", "Purple", "Gold", "Maroon", "Navy", "Coral", "Teal",
  "White", "Black", "Yellow", "Orange", "Brown", "Grey", "Silver", "Cream"
];

const COMMON_SIZES = [
  "XS", "S", "M", "L", "XL", "XXL", "Free Size", "One Size",
  "2Y", "4Y", "6Y", "8Y", "10Y", "12Y"
];

interface ProductFormData {
  name: string;
  price: number;
  category: string;
  subcategory: string;
  description: string;
  fabric: string;
  occasion: string[];
  colors: string[];
  sizes: string[];
  isNew: boolean;
  discount: number;
  inStock: boolean;
  rating: number;
  reviews: number;
  careInstructions: string;
  origin: string;
  sku: string;
  
  // Inventory Management Fields
  inventory: {
    currentStock: number;
    minimumStock: number;
    maximumStock: number;
    reorderPoint: number;
    reorderQuantity: number;
    costPrice: number;
    warehouse: string;
    shelf: string;
    bin: string;
    status: 'active' | 'inactive' | 'discontinued';
    notes: string;
  };
}

const AdminAddProductClean = () => {
  const navigate = useNavigate();
  const { addProduct } = useProducts();
  
  const [formData, setFormData] = useState<ProductFormData>({
    name: '',
    price: 0,
    category: '',
    subcategory: '',
    description: '',
    fabric: '',
    occasion: [],
    colors: [],
    sizes: [],
    isNew: false,
    discount: 0,
    inStock: true,
    rating: 4.0,
    reviews: 0,
    careInstructions: '',
    origin: 'Made in India',
    sku: '',
    
    // Inventory Management Fields
    inventory: {
      currentStock: 0,
      minimumStock: 5,
      maximumStock: 100,
      reorderPoint: 10,
      reorderQuantity: 20,
      costPrice: 0,
      warehouse: 'Main Warehouse',
      shelf: 'A1',
      bin: 'B1',
      status: 'active',
      notes: ''
    }
  });

  const [images, setImages] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle form field changes
  const handleInputChange = (field: keyof ProductFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Handle image upload with validation
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    // Validate each image file
    const validFiles: File[] = [];
    let hasErrors = false;
    
    files.forEach(file => {
      const validation = validateImageFile(file);
      
      if (!validation.isValid) {
        validation.errors.forEach(error => toast.error(`${file.name}: ${error}`));
        hasErrors = true;
      } else {
        validFiles.push(file);
        
        // Show warnings
        validation.warnings.forEach(warning => toast.warning(`${file.name}: ${warning}`));
      }
    });
    
    if (validFiles.length > 0) {
      setImages(validFiles);
      if (hasErrors) {
        toast.info(`${validFiles.length} of ${files.length} images were valid`);
      } else {
        toast.success(`${validFiles.length} image(s) selected`);
      }
    } else if (files.length > 0) {
      toast.error('No valid images selected');
    }
  };

  // Toggle occasion
  const toggleOccasion = (occasion: string) => {
    setFormData(prev => ({
      ...prev,
      occasion: prev.occasion.includes(occasion)
        ? prev.occasion.filter(o => o !== occasion)
        : [...prev.occasion, occasion]
    }));
  };

  // Toggle color
  const toggleColor = (color: string) => {
    setFormData(prev => ({
      ...prev,
      colors: prev.colors.includes(color)
        ? prev.colors.filter(c => c !== color)
        : [...prev.colors, color]
    }));
  };

  // Toggle size
  const toggleSize = (size: string) => {
    setFormData(prev => ({
      ...prev,
      sizes: prev.sizes.includes(size)
        ? prev.sizes.filter(s => s !== size)
        : [...prev.sizes, size]
    }));
  };

  // Generate SKU
  const generateSKU = () => {
    const categoryPrefix = formData.category.replace(/[^A-Z]/g, '').substring(0, 3).toUpperCase();
    const randomNum = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    const sku = `JB-${categoryPrefix}-${randomNum}`;
    setFormData(prev => ({ ...prev, sku }));
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Create product object for validation
    const productToValidate = {
      name: formData.name,
      price: formData.price,
      category: formData.category,
      subcategory: formData.subcategory,
      description: formData.description,
      fabric: formData.fabric,
      occasion: formData.occasion,
      colors: formData.colors,
      sizes: formData.sizes,
      discount: formData.discount,
      rating: formData.rating,
      reviews: formData.reviews,
      sku: formData.sku,
      images: images.map(f => f.name) // Temporary for validation
    };
    
    // Comprehensive validation
    const validation = validateProduct(productToValidate);
    
    // Show validation errors
    if (!validation.isValid) {
      validation.errors.forEach(error => toast.error(error));
      return;
    }
    
    // Show validation warnings (non-blocking)
    validation.warnings.forEach(warning => toast.warning(warning));
    
    // Additional inventory validation
    if (formData.inventory.minimumStock > formData.inventory.maximumStock) {
      toast.error('Minimum stock cannot be greater than maximum stock');
      return;
    }
    
    if (formData.inventory.costPrice > formData.price) {
      toast.warning('Cost price is higher than selling price - you will have a negative margin');
    }

    try {
      setIsSubmitting(true);
      
      // Convert images to base64
      const imagePromises = images.map(file => {
        return new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (e) => resolve(e.target?.result as string);
          reader.onerror = () => reject(new Error('Failed to read file'));
          reader.readAsDataURL(file);
        });
      });

      const imageUrls = await Promise.all(imagePromises);
      
      // Create new product with inventory data
      const newProduct = {
        id: Date.now(), // Simple ID generation
        name: formData.name,
        price: formData.price,
        image: imageUrls[0] || '/placeholder.svg',
        images: imageUrls,
        category: formData.category,
        subcategory: formData.subcategory,
        description: formData.description,
        fabric: formData.fabric,
        occasion: formData.occasion || [],
        colors: formData.colors || [],
        sizes: formData.sizes || [],
        isNew: formData.isNew || false,
        discount: formData.discount || 0,
        inStock: formData.inStock !== false,
        rating: formData.rating || 4.0,
        reviews: formData.reviews || 0,
        careInstructions: formData.careInstructions || '',
        origin: formData.origin || 'Made in India',
        sku: formData.sku || `JB-${Date.now()}`,
        
        // Include inventory data
        inventory: {
          currentStock: formData.inventory.currentStock,
          reservedStock: 0,
          availableStock: formData.inventory.currentStock,
          minimumStock: formData.inventory.minimumStock,
          maximumStock: formData.inventory.maximumStock,
          reorderPoint: formData.inventory.reorderPoint,
          reorderQuantity: formData.inventory.reorderQuantity,
          costPrice: formData.inventory.costPrice,
          margin: formData.price - formData.inventory.costPrice,
          warehouse: formData.inventory.warehouse,
          shelf: formData.inventory.shelf,
          bin: formData.inventory.bin,
          lastRestocked: new Date(),
          lastSold: new Date(),
          totalSold: 0,
          totalRevenue: 0,
          averageMonthlySales: 0,
          turnoverRate: 0,
          status: formData.inventory.status,
          notes: formData.inventory.notes
        }
      };

      await addProduct(newProduct, images);
      
      // Auto-sync product to inventory
      const { syncProductToInventory } = await import('@/services/productInventorySync');
      const syncResult = syncProductToInventory(newProduct as any);
      
      if (syncResult) {
        toast.success(`Product "${formData.name}" added successfully with inventory tracking!`);
      } else {
        toast.success(`Product "${formData.name}" added successfully!`);
        toast.warning('Inventory sync failed - please sync manually from inventory dashboard');
      }
      
      navigate('/admin/manage-products');
    } catch (error) {
      const appError = createAppError(error, 'Adding product');
      logError(appError, { productName: formData.name, category: formData.category });
      toast.error(appError.userMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      
      <main className="flex-1">
        {/* Page Header */}
        <section className="bg-muted py-8">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between">
              <div>
                <Button 
                  variant="ghost" 
                  onClick={() => navigate('/admin/manage-products')}
                  className="mb-2"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Manage Products
                </Button>
                <h1 className="font-heading text-3xl font-bold mb-2">Add New Product</h1>
                <p className="text-muted-foreground">Create a new product with all details</p>
              </div>
            </div>
          </div>
        </section>

        {/* Form Content */}
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left Column - Form */}
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Basic Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="name">Product Name *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        placeholder="Enter product name"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="category">Category *</Label>
                        <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent>
                            {CATEGORIES.map(category => (
                              <SelectItem key={category} value={category}>{category}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="subcategory">Subcategory *</Label>
                        <Select value={formData.subcategory} onValueChange={(value) => handleInputChange('subcategory', value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select subcategory" />
                          </SelectTrigger>
                          <SelectContent>
                            {SUBCATEGORIES.map(subcategory => (
                              <SelectItem key={subcategory} value={subcategory}>{subcategory}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="description">Description *</Label>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => handleInputChange('description', e.target.value)}
                        placeholder="Enter product description"
                        rows={4}
                        required
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="price">Price (₹) *</Label>
                        <Input
                          id="price"
                          type="number"
                          value={formData.price}
                          onChange={(e) => handleInputChange('price', Number(e.target.value))}
                          placeholder="Enter price"
                          min="0"
                          required
                        />
                      </div>

                      <div>
                        <Label htmlFor="discount">Discount (%)</Label>
                        <Input
                          id="discount"
                          type="number"
                          value={formData.discount}
                          onChange={(e) => handleInputChange('discount', Number(e.target.value))}
                          placeholder="Enter discount percentage"
                          min="0"
                          max="100"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="sku">SKU</Label>
                        <div className="flex gap-2">
                          <Input
                            id="sku"
                            value={formData.sku}
                            onChange={(e) => handleInputChange('sku', e.target.value)}
                            placeholder="Enter SKU"
                          />
                          <Button type="button" variant="outline" onClick={generateSKU}>
                            Generate
                          </Button>
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="fabric">Fabric</Label>
                        <Select value={formData.fabric} onValueChange={(value) => handleInputChange('fabric', value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select fabric" />
                          </SelectTrigger>
                          <SelectContent>
                            {FABRICS.map(fabric => (
                              <SelectItem key={fabric} value={fabric}>{fabric}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="images">Product Images *</Label>
                      <Input
                        id="images"
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleImageUpload}
                        className="mt-2"
                        required
                      />
                      <p className="text-sm text-muted-foreground mt-1">
                        Upload at least one image. Multiple images are supported.
                      </p>
                    </div>

                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="isNew"
                          checked={formData.isNew}
                          onCheckedChange={(checked) => handleInputChange('isNew', checked)}
                        />
                        <Label htmlFor="isNew">New Arrival</Label>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="inStock"
                          checked={formData.inStock}
                          onCheckedChange={(checked) => handleInputChange('inStock', checked)}
                        />
                        <Label htmlFor="inStock">In Stock</Label>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Inventory Management Section */}
                <Card>
                  <CardHeader>
                    <CardTitle>Inventory Management</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="currentStock">Current Stock</Label>
                        <Input
                          id="currentStock"
                          type="number"
                          value={formData.inventory.currentStock}
                          onChange={(e) => handleInputChange('inventory', { ...formData.inventory, currentStock: Number(e.target.value) })}
                          placeholder="Enter current stock quantity"
                          min="0"
                        />
                      </div>

                      <div>
                        <Label htmlFor="costPrice">Cost Price (₹)</Label>
                        <Input
                          id="costPrice"
                          type="number"
                          value={formData.inventory.costPrice}
                          onChange={(e) => handleInputChange('inventory', { ...formData.inventory, costPrice: Number(e.target.value) })}
                          placeholder="Enter cost price"
                          min="0"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="minimumStock">Minimum Stock</Label>
                        <Input
                          id="minimumStock"
                          type="number"
                          value={formData.inventory.minimumStock}
                          onChange={(e) => handleInputChange('inventory', { ...formData.inventory, minimumStock: Number(e.target.value) })}
                          placeholder="Min stock level"
                          min="0"
                        />
                      </div>

                      <div>
                        <Label htmlFor="maximumStock">Maximum Stock</Label>
                        <Input
                          id="maximumStock"
                          type="number"
                          value={formData.inventory.maximumStock}
                          onChange={(e) => handleInputChange('inventory', { ...formData.inventory, maximumStock: Number(e.target.value) })}
                          placeholder="Max stock level"
                          min="0"
                        />
                      </div>

                      <div>
                        <Label htmlFor="reorderPoint">Reorder Point</Label>
                        <Input
                          id="reorderPoint"
                          type="number"
                          value={formData.inventory.reorderPoint}
                          onChange={(e) => handleInputChange('inventory', { ...formData.inventory, reorderPoint: Number(e.target.value) })}
                          placeholder="Reorder threshold"
                          min="0"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="reorderQuantity">Reorder Quantity</Label>
                        <Input
                          id="reorderQuantity"
                          type="number"
                          value={formData.inventory.reorderQuantity}
                          onChange={(e) => handleInputChange('inventory', { ...formData.inventory, reorderQuantity: Number(e.target.value) })}
                          placeholder="Reorder amount"
                          min="0"
                        />
                      </div>

                      <div>
                        <Label htmlFor="warehouse">Warehouse</Label>
                        <Input
                          id="warehouse"
                          value={formData.inventory.warehouse}
                          onChange={(e) => handleInputChange('inventory', { ...formData.inventory, warehouse: e.target.value })}
                          placeholder="Warehouse location"
                        />
                      </div>

                      <div>
                        <Label htmlFor="shelf">Shelf</Label>
                        <Input
                          id="shelf"
                          value={formData.inventory.shelf}
                          onChange={(e) => handleInputChange('inventory', { ...formData.inventory, shelf: e.target.value })}
                          placeholder="Shelf location"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="bin">Bin</Label>
                        <Input
                          id="bin"
                          value={formData.inventory.bin}
                          onChange={(e) => handleInputChange('inventory', { ...formData.inventory, bin: e.target.value })}
                          placeholder="Bin location"
                        />
                      </div>

                      <div>
                        <Label htmlFor="inventoryStatus">Status</Label>
                        <Select 
                          value={formData.inventory.status} 
                          onValueChange={(value: 'active' | 'inactive' | 'discontinued') => 
                            handleInputChange('inventory', { ...formData.inventory, status: value })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="inactive">Inactive</SelectItem>
                            <SelectItem value="discontinued">Discontinued</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="inventoryNotes">Inventory Notes</Label>
                      <Textarea
                        id="inventoryNotes"
                        value={formData.inventory.notes}
                        onChange={(e) => handleInputChange('inventory', { ...formData.inventory, notes: e.target.value })}
                        placeholder="Additional inventory notes (optional)"
                        rows={3}
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Submit Button */}
                <div className="flex justify-end">
                  <Button 
                    type="submit" 
                    size="lg" 
                    className="btn-gold"
                    disabled={isSubmitting}
                  >
                    <Save className="mr-2 h-5 w-5" />
                    {isSubmitting ? 'Adding Product...' : 'Add Product'}
                  </Button>
                </div>
              </div>

              {/* Right Column - Variants */}
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Occasions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-2">
                      {OCCASIONS.map(occasion => (
                        <div key={occasion} className="flex items-center space-x-2">
                          <Checkbox
                            id={occasion}
                            checked={formData.occasion.includes(occasion)}
                            onCheckedChange={() => toggleOccasion(occasion)}
                          />
                          <Label htmlFor={occasion} className="text-sm">{occasion}</Label>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Colors</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-2">
                      {COMMON_COLORS.map(color => (
                        <div key={color} className="flex items-center space-x-2">
                          <Checkbox
                            id={color}
                            checked={formData.colors.includes(color)}
                            onCheckedChange={() => toggleColor(color)}
                          />
                          <Label htmlFor={color} className="text-sm">{color}</Label>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Sizes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-2">
                      {COMMON_SIZES.map(size => (
                        <div key={size} className="flex items-center space-x-2">
                          <Checkbox
                            id={size}
                            checked={formData.sizes.includes(size)}
                            onCheckedChange={() => toggleSize(size)}
                          />
                          <Label htmlFor={size} className="text-sm">{size}</Label>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </form>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default AdminAddProductClean;
