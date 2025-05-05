import React, { useState, useEffect } from 'react';
import { FaHeart, FaShoppingBag, FaBars, FaTimes, FaUser, FaRunning } from 'react-icons/fa';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AuthModal from './AuthModal';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);
  const { currentUser, logout, syncCartWithServer, syncWishlistWithServer } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Handle scroll effect for navbar
  useEffect(() => {
    const handleScroll = () => {
      const offset = window.scrollY;
      if (offset > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Update cart and wishlist counts whenever they might change
  useEffect(() => {
    const updateCounts = () => {
      const cartItems = JSON.parse(localStorage.getItem('cartItems')) || [];
      const wishlistItems = JSON.parse(localStorage.getItem('wishlistItems')) || [];
      
      setCartCount(cartItems.length);
      setWishlistCount(wishlistItems.length);
      
      // Sync with server if user is logged in
      if (currentUser) {
        syncCartWithServer(cartItems);
        syncWishlistWithServer(wishlistItems);
      }
    };

    // Update counts when component mounts
    updateCounts();

    // Set up event listener for storage changes
    window.addEventListener('storage', updateCounts);

    // Create an interval to check for updates (localStorage events don't trigger in the same tab)
    const interval = setInterval(updateCounts, 1000);

    return () => {
      window.removeEventListener('storage', updateCounts);
      clearInterval(interval);
    };
  }, [currentUser, syncCartWithServer, syncWishlistWithServer]);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsOpen(false);
  }, [location]);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const toggleAuthModal = () => {
    setShowAuthModal(!showAuthModal);
  };

  return (
    <nav className={`fixed top-0 left-0 w-full bg-white text-black z-50 ${
      scrolled ? 'shadow-md' : ''
    } transition-all duration-300`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex-shrink-0">
            <Link to="/" className="group relative flex items-center">
              <div className="flex items-center overflow-hidden">
                <div className="bg-red-600 text-white p-1.5 rounded-lg transform -rotate-6 shadow-md transition-transform group-hover:rotate-0 mr-2">
                  <FaRunning className="text-xl" />
                </div>
                <div className="font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-red-600 via-red-500 to-orange-500 text-2xl tracking-tighter hover:tracking-normal transition-all duration-300">
                  SNEAKER<span className="font-light italic">hub</span>
                </div>
              </div>
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-red-600 to-orange-500 group-hover:w-full transition-all duration-500"></span>
            </Link>
          </div>
          <div className="hidden md:flex space-x-8">
            <Link to="/new" className={`font-medium ${location.pathname === '/new' ? 'text-red-600' : 'text-gray-800'} hover:text-red-600 transition-colors relative py-2 group`}>
              New
              <span className={`absolute bottom-0 left-0 w-0 h-0.5 bg-red-600 group-hover:w-full transition-all duration-300 ${location.pathname === '/new' ? 'w-full' : 'w-0'}`}></span>
            </Link>
            <Link to="/men" className={`font-medium ${location.pathname === '/men' ? 'text-red-600' : 'text-gray-800'} hover:text-red-600 transition-colors relative py-2 group`}>
              Men
              <span className={`absolute bottom-0 left-0 w-0 h-0.5 bg-red-600 group-hover:w-full transition-all duration-300 ${location.pathname === '/men' ? 'w-full' : 'w-0'}`}></span>
            </Link>
            <Link to="/women" className={`font-medium ${location.pathname === '/women' ? 'text-red-600' : 'text-gray-800'} hover:text-red-600 transition-colors relative py-2 group`}>
              Women
              <span className={`absolute bottom-0 left-0 w-0 h-0.5 bg-red-600 group-hover:w-full transition-all duration-300 ${location.pathname === '/women' ? 'w-full' : 'w-0'}`}></span>
            </Link>
            <Link to="/kids" className={`font-medium ${location.pathname === '/kids' ? 'text-red-600' : 'text-gray-800'} hover:text-red-600 transition-colors relative py-2 group`}>
              Kids
              <span className={`absolute bottom-0 left-0 w-0 h-0.5 bg-red-600 group-hover:w-full transition-all duration-300 ${location.pathname === '/kids' ? 'w-full' : 'w-0'}`}></span>
            </Link>
          </div>
          <div className="hidden md:flex items-center space-x-5">
            <Link to="/wishlist" className="relative group" aria-label="Wishlist">
              <FaHeart className="text-xl text-gray-700 hover:text-red-600 transition-colors" />
              <span className={`absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-600 text-white text-xs flex items-center justify-center ${wishlistCount > 0 ? 'opacity-100' : 'opacity-0'} transition-opacity`}>{wishlistCount}</span>
            </Link>
            <Link to="/cart" className="relative group" aria-label="Cart">
              <FaShoppingBag className="text-xl text-gray-700 hover:text-red-600 transition-colors" />
              <span className={`absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-600 text-white text-xs flex items-center justify-center ${cartCount > 0 ? 'opacity-100' : 'opacity-0'}`}>{cartCount}</span>
            </Link>
            {currentUser ? (
              <div className="flex items-center space-x-3 ml-4 border-l pl-4 border-gray-200">
                <Link to="/profile" className="font-medium text-gray-800 hover:text-red-600 transition-colors">
                  Hi, {currentUser.firstName}
                </Link>
                <button 
                  onClick={logout}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-3 py-1.5 rounded-md text-sm font-medium transition-colors hover:text-red-600"
                >
                  Logout
                </button>
              </div>
            ) : (
              <button 
                onClick={toggleAuthModal}
                data-testid="login-button"
                className="flex items-center space-x-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md transition-colors ml-4"
              >
                <FaUser className="text-sm" />
                <span>Login</span>
              </button>
            )}
          </div>
          <div className="md:hidden flex items-center space-x-4">
            <Link to="/cart" className="relative" aria-label="Cart">
              <FaShoppingBag className="text-xl text-gray-700" />
              <span className={`absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-600 text-white text-xs flex items-center justify-center ${cartCount > 0 ? 'opacity-100' : 'opacity-0'}`}>{cartCount}</span>
            </Link>
            <button onClick={toggleMenu} aria-label="Toggle menu" className="p-1">
              {isOpen ? (
                <FaTimes className="text-xl text-gray-800" />
              ) : (
                <FaBars className="text-xl text-gray-800" />
              )}
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden bg-white text-black shadow-lg border-t border-gray-100 transition-all duration-300 max-h-[85vh] overflow-y-auto">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 divide-y divide-gray-100">
            <div className="py-2">
              <Link
                to="/new"
                className={`block px-3 py-2.5 text-base font-medium hover:text-red-600 hover:bg-gray-50 rounded-md transition-colors ${location.pathname === '/new' ? 'text-red-600' : 'text-gray-800'}`}
                onClick={toggleMenu}
              >
                New
              </Link>
              <Link
                to="/men"
                className={`block px-3 py-2.5 text-base font-medium hover:text-red-600 hover:bg-gray-50 rounded-md transition-colors ${location.pathname === '/men' ? 'text-red-600' : 'text-gray-800'}`}
                onClick={toggleMenu}
              >
                Men
              </Link>
              <Link
                to="/women"
                className={`block px-3 py-2.5 text-base font-medium hover:text-red-600 hover:bg-gray-50 rounded-md transition-colors ${location.pathname === '/women' ? 'text-red-600' : 'text-gray-800'}`}
                onClick={toggleMenu}
              >
                Women
              </Link>
              <Link
                to="/kids"
                className={`block px-3 py-2.5 text-base font-medium hover:text-red-600 hover:bg-gray-50 rounded-md transition-colors ${location.pathname === '/kids' ? 'text-red-600' : 'text-gray-800'}`}
                onClick={toggleMenu}
              >
                Kids
              </Link>
            </div>
            <div className="py-2">
              <Link
                to="/wishlist"
                className="block px-3 py-2.5 text-base font-medium text-gray-800 hover:text-red-600 hover:bg-gray-50 rounded-md transition-colors"
                onClick={toggleMenu}
              >
                Wishlist {wishlistCount > 0 && <span className="ml-2 px-2 py-0.5 bg-red-100 text-red-600 rounded-full text-xs">{wishlistCount}</span>}
              </Link>
              <Link
                to="/cart"
                className="block px-3 py-2.5 text-base font-medium text-gray-800 hover:text-red-600 hover:bg-gray-50 rounded-md transition-colors"
                onClick={toggleMenu}
              >
                Cart {cartCount > 0 && <span className="ml-2 px-2 py-0.5 bg-red-100 text-red-600 rounded-full text-xs">{cartCount}</span>}
              </Link>
            </div>
            <div className="py-2">
              {currentUser ? (
                <>
                  <Link
                    to="/profile"
                    className="block px-3 py-2.5 text-base font-medium text-gray-800 hover:text-red-600 hover:bg-gray-50 rounded-md transition-colors"
                    onClick={toggleMenu}
                  >
                    Hello, {currentUser.firstName}
                  </Link>
                  <button
                    onClick={() => {
                      logout();
                      toggleMenu();
                    }}
                    className="block w-full text-left px-3 py-2.5 text-base font-medium text-red-600 hover:bg-red-50 rounded-md transition-colors"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <button
                  onClick={() => {
                    toggleMenu();
                    toggleAuthModal();
                  }}
                  className="block w-full text-left px-3 py-2.5 text-base font-medium text-gray-800 hover:text-red-600 hover:bg-gray-50 rounded-md transition-colors"
                >
                  Login / Signup
                </button>
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* Auth Modal */}
      <AuthModal isOpen={showAuthModal} onClose={toggleAuthModal} />
    </nav>
  );
};

export default Navbar;