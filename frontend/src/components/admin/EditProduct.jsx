import React, { useState, useEffect } from 'react';
import { FaTimes, FaImage, FaSave } from 'react-icons/fa';

const EditProduct = ({ token, productId, setActiveSection }) => {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState(null);
  const [submitError, setSubmitError] = useState(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  
  // State for direct image URL input
  const [imageUrl, setImageUrl] = useState('');
  const [imageAlt, setImageAlt] = useState('');
  
  // Fetch product data when component mounts
  useEffect(() => {
    if (productId) {
      fetchProduct(productId);
    }
  }, [productId, token]);
  
  // Fetch product details from the API
  const fetchProduct = async (id) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`http://localhost:5000/api/products/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch product details');
      }
      
      setProduct(data.product);
    } catch (err) {
      console.error('Error fetching product:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  // Handle form change
  const handleProductFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setProduct(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else if (type === 'checkbox') {
      setProduct(prev => ({
        ...prev,
        [name]: checked
      }));
    } else {
      setProduct(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };
  
  // Handle size input changes
  const handleSizeChange = (index, field, value) => {
    setProduct(prev => {
      const updatedSizes = [...prev.sizes];
      updatedSizes[index] = {
        ...updatedSizes[index],
        [field]: field === 'stock' ? parseInt(value, 10) : value
      };
      return {
        ...prev,
        sizes: updatedSizes
      };
    });
  };
  
  // Add new size option
  const addSizeOption = () => {
    setProduct(prev => ({
      ...prev,
      sizes: [...prev.sizes, { size: '', stock: 0 }]
    }));
  };
  
  // Remove size option
  const removeSizeOption = (index) => {
    setProduct(prev => {
      const updatedSizes = prev.sizes.filter((_, i) => i !== index);
      return {
        ...prev,
        sizes: updatedSizes
      };
    });
  };
  
  // Add image URL to the product
  const addImageUrl = () => {
    if (!imageUrl) {
      setSubmitError('Image URL is required');
      return;
    }
    
    const newImage = {
      url: imageUrl,
      alt: imageAlt || 'Product image'
    };
    
    setProduct(prev => ({
      ...prev,
      images: [...prev.images, newImage]
    }));
    
    // Reset image input fields
    setImageUrl('');
    setImageAlt('');
    setSubmitError(null);
  };
  
  // Remove image from the product
  const removeImage = (index) => {
    setProduct(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };
  
  // Handle product update
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setSubmitLoading(true);
      setSubmitError(null);
      setSubmitSuccess(false);
      
      // Validate form data
      if (
        !product.name ||
        !product.description ||
        !product.price ||
        product.sizes.length === 0 ||
        product.images.length === 0
      ) {
        throw new Error('All fields are required, including at least one image URL');
      }
      
      // Prepare the product data to match the backend model
      const productData = {
        ...product,
        price: parseFloat(product.price),
      };
      
      // Make the API request
      const response = await fetch(`http://localhost:5000/api/products/${productId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(productData)
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to update product');
      }
      
      setSubmitSuccess(true);
      
      // After successful update, redirect back to products after 1.5 seconds
      setTimeout(() => {
        setActiveSection('products');
      }, 1500);
      
    } catch (err) {
      console.error('Error updating product:', err);
      setSubmitError(err.message);
    } finally {
      setSubmitLoading(false);
    }
  };
  
  if (loading) {
    return (
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-6">Edit Product</h1>
        <div className="bg-white rounded-lg shadow p-6 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mb-4"></div>
          <p className="ml-3">Loading product data...</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-6">Edit Product</h1>
        <div className="bg-red-100 text-red-700 p-4 rounded-md mb-4">
          {error}
        </div>
        <button
          onClick={() => setActiveSection('products')}
          className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded font-medium transition-colors"
        >
          Back to Products
        </button>
      </div>
    );
  }
  
  if (!product) {
    return (
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-6">Edit Product</h1>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-500">Product not found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Edit Product: {product.name}</h1>
        <button 
          onClick={() => setActiveSection('products')}
          className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded font-medium transition-colors"
        >
          Back to Products
        </button>
      </div>
      
      <div className="bg-white rounded-lg shadow p-6">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Product Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={product.name}
                onChange={handleProductFormChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                required
              />
            </div>
            <div>
              <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
                Price ($)
              </label>
              <input
                type="number"
                id="price"
                name="price"
                value={product.price}
                onChange={handleProductFormChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                min="0"
                step="0.01"
                required
              />
            </div>
          </div>
          
          <div className="mb-6">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={product.description}
              onChange={handleProductFormChange}
              rows="4"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              required
            ></textarea>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label htmlFor="category.gender" className="block text-sm font-medium text-gray-700 mb-1">
                Gender
              </label>
              <select
                id="category.gender"
                name="category.gender"
                value={product.category.gender}
                onChange={handleProductFormChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                required
              >
                <option value="men">Men</option>
                <option value="women">Women</option>
                <option value="kids">Kids</option>
              </select>
            </div>
            <div>
              <label htmlFor="category.type" className="block text-sm font-medium text-gray-700 mb-1">
                Type
              </label>
              <select
                id="category.type"
                name="category.type"
                value={product.category.type}
                onChange={handleProductFormChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                required
              >
                <option value="running">Running</option>
                <option value="casual">Casual</option>
                <option value="sports">Sports</option>
                <option value="training">Training</option>
                <option value="basketball">Basketball</option>
                <option value="lifestyle">Lifestyle</option>
              </select>
            </div>
          </div>
          
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sizes
            </label>
            {product.sizes.map((size, index) => (
              <div key={index} className="flex items-center space-x-4 mb-2">
                <input
                  type="text"
                  placeholder="Size"
                  value={size.size}
                  onChange={(e) => handleSizeChange(index, 'size', e.target.value)}
                  className="w-1/2 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  required
                />
                <input
                  type="number"
                  placeholder="Stock"
                  value={size.stock}
                  onChange={(e) => handleSizeChange(index, 'stock', e.target.value)}
                  className="w-1/2 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  min="0"
                  required
                />
                <button
                  type="button"
                  onClick={() => removeSizeOption(index)}
                  className="text-red-600 hover:text-red-800"
                >
                  <FaTimes />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={addSizeOption}
              className="mt-2 inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              Add Size
            </button>
          </div>
          
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Images
            </label>
            <div className="mb-4 flex items-end space-x-2">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Image URL"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 mb-2"
                />
                <input
                  type="text"
                  placeholder="Image Alt Text (optional)"
                  value={imageAlt}
                  onChange={(e) => setImageAlt(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
              <button
                type="button"
                onClick={addImageUrl}
                className="h-10 flex-shrink-0 inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                <FaImage className="mr-2" /> Add Image
              </button>
            </div>
            
            {product.images.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {product.images.map((image, index) => (
                  <div key={index} className="relative group border border-gray-200 rounded-md overflow-hidden">
                    <img
                      src={image.url}
                      alt={image.alt}
                      className="w-full h-32 object-cover"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "https://via.placeholder.com/150?text=Image+Error";
                      }}
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200"></div>
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                      title="Remove image"
                    >
                      <FaTimes />
                    </button>
                    <div className="absolute bottom-0 left-0 right-0 bg-gray-800 bg-opacity-75 text-white text-xs p-1 truncate">
                      {image.alt || "Product image"}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center p-8 border-2 border-dashed border-gray-300 rounded-md">
                <FaImage className="mx-auto h-12 w-12 text-gray-400" />
                <p className="mt-2 text-sm text-gray-500">
                  No images added yet. Add an image URL above.
                </p>
              </div>
            )}
          </div>
          
          <div className="mb-6">
            <label htmlFor="featured" className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="featured"
                name="featured"
                checked={product.featured}
                onChange={handleProductFormChange}
                className="form-checkbox h-5 w-5 text-red-600"
              />
              <span className="text-sm font-medium text-gray-700">Featured Product</span>
            </label>
          </div>
          
          {submitError && (
            <div className="bg-red-100 text-red-700 p-4 mb-6 rounded-md">
              {submitError}
            </div>
          )}
          {submitSuccess && (
            <div className="bg-green-100 text-green-700 p-4 mb-6 rounded-md">
              Product updated successfully! Redirecting...
            </div>
          )}
          
          <div className="flex justify-end">
            <button
              type="submit"
              className={`bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-md font-medium transition-colors flex items-center ${
                submitLoading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              disabled={submitLoading}
            >
              <FaSave className="mr-2" />
              {submitLoading ? 'Updating...' : 'Update Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProduct;