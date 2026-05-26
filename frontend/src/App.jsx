import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { LanguageProvider } from './contexts/LanguageContext';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import ChannelsPage from './pages/ChannelsPage';
import ChannelDetailsPage from './pages/ChannelDetailsPage';
import ProductsPage from './pages/ProductsPage';
import ProductDetailsPage from './pages/ProductDetailsPage';
import BuyerDashboard from './pages/BuyerDashboard';
import OrdersPage from './pages/OrdersPage';
import CartPage from './pages/CartPage';
import ChannelOwnerDashboard from './pages/ChannelOwnerDashboard';
import MyChannelsPage from './pages/MyChannelsPage';
import CreateChannelPage from './pages/CreateChannelPage';
import MyProductsPage from './pages/MyProductsPage';
import CreateProductPage from './pages/CreateProductPage';
import AdminDashboard from './pages/AdminDashboard';
import PrivateRoute from './components/PrivateRoute';

function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <Router>
          <div className="min-h-screen bg-background-light dark:bg-balsamico transition-colors duration-300">
            <Navbar />
            <main className="container-custom py-8">
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<HomePage />} />
                <Route path="/channels" element={<ChannelsPage />} />
                <Route path="/channel/:id" element={<ChannelDetailsPage />} />
                <Route path="/products" element={<ProductsPage />} />
                <Route path="/product/:id" element={<ProductDetailsPage />} />
                
                {/* Buyer Routes */}
                <Route path="/dashboard" element={<PrivateRoute role="buyer"><BuyerDashboard /></PrivateRoute>} />
                <Route path="/orders" element={<PrivateRoute role="buyer"><OrdersPage /></PrivateRoute>} />
                <Route path="/cart" element={<PrivateRoute><CartPage /></PrivateRoute>} />
                
                {/* Seller/Channel Owner Routes */}
                <Route path="/seller/dashboard" element={<PrivateRoute role="seller"><ChannelOwnerDashboard /></PrivateRoute>} />
                <Route path="/seller/channels" element={<PrivateRoute role="seller"><MyChannelsPage /></PrivateRoute>} />
                <Route path="/seller/channels/create" element={<PrivateRoute role="seller"><CreateChannelPage /></PrivateRoute>} />
                <Route path="/seller/products" element={<PrivateRoute role="seller"><MyProductsPage /></PrivateRoute>} />
                <Route path="/seller/products/create" element={<PrivateRoute role="seller"><CreateProductPage /></PrivateRoute>} />
                
                {/* Admin Routes */}
                <Route path="/admin" element={<PrivateRoute role="admin"><AdminDashboard /></PrivateRoute>} />
              </Routes>
            </main>
          </div>
        </Router>
      </LanguageProvider>
    </ThemeProvider>
  );
}

export default App;