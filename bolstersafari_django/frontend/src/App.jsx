import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import { Toaster } from 'react-hot-toast';
import ProtectedRoute from './components/ProtectedRoute';
import { Analytics } from "@vercel/analytics/react";
import toast from 'react-hot-toast';

// Keep-alive hook to prevent Render free-tier cold starts
// Pings the backend health endpoint every 5 minutes
function useServerKeepAlive() {
  useEffect(() => {
    const ping = async () => {
      try {
        await fetch('/api/trips/categories/', { method: 'GET', cache: 'no-store' });
      } catch (_) {
        // Silently ignore ping failures
      }
    };
    // Immediate ping on load to wake the server
    ping();
    // Then ping every 4 minutes (Render free tier sleeps after 15 min of inactivity)
    const interval = setInterval(ping, 4 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);
}

// Placeholder Pages
import Home from './pages/Home';
import Trips from './pages/Trips';
import TicketView from './pages/TicketView';
import TripDetail from './pages/TripDetail';
import NotFound from './pages/NotFound';
import ErrorPage from './pages/ErrorPage';
import BookingForm from './pages/BookingForm';
import About from './pages/About';

import BookingSuccess from './pages/BookingSuccess';
import Blog from './pages/Blog';
import BlogPost from './pages/BlogPost';
import AIPlanner from './pages/AIPlanner';

import AdminLayout from './layouts/AdminLayout';
import AdminLogin from './pages/admin/AdminLogin';
import Dashboard from './pages/admin/Dashboard';
import TripsManager from './pages/admin/TripsManager';
import TripForm from './pages/admin/TripForm';
import UsersManager from './pages/admin/UsersManager';
import BookingsManager from './pages/admin/BookingsManager';
import CustomerPortal from './pages/admin/CustomerPortal';

import CustomerLayout from './layouts/CustomerLayout';
import CustomerDashboard from './pages/customer/CustomerDashboard';
import CustomerRegister from './pages/customer/CustomerRegister';
import BlogManager from './pages/admin/BlogManager';
import CouponsManager from './pages/admin/CouponsManager';
import Settings from './pages/admin/Settings';
function App() {
  useServerKeepAlive();
  return (
    <Router>
      <Toaster position="top-right" />
      <Analytics />
      <Routes>
        {/* Admin Routes */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }>
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="trips" element={<TripsManager />} />
          <Route path="trips/new" element={<TripForm />} />
          <Route path="trips/:id" element={<TripForm />} />
          <Route path="bookings" element={<BookingsManager />} />
          <Route path="customers" element={<CustomerPortal />} />

          <Route path="users" element={<UsersManager />} />
          <Route path="blog" element={<BlogManager />} />
          <Route path="coupons" element={<CouponsManager />} />
          <Route path="settings" element={<Settings />} />
        </Route>

        <Route path="/customer/register" element={<CustomerRegister />} />

        {/* Customer Portal Routes */}
        <Route path="/customer" element={<CustomerLayout />}>
          <Route path="dashboard" element={<CustomerDashboard />} />
          <Route path="wishlist" element={<CustomerDashboard />} />
        </Route>

        {/* Ticket View Route (Standalone without navbar/footer) */}
        <Route path="/ticket/preview" element={<TicketView />} />
        <Route path="/ticket/:bookingRef" element={<TicketView />} />

        {/* Public Routes */}
        <Route path="/*" element={
          <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <Navbar />
            <main style={{ flex: 1 }}>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/about" element={<About />} />
                <Route path="/trips" element={<Trips />} />

                <Route path="/ticket/:bookingRef" element={<TicketView />} />

                <Route path="/trip/:slug" element={<TripDetail />} />
                <Route path="/book/:slug" element={<BookingForm />} />
                <Route path="/booking/success/:ref" element={<BookingSuccess />} />
                <Route path="/blog" element={<Blog />} />
                <Route path="/blog/:slug" element={<BlogPost />} />
                <Route path="/ai-planner" element={<AIPlanner />} />
                <Route path="/error" element={<ErrorPage />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>
            <Footer />
          </div>
        } />
      </Routes>
    </Router>
  );
}

export default App;
