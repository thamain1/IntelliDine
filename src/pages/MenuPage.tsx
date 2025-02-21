import React from 'react';
import type { MenuItem } from '../types';

const menuItems: MenuItem[] = [
  // Antipasti
  {
    id: 'a1',
    name: 'Burrata & Prosciutto',
    description: 'Creamy burrata, aged prosciutto, balsamic reduction, arugula',
    price: 18,
    category: 'appetizer',
    image: 'https://images.unsplash.com/photo-1550507992-eb63ffdc42ac?auto=format&fit=crop&q=80',
    dietary: { vegan: false, glutenFree: true, nutFree: true },
  },
  {
    id: 'a2',
    name: 'Carpaccio di Manzo',
    description: 'Thinly sliced beef, truffle oil, arugula, shaved Parmesan',
    price: 20,
    category: 'appetizer',
    image: 'https://images.unsplash.com/photo-1615937691194-97dbd3f3dc29?auto=format&fit=crop&q=80',
    dietary: { vegan: false, glutenFree: true, nutFree: true },
  },
  {
    id: 'a3',
    name: 'Fritto Misto',
    description: 'Lightly fried calamari, shrimp, zucchini, garlic aioli',
    price: 22,
    category: 'appetizer',
    image: 'https://images.unsplash.com/photo-1668207009741-f12918186d61?auto=format&fit=crop&q=80',
    dietary: { vegan: false, glutenFree: false, nutFree: true },
  },
  {
    id: 'a4',
    name: 'Bruschetta al Pomodoro',
    description: 'Grilled bread, vine tomatoes, basil, extra virgin olive oil',
    price: 14,
    category: 'appetizer',
    image: 'https://images.unsplash.com/photo-1572695157366-5e585ab2b69f?auto=format&fit=crop&q=80',
    dietary: { vegan: true, glutenFree: false, nutFree: true },
  },
  // Primi
  {
    id: 'p1',
    name: 'Tagliatelle al Tartufo',
    description: 'House-made tagliatelle, black truffle cream sauce, Parmesan',
    price: 32,
    category: 'entree',
    image: 'https://images.unsplash.com/photo-1473093295043-cdd812d0e601?auto=format&fit=crop&q=80',
    dietary: { vegan: false, glutenFree: false, nutFree: true },
  },
  {
    id: 'p2',
    name: 'Linguine alle Vongole',
    description: 'Fresh clams, white wine, garlic, chili flakes',
    price: 28,
    category: 'entree',
    image: 'https://images.unsplash.com/photo-1563379926898-05f4575a45d8?auto=format&fit=crop&q=80',
    dietary: { vegan: false, glutenFree: false, nutFree: true },
  },
  {
    id: 'p3',
    name: 'Risotto ai Frutti di Mare',
    description: 'Arborio rice, shrimp, scallops, mussels, saffron broth',
    price: 34,
    category: 'entree',
    image: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&q=80',
    dietary: { vegan: false, glutenFree: true, nutFree: true },
  },
  // Secondi
  {
    id: 's1',
    name: 'Filetto di Manzo',
    description: 'Grilled filet mignon, Barolo wine reduction, potato purée',
    price: 48,
    category: 'entree',
    image: 'https://images.unsplash.com/photo-1600891964092-4316c288032e?auto=format&fit=crop&q=80',
    dietary: { vegan: false, glutenFree: true, nutFree: true },
  },
  {
    id: 's2',
    name: 'Branzino al Forno',
    description: 'Mediterranean sea bass, roasted fennel, lemon butter sauce',
    price: 42,
    category: 'entree',
    image: 'https://images.unsplash.com/photo-1534080564583-6be75777b70a?auto=format&fit=crop&q=80',
    dietary: { vegan: false, glutenFree: true, nutFree: true },
  },
  // Dolci
  {
    id: 'd1',
    name: 'Tiramisu Classico',
    description: 'Espresso-soaked ladyfingers, mascarpone, cocoa',
    price: 14,
    category: 'dessert',
    image: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?auto=format&fit=crop&q=80',
    dietary: { vegan: false, glutenFree: false, nutFree: true },
  },
  {
    id: 'd2',
    name: 'Panna Cotta al Limone',
    description: 'Lemon-infused panna cotta, raspberry coulis',
    price: 12,
    category: 'dessert',
    image: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&q=80',
    dietary: { vegan: false, glutenFree: true, nutFree: true },
  },
  // Drinks
  {
    id: 'dr1',
    name: 'Negroni',
    description: 'Gin, Campari, sweet vermouth',
    price: 16,
    category: 'drink',
    image: 'https://images.unsplash.com/photo-1551751299-1b51cab2694c?auto=format&fit=crop&q=80',
    dietary: { vegan: true, glutenFree: true, nutFree: true },
  },
  {
    id: 'dr2',
    name: 'Aperol Spritz',
    description: 'Aperol, prosecco, soda, orange',
    price: 14,
    category: 'drink',
    image: 'https://images.unsplash.com/photo-1560512823-829485b8bf24?auto=format&fit=crop&q=80',
    dietary: { vegan: true, glutenFree: true, nutFree: true },
  },
];

export function MenuPage() {
  const [selectedCategory, setSelectedCategory] = React.useState<string>('all');
  const [dietaryFilters, setDietaryFilters] = React.useState({
    vegan: false,
    glutenFree: false,
    nutFree: false,
  });

  const categories = [
    { id: 'all', label: 'All' },
    { id: 'appetizer', label: 'Antipasti' },
    { id: 'entree', label: 'Primi & Secondi' },
    { id: 'dessert', label: 'Dolci' },
    { id: 'drink', label: 'Drinks & Wine' },
  ];

  const filteredItems = menuItems.filter((item) => {
    if (selectedCategory !== 'all' && item.category !== selectedCategory) {
      return false;
    }
    if (dietaryFilters.vegan && !item.dietary.vegan) {
      return false;
    }
    if (dietaryFilters.glutenFree && !item.dietary.glutenFree) {
      return false;
    }
    if (dietaryFilters.nutFree && !item.dietary.nutFree) {
      return false;
    }
    return true;
  });

  return (
    <div className="py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-center mb-12">Our Menu</h1>

        {/* Category Filter */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex rounded-md shadow-sm">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`${
                  selectedCategory === category.id
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                } px-4 py-2 text-sm font-medium border first:rounded-l-md last:rounded-r-md capitalize`}
              >
                {category.label}
              </button>
            ))}
          </div>
        </div>

        {/* Dietary Filters */}
        <div className="flex justify-center gap-4 mb-8">
          {Object.entries(dietaryFilters).map(([key, value]) => (
            <label key={key} className="inline-flex items-center">
              <input
                type="checkbox"
                checked={value}
                onChange={() =>
                  setDietaryFilters((prev) => ({ ...prev, [key]: !value }))
                }
                className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              />
              <span className="ml-2 text-gray-700 capitalize">
                {key.replace(/([A-Z])/g, ' $1').trim()}
              </span>
            </label>
          ))}
        </div>

        {/* Menu Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-lg shadow-lg overflow-hidden"
            >
              <div className="h-48 w-full">
                <img
                  src={item.image}
                  alt={item.name}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-2">{item.name}</h3>
                <p className="text-gray-600 mb-4">{item.description}</p>
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold">${item.price}</span>
                  <button className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 transition-colors">
                    Add to Order
                  </button>
                </div>
                <div className="mt-4 flex gap-2">
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
      </div>
    </div>
  );
}