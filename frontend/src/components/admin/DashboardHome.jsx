import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { getApiUrl } from '../../utils/axiosConfig';
import { 
  BarChart, Bar, LineChart, Line, PieChart, Pie, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  ResponsiveContainer, Cell
} from 'recharts';
import { 
  FiUsers, FiShoppingBag, FiDollarSign, 
  FiPackage, FiAlertCircle, FiArrowUp, FiArrowDown 
} from 'react-icons/fi';

const DashboardHome = ({ currentUser }) => {
  const { token } = useContext(AuthContext);
  const [dashboardStats, setDashboardStats] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Color palette for charts
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];
  
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Fetch dashboard statistics
        const statsResponse = await fetch(getApiUrl('/api/auth/admin/dashboard-stats'), {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!statsResponse.ok) {
          throw new Error('Failed to fetch dashboard statistics');
        }
        
        const statsData = await statsResponse.json();
        
        // Fetch recent orders
        const ordersResponse = await fetch(getApiUrl('/api/orders/admin?limit=5'), {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!ordersResponse.ok) {
          throw new Error('Failed to fetch recent orders');
        }
        
        const ordersData = await ordersResponse.json();
        
        setDashboardStats(statsData.stats);
        setRecentOrders(ordersData.orders || []);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setError(error.message);
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, [token]);

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  // Get status color
  const getStatusColor = (status) => {
    const statusColors = {
      'pending': 'bg-yellow-100 text-yellow-800',
      'processing': 'bg-blue-100 text-blue-800',
      'shipped': 'bg-purple-100 text-purple-800',
      'delivered': 'bg-green-100 text-green-800',
      'cancelled': 'bg-red-100 text-red-800'
    };
    return statusColors[status] || 'bg-gray-100 text-gray-800';
  };

  // Calculate percent change
  const calculatePercentChange = (current, previous) => {
    if (!previous) return 0;
    return ((current - previous) / previous) * 100;
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 text-red-700 p-4 rounded-md mb-4">
        Error loading dashboard data: {error}
      </div>
    );
  }

  // Return default content if no data is available
  if (!dashboardStats) {
    return (
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-700">
            Welcome to the admin dashboard. Select an option from the sidebar to manage your store.
          </p>
          <p className="text-gray-700 mt-4">
            Logged in as: <span className="font-semibold">{currentUser?.email}</span>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-8">
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Total Revenue Card */}
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-500 text-sm">Total Revenue</p>
              <h3 className="text-xl font-bold">{formatCurrency(dashboardStats.revenue.total)}</h3>
              
              {dashboardStats.charts.last30Days && dashboardStats.charts.last30Days.length > 0 && (
                <div className="mt-1 flex items-center">
                  {calculatePercentChange(
                    dashboardStats.charts.last30Days[dashboardStats.charts.last30Days.length - 1].revenue,
                    dashboardStats.charts.last30Days[dashboardStats.charts.last30Days.length - 2].revenue
                  ) >= 0 ? (
                    <FiArrowUp className="text-green-500 mr-1" />
                  ) : (
                    <FiArrowDown className="text-red-500 mr-1" />
                  )}
                  <span className={`text-xs ${calculatePercentChange(
                    dashboardStats.charts.last30Days[dashboardStats.charts.last30Days.length - 1].revenue,
                    dashboardStats.charts.last30Days[dashboardStats.charts.last30Days.length - 2].revenue
                  ) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {Math.abs(calculatePercentChange(
                      dashboardStats.charts.last30Days[dashboardStats.charts.last30Days.length - 1].revenue,
                      dashboardStats.charts.last30Days[dashboardStats.charts.last30Days.length - 2].revenue
                    )).toFixed(1)}% from yesterday
                  </span>
                </div>
              )}
            </div>
            <div className="bg-blue-500 p-2 rounded-md">
              <FiDollarSign className="text-white text-xl" />
            </div>
          </div>
        </div>
        
        {/* Total Orders Card */}
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-500 text-sm">Total Orders</p>
              <h3 className="text-xl font-bold">{dashboardStats.orders.total}</h3>
              
              {dashboardStats.charts.last30Days && dashboardStats.charts.last30Days.length > 0 && (
                <div className="mt-1 flex items-center">
                  {calculatePercentChange(
                    dashboardStats.charts.last30Days[dashboardStats.charts.last30Days.length - 1].orders,
                    dashboardStats.charts.last30Days[dashboardStats.charts.last30Days.length - 2].orders
                  ) >= 0 ? (
                    <FiArrowUp className="text-green-500 mr-1" />
                  ) : (
                    <FiArrowDown className="text-red-500 mr-1" />
                  )}
                  <span className={`text-xs ${calculatePercentChange(
                    dashboardStats.charts.last30Days[dashboardStats.charts.last30Days.length - 1].orders,
                    dashboardStats.charts.last30Days[dashboardStats.charts.last30Days.length - 2].orders
                  ) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {Math.abs(calculatePercentChange(
                      dashboardStats.charts.last30Days[dashboardStats.charts.last30Days.length - 1].orders,
                      dashboardStats.charts.last30Days[dashboardStats.charts.last30Days.length - 2].orders
                    )).toFixed(1)}% from yesterday
                  </span>
                </div>
              )}
            </div>
            <div className="bg-green-500 p-2 rounded-md">
              <FiShoppingBag className="text-white text-xl" />
            </div>
          </div>
        </div>
        
        {/* Total Customers Card */}
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-500 text-sm">Total Customers</p>
              <h3 className="text-xl font-bold">{dashboardStats.users.customers}</h3>
            </div>
            <div className="bg-purple-500 p-2 rounded-md">
              <FiUsers className="text-white text-xl" />
            </div>
          </div>
        </div>
        
        {/* Inventory Status Card */}
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-500 text-sm">Low Stock Items</p>
              <h3 className="text-xl font-bold">{dashboardStats.products.lowStock}</h3>
              <p className="text-xs text-gray-500 mt-1">Out of stock: {dashboardStats.products.outOfStock}</p>
            </div>
            <div className="bg-orange-500 p-2 rounded-md">
              <FiAlertCircle className="text-white text-xl" />
            </div>
          </div>
        </div>
      </div>
      
      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-1 gap-6 mb-6">
        {/* Revenue Chart */}
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-lg font-semibold mb-4">Revenue Trends (Last 30 Days)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart
              data={dashboardStats.charts.last30Days}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                tickFormatter={(date) => {
                  const d = new Date(date);
                  return `${d.getDate()}/${d.getMonth() + 1}`;
                }}
              />
              <YAxis />
              <Tooltip 
                formatter={(value) => formatCurrency(value)}
                labelFormatter={(label) => formatDate(label)}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="revenue" 
                stroke="#0088FE" 
                activeDot={{ r: 8 }} 
                name="Revenue"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Top Selling Products */}
        <div className="bg-white rounded-lg shadow p-4 col-span-1 lg:col-span-2">
          <h3 className="text-lg font-semibold mb-4">Top Selling Products</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Units Sold
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {dashboardStats.charts.topSellingProducts.map((product, index) => (
                  <tr key={product.productId}>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center">
                        {product.image ? (
                          <img 
                            src={product.image} 
                            alt={product.name} 
                            className="h-10 w-10 rounded-full mr-3 object-cover"
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-gray-200 mr-3 flex items-center justify-center">
                            <FiPackage className="text-gray-500" />
                          </div>
                        )}
                        <div className="text-sm font-medium text-gray-900">
                          {product.name}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{product.quantity}</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        
        {/* Users Distribution */}
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-lg font-semibold mb-4">User Distribution</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={[
                  { name: 'Customers', value: dashboardStats.users.customers },
                  { name: 'Admins', value: dashboardStats.users.admins }
                ]}
                cx="50%"
                cy="50%"
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              >
                {[
                  { name: 'Customers', color: '#0088FE' },
                  { name: 'Admins', color: '#FF8042' }
                ].map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value, name) => [value, name]} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex justify-center mt-4">
            <div className="flex items-center mr-4">
              <div className="w-3 h-3 bg-blue-500 rounded-full mr-1"></div>
              <span className="text-sm">Customers: {dashboardStats.users.customers}</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-orange-500 rounded-full mr-1"></div>
              <span className="text-sm">Admins: {dashboardStats.users.admins}</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Recent Orders */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold">Recent Orders</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Order ID
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {recentOrders.length > 0 ? (
                recentOrders.map(order => (
                  <tr key={order._id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {order._id.substring(0, 8)}...
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {order.shippingAddress?.fullName || 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {formatDate(order.createdAt)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {formatCurrency(order.totalAmount)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(order.status)}`}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500">
                    No recent orders found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;