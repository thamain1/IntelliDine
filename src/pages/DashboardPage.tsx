import React from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { 
  LayoutDashboard, 
  Package, 
  UtensilsCrossed, 
  Users, 
  Clock, 
  Truck, 
  BarChart3, 
  Settings, 
  HelpCircle,
  LogOut 
} from 'lucide-react';

export function DashboardPage() {
  const navigate = useNavigate();
  const [user, setUser] = React.useState<any>(null);

  React.useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate('/staff-login');
    } else {
      setUser(user);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/staff-login');
  };

  const menuItems = [
    { icon: <LayoutDashboard className="w-5 h-5" />, label: 'Overview', path: '/dashboard' },
    { icon: <Package className="w-5 h-5" />, label: 'Inventory', path: '/dashboard/inventory' },
    { icon: <UtensilsCrossed className="w-5 h-5" />, label: 'Menu Management', path: '/dashboard/menu' },
    { icon: <Users className="w-5 h-5" />, label: 'Labor & Scheduling', path: '/dashboard/labor' },
    { icon: <Clock className="w-5 h-5" />, label: 'Orders & Deliveries', path: '/dashboard/orders' },
    { icon: <Truck className="w-5 h-5" />, label: 'Vendor Ordering', path: '/dashboard/vendors' },
    { icon: <BarChart3 className="w-5 h-5" />, label: 'Reports & Analytics', path: '/dashboard/reports' },
    { icon: <Settings className="w-5 h-5" />, label: 'Settings', path: '/dashboard/settings' },
    { icon: <HelpCircle className="w-5 h-5" />, label: 'Help & Support', path: '/dashboard/help' }
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="fixed inset-y-0 left-0 w-64 bg-white shadow-lg">
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-center h-16 px-4 bg-indigo-600">
            <h1 className="text-xl font-bold text-white">IntelliDine Admin</h1>
          </div>
          
          <nav className="flex-1 px-4 py-4">
            <ul className="space-y-2">
              {menuItems.map((item) => (
                <li key={item.path}>
                  <button
                    onClick={() => navigate(item.path)}
                    className="flex items-center w-full px-4 py-2 text-gray-700 rounded-lg hover:bg-gray-100"
                  >
                    {item.icon}
                    <span className="ml-3">{item.label}</span>
                  </button>
                </li>
              ))}
            </ul>
          </nav>

          <div className="p-4 border-t">
            <button
              onClick={handleSignOut}
              className="flex items-center w-full px-4 py-2 text-gray-700 rounded-lg hover:bg-gray-100"
            >
              <LogOut className="w-5 h-5" />
              <span className="ml-3">Sign Out</span>
            </button>
          </div>
        </div>
      </div>

      <div className="ml-64 p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-gray-500 text-sm font-medium">Today's Reservations</h3>
            <p className="text-3xl font-bold">24</p>
            <div className="mt-2 text-green-600 text-sm">+12% from yesterday</div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-gray-500 text-sm font-medium">Active Orders</h3>
            <p className="text-3xl font-bold">8</p>
            <div className="mt-2 text-red-600 text-sm">-3% from yesterday</div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-gray-500 text-sm font-medium">Today's Revenue</h3>
            <p className="text-3xl font-bold">$2,854</p>
            <div className="mt-2 text-green-600 text-sm">+8% from yesterday</div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-gray-500 text-sm font-medium">Customer Satisfaction</h3>
            <p className="text-3xl font-bold">94%</p>
            <div className="mt-2 text-green-600 text-sm">+2% from last week</div>
          </div>
        </div>

        <div className="mt-8">
          <h2 className="text-2xl font-bold mb-4">Recent Activity</h2>
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    5 mins ago
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    New Reservation
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    Table for 4 at 7:00 PM
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                      Confirmed
                    </span>
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    15 mins ago
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    Online Order
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    Order #12345 - $156.00
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                      Processing
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}