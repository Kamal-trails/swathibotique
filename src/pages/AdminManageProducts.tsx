import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
  Edit, 
  Trash2, 
  Eye, 
  Search, 
  Filter, 
  MoreHorizontal, 
  ArrowLeft,
  Plus,
  Download,
  Upload,
  CheckCircle,
  XCircle,
  AlertTriangle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { useProducts } from '@/contexts/ProductContext';
import { toast } from 'sonner';

interface ProductFilters {
  search: string;
  category: string;
  status: string;
  inStock: string;
  isNew: string;
}

const AdminManageProducts = () => {
  const { getProducts, getAdminProducts, updateProduct, deleteProduct } = useProducts();
  const allProducts = getProducts();
  const adminProducts = getAdminProducts();
  
  // Debug logging
  console.log('AdminManageProducts Debug:', {
    allProductsLength: allProducts?.length,
    adminProductsLength: adminProducts?.length,
    allProducts: allProducts,
    adminProducts: adminProducts
  });
  
  const [selectedProducts, setSelectedProducts] = useState<Set<number>>(new Set());
  const [filters, setFilters] = useState<ProductFilters>({
    search: '',
    category: '',
    status: '',
    inStock: '',
    isNew: ''
  });
  const [sortBy, setSortBy] = useState('newest');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; product: any }>({ open: false, product: null });
  const [bulkDeleteDialog, setBulkDeleteDialog] = useState(false);

  // Use adminProducts for management, fallback to allProducts if adminProducts is empty
  const productsToManage = adminProducts && adminProducts.length > 0 ? adminProducts : (allProducts || []);
  
  // Show loading state if no products are available yet
  if (!allProducts || allProducts.length === 0) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navigation />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto mb-4"></div>
            <p>Loading products...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    let filtered = productsToManage;

    // Apply search filter
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filtered = filtered.filter(product =>
        product?.name?.toLowerCase().includes(searchTerm) ||
        product?.category?.toLowerCase().includes(searchTerm) ||
        product?.subcategory?.toLowerCase().includes(searchTerm) ||
        product?.sku?.toLowerCase().includes(searchTerm)
      );
    }

    // Apply category filter
    if (filters.category) {
      filtered = filtered.filter(product => product?.category === filters.category);
    }

    // Apply stock filter
    if (filters.inStock) {
      const inStock = filters.inStock === 'true';
      filtered = filtered.filter(product => product?.inStock === inStock);
    }

    // Apply new filter
    if (filters.isNew) {
      const isNew = filters.isNew === 'true';
      filtered = filtered.filter(product => product?.isNew === isNew);
    }

    // Apply sorting
    switch (sortBy) {
      case 'newest':
        filtered.sort((a, b) => (b?.id || 0) - (a?.id || 0));
        break;
      case 'oldest':
        filtered.sort((a, b) => (a?.id || 0) - (b?.id || 0));
        break;
      case 'name-asc':
        filtered.sort((a, b) => (a?.name || '').localeCompare(b?.name || ''));
        break;
      case 'name-desc':
        filtered.sort((a, b) => (b?.name || '').localeCompare(a?.name || ''));
        break;
      case 'price-asc':
        filtered.sort((a, b) => (a?.price || 0) - (b?.price || 0));
        break;
      case 'price-desc':
        filtered.sort((a, b) => (b?.price || 0) - (a?.price || 0));
        break;
      case 'rating-desc':
        filtered.sort((a, b) => (b?.rating || 0) - (a?.rating || 0));
        break;
    }

    return filtered;
  }, [productsToManage, filters, sortBy]);

  // Get unique categories
  const categories = useMemo(() => {
    return [...new Set(productsToManage.map(p => p?.category).filter(Boolean))].sort();
  }, [productsToManage]);

  // Handle product selection
  const toggleProductSelection = (productId: number) => {
    const newSelected = new Set(selectedProducts);
    if (newSelected.has(productId)) {
      newSelected.delete(productId);
    } else {
      newSelected.add(productId);
    }
    setSelectedProducts(newSelected);
  };

  // Handle select all
  const toggleSelectAll = () => {
    if (selectedProducts.size === filteredProducts.length) {
      setSelectedProducts(new Set());
    } else {
      setSelectedProducts(new Set(filteredProducts.map(p => p?.id).filter(Boolean)));
    }
  };

  // Handle delete single product
  const handleDeleteProduct = (product: any) => {
    if (product?.id) {
      deleteProduct(product.id);
      toast.success(`Product "${product?.name || 'Product'}" deleted successfully`);
      setDeleteDialog({ open: false, product: null });
    }
  };

  // Handle bulk delete
  const handleBulkDelete = () => {
    selectedProducts.forEach(productId => {
      deleteProduct(productId);
    });
    toast.success(`${selectedProducts.size} products deleted successfully`);
    setSelectedProducts(new Set());
    setBulkDeleteDialog(false);
  };

  // Handle toggle stock status
  const toggleStockStatus = (product: any) => {
    if (product?.id) {
      updateProduct(product.id, { inStock: !product.inStock });
      toast.success(`Stock status updated for "${product?.name || 'Product'}"`);
    }
  };

  // Handle toggle new status
  const toggleNewStatus = (product: any) => {
    if (product?.id) {
      updateProduct(product.id, { isNew: !product.isNew });
      toast.success(`New status updated for "${product?.name || 'Product'}"`);
    }
  };

  // Get product status badge
  const getStatusBadge = (product: any) => {
    if (!product?.inStock) return <Badge variant="destructive">Out of Stock</Badge>;
    if (product?.isNew) return <Badge variant="default">New</Badge>;
    if (product?.discount && product.discount > 0) return <Badge variant="secondary">{product.discount}% Off</Badge>;
    return <Badge variant="outline">Active</Badge>;
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
                <Link to="/admin" className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-2">
                  <ArrowLeft className="h-4 w-4" />
                  Back to Admin Dashboard
                </Link>
                <h1 className="font-heading text-3xl font-bold mb-2">Manage Products</h1>
                <p className="text-muted-foreground">
                  {filteredProducts.length} products • {selectedProducts.size} selected
                </p>
              </div>
              <div className="flex gap-2">
                <Link to="/admin/add-product">
                  <Button className="btn-gold">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Product
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Filters and Controls */}
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Card>
            <CardHeader>
              <CardTitle>Filters & Controls</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search products..."
                    value={filters.search}
                    onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                    className="pl-10"
                  />
                </div>

                {/* Category Filter */}
                <Select value={filters.category} onValueChange={(value) => setFilters(prev => ({ ...prev, category: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Categories</SelectItem>
                    {categories.map(category => (
                      <SelectItem key={category} value={category}>{category}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Stock Filter */}
                <Select value={filters.inStock} onValueChange={(value) => setFilters(prev => ({ ...prev, inStock: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Stock Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Stock</SelectItem>
                    <SelectItem value="true">In Stock</SelectItem>
                    <SelectItem value="false">Out of Stock</SelectItem>
                  </SelectContent>
                </Select>

                {/* New Filter */}
                <Select value={filters.isNew} onValueChange={(value) => setFilters(prev => ({ ...prev, isNew: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Product Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Products</SelectItem>
                    <SelectItem value="true">New Arrivals</SelectItem>
                    <SelectItem value="false">Regular</SelectItem>
                  </SelectContent>
                </Select>

                {/* Sort */}
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Newest First</SelectItem>
                    <SelectItem value="oldest">Oldest First</SelectItem>
                    <SelectItem value="name-asc">Name A-Z</SelectItem>
                    <SelectItem value="name-desc">Name Z-A</SelectItem>
                    <SelectItem value="price-asc">Price Low-High</SelectItem>
                    <SelectItem value="price-desc">Price High-Low</SelectItem>
                    <SelectItem value="rating-desc">Highest Rated</SelectItem>
                  </SelectContent>
                </Select>

                {/* View Mode */}
                <div className="flex gap-2">
                  <Button
                    variant={viewMode === 'table' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode('table')}
                  >
                    Table
                  </Button>
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                  >
                    Grid
                  </Button>
                </div>
              </div>

              {/* Bulk Actions */}
              {selectedProducts.size > 0 && (
                <div className="flex items-center gap-4 mt-4 p-4 bg-muted rounded-lg">
                  <span className="text-sm font-medium">
                    {selectedProducts.size} product{selectedProducts.size !== 1 ? 's' : ''} selected
                  </span>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => setBulkDeleteDialog(true)}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete Selected
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedProducts(new Set())}
                  >
                    Clear Selection
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </section>

        {/* Products Table/Grid */}
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 pb-8">
          <Card>
            <CardHeader>
              <CardTitle>Products ({filteredProducts.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {viewMode === 'table' ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12">
                          <Checkbox
                            checked={selectedProducts.size === filteredProducts.length && filteredProducts.length > 0}
                            onCheckedChange={toggleSelectAll}
                          />
                        </TableHead>
                        <TableHead>Product</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Rating</TableHead>
                        <TableHead>Stock</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredProducts.map((product) => (
                        <TableRow key={product?.id || Math.random()}>
                          <TableCell>
                            <Checkbox
                              checked={selectedProducts.has(product?.id || 0)}
                              onCheckedChange={() => toggleProductSelection(product?.id || 0)}
                            />
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <img
                                src={product?.image || '/placeholder.svg'}
                                alt={product?.name || 'Product'}
                                className="w-12 h-12 object-cover rounded-lg"
                              />
                              <div>
                                <div className="font-medium">{product?.name || 'Unnamed Product'}</div>
                                <div className="text-sm text-muted-foreground">
                                  SKU: {product?.sku || 'N/A'}
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <div className="font-medium">{product?.category || 'Uncategorized'}</div>
                              <div className="text-sm text-muted-foreground">{product?.subcategory || 'No subcategory'}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              {product?.discount && product.discount > 0 ? (
                                <>
                                  <div className="font-medium text-accent">
                                    ₹{Math.round((product?.price || 0) * (1 - product.discount / 100))}
                                  </div>
                                  <div className="text-sm text-muted-foreground line-through">
                                    ₹{product?.price || 0}
                                  </div>
                                </>
                              ) : (
                                <div className="font-medium">₹{product?.price || 0}</div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>{getStatusBadge(product)}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <span>⭐</span>
                              <span>{product?.rating?.toFixed(1) || 'N/A'}</span>
                              <span className="text-muted-foreground">
                                ({product?.reviews || 0})
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Button
                              variant={product?.inStock ? "default" : "destructive"}
                              size="sm"
                              onClick={() => toggleStockStatus(product)}
                            >
                              {product?.inStock ? (
                                <CheckCircle className="h-4 w-4" />
                              ) : (
                                <XCircle className="h-4 w-4" />
                              )}
                            </Button>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button variant="ghost" size="sm">
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-2xl">
                                  <DialogHeader>
                                    <DialogTitle>Product Details</DialogTitle>
                                  </DialogHeader>
                                  <div className="space-y-4">
                                    <div className="flex gap-4">
                                      <img
                                        src={product.image}
                                        alt={product.name}
                                        className="w-32 h-32 object-cover rounded-lg"
                                      />
                                      <div className="flex-1">
                                        <h3 className="text-xl font-bold">{product.name}</h3>
                                        <p className="text-muted-foreground mb-2">{product.category} • {product.subcategory}</p>
                                        <div className="space-y-2">
                                          <div><strong>Price:</strong> ₹{product.price}</div>
                                          {product.discount && <div><strong>Discount:</strong> {product.discount}%</div>}
                                          <div><strong>Rating:</strong> ⭐ {product.rating?.toFixed(1)} ({product.reviews} reviews)</div>
                                          <div><strong>SKU:</strong> {product.sku}</div>
                                          <div><strong>Stock:</strong> {product.inStock ? 'In Stock' : 'Out of Stock'}</div>
                                        </div>
                                      </div>
                                    </div>
                                    <div>
                                      <h4 className="font-semibold mb-2">Description</h4>
                                      <p className="text-muted-foreground">{product.description}</p>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                      <div>
                                        <h4 className="font-semibold mb-2">Colors</h4>
                                        <div className="flex flex-wrap gap-2">
                                          {product.colors?.map(color => (
                                            <Badge key={color} variant="outline">{color}</Badge>
                                          ))}
                                        </div>
                                      </div>
                                      <div>
                                        <h4 className="font-semibold mb-2">Sizes</h4>
                                        <div className="flex flex-wrap gap-2">
                                          {product.sizes?.map(size => (
                                            <Badge key={size} variant="outline">{size}</Badge>
                                          ))}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </DialogContent>
                              </Dialog>

                              <Link to={`/admin/edit-product/${product.id}`}>
                                <Button variant="ghost" size="sm">
                                  <Edit className="h-4 w-4" />
                                </Button>
                              </Link>

                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setDeleteDialog({ open: true, product })}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredProducts.map((product) => (
                    <Card key={product.id} className="relative">
                      <div className="absolute top-2 left-2">
                        <Checkbox
                          checked={selectedProducts.has(product.id)}
                          onCheckedChange={() => toggleProductSelection(product.id)}
                        />
                      </div>
                      <CardContent className="p-4">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-full h-48 object-cover rounded-lg mb-4"
                        />
                        <div className="space-y-2">
                          <h3 className="font-semibold">{product.name}</h3>
                          <p className="text-sm text-muted-foreground">{product.category}</p>
                          <div className="flex items-center justify-between">
                            <span className="font-bold">₹{product.price}</span>
                            {getStatusBadge(product)}
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant={product.inStock ? "default" : "destructive"}
                              size="sm"
                              onClick={() => toggleStockStatus(product)}
                            >
                              {product.inStock ? 'In Stock' : 'Out of Stock'}
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => toggleNewStatus(product)}
                            >
                              {product.isNew ? 'Remove New' : 'Mark New'}
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              {filteredProducts.length === 0 && (
                <div className="text-center py-12">
                  <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">
                    {productsToManage.length === 0 ? 'No products available' : 'No products found'}
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    {productsToManage.length === 0 
                      ? 'Start by adding your first product to the catalog.'
                      : 'Try adjusting your filters or add a new product.'
                    }
                  </p>
                  <Link to="/admin/add-product">
                    <Button className="btn-gold">
                      <Plus className="mr-2 h-4 w-4" />
                      Add Product
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </section>
      </main>

      <Footer />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ open, product: null })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Product</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deleteDialog.product?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => handleDeleteProduct(deleteDialog.product)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Bulk Delete Confirmation Dialog */}
      <AlertDialog open={bulkDeleteDialog} onOpenChange={setBulkDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Selected Products</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {selectedProducts.size} selected products? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleBulkDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete All
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminManageProducts;
