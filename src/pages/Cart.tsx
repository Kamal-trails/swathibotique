import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Trash2, ArrowRight, ShoppingBag, Loader2, AlertTriangle, RefreshCw } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { PageSkeleton } from "@/components/LoadingStates";
import { toast } from "sonner";

const Cart = () => {
  const { state: cartState, updateQuantity, removeFromCart, refreshCart } = useCart();
  const [couponCode, setCouponCode] = useState("");
  const [isUpdating, setIsUpdating] = useState<number | null>(null);
  const [isRemoving, setIsRemoving] = useState<number | null>(null);

  const cartItems = cartState.items;
  const subtotal = cartState.totalPrice;
  const shipping = subtotal > 500 ? 0 : 50; // Free shipping over ₹500
  const total = subtotal + shipping;

  // Handle initial loading
  useEffect(() => {
    // If cart is empty and not loading, refresh to get latest
    if (cartItems.length === 0 && !cartState.isLoading) {
      refreshCart();
    }
  }, []);

  const handleUpdateQuantity = async (id: number, newQuantity: number) => {
    if (newQuantity < 1) return;
    
    setIsUpdating(id);
    try {
      await updateQuantity(id, newQuantity);
    } catch (error) {
      console.error('Error updating quantity:', error);
      toast.error('Failed to update quantity');
    } finally {
      setIsUpdating(null);
    }
  };

  const handleRemoveItem = async (id: number) => {
    setIsRemoving(id);
    try {
      await removeFromCart(id);
      toast.success('Item removed from cart');
    } catch (error) {
      console.error('Error removing item:', error);
      toast.error('Failed to remove item');
    } finally {
      setIsRemoving(null);
    }
  };

  const handleRetry = () => {
    refreshCart();
  };

  // Loading state
  if (cartState.isLoading && cartItems.length === 0) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navigation />
        <main className="flex-1">
          <PageSkeleton />
        </main>
        <Footer />
      </div>
    );
  }

  // Syncing state (background sync)
  const showSyncIndicator = cartState.isSyncing && cartItems.length > 0;

  // Empty cart
  if (cartItems.length === 0 && !cartState.isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navigation />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center py-20 px-4">
            <ShoppingBag className="h-24 w-24 text-muted-foreground mx-auto mb-6" />
            <h2 className="font-heading text-3xl font-bold mb-4">Your Cart is Empty</h2>
            <p className="text-muted-foreground mb-8 max-w-md mx-auto">
              Looks like you haven't added anything to your cart yet. Start exploring our beautiful collection!
            </p>
            <Link to="/shop">
              <Button size="lg" className="btn-gold">
                Start Shopping
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
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
        {/* Sync Indicator */}
        {showSyncIndicator && (
          <div className="bg-blue-50 border-b border-blue-200 py-2">
            <div className="container mx-auto px-4 flex items-center justify-center gap-2 text-sm text-blue-800">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Syncing cart...</span>
            </div>
          </div>
        )}

        {/* Page Header */}
        <section className="bg-muted py-12">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="font-heading text-4xl md:text-5xl font-bold mb-4">Shopping Cart</h1>
                <p className="text-muted-foreground">
                  {cartItems.length} {cartItems.length === 1 ? 'item' : 'items'} in your cart
                </p>
              </div>
              {cartItems.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRetry}
                  disabled={cartState.isLoading}
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${cartState.isLoading ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
              )}
            </div>
          </div>
        </section>

        {/* Cart Content */}
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map((item) => {
                const isItemUpdating = isUpdating === item.id;
                const isItemRemoving = isRemoving === item.id;
                const isItemLoading = isItemUpdating || isItemRemoving;

                return (
                  <Card key={`${item.id}-${item.size}-${item.color}`} className={isItemLoading ? 'opacity-60' : ''}>
                    <CardContent className="p-4 flex gap-4">
                      <Link to={`/product/${item.id}`} className="shrink-0">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-24 h-32 object-cover rounded-lg"
                          loading="lazy"
                        />
                      </Link>

                      <div className="flex-1 min-w-0">
                        <Link to={`/product/${item.id}`}>
                          <h3 className="font-heading text-lg font-semibold mb-1 hover:text-accent transition-colors truncate">
                            {item.name}
                          </h3>
                        </Link>
                        <div className="flex gap-2 text-sm text-muted-foreground mb-3">
                          {item.size && <span>Size: {item.size}</span>}
                          {item.color && <span>• {item.color}</span>}
                        </div>
                        <p className="font-heading text-xl font-bold mb-4">
                          ₹{item.price.toFixed(2)}
                        </p>

                        <div className="flex items-center justify-between flex-wrap gap-3">
                          <div className="flex items-center gap-3">
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                              disabled={isItemLoading || item.quantity <= 1}
                            >
                              {isItemUpdating ? <Loader2 className="h-4 w-4 animate-spin" /> : '-'}
                            </Button>
                            <span className="w-8 text-center font-medium">{item.quantity}</span>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                              disabled={isItemLoading}
                            >
                              {isItemUpdating ? <Loader2 className="h-4 w-4 animate-spin" /> : '+'}
                            </Button>
                          </div>

                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveItem(item.id)}
                            disabled={isItemLoading}
                            className="text-destructive hover:text-destructive"
                          >
                            {isItemRemoving ? (
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4 mr-2" />
                            )}
                            Remove
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}

              <Link to="/shop">
                <Button variant="outline" className="w-full sm:w-auto">
                  ← Continue Shopping
                </Button>
              </Link>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <Card className="sticky top-24">
                <CardContent className="p-6">
                  <h2 className="font-heading text-2xl font-bold mb-6">Order Summary</h2>

                  {/* Coupon */}
                  <div className="mb-6">
                    <label className="text-sm font-medium mb-2 block">Have a coupon code?</label>
                    <div className="flex gap-2">
                      <Input
                        type="text"
                        placeholder="Enter code"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                      />
                      <Button variant="outline">Apply</Button>
                    </div>
                  </div>

                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span className="font-medium">₹{subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Shipping</span>
                      <span className="font-medium">
                        {shipping === 0 ? 'FREE' : `₹${shipping.toFixed(2)}`}
                      </span>
                    </div>
                    {shipping === 0 && (
                      <p className="text-xs text-green-600 flex items-center gap-1">
                        <span className="text-lg">🎉</span>
                        You've qualified for free shipping!
                      </p>
                    )}
                    {subtotal < 500 && (
                      <p className="text-xs text-muted-foreground">
                        Add ₹{(500 - subtotal).toFixed(2)} more for free shipping
                      </p>
                    )}
                    <div className="border-t border-border pt-3 flex justify-between">
                      <span className="font-heading text-lg font-bold">Total</span>
                      <span className="font-heading text-lg font-bold text-accent">
                        ₹{total.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <Button 
                    size="lg" 
                    className="w-full btn-gold mb-3"
                    disabled={cartState.isLoading || cartState.isSyncing}
                  >
                    {cartState.isSyncing ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Syncing...
                      </>
                    ) : (
                      <>
                        Proceed to Checkout
                        <ArrowRight className="ml-2 h-5 w-5" />
                      </>
                    )}
                  </Button>

                  <p className="text-xs text-center text-muted-foreground">
                    🔒 Secure checkout • SSL encrypted
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Cart;
