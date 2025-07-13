"use client"
import React, { useState, useEffect } from 'react';
import ProductList from '@/pages/components/ProductList';
import ProductForm, { Product } from '@/pages/components/ProductForm';
import { Toaster, toast } from 'react-hot-toast';
import Spinner from '@/pages/components/Spinner';


const App: React.FC = () => {
  const [showForm, setShowForm] = useState<boolean>(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [refreshKey, setRefreshKey] = useState<number>(0);
  const [loading,setLoading]=useState(false);

  useEffect(() => {
    const handlePopState = () => {
      setRefreshKey(prev => prev + 1);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const handleAddProduct = () => {
    setEditingProduct(null);
    setShowForm(true);
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setShowForm(true);
  };

  const handleFormSuccess = (product: Product) => {
    setShowForm(false);
    setEditingProduct(null);
    setRefreshKey(prev => prev + 1);
    // toast.success(`Product ${product.title} saved successfully!`);
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingProduct(null);
  };

  return (
    <>
      <Toaster position="top-right" />
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex-shrink-0">
                <h1 className="text-xl font-bold text-gray-900">
                  Product Management System
                </h1>
              </div>
              <div className="text-sm text-gray-500">
                Manage your products efficiently
              </div>
            </div>
          </div>
        </header>

        {/* Main */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <ProductList
            key={refreshKey}
            onAddProduct={handleAddProduct}
            onEditProduct={handleEditProduct}
          />
        </main>

        {/* Modal Form */}
        {showForm && (
          <ProductForm
            product={editingProduct}
            onSuccess={handleFormSuccess}
            onCancel={handleFormCancel}
            setLoading={setLoading}
          />
        )}

        {/* Footer */}
        <footer className="bg-white border-t mt-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="text-center text-sm text-gray-500">
              © 2025 Product Management System. Built with React and Tailwind CSS.
            </div>
          </div>
        </footer>

        {loading && (
                <span className="fixed inset-0 bg-gray-500/50 flex justify-center items-center z-100">
                  <Spinner loading={loading} />
                </span>
              )}
      </div>
    </>
  );
};

export default App;
