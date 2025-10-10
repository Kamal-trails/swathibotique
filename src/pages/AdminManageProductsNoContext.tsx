import React from 'react';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';

const AdminManageProductsNoContext = () => {
  console.log('AdminManageProductsNoContext rendering...');
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <main className="flex-1 p-8">
        <h1 className="text-2xl font-bold mb-4">Admin Manage Products - No Context Test</h1>
        <p>This version doesn't use ProductContext at all.</p>
        <div className="mt-4">
          <p>If you can see this, the issue is with ProductContext.</p>
          <p>Current time: {new Date().toLocaleString()}</p>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AdminManageProductsNoContext;
