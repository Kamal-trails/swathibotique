import React from 'react';
import { Link } from 'react-router-dom';
import { Plus, Package, Users, ShoppingCart, TrendingUp, Eye, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { useProducts } from '@/contexts/ProductContext';
import { getAllProducts } from '@/services/productService';

const AdminDashboard = () => {
  const { getProducts, getAdminProducts } = useProducts();
  const allProducts = getProducts();
  const adminProducts = getAdminProducts();
  
  // Real-time statistics
  const stats = {
    totalProducts: allProducts.length,
    newProducts: allProducts.filter(p => p.isNew).length,
    totalSales: 1250, // Mock data - would come from orders
    totalRevenue: 2450000, // Mock data - would come from orders
    outOfStock: allProducts.filter(p => !p.inStock).length,
    highRated: allProducts.filter(p => (p.rating || 0) >= 4.5).length,
    adminAdded: adminProducts.length
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
                <h1 className="font-heading text-3xl font-bold mb-2">Admin Dashboard</h1>
                <p className="text-muted-foreground">Manage your boutique products and orders</p>
              </div>
              <Link to="/admin/add-product">
                <Button className="btn-gold">
                  <Plus className="mr-2 h-5 w-5" />
                  Add New Product
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Dashboard Content */}
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Products</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalProducts}</div>
                <p className="text-xs text-muted-foreground">
                  +{stats.adminAdded} added via admin
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
                <ShoppingCart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalSales}</div>
                <p className="text-xs text-muted-foreground">
                  +12% from last month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Revenue</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">₹{stats.totalRevenue.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  +8% from last month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">High Rated</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.highRated}</div>
                <p className="text-xs text-muted-foreground">
                  Products with 4.5+ rating
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Link to="/admin/add-product">
                  <Button variant="outline" className="w-full h-20 flex flex-col gap-2">
                    <Plus className="h-6 w-6" />
                    Add Product
                  </Button>
                </Link>
                
                <Link to="/admin/manage-products">
                  <Button variant="outline" className="w-full h-20 flex flex-col gap-2">
                    <Package className="h-6 w-6" />
                    Manage Products
                  </Button>
                </Link>
                
                <Button variant="outline" className="w-full h-20 flex flex-col gap-2">
                  <TrendingUp className="h-6 w-6" />
                  View Analytics
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Recent Products */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Products ({allProducts.length} total)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {allProducts.slice(0, 10).map((product) => (
                  <div key={product.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                      <div>
                        <h3 className="font-medium">{product.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {product.category} • ₹{product.price.toLocaleString()}
                        </p>
                        <div className="flex gap-2 mt-1">
                          {product.isNew && <Badge variant="default">New</Badge>}
                          {product.discount && <Badge variant="destructive">-{product.discount}%</Badge>}
                          {!product.inStock && <Badge variant="secondary">Out of Stock</Badge>}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default AdminDashboard;
