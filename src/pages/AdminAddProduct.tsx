import React, { useState, useMemo } from 'react';
import { Plus, Upload, X, Eye, Save, RefreshCw, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { useProducts } from '@/contexts/ProductContext';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import { Product, ProductCategory, ProductSubcategory, Occasion, Fabric } from '@/types/product';

interface ProductFormData {
  name: string;
  price: number;
  category: ProductCategory | '';
  subcategory: ProductSubcategory | '';
  description: string;
  fabric: Fabric | '';
  occasion: Occasion[];
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
}

const CATEGORIES: ProductCategory[] = [
  "Sarees", "Lehengas", "Salwar Suits", "Kurtis & Kurtas", "Gowns",
  "Dupattas & Stoles", "Men's Kurtas", "Sherwanis", "Kids Wear", "Jewelry", "Bags & Clutches"
];

const SUBCATEGORIES: ProductSubcategory[] = [
  "Ethnic Wear", "Bridal Wear", "Indo-Western", "Men's Ethnic Wear",
  "Men's Bridal Wear", "Kids Ethnic Wear", "Accessories"
];

const OCCASIONS: Occasion[] = [
  "Wedding", "Festival", "Party", "Office", "Casual", "Formal", "Traditional", "Modern"
];

const FABRICS: Fabric[] = [
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

const AdminAddProduct = () => {
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
    sku: ''
  });

  const [images, setImages] = useState<File[]>([]);
  const [imagePreview, setImagePreview] = useState<string[]>([]);
  const [customColor, setCustomColor] = useState('');
  const [customSize, setCustomSize] = useState('');

  // Generate tags based on form data
  const generatedTags = useMemo(() => {
    const tags: string[] = [];
    
    if (formData.category) tags.push(formData.category);
    if (formData.subcategory) tags.push(formData.subcategory);
    if (formData.fabric) tags.push(formData.fabric);
    formData.occasion.forEach(occ => tags.push(occ));
    formData.colors.forEach(color => tags.push(color));
    if (formData.isNew) tags.push('New Arrival');
    if (formData.discount > 0) tags.push(`${formData.discount}% Off`);
    if (formData.rating >= 4.5) tags.push('Highly Rated');
    if (formData.reviews > 100) tags.push('Popular');
    if (!formData.inStock) tags.push('Out of Stock');
    
    return [...new Set(tags)];
  }, [formData]);

  // Handle form field changes
  const handleInputChange = (field: keyof ProductFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Handle image upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const newImages = [...images, ...files];
    setImages(newImages);
    
    // Generate previews
    const newPreviews = [...imagePreview];
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        newPreviews.push(e.target?.result as string);
        setImagePreview([...newPreviews]);
      };
      reader.readAsDataURL(file);
    });
  };

  // Remove image
  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    const newPreviews = imagePreview.filter((_, i) => i !== index);
    setImages(newImages);
    setImagePreview(newPreviews);
  };

  // Add custom color
  const addCustomColor = () => {
    if (customColor && !formData.colors.includes(customColor)) {
      setFormData(prev => ({
        ...prev,
        colors: [...prev.colors, customColor]
      }));
      setCustomColor('');
    }
  };

  // Add custom size
  const addCustomSize = () => {
    if (customSize && !formData.sizes.includes(customSize)) {
      setFormData(prev => ({
        ...prev,
        sizes: [...prev.sizes, customSize]
      }));
      setCustomSize('');
    }
  };

  // Remove color
  const removeColor = (color: string) => {
    setFormData(prev => ({
      ...prev,
      colors: prev.colors.filter(c => c !== color)
    }));
  };

  // Remove size
  const removeSize = (size: string) => {
    setFormData(prev => ({
      ...prev,
      sizes: prev.sizes.filter(s => s !== size)
    }));
  };

  // Toggle occasion
  const toggleOccasion = (occasion: Occasion) => {
    setFormData(prev => ({
      ...prev,
      occasion: prev.occasion.includes(occasion)
        ? prev.occasion.filter(o => o !== occasion)
        : [...prev.occasion, occasion]
    }));
  };

  // Generate SKU
  const generateSKU = () => {
    const categoryPrefix = formData.category.replace(/[^A-Z]/g, '').substring(0, 3).toUpperCase();
    const randomNum = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    const sku = `JB-${categoryPrefix}-${randomNum}`;
    setFormData(prev => ({ ...prev, sku }));
  };

  // Calculate discounted price
  const discountedPrice = formData.discount > 0 
    ? formData.price - (formData.price * formData.discount) / 100 
    : formData.price;

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.name || !formData.category || !formData.subcategory || !formData.description || formData.price <= 0) {
      alert('Please fill in all required fields (Name, Category, Subcategory, Description, Price)');
      return;
    }

    if (images.length === 0) {
      alert('Please upload at least one product image');
      return;
    }

    // Add product using the context
    addProduct(formData, images);
    
    // Show success message
    toast.success(`Product "${formData.name}" added successfully!`, {
      description: "The product is now available in the shopping catalog.",
      duration: 5000,
    });
    
    // Reset form
    setFormData({
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
      sku: ''
    });
    setImages([]);
    setImagePreview([]);
    setCustomColor('');
    setCustomSize('');
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      
      <main className="flex-1">
        {/* Page Header */}
        <section className="bg-muted py-8">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="font-heading text-3xl font-bold mb-2">Add New Product</h1>
            <p className="text-muted-foreground">Create a new product with all details and tags</p>
          </div>
        </section>

        {/* Form Content */}
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column - Form */}
              <div className="lg:col-span-2 space-y-6">
                <Tabs defaultValue="basic" className="w-full">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="basic">Basic Info</TabsTrigger>
                    <TabsTrigger value="details">Details</TabsTrigger>
                    <TabsTrigger value="variants">Variants</TabsTrigger>
                    <TabsTrigger value="images">Images</TabsTrigger>
                  </TabsList>

                  {/* Basic Information Tab */}
                  <TabsContent value="basic" className="space-y-6">
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
                                <RefreshCw className="h-4 w-4" />
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
                      </CardContent>
                    </Card>
                  </TabsContent>

                  {/* Details Tab */}
                  <TabsContent value="details" className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Product Details</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <Label>Occasions</Label>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
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
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="rating">Rating</Label>
                            <Input
                              id="rating"
                              type="number"
                              value={formData.rating}
                              onChange={(e) => handleInputChange('rating', Number(e.target.value))}
                              min="0"
                              max="5"
                              step="0.1"
                            />
                          </div>

                          <div>
                            <Label htmlFor="reviews">Reviews Count</Label>
                            <Input
                              id="reviews"
                              type="number"
                              value={formData.reviews}
                              onChange={(e) => handleInputChange('reviews', Number(e.target.value))}
                              min="0"
                            />
                          </div>
                        </div>

                        <div>
                          <Label htmlFor="careInstructions">Care Instructions</Label>
                          <Input
                            id="careInstructions"
                            value={formData.careInstructions}
                            onChange={(e) => handleInputChange('careInstructions', e.target.value)}
                            placeholder="e.g., Dry clean only"
                          />
                        </div>

                        <div>
                          <Label htmlFor="origin">Origin</Label>
                          <Input
                            id="origin"
                            value={formData.origin}
                            onChange={(e) => handleInputChange('origin', e.target.value)}
                            placeholder="e.g., Made in India"
                          />
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
                  </TabsContent>

                  {/* Variants Tab */}
                  <TabsContent value="variants" className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Product Variants</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <Label>Colors</Label>
                          <div className="flex flex-wrap gap-2 mt-2 mb-4">
                            {COMMON_COLORS.map(color => (
                              <Button
                                key={color}
                                type="button"
                                variant={formData.colors.includes(color) ? "default" : "outline"}
                                size="sm"
                                onClick={() => {
                                  if (formData.colors.includes(color)) {
                                    removeColor(color);
                                  } else {
                                    setFormData(prev => ({ ...prev, colors: [...prev.colors, color] }));
                                  }
                                }}
                              >
                                {color}
                              </Button>
                            ))}
                          </div>
                          <div className="flex gap-2">
                            <Input
                              value={customColor}
                              onChange={(e) => setCustomColor(e.target.value)}
                              placeholder="Add custom color"
                            />
                            <Button type="button" onClick={addCustomColor}>
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                          {formData.colors.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-2">
                              {formData.colors.map(color => (
                                <Badge key={color} variant="secondary" className="flex items-center gap-1">
                                  {color}
                                  <X className="h-3 w-3 cursor-pointer" onClick={() => removeColor(color)} />
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>

                        <div>
                          <Label>Sizes</Label>
                          <div className="flex flex-wrap gap-2 mt-2 mb-4">
                            {COMMON_SIZES.map(size => (
                              <Button
                                key={size}
                                type="button"
                                variant={formData.sizes.includes(size) ? "default" : "outline"}
                                size="sm"
                                onClick={() => {
                                  if (formData.sizes.includes(size)) {
                                    removeSize(size);
                                  } else {
                                    setFormData(prev => ({ ...prev, sizes: [...prev.sizes, size] }));
                                  }
                                }}
                              >
                                {size}
                              </Button>
                            ))}
                          </div>
                          <div className="flex gap-2">
                            <Input
                              value={customSize}
                              onChange={(e) => setCustomSize(e.target.value)}
                              placeholder="Add custom size"
                            />
                            <Button type="button" onClick={addCustomSize}>
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                          {formData.sizes.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-2">
                              {formData.sizes.map(size => (
                                <Badge key={size} variant="secondary" className="flex items-center gap-1">
                                  {size}
                                  <X className="h-3 w-3 cursor-pointer" onClick={() => removeSize(size)} />
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  {/* Images Tab */}
                  <TabsContent value="images" className="space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Product Images</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <Label htmlFor="images">Upload Images</Label>
                          <Input
                            id="images"
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={handleImageUpload}
                            className="mt-2"
                          />
                        </div>

                        {imagePreview.length > 0 && (
                          <div>
                            <Label>Image Preview</Label>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
                              {imagePreview.map((preview, index) => (
                                <div key={index} className="relative">
                                  <img
                                    src={preview}
                                    alt={`Preview ${index + 1}`}
                                    className="w-full h-32 object-cover rounded-lg"
                                  />
                                  <Button
                                    type="button"
                                    variant="destructive"
                                    size="icon"
                                    className="absolute -top-2 -right-2 h-6 w-6"
                                    onClick={() => removeImage(index)}
                                  >
                                    <X className="h-3 w-3" />
                                  </Button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>

                {/* Submit Button */}
                <div className="flex justify-between">
                  <Link to="/shop">
                    <Button variant="outline" size="lg">
                      <ExternalLink className="mr-2 h-5 w-5" />
                      View Shop
                    </Button>
                  </Link>
                  <Button type="submit" size="lg" className="btn-gold">
                    <Save className="mr-2 h-5 w-5" />
                    Add Product
                  </Button>
                </div>
              </div>

              {/* Right Column - Preview & Tags */}
              <div className="space-y-6">
                {/* Product Preview */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Eye className="h-5 w-5" />
                      Product Preview
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="border rounded-lg p-4">
                      {imagePreview.length > 0 ? (
                        <img
                          src={imagePreview[0]}
                          alt="Product preview"
                          className="w-full h-48 object-cover rounded-lg mb-4"
                        />
                      ) : (
                        <div className="w-full h-48 bg-muted rounded-lg mb-4 flex items-center justify-center">
                          <span className="text-muted-foreground">No image uploaded</span>
                        </div>
                      )}

                      <div className="space-y-2">
                        <h3 className="font-semibold text-lg">
                          {formData.name || 'Product Name'}
                        </h3>
                        
                        <p className="text-sm text-muted-foreground">
                          {formData.category || 'Category'} • {formData.subcategory || 'Subcategory'}
                        </p>

                        <div className="flex items-center gap-2">
                          {formData.discount > 0 ? (
                            <>
                              <span className="font-bold text-accent">
                                ₹{discountedPrice.toFixed(0)}
                              </span>
                              <span className="text-sm text-muted-foreground line-through">
                                ₹{formData.price.toFixed(0)}
                              </span>
                              <Badge variant="destructive">
                                -{formData.discount}%
                              </Badge>
                            </>
                          ) : (
                            <span className="font-bold">
                              ₹{formData.price.toFixed(0)}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          {formData.isNew && <Badge variant="default">New</Badge>}
                          {formData.rating > 0 && (
                            <span className="text-sm">
                              ⭐ {formData.rating} ({formData.reviews} reviews)
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Generated Tags */}
                <Card>
                  <CardHeader>
                    <CardTitle>Generated Tags</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Tags are automatically generated based on product data
                    </p>
                  </CardHeader>
                  <CardContent>
                    {generatedTags.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {generatedTags.map((tag, index) => (
                          <Badge key={index} variant="outline">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground text-sm">
                        Add product details to see generated tags
                      </p>
                    )}
                  </CardContent>
                </Card>

                {/* Product Stats */}
                <Card>
                  <CardHeader>
                    <CardTitle>Product Stats</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Images:</span>
                      <span>{imagePreview.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Colors:</span>
                      <span>{formData.colors.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Sizes:</span>
                      <span>{formData.sizes.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Occasions:</span>
                      <span>{formData.occasion.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tags:</span>
                      <span>{generatedTags.length}</span>
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

export default AdminAddProduct;
