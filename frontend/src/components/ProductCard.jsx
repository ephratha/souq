
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { ShoppingCart, Eye, Star } from 'lucide-react';

const ProductCard = ({ product, index, onAddToCart }) => {
  const { t } = useLanguage();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ y: -5 }}
      className="group relative bg-white/10 dark:bg-burnt-coffee/50 backdrop-blur-sm rounded-xl overflow-hidden border border-whiskey-sour/20 hover:border-whiskey-sour/50 transition-all duration-300"
    >
      {/* Image */}
      <Link to={`/product/${product._id}`} className="block relative aspect-square overflow-hidden bg-gradient-to-br from-whiskey-sour/10 to-honey-garlic/10">
        {product.imagePath ? (
          <img
            src={`http://localhost:5000${product.imagePath}`}
            alt={product.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-4xl">
            📦
          </div>
        )}
        
        {/* Discount Badge */}
        {product.discount > 0 && (
          <div className="absolute top-2 right-2 bg-honey-garlic text-white px-2 py-1 rounded-lg text-xs font-bold">
            {product.discount}% OFF
          </div>
        )}
      </Link>

      {/* Content */}
      <div className="p-4">
        <Link to={`/product/${product._id}`}>
          <h3 className="font-semibold mb-1 line-clamp-1 text-text-dark dark:text-text">
            {product.title}
          </h3>
        </Link>
        
        <p className="text-text-dark/70 dark:text-text/70 text-sm mb-2 line-clamp-2">
          {product.description}
        </p>

        {/* Price */}
        <div className="flex items-baseline space-x-2 mb-3">
          {product.discount > 0 ? (
            <>
              <span className="text-2xl font-bold text-honey-garlic">
                ETB {product.discountedPrice?.toFixed(2) || (product.price * (1 - product.discount / 100)).toFixed(2)}
              </span>
              <span className="text-sm text-text-dark/50 dark:text-text/50 line-through">
                ETB {product.price.toFixed(2)}
              </span>
            </>
          ) : (
            <span className="text-2xl font-bold text-whiskey-sour">
              ETB {product.price.toFixed(2)}
            </span>
          )}
        </div>

        {/* Rating */}
        <div className="flex items-center space-x-1 mb-3">
          <Star size={16} className="fill-whiskey-sour text-whiskey-sour" />
          <span className="text-sm">{product.averageRating?.toFixed(1) || 0}</span>
          <span className="text-xs text-text-dark/50 dark:text-text/50">
            ({product.totalReviews || 0})
          </span>
        </div>

        {/* Actions */}
        <div className="flex space-x-2">
          <Link
            to={`/product/${product._id}`}
            className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 rounded-lg border border-whiskey-sour text-whiskey-sour hover:bg-whiskey-sour hover:text-balsamico transition-all duration-300"
          >
            <Eye size={16} />
            <span className="text-sm">{t('view')}</span>
          </Link>
          <button
            onClick={() => onAddToCart?.(product)}
            className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 rounded-lg bg-whiskey-sour text-balsamico hover:bg-honey-garlic transition-all duration-300"
          >
            <ShoppingCart size={16} />
            <span className="text-sm">{t('addToCart')}</span>
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;