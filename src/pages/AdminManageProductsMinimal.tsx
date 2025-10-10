import React from 'react';

const AdminManageProductsMinimal = () => {
  console.log('AdminManageProductsMinimal rendering...');
  
  return (
    <div className="min-h-screen p-8">
      <h1 className="text-2xl font-bold">Admin Manage Products - Minimal Test</h1>
      <p>If you can see this, the basic component is working.</p>
      <div className="mt-4">
        <p>Current time: {new Date().toLocaleString()}</p>
      </div>
    </div>
  );
};

export default AdminManageProductsMinimal;
