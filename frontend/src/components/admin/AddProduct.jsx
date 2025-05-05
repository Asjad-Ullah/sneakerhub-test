import React, { useState, useEffect } from 'react';
import { FaTimes, FaImage } from 'react-icons/fa';
import { sanitizeInput, sanitizeObject, isValidUrl } from '../../utils/validation';

const AddProduct = ({ token }) => {
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  
  // State for direct image URL input
  const [imageUrl, setImageUrl] = useState('');
  const [imageAlt, setImageAlt] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  // Size presets based on gender
  const sizePresets = {
    men: [
      { size: '7', stock: 10 },
      { size: '8', stock: 10 },
      { size: '9', stock: 10 },
      { size: '10', stock: 10 },
      { size: '11', stock: 10 }
    ],
    women: [
      { size: '5', stock: 10 },
      { size: '6', stock: 10 },
      { size: '7', stock: 10 },
      { size: '8', stock: 10 },
      { size: '9', stock: 10 }
    ],
    kids: [
      { size: '1', stock: 10 },
      { size: '2', stock: 10 },
      { size: '3', stock: 10 },
      { size: '4', stock: 10 },
      { size: '5', stock: 10 }
    ]
  };
  
  // New Product form state
  const [newProductForm, setNewProductForm] = useState({
    name: '',
    description: '',
    price: '',
    category: {
      gender: 'men',
      type: 'running'
    },
    sizes: sizePresets.men,
    images: [],
    featured: false
  });

  // Update sizes when gender changes
  useEffect(() => {
    if (newProductForm.category.gender) {
      setNewProductForm(prev => ({
        ...prev,
        sizes: sizePresets[prev.category.gender]
      }));
    }
  }, [newProductForm.category.gender]);

  // Handle new product form change
  const handleProductFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    // Sanitize input values
    const sanitizedValue = type === 'checkbox' ? checked : sanitizeInput(value);
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setNewProductForm(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: sanitizedValue
        }
      }));
    } else if (type === 'checkbox') {
      setNewProductForm(prev => ({
        ...prev,
        [name]: sanitizedValue
      }));
    } else {
      setNewProductForm(prev => ({
        ...prev,
        [name]: sanitizedValue
      }));
    }
  };
  
  // Handle size input changes
  const handleSizeChange = (index, field, value) => {
    // Sanitize the size value
    const sanitizedValue = sanitizeInput(value);
    
    setNewProductForm(prev => {
      const updatedSizes = [...prev.sizes];
      updatedSizes[index] = {
        ...updatedSizes[index],
        [field]: field === 'stock' ? parseInt(sanitizedValue, 10) || 0 : sanitizedValue
      };
      return {
        ...prev,
        sizes: updatedSizes
      };
    });
  };
  
  // Add new size option
  const addSizeOption = () => {
    setNewProductForm(prev => ({
      ...prev,
      sizes: [...prev.sizes, { size: '', stock: 0 }]
    }));
  };
  
  // Remove size option
  const removeSizeOption = (index) => {
    setNewProductForm(prev => {
      const updatedSizes = prev.sizes.filter((_, i) => i !== index);
      return {
        ...prev,
        sizes: updatedSizes
      };
    });
  };
  
  // Set image URL with sanitization
  const handleImageUrlChange = (e) => {
    setImageUrl(sanitizeInput(e.target.value));
  };
  
  // Set image alt text with sanitization
  const handleImageAltChange = (e) => {
    setImageAlt(sanitizeInput(e.target.value));
  };
  
  // Add image URL to the product
  const addImageUrl = () => {
    // Reset any previous errors
    setFieldErrors({});
    
    if (!imageUrl) {
      setFieldErrors(prev => ({ ...prev, imageUrl: 'Image URL is required' }));
      return;
    }
    
    // Validate URL format
    if (!isValidUrl(imageUrl)) {
      setFieldErrors(prev => ({ ...prev, imageUrl: 'Please enter a valid URL' }));
      return;
    }
    
    const newImage = {
      url: sanitizeInput(imageUrl),
      alt: sanitizeInput(imageAlt) || 'Product image'
    };
    
    setNewProductForm(prev => ({
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
    setNewProductForm(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  // Validate the product form
  const validateProductForm = () => {
    const errors = {};
    
    if (!newProductForm.name.trim()) {
      errors.name = 'Product name is required';
    }
    
    if (!newProductForm.description.trim()) {
      errors.description = 'Product description is required';
    }
    
    if (!newProductForm.price) {
      errors.price = 'Price is required';
    } else if (isNaN(parseFloat(newProductForm.price)) || parseFloat(newProductForm.price) <= 0) {
      errors.price = 'Please enter a valid price';
    }
    
    if (newProductForm.sizes.length === 0) {
      errors.sizes = 'At least one size is required';
    } else {
      // Check if all sizes have valid values
      const hasSizeError = newProductForm.sizes.some(size => !size.size.trim() || size.stock < 0);
      if (hasSizeError) {
        errors.sizes = 'All sizes must have a size name and a valid stock amount';
      }
    }
    
    if (newProductForm.images.length === 0) {
      errors.images = 'At least one product image is required';
    }
    
    return errors;
  };

  // Handle new product submission
  const handleNewProductSubmit = async (e) => {
    e.preventDefault();
    
    // Reset errors
    setFieldErrors({});
    setSubmitError(null);
    
    // Validate form
    const validationErrors = validateProductForm();
    if (Object.keys(validationErrors).length > 0) {
      setFieldErrors(validationErrors);
      setSubmitError('Please correct the errors in the form');
      return;
    }
    
    try {
      setSubmitLoading(true);
      setSubmitSuccess(false);
      
      // Format the product data with properly structured category object
      const productData = {
        name: newProductForm.name,
        description: newProductForm.description,
        price: parseFloat(newProductForm.price),
        // Explicitly structure the category as a nested object
        category: {
          gender: newProductForm.category.gender,
          type: newProductForm.category.type
        },
        sizes: Array.isArray(newProductForm.sizes) ? newProductForm.sizes.map(item => ({
          size: item.size,
          stock: parseInt(item.stock, 10) || 0
        })) : [],
        images: Array.isArray(newProductForm.images) ? newProductForm.images.map(item => ({
          url: item.url,
          alt: item.alt || 'Product image'
        })) : [],
        featured: newProductForm.featured
      };
      
      // Skip sanitization for troubleshooting as it might be affecting the nested structure
      // const sanitizedProductData = sanitizeObject(productData);
      
      console.log('Sending product data:', JSON.stringify(productData, null, 2));
      
      // Make the API request with the raw product data
      const response = await fetch('http://localhost:5000/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(productData)
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to create product');
      }
      
      // Reset form on success
      setNewProductForm({
        name: '',
        description: '',
        price: '',
        category: {
          gender: 'men',
          type: 'running'
        },
        sizes: sizePresets.men,
        images: [],
        featured: false
      });
      setSubmitSuccess(true);
      
    } catch (err) {
      console.error('Error creating product:', err);
      setSubmitError(err.message);
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <div className="mb-8">
      <h1 className="text-2xl font-bold mb-6">Add New Product</h1>
      <div className="bg-white rounded-lg shadow p-6">
        <form onSubmit={handleNewProductSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Product Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={newProductForm.name}
                onChange={handleProductFormChange}
                className={`w-full px-4 py-2 border ${fieldErrors.name ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-red-500`}
                required
              />
              {fieldErrors.name && (
                <p className="text-red-500 text-xs mt-1">{fieldErrors.name}</p>
              )}
            </div>
            <div>
              <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
                Price ($)
              </label>
              <input
                type="number"
                id="price"
                name="price"
                value={newProductForm.price}
                onChange={handleProductFormChange}
                className={`w-full px-4 py-2 border ${fieldErrors.price ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-red-500`}
                min="0"
                step="0.01"
                required
              />
              {fieldErrors.price && (
                <p className="text-red-500 text-xs mt-1">{fieldErrors.price}</p>
              )}
            </div>
          </div>
          
          <div className="mb-6">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={newProductForm.description}
              onChange={handleProductFormChange}
              rows="4"
              className={`w-full px-4 py-2 border ${fieldErrors.description ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-red-500`}
              required
            ></textarea>
            {fieldErrors.description && (
              <p className="text-red-500 text-xs mt-1">{fieldErrors.description}</p>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label htmlFor="category.gender" className="block text-sm font-medium text-gray-700 mb-1">
                Gender
              </label>
              <select
                id="category.gender"
                name="category.gender"
                value={newProductForm.category.gender}
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
                value={newProductForm.category.type}
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
            {fieldErrors.sizes && (
              <p className="text-red-500 text-xs mb-2">{fieldErrors.sizes}</p>
            )}
            {newProductForm.sizes.map((size, index) => (
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
            {fieldErrors.images && (
              <p className="text-red-500 text-xs mb-2">{fieldErrors.images}</p>
            )}
            <div className="mb-4 flex items-end space-x-2">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Image URL"
                  value={imageUrl}
                  onChange={handleImageUrlChange}
                  className={`w-full px-4 py-2 border ${fieldErrors.imageUrl ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 mb-2`}
                />
                {fieldErrors.imageUrl && (
                  <p className="text-red-500 text-xs mb-2">{fieldErrors.imageUrl}</p>
                )}
                <input
                  type="text"
                  placeholder="Image Alt Text (optional)"
                  value={imageAlt}
                  onChange={handleImageAltChange}
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
            
            {newProductForm.images.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {newProductForm.images.map((image, index) => (
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
                checked={newProductForm.featured}
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
              Product created successfully!
            </div>
          )}
          
          <div className="flex justify-end">
            <button
              type="submit"
              className={`bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-md font-medium transition-colors ${
                submitLoading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              disabled={submitLoading}
            >
              {submitLoading ? 'Creating...' : 'Create Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddProduct;