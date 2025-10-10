import { Link } from "react-router-dom";
import { Heart, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/CartContext";
import { useFavorites } from "@/contexts/FavoritesContext";
import { Product } from "@/types/product";

interface ProductCardProps {
  product: Product;
}

const ProductCard = ({ product }: ProductCardProps) => {
  const { addToCart, isInCart } = useCart();
  const { isFavorite, toggleFavorite } = useFavorites();
  
  const { id, name, price, image, category, isNew, discount } = product;
  const discountedPrice = discount ? price - (price * discount) / 100 : null;
  const isInFavorites = isFavorite(id);

  return (
    <div className="card-product group">
      <Link to={`/product/${id}`}>
        <div className="relative overflow-hidden aspect-[4/5]">
          <img
            src={image}
            alt={name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
          {isNew && (
            <span className="absolute top-3 left-3 bg-accent text-primary-foreground px-3 py-1 text-xs font-medium rounded-full">
              New
            </span>
          )}
          {discount && (
            <span className="absolute top-3 right-3 bg-destructive text-destructive-foreground px-3 py-1 text-xs font-medium rounded-full">
              -{discount}%
            </span>
          )}
          
          {/* Hover Actions */}
          <div className="absolute inset-0 bg-primary/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2">
            <Button
              size="icon"
              variant="secondary"
              className="rounded-full opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-300"
              onClick={(e) => {
                e.preventDefault();
                toggleFavorite(product);
              }}
            >
              <Heart className={`h-5 w-5 ${isInFavorites ? 'fill-accent text-accent' : ''}`} />
            </Button>
            <Button
              size="icon"
              variant="secondary"
              className="rounded-full opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-300 delay-75"
              onClick={(e) => {
                e.preventDefault();
                addToCart(product);
              }}
            >
              <ShoppingBag className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </Link>

      <div className="p-4">
        <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">{category}</p>
        <Link to={`/product/${id}`}>
          <h3 className="font-medium mb-2 hover:text-accent transition-colors line-clamp-1">
            {name}
          </h3>
        </Link>
        <div className="flex items-center gap-2">
          {discountedPrice ? (
            <>
              <span className="font-heading text-lg font-semibold text-accent">
                ₹{discountedPrice.toFixed(0)}
              </span>
              <span className="text-sm text-muted-foreground line-through">
                ₹{price.toFixed(0)}
              </span>
            </>
          ) : (
            <span className="font-heading text-lg font-semibold">
              ₹{price.toFixed(0)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
