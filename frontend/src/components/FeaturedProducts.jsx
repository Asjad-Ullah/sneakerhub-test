import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const FeaturedProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        setLoading(true);
        // Fetch featured products from your database
        const response = await axios.get('/api/products?featured=true&limit=4');
        
        if (response.data.success) {
          setProducts(response.data.products);
        } else {
          setError('Failed to fetch featured products');
        }
      } catch (err) {
        setError('Error connecting to the server');
        console.error('Error fetching featured products:', err);
        // Use dummy data if API fails
        setProducts([
          {
            _id: '1',
            name: 'Air Max Pulse',
            price: 159.99,
            images: [{ url: 'https://static.nike.com/a/images/t_PDP_1280_v1/f_auto,q_auto:eco/71a539fc-3e64-4f39-b566-b1fd5c086e74/air-max-pulse-shoes-QShhG8.png' }],
            category: { gender: 'men', type: 'running' }
          },
          {
            _id: '2',
            name: 'React Infinity',
            price: 129.99,
            images: [{ url: 'https://static.nike.com/a/images/t_PDP_1280_v1/f_auto,q_auto:eco/a3cc1859-5eb9-4586-a5e0-7eaabd9a1e78/react-infinity-3-road-running-shoes-mMGgGZ.png' }],
            category: { gender: 'women', type: 'running' }
          },
          {
            _id: '3',
            name: 'Metcon 8',
            price: 139.99,
            images: [{ url: 'https://static.nike.com/a/images/t_PDP_1280_v1/f_auto,q_auto:eco/a2aaf1a2-165a-4922-a823-57ce95798f6f/metcon-8-workout-shoes-p9rQzw.png' }],
            category: { gender: 'men', type: 'training' }
          },
          {
            _id: '4',
            name: 'Air Zoom Pegasus',
            price: 124.99,
            images: [{ url: 'https://static.nike.com/a/images/t_PDP_1280_v1/f_auto,q_auto:eco/5a8e9cea-a7a0-4f17-9ee2-c4800978ff99/pegasus-40-road-running-shoes-0Z8bQV.png' }],
            category: { gender: 'women', type: 'running' }
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedProducts();
  }, []);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-8 text-gray-900">
          Featured Collection
        </h2>
        <div className="flex justify-center">
          <div className="animate-pulse flex flex-col items-center">
            <div className="h-4 bg-gray-200 rounded w-32 mb-6"></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {[...Array(4)].map((_, index) => (
                <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden w-64">
                  <div className="h-64 bg-gray-200"></div>
                  <div className="p-4">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-8 text-gray-900">
          Featured Collection
        </h2>
        <div className="text-center text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 bg-white">
      <h2 className="text-3xl md:text-4xl font-bold text-center mb-2 text-gray-900">
        Featured Collection
      </h2>
      <p className="text-gray-600 text-center mb-10 max-w-2xl mx-auto">
        Discover our hand-picked selection of the season's most coveted styles.
      </p>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {products.map((product) => (
          <div key={product._id} className="group bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
            <div className="relative overflow-hidden">
              <img
                src={product.images[0]?.url}
                alt={product.name}
                className="w-full h-64 object-cover transform group-hover:scale-105 transition-transform duration-500"
                onError={(e) => {
                  console.error(`Failed to load image: ${product.name}`);
                  e.target.src = 'https://via.placeholder.com/300x300?text=Product+Image';
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-red-600/50 via-red-500/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                  <Link 
                    to={`/product/${product._id}`}
                    className="bg-white text-red-600 px-6 py-2 rounded-full font-medium hover:bg-red-50 transition-colors shadow-lg"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            </div>
            <div className="p-5">
              <h3 className="font-semibold text-lg mb-1">{product.name}</h3>
              <p className="text-gray-700 font-medium mb-1">${product.price.toFixed(2)}</p>
              <p className="text-sm text-gray-500 capitalize">
                {product.category.gender}'s {product.category.type}
              </p>
            </div>
          </div>
        ))}
      </div>
      
      <div className="text-center mt-12">
        <Link 
          to="/new" 
          className="inline-block bg-black text-white px-8 py-3 rounded-full font-semibold hover:bg-gray-800 transition-colors shadow-md"
        >
          View All Products
        </Link>
      </div>
    </section>
  );
};

export default FeaturedProducts;