import React, { useState, useEffect } from 'react';
import { FaEdit, FaTrash, FaSearch, FaEye, FaFilter } from 'react-icons/fa';
import { getApiUrl } from '../../utils/axiosConfig';

const OrderManagement = ({ orders: initialOrders, loading: initialLoading, error: initialError, token }) => {
  const [orders, setOrders] = useState(initialOrders || []);
  const [loading, setLoading] = useState(initialLoading || false);
  const [error, setError] = useState(initialError || null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [ordersPerPage] = useState(10);
  
  // Modals state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [orderToUpdate, setOrderToUpdate] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [statusErrors, setStatusErrors] = useState({});
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionSuccess, setActionSuccess] = useState(null);
  const [actionError, setActionError] = useState(null);
  
  // Form validation state
  const [formTouched, setFormTouched] = useState(false);

  // Valid status options
  const validStatusOptions = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];

  // Update local orders when prop changes
  useEffect(() => {
    if (initialOrders) {
      setOrders(initialOrders);
    }
  }, [initialOrders]);
  
  // Reset loading and error states when props change
  useEffect(() => {
    setLoading(initialLoading || false);
    setError(initialError || null);
  }, [initialLoading, initialError]);

  // Fetch orders with status filter
  const fetchOrdersWithFilter = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const queryParams = statusFilter !== 'all' ? `?status=${statusFilter}` : '';
      const response = await fetch(getApiUrl(`/api/orders/admin${queryParams}`), {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch orders');
      }
      
      setOrders(data.orders || []);
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Apply status filter and refetch
  useEffect(() => {
    if (token) {
      fetchOrdersWithFilter();
    }
  }, [statusFilter, token]);

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1); // Reset to first page when searching
  };
  
  // Filter orders based on search query
  const filteredOrders = orders.filter(order => 
    (order._id && order._id.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (order.user?.name && order.user.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (order.shippingAddress?.fullName && order.shippingAddress.fullName.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (order.shippingAddress?.email && order.shippingAddress.email.toLowerCase().includes(searchQuery.toLowerCase()))
  );
  
  // Calculate pagination
  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = filteredOrders.slice(indexOfFirstOrder, indexOfLastOrder);
  const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);
  
  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  
  // Open the delete confirmation modal
  const openDeleteModal = (order) => {
    setOrderToDelete(order);
    setShowDeleteModal(true);
  };
  
  // Open the status update modal
  const openStatusModal = (order) => {
    setOrderToUpdate(order);
    setNewStatus(order.status);
    setStatusErrors({});
    setFormTouched(false);
    setShowStatusModal(true);
  };
  
  // Open order details modal
  const openDetailsModal = (order) => {
    setSelectedOrder(order);
    setShowDetailsModal(true);
  };

  // Handle order cancellation/deletion
  const handleCancelOrder = async () => {
    if (!orderToDelete) return;
    
    try {
      setActionLoading(true);
      setActionError(null);
      
      const response = await fetch(getApiUrl(`/api/orders/admin/cancel/${orderToDelete._id}`), {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ reason: 'Cancelled by admin' })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to cancel order');
      }
      
      // Update the order in the local state
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order._id === orderToDelete._id 
            ? { ...order, status: 'Cancelled' } 
            : order
        )
      );
      
      setActionSuccess('Order cancelled successfully');
      // Close modal after a short delay
      setTimeout(() => {
        setShowDeleteModal(false);
        setOrderToDelete(null);
        setActionSuccess(null);
      }, 1500);
      
    } catch (err) {
      console.error('Error cancelling order:', err);
      setActionError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  // Validate status update form
  const validateStatusForm = () => {
    const errors = {};
    if (!newStatus) {
      errors.status = 'Status is required';
    } else if (!validStatusOptions.includes(newStatus)) {
      errors.status = 'Invalid status selected';
    }
    return errors;
  };

  // Handle order status update
  const handleUpdateStatus = async () => {
    setFormTouched(true);
    const errors = validateStatusForm();
    setStatusErrors(errors);
    if (Object.keys(errors).length > 0) return;

    if (!orderToUpdate || !newStatus) return;
    
    try {
      setActionLoading(true);
      setActionError(null);
      
      const response = await fetch(getApiUrl(`/api/orders/${orderToUpdate._id}/status`), {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to update order status');
      }
      
      // Update the order in the local state
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order._id === orderToUpdate._id 
            ? { ...order, status: newStatus } 
            : order
        )
      );
      
      setActionSuccess('Order status updated successfully');
      // Close modal after a short delay
      setTimeout(() => {
        setShowStatusModal(false);
        setOrderToUpdate(null);
        setNewStatus('');
        setActionSuccess(null);
      }, 1500);
      
    } catch (err) {
      console.error('Error updating order status:', err);
      setActionError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  // Helper function to format date
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div className="mb-8">
      <h1 className="text-2xl font-bold mb-6">Order Management</h1>
      
      {/* Search and Filter Controls */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaSearch className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search orders..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>
          
          {/* Status Filter */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaFilter className="text-gray-400" />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value="all">All Orders</option>
              <option value="Pending">Pending</option>
              <option value="Processing">Processing</option>
              <option value="Shipped">Shipped</option>
              <option value="Delivered">Delivered</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
          
          {/* Order Count */}
          <div className="bg-gray-100 rounded-md px-4 py-2 flex items-center justify-center">
            <span className="text-sm text-gray-600">
              Showing <span className="font-bold">{filteredOrders.length}</span> orders
              {statusFilter !== 'all' ? ` with status: ${statusFilter}` : ''}
            </span>
          </div>
        </div>
      </div>
      
      {/* Order list */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="text-center py-10">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto mb-4"></div>
            <p>Loading orders...</p>
          </div>
        ) : error ? (
          <div className="bg-red-100 text-red-700 p-4 m-6 rounded-md">
            {error}
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-gray-500 mb-4">No orders found</p>
          </div>
        ) : (
          <>
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
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {currentOrders.map(order => (
                    <tr key={order._id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {order._id.substring(0, 8)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {order.user?.name || order.shippingAddress?.fullName || 'Guest'}
                        </div>
                        <div className="text-xs text-gray-400">
                          {order.shippingAddress?.email}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </div>
                        <div className="text-xs text-gray-400">
                          {new Date(order.createdAt).toLocaleTimeString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          order.status === 'Delivered' ? 'bg-green-100 text-green-800' : 
                          order.status === 'Processing' ? 'bg-yellow-100 text-yellow-800' :
                          order.status === 'Shipped' ? 'bg-blue-100 text-blue-800' :
                          order.status === 'Cancelled' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          ${order.totalAmount?.toFixed(2)}
                        </div>
                        <div className="text-xs text-gray-400">
                          {order.items?.length || 0} item(s)
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex space-x-3">
                          <button 
                            onClick={() => openDetailsModal(order)} 
                            className="text-blue-600 hover:text-blue-900"
                            title="View Details"
                          >
                            <FaEye />
                          </button>
                          <button 
                            onClick={() => openStatusModal(order)} 
                            className="text-green-600 hover:text-green-900"
                            title="Update Status"
                          >
                            <FaEdit />
                          </button>
                          <button 
                            onClick={() => openDeleteModal(order)} 
                            className="text-red-600 hover:text-red-900"
                            title="Cancel Order"
                            disabled={order.status === 'Delivered' || order.status === 'Cancelled'}
                          >
                            <FaTrash className={order.status === 'Delivered' || order.status === 'Cancelled' ? 'opacity-50 cursor-not-allowed' : ''} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-6 py-3 flex items-center justify-between border-t border-gray-200">
                <div>
                  <p className="text-sm text-gray-700">
                    Showing <span className="font-medium">{indexOfFirstOrder + 1}</span> to{' '}
                    <span className="font-medium">
                      {indexOfLastOrder > filteredOrders.length ? filteredOrders.length : indexOfLastOrder}
                    </span> of{' '}
                    <span className="font-medium">{filteredOrders.length}</span> orders
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${
                        currentPage === 1 
                          ? 'text-gray-300 cursor-not-allowed' 
                          : 'text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      Previous
                    </button>
                    {[...Array(totalPages)].map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => paginate(idx + 1)}
                        className={`relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium ${
                          currentPage === idx + 1
                            ? 'bg-red-50 border-red-500 text-red-600 z-10'
                            : 'text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        {idx + 1}
                      </button>
                    ))}
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${
                        currentPage === totalPages 
                          ? 'text-gray-300 cursor-not-allowed' 
                          : 'text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      Next
                    </button>
                  </nav>
                </div>
              </div>
            )}
          </>
        )}
      </div>
      
      {/* Delete/Cancel Order Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Confirm Order Cancellation</h3>
            <p className="text-gray-500 mb-6">
              Are you sure you want to cancel this order? This action will also restore inventory stock levels.
            </p>
            
            {actionError && (
              <div className="bg-red-100 text-red-700 p-3 rounded-md mb-4">
                {actionError}
              </div>
            )}
            
            {actionSuccess && (
              <div className="bg-green-100 text-green-700 p-3 rounded-md mb-4">
                {actionSuccess}
              </div>
            )}
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
                disabled={actionLoading}
              >
                Cancel
              </button>
              <button
                onClick={handleCancelOrder}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                disabled={actionLoading}
              >
                {actionLoading ? 'Processing...' : 'Yes, Cancel Order'}
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Update Order Status Modal */}
      {showStatusModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Update Order Status</h3>
            
            <div className="mb-4">
              <label htmlFor="orderStatus" className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                id="orderStatus"
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                className={`w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 ${
                  formTouched && statusErrors.status ? 'border-red-500' : ''
                }`}
                required
              >
                <option value="">Select status</option>
                {validStatusOptions.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
              {formTouched && statusErrors.status && (
                <p className="text-red-500 text-sm mt-2">{statusErrors.status}</p>
              )}
            </div>
            
            {actionError && (
              <div className="bg-red-100 text-red-700 p-3 rounded-md mb-4">
                {actionError}
              </div>
            )}
            
            {actionSuccess && (
              <div className="bg-green-100 text-green-700 p-3 rounded-md mb-4">
                {actionSuccess}
              </div>
            )}
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowStatusModal(false)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
                disabled={actionLoading}
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateStatus}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                disabled={actionLoading || !newStatus}
              >
                {actionLoading ? 'Updating...' : 'Update Status'}
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Order Details Modal */}
      {showDetailsModal && selectedOrder && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg max-w-5xl w-full p-6 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-medium text-gray-900">
                Order Details
                <span className="ml-2 px-2 py-1 bg-gray-100 rounded-md text-sm">
                  {selectedOrder._id}
                </span>
              </h3>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* Order Info */}
              <div className="bg-gray-50 p-4 rounded-md">
                <h4 className="font-medium text-gray-700 mb-3">Order Information</h4>
                <div className="space-y-2">
                  <p className="text-sm">
                    <span className="text-gray-500">Date:</span> {formatDate(selectedOrder.createdAt)}
                  </p>
                  <p className="text-sm">
                    <span className="text-gray-500">Status:</span>{' '}
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      selectedOrder.status === 'Delivered' ? 'bg-green-100 text-green-800' : 
                      selectedOrder.status === 'Processing' ? 'bg-yellow-100 text-yellow-800' :
                      selectedOrder.status === 'Shipped' ? 'bg-blue-100 text-blue-800' :
                      selectedOrder.status === 'Cancelled' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {selectedOrder.status}
                    </span>
                  </p>
                  <p className="text-sm">
                    <span className="text-gray-500">Payment Method:</span> {selectedOrder.paymentMethod}
                  </p>
                  <p className="text-sm">
                    <span className="text-gray-500">Total:</span> ${selectedOrder.totalAmount?.toFixed(2)}
                  </p>
                </div>
              </div>
              
              {/* Customer Info */}
              <div className="bg-gray-50 p-4 rounded-md">
                <h4 className="font-medium text-gray-700 mb-3">Customer & Shipping Details</h4>
                <div className="space-y-2">
                  <p className="text-sm">
                    <span className="text-gray-500">Name:</span> {selectedOrder.shippingAddress?.fullName}
                  </p>
                  <p className="text-sm">
                    <span className="text-gray-500">Email:</span> {selectedOrder.shippingAddress?.email}
                  </p>
                  <p className="text-sm">
                    <span className="text-gray-500">Phone:</span> {selectedOrder.shippingAddress?.phoneNumber}
                  </p>
                  <p className="text-sm">
                    <span className="text-gray-500">Address:</span> {selectedOrder.shippingAddress?.address}, {selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.state} {selectedOrder.shippingAddress?.zipCode}, {selectedOrder.shippingAddress?.country}
                  </p>
                </div>
              </div>
            </div>
            
            {/* Order Items */}
            <div className="mb-6">
              <h4 className="font-medium text-gray-700 mb-3">Order Items</h4>
              <div className="overflow-x-auto bg-white border border-gray-200 rounded-md">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Product
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Price
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Size
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Quantity
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Subtotal
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {selectedOrder.items && selectedOrder.items.map((item, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            {item.image && (
                              <div className="h-10 w-10 flex-shrink-0 mr-3">
                                <img 
                                  src={item.image} 
                                  alt={item.name} 
                                  className="h-10 w-10 rounded-full object-cover"
                                  onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = "https://via.placeholder.com/40?text=No+Image";
                                  }}
                                />
                              </div>
                            )}
                            <div>
                              <div className="text-sm font-medium text-gray-900">{item.name}</div>
                              <div className="text-xs text-gray-500">{item.product}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">${item.price.toFixed(2)}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{item.size}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{item.quantity}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">${(item.price * item.quantity).toFixed(2)}</div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            
            <div className="flex justify-end">
              <button
                onClick={() => setShowDetailsModal(false)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderManagement;