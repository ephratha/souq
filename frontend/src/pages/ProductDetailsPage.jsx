import  { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useLanguage } from '../contexts/LanguageContext';
import { ShoppingCart, ExternalLink, Star, ArrowLeft, Minus, Plus, Truck, Shield, RotateCcw } from 'lucide-react';
import axios from 'axios';

const ProductDetailsPage = () => {
  const { id } = useParams();
  const { t } = useLanguage();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/products/${id}`);
        setProduct(res.data.data);
      } catch (error) {
        console.error('Error fetching product:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const addToCart = () => {
    // Add to cart logic
    console.log('Added to cart:', product, quantity);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-whiskey-sour"></div>
      </div>
    );
  }

  if (!product) {
    return <div className="text-center py-12">{t('productNotFound')}</div>;
  }

  const discountedPrice = product.discount > 0 
    ? product.price * (1 - product.discount / 100)
    : product.price;

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Link to="/products" className="inline-flex items-center space-x-2 text-whiskey-sour hover:underline">
        <ArrowLeft size={20} />
        <span>{t('backToProducts')}</span>
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Image Gallery */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-4"
        >
          <div className="aspect-square rounded-xl overflow-hidden bg-gradient-to-br from-whiskey-sour/10 to-honey-garlic/10">
            {product.images && product.images[activeImage] ? (
              <img
                src={`http://localhost:5000${product.images[activeImage]}`}
                alt={product.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-6xl">
                📦
              </div>
            )}
          </div>
          
          {product.images && product.images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImage(idx)}
                  className={`w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${
                    activeImage === idx ? 'border-whiskey-sour' : 'border-transparent'
                  }`}
                >
                  <img src={`http://localhost:5000${img}`} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </motion.div>

        {/* Product Info */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-6"
        >
          <div>
            <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
              <span className="px-2 py-1 rounded-full bg-whiskey-sour/20 text-whiskey-sour text-sm">
                {product.category}
              </span>
              {product.channelId && (
                <Link to={`/channel/${product.channelId._id}`} className="text-sm text-whiskey-sour hover:underline">
                  📢 {product.channelId.name}
                </Link>
              )}
            </div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2">{product.title}</h1>
            
            {/* Rating */}
            <div className="flex items-center space-x-2 mb-4">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={18}
                    className={i < Math.floor(product.averageRating || 0) 
                      ? 'fill-whiskey-sour text-whiskey-sour' 
                      : 'text-gray-400'
                    }
                  />
                ))}
              </div>
              <span className="text-sm">
                {product.averageRating?.toFixed(1) || 0} ({product.totalReviews || 0} {t('reviews')})
              </span>
            </div>
          </div>

          {/* Price */}
          <div className="border-t border-b border-whiskey-sour/20 py-4">
            {product.discount > 0 ? (
              <div className="flex items-baseline space-x-3">
                <span className="text-3xl font-bold text-honey-garlic">
                  ETB {discountedPrice.toFixed(2)}
                </span>
                <span className="text-lg text-text-dark/50 dark:text-text/50 line-through">
                  ETB {product.price.toFixed(2)}
                </span>
                <span className="px-2 py-1 bg-honey-garlic text-white rounded-lg text-sm">
                  {product.discount}% OFF
                </span>
              </div>
            ) : (
              <span className="text-3xl font-bold text-whiskey-sour">
                ETB {product.price.toFixed(2)}
              </span>
            )}
          </div>

          {/* Description */}
          <div>
            <h3 className="font-semibold mb-2">{t('description')}</h3>
            <p className="text-text-dark/70 dark:text-text/70 leading-relaxed">
              {product.description}
            </p>
          </div>

          {/* Stock Info */}
          <div className="flex items-center space-x-4">
            <div className={`text-sm ${product.stock > 0 ? 'text-green-500' : 'text-red-500'}`}>
              {product.stock > 0 ? `✓ ${t('inStock')}` : `✗ ${t('outOfStock')}`}
            </div>
            {product.stock > 0 && product.stock < 20 && (
              <div className="text-sm text-orange-500">
                {t('onlyLeft')} {product.stock}
              </div>
            )}
          </div>

          {/* Quantity Selector */}
          {product.stock > 0 && (
            <div className="flex items-center space-x-4">
              <span className="font-semibold">{t('quantity')}:</span>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-1 rounded-lg border border-whiskey-sour/20 hover:bg-whiskey-sour/10"
                >
                  <Minus size={16} />
                </button>
                <span className="w-12 text-center">{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  className="p-1 rounded-lg border border-whiskey-sour/20 hover:bg-whiskey-sour/10"
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <button
              onClick={addToCart}
              disabled={product.stock === 0}
              className="flex-1 flex items-center justify-center space-x-2 px-6 py-3 rounded-lg bg-whiskey-sour text-balsamico hover:bg-honey-garlic transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ShoppingCart size={20} />
              <span>{t('addToCart')}</span>
            </button>
            
            {product.channelId && (
              <a
                href={product.channelId.formattedTelegramLink || product.channelId.telegramLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center space-x-2 px-6 py-3 rounded-lg border border-whiskey-sour text-whiskey-sour hover:bg-whiskey-sour hover:text-balsamico transition-colors"
              >
                <ExternalLink size={20} />
                <span>{t('viewInTelegram')}</span>
              </a>
            )}
          </div>

          {/* Shipping Info */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-whiskey-sour/20">
            <div className="flex items-center space-x-2 text-sm">
              <Truck size={18} className="text-whiskey-sour" />
              <span>{t('freeShipping')}</span>
            </div>
            <div className="flex items-center space-x-2 text-sm">
              <Shield size={18} className="text-whiskey-sour" />
              <span>{t('securePayment')}</span>
            </div>
            <div className="flex items-center space-x-2 text-sm">
              <RotateCcw size={18} className="text-whiskey-sour" />
              <span>{t('easyReturns')}</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ProductDetailsPage;