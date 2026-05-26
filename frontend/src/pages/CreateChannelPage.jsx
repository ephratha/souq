import  { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { Upload } from 'lucide-react';
import axios from 'axios';

const CreateChannelPage = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    telegramLink: '',
    category: 'general'
  });
  const [logo, setLogo] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);

  const categories = [
    'electronics', 'fashion', 'books', 'home', 'beauty', 'sports', 'general'
  ];

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLogo(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const formDataToSend = new FormData();
    formDataToSend.append('name', formData.name);
    formDataToSend.append('description', formData.description);
    formDataToSend.append('telegramLink', formData.telegramLink);
    formDataToSend.append('category', formData.category);
    if (logo) {
      formDataToSend.append('logo', logo);
    }

    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:5000/api/channels', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`
        }
      });
      navigate('/seller/channels');
    } catch (error) {
      console.error('Error creating channel:', error);
      alert(error.response?.data?.message || 'Error creating channel');
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
        <h1 className="text-3xl font-bold">{t('createChannel')}</h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Logo Upload */}
          <div>
            <label className="block text-sm font-medium mb-2">{t('channelLogo')}</label>
            <div className="flex items-center space-x-4">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-whiskey-sour/20 to-honey-garlic/20 flex items-center justify-center overflow-hidden">
                {logoPreview ? (
                  <img src={logoPreview} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <Upload size={24} className="text-whiskey-sour" />
                )}
              </div>
              <label className="cursor-pointer px-4 py-2 rounded-lg border border-whiskey-sour text-whiskey-sour hover:bg-whiskey-sour hover:text-balsamico transition-colors">
                {t('uploadLogo')}
                <input type="file" accept="image/*" onChange={handleLogoChange} className="hidden" />
              </label>
            </div>
          </div>

          {/* Name */}
          <div>
            <label className="block text-sm font-medium mb-2">{t('channelName')} *</label>
            <input
              type="text"
              name="name"
              required
              value={formData.name}
              onChange={handleInputChange}
              className="w-full px-4 py-2 rounded-lg bg-white/10 dark:bg-burnt-coffee/50 border border-whiskey-sour/20 focus:border-whiskey-sour outline-none transition-colors"
              placeholder={t('enterChannelName')}
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
              placeholder={t('enterChannelDescription')}
            />
          </div>

          {/* Telegram Link */}
          <div>
            <label className="block text-sm font-medium mb-2">{t('telegramLink')} *</label>
            <input
              type="text"
              name="telegramLink"
              required
              value={formData.telegramLink}
              onChange={handleInputChange}
              className="w-full px-4 py-2 rounded-lg bg-white/10 dark:bg-burnt-coffee/50 border border-whiskey-sour/20 focus:border-whiskey-sour outline-none transition-colors"
              placeholder="https://t.me/yourchannel or @yourchannel"
            />
            <p className="text-xs text-text-dark/50 dark:text-text/50 mt-1">
              {t('telegramLinkHint')}
            </p>
          </div>

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

          {/* Submit */}
          <div className="flex space-x-4">
            <button
              type="button"
              onClick={() => navigate('/seller/channels')}
              className="px-6 py-2 rounded-lg border border-whiskey-sour text-whiskey-sour hover:bg-whiskey-sour hover:text-balsamico transition-colors"
            >
              {t('cancel')}
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-2 rounded-lg bg-whiskey-sour text-balsamico hover:bg-honey-garlic transition-colors disabled:opacity-50"
            >
              {loading ? t('creating') : t('createChannel')}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default CreateChannelPage;