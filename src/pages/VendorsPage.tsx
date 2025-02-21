import React, { useState, useEffect } from 'react';
import { Search, Plus, Truck, ShoppingCart, AlertTriangle, X } from 'lucide-react';
import { BackButton } from '../components/BackButton';
import { supabase } from '../lib/supabase';

interface Vendor {
  id: string;
  name: string;
  contact: string;
  email: string;
  phone: string;
  address: string;
  products: string[];
  fulfillment_rate: number;
  on_time_delivery: number;
  last_order_date: string | null;
  created_at: string;
}

interface VendorOrder {
  id: string;
  vendor_id: string;
  order_date: string;
  items: Array<{
    name: string;
    quantity: number;
    unit: string;
  }>;
  total: number;
  status: 'pending' | 'confirmed' | 'delivered' | 'cancelled';
}

export function VendorsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedVendor, setSelectedVendor] = useState<string | null>(null);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [vendorOrders, setVendorOrders] = useState<VendorOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newVendor, setNewVendor] = useState({
    name: '',
    contact: '',
    email: '',
    phone: '',
    address: '',
    products: [] as string[],
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchVendors();
  }, []);

  useEffect(() => {
    if (selectedVendor) {
      fetchVendorOrders(selectedVendor);
    }
  }, [selectedVendor]);

  const fetchVendors = async () => {
    try {
      const { data, error } = await supabase
        .from('vendors')
        .select('*')
        .order('name');

      if (error) throw error;
      setVendors(data || []);
    } catch (error) {
      console.error('Error fetching vendors:', error);
      setError('Failed to load vendors');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchVendorOrders = async (vendorId: string) => {
    try {
      const { data, error } = await supabase
        .from('vendor_orders')
        .select('*')
        .eq('vendor_id', vendorId)
        .order('order_date', { ascending: false });

      if (error) throw error;
      setVendorOrders(data || []);
    } catch (error) {
      console.error('Error fetching vendor orders:', error);
    }
  };

  const handleAddVendor = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data, error } = await supabase
        .from('vendors')
        .insert([
          {
            name: newVendor.name,
            contact: newVendor.contact,
            email: newVendor.email,
            phone: newVendor.phone,
            address: newVendor.address,
            products: newVendor.products,
            fulfillment_rate: 100,
            on_time_delivery: 100,
          },
        ])
        .select()
        .single();

      if (error) throw error;

      setVendors(prev => [...prev, data]);
      setIsModalOpen(false);
      setNewVendor({
        name: '',
        contact: '',
        email: '',
        phone: '',
        address: '',
        products: [],
      });
    } catch (error) {
      console.error('Error adding vendor:', error);
      setError('Failed to add vendor');
    }
  };

  const handlePlaceOrder = async (vendorId: string) => {
    try {
      const vendor = vendors.find(v => v.id === vendorId);
      if (!vendor) return;

      const { data, error } = await supabase
        .from('vendor_orders')
        .insert([
          {
            vendor_id: vendorId,
            order_date: new Date().toISOString(),
            items: [
              { name: vendor.products[0], quantity: 10, unit: 'kg' },
            ],
            total: 100,
            status: 'pending',
          },
        ])
        .select()
        .single();

      if (error) throw error;

      if (selectedVendor === vendorId) {
        setVendorOrders(prev => [data, ...prev]);
      }
    } catch (error) {
      console.error('Error placing order:', error);
      setError('Failed to place order');
    }
  };

  const filteredVendors = vendors.filter(vendor => {
    if (searchTerm === '') return true;
    return (
      vendor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vendor.contact.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vendor.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="flex justify-center items-center h-64">
          <div className="text-gray-600">Loading vendors...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <BackButton />
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Vendor Management</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-indigo-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Vendor
        </button>
      </div>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded relative">
          {error}
        </div>
      )}

      {/* Search */}
      <div className="mb-6 relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          placeholder="Search vendors..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 pr-4 py-2 w-full border rounded-lg"
        />
      </div>

      {/* Vendor Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredVendors.map((vendor) => (
          <div key={vendor.id} className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold">{vendor.name}</h3>
                <p className="text-gray-600">{vendor.contact}</p>
              </div>
              <button
                onClick={() => setSelectedVendor(vendor.id)}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <ShoppingCart className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2 mb-4">
              <p className="text-sm">
                <span className="font-medium">Email:</span> {vendor.email}
              </p>
              <p className="text-sm">
                <span className="font-medium">Phone:</span> {vendor.phone}
              </p>
              <p className="text-sm">
                <span className="font-medium">Last Order:</span>{' '}
                {vendor.last_order_date
                  ? new Date(vendor.last_order_date).toLocaleDateString()
                  : 'No orders yet'}
              </p>
            </div>

            <div>
              <h4 className="text-sm font-medium mb-2">Available Products:</h4>
              <div className="flex flex-wrap gap-2">
                {vendor.products.map((product) => (
                  <span
                    key={product}
                    className="px-2 py-1 bg-gray-100 text-gray-700 text-sm rounded"
                  >
                    {product}
                  </span>
                ))}
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Fulfillment Rate</p>
                <p className="font-medium">{vendor.fulfillment_rate}%</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">On-Time Delivery</p>
                <p className="font-medium">{vendor.on_time_delivery}%</p>
              </div>
            </div>

            <div className="mt-4 flex justify-end space-x-2">
              <button
                onClick={() => setSelectedVendor(vendor.id)}
                className="px-3 py-1 text-sm border rounded hover:bg-gray-50"
              >
                View Orders
              </button>
              <button
                onClick={() => handlePlaceOrder(vendor.id)}
                className="px-3 py-1 text-sm bg-indigo-600 text-white rounded hover:bg-indigo-700"
              >
                Place Order
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Vendor Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Add Vendor</h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleAddVendor} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Vendor Name
                </label>
                <input
                  type="text"
                  required
                  value={newVendor.name}
                  onChange={(e) => setNewVendor(prev => ({ ...prev, name: e.target.value }))}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Contact Person
                </label>
                <input
                  type="text"
                  required
                  value={newVendor.contact}
                  onChange={(e) => setNewVendor(prev => ({ ...prev, contact: e.target.value }))}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <input
                  type="email"
                  required
                  value={newVendor.email}
                  onChange={(e) => setNewVendor(prev => ({ ...prev, email: e.target.value }))}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Phone
                </label>
                <input
                  type="tel"
                  required
                  value={newVendor.phone}
                  onChange={(e) => setNewVendor(prev => ({ ...prev, phone: e.target.value }))}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Address
                </label>
                <textarea
                  required
                  value={newVendor.address}
                  onChange={(e) => setNewVendor(prev => ({ ...prev, address: e.target.value }))}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Products (comma-separated)
                </label>
                <input
                  type="text"
                  required
                  value={newVendor.products.join(', ')}
                  onChange={(e) => setNewVendor(prev => ({
                    ...prev,
                    products: e.target.value.split(',').map(p => p.trim()).filter(Boolean)
                  }))}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  placeholder="e.g., Tomatoes, Olive Oil, Flour"
                />
              </div>

              <div className="flex justify-end space-x-4 mt-6">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                >
                  Add Vendor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Selected Vendor Orders Modal */}
      {selectedVendor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">
                Orders - {vendors.find(v => v.id === selectedVendor)?.name}
              </h2>
              <button
                onClick={() => setSelectedVendor(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              {vendorOrders.map((order) => (
                <div key={order.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <p className="font-medium">Order #{order.id}</p>
                      <p className="text-sm text-gray-600">
                        {new Date(order.order_date).toLocaleString()}
                      </p>
                    </div>
                    <span className={`px-2 py-1 text-sm rounded-full ${
                      order.status === 'delivered'
                        ? 'bg-green-100 text-green-800'
                        : order.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                  </div>

                  <div className="space-y-2">
                    {order.items.map((item, index) => (
                      <div key={index} className="flex justify-between text-sm">
                        <span>{item.name}</span>
                        <span>{item.quantity} {item.unit}</span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 flex justify-between items-center">
                    <span className="font-medium">Total: ${order.total.toFixed(2)}</span>
                    {order.status === 'pending' && (
                      <div className="space-x-2">
                        <button className="px-3 py-1 text-sm border border-red-600 text-red-600 rounded hover:bg-red-50">
                          Cancel
                        </button>
                        <button className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700">
                          Confirm
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {vendorOrders.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No orders found for this vendor
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}