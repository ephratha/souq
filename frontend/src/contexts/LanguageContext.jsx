/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext();

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

// Translation dictionary
const translations = {
  en: {
    common: {
      home: 'Home',
      shop: 'Shop',
      categories: 'Categories',
      login: 'Login',
      addToCart: 'Add to Cart',
      price: 'Price',
      cart: 'Cart',
      checkout: 'Checkout',
      search: 'Search',
      profile: 'Profile',
      orders: 'Orders',
      wishlist: 'Wishlist',
      logout: 'Logout',
      submit: 'Submit',
      cancel: 'Cancel',
      save: 'Save',
      delete: 'Delete',
      edit: 'Edit',
      loading: 'Loading...',
      error: 'Error',
      success: 'Success',
      // In the 'en' section, add:
channels: 'Channels',
products: 'Products',
featuredChannels: 'Featured Channels',
recentProducts: 'Recent Products',
telegramChannels: 'Telegram Channels',
allProducts: 'All Products',
viewAll: 'View All',
viewProducts: 'View Products',
join: 'Join',
members: 'Members',
backToChannels: 'Back to Channels',
productsInChannel: 'Products in this Channel',
noProductsYet: 'No products yet in this channel',
joinTelegramChannel: 'Join Telegram Channel',
searchChannels: 'Search channels...',
searchProducts: 'Search products...',
allCategories: 'All Categories',
filters: 'Filters',
priceRange: 'Price Range',
min: 'Min',
max: 'Max',
sortBy: 'Sort By',
newest: 'Newest',
priceLowToHigh: 'Price: Low to High',
priceHighToLow: 'Price: High to Low',
topRated: 'Top Rated',
clearFilters: 'Clear Filters',
noChannelsFound: 'No channels found',
noProductsFound: 'No products found',
viewInTelegram: 'View in Telegram',
quantity: 'Quantity',
inStock: 'In Stock',
outOfStock: 'Out of Stock',
onlyLeft: 'Only left:',
freeShipping: 'Free Shipping',
securePayment: 'Secure Payment',
easyReturns: 'Easy Returns',
createChannel: 'Create Channel',
channelLogo: 'Channel Logo',
uploadLogo: 'Upload Logo',
channelName: 'Channel Name',
telegramLink: 'Telegram Link',
telegramLinkHint: 'Enter your Telegram channel link (e.g., https://t.me/yourchannel or @yourchannel)',
listProduct: 'List Product',
productImages: 'Product Images',
selectChannel: 'Select Channel',
telegramPostHint: 'Products will be automatically posted to this Telegram channel',
productTitle: 'Product Title',
enterProductTitle: 'Enter product title',
enterProductDescription: 'Enter product description',
stock: 'Stock',
discount: 'Discount',
creating: 'Creating...',
dashboard: 'Dashboard',
myChannels: 'My Channels',
myProducts: 'My Products',
adminPanel: 'Admin Panel',
uploadImagesHint: 'Upload up to 5 images (JPEG, PNG, WebP)',
heroTitle: 'The Telegram-First Marketplace',
heroSubtitle: 'Discover amazing products from Ethiopia\'s best Telegram channels',
shopNow: 'Shop Now',
exploreChannels: 'Explore Channels',
telegramFirst: 'Telegram-First',
telegramFirstDesc: 'Products are posted directly to Telegram channels',
secureTrading: 'Secure Trading',
secureTradingDesc: 'Safe and secure transactions',
fastDelivery: 'Fast Delivery',
fastDeliveryDesc: 'Quick delivery across Ethiopia',
    },
    categories: {
      electronics: 'Electronics',
      fashion: 'Fashion',
      books: 'Books',
      home: 'Home & Living',
      beauty: 'Beauty',
      sports: 'Sports',
    },
    auth: {
      welcomeBack: 'Welcome Back!',
      signIn: 'Sign In',
      signUp: 'Sign Up',
      email: 'Email',
      password: 'Password',
      confirmPassword: 'Confirm Password',
      name: 'Full Name',
      forgotPassword: 'Forgot Password?',
      noAccount: "Don't have an account?",
      haveAccount: 'Already have an account?',
    },
  },
  am: {
    common: {
      home: 'መነሻ',
      shop: 'ገበያ',
      categories: 'ምድቦች',
      login: 'ግባ',
      addToCart: 'ወደ ጋሪ ጨምር',
      price: 'ዋጋ',
      cart: 'ጋሪ',
      checkout: 'ክፈል',
      search: 'ፈልግ',
      profile: 'መገለጫ',
      orders: 'ትዕዛዞች',
      wishlist: 'የምኞት ዝርዝር',
      logout: 'ውጣ',
      submit: 'አስገባ',
      cancel: 'ሰርዝ',
      save: 'አስቀምጥ',
      delete: 'ሰርዝ',
      edit: 'አርትዕ',
      loading: 'በመጫን ላይ...',
      error: 'ስህተት',
      success: 'ስኬት',
      channels: 'ቻናሎች',
products: 'ምርቶች',
featuredChannels: 'ታዋቂ ቻናሎች',
recentProducts: 'አዲስ ምርቶች',
telegramChannels: 'ቴሌግራም ቻናሎች',
allProducts: 'ሁሉም ምርቶች',
viewAll: 'ሁሉንም ይመልከቱ',
viewProducts: 'ምርቶችን ይመልከቱ',
join: 'ይቀላቀሉ',
members: 'አባላት',
backToChannels: 'ወደ ቻናሎች ተመለስ',
productsInChannel: 'በዚህ ቻናል ውስጥ ያሉ ምርቶች',
noProductsYet: 'በዚህ ቻናል እስካሁን ምርቶች የሉም',
joinTelegramChannel: 'ቴሌግራም ቻናል ይቀላቀሉ',
searchChannels: 'ቻናሎችን ይፈልጉ...',
searchProducts: 'ምርቶችን ይፈልጉ...',
allCategories: 'ሁሉም ምድቦች',
filters: 'ማጣሪያ',
priceRange: 'የዋጋ ክልል',
min: 'ዝቅተኛ',
max: 'ከፍተኛ',
sortBy: 'አደራደር',
newest: 'አዲስ',
priceLowToHigh: 'ዋጋ ከዝቅተኛ ወደ ከፍተኛ',
priceHighToLow: 'ዋጋ ከከፍተኛ ወደ ዝቅተኛ',
topRated: 'ከፍተኛ ደረጃ',
clearFilters: 'ማጣሪያ አጥፋ',
noChannelsFound: 'ምንም ቻናሎች አልተገኙም',
noProductsFound: 'ምንም ምርቶች አልተገኙም',
viewInTelegram: 'በቴሌግራም ይመልከቱ',
quantity: 'ብዛት',
inStock: 'ክምችት አለ',
outOfStock: 'ክምችት የለም',
onlyLeft: 'የቀረው:',
freeShipping: 'ነጻ መላኪያ',
securePayment: 'ደህንነቱ የተጠበቀ ክፍያ',
easyReturns: 'ቀላል መመለሻ',
createChannel: 'ቻናል ፍጠር',
channelLogo: 'የቻናል አርማ',
uploadLogo: 'አርማ ስቀል',
channelName: 'የቻናል ስም',
telegramLink: 'ቴሌግራም አገናኝ',
telegramLinkHint: 'የቴሌግራም ቻናልዎን አገናኝ ያስገቡ (ለምሳሌ: https://t.me/yourchannel ወይም @yourchannel)',
listProduct: 'ምርት ዝርዝር ውስጥ አስገባ',
productImages: 'የምርት ምስሎች',
selectChannel: 'ቻናል ምረጥ',
telegramPostHint: 'ምርቶች በራስ-ሰር ወደዚህ ቴሌግራም ቻናል ይለጠፋሉ',
productTitle: 'የምርት ርዕስ',
enterProductTitle: 'የምርት ርዕስ ያስገቡ',
enterProductDescription: 'የምርት መግለጫ ያስገቡ',
stock: 'ክምችት',
discount: 'ቅናሽ',
creating: 'በመፍጠር ላይ...',
dashboard: 'ዳሽቦርድ',
myChannels: 'ቻናሎቼ',
myProducts: 'ምርቶቼ',
adminPanel: 'አስተዳዳሪ ፓነል',
uploadImagesHint: 'እስከ 5 ምስሎች ይስቀሉ (JPEG, PNG, WebP)',
heroTitle: 'ቴሌግራም-ፈርስት ገበያ',
heroSubtitle: 'ከኢትዮጵያ ምርጥ ቴሌግራም ቻናሎች አስደናቂ ምርቶችን ያግኙ',
shopNow: 'አሁን ግዙ',
exploreChannels: 'ቻናሎችን ያስሱ',
telegramFirst: 'ቴሌግራም-ፈርስት',
telegramFirstDesc: 'ምርቶች በቀጥታ ወደ ቴሌግራም ቻናሎች ይለጠፋሉ',
secureTrading: 'ደህንነቱ የተጠበቀ ግብይት',
secureTradingDesc: 'ደህንነቱ የተጠበቀ እና አስተማማኝ ግብይቶች',
fastDelivery: 'ፈጣን መላኪያ',
fastDeliveryDesc: 'በኢትዮጵያ ውስጥ ፈጣን መላኪያ',
    },
    categories: {
      electronics: 'ኤሌክትሮኒክስ',
      fashion: 'ፋሽን',
      books: 'መጽሐፍት',
      home: 'ቤት እና ኑሮ',
      beauty: 'ውበት',
      sports: 'ስፖርት',
    },
    auth: {
      welcomeBack: 'እንኳን ደህና መጡ!',
      signIn: 'ግባ',
      signUp: 'ተመዝገብ',
      email: 'ኢሜይል',
      password: 'የይለፍ ቃል',
      confirmPassword: 'የይለፍ ቃል አረጋግጥ',
      name: 'ሙሉ ስም',
      forgotPassword: 'የይለፍ ቃል ረሳሁ?',
      noAccount: 'መለያ የለህም?',
      haveAccount: 'አካውንት አለህ?',
    },
  },
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    const savedLanguage = localStorage.getItem('language');
    return savedLanguage && (savedLanguage === 'en' || savedLanguage === 'am') 
      ? savedLanguage 
      : 'en';
  });

  useEffect(() => {
    localStorage.setItem('language', language);
    document.documentElement.lang = language;
    document.documentElement.setAttribute('lang', language);
    
    // Update font based on language
    if (language === 'am') {
      document.body.style.fontFamily = "'Noto Sans Ethiopic', 'Outfit', sans-serif";
    } else {
      document.body.style.fontFamily = "'Outfit', 'Noto Sans Ethiopic', sans-serif";
    }
  }, [language]);

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'en' ? 'am' : 'en');
  };

  const setEnglish = () => setLanguage('en');
  const setAmharic = () => setLanguage('am');

  const t = (key, category = 'common') => {
    const translation = translations[language];
    if (!translation) return key;
    
    if (translation[category] && translation[category][key]) {
      return translation[category][key];
    }
    
    // Fallback to common category
    if (translation.common && translation.common[key]) {
      return translation.common[key];
    }
    
    // Fallback to English
    if (translations.en[category] && translations.en[category][key]) {
      return translations.en[category][key];
    }
    
    if (translations.en.common && translations.en.common[key]) {
      return translations.en.common[key];
    }
    
    return key;
  };

  const value = {
    language,
    setLanguage,
    toggleLanguage,
    setEnglish,
    setAmharic,
    t,
    isAmharic: language === 'am',
    isEnglish: language === 'en',
    translations: translations[language],
    allTranslations: translations,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

// Helper hook for translations with category support
export const useTranslation = () => {
  const { t } = useLanguage();
  
  const translate = (key, category = 'common') => t(key, category);
  
  return { t: translate };
};