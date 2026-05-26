import  { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import {  X, Plus } from 'lucide-react';
import axios from 'axios';

const CreateProductPage = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [channels, setChannels] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    category: 'electronics',
    channelId: '',
    stock: '',
    discount: '0'
  });
  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);

  const categories = [
    'electronics', 'fashion', 'books', 'home', 'beauty', 'sports', 'other'
  ];

  const fetchChannels = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:5000/api/channels/my/channels', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setChannels(res.data.data || []);
      if (res.data.data.length > 0) {
        setFormData(prev => ({ ...prev, channelId: res.data.data[0]._id }));
      }
    } catch (error) {
      console.error('Error fetching channels:', error);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchChannels();
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setImages([...images, ...files]);
    
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviews(prev => [...prev, reader.result]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index) => {
    setImages(images.filter((_, i) => i !== index));
    setImagePreviews(imagePreviews.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const formDataToSend = new FormData();
    formDataToSend.append('title', formData.title);
    formDataToSend.append('description', formData.description);
    formDataToSend.append('price', formData.price);
    formDataToSend.append('category', formData.category);
    formDataToSend.append('channelId', formData.channelId);
    formDataToSend.append('stock', formData.stock);
    formDataToSend.append('discount', formData.discount);
    
    images.forEach(image => {
      formDataToSend.append('images', image);
    });

    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:5000/api/products', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`
        }
      });
      navigate('/seller/products');
    } catch (error) {
      console.error('Error creating product:', error);
      alert(error.response?.data?.message || 'Error creating product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <h1 className="text-3xl font-bold">{t('listProduct')}</h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Images Upload */}
          <div>
            <label className="block text-sm font-medium mb-2">{t('productImages')} *</label>
            <div className="grid grid-cols-4 gap-4 mb-4">
              {imagePreviews.map((preview, idx) => (
                <div key={idx} className="relative aspect-square rounded-lg overflow-hidden bg-gradient-to-br from-whiskey-sour/20 to-honey-garlic/20">
                  <img src={preview} alt={`Preview ${idx}`} className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeImage(idx)}
                    className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
              <label className="aspect-square rounded-lg border-2 border-dashed border-whiskey-sour/40 hover:border-whiskey-sour cursor-pointer flex items-center justify-center transition-colors">
                <Plus size={32} className="text-whiskey-sour" />
                <input type="file" accept="image/*" multiple onChange={handleImageChange} className="hidden" />
              </label>
            </div>
            <p className="text-xs text-text-dark/50 dark:text-text/50">{t('uploadImagesHint')}</p>
          </div>

          {/* Channel Selection - Important for Telegram */}
          <div>
            <label className="block text-sm font-medium mb-2">{t('selectChannel')} *</label>
            <select
              name="channelId"
              required
              value={formData.channelId}
              onChange={handleInputChange}
              className="w-full px-4 py-2 rounded-lg bg-white/10 dark:bg-burnt-coffee/50 border border-whiskey-sour/20 focus:border-whiskey-sour outline-none transition-colors"
            >
              <option value="">{t('selectChannel')}</option>
              {channels.map(channel => (
                <option key={channel._id} value={channel._id}>{channel.name}</option>
              ))}
            </select>
            <p className="text-xs text-whiskey-sour mt-1">
              {t('telegramPostHint')}
            </p>
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium mb-2">{t('productTitle')} *</label>
            <input
              type="text"
              name="title"
              required
              value={formData.title}
              onChange={handleInputChange}
              className="w-full px-4 py-2 rounded-lg bg-white/10 dark:bg-burnt-coffee/50 border border-whiskey-sour/20 focus:border-whiskey-sour outline-none transition-colors"
              placeholder={t('enterProductTitle')}
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium mb-2">{t('description')} *</label>
            <textarea
              name="description"
              required
              rows={4}
              value={formData.description}
              onChange={handleInputChange}
              className="w-full px-4 py-2 rounded-lg bg-white/10 dark:bg-burnt-coffee/50 border border-whiskey-sour/20 focus:border-whiskey-sour outline-none transition-colors"
              placeholder={t('enterProductDescription')}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Price */}
            <div>
              <label className="block text-sm font-medium mb-2">{t('price')} (ETB) *</label>
              <input
                type="number"
                name="price"
                required
                min="0"
                step="0.01"
                value={formData.price}
                onChange={handleInputChange}
                className="w-full px-4 py-2 rounded-lg bg-white/10 dark:bg-burnt-coffee/50 border border-whiskey-sour/20 focus:border-whiskey-sour outline-none transition-colors"
                placeholder="0.00"
              />
            </div>

            {/* Stock */}
            <div>
              <label className="block text-sm font-medium mb-2">{t('stock')} *</label>
              <input
                type="number"
                name="stock"
                required
                min="0"
                value={formData.stock}
                onChange={handleInputChange}
                className="w-full px-4 py-2 rounded-lg bg-white/10 dark:bg-burnt-coffee/50 border border-whiskey-sour/20 focus:border-whiskey-sour outline-none transition-colors"
                placeholder="0"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Category */}
            <div>
              <label className="block text-sm font-medium mb-2">{t('category')} *</label>
              <select
                name="category"
                required
                value={formData.category}
                onChange={handleInputChange}
                className="w-full px-4 py-2 rounded-lg bg-white/10 dark:bg-burnt-coffee/50 border border-whiskey-sour/20 focus:border-whiskey-sour outline-none transition-colors"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{t(cat)}</option>
                ))}
              </select>
            </div>

            {/* Discount */}
            <div>
              <label className="block text-sm font-medium mb-2">{t('discount')} (%)</label>
              <input
                type="number"
                name="discount"
                min="0"
                max="100"
                value={formData.discount}
                onChange={handleInputChange}
                className="w-full px-4 py-2 rounded-lg bg-white/10 dark:bg-burnt-coffee/50 border border-whiskey-sour/20 focus:border-whiskey-sour outline-none transition-colors"
                placeholder="0"
              />
            </div>
          </div>

          {/* Submit */}
          <div className="flex space-x-4">
            <button
              type="button"
              onClick={() => navigate('/seller/products')}
              className="px-6 py-2 rounded-lg border border-whiskey-sour text-whiskey-sour hover:bg-whiskey-sour hover:text-balsamico transition-colors"
            >
              {t('cancel')}
            </button>
            <button
              type="submit"
              disabled={loading || images.length === 0}
              className="flex-1 px-6 py-2 rounded-lg bg-whiskey-sour text-balsamico hover:bg-honey-garlic transition-colors disabled:opacity-50"
            >
              {loading ? t('creating') : t('listProduct')}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default CreateProductPage;