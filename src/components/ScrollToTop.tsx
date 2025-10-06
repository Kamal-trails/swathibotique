/**
 * ScrollToTop Component
 * Ensures page scrolls to top on route changes
 * Following Single Responsibility Principle - only handles scroll restoration
 */

import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const ScrollToTop = () => {
  const { pathname, search } = useLocation();

  useEffect(() => {
    // Scroll to top when pathname or search params change
    // Use setTimeout to ensure DOM is ready
    const scrollToTop = () => {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: "smooth", // Smooth scroll animation
      });
    };

    // Small delay to ensure page content is loaded
    const timeoutId = setTimeout(scrollToTop, 100);

    // Cleanup timeout on unmount
    return () => clearTimeout(timeoutId);
  }, [pathname, search]);

  // Also handle immediate scroll for instant navigation
  useEffect(() => {
    // Immediate scroll for instant feedback
    window.scrollTo(0, 0);
  }, [pathname]);

  return null; // This component doesn't render anything
};

export default ScrollToTop;
