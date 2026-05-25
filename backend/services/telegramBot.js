const TelegramBot = require('node-telegram-bot-api');
const Product = require('../models/Product');
const { User } = require('../models/User');

// Bot configuration
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const CHANNEL_ID = process.env.TELEGRAM_CHANNEL_ID; // @yourchannel or channel ID
const WEBSITE_URL = process.env.WEBSITE_URL || 'http://localhost:3000';

// Initialize bot
let bot;
if (BOT_TOKEN) {
  bot = new TelegramBot(BOT_TOKEN, { polling: true });
  console.log('🤖 Telegram Bot initialized');
} else {
  console.warn('⚠️ TELEGRAM_BOT_TOKEN not provided, bot features disabled');
}

// Multi-language messages
const messages = {
  en: {
    welcome: "Welcome to Souq Marketplace! 🛍️\n\nYour premier destination for online shopping in Ethiopia.\n\n✨ Features:\n• Browse thousands of products\n• Secure payments\n• Fast delivery\n• 24/7 customer support\n\nUse /latest to see newest products\nUse /help for assistance",
    help: "🤝 How can I help you?\n\n/latest - View 5 newest products\n/start - Restart the bot\n/contact - Get support\n\nVisit our website: " + WEBSITE_URL,
    latest: "🆕 Latest Products",
    product: "📦 {title}\n\n💰 Price: ETB {price}\n⭐ Rating: {rating}/5\n👁️ Views: {views}\n\n🔗 Click below to view product",
    noProducts: "No products found at the moment. Please check back later! 🛍️",
    error: "An error occurred. Please try again later. 🔧",
    contact: "📞 Contact Us\n\nEmail: support@souq.com\nPhone: +251-XXX-XXXXXX\nTelegram: @SouqSupport",
    amharicNote: "ለአማርኛ እገዛ፣ እባክዎን /amharic ይጠቀሙ"
  },
  am: {
    welcome: "እንኳን ወደ ሱቅ ገበያ በደህና መጡ! 🛍️\n\nበኢትዮጵያ ውስጥ ለመስመር ላይ ግብይት ዋና መድረክዎ።\n\n✨ ባህሪያት:\n• በሺዎች የሚቆጠሩ ምርቶችን ይመልከቱ\n• ደህንነቱ የተጠበቀ ክፍያ\n• ፈጣን አቅርቦት\n• 24/7 የደንበኛ ድጋፍ\n\nአዲስ ምርቶችን ለማየት /latest ይጠቀሙ\nእገዛ ለማግኘት /help ይጠቀሙ",
    help: "🤝 እንዴት ልረዳዎ እችላለሁ?\n\n/latest - 5 አዲስ ምርቶችን ይመልከቱ\n/start - ቦትን እንደገና ያስጀምሩ\n/contact - ድጋፍ ያግኙ\n\nድረ-ገፃችንን ይጎብኙ: " + WEBSITE_URL,
    latest: "🆕 አዲስ ምርቶች",
    product: "📦 {title}\n\n💰 ዋጋ: ETB {price}\n⭐ ደረጃ: {rating}/5\n👁️ እይታዎች: {views}\n\nምርቱን ለማየት ከታች ይጫኑ",
    noProducts: "በአሁኑ ጊዜ ምንም ምርቶች አልተገኙም። እባክዎ ቆይተው ይመልከቱ! 🛍️",
    error: "ስህተት ተከስቷል። እባክዎ ቆይተው ይሞክሩ። 🔧",
    contact: "📞 ያግኙን\n\nኢሜይል: support@souq.com\nስልክ: +251-XXX-XXXXXX\nቴሌግራም: @SouqSupport",
    englishNote: "For English assistance, use /english"
  }
};

// Helper to detect language
const detectLanguage = (userId) => {
  // You can store user language preference in database
  // For now, default to English
  return 'en';
};

// Format product message for Telegram
const formatProductMessage = (product, language = 'en') => {
  const msg = messages[language].product;
  const rating = product.averageRating ? product.averageRating.toFixed(1) : 'N/A';
  
  return msg
    .replace('{title}', product.title)
    .replace('{price}', product.price.toFixed(2))
    .replace('{rating}', rating)
    .replace('{views}', product.views || 0);
};

