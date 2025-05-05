import React from 'react';
import { Link } from 'react-router-dom';
import { FaFacebook, FaTwitter, FaInstagram, FaYoutube, FaLock } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';

const Footer = () => {
  const { isAdmin } = useAuth();
  
  return (
    <footer className="bg-gray-100 pt-12 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">About SneakerHub</h3>
            <p className="text-gray-600 mb-4">
              The ultimate destination for sneaker enthusiasts, offering the latest and greatest in footwear fashion.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-600 hover:text-red-500">
                <FaFacebook size={20} />
              </a>
              <a href="#" className="text-gray-600 hover:text-red-500">
                <FaTwitter size={20} />
              </a>
              <a href="#" className="text-gray-600 hover:text-red-500">
                <FaInstagram size={20} />
              </a>
              <a href="#" className="text-gray-600 hover:text-red-500">
                <FaYoutube size={20} />
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Shop</h3>
            <ul className="space-y-2">
              <li><Link to="/men" className="text-gray-600 hover:text-red-500">Men</Link></li>
              <li><Link to="/women" className="text-gray-600 hover:text-red-500">Women</Link></li>
              <li><Link to="/kids" className="text-gray-600 hover:text-red-500">Kids</Link></li>
              <li><Link to="/new" className="text-gray-600 hover:text-red-500">New Arrivals</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Help</h3>
            <ul className="space-y-2">
              <li><Link to="/faqs" className="text-gray-600 hover:text-red-500">FAQs</Link></li>
              <li><Link to="/shipping" className="text-gray-600 hover:text-red-500">Shipping</Link></li>
              <li><Link to="/returns" className="text-gray-600 hover:text-red-500">Returns</Link></li>
              <li><Link to="/contact" className="text-gray-600 hover:text-red-500">Contact Us</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Newsletter</h3>
            <p className="text-gray-600 mb-4">Subscribe to get special offers, free giveaways, and once-in-a-lifetime deals.</p>
            <div className="flex">
              <input 
                type="email" 
                placeholder="Your email" 
                className="px-4 py-2 w-full border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
              <button 
                className="bg-red-500 text-white px-4 py-2 rounded-r-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
              >
                Sign Up
              </button>
            </div>
          </div>
        </div>
        
        <div className="border-t border-gray-200 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-500 text-center">
              © {new Date().getFullYear()} SneakerHub. All rights reserved.
            </p>
            <Link 
              to={isAdmin ? "/admin/dashboard" : "/admin/login"}
              className="flex items-center text-gray-500 hover:text-red-500 mt-4 md:mt-0"
            >
              <FaLock className="mr-2" /> {isAdmin ? "Admin Dashboard" : "Admin Login"}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;