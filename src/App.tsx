import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Navigation } from './components/Navigation';
import { Footer } from './components/Footer';
import { HomePage } from './pages/HomePage';
import { MenuPage } from './pages/MenuPage';
import { AboutPage } from './pages/AboutPage';
import { ReservationsPage } from './pages/ReservationsPage';
import { OrderPage } from './pages/OrderPage';
import { ContactPage } from './pages/ContactPage';
import { StaffLoginPage } from './pages/StaffLoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { InventoryPage } from './pages/InventoryPage';
import { MenuManagementPage } from './pages/MenuManagementPage';
import { LaborPage } from './pages/LaborPage.tsx';
import { OrdersPage } from './pages/OrdersPage';
import { VendorsPage } from './pages/VendorsPage.tsx';
import { ReportsPage } from './pages/ReportsPage.tsx';
import { SettingsPage } from './pages/SettingsPage';
import { HelpPage } from './pages/HelpPage.tsx';

function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col">
        <Routes>
          {/* Public Routes */}
          <Route
            path="/"
            element={
              <>
                <Navigation />
                <main className="flex-grow">
                  <HomePage />
                </main>
                <Footer />
              </>
            }
          />
          <Route
            path="/menu"
            element={
              <>
                <Navigation />
                <main className="flex-grow">
                  <MenuPage />
                </main>
                <Footer />
              </>
            }
          />
          <Route
            path="/about"
            element={
              <>
                <Navigation />
                <main className="flex-grow">
                  <AboutPage />
                </main>
                <Footer />
              </>
            }
          />
          <Route
            path="/reservations"
            element={
              <>
                <Navigation />
                <main className="flex-grow">
                  <ReservationsPage />
                </main>
                <Footer />
              </>
            }
          />
          <Route
            path="/order"
            element={
              <>
                <Navigation />
                <main className="flex-grow">
                  <OrderPage />
                </main>
                <Footer />
              </>
            }
          />
          <Route
            path="/contact"
            element={
              <>
                <Navigation />
                <main className="flex-grow">
                  <ContactPage />
                </main>
                <Footer />
              </>
            }
          />
          <Route path="/staff-login" element={<StaffLoginPage />} />
          
          {/* Admin Routes */}
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/dashboard/inventory" element={<InventoryPage />} />
          <Route path="/dashboard/menu" element={<MenuManagementPage />} />
          <Route path="/dashboard/labor" element={<LaborPage />} />
          <Route path="/dashboard/orders" element={<OrdersPage />} />
          <Route path="/dashboard/vendors" element={<VendorsPage />} />
          <Route path="/dashboard/reports" element={<ReportsPage />} />
          <Route path="/dashboard/settings" element={<SettingsPage />} />
          <Route path="/dashboard/help" element={<HelpPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;