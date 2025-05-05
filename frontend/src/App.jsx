import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import AdminNavbar from './components/AdminNavbar';
import Slideshow from './components/Slideshow';
import PromoBanner from './components/PromoBanner';
import FeaturedProducts from './components/FeaturedProducts';
import BrandValues from './components/BrandValues';
import Newsletter from './components/Newsletter';
import TrendingSection from './components/TrendingSection';
import Footer from './components/Footer';
import MenPage from './pages/MenPage';
import WomenPage from './pages/WomenPage';
import KidsPage from './pages/KidsPage';
import WishlistPage from './pages/WishlistPage';
import CartPage from './pages/CartPage';
import ProductPage from './pages/ProductPage';
import PaymentPage from './pages/PaymentPage';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import NewPage from './pages/NewPage';
import SearchPage from './pages/SearchPage';
import ProfilePage from './pages/ProfilePage';
import { useAuth } from './context/AuthContext';
import axios from 'axios';

// Private route component for admin-only routes
const AdminRoute = ({ children }) => {
  const { isAdmin, loading } = useAuth();
  
  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  
  return isAdmin ? children : <Navigate to="/admin/login" />;
};

// Private route component for authenticated users
const PrivateRoute = ({ children }) => {
  const { currentUser, loading } = useAuth();
  
  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  
  return currentUser ? children : <Navigate to="/" />;
};

function App() {
  const { isAdmin } = useAuth();
  const location = useLocation();
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Fetch featured products for the homepage
  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        const response = await axios.get('/api/products?featured=true&limit=6');
        if (response.data.success) {
          setFeaturedProducts(response.data.products);
        }
      } catch (err) {
        console.error('Error fetching featured products:', err);
      } finally {
        setLoading(false);
      }
    };
    
    if (location.pathname === '/') {
      fetchFeaturedProducts();
    }
  }, [location.pathname]);
  
  // Check if the current route is an admin route
  const isAdminRoute = location.pathname.startsWith('/admin');
  
  // Determine which navbar to show
  const showAdminNavbar = isAdmin && isAdminRoute;
  
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 flex flex-col">
      {showAdminNavbar ? <AdminNavbar /> : <Navbar />}
      <main className="flex-grow pt-16"> {/* Added pt-16 (padding-top) to account for navbar height */}
        <Routes>
          <Route path="/" element={
            <div className="animate-fadeIn">
              <Slideshow />
              <PromoBanner />
              <div className="bg-white py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  <TrendingSection products={featuredProducts.slice(0, 3)} />
                </div>
              </div>
              <div className="py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  <FeaturedProducts products={featuredProducts} />
                </div>
              </div>
              <div className="bg-gray-100 py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  <BrandValues />
                </div>
              </div>
              <Newsletter />
            </div>
          } />
          <Route path="/men" element={<MenPage />} />
          <Route path="/women" element={<WomenPage />} />
          <Route path="/kids" element={<KidsPage />} />
          <Route path="/wishlist" element={<WishlistPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/product/:id" element={<ProductPage />} />
          <Route path="/payment" element={<PaymentPage />} />
          <Route path="/new" element={<NewPage />} />
          <Route path="/search" element={<SearchPage />} />
          
          {/* Profile Route */}
          <Route 
            path="/profile" 
            element={
              <PrivateRoute>
                <ProfilePage />
              </PrivateRoute>
            } 
          />
          
          {/* Admin Routes */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route 
            path="/admin/dashboard" 
            element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            } 
          />
        </Routes>
      </main>
      {!isAdminRoute && <Footer />}
    </div>
  );
}

export default App;