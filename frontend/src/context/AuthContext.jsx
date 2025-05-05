import { createContext, useState, useEffect, useContext } from 'react';
import api, { getApiUrl } from '../utils/axiosConfig';

const AuthContext = createContext();

export { AuthContext }; // Export the context directly

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  // Sync cart and wishlist with server
  const syncCartWithServer = async (cartItems) => {
    if (!currentUser) return;
    
    try {
      await fetch(getApiUrl('/api/auth/sync-cart'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token ? `Bearer ${token}` : ''
        },
        credentials: 'include', // Include cookies in the request
        body: JSON.stringify({ cartItems })
      });
    } catch (error) {
      console.error('Error syncing cart with server:', error);
    }
  };
  
  const syncWishlistWithServer = async (wishlistItems) => {
    if (!currentUser) return;
    
    try {
      await fetch(getApiUrl('/api/auth/sync-wishlist'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token ? `Bearer ${token}` : ''
        },
        credentials: 'include', // Include cookies in the request
        body: JSON.stringify({ wishlistItems })
      });
    } catch (error) {
      console.error('Error syncing wishlist with server:', error);
    }
  };

  // Check if user is logged in on initial load
  useEffect(() => {
    const checkLoggedIn = async () => {
      try {
        if (token) {
          const response = await fetch(getApiUrl('/api/auth/me'), {
            headers: {
              Authorization: `Bearer ${token}`
            },
            credentials: 'include' // Include cookies in the request
          });

          if (response.ok) {
            const data = await response.json();
            setCurrentUser(data.user);
            setIsAdmin(data.user.isAdmin || false);
            
            // Load user's cart and wishlist from server and update localStorage
            if (data.user.cart && data.user.cart.length > 0) {
              localStorage.setItem('cartItems', JSON.stringify(data.user.cart));
            }
            
            if (data.user.wishlist && data.user.wishlist.length > 0) {
              localStorage.setItem('wishlistItems', JSON.stringify(data.user.wishlist));
            }
          } else {
            // Token invalid or expired
            localStorage.removeItem('token');
            setToken(null);
            setIsAdmin(false);
          }
        }
        setLoading(false);
      } catch (error) {
        console.error('Error checking authentication:', error);
        localStorage.removeItem('token');
        setToken(null);
        setIsAdmin(false);
        setLoading(false);
      }
    };

    checkLoggedIn();
  }, [token]);

  // Register user
  const register = async (userData) => {
    try {
      const response = await fetch(getApiUrl('/api/auth/register'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include', // Include cookies in the request
        body: JSON.stringify(userData)
      });

      const data = await response.json();

      if (response.ok) {
        setToken(data.token);
        setCurrentUser(data.user);
        localStorage.setItem('token', data.token);
        
        // Sync any existing cart and wishlist items with server
        const cartItems = JSON.parse(localStorage.getItem('cartItems')) || [];
        const wishlistItems = JSON.parse(localStorage.getItem('wishlistItems')) || [];
        
        if (cartItems.length > 0) {
          syncCartWithServer(cartItems);
        }
        
        if (wishlistItems.length > 0) {
          syncWishlistWithServer(wishlistItems);
        }
        
        return { success: true, data };
      } else {
        return { success: false, error: data.message };
      }
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, error: 'Registration failed. Please try again.' };
    }
  };

  // Login user
  const login = async (email, password) => {
    try {
      const response = await fetch(getApiUrl('/api/auth/login'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include', // Include cookies in the request
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (response.ok) {
        setToken(data.token);
        setCurrentUser(data.user);
        setIsAdmin(data.user.isAdmin || false);
        localStorage.setItem('token', data.token);
        
        // After login success, make another request to get the complete user data with cart/wishlist
        const userResponse = await fetch(getApiUrl('/api/auth/me'), {
          headers: {
            Authorization: `Bearer ${data.token}`
          },
          credentials: 'include' // Include cookies in the request
        });
        
        if (userResponse.ok) {
          const userData = await userResponse.json();
          
          // If user has items in their saved cart/wishlist, update localStorage
          if (userData.user.cart && userData.user.cart.length > 0) {
            localStorage.setItem('cartItems', JSON.stringify(userData.user.cart));
          }
          
          if (userData.user.wishlist && userData.user.wishlist.length > 0) {
            localStorage.setItem('wishlistItems', JSON.stringify(userData.user.wishlist));
          }
        }
        
        return { success: true, data };
      } else {
        return { success: false, error: data.message };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Login failed. Please try again.' };
    }
  };

  // Admin Login
  const adminLogin = async (email, password) => {
    try {
      const response = await fetch(getApiUrl('/api/auth/admin/login'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include', // Include cookies in the request
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (response.ok) {
        setToken(data.token);
        setCurrentUser(data.user);
        setIsAdmin(true);
        localStorage.setItem('token', data.token);
        return { success: true, data };
      } else {
        return { success: false, error: data.message };
      }
    } catch (error) {
      console.error('Admin login error:', error);
      return { success: false, error: 'Admin login failed. Please try again.' };
    }
  };

  // Logout user
  const logout = async () => {
    try {
      // Before logging out, sync cart and wishlist with server
      const cartItems = JSON.parse(localStorage.getItem('cartItems')) || [];
      const wishlistItems = JSON.parse(localStorage.getItem('wishlistItems')) || [];
      
      if (currentUser) {
        if (cartItems.length > 0) {
          await syncCartWithServer(cartItems);
        }
        
        if (wishlistItems.length > 0) {
          await syncWishlistWithServer(wishlistItems);
        }
        
        // Call server-side logout to clear the cookie
        await fetch(getApiUrl('/api/auth/logout'), {
          method: 'POST',
          credentials: 'include' // Include cookies in the request
        });
      }
      
      // Clear all user related data from localStorage
      localStorage.removeItem('token');
      localStorage.removeItem('cartItems');
      localStorage.removeItem('wishlistItems');
      
      setToken(null);
      setCurrentUser(null);
      setIsAdmin(false);
    } catch (error) {
      console.error('Logout error:', error);
      // Still clear local state even if server logout fails
      localStorage.removeItem('token');
      setToken(null);
      setCurrentUser(null);
      setIsAdmin(false);
    }
  };

  const value = {
    currentUser,
    token,
    loading,
    isAdmin,
    register,
    login,
    adminLogin,
    logout,
    syncCartWithServer,
    syncWishlistWithServer
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};