import React from 'react';
import { Search, Book, MessageSquare, Video, ExternalLink } from 'lucide-react';
import { BackButton } from '../components/BackButton';

export function HelpPage() {
  const [searchTerm, setSearchTerm] = React.useState('');

  const helpCategories = [
    {
      title: 'Getting Started',
      articles: [
        'System Overview',
        'First-Time Setup',
        'Navigation Guide',
        'Basic Operations',
      ],
    },
    {
      title: 'Inventory Management',
      articles: [
        'Adding New Items',
        'Stock Tracking',
        'Reorder Points',
        'Inventory Reports',
      ],
    },
    {
      title: 'Menu Management',
      articles: [
        'Creating Menu Items',
        'Price Updates',
        'Categories',
        'Special Items',
      ],
    },
    // Add more categories as needed
  ];

  return (
    <div className="p-8">
      <BackButton />
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Help & Support Center</h1>
        <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center">
          <MessageSquare className="w-4 h-4 mr-2" />
          Contact Support
        </button>
      </div>

      {/* Search */}
      <div className="max-w-2xl mx-auto mb-8">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search help articles..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-3 w-full border rounded-lg text-lg"
          />
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-lg text-center">
          <Book className="w-8 h-8 mx-auto mb-4 text-indigo-600" />
          <h3 className="text-lg font-semibold mb-2">Knowledge Base</h3>
          <p className="text-gray-600 mb-4">
            Browse our comprehensive guides and tutorials
          </p>
          <button className="text-indigo-600 hover:text-indigo-700">
            Browse Articles
          </button>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-lg text-center">
          <Video className="w-8 h-8 mx-auto mb-4 text-indigo-600" />
          <h3 className="text-lg font-semibold mb-2">Video Tutorials</h3>
          <p className="text-gray-600 mb-4">
            Watch step-by-step video guides
          </p>
          <button className="text-indigo-600 hover:text-indigo-700">
            Watch Videos
          </button>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-lg text-center">
          <MessageSquare className="w-8 h-8 mx-auto mb-4 text-indigo-600" />
          <h3 className="text-lg font-semibold mb-2">Live Support</h3>
          <p className="text-gray-600 mb-4">
            Get help from our support team
          </p>
          <button className="text-indigo-600 hover:text-indigo-700">
            Start Chat
          </button>
        </div>
      </div>

      {/* Help Categories */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {helpCategories.map((category) => (
          <div
            key={category.title}
            className="bg-white rounded-lg shadow-lg p-6"
          >
            <h2 className="text-lg font-semibold mb-4">{category.title}</h2>
            <ul className="space-y-2">
              {category.articles.map((article) => (
                <li key={article}>
                  <button className="flex items-center text-gray-700 hover:text-indigo-600">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    {article}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Support Contact */}
      <div className="mt-8 bg-gray-50 rounded-lg p-6 text-center">
        <h2 className="text-lg font-semibold mb-2">Need More Help?</h2>
        <p className="text-gray-600 mb-4">
          Our support team is available 24/7 to assist you
        </p>
        <div className="space-x-4">
          <button className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700">
            Email Support
          </button>
          <button className="bg-white text-indigo-600 px-6 py-2 rounded-lg border border-indigo-600 hover:bg-indigo-50">
            Call Support
          </button>
        </div>
      </div>
    </div>
  );
}