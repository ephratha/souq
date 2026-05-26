import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import ChannelCard from '../components/ChannelCard';
import { useLanguage } from '../contexts/LanguageContext';
import { Search, Filter } from 'lucide-react';
import axios from 'axios';

const ChannelsPage = () => {
  const { t } = useLanguage();
  const [channels, setChannels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchChannels = async () => {
      try {
        setLoading(true);
        const params = {};
        if (selectedCategory) params.category = selectedCategory;
        const res = await axios.get('http://localhost:5000/api/channels', { params });
        const channelData = res.data.data || [];
        setChannels(channelData);

        // Extract unique categories
        const uniqueCategories = [...new Set(channelData.map(c => c.category))];
        setCategories(uniqueCategories);
      } catch (error) {
        console.error('Error fetching channels:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchChannels();
  }, [selectedCategory]);

  const filteredChannels = channels.filter(channel =>
    channel.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    channel.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h1 className="text-3xl md:text-4xl font-bold mb-4">{t('telegramChannels')}</h1>
        <p className="text-text-dark/70 dark:text-text/70 max-w-2xl mx-auto">
          {t('channelsDesc')}
        </p>
      </motion.div>

      {/* Search & Filter */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder={t('searchChannels')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg bg-white/10 dark:bg-burnt-coffee/50 border border-whiskey-sour/20 focus:border-whiskey-sour outline-none transition-colors"
          />
        </div>
        
        <div className="relative">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="appearance-none pl-4 pr-10 py-2 rounded-lg bg-white/10 dark:bg-burnt-coffee/50 border border-whiskey-sour/20 focus:border-whiskey-sour outline-none cursor-pointer"
          >
            <option value="">{t('allCategories')}</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          <Filter className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
        </div>
      </div>

      {/* Channels Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-64 rounded-xl bg-gray-200 dark:bg-gray-800 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredChannels.map((channel, idx) => (
            <ChannelCard key={channel._id} channel={channel} index={idx} />
          ))}
        </div>
      )}

      {!loading && filteredChannels.length === 0 && (
        <div className="text-center py-12">
          <p className="text-text-dark/70 dark:text-text/70">{t('noChannelsFound')}</p>
        </div>
      )}
    </div>
  );
};

export default ChannelsPage;