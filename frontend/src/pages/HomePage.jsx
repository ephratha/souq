import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import ChannelCard from '../components/ChannelCard';
import ProductCard from '../components/ProductCard';
import { ArrowRight, Telegram, Shield, Truck } from 'lucide-react';
import axios from 'axios';

const HomePage = () => {
  const { t } = useLanguage();
  const [featuredChannels, setFeaturedChannels] = useState([]);
  const [recentProducts, setRecentProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const fetchHomeData = async () => {
      try {
        const [channelsRes, productsRes] = await Promise.all([
          axios.get('http://localhost:5000/api/channels/popular?limit=6'),
          axios.get('http://localhost:5000/api/products?limit=8&sortBy=createdAt')
        ]);

        if (!isMounted) return;

        setFeaturedChannels(channelsRes.data.data || []);
        setRecentProducts(productsRes.data.data || []);
      } catch (error) {
        console.error('Error fetching home data:', error);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchHomeData();

    return () => {
      isMounted = false;
    };
  }, []);

  const addToCart = (product) => {
    // Add to cart logic
    console.log('Added to cart:', product);
  };

  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-whiskey-sour/20 via-honey-garlic/10 to-transparent p-8 md:p-12"
      >
        <div className="relative z-10 max-w-2xl">
          <motion.div
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex items-center space-x-2 mb-4">
              <Telegram className="text-whiskey-sour" size={32} />
              <span className="text-sm font-semibold text-whiskey-sour uppercase tracking-wide">
                Telegram-First Marketplace
              </span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-whiskey-sour to-honey-garlic bg-clip-text text-transparent">
              {t('heroTitle')}
            </h1>
            <p className="text-lg text-text-dark/80 dark:text-text/80 mb-6">
              {t('heroSubtitle')}
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/products" className="btn-primary flex items-center space-x-2">
                <span>{t('shopNow')}</span>
                <ArrowRight size={18} />
              </Link>
              <Link to="/channels" className="btn-secondary">
                {t('exploreChannels')}
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-whiskey-sour/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-honey-garlic/10 rounded-full blur-3xl" />
      </motion.section>

      {/* Features */}
      <motion.section
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        {[
          { icon: Telegram, title: t('telegramFirst'), desc: t('telegramFirstDesc') },
          { icon: Shield, title: t('secureTrading'), desc: t('secureTradingDesc') },
          { icon: Truck, title: t('fastDelivery'), desc: t('fastDeliveryDesc') }
        ].map((feature, idx) => (
          <motion.div
            key={idx}
            whileHover={{ y: -5 }}
            className="p-6 rounded-xl bg-white/10 dark:bg-burnt-coffee/50 backdrop-blur-sm border border-whiskey-sour/20"
          >
            <feature.icon className="text-whiskey-sour mb-4" size={40} />
            <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
            <p className="text-text-dark/70 dark:text-text/70">{feature.desc}</p>
          </motion.div>
        ))}
      </motion.section>

      {/* Featured Channels */}
      <section>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl md:text-3xl font-bold">{t('featuredChannels')}</h2>
          <Link to="/channels" className="text-whiskey-sour hover:underline flex items-center space-x-1">
            <span>{t('viewAll')}</span>
            <ArrowRight size={16} />
          </Link>
        </div>
        
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-64 rounded-xl bg-gray-200 dark:bg-gray-800 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredChannels.map((channel, idx) => (
              <ChannelCard key={channel._id} channel={channel} index={idx} />
            ))}
          </div>
        )}
      </section>

      {/* Recent Products */}
      <section>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl md:text-3xl font-bold">{t('recentProducts')}</h2>
          <Link to="/products" className="text-whiskey-sour hover:underline flex items-center space-x-1">
            <span>{t('viewAll')}</span>
            <ArrowRight size={16} />
          </Link>
        </div>
        
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-80 rounded-xl bg-gray-200 dark:bg-gray-800 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {recentProducts.map((product, idx) => (
              <ProductCard key={product._id} product={product} index={idx} onAddToCart={addToCart} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default HomePage;