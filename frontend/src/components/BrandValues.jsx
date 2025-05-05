import React from 'react';
import { FaTrophy, FaLeaf, FaRunning, FaBolt } from 'react-icons/fa';

const BrandValues = () => {
  const values = [
    {
      icon: <FaTrophy className="text-4xl mb-4 text-amber-500" />,
      title: 'Premium Quality',
      description: 'We partner with leading brands to bring you the highest quality footwear designed for performance and style.'
    },
    {
      icon: <FaLeaf className="text-4xl mb-4 text-green-500" />,
      title: 'Sustainability',
      description: 'Our commitment to the planet means we source eco-friendly materials and implement sustainable practices.'
    },
    {
      icon: <FaRunning className="text-4xl mb-4 text-blue-500" />,
      title: 'Performance Focused',
      description: 'Every sneaker is tested to ensure it delivers the performance you need, whether for sports or everyday wear.'
    },
    {
      icon: <FaBolt className="text-4xl mb-4 text-yellow-500" />,
      title: 'Innovation',
      description: 'We continuously seek out innovative designs and technologies that push the boundaries of footwear.'
    }
  ];

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-3 text-gray-900">Why Choose SneakerHub</h2>
        <p className="text-gray-600 text-center mb-12 max-w-3xl mx-auto">
          We're dedicated to providing the best sneaker shopping experience with our commitment to these core values.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {values.map((value, index) => (
            <div key={index} className="bg-gray-50 p-6 rounded-lg text-center hover:shadow-md transition-shadow duration-300">
              <div className="flex justify-center">
                {value.icon}
              </div>
              <h3 className="text-xl font-bold mb-2">{value.title}</h3>
              <p className="text-gray-600">{value.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BrandValues;