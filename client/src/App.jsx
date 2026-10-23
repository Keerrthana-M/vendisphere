import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { ProtectedRoute } from './components/common/ProtectedRoute'
import { Navbar } from './components/layout/Navbar'

// Public Pages
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'

// Customer Pages
import Marketplace from './pages/customer/Marketplace'
import ProductDetails from './pages/customer/ProductDetails'
import Cart from './pages/customer/Cart'
import Checkout from './pages/customer/Checkout'
import CustomerOrders from './pages/customer/CustomerOrders'
import OrderDetails from './pages/customer/OrderDetails'
import Profile from './pages/customer/Profile'

// Vendor Pages
import VendorDashboard from './pages/vendor/VendorDashboard'
import VendorProducts from './pages/vendor/VendorProducts'
import AddEditProduct from './pages/vendor/AddEditProduct'
import VendorInventory from './pages/vendor/VendorInventory'
import VendorOrders from './pages/vendor/VendorOrders'
import VendorAnalytics from './pages/vendor/VendorAnalytics'
import VendorInsights from './pages/vendor/VendorInsights'

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminVendors from './pages/admin/AdminVendors'
import AdminUsers from './pages/admin/AdminUsers'
import AdminProducts from './pages/admin/AdminProducts'
import AdminOrders from './pages/admin/AdminOrders'
import AdminAnalytics from './pages/admin/AdminAnalytics'

import './App.css'

// Paths where the public footer should NOT appear
const DASHBOARD_PATHS = [
  '/vendor',
  '/admin',
  '/cart',
  '/checkout',
  '/orders',
  '/profile'
]

function AppLayout() {
  const location = useLocation()
  const isDashboard = DASHBOARD_PATHS.some(p => location.pathname.startsWith(p))

  return (
    <div className="app-container">
      <Navbar />

      <main className="main-content">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/marketplace" element={<Marketplace />} />
          <Route path="/product/:id" element={<ProductDetails />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected Customer Routes */}
          <Route path="/cart" element={
            <ProtectedRoute roles={['customer']}>
              <Cart />
            </ProtectedRoute>
          } />
          <Route path="/checkout" element={
            <ProtectedRoute roles={['customer']}>
              <Checkout />
            </ProtectedRoute>
          } />
          <Route path="/orders" element={
            <ProtectedRoute roles={['customer']}>
              <CustomerOrders />
            </ProtectedRoute>
          } />
          <Route path="/orders/:id" element={
            <ProtectedRoute roles={['customer', 'vendor', 'admin']}>
              <OrderDetails />
            </ProtectedRoute>
          } />
          <Route path="/profile" element={
            <ProtectedRoute roles={['customer', 'vendor', 'admin']}>
              <Profile />
            </ProtectedRoute>
          } />

          {/* Protected Vendor Routes */}
          <Route path="/vendor/dashboard" element={
            <ProtectedRoute roles={['vendor']}>
              <VendorDashboard />
            </ProtectedRoute>
          } />
          <Route path="/vendor/products" element={
            <ProtectedRoute roles={['vendor']}>
              <VendorProducts />
            </ProtectedRoute>
          } />
          <Route path="/vendor/products/new" element={
            <ProtectedRoute roles={['vendor']}>
              <AddEditProduct />
            </ProtectedRoute>
          } />
          <Route path="/vendor/products/edit/:id" element={
            <ProtectedRoute roles={['vendor']}>
              <AddEditProduct />
            </ProtectedRoute>
          } />
          <Route path="/vendor/inventory" element={
            <ProtectedRoute roles={['vendor']}>
              <VendorInventory />
            </ProtectedRoute>
          } />
          <Route path="/vendor/orders" element={
            <ProtectedRoute roles={['vendor']}>
              <VendorOrders />
            </ProtectedRoute>
          } />
          <Route path="/vendor/analytics" element={
            <ProtectedRoute roles={['vendor']}>
              <VendorAnalytics />
            </ProtectedRoute>
          } />
          <Route path="/vendor/insights" element={
            <ProtectedRoute roles={['vendor']}>
              <VendorInsights />
            </ProtectedRoute>
          } />

          {/* Protected Admin Routes */}
          <Route path="/admin/dashboard" element={
            <ProtectedRoute roles={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          } />
          <Route path="/admin/vendors" element={
            <ProtectedRoute roles={['admin']}>
              <AdminVendors />
            </ProtectedRoute>
          } />
          <Route path="/admin/users" element={
            <ProtectedRoute roles={['admin']}>
              <AdminUsers />
            </ProtectedRoute>
          } />
          <Route path="/admin/products" element={
            <ProtectedRoute roles={['admin']}>
              <AdminProducts />
            </ProtectedRoute>
          } />
          <Route path="/admin/orders" element={
            <ProtectedRoute roles={['admin']}>
              <AdminOrders />
            </ProtectedRoute>
          } />
          <Route path="/admin/analytics" element={
            <ProtectedRoute roles={['admin']}>
              <AdminAnalytics />
            </ProtectedRoute>
          } />

          {/* Fallback: redirect unknown paths to marketplace */}
          <Route path="*" element={<Marketplace />} />
        </Routes>
      </main>

      {/* Footer only on public pages */}
      {!isDashboard && (
        <footer className="app-footer">
          <div className="footer-container">
            <div className="footer-top">
              <div className="footer-brand">
                <div className="brand-container">
                  <div className="brand-icon">V</div>
                  <span className="brand-title">VendiSphere</span>
                </div>
                <p className="footer-desc">
                  Smart Multi-Vendor Commerce Platform &amp; Business Intelligence
                </p>
              </div>

              <div className="footer-nav">
                <div className="footer-column">
                  <span className="footer-col-title">Platform</span>
                  <Link to="/" className="footer-link">Home</Link>
                  <Link to="/marketplace" className="footer-link">Marketplace</Link>
                  <Link to="/login" className="footer-link">Sign In</Link>
                  <Link to="/register" className="footer-link">Register Account</Link>
                </div>
              </div>
            </div>

            <div className="footer-bottom">
              <p>© 2026 VendiSphere Platform. All rights reserved.</p>
            </div>
          </div>
        </footer>
      )}
    </div>
  )
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppLayout />
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
