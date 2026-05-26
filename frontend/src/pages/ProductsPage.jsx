import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '../contexts/LanguageContext';
import ProductCard from '../components/ProductCard';
import { Search, SlidersHorizontal } from 'lucide-react';
import axios from 'axios';

const ProductsPage = () => {
  const { t } = useLanguage();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [sortBy, setSortBy] = useState('createdAt');
  const [categories, setCategories] = useState([]);
  const [showFilters, setShowFilters] = useState(false);

  // 1. Define the function BEFORE using it (Fixes the "Access before declared" error)
  const fetchProducts = async () => {
    try {
      const params = {
        sortBy,
        sortOrder: 'desc'
      };
      if (selectedCategory) params.category = selectedCategory;
      if (priceRange.min) params.minPrice = priceRange.min;
      if (priceRange.max) params.maxPrice = priceRange.max;
      
      const res = await axios.get('http://localhost:5000/api/products', { params });
      setProducts(res.data.data || []);
      
      const uniqueCategories = [...new Set((res.data.data || []).map(p => p.category))];
      setCategories(uniqueCategories);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  // 2. Now the hook can safely call it
  useEffect(() => {
    // call async fetch on next tick to avoid setting state synchronously inside the effect
    const t = setTimeout(() => {
      fetchProducts();
    }, 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    return () => clearTimeout(t);
  }, [selectedCategory, sortBy, priceRange]);

  const filteredProducts = products.filter(product =>
    product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const addToCart = (product) => {
    console.log('Added to cart:', product);
  };

  const clearFilters = () => {
    setSelectedCategory('');
    setPriceRange({ min: '', max: '' });
    setSortBy('createdAt');
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h1 className="text-3xl md:text-4xl font-bold mb-4">{t('allProducts')}</h1>
        <p className="text-text-dark/70 dark:text-text/70 max-w-2xl mx-auto">
          {t('productsDesc')}
        </p>
      </motion.div>

      <div className="flex flex-col gap-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder={t('searchProducts')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg bg-white/10 dark:bg-burnt-coffee/50 border border-whiskey-sour/20 focus:border-whiskey-sour outline-none transition-colors"
            />
          </div>
          
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center justify-center space-x-2 px-4 py-2 rounded-lg border border-whiskey-sour text-whiskey-sour hover:bg-whiskey-sour hover:text-balsamico transition-colors"
          >
            <SlidersHorizontal size={18} />
            <span>{t('filters')}</span>
          </button>
        </div>

        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="p-4 rounded-lg bg-white/10 dark:bg-burnt-coffee/50 border border-whiskey-sour/20"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm mb-2">{t('category')}</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-white/10 dark:bg-burnt-coffee border border-whiskey-sour/20 focus:border-whiskey-sour outline-none"
                >
                  <option value="">{t('allCategories')}</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm mb-2">{t('priceRange')}</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder={t('min')}
                    value={priceRange.min}
                    onChange={(e) => setPriceRange({ ...priceRange, min: e.target.value })}
                    className="w-1/2 px-3 py-2 rounded-lg bg-white/10 dark:bg-burnt-coffee border border-whiskey-sour/20 focus:border-whiskey-sour outline-none"
                  />
                  <input
                    type="number"
                    placeholder={t('max')}
                    value={priceRange.max}
                    onChange={(e) => setPriceRange({ ...priceRange, max: e.target.value })}
                    className="w-1/2 px-3 py-2 rounded-lg bg-white/10 dark:bg-burnt-coffee border border-whiskey-sour/20 focus:border-whiskey-sour outline-none"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm mb-2">{t('sortBy')}</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-white/10 dark:bg-burnt-coffee border border-whiskey-sour/20 focus:border-whiskey-sour outline-none"
                >
                  <option value="createdAt">{t('newest')}</option>
                  <option value="price">{t('priceLowToHigh')}</option>
                  <option value="-price">{t('priceHighToLow')}</option>
                  <option value="averageRating">{t('topRated')}</option>
                </select>
              </div>
            </div>
            
            <button
              onClick={clearFilters}
              className="mt-4 text-sm text-whiskey-sour hover:underline"
            >
              {t('clearFilters')}
            </button>
          </motion.div>
        )}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-80 rounded-xl bg-gray-200 dark:bg-gray-800 animate-pulse" />
          ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product, idx) => (
              <ProductCard key={product._id} product={product} index={idx} onAddToCart={addToCart} />
            ))}
          </div>
          
          {filteredProducts.length === 0 && (
            <div className="text-center py-12">
              <p className="text-text-dark/70 dark:text-text/70">{t('noProductsFound')}</p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ProductsPage;