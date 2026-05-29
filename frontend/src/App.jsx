import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';

// Public Pages
import HomePage from './pages/HomePage';
import ChannelsPage from './pages/ChannelsPage';
import ChannelDetailsPage from './pages/ChannelDetailsPage';
import ProductsPage from './pages/ProductsPage';
import ProductDetailsPage from './pages/ProductDetailsPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import CartPage from './pages/CartPage';

// Protected Pages (Require Login)
import CheckoutPage from './pages/CheckoutPage';
import OrdersPage from './pages/OrdersPage';
import BuyerDashboard from './pages/BuyerDashboard';
import SellerDashboard from './pages/SellerDashboard';
import AdminDashboard from './pages/AdminDashboard';
import MyChannelsPage from './pages/MyChannelsPage';
import MyProductsPage from './pages/MyProductsPage';
import CreateChannelPage from './pages/CreateChannelPage';
import CreateProductPage from './pages/CreateProductPage';

// Route Protection Component
import PrivateRoute from './components/PrivateRoute';

function App() {
  return (
    <Router>
      {/* 
          Using 'bg-background' and 'text-text' from your config 
          so it responds to light/dark mode automatically 
      */}
      <div className="min-h-screen bg-background text-text font-outfit transition-colors duration-300">
        <Navbar />
        
        <Routes>
          {/* PUBLIC ROUTES */}
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/channels" element={<ChannelsPage />} />
          <Route path="/channels/:id" element={<ChannelDetailsPage />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/products/:id" element={<ProductDetailsPage />} />
          <Route path="/cart" element={<CartPage />} />
          
          {/* PROTECTED ROUTES (User must be logged in) */}
          <Route element={<PrivateRoute />}>
            {/* Common Protected */}
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/orders" element={<OrdersPage />} />
            
            {/* Buyer Specific */}
            <Route path="/buyer-dashboard" element={<BuyerDashboard />} />
            
            {/* Seller Specific */}
            <Route path="/seller-dashboard" element={<SellerDashboard />} />
            <Route path="/my-channels" element={<MyChannelsPage />} />
            <Route path="/my-products" element={<MyProductsPage />} />
            <Route path="/create-channel" element={<CreateChannelPage />} />
            <Route path="/create-product" element={<CreateProductPage />} />
            
            {/* Admin Specific */}
            <Route path="/admin-dashboard" element={<AdminDashboard />} />
          </Route>

          {/* Catch-all 404 (Optional) */}
          <Route path="*" element={<div className="p-20 text-center">Page Not Found</div>} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;