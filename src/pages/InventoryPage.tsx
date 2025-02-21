import React, { useRef, useEffect } from 'react';
import { Search, Plus, Upload, AlertTriangle, X } from 'lucide-react';
import { BackButton } from '../components/BackButton';
import { supabase } from '../lib/supabase';

interface InventoryItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  unit_cost: number;
  supplier: string;
  reorder_point: number;
  expiration_date: string;
}

const unitCategories = {
  weight: {
    metric: ['kg', 'g'],
    imperial: ['lb', 'oz'],
    label: 'Weight'
  },
  volume: {
    metric: ['l', 'ml'],
    imperial: ['gal', 'qt', 'pt', 'fl oz'],
    label: 'Volume'
  },
  packaging: {
    whole: ['unit', 'piece', 'whole'],
    container: ['can', 'bottle', 'jar', 'box', 'bag', 'pack'],
    bulk: ['case', 'crate', 'barrel', 'keg'],
    label: 'Packaging'
  },
  other: {
    common: ['doz', 'bunch', 'roll', 'sheet'],
    label: 'Other'
  }
};

export function InventoryPage() {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [filter, setFilter] = React.useState('all');
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [isEditMode, setIsEditMode] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importError, setImportError] = React.useState<string>('');
  const [inventoryItems, setInventoryItems] = React.useState<InventoryItem[]>([]);

  const emptyItem = {
    name: '',
    quantity: '',
    unit: 'kg',
    unit_cost: '',
    supplier: '',
    reorder_point: '',
    expiration_date: '',
  };

  const [editingItem, setEditingItem] = React.useState<InventoryItem | null>(null);
  const [newItem, setNewItem] = React.useState(emptyItem);

  useEffect(() => {
    fetchInventoryItems();
  }, []);

  const fetchInventoryItems = async () => {
    try {
      const { data, error } = await supabase
        .from('inventory')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      setInventoryItems(data || []);
    } catch (error) {
      console.error('Error fetching inventory:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    if (isEditMode) {
      setEditingItem(prev => prev ? { ...prev, [name]: value } : null);
    } else {
      setNewItem(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleEdit = (item: InventoryItem) => {
    setIsEditMode(true);
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this item?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('inventory')
        .delete()
        .eq('id', id);

      if (error) {
        throw error;
      }

      setInventoryItems(prev => prev.filter(item => item.id !== id));
    } catch (error) {
      console.error('Error deleting item:', error);
      alert('Failed to delete item. Please try again.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (isEditMode && editingItem) {
        // Update existing item
        const { error: updateError } = await supabase
          .from('inventory')
          .update({
            name: editingItem.name,
            quantity: Number(editingItem.quantity),
            unit: editingItem.unit,
            unit_cost: Number(editingItem.unit_cost),
            supplier: editingItem.supplier,
            reorder_point: Number(editingItem.reorder_point),
            expiration_date: editingItem.expiration_date,
          })
          .eq('id', editingItem.id);

        if (updateError) throw updateError;

        setInventoryItems(prev => 
          prev.map(item => 
            item.id === editingItem.id ? editingItem : item
          )
        );
      } else {
        // Add new item
        const { data, error: insertError } = await supabase
          .from('inventory')
          .insert({
            name: newItem.name,
            quantity: Number(newItem.quantity),
            unit: newItem.unit,
            unit_cost: Number(newItem.unit_cost),
            supplier: newItem.supplier,
            reorder_point: Number(newItem.reorder_point),
            expiration_date: newItem.expiration_date,
          })
          .select()
          .single();

        if (insertError) throw insertError;

        setInventoryItems(prev => [data, ...prev]);
      }

      // Reset form and close modal
      setIsModalOpen(false);
      setIsEditMode(false);
      setEditingItem(null);
      setNewItem(emptyItem);
    } catch (error) {
      console.error('Error saving inventory item:', error);
      alert('Failed to save inventory item. Please try again.');
    }
  };

  const handleCSVImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    setImportError('');
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
      setImportError('Please upload a valid CSV file');
      return;
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const text = e.target?.result as string;
        const rows = text.split('\n');
        const headers = rows[0].split(',').map(header => header.trim().toLowerCase());
        
        // Validate required columns
        const requiredColumns = ['name', 'quantity', 'unit', 'unit_cost', 'supplier', 'reorder_point', 'expiration_date'];
        const missingColumns = requiredColumns.filter(col => !headers.includes(col));
        
        if (missingColumns.length > 0) {
          setImportError(`Missing required columns: ${missingColumns.join(', ')}`);
          return;
        }

        const newItems: Omit<InventoryItem, 'id'>[] = [];
        
        // Process each row starting from index 1 (skip headers)
        for (let i = 1; i < rows.length; i++) {
          const row = rows[i].trim();
          if (!row) continue; // Skip empty rows
          
          const values = row.split(',').map(value => value.trim());
          if (values.length !== headers.length) {
            setImportError(`Invalid data in row ${i + 1}`);
            return;
          }

          // Create object mapping headers to values
          const rowData: Record<string, string> = {};
          headers.forEach((header, index) => {
            rowData[header] = values[index];
          });

          // Validate numeric values
          const quantity = parseFloat(rowData.quantity);
          const unit_cost = parseFloat(rowData.unit_cost);
          const reorder_point = parseFloat(rowData.reorder_point);

          if (isNaN(quantity) || isNaN(unit_cost) || isNaN(reorder_point)) {
            setImportError(`Invalid numeric values in row ${i + 1}`);
            return;
          }

          // Validate date format
          const date = new Date(rowData.expiration_date);
          if (isNaN(date.getTime())) {
            setImportError(`Invalid date format in row ${i + 1}`);
            return;
          }

          // Validate unit
          const allUnits = [
            ...unitCategories.weight.metric,
            ...unitCategories.weight.imperial,
            ...unitCategories.volume.metric,
            ...unitCategories.volume.imperial,
            ...unitCategories.packaging.whole,
            ...unitCategories.packaging.container,
            ...unitCategories.packaging.bulk,
            ...unitCategories.other.common,
          ];
          
          if (!allUnits.includes(rowData.unit)) {
            setImportError(`Invalid unit "${rowData.unit}" in row ${i + 1}`);
            return;
          }

          newItems.push({
            name: rowData.name,
            quantity: quantity,
            unit: rowData.unit,
            unit_cost: unit_cost,
            supplier: rowData.supplier,
            reorder_point: reorder_point,
            expiration_date: rowData.expiration_date,
          });
        }

        // Insert items into the database
        const { data, error } = await supabase
          .from('inventory')
          .insert(newItems)
          .select();

        if (error) {
          throw error;
        }

        // Update local state with the newly inserted items
        const insertedItems = data.map(item => ({
          id: item.id,
          name: item.name,
          quantity: item.quantity,
          unit: item.unit,
          unit_cost: item.unit_cost,
          supplier: item.supplier,
          reorder_point: item.reorder_point,
          expiration_date: item.expiration_date,
        }));

        setInventoryItems(prev => [...insertedItems, ...prev]);
        
        // Reset file input
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }

        // Show success message
        alert(`Successfully imported ${insertedItems.length} items`);

      } catch (error) {
        console.error('Error processing CSV:', error);
        setImportError('Error saving data to database. Please try again.');
      }
    };

    reader.onerror = () => {
      setImportError('Error reading CSV file');
    };

    reader.readAsText(file);
  };

  const filteredItems = inventoryItems.filter((item) => {
    if (filter === 'low' && item.quantity > item.reorder_point) {
      return false;
    }
    if (filter === 'expiring' && new Date(item.expiration_date) > new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)) {
      return false;
    }
    if (searchTerm) {
      return item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
             item.supplier.toLowerCase().includes(searchTerm.toLowerCase());
    }
    return true;
  });

  const lowStockCount = inventoryItems.filter(item => item.quantity <= item.reorder_point).length;

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="flex justify-center items-center h-64">
          <div className="text-gray-600">Loading inventory data...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <BackButton />
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Inventory Management</h1>
        <div className="space-x-4">
          <button
            onClick={() => {
              setIsEditMode(false);
              setEditingItem(null);
              setNewItem(emptyItem);
              setIsModalOpen(true);
            }}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-indigo-700 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Item
          </button>
          <label className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg flex items-center cursor-pointer hover:bg-gray-200 transition-colors">
            <Upload className="w-4 h-4 mr-2" />
            Import CSV
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleCSVImport}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {importError && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertTriangle className="w-5 h-5 text-red-500 mr-2" />
            <span className="font-medium text-red-800">{importError}</span>
          </div>
        </div>
      )}

      <div className="mb-6 flex space-x-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search inventory..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 w-full border rounded-lg"
          />
        </div>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="border rounded-lg px-4 py-2"
        >
          <option value="all">All Items</option>
          <option value="low">Low Stock</option>
          <option value="expiring">Expiring Soon</option>
        </select>
      </div>

      <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-center">
          <AlertTriangle className="w-5 h-5 text-yellow-500 mr-2" />
          <span className="font-medium">Low Stock Alert:</span>
          <span className="ml-2">{lowStockCount} items are running low and need reordering</span>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Item Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Quantity
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Unit Cost
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Supplier
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredItems.map((item) => (
              <tr key={item.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{item.name}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {item.quantity} {item.unit}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">${item.unit_cost}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{item.supplier}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    item.quantity <= item.reorder_point
                      ? 'bg-red-100 text-red-800'
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {item.quantity <= item.reorder_point ? 'Low Stock' : 'In Stock'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <button 
                    onClick={() => handleEdit(item)}
                    className="text-indigo-600 hover:text-indigo-900"
                  >
                    Edit
                  </button>
                  <span className="mx-2">|</span>
                  <button 
                    onClick={() => handleDelete(item.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Item Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-2xl w-full">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">
                {isEditMode ? 'Edit Inventory Item' : 'Add Inventory Item'}
              </h2>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setIsEditMode(false);
                  setEditingItem(null);
                  setNewItem(emptyItem);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Item Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    value={isEditMode ? editingItem?.name : newItem.name}
                    onChange={handleInputChange}
                    className="w-full border rounded-lg px-3 py-2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Supplier
                  </label>
                  <input
                    type="text"
                    name="supplier"
                    required
                    value={isEditMode ? editingItem?.supplier : newItem.supplier}
                    onChange={handleInputChange}
                    className="w-full border rounded-lg px-3 py-2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Quantity
                  </label>
                  <input
                    type="number"
                    name="quantity"
                    required
                    min="0"
                    value={isEditMode ? editingItem?.quantity : newItem.quantity}
                    onChange={handleInputChange}
                    className="w-full border rounded-lg px-3 py-2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Unit
                  </label>
                  <select
                    name="unit"
                    required
                    value={isEditMode ? editingItem?.unit : newItem.unit}
                    onChange={handleInputChange}
                    className="w-full border rounded-lg px-3 py-2"
                  >
                    <optgroup label="Packaging - Whole Units">
                      {unitCategories.packaging.whole.map(unit => (
                        <option key={unit} value={unit}>{unit}</option>
                      ))}
                    </optgroup>
                    <optgroup label="Packaging - Containers">
                      {unitCategories.packaging.container.map(unit => (
                        <option key={unit} value={unit}>{unit}</option>
                      ))}
                    </optgroup>
                    <optgroup label="Packaging - Bulk">
                      {unitCategories.packaging.bulk.map(unit => (
                        <option key={unit} value={unit}>{unit}</option>
                      ))}
                    </optgroup>
                    <optgroup label="Weight - Metric">
                      {unitCategories.weight.metric.map(unit => (
                        <option key={unit} value={unit}>{unit}</option>
                      ))}
                    </optgroup>
                    <optgroup label="Weight - Imperial">
                      {unitCategories.weight.imperial.map(unit => (
                        <option key={unit} value={unit}>{unit}</option>
                      ))}
                    </optgroup>
                    <optgroup label="Volume - Metric">
                      {unitCategories.volume.metric.map(unit => (
                        <option key={unit} value={unit}>{unit}</option>
                      ))}
                    </optgroup>
                    <optgroup label="Volume - Imperial">
                      {unitCategories.volume.imperial.map(unit => (
                        <option key={unit} value={unit}>{unit}</option>
                      ))}
                    </optgroup>
                    <optgroup label="Other">
                      {unitCategories.other.common.map(unit => (
                        <option key={unit} value={unit}>{unit}</option>
                      ))}
                    </optgroup>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Unit Cost ($)
                  </label>
                  <input
                    type="number"
                    name="unit_cost"
                    required
                    min="0"
                    step="0.01"
                    value={isEditMode ? editingItem?.unit_cost : newItem.unit_cost}
                    onChange={handleInputChange}
                    className="w-full border rounded-lg px-3 py-2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Reorder Point
                  </label>
                  <input
                    type="number"
                    name="reorder_point"
                    required
                    min="0"
                    value={isEditMode ? editingItem?.reorder_point : newItem.reorder_point}
                    onChange={handleInputChange}
                    className="w-full border rounded-lg px-3 py-2"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Expiration Date
                  </label>
                  <input
                    type="date"
                    name="expiration_date"
                    required
                    value={isEditMode ? editingItem?.expiration_date : newItem.expiration_date}
                    onChange={handleInputChange}
                    className="w-full border rounded-lg px-3 py-2"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setIsEditMode(false);
                    setEditingItem(null);
                    setNewItem(emptyItem);
                  }}
                  className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                >
                  {isEditMode ? 'Save Changes' : 'Add Item'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}