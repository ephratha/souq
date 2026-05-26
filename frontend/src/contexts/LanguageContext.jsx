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