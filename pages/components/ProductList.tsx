"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import {
  Filter,
  Plus,
  Edit,
  Trash2,
  Calendar,
  Package,
  Image as ImageIcon,
} from "lucide-react";
import Spinner from "@/pages/components/Spinner";
import { Product } from "@/pages/components/ProductForm";

export type ProductListProps = {
  onAddProduct: () => void;
  onEditProduct: (product: Product) => void;
};

type ProductFilters = {
  status: string;
  start_date: string;
  end_date: string;
};

const ProductList: React.FC<ProductListProps> = ({
  onAddProduct,
  onEditProduct,
}) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showFilters, setShowFilters] = useState<boolean>(false);
  const [filters, setFilters] = useState<ProductFilters>({
    status: "",
    start_date: "",
    end_date: "",
  });

  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_ENDPOINT;

  useEffect(() => {
    console.log("Running fetchProducts in useEffect");
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);

      const url = `/api/products`;

      const response = await axios({
        method: "GET",
        url,
        params: {
          ...(filters.status && { status: filters.status }),
          ...(filters.start_date && { startDate: filters.start_date }),
          ...(filters.end_date && { endDate: filters.end_date }),
        },
      });

      const data = response.data;
      setProducts(data || []);
       toast.success(`Fetch ${data.length} Products `);
    } catch (error: any) {
      toast.error(`Failed to load products: ${error.message}`);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (name: keyof ProductFilters, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const clearFilters = () => {
    setFilters({
      status: "",
      start_date: "",
      end_date: "",
    });
    fetchProducts();
  };

  const handleDeleteProduct = async (product: any) => {
    console.log(product);
    if (!window.confirm(`Are you sure you want to delete "${product.title}"?`)) {
      return;
    }

    try {
      const url = `/api/products/${product._id}`;

      await axios({
        method: "DELETE",
        url,
      });

      toast.success("Product deleted successfully");
      fetchProducts();
    } catch (error: any) {
      toast.error(`Failed to delete product: ${error.message}`);
    }
  };

  const formatDate = (dateString: string | undefined) => {
  if (!dateString) return "N/A";
  const parsed = new Date(dateString);
  if (isNaN(parsed.getTime())) return "Invalid Date";

  return parsed.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

  const getStatusBadge = (status: string) => {
    const base =
      "px-2 py-1 rounded-full text-xs font-medium inline-block whitespace-nowrap";
    return status === "active"
      ? `${base} bg-green-100 text-green-800`
      : `${base} bg-red-100 text-red-800`;
  };

  return (
  <div className="space-y-6">
    {/* Header */}
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Products</h1>
        <p className="text-gray-600">Manage your product inventory</p>
      </div>
      <div className="flex gap-2">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 border border-gray-300 px-4 py-2 rounded-md hover:bg-gray-100 transition-colors"
        >
          <Filter className="w-4 h-4" />
          Filters
        </button>
        <button
          onClick={onAddProduct}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Product
        </button>
      </div>
    </div>

    {/* Filters */}
     {showFilters && (
        <div className="bg-gray-50 p-4 rounded-lg border">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange("status", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Status</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>

            {/* Start Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Date
              </label>
              <input
                type="date"
                value={filters.start_date}
                onChange={(e) =>
                  handleFilterChange("start_date", e.target.value)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* End Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Date
              </label>
              <input
                type="date"
                value={filters.end_date}
                onChange={(e) =>
                  handleFilterChange("end_date", e.target.value)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Clear Filters */}
            <div className="flex items-end gap-2">
                <button
                    onClick={fetchProducts}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors cursor-pointer"
                >
                    Search
                </button>
                <button
                    onClick={clearFilters}
                    className="w-full border border-gray-300 px-4 py-2 rounded-md hover:bg-gray-100 transition-colors cursor-pointer"
                >
                    Clear Filters
                </button>
                </div>

          </div>
        </div>
      )}

    {/* Loading overlay */}
    {loading ? (
      <div className="fixed inset-0 bg-gray-500/50 flex justify-center items-center z-50">
        <Spinner loading={loading} />
      </div>
    ) : products.length === 0 ? (
      <div className="text-center py-12">
        <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          No products found
        </h3>
        <p className="text-gray-600 mb-4">
          {Object.values(filters).some((f) => f)
            ? "Try adjusting your filters or add a new product."
            : "Get started by adding your first product."}
        </p>
      </div>
    ) : (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {products.map((product) => (
          <div
            key={product._id}
            className="bg-white rounded-lg border shadow-sm hover:shadow-md transition-shadow"
          >
            {/* Image */}
            <div className="aspect-square bg-gray-100 rounded-t-lg overflow-hidden">
              {product?.imageUrl ? (
                <img
                  src={product?.imageUrl}
                  alt={product.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <ImageIcon className="w-12 h-12 text-gray-300" />
                </div>
              )}
            </div>

            {/* Info */}
            <div className="p-4">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold text-gray-900 truncate flex-1">
                  {product.title}
                </h3>
                <span className={getStatusBadge(product.status)}>
                  {product.status}
                </span>
              </div>
              {product.description && (
                <p className="text-sm text-gray-600 mb-3 line-clamp-2" title={product.description}>
                  {product.description}
                </p>
              )}
              <div className="flex items-center text-sm text-gray-500 mb-4">
                <Calendar className="w-4 h-4 mr-1" />
                {formatDate(product.date)}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => onEditProduct(product)}
                  className="flex-1 border border-gray-300 text-gray-700 px-3 py-2 text-sm rounded-md hover:bg-gray-100"
                >
                  <Edit className="w-4 h-4 mr-1 inline" />
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteProduct(product)}
                  className="flex-1 border border-red-300 text-red-600 px-3 py-2 text-sm rounded-md hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4 mr-1 inline" />
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    )}

    {/* Results Count */}
    {!loading && products.length > 0 && (
      <div className="text-center text-sm text-gray-600">
        Showing {products.length} product
        {products.length !== 1 ? "s" : ""}
      </div>
    )}
  </div>
);

};

export default ProductList;
