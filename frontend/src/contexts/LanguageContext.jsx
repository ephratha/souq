/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext();

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within a LanguageProvider');
  return context;
};

const translations = {
  en: {
    common: {
      home: 'Home', shop: 'Shop', login: 'Login', logout: 'Logout',
      cart: 'Cart', checkout: 'Checkout', orders: 'Orders',
      submit: 'Submit', cancel: 'Cancel', save: 'Save', delete: 'Delete',
      price: 'Price', total: 'Total', quantity: 'Quantity',
      channels: 'Channels', products: 'Products',
      search: 'Search', loading: 'Loading...',
      address: 'Shipping Address', phone: 'Phone Number',
      cod: 'Cash on Delivery', emptyCart: 'Your cart is empty',
      status: 'Status', pending: 'Pending', delivered: 'Delivered',
      processing: 'Processing', shipped: 'Shipped', cancelled: 'Cancelled',
      buyerDash: 'Buyer Dashboard', sellerDash: 'Seller Dashboard', adminDash: 'Admin Panel',
      recentOrders: 'Recent Orders', quickLinks: 'Quick Links',
      heroTitle: 'The Telegram-First Marketplace',
      heroSubtitle: 'Discover amazing products from Ethiopia\'s best Telegram channels',
      viewInTelegram: 'View in Telegram', addToCart: 'Add to Cart'
    },
    auth: {
      signIn: 'Sign In', signUp: 'Sign Up', welcomeBack: 'Welcome Back!',
      email: 'Email', password: 'Password', name: 'Full Name',
      role: 'Select Role', buyer: 'Buyer', seller: 'Seller',
      noAccount: "Don't have an account?", haveAccount: 'Already have an account?'
    },
    categories: {
      electronics: 'Electronics', fashion: 'Fashion', books: 'Books',
      home: 'Home & Living', beauty: 'Beauty', sports: 'Sports',
    }
  },
  am: {
    common: {
      home: 'መነሻ', shop: 'ገበያ', login: 'ግባ', logout: 'ውጣ',
      cart: 'ጋሪ', checkout: 'ክፈል', orders: 'ትዕዛዞች',
      submit: 'አስገባ', cancel: 'ሰርዝ', save: 'አስቀምጥ', delete: 'ሰርዝ',
      price: 'ዋጋ', total: 'ጠቅላላ', quantity: 'ብዛት',
      channels: 'ቻናሎች', products: 'ምርቶች',
      search: 'ፈልግ', loading: 'በመጫን ላይ...',
      address: 'የመላኪያ አድራሻ', phone: 'ስልክ ቁጥር',
      cod: 'ሲረከቡ ይክፈሉ', emptyCart: 'የእርስዎ ጋሪ ባዶ ነው',
      status: 'ሁኔታ', pending: 'በሂደት ላይ', delivered: 'ደረሰ',
      processing: 'በመሰራት ላይ', shipped: 'ተልኳል', cancelled: 'ተሰርዟል',
      buyerDash: 'የገዢ ዳሽቦርድ', sellerDash: 'የሻጭ ማዕከል', adminDash: 'አስተዳዳሪ ፓነል',
      recentOrders: 'የቅርብ ጊዜ ትዕዛዞች', quickLinks: 'አቋራጮች',
      heroTitle: 'ቴሌግራም-ፈርስት ገበያ',
      heroSubtitle: 'ከኢትዮጵያ ምርጥ ቴሌግራም ቻናሎች ምርቶችን ያግኙ',
      viewInTelegram: 'በቴሌግራም ይመልከቱ', addToCart: 'ወደ ጋሪ ጨምር'
    },
    auth: {
      signIn: 'ግባ', signUp: 'ተመዝገብ', welcomeBack: 'እንኳን ደህና መጡ!',
      email: 'ኢሜይል', password: 'የይለፍ ቃል', name: 'ሙሉ ስም',
      role: 'ሚና ይምረጡ', buyer: 'ገዢ', seller: 'ሻጭ',
      noAccount: 'መለያ የለህም?', haveAccount: 'አካውንት አለህ?'
    },
    categories: {
      electronics: 'ኤሌክትሮኒክስ', fashion: 'ፋሽን', books: 'መጽሐፍት',
      home: 'ቤት እና ኑሮ', beauty: 'ውበት', sports: 'ስፖርት',
    }
  }
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => localStorage.getItem('language') || 'en');

  useEffect(() => {
    localStorage.setItem('language', language);
    document.documentElement.lang = language;
    document.body.style.fontFamily = language === 'am' 
      ? "'Noto Sans Ethiopic', 'Outfit', sans-serif" 
      : "'Outfit', 'Noto Sans Ethiopic', sans-serif";
  }, [language]);

  const t = (key, category = 'common') => {
    return translations[language][category]?.[key] || translations['en'][category]?.[key] || key;
  };

  const value = { language, setLanguage, toggleLanguage: () => setLanguage(l => l === 'en' ? 'am' : 'en'), t };

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};

export const useTranslation = () => {
  const { t } = useLanguage();
  return { t };
};