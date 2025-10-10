/**
 * Clean Admin Manage Products Component
 * Following Single Responsibility Principle - only handles product management UI
 * Following Clean Architecture - minimal dependencies, clear separation of concerns
 */

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Edit, Trash2, Eye, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { useProducts } from '@/contexts/ProductContextClean';
import { toast } from 'sonner';

const AdminManageProductsClean = () => {
  const { products, isLoading, error, deleteProduct } = useProducts();
  const [selectedProducts, setSelectedProducts] = useState<Set<number>>(new Set());

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

  // Handle delete product
  const handleDeleteProduct = (product: any) => {
    if (window.confirm(`Are you sure you want to delete "${product.name}"?`)) {
      deleteProduct(product.id);
      toast.success(`Product "${product.name}" deleted successfully`);
    }
  };

  // Handle bulk delete
  const handleBulkDelete = () => {
    if (selectedProducts.size === 0) return;
    
    if (window.confirm(`Are you sure you want to delete ${selectedProducts.size} products?`)) {
      selectedProducts.forEach(productId => {
        deleteProduct(productId);
      });
      toast.success(`${selectedProducts.size} products deleted successfully`);
      setSelectedProducts(new Set());
    }
  };

  // Loading state
  if (isLoading) {
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

  // Error state
  if (error) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navigation />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Error Loading Products</h2>
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>
              Retry
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

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
                  {products.length} products • {selectedProducts.size} selected
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

        {/* Products List */}
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card>
            <CardHeader>
              <CardTitle>Products ({products.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {/* Bulk Actions */}
              {selectedProducts.size > 0 && (
                <div className="flex items-center gap-4 mb-6 p-4 bg-muted rounded-lg">
                  <span className="text-sm font-medium">
                    {selectedProducts.size} product{selectedProducts.size !== 1 ? 's' : ''} selected
                  </span>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleBulkDelete}
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

              {/* Products Grid */}
              {products.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {products.map((product) => (
                    <Card key={product.id} className="relative">
                      <div className="absolute top-2 left-2">
                        <input
                          type="checkbox"
                          checked={selectedProducts.has(product.id)}
                          onChange={() => toggleProductSelection(product.id)}
                          className="w-4 h-4"
                        />
                      </div>
                      
                      <CardContent className="p-4">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-full h-48 object-cover rounded-lg mb-4"
                          onError={(e) => {
                            e.currentTarget.src = '/placeholder.svg';
                          }}
                        />
                        
                        <div className="space-y-2">
                          <h3 className="font-semibold text-lg">{product.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {product.category} • {product.subcategory}
                          </p>
                          
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-lg">₹{product.price.toLocaleString()}</span>
                            <div className="flex gap-1">
                              {product.isNew && <Badge variant="default">New</Badge>}
                              {product.discount && product.discount > 0 && (
                                <Badge variant="destructive">-{product.discount}%</Badge>
                              )}
                              {!product.inStock && <Badge variant="secondary">Out of Stock</Badge>}
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <span className="text-sm">⭐ {product.rating?.toFixed(1) || 'N/A'}</span>
                            <span className="text-sm text-muted-foreground">
                              ({product.reviews || 0} reviews)
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-2 pt-2">
                            <Button variant="ghost" size="sm" asChild>
                              <Link to={`/admin/edit-product/${product.id}`}>
                                <Edit className="h-4 w-4" />
                              </Link>
                            </Button>
                            
                            <Button variant="ghost" size="sm" asChild>
                              <Link to={`/product/${product.id}`}>
                                <Eye className="h-4 w-4" />
                              </Link>
                            </Button>
                            
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteProduct(product)}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <h3 className="text-lg font-semibold mb-2">No products found</h3>
                  <p className="text-muted-foreground mb-4">
                    Start by adding your first product to the catalog.
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
    </div>
  );
};

export default AdminManageProductsClean;
