import React from 'react';
import { Search, Plus, Trash2, Edit2, X, DollarSign, TrendingUp, ShoppingBag } from 'lucide-react';
import { BackButton } from '../components/BackButton';
import { supabase } from '../lib/supabase';
import type { MenuItem } from '../types';

interface MenuMetrics {
  averagePlateCost: number;
  totalItems: number;
  mostExpensiveItem: { name: string; price: number };
  leastExpensiveItem: { name: string; price: number };
  categoryBreakdown: Record<string, number>;
  plateCostMetrics: {
    totalPlateCost: number;
    averagePlateCost: number;
    plateCostPercentages: Record<string, number>;
  };
}

export function MenuManagementPage() {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [selectedCategory, setSelectedCategory] = React.useState('all');
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [menuItems, setMenuItems] = React.useState<MenuItem[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [menuMetrics, setMenuMetrics] = React.useState<MenuMetrics>({
    averagePlateCost: 0,
    totalItems: 0,
    mostExpensiveItem: { name: '', price: 0 },
    leastExpensiveItem: { name: '', price: Infinity },
    categoryBreakdown: {},
    plateCostMetrics: {
      totalPlateCost: 0,
      averagePlateCost: 0,
      plateCostPercentages: {},
    },
  });

  const [newItem, setNewItem] = React.useState({
    name: '',
    description: '',
    price: '',
    category: 'appetizer',
    image: '',
    dietary: {
      vegan: false,
      glutenFree: false,
      nutFree: false,
    },
  });

  React.useEffect(() => {
    fetchMenuItems();
  }, []);

  const calculatePlateCostMetrics = (items: MenuItem[]) => {
    const plateCosts: Record<string, number> = {};
    let totalPlateCost = 0;

    items.forEach(item => {
      // Calculate plate cost based on category
      let costPercentage = 0;
      switch (item.category) {
        case 'appetizer':
          costPercentage = 0.30; // 30%
          break;
        case 'entree':
          costPercentage = 0.35; // 35%
          break;
        case 'dessert':
          costPercentage = 0.25; // 25%
          break;
        case 'drink':
          costPercentage = item.name.toLowerCase().includes('wine') ? 0.40 : 0.20; // 40% for wine, 20% for other drinks
          break;
      }

      const plateCost = item.price * costPercentage;
      plateCosts[item.name] = plateCost;
      totalPlateCost += plateCost;
    });

    const averagePlateCost = items.length > 0 ? totalPlateCost / items.length : 0;
    const plateCostPercentages: Record<string, number> = {};

    items.forEach(item => {
      plateCostPercentages[item.name] = (plateCosts[item.name] / item.price) * 100;
    });

    return {
      totalPlateCost,
      averagePlateCost,
      plateCostPercentages,
    };
  };

  const fetchMenuItems = async () => {
    try {
      const { data, error } = await supabase
        .from('menu_items')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      const transformedData: MenuItem[] = data.map(item => ({
        id: item.id,
        name: item.name,
        description: item.description,
        price: item.price,
        category: item.category,
        image: item.image,
        dietary: {
          vegan: item.dietary_vegan,
          glutenFree: item.dietary_gluten_free,
          nutFree: item.dietary_nut_free,
        },
      }));

      setMenuItems(transformedData);

      // Calculate menu metrics
      const totalItems = transformedData.length;
      const mostExpensiveItem = transformedData.reduce(
        (max, item) => (item.price > max.price ? { name: item.name, price: item.price } : max),
        { name: '', price: 0 }
      );

      const leastExpensiveItem = transformedData.reduce(
        (min, item) => (item.price < min.price ? { name: item.name, price: item.price } : min),
        { name: '', price: Infinity }
      );

      const categoryBreakdown = transformedData.reduce((acc, item) => {
        acc[item.category] = (acc[item.category] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const plateCostMetrics = calculatePlateCostMetrics(transformedData);

      setMenuMetrics({
        averagePlateCost: plateCostMetrics.averagePlateCost,
        totalItems,
        mostExpensiveItem,
        leastExpensiveItem,
        categoryBreakdown,
        plateCostMetrics,
      });
    } catch (error) {
      console.error('Error fetching menu items:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    if (name.startsWith('dietary_')) {
      const dietaryKey = name.replace('dietary_', '') as keyof typeof newItem.dietary;
      setNewItem(prev => ({
        ...prev,
        dietary: {
          ...prev.dietary,
          [dietaryKey]: (e.target as HTMLInputElement).checked,
        },
      }));
    } else {
      setNewItem(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const { data, error } = await supabase
        .from('menu_items')
        .insert([
          {
            name: newItem.name,
            description: newItem.description,
            price: parseFloat(newItem.price),
            category: newItem.category,
            image: newItem.image,
            dietary_vegan: newItem.dietary.vegan,
            dietary_gluten_free: newItem.dietary.glutenFree,
            dietary_nut_free: newItem.dietary.nutFree,
          },
        ])
        .select()
        .single();

      if (error) {
        throw error;
      }

      const transformedItem: MenuItem = {
        id: data.id,
        name: data.name,
        description: data.description,
        price: data.price,
        category: data.category,
        image: data.image,
        dietary: {
          vegan: data.dietary_vegan,
          glutenFree: data.dietary_gluten_free,
          nutFree: data.dietary_nut_free,
        },
      };

      setMenuItems(prev => [transformedItem, ...prev]);
      
      // Update metrics
      const updatedItems = [transformedItem, ...menuItems];
      const plateCostMetrics = calculatePlateCostMetrics(updatedItems);
      
      setMenuMetrics(prev => ({
        ...prev,
        totalItems: prev.totalItems + 1,
        mostExpensiveItem: 
          transformedItem.price > prev.mostExpensiveItem.price 
            ? { name: transformedItem.name, price: transformedItem.price }
            : prev.mostExpensiveItem,
        leastExpensiveItem:
          transformedItem.price < prev.leastExpensiveItem.price
            ? { name: transformedItem.name, price: transformedItem.price }
            : prev.leastExpensiveItem,
        categoryBreakdown: {
          ...prev.categoryBreakdown,
          [transformedItem.category]: (prev.categoryBreakdown[transformedItem.category] || 0) + 1,
        },
        plateCostMetrics,
      }));

      setNewItem({
        name: '',
        description: '',
        price: '',
        category: 'appetizer',
        image: '',
        dietary: {
          vegan: false,
          glutenFree: false,
          nutFree: false,
        },
      });
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error adding menu item:', error);
      alert('Failed to add menu item. Please try again.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this item?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('menu_items')
        .delete()
        .eq('id', id);

      if (error) {
        throw error;
      }

      const deletedItem = menuItems.find(item => item.id === id);
      if (!deletedItem) return;

      setMenuItems(prev => prev.filter(item => item.id !== id));
      
      // Update metrics
      const updatedItems = menuItems.filter(item => item.id !== id);
      const plateCostMetrics = calculatePlateCostMetrics(updatedItems);
      
      setMenuMetrics(prev => ({
        ...prev,
        totalItems: prev.totalItems - 1,
        categoryBreakdown: {
          ...prev.categoryBreakdown,
          [deletedItem.category]: prev.categoryBreakdown[deletedItem.category] - 1,
        },
        plateCostMetrics,
      }));
    } catch (error) {
      console.error('Error deleting menu item:', error);
      alert('Failed to delete menu item. Please try again.');
    }
  };

  const filteredItems = menuItems.filter((item) => {
    if (selectedCategory !== 'all' && item.category !== selectedCategory) {
      return false;
    }
    if (searchTerm) {
      return item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
             item.description.toLowerCase().includes(searchTerm.toLowerCase());
    }
    return true;
  });

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="flex justify-center items-center h-64">
          <div className="text-gray-600">Loading menu items...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <BackButton />
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Menu Management</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-indigo-700 transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Menu Item
        </button>
      </div>

      {/* Menu Metrics */}
      <div className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-gray-500 text-sm font-medium">Average Plate Cost</h3>
            <DollarSign className="w-5 h-5 text-green-500" />
          </div>
          <p className="text-3xl font-bold">${menuMetrics.plateCostMetrics.averagePlateCost.toFixed(2)}</p>
          <p className="text-sm text-gray-600">Across {menuMetrics.totalItems} items</p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-gray-500 text-sm font-medium">Price Range</h3>
            <TrendingUp className="w-5 h-5 text-blue-500" />
          </div>
          <p className="text-3xl font-bold">
            ${menuMetrics.leastExpensiveItem.price.toFixed(2)} - ${menuMetrics.mostExpensiveItem.price.toFixed(2)}
          </p>
          <p className="text-sm text-gray-600">Min-Max Price Range</p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-gray-500 text-sm font-medium">Total Revenue</h3>
            <ShoppingBag className="w-5 h-5 text-purple-500" />
          </div>
          <p className="text-3xl font-bold">
            ${(menuMetrics.plateCostMetrics.totalPlateCost * (1/0.35)).toFixed(2)}
          </p>
          <p className="text-sm text-gray-600">Projected Monthly</p>
        </div>
      </div>

      <div className="mb-6 flex space-x-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search menu items..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 w-full border rounded-lg"
          />
        </div>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="border rounded-lg px-4 py-2"
        >
          <option value="all">All Categories</option>
          <option value="appetizer">Antipasti</option>
          <option value="entree">Primi & Secondi</option>
          <option value="dessert">Dolci</option>
          <option value="drink">Drinks</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredItems.map((item) => (
          <div key={item.id} className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="h-48 w-full relative group">
              <img
                src={item.image}
                alt={item.name}
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-4">
                <button className="p-2 bg-white rounded-full hover:bg-gray-100">
                  <Edit2 className="w-5 h-5 text-gray-700" />
                </button>
                <button 
                  onClick={() => handleDelete(item.id)}
                  className="p-2 bg-white rounded-full hover:bg-gray-100"
                >
                  <Trash2 className="w-5 h-5 text-red-600" />
                </button>
              </div>
            </div>
            <div className="p-4">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-semibold">{item.name}</h3>
                <span className="text-lg font-bold">${item.price}</span>
              </div>
              <p className="text-gray-600 text-sm mb-2">{item.description}</p>
              <p className="text-sm text-indigo-600 mb-4">
                Plate Cost: {menuMetrics.plateCostMetrics.plateCostPercentages[item.name]?.toFixed(1)}%
              </p>
              <div className="flex flex-wrap gap-2">
                {item.dietary.vegan && (
                  <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                    Vegan
                  </span>
                )}
                {item.dietary.glutenFree && (
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                    Gluten Free
                  </span>
                )}
                {item.dietary.nutFree && (
                  <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded">
                    Nut Free
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Menu Item Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Add Menu Item</h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  value={newItem.name}
                  onChange={handleInputChange}
                  className="w-full border rounded-lg px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  name="description"
                  required
                  value={newItem.description}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full border rounded-lg px-3 py-2"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Price ($)
                  </label>
                  <input
                    type="number"
                    name="price"
                    required
                    min="0"
                    step="0.01"
                    value={newItem.price}
                    onChange={handleInputChange}
                    className="w-full border rounded-lg px-3 py-2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category
                  </label>
                  <select
                    name="category"
                    required
                    value={newItem.category}
                    onChange={handleInputChange}
                    className="w-full border rounded-lg px-3 py-2"
                  >
                    <option value="appetizer">Antipasti</option>
                    <option value="entree">Primi & Secondi</option>
                    <option value="dessert">Dolci</option>
                    <option value="drink">Drinks</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Image URL
                </label>
                <input
                  type="url"
                  name="image"
                  required
                  value={newItem.image}
                  onChange={handleInputChange}
                  className="w-full border rounded-lg px-3 py-2"
                  placeholder="https://example.com/image.jpg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Dietary Options
                </label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="dietary_vegan"
                      checked={newItem.dietary.vegan}
                      onChange={handleInputChange}
                      className="rounded border-gray-300 text-indigo-600 mr-2"
                    />
                    Vegan
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="dietary_glutenFree"
                      checked={newItem.dietary.glutenFree}
                      onChange={handleInputChange}
                      className="rounded border-gray-300 text-indigo-600 mr-2"
                    />
                    Gluten Free
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="dietary_nutFree"
                      checked={newItem.dietary.nutFree}
                      onChange={handleInputChange}
                      className="rounded border-gray-300 text-indigo-600 mr-2"
                    />
                    Nut Free
                  </label>
                </div>
              </div>

              <div className="flex justify-end space-x-4">
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
                  Add Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}