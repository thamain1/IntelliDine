import React, { useState, useEffect } from 'react';
import { Search, MapPin, Clock, Check, X } from 'lucide-react';
import { BackButton } from '../components/BackButton';
import { supabase } from '../lib/supabase';

interface Order {
  id: string;
  customer: string;
  items: { name: string; quantity: number }[];
  total: number;
  status: 'new' | 'preparing' | 'ready' | 'delivered' | 'cancelled';
  type: 'pickup' | 'delivery';
  address?: string;
  time: string;
}

export function OrdersPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('time', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: Order['status']) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId);

      if (error) throw error;

      setOrders(prev =>
        prev.map(order =>
          order.id === orderId ? { ...order, status: newStatus } : order
        )
      );
    } catch (error) {
      console.error('Error updating order status:', error);
      alert('Failed to update order status. Please try again.');
    }
  };

  const getNextStatus = (currentStatus: Order['status']): Order['status'] | null => {
    const statusFlow = {
      new: 'preparing',
      preparing: 'ready',
      ready: 'delivered',
      delivered: null,
      cancelled: null,
    };
    return statusFlow[currentStatus];
  };

  const handleStatusUpdate = (order: Order) => {
    const nextStatus = getNextStatus(order.status);
    if (nextStatus) {
      updateOrderStatus(order.id, nextStatus);
    }
  };

  const handleCancel = async (orderId: string) => {
    if (window.confirm('Are you sure you want to cancel this order?')) {
      await updateOrderStatus(orderId, 'cancelled');
    }
  };

  const filteredOrders = orders.filter(order => {
    if (filterStatus !== 'all' && order.status !== filterStatus) {
      return false;
    }
    if (searchTerm) {
      return (
        order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customer.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    return true;
  });

  const getStatusColor = (status: Order['status']) => {
    const colors = {
      new: 'bg-blue-100 text-blue-800',
      preparing: 'bg-yellow-100 text-yellow-800',
      ready: 'bg-green-100 text-green-800',
      delivered: 'bg-gray-100 text-gray-800',
      cancelled: 'bg-red-100 text-red-800',
    };
    return colors[status];
  };

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="flex justify-center items-center h-64">
          <div className="text-gray-600">Loading orders...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <BackButton />
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Orders & Deliveries</h1>
      </div>

      {/* Search and Filter */}
      <div className="mb-6 flex space-x-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search orders..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 w-full border rounded-lg"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="border rounded-lg px-4 py-2"
        >
          <option value="all">All Orders</option>
          <option value="new">New</option>
          <option value="preparing">Preparing</option>
          <option value="ready">Ready</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {filteredOrders.map((order) => (
          <div key={order.id} className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold">Order #{order.id}</h3>
                <p className="text-gray-600">{order.customer}</p>
                <p className="text-sm text-gray-500">
                  <Clock className="w-4 h-4 inline mr-1" />
                  {new Date(order.time).toLocaleString()}
                </p>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold">${order.total.toFixed(2)}</p>
                <span className={`px-2 py-1 rounded-full text-sm ${getStatusColor(order.status)}`}>
                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </span>
              </div>
            </div>

            <div className="border-t border-b py-4 my-4">
              <h4 className="font-medium mb-2">Order Items:</h4>
              <ul className="space-y-2">
                {order.items.map((item, index) => (
                  <li key={index} className="flex justify-between">
                    <span>{item.name}</span>
                    <span className="text-gray-600">x{item.quantity}</span>
                  </li>
                ))}
              </ul>
            </div>

            {order.type === 'delivery' && order.address && (
              <div className="flex items-start space-x-2 text-gray-600 mb-4">
                <MapPin className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <span>{order.address}</span>
              </div>
            )}

            <div className="mt-4 flex justify-end space-x-4">
              {order.status !== 'delivered' && order.status !== 'cancelled' && (
                <>
                  <button
                    onClick={() => handleCancel(order.id)}
                    className="px-4 py-2 border border-red-600 text-red-600 rounded-lg hover:bg-red-50 flex items-center"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Cancel Order
                  </button>
                  <button
                    onClick={() => handleStatusUpdate(order)}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center"
                  >
                    <Check className="w-4 h-4 mr-2" />
                    {getNextStatus(order.status)?.charAt(0).toUpperCase() + 
                     getNextStatus(order.status)?.slice(1)}
                  </button>
                </>
              )}
            </div>
          </div>
        ))}

        {filteredOrders.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No orders found matching your criteria
          </div>
        )}
      </div>
    </div>
  );
}