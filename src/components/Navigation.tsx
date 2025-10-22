import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Search, ShoppingBag, Heart, Menu, X, User, LogOut, Settings, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { SearchBar } from "./SearchBar";
import { useSearch } from "@/hooks/useSearch";
import { getPopularSearches } from "@/services/searchService";
import { useCart } from "@/contexts/CartContext";
import { useFavorites } from "@/contexts/FavoritesContext";
import { useAuth } from "@/contexts/AuthContext";

const Navigation = () => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  
  // Use cart and favorites contexts
  const { state: cartState } = useCart();
  const { state: favoritesState } = useFavorites();
  
  // Use auth context
  const { user, profile, isAdmin, signOut } = useAuth();
  
  // Use search hook for global search functionality
  const { query, setQuery, performSearch, suggestions, isSearching } = useSearch();
  const popularSearches = getPopularSearches();

  // Build nav links based on user role
  const baseNavLinks = [
    { name: "Home", path: "/" },
    { name: "Shop", path: "/shop" },
    { name: "About", path: "/about" },
    { name: "Contact", path: "/contact" },
  ];

  const navLinks = isAdmin 
    ? [...baseNavLinks, { name: "Admin", path: "/admin" }]
    : baseNavLinks;

  const isActive = (path: string) => location.pathname === path;

  // Handle search with navigation
  const handleSearch = (searchQuery: string) => {
    performSearch(searchQuery);
    navigate(`/shop?search=${encodeURIComponent(searchQuery)}`);
    setIsSearchOpen(false);
    // Ensure scroll to top after navigation
    setTimeout(() => window.scrollTo({ top: 0, behavior: "smooth" }), 100);
  };

  // Handle logout
  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  // Get user initials for avatar
  const getUserInitials = () => {
    if (profile?.full_name) {
      return profile.full_name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    return user?.email?.charAt(0).toUpperCase() || 'U';
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Mobile Menu */}
          <Sheet>
            <SheetTrigger asChild className="lg:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px] sm:w-[400px]">
              <nav className="flex flex-col gap-4 mt-8">
                {navLinks.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`text-lg font-medium transition-colors hover:text-accent ${
                      isActive(link.path) ? "text-accent" : "text-foreground"
                    }`}
                  >
                    {link.name}
                  </Link>
                ))}
              </nav>
            </SheetContent>
          </Sheet>

          {/* Logo */}
          <Link to="/" className="flex items-center">
            <h1 className="text-2xl font-heading font-bold tracking-tight">
              JAANU <span className="text-accent">BOUTIQUE</span>
            </h1>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex lg:gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`link-underline text-sm font-medium transition-colors ${
                  isActive(link.path) ? "text-accent" : "text-foreground hover:text-accent"
                }`}
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Search */}
            <div className="hidden sm:block">
              {isSearchOpen ? (
                <div className="w-[300px]">
                  <SearchBar
                    query={query}
                    onQueryChange={setQuery}
                    onSearch={handleSearch}
                    suggestions={suggestions}
                    popularSearches={popularSearches}
                    isSearching={isSearching}
                    placeholder="Search sarees, lehengas, kurtas..."
                  />
                </div>
              ) : (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsSearchOpen(true)}
                >
                  <Search className="h-5 w-5" />
                </Button>
              )}
            </div>

            {/* Mobile Search */}
            <Button variant="ghost" size="icon" className="sm:hidden">
              <Search className="h-5 w-5" />
            </Button>

            {/* Account */}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={profile?.avatar_url} />
                      <AvatarFallback className="text-xs bg-accent text-white">
                        {getUserInitials()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {profile?.full_name || 'User'}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/profile" className="cursor-pointer">
                      <Settings className="mr-2 h-4 w-4" />
                      Profile Settings
                    </Link>
                  </DropdownMenuItem>
                  {isAdmin && (
                    <DropdownMenuItem asChild>
                      <Link to="/admin" className="cursor-pointer">
                        <ShieldCheck className="mr-2 h-4 w-4" />
                        Admin Dashboard
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-600">
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link to="/login">
                <Button variant="ghost" size="sm" className="gap-2">
                  <User className="h-4 w-4" />
                  <span className="hidden sm:inline">Sign In</span>
                </Button>
              </Link>
            )}

            {/* Wishlist */}
            <Link to="/wishlist">
              <Button variant="ghost" size="icon" className="relative">
                <Heart className="h-5 w-5" />
                {favoritesState.count > 0 && (
                  <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-accent text-[10px] font-medium text-primary-foreground flex items-center justify-center">
                    {favoritesState.count}
                  </span>
                )}
              </Button>
            </Link>

            {/* Cart */}
            <Link to="/cart">
              <Button variant="ghost" size="icon" className="relative">
                <ShoppingBag className="h-5 w-5" />
                {cartState.totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-accent text-[10px] font-medium text-primary-foreground flex items-center justify-center">
                    {cartState.totalItems}
                  </span>
                )}
              </Button>
            </Link>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Navigation;
