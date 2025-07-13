"use client";

import React, { useState, useEffect, ChangeEvent, FormEvent } from "react";
import { X, Upload, Calendar } from "lucide-react";
import Spinner from "@/pages/components/Spinner";
import toast, { Toaster } from "react-hot-toast";
import axios from "axios";

export type Product = {
  _id: string;
  title: string;
  description?: string;
  status: "Active" | "Inactive";
  date: string;
  imageUrl?: string;
};

type ProductFormProps = {
  product?: Product | null;
  onSuccess: (product: Product) => void;
  onCancel: () => void;
  setLoading: any;
};

type FormData = {
  title: string;
  description: string;
  status: "Active" | "Inactive";
  date_added: string;
  image: File | string | null;
};

type Errors = {
  [key in keyof FormData]?: string;
};

const ProductForm: React.FC<ProductFormProps> = ({
  product = null,
  onSuccess,
  onCancel,
  setLoading,
}) => {
  const [formData, setFormData] = useState<FormData>({
    title: "",
    description: "",
    status: "Active",
    date_added: new Date().toISOString().split("T")[0],
    image: null,
  });

  const [errors, setErrors] = useState<Errors>({});
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  useEffect(() => {
    if (product) {
      setFormData({
        title: product.title || "",
        description: product.description || "",
        status: product.status || "Active",
        date_added:
          product.date?.split("T")[0] || new Date().toISOString().split("T")[0],
        image: product.imageUrl || null,
      });

      if (product.imageUrl) {
        setImagePreview(product.imageUrl);
      }
    }
  }, [product]);

  const validateForm = () => {
    const newErrors: Errors = {};

    if (!formData.title.trim()) newErrors.title = "Title is required";
    if (!formData.status) newErrors.status = "Status is required";

    if (!formData.date_added) {
      newErrors.date_added = "Date is required";
    } else {
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(formData.date_added)) {
        newErrors.date_added = "Invalid date format";
      }
    }

    if (!formData.image) {
      newErrors.image = "Product image is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (
    e: ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name as keyof FormData]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const allowedTypes = ["image/png", "image/jpg", "image/jpeg"];
      if (!allowedTypes.includes(file.type)) {
        toast.error("Invalid image type (png, jpg, jpeg)");
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image must be less than 5MB");
        return;
      }

      setFormData((prev) => ({ ...prev, image: file }));
      setErrors((prev) => ({ ...prev, image: "" }));

      const reader = new FileReader();
      reader.onload = (event) => {
        setImagePreview(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setFormData((prev) => ({ ...prev, image: null }));
    setImagePreview(null);
  };

  const uploadImageToImgbb = async (imageFile: File): Promise<string | null> => {
    try {
      const apiKey = "24911fe2b96d052203dd9889e71c2242";

      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve, reject) => {
        reader.onloadend = () =>
          resolve((reader.result as string).split(",")[1]);
        reader.onerror = () => reject(new Error("Failed to read file"));
      });
      reader.readAsDataURL(imageFile);
      const base64Image = await base64Promise;

      const formData = new FormData();
      formData.append("image", base64Image);

      const response = await fetch(
        `https://api.imgbb.com/1/upload?key=${apiKey}`,
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json();
      if (data.success) {
        return data.data.image.url;
      } else {
        console.error("ImgBB Upload failed:", data);
        toast.error("Image upload failed");
        return null;
      }
    } catch (error) {
      console.error("Error uploading to ImgBB:", error);
      toast.error("Image upload error");
      return null;
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      let imageUrl: string | null = null;

      if (formData.image && typeof formData.image !== "string") {
        imageUrl = await uploadImageToImgbb(formData.image);
        if (!imageUrl) {
          setLoading(false);
          return;
        }
      } else if (typeof formData.image === "string") {
        imageUrl = formData.image;
      }

      const payload = {
        title: formData.title,
        description: formData.description,
        status: formData.status.toLowerCase(),
        date: formData.date_added,
        imageUrl: imageUrl || "",
      };

      let response;
      if (product) {
        response = await axios.put(
          `/api/products/${product._id}`,
          payload,
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        toast.success("Product updated successfully");
      } else {
        response = await axios.post(
          `/api/products`,
          payload,
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        toast.success("Product created successfully");
      }

      onSuccess(response.data.product || response.data);
    } catch (error: any) {
      console.log(error);
      toast.error(
        error?.response?.data?.message || error.message || "Error occurred"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Toaster />
      <div className="fixed inset-0 flex items-center justify-center backdrop-blur-xs z-60">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b">
            <h2 className="text-xl font-semibold">
              {product ? "Edit Product" : "Add New Product"}
            </h2>
            <button
              type="button"
              onClick={onCancel}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Title *
              </label>
              <input
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-md ${
                  errors.title ? "border-red-500" : "border-gray-300"
                } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                placeholder="Enter product title"
              />
              {errors.title && (
                <p className="text-sm text-red-600 mt-1">{errors.title}</p>
              )}
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Description
              </label>
              <textarea
                name="description"
                rows={4}
                value={formData.description}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter description"
              />
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Status *
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-md ${
                  errors.status ? "border-red-500" : "border-gray-300"
                } focus:outline-none focus:ring-2 focus:ring-blue-500`}
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
              {errors.status && (
                <p className="text-sm text-red-600 mt-1">{errors.status}</p>
              )}
            </div>

            {/* Date Added */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Date Added *
              </label>
              <div className="relative">
                <input
                  type="date"
                  name="date_added"
                  value={formData.date_added}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-md ${
                    errors.date_added ? "border-red-500" : "border-gray-300"
                  } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                />
                <Calendar className="absolute right-3 top-2.5 w-5 h-5 text-gray-400 pointer-events-none" />
              </div>
              {errors.date_added && (
                <p className="text-sm text-red-600 mt-1">
                  {errors.date_added}
                </p>
              )}
            </div>

            {/* Image Upload */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Product Image *
              </label>
              {imagePreview ? (
                <div className="relative inline-block">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-32 h-32 object-cover rounded-lg border"
                  />
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="relative border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600 mb-2">
                    Click to upload or drag and drop
                  </p>
                  <p className="text-xs text-gray-500">
                    PNG, JPG, JPEG up to 5MB
                  </p>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                </div>
              )}
              {errors.image && (
                <p className="text-sm text-red-600 mt-2">
                  {errors.image}
                </p>
              )}
            </div>

            {/* Form Actions */}
            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex justify-center items-center disabled:opacity-50"
              >
                {product ? "Update Product" : "Create Product"}
              </button>
              <button
                type="button"
                onClick={onCancel}
                className="flex-1 border border-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default ProductForm;
