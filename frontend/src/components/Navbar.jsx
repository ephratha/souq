import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { 
  Menu, X, Home, Users, Package, Sun, Moon, 
  ShoppingCart, User, LogIn
} from 'lucide-react';

const Navbar = () => {
  const { darkMode, toggleTheme } = useTheme();
  const { t, toggleLanguage, isAmharic } = useLanguage();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const navigate = useNavigate();
  
  // Mock auth state - replace with actual auth
  const [user, setUser] = useState(null);
  const isLoggedIn = false;
  const userRole = null;

  const navItems = [
    { path: '/', label: t('home'), icon: Home },
    { path: '/channels', label: t('channels'), icon: Users },
    { path: '/products', label: t('products'), icon: Package },
  ];

  const handleLogout = () => {
    // Add logout logic
    setUser(null);
    setIsUserMenuOpen(false);
    navigate('/');
  };

  return (
    <nav className="sticky top-0 z-50 backdrop-blur-lg bg-background-light/80 dark:bg-balsamico/80 border-b border-whiskey-sour/20">
      <div className="container-custom">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="text-2xl font-bold bg-gradient-to-r from-whiskey-sour to-honey-garlic bg-clip-text text-transparent"
            >
              Souq
            </motion.div>
            <span className="text-xs text-whiskey-sour hidden sm:inline">Marketplace</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className="flex items-center space-x-1 text-text-dark dark:text-text hover:text-whiskey-sour transition-colors"
              >
                <item.icon size={18} />
                <span>{item.label}</span>
              </Link>
            ))}
          </div>

          {/* Right Section */}
          <div className="flex items-center space-x-3">
            {/* Cart Icon */}
            <Link to="/cart" className="relative p-2 rounded-lg hover:bg-whiskey-sour/10 transition-colors">
              <ShoppingCart size={20} />
              <span className="absolute -top-1 -right-1 bg-honey-garlic text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                0
              </span>
            </Link>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-whiskey-sour/10 transition-colors"
            >
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            {/* Language Toggle */}
            <button
              onClick={toggleLanguage}
              className="p-2 rounded-lg hover:bg-whiskey-sour/10 transition-colors font-medium"
            >
              {isAmharic ? 'EN' : 'አማ'}
            </button>

            {/* User Menu */}
            {isLoggedIn ? (
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center space-x-2 p-2 rounded-lg hover:bg-whiskey-sour/10 transition-colors"
                >
                  <User size={20} />
                </button>
                
                {isUserMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute right-0 mt-2 w-48 bg-background-light dark:bg-burnt-coffee rounded-lg shadow-lg border border-whiskey-sour/20 overflow-hidden"
                  >
                    {userRole === 'buyer' && (
                      <Link to="/dashboard" className="block px-4 py-2 hover:bg-whiskey-sour/10">
                        {t('dashboard')}
                      </Link>
                    )}
                    {userRole === 'seller' && (
                      <>
                        <Link to="/seller/dashboard" className="block px-4 py-2 hover:bg-whiskey-sour/10">
                          {t('dashboard')}
                        </Link>
                        <Link to="/seller/channels" className="block px-4 py-2 hover:bg-whiskey-sour/10">
                          {t('myChannels')}
                        </Link>
                        <Link to="/seller/products" className="block px-4 py-2 hover:bg-whiskey-sour/10">
                          {t('myProducts')}
                        </Link>
                      </>
                    )}
                    {userRole === 'admin' && (
                      <Link to="/admin" className="block px-4 py-2 hover:bg-whiskey-sour/10">
                        {t('adminPanel')}
                      </Link>
                    )}
                    <button onClick={handleLogout} className="block w-full text-left px-4 py-2 hover:bg-whiskey-sour/10">
                      {t('logout')}
                    </button>
                  </motion.div>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className="flex items-center space-x-1 px-4 py-2 rounded-lg bg-whiskey-sour text-balsamico hover:bg-honey-garlic transition-colors"
              >
                <LogIn size={18} />
                <span>{t('login')}</span>
              </Link>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-whiskey-sour/10 transition-colors"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden py-4 border-t border-whiskey-sour/20"
          >
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center space-x-2 px-4 py-3 hover:bg-whiskey-sour/10 rounded-lg transition-colors"
              >
                <item.icon size={18} />
                <span>{item.label}</span>
              </Link>
            ))}
          </motion.div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;