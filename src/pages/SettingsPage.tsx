import React from 'react';
import { User, Key, CreditCard, Bell } from 'lucide-react';

export function SettingsPage() {
  const [activeTab, setActiveTab] = React.useState('profile');

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Settings</h1>

      <div className="flex space-x-8">
        {/* Settings Navigation */}
        <div className="w-64">
          <nav className="space-y-1">
            <button
              onClick={() => setActiveTab('profile')}
              className={`w-full flex items-center px-4 py-2 text-sm font-medium rounded-lg ${
                activeTab === 'profile'
                  ? 'bg-indigo-50 text-indigo-700'
                  : 'text-gray-900 hover:bg-gray-50'
              }`}
            >
              <User className="w-5 h-5 mr-3" />
              Profile Settings
            </button>
            <button
              onClick={() => setActiveTab('security')}
              className={`w-full flex items-center px-4 py-2 text-sm font-medium rounded-lg ${
                activeTab === 'security'
                  ? 'bg-indigo-50 text-indigo-700'
                  : 'text-gray-900 hover:bg-gray-50'
              }`}
            >
              <Key className="w-5 h-5 mr-3" />
              Security
            </button>
            <button
              onClick={() => setActiveTab('billing')}
              className={`w-full flex items-center px-4 py-2 text-sm font-medium rounded-lg ${
                activeTab === 'billing'
                  ? 'bg-indigo-50 text-indigo-700'
                  : 'text-gray-900 hover:bg-gray-50'
              }`}
            >
              <CreditCard className="w-5 h-5 mr-3" />
              Billing
            </button>
            <button
              onClick={() => setActiveTab('notifications')}
              className={`w-full flex items-center px-4 py-2 text-sm font-medium rounded-lg ${
                activeTab === 'notifications'
                  ? 'bg-indigo-50 text-indigo-700'
                  : 'text-gray-900 hover:bg-gray-50'
              }`}
            >
              <Bell className="w-5 h-5 mr-3" />
              Notifications
            </button>
          </nav>
        </div>

        {/* Settings Content */}
        <div className="flex-1 bg-white rounded-lg shadow-lg p-6">
          {activeTab === 'profile' && (
            <div>
              <h2 className="text-lg font-medium mb-4">Profile Settings</h2>
              <form className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Full Name
                  </label>
                  <input
                    type="text"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Email Address
                  </label>
                  <input
                    type="email"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Role
                  </label>
                  <select className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500">
                    <option>Admin</option>
                    <option>Staff</option>
                  </select>
                </div>
                <div>
                  <button
                    type="submit"
                    className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          )}

          {activeTab === 'security' && (
            <div>
              <h2 className="text-lg font-medium mb-4">Security Settings</h2>
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-700">
                    Change Password
                  </h3>
                  <form className="mt-4 space-y-4">
                    <div>
                      <label className="block text-sm text-gray-700">
                        Current Password
                      </label>
                      <input
                        type="password"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-700">
                        New Password
                      </label>
                      <input
                        type="password"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-700">
                        Confirm New Password
                      </label>
                      <input
                        type="password"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      />
                    </div>
                    <button
                      type="submit"
                      className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      Update Password
                    </button>
                  </form>
                </div>
                <div className="pt-6 border-t">
                  <h3 className="text-sm font-medium text-gray-700">
                    Two-Factor Authentication
                  </h3>
                  <div className="mt-4">
                    <button className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                      Enable 2FA
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'billing' && (
            <div>
              <h2 className="text-lg font-medium mb-4">Billing Settings</h2>
              {/* Add billing settings content */}
            </div>
          )}

          {activeTab === 'notifications' && (
            <div>
              <h2 className="text-lg font-medium mb-4">Notification Preferences</h2>
              {/* Add notification settings content */}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}