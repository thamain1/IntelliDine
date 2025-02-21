import React from 'react';
import { Facebook, Instagram, Twitter } from 'lucide-react';
import { Link } from 'react-router-dom';

export function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact Us</h3>
            <address className="not-italic">
              <p>123 Restaurant Ave</p>
              <p>Foodie City, FC 12345</p>
              <p className="mt-2">(555) 123-4567</p>
              <p>info@intellidine.com</p>
            </address>
          </div>

          {/* Hours */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Hours</h3>
            <ul>
              <li>Mon-Thu: 11am - 10pm</li>
              <li>Fri-Sat: 11am - 11pm</li>
              <li>Sun: 11am - 9pm</li>
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><Link to="/menu" className="hover:text-indigo-400">Menu</Link></li>
              <li><Link to="/reservations" className="hover:text-indigo-400">Reservations</Link></li>
              <li><Link to="/order" className="hover:text-indigo-400">Order Online</Link></li>
              <li><Link to="/contact" className="hover:text-indigo-400">Contact</Link></li>
            </ul>
          </div>

          {/* Social & Management */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Connect With Us</h3>
            <div className="flex space-x-4 mb-6">
              <a href="https://facebook.com" className="hover:text-indigo-400">
                <Facebook className="h-6 w-6" />
              </a>
              <a href="https://instagram.com" className="hover:text-indigo-400">
                <Instagram className="h-6 w-6" />
              </a>
              <a href="https://twitter.com" className="hover:text-indigo-400">
                <Twitter className="h-6 w-6" />
              </a>
            </div>
            <Link to="/staff-login" className="text-sm text-gray-400 hover:text-white">
              Staff Login
            </Link>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-700 text-center text-sm text-gray-400">
          <p>&copy; {new Date().getFullYear()} IntelliDine. All rights reserved.</p>
          <div className="mt-2">
            <Link to="/privacy" className="hover:text-white">Privacy Policy</Link>
            {' • '}
            <Link to="/terms" className="hover:text-white">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}