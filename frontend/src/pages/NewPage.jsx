import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { FaArrowRight } from 'react-icons/fa';

const NewPage = () => {
  const [products, setProducts] = useState({
    men: [],
    women: [],
    kids: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    const fetchNewProducts = async () => {
      try {
        setLoading(true);
        // Get the most recent products
        const response = await axios.get('/api/products?sort=-createdAt&limit=12');
        
        if (response.data.success) {
          // Organize products by category
          const menProducts = response.data.products.filter(p => p.category.gender === 'men').slice(0, 4);
          const womenProducts = response.data.products.filter(p => p.category.gender === 'women').slice(0, 4);
          const kidsProducts = response.data.products.filter(p => p.category.gender === 'kids').slice(0, 4);
          
          setProducts({
            men: menProducts,
            women: womenProducts,
            kids: kidsProducts
          });
        } else {
          setError('Failed to fetch new products');
          // Use dummy data as fallback
          setProducts({
            men: getDummyProducts('men'),
            women: getDummyProducts('women'),
            kids: getDummyProducts('kids')
          });
        }
      } catch (err) {
        setError('Error connecting to the server');
        console.error('Error fetching new products:', err);
        // Use dummy data if API fails
        setProducts({
          men: getDummyProducts('men'),
          women: getDummyProducts('women'),
          kids: getDummyProducts('kids')
        });
      } finally {
        setLoading(false);
      }
    };

    fetchNewProducts();
  }, []);

  // Helper function to generate dummy products if API fails
  const getDummyProducts = (gender) => {
    const basePrice = gender === 'kids' ? 69.99 : 119.99;
    
    return Array(4).fill().map((_, idx) => ({
      _id: `${gender}${idx + 1}`,
      name: `New ${gender.charAt(0).toUpperCase() + gender.slice(1)}'s Sneaker ${idx + 1}`,
      price: basePrice + (idx * 10),
      description: `Latest ${gender}'s sneaker with cutting-edge technology and design.`,
      images: [{ 
        url: `https://source.unsplash.com/random/800x600?${gender}-sneakers-${idx + 1}` 
      }],
      category: {
        gender,
        type: ['running', 'casual', 'training', 'lifestyle'][idx % 4]
      },
      sizes: [
        { size: '7', stock: 10 },
        { size: '8', stock: 15 },
        { size: '9', stock: 20 },
        { size: '10', stock: 15 },
        { size: '11', stock: 10 }
      ]
    }));
  };

  const renderProductGrid = (categoryProducts) => {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {categoryProducts.map((product) => (
          <div key={product._id} className="group bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
            <div className="relative overflow-hidden">
              <img
                src={product.images[0]?.url}
                alt={product.name}
                className="w-full h-64 object-cover transform group-hover:scale-105 transition-transform duration-300"
                onError={(e) => {
                  e.target.src = `/src/assets/${product.category.gender}.jpg`;
                }}
              />
              <div className="absolute top-0 right-0 bg-red-500 text-white text-xs font-bold px-3 py-1 m-2 rounded-full">
                NEW
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <Link 
                  to={`/product/${product._id}`}
                  className="w-full bg-white text-black px-4 py-2 rounded-full font-medium flex items-center justify-center hover:bg-gray-100 transition-colors"
                >
                  View Details
                </Link>
              </div>
            </div>
            <div className="p-4">
              <h3 className="font-medium text-lg mb-1">{product.name}</h3>
              <p className="text-gray-700 font-bold">${product.price.toFixed(2)}</p>
              <p className="text-sm text-gray-500 capitalize mt-1">
                {product.category.gender}'s {product.category.type}
              </p>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold mb-4">New Arrivals</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Explore our newest styles and latest additions. Be the first to rock these fresh kicks.
        </p>
      </div>

      {/* Category Tabs */}
      <div className="border-b border-gray-200 mb-8">
        <nav className="flex justify-center -mb-px">
          <button
            onClick={() => setActiveTab('all')}
            className={`py-4 px-6 font-medium text-lg border-b-2 ${
              activeTab === 'all'
                ? 'border-red-500 text-red-500'
                : 'border-transparent hover:border-gray-300 text-gray-500 hover:text-gray-700'
            } transition-colors`}
          >
            All New Arrivals
          </button>
          <button
            onClick={() => setActiveTab('men')}
            className={`py-4 px-6 font-medium text-lg border-b-2 ${
              activeTab === 'men'
                ? 'border-red-500 text-red-500'
                : 'border-transparent hover:border-gray-300 text-gray-500 hover:text-gray-700'
            } transition-colors`}
          >
            Men's
          </button>
          <button
            onClick={() => setActiveTab('women')}
            className={`py-4 px-6 font-medium text-lg border-b-2 ${
              activeTab === 'women'
                ? 'border-red-500 text-red-500'
                : 'border-transparent hover:border-gray-300 text-gray-500 hover:text-gray-700'
            } transition-colors`}
          >
            Women's
          </button>
          <button
            onClick={() => setActiveTab('kids')}
            className={`py-4 px-6 font-medium text-lg border-b-2 ${
              activeTab === 'kids'
                ? 'border-red-500 text-red-500'
                : 'border-transparent hover:border-gray-300 text-gray-500 hover:text-gray-700'
            } transition-colors`}
          >
            Kids'
          </button>
        </nav>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <p className="text-lg">Loading new arrivals...</p>
        </div>
      ) : error ? (
        <div className="text-center py-12 text-red-500">
          <p className="text-lg">{error}</p>
        </div>
      ) : (
        <div className="space-y-16">
          {activeTab === 'all' && (
            <>
              {Object.keys(products).map((category) => (
                <div key={category} className="mb-12">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold capitalize">{category}'s New Arrivals</h2>
                    <Link to={`/${category}`} className="text-red-500 hover:text-red-700 font-medium flex items-center">
                      View All {category}'s <FaArrowRight className="ml-2" />
                    </Link>
                  </div>
                  {renderProductGrid(products[category])}
                </div>
              ))}
            </>
          )}
          
          {activeTab === 'men' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Men's New Arrivals</h2>
                <Link to="/men" className="text-red-500 hover:text-red-700 font-medium flex items-center">
                  View All Men's <FaArrowRight className="ml-2" />
                </Link>
              </div>
              {renderProductGrid(products.men)}
            </div>
          )}
          
          {activeTab === 'women' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Women's New Arrivals</h2>
                <Link to="/women" className="text-red-500 hover:text-red-700 font-medium flex items-center">
                  View All Women's <FaArrowRight className="ml-2" />
                </Link>
              </div>
              {renderProductGrid(products.women)}
            </div>
          )}
          
          {activeTab === 'kids' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Kids' New Arrivals</h2>
                <Link to="/kids" className="text-red-500 hover:text-red-700 font-medium flex items-center">
                  View All Kids' <FaArrowRight className="ml-2" />
                </Link>
              </div>
              {renderProductGrid(products.kids)}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NewPage;