import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/axiosConfig';
import womenFallbackImage from '../assets/women.jpg';

const WomenPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filter states
  const [typeFilter, setTypeFilter] = useState('All');
  const [priceRange, setPriceRange] = useState([0, 500]);
  const [sizeFilter, setSizeFilter] = useState('All');
  const [sortBy, setSortBy] = useState('default');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Handle price range changes
  const handlePriceChange = (e, type) => {
    const value = parseInt(e.target.value);
    setPriceRange(prev => 
      type === 'min' ? [value, prev[1]] : [prev[0], value]
    );
  };
  
  // Fetch women's products from the API
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await api.get('/api/products/category/women');
        if (response.data.success) {
          setProducts(response.data.products);
        } else {
          setError('Failed to fetch products');
        }
      } catch (err) {
        setError('Error connecting to the server');
        console.error('Error fetching products:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Extract unique product types for category filtering
  const productTypes = ['All', ...new Set(products.map(product => 
    product.category.type.charAt(0).toUpperCase() + product.category.type.slice(1)
  ))];
  
  // Extract all available sizes from products
  const allSizes = ['All', ...[...new Set(
    products.flatMap(product => product.sizes.map(size => size.size))
  )].sort((a, b) => a - b)];
  
  // Apply all filters and sorting to products
  const filteredProducts = products
    // Filter by search query
    .filter(product => 
      searchQuery === '' || 
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase())
    )
    // Filter by type
    .filter(product => 
      typeFilter === 'All' || 
      (product.category.type.charAt(0).toUpperCase() + product.category.type.slice(1)) === typeFilter
    )
    // Filter by price range
    .filter(product => 
      product.price >= priceRange[0] && product.price <= priceRange[1]
    )
    // Filter by size
    .filter(product => 
      sizeFilter === 'All' || 
      product.sizes.some(size => size.size === sizeFilter)
    )
    // Sort products
    .sort((a, b) => {
      switch (sortBy) {
        case 'price-asc':
          return a.price - b.price;
        case 'price-desc':
          return b.price - a.price;
        case 'newest':
          return new Date(b.createdAt) - new Date(a.createdAt);
        default:
          return 0;
      }
    });

  // Reset all filters
  const resetFilters = () => {
    setTypeFilter('All');
    setPriceRange([0, 500]);
    setSizeFilter('All');
    setSortBy('default');
    setSearchQuery('');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold mb-8">Women's Sneakers</h1>
      
      {/* Loading state */}
      {loading && (
        <div className="text-center py-12">
          <p className="text-lg">Loading products...</p>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="text-center py-12 text-red-500">
          <p className="text-lg">{error}</p>
        </div>
      )}
      
      {/* Content when products are loaded */}
      {!loading && !error && (
        <>
          {/* Search bar */}
          <div className="mb-8">
            <div className="relative">
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-full pl-10 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
              <div className="absolute left-3 top-3.5">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Filters sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white p-5 rounded-lg shadow">
                <div className="flex justify-between items-center mb-5">
                  <h2 className="text-xl font-semibold">Filters</h2>
                  <button 
                    onClick={resetFilters}
                    className="text-sm text-red-500 hover:text-red-700"
                  >
                    Reset all
                  </button>
                </div>
                
                {/* Category filter */}
                <div className="mb-6">
                  <h3 className="text-lg font-medium mb-3">Category</h3>
                  <div className="flex flex-wrap gap-2">
                    {productTypes.map(category => (
                      <button
                        key={category}
                        onClick={() => setTypeFilter(category)}
                        className={`px-3 py-1.5 rounded-full text-sm font-medium ${
                          typeFilter === category 
                            ? 'bg-red-500 text-white' 
                            : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                        }`}
                      >
                        {category}
                      </button>
                    ))}
                  </div>
                </div>
                
                {/* Price range filter */}
                <div className="mb-6">
                  <h3 className="text-lg font-medium mb-3">Price Range</h3>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-gray-600">${priceRange[0]}</span>
                    <span>-</span>
                    <span className="text-gray-600">${priceRange[1]}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="min-price" className="block text-sm font-medium text-gray-700 mb-1">Min</label>
                      <input
                        type="number"
                        id="min-price"
                        min="0"
                        max={priceRange[1]}
                        value={priceRange[0]}
                        onChange={(e) => handlePriceChange(e, 'min')}
                        className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-red-500"
                      />
                    </div>
                    <div>
                      <label htmlFor="max-price" className="block text-sm font-medium text-gray-700 mb-1">Max</label>
                      <input
                        type="number"
                        id="max-price"
                        min={priceRange[0]}
                        max="1000"
                        value={priceRange[1]}
                        onChange={(e) => handlePriceChange(e, 'max')}
                        className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-red-500"
                      />
                    </div>
                  </div>
                </div>
                
                {/* Size filter */}
                <div className="mb-6">
                  <h3 className="text-lg font-medium mb-3">Sizes</h3>
                  <div className="flex flex-wrap gap-2">
                    {allSizes.map(size => (
                      <button
                        key={size}
                        onClick={() => setSizeFilter(size)}
                        className={`px-3 py-1.5 rounded-full text-sm font-medium ${
                          sizeFilter === size 
                            ? 'bg-red-500 text-white' 
                            : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
                
                {/* Sort options */}
                <div>
                  <h3 className="text-lg font-medium mb-3">Sort By</h3>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-red-500"
                  >
                    <option value="default">Default</option>
                    <option value="price-asc">Price: Low to High</option>
                    <option value="price-desc">Price: High to Low</option>
                    <option value="newest">Newest</option>
                  </select>
                </div>
              </div>
            </div>
            
            {/* Products grid */}
            <div className="lg:col-span-3">
              <div className="mb-4 flex justify-between items-center">
                <p className="text-gray-600">{filteredProducts.length} products found</p>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.map(product => (
                  <div key={product._id} className="group">
                    <Link to={`/product/${product._id}`} className="block">
                      <div className="relative overflow-hidden rounded-lg mb-3">
                        <img 
                          src={product.images[0]?.url || womenFallbackImage} 
                          alt={product.images[0]?.alt || product.name} 
                          className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        {/* Button visible on mobile, and on hover for desktop */}
                        <div className="absolute bottom-0 left-0 right-0 p-4 md:transform md:translate-y-full md:group-hover:translate-y-0 transition-transform duration-300 flex justify-center">
                          <span
                            className="w-full bg-red-500 text-white px-4 py-2 rounded-full flex items-center justify-center hover:bg-red-600 transition-colors duration-300"
                          >
                            View Product
                          </span>
                        </div>
                      </div>
                      <h3 className="font-medium text-lg">{product.name}</h3>
                      <p className="text-gray-700">${product.price}</p>
                    </Link>
                  </div>
                ))}
              </div>
              
              {filteredProducts.length === 0 && (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                  <h3 className="text-xl font-medium">No products found</h3>
                  <p className="text-gray-600 mt-2">Try adjusting your filters or check back later</p>
                  <button 
                    onClick={resetFilters}
                    className="mt-4 px-4 py-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                  >
                    Reset Filters
                  </button>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default WomenPage;