// Create inline keyboard for product
const createProductKeyboard = (productId, language = 'en') => {
  const productUrl = `${WEBSITE_URL}/product/${productId}`;
  const buttonText = language === 'en' ? '🛒 View Product' : '🛒 ምርቱን ይመልከቱ';
  
  return {
    inline_keyboard: [
      [{ text: buttonText, url: productUrl }],
      [
        { text: language === 'en' ? '🏠 Home' : '🏠 መነሻ', url: WEBSITE_URL },
        { text: language === 'en' ? '📱 Share' : '📱 አጋራ', callback_data: `share_${productId}` }
      ]
    ]
  };
};

// Post product to channel
const postProductToChannel = async (product, images = []) => {
  if (!bot || !CHANNEL_ID) {
    console.warn('Bot or channel not configured. Skipping post.');
    return null;
  }

  try {
    const language = 'en'; // Default language for channel posts
    const caption = formatProductMessage(product, language);
    const keyboard = createProductKeyboard(product._id, language);
    
    // Add hashtags
    const hashtags = `#Souq #${product.category} #Ethiopia #Shopping`;
    const fullCaption = `${caption}\n\n${hashtags}`;
    
    let message;
    
    // Send product with image
    if (images && images.length > 0 && images[0]) {
      // Get the first image path
      const imagePath = images[0];
      const fullImageUrl = imagePath.startsWith('http') 
        ? imagePath 
        : `${WEBSITE_URL}${imagePath}`;
      
      // Send photo
      message = await bot.sendPhoto(CHANNEL_ID, fullImageUrl, {
        caption: fullCaption,
        parse_mode: 'HTML',
        reply_markup: keyboard
      });
    } else {
      // Send as text if no image
      message = await bot.sendMessage(CHANNEL_ID, fullCaption, {
        parse_mode: 'HTML',
        reply_markup: keyboard
      });
    }
    
    // Update product with telegram post ID
    if (message && message.message_id) {
      product.telegramPostId = message.message_id.toString();
      await product.save();
      console.log(`✅ Product posted to channel: ${product.title} (ID: ${message.message_id})`);
    }
    
    return message;
  } catch (error) {
    console.error('❌ Error posting product to channel:', error);
    return null;
  }
};

// Edit existing product post
const editProductPost = async (product, images = []) => {
  if (!bot || !CHANNEL_ID || !product.telegramPostId) {
    return null;
  }

  try {
    const language = 'en';
    const caption = formatProductMessage(product, language);
    const keyboard = createProductKeyboard(product._id, language);
    const hashtags = `#Souq #${product.category} #Ethiopia #Shopping`;
    const fullCaption = `${caption}\n\n${hashtags}`;
    
    await bot.editMessageCaption(fullCaption, {
      chat_id: CHANNEL_ID,
      message_id: parseInt(product.telegramPostId),
      parse_mode: 'HTML',
      reply_markup: keyboard
    });
    
    console.log(`✅ Product post updated: ${product.title}`);
    return true;
  } catch (error) {
    console.error('❌ Error editing product post:', error);
    return null;
  }
};

// Send latest products as response
const sendLatestProducts = async (chatId, language = 'en') => {
  try {
    const products = await Product.find({ isActive: true, isAvailable: true })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('sellerId', 'name');

    if (!products || products.length === 0) {
      await bot.sendMessage(chatId, messages[language].noProducts);
      return;
    }

    // Send header
    await bot.sendMessage(chatId, `🌟 ${messages[language].latest} 🌟\n\n`, {
      parse_mode: 'HTML'
    });

    // Send each product
    for (let i = 0; i < products.length; i++) {
      const product = products[i];
      const productMessage = formatProductMessage(product, language);
      const keyboard = createProductKeyboard(product._id, language);
      
      // Add sequential number
      const numberedMessage = `${i + 1}. ${productMessage}`;
      
      if (product.imagePath) {
        const imageUrl = product.imagePath.startsWith('http')
          ? product.imagePath
          : `${WEBSITE_URL}${product.imagePath}`;
        
        await bot.sendPhoto(chatId, imageUrl, {
          caption: numberedMessage,
          parse_mode: 'HTML',
          reply_markup: keyboard
        });
      } else {
        await bot.sendMessage(chatId, numberedMessage, {
          parse_mode: 'HTML',
          reply_markup: keyboard
        });
      }
      
      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  } catch (error) {
    console.error('Error sending latest products:', error);
    await bot.sendMessage(chatId, messages[language].error);
  }
};

// Setup bot commands and handlers
const setupBotHandlers = () => {
  if (!bot) return;

  // /start command
  bot.onText(/\/start/, async (msg) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id;
    const language = detectLanguage(userId);
    
    const welcomeMessage = `${messages[language].welcome}\n\n${messages[language].amharicNote}`;
    
    await bot.sendMessage(chatId, welcomeMessage, {
      parse_mode: 'HTML',
      reply_markup: {
        keyboard: [
          [{ text: '🆕 Latest Products' }, { text: '🛍️ Shop Now' }],
          [{ text: '📞 Contact' }, { text: 'ℹ️ Help' }]
        ],
        resize_keyboard: true,
        one_time_keyboard: false
      }
    });
  });

  // /latest command
  bot.onText(/\/latest/, async (msg) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id;
    const language = detectLanguage(userId);
    await sendLatestProducts(chatId, language);
  });

  // /help command
  bot.onText(/\/help/, async (msg) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id;
    const language = detectLanguage(userId);
    await bot.sendMessage(chatId, messages[language].help);
  });

  // /contact command
  bot.onText(/\/contact/, async (msg) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id;
    const language = detectLanguage(userId);
    await bot.sendMessage(chatId, messages[language].contact);
  });

  // /amharic command
  bot.onText(/\/amharic/, async (msg) => {
    const chatId = msg.chat.id;
    await bot.sendMessage(chatId, messages.am.welcome);
  });

  // /english command
  bot.onText(/\/english/, async (msg) => {
    const chatId = msg.chat.id;
    await bot.sendMessage(chatId, messages.en.welcome);
  });

  // Handle keyboard buttons
  bot.onText(/🆕 Latest Products/, async (msg) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id;
    const language = detectLanguage(userId);
    await sendLatestProducts(chatId, language);
  });

  bot.onText(/🛍️ Shop Now/, async (msg) => {
    const chatId = msg.chat.id;
    await bot.sendMessage(chatId, `🛒 Start shopping now!\n\nVisit our website: ${WEBSITE_URL}`);
  });

  bot.onText(/📞 Contact/, async (msg) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id;
    const language = detectLanguage(userId);
    await bot.sendMessage(chatId, messages[language].contact);
  });

  bot.onText(/ℹ️ Help/, async (msg) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id;
    const language = detectLanguage(userId);
    await bot.sendMessage(chatId, messages[language].help);
  });

  // Handle callback queries
  bot.on('callback_query', async (callbackQuery) => {
    const action = callbackQuery.data;
    const chatId = callbackQuery.message.chat.id;
    const messageId = callbackQuery.message.message_id;
    
    if (action.startsWith('share_')) {
      const productId = action.split('_')[1];
      const productUrl = `${WEBSITE_URL}/product/${productId}`;
      
      await bot.answerCallbackQuery(callbackQuery.id, {
        text: '🔗 Link copied to clipboard!',
        show_alert: false
      });
      
      // Send share options
      await bot.sendMessage(chatId, `📤 Share this product:\n${productUrl}`);
    }
    
    // Acknowledge callback
    await bot.answerCallbackQuery(callbackQuery.id);
  });

  console.log('Telegram bot handlers configured');
};

// Initialize bot handlers
if (bot) {
  setupBotHandlers();
}

// Service to get bot instance
const getBot = () => bot;

// Service to check if bot is configured
const isBotConfigured = () => {
  return !!(bot && BOT_TOKEN && CHANNEL_ID);
};

module.exports = {
  bot,
  postProductToChannel,
  editProductPost,
  sendLatestProducts,
  getBot,
  isBotConfigured
};