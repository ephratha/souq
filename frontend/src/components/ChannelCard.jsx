import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { Users, Package, ExternalLink } from 'lucide-react';

const ChannelCard = ({ channel, index }) => {
  const { t } = useLanguage();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ y: -5 }}
      className="group relative bg-white/10 dark:bg-burnt-coffee/50 backdrop-blur-sm rounded-xl overflow-hidden border border-whiskey-sour/20 hover:border-whiskey-sour/50 transition-all duration-300"
    >
      <div className="p-6">
        {/* Logo */}
        <div className="flex items-center justify-between mb-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-whiskey-sour to-honey-garlic flex items-center justify-center text-2xl font-bold">
            {channel.logo ? (
              <img src={channel.logo} alt={channel.name} className="w-full h-full rounded-full object-cover" />
            ) : (
              channel.name.charAt(0)
            )}
          </div>
          <span className="px-2 py-1 text-xs rounded-full bg-whiskey-sour/20 text-whiskey-sour">
            {channel.category}
          </span>
        </div>

        {/* Info */}
        <h3 className="text-xl font-semibold mb-2 text-text-dark dark:text-text">
          {channel.name}
        </h3>
        <p className="text-text-dark/70 dark:text-text/70 text-sm mb-4 line-clamp-2">
          {channel.description}
        </p>

        {/* Stats */}
        <div className="flex items-center justify-between mb-4 text-sm">
          <div className="flex items-center space-x-1">
            <Package size={16} />
            <span>{channel.productCount} {t('products')}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Users size={16} />
            <span>{channel.memberCount || 0} {t('members')}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex space-x-2">
          <Link
            to={`/channel/${channel._id}`}
            className="flex-1 text-center px-4 py-2 rounded-lg border border-whiskey-sour text-whiskey-sour hover:bg-whiskey-sour hover:text-balsamico transition-all duration-300"
          >
            {t('viewProducts')}
          </Link>
          <a
            href={channel.formattedTelegramLink || channel.telegramLink}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 rounded-lg bg-whiskey-sour text-balsamico hover:bg-honey-garlic transition-all duration-300 flex items-center space-x-1"
          >
            <span>{t('join')}</span>
            <ExternalLink size={16} />
          </a>
        </div>
      </div>
    </motion.div>
  );
};

export default ChannelCard;