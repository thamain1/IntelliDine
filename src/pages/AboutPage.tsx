import React from 'react';

export function AboutPage() {
  return (
    <div className="py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-center mb-12">About IntelliDine</h1>
        
        {/* Restaurant Story */}
        <div className="mb-16">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="text-2xl font-semibold mb-4">Our Story</h2>
              <p className="text-gray-600 mb-4">
                Founded in 2020, IntelliDine was born from a passion for combining culinary excellence 
                with innovative technology. Our mission is to create unforgettable dining experiences 
                while maintaining the highest standards of quality and service.
              </p>
              <p className="text-gray-600">
                Every dish we serve is crafted with care using locally-sourced ingredients and 
                time-honored techniques, enhanced by modern culinary innovations.
              </p>
            </div>
            <div className="h-[400px]">
              <img
                src="https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&q=80"
                alt="Restaurant interior"
                className="h-full w-full object-cover rounded-lg"
              />
            </div>
          </div>
        </div>

        {/* Chef's Bio */}
        <div className="mb-16">
          <h2 className="text-2xl font-semibold mb-8 text-center">Meet Our Team</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="h-48 w-48 mx-auto mb-4">
                <img
                  src="https://images.unsplash.com/photo-1577219491135-ce391730fb2c?auto=format&fit=crop&q=80"
                  alt="Head Chef"
                  className="h-full w-full object-cover rounded-full"
                />
              </div>
              <h3 className="text-xl font-semibold mb-2">Chef Maria Rodriguez</h3>
              <p className="text-gray-600">Head Chef</p>
              <p className="mt-4 text-gray-600">
                With over 15 years of experience in fine dining, Chef Maria brings creativity 
                and passion to every dish.
              </p>
            </div>
            <div className="text-center">
              <div className="h-48 w-48 mx-auto mb-4">
                <img
                  src="https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&q=80"
                  alt="Sous Chef"
                  className="h-full w-full object-cover rounded-full"
                />
              </div>
              <h3 className="text-xl font-semibold mb-2">James Chen</h3>
              <p className="text-gray-600">Sous Chef</p>
              <p className="mt-4 text-gray-600">
                Specializing in fusion cuisine, James combines traditional techniques with 
                modern innovation.
              </p>
            </div>
            <div className="text-center">
              <div className="h-48 w-48 mx-auto mb-4">
                <img
                  src="https://images.unsplash.com/photo-1566554273541-37a9ca77b91f?auto=format&fit=crop&q=80"
                  alt="Pastry Chef"
                  className="h-full w-full object-cover rounded-full"
                />
              </div>
              <h3 className="text-xl font-semibold mb-2">Sophie Laurent</h3>
              <p className="text-gray-600">Pastry Chef</p>
              <p className="mt-4 text-gray-600">
                A master of sweet creations, Sophie brings French pastry expertise to our dessert menu.
              </p>
            </div>
          </div>
        </div>

        {/* Sustainability Section */}
        <div className="bg-gray-50 rounded-lg p-8">
          <h2 className="text-2xl font-semibold mb-6 text-center">Our Commitment to Sustainability</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-4">Local Sourcing</h3>
              <p className="text-gray-600">
                We partner with local farmers and suppliers to reduce our carbon footprint 
                and support our community.
              </p>
            </div>
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-4">Zero Waste</h3>
              <p className="text-gray-600">
                Our kitchen implements strict waste reduction practices and composts all 
                organic waste.
              </p>
            </div>
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-4">Sustainable Packaging</h3>
              <p className="text-gray-600">
                All our takeout containers and packaging are made from biodegradable materials.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}