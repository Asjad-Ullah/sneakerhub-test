import React from 'react';
import { Link } from 'react-router-dom';
import { FaArrowRight } from 'react-icons/fa';

// Fallback trending categories in case product data isn't available
const fallbackTrendingCategories = [
  {
    title: 'Running Essentials',
    description: 'Engineered for performance and comfort on any terrain.',
    image: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1587&q=80',
    link: '/men?category=running'
  },
  {
    title: 'Lifestyle Collection',
    description: 'Casual styles that blend fashion and function.',
    image: 'https://images.unsplash.com/photo-1600181516264-3ea807ff44b9?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1587&q=80',
    link: '/women?category=lifestyle'
  },
  {
    title: 'Training & Gym',
    description: 'Built for stability and performance during workouts.',
    image: 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1464&q=80',
    link: '/men?category=training'
  }
];

const TrendingSection = ({ products = [] }) => {
  // Map trending categories from product data or use fallbacks
  const trendingCategories = products.length >= 3 
    ? products.map(product => ({
        title: getCategoryTitle(product.category.type),
        description: getCategoryDescription(product.category.type),
        image: product.images[0]?.url,
        link: `/${product.category.gender}?category=${product.category.type}`,
        productId: product._id
      }))
    : fallbackTrendingCategories;

  // Helper function to get a user-friendly title from category type
  function getCategoryTitle(type) {
    const titles = {
      'running': 'Running Essentials',
      'lifestyle': 'Lifestyle Collection',
      'training': 'Training & Gym',
      'casual': 'Casual Styles',
      'sports': 'Sports Performance',
      'basketball': 'Basketball Collection'
    };
    
    return titles[type] || `${type.charAt(0).toUpperCase() + type.slice(1)} Collection`;
  }
  
  // Helper function to get a description based on category type
  function getCategoryDescription(type) {
    const descriptions = {
      'running': 'Engineered for performance and comfort on any terrain.',
      'lifestyle': 'Casual styles that blend fashion and function.',
      'training': 'Built for stability and performance during workouts.',
      'casual': 'Everyday comfort with stylish design.',
      'sports': 'Designed for athletic performance and durability.',
      'basketball': 'Court-ready styles for peak performance.'
    };
    
    return descriptions[type] || 'Premium quality shoes for any occasion.';
  }

  return (
    <section className="py-16 bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">Trending Categories</h2>
            <p className="text-gray-600 max-w-2xl">
              Explore our most popular collections curated for every activity and style preference.
            </p>
          </div>
          <Link 
            to="/new" 
            className="mt-4 md:mt-0 inline-flex items-center bg-black text-white px-5 py-2.5 rounded-full font-medium hover:bg-gray-800 transition-colors"
          >
            Explore All <FaArrowRight className="ml-2" />
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {trendingCategories.map((category, index) => (
            <div 
              key={index} 
              className="relative rounded-xl overflow-hidden group h-96 shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <img 
                src={category.image} 
                alt={category.title} 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                onError={(e) => {
                  console.error(`Failed to load image: ${category.title}`);
                  e.target.src = fallbackTrendingCategories[index % fallbackTrendingCategories.length].image;
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent flex flex-col justify-end p-6 text-white">
                <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                  <h3 className="text-xl md:text-2xl font-bold mb-2">{category.title}</h3>
                  <p className="mb-4 text-sm md:text-base opacity-90">{category.description}</p>
                  <Link 
                    to={category.link}
                    className="inline-flex items-center bg-red-500 hover:bg-red-600 text-white px-5 py-2 rounded-full font-medium transition-colors group"
                  >
                    <span>Explore</span>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-2 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrendingSection;