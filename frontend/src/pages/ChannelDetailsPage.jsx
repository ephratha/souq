import  { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useLanguage } from '../contexts/LanguageContext';
import ProductCard from '../components/ProductCard';
import { ExternalLink, Package, Users, ArrowLeft } from 'lucide-react';
import axios from 'axios';

const ChannelDetailsPage = () => {
  const { id } = useParams();
  const { t } = useLanguage();
  const [channel, setChannel] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchChannelData = async () => {
      try {
        const [channelRes, productsRes] = await Promise.all([
          axios.get(`http://localhost:5000/api/channels/${id}`),
          axios.get(`http://localhost:5000/api/channels/${id}/products`)
        ]);
        setChannel(channelRes.data.data);
        setProducts(productsRes.data.data?.products || []);
      } catch (error) {
        console.error('Error fetching channel data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchChannelData();
  }, [id]);

  const addToCart = (product) => {
    console.log('Added to cart:', product);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-whiskey-sour"></div>
      </div>
    );
  }

  if (!channel) {
    return <div className="text-center py-12">{t('channelNotFound')}</div>;
  }

  return (
    <div className="space-y-8">
      {/* Back Button */}
      <Link to="/channels" className="inline-flex items-center space-x-2 text-whiskey-sour hover:underline">
        <ArrowLeft size={20} />
        <span>{t('backToChannels')}</span>
      </Link>

      {/* Channel Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-whiskey-sour/20 to-honey-garlic/20 p-6 md:p-8"
      >
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
          {/* Logo */}
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-whiskey-sour to-honey-garlic flex items-center justify-center text-3xl font-bold flex-shrink-0">
            {channel.logoPath ? (
              <img src={`http://localhost:5000${channel.logoPath}`} alt={channel.name} className="w-full h-full rounded-full object-cover" />
            ) : (
              channel.name.charAt(0)
            )}
          </div>

          {/* Info */}
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-3xl md:text-4xl font-bold mb-2">{channel.name}</h1>
            <p className="text-text-dark/70 dark:text-text/70 mb-4">{channel.description}</p>
            
            <div className="flex flex-wrap justify-center md:justify-start gap-4 mb-4">
              <div className="flex items-center space-x-2">
                <Package size={18} className="text-whiskey-sour" />
                <span>{channel.productCount} {t('products')}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Users size={18} className="text-whiskey-sour" />
                <span>{channel.memberCount || 0} {t('members')}</span>
              </div>
              <span className="px-2 py-1 rounded-full bg-whiskey-sour/20 text-whiskey-sour text-sm">
                {channel.category}
              </span>
            </div>
          </div>

          {/* Join Button */}
          <a
            href={channel.formattedTelegramLink || channel.telegramLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-2 px-6 py-3 rounded-lg bg-whiskey-sour text-balsamico hover:bg-honey-garlic transition-colors whitespace-nowrap"
          >
            <span>{t('joinTelegramChannel')}</span>
            <ExternalLink size={18} />
          </a>
        </div>
      </motion.div>

      {/* Products Section */}
      <div>
        <h2 className="text-2xl font-bold mb-6">{t('productsInChannel')}</h2>
        
        {products.length === 0 ? (
          <div className="text-center py-12 bg-white/10 dark:bg-burnt-coffee/50 rounded-xl">
            <Package size={48} className="mx-auto mb-4 text-text-dark/30 dark:text-text/30" />
            <p className="text-text-dark/70 dark:text-text/70">{t('noProductsYet')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product, idx) => (
              <ProductCard key={product._id} product={product} index={idx} onAddToCart={addToCart} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChannelDetailsPage;