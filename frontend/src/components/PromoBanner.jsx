import React from 'react';
import { Link } from 'react-router-dom';
import { FaShippingFast, FaUndo, FaHeadset } from 'react-icons/fa';

const PromoBanner = () => {
  return (
    <section className="bg-red-500 text-white py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
          <div className="flex flex-col items-center">
            <FaShippingFast className="text-3xl mb-2" />
            <h3 className="font-bold text-lg">Free Shipping</h3>
            <p className="text-sm">On all orders over $100</p>
          </div>
          <div className="flex flex-col items-center">
            <FaUndo className="text-3xl mb-2" />
            <h3 className="font-bold text-lg">30-Day Returns</h3>
            <p className="text-sm">Easy return policy</p>
          </div>
          <div className="flex flex-col items-center">
            <FaHeadset className="text-3xl mb-2" />
            <h3 className="font-bold text-lg">24/7 Support</h3>
            <p className="text-sm">Customer service excellence</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PromoBanner;