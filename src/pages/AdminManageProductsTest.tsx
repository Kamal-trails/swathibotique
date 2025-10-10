import React from 'react';
import { useProducts } from '@/contexts/ProductContext';

const AdminManageProductsTest = () => {
  const { getProducts, getAdminProducts } = useProducts();
  const allProducts = getProducts();
  const adminProducts = getAdminProducts();

  return (
    <div className="min-h-screen p-8">
      <h1 className="text-2xl font-bold mb-4">Admin Products Test</h1>
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold">All Products Count: {allProducts?.length || 0}</h2>
          <p>First product: {allProducts?.[0]?.name || 'No products'}</p>
        </div>
        <div>
          <h2 className="text-lg font-semibold">Admin Products Count: {adminProducts?.length || 0}</h2>
          <p>First admin product: {adminProducts?.[0]?.name || 'No admin products'}</p>
        </div>
        <div>
          <h2 className="text-lg font-semibold">Products List:</h2>
          <ul className="list-disc list-inside">
            {allProducts?.slice(0, 5).map((product, index) => (
              <li key={product?.id || index}>
                {product?.name || 'Unnamed Product'} - ₹{product?.price || 0}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AdminManageProductsTest;
