const TelegramBot = require('node-telegram-bot-api');
const Product = require('../models/Product');
const Channel = require('../models/Channel');
const { User } = require('../models/User');

// Bot configuration
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
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
    help: "🤝 How can I help you?\n\n/latest - View 5 newest products\n/channels - View top channels\n/start - Restart the bot\n/contact - Get support\n\nVisit our website: " + WEBSITE_URL,
    latest: "🆕 Latest Products",
    product: "📦 {title}\n\n💰 Price: ETB {price}\n⭐ Rating: {rating}/5\n👁️ Views: {views}\n📍 Channel: {channel}\n\n🔗 Click below to view product",
    noProducts: "No products found at the moment. Please check back later! 🛍️",
    error: "An error occurred. Please try again later. 🔧",
    contact: "📞 Contact Us\n\nEmail: support@souq.com\nPhone: +251-XXX-XXXXXX\nTelegram: @SouqSupport",
    channels: "📺 Top Channels",
    channelInfo: "📢 {name}\n\n{description}\n\n📊 Products: {products}\n👥 Members: {members}\n🔗 {link}"
  },
  am: {
    welcome: "እንኳን ወደ ሱቅ ገበያ በደህና መጡ! 🛍️\n\nበኢትዮጵያ ውስጥ ለመስመር ላይ ግብይት ዋና መድረክዎ።\n\n✨ ባህሪያት:\n• በሺዎች የሚቆጠሩ ምርቶችን ይመልከቱ\n• ደህንነቱ የተጠበቀ ክፍያ\n• ፈጣን አቅርቦት\n• 24/7 የደንበኛ ድጋፍ\n\nአዲስ ምርቶችን ለማየት /latest ይጠቀሙ\nእገዛ ለማግኘት /help ይጠቀሙ",
    help: "🤝 እንዴት ልረዳዎ እችላለሁ?\n\n/latest - 5 አዲስ ምርቶችን ይመልከቱ\n/channels - ከፍተኛ ቻናሎችን ይመልከቱ\n/start - ቦትን እንደገና ያስጀምሩ\n/contact - ድጋፍ ያግኙ\n\nድረ-ገፃችንን ይጎብኙ: " + WEBSITE_URL,
    latest: "🆕 አዲስ ምርቶች",
    product: "📦 {title}\n\n💰 ዋጋ: ETB {price}\n⭐ ደረጃ: {rating}/5\n👁️ እይታዎች: {views}\n📍 ቻናል: {channel}\n\nምርቱን ለማየት ከታች ይጫኑ",
    noProducts: "በአሁኑ ጊዜ ምንም ምርቶች አልተገኙም። እባክዎ ቆይተው ይመልከቱ! 🛍️",
    error: "ስህተት ተከስቷል። እባክዎ ቆይተው ይሞክሩ። 🔧",
    contact: "📞 ያግኙን\n\nኢሜይል: support@souq.com\nስልክ: +251-XXX-XXXXXX\nቴሌግራም: @SouqSupport",
    channels: "📺 ከፍተኛ ቻናሎች",
    channelInfo: "📢 {name}\n\n{description}\n\n📊 ምርቶች: {products}\n👥 አባላት: {members}\n🔗 {link}"
  }
};

// Helper to detect language
const detectLanguage = (userId) => {
  return 'en'; // Default to English, can be extended with DB storage
};

// Format product message for Telegram
const formatProductMessage = async (product, language = 'en') => {
  const msg = messages[language].product;
  const rating = product.averageRating ? product.averageRating.toFixed(1) : 'N/A';
  
  // Get channel name
  let channelName = 'Souq Marketplace';
  if (product.channelId) {
    const channel = await Channel.findById(product.channelId);
    if (channel) {
      channelName = channel.name;
    }
  }
  
  return msg
    .replace('{title}', product.title)
    .replace('{price}', product.price.toFixed(2))
    .replace('{rating}', rating)
    .replace('{views}', product.views || 0)
    .replace('{channel}', channelName);
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

// Post product to its associated channel
const postProductToChannel = async (product, images = []) => {
  if (!bot || !BOT_TOKEN) {
    console.warn('Bot not configured. Skipping post.');
    return null;
  }

  try {
    // Get the channel associated with this product
    const channel = await Channel.findById(product.channelId);
    
    if (!channel) {
      console.error(`Channel not found for product ${product._id}`);
      return null;
    }
    
    if (!channel.isActive) {
      console.warn(`Channel ${channel.name} is inactive, skipping post`);
      return null;
    }
    
    if (!channel.settings.autoPost) {
      console.log(`Auto-post disabled for channel ${channel.name}`);
      return null;
    }
    
    const chatId = channel.chatId; // Use the chat ID from channel
    const language = 'en';
    const caption = await formatProductMessage(product, language);
    const keyboard = createProductKeyboard(product._id, language);
    
    // Add hashtags
    const hashtags = `#Souq #${product.category} #${channel.name.replace(/\s/g, '')} #Ethiopia`;
    const fullCaption = `${caption}\n\n${hashtags}`;
    
    let message;
    
    // Send product with image
    if (images && images.length > 0 && images[0]) {
      const imagePath = images[0];
      const fullImageUrl = imagePath.startsWith('http') 
        ? imagePath 
        : `${WEBSITE_URL}${imagePath}`;
      
      message = await bot.sendPhoto(chatId, fullImageUrl, {
        caption: fullCaption,
        parse_mode: 'HTML',
        reply_markup: keyboard
      });
    } else {
      message = await bot.sendMessage(chatId, fullCaption, {
        parse_mode: 'HTML',
        reply_markup: keyboard
      });
    }
    
    // Update product with telegram post ID
    if (message && message.message_id) {
      product.telegramPostId = message.message_id.toString();
      await product.save();
      
      // Update channel product count
      await channel.incrementProductCount();
      
      console.log(`✅ Product posted to channel: ${channel.name} (${chatId}) - Post ID: ${message.message_id}`);
    }
    
    return message;
  } catch (error) {
    console.error('❌ Error posting product to channel:', error);
    return null;
  }
};

// Edit existing product post
const editProductPost = async (product, images = []) => {
  if (!bot || !BOT_TOKEN || !product.telegramPostId) {
    return null;
  }

  try {
    const channel = await Channel.findById(product.channelId);
    if (!channel) return null;
    
    const chatId = channel.chatId;
    const language = 'en';
    const caption = await formatProductMessage(product, language);
    const keyboard = createProductKeyboard(product._id, language);
    const hashtags = `#Souq #${product.category} #${channel.name.replace(/\s/g, '')} #Ethiopia`;
    const fullCaption = `${caption}\n\n${hashtags}`;
    
    await bot.editMessageCaption(fullCaption, {
      chat_id: chatId,
      message_id: parseInt(product.telegramPostId),
      parse_mode: 'HTML',
      reply_markup: keyboard
    });
    
    console.log(`✅ Product post updated in channel: ${channel.name}`);
    return true;
  } catch (error) {
    console.error('❌ Error editing product post:', error);
    return null;
  }
};

// Send latest products from all channels
const sendLatestProducts = async (chatId, language = 'en') => {
  try {
    const products = await Product.find({ isActive: true, isAvailable: true })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('sellerId', 'name')
      .populate('channelId', 'name');

    if (!products || products.length === 0) {
      await bot.sendMessage(chatId, messages[language].noProducts);
      return;
    }

    await bot.sendMessage(chatId, `🌟 ${messages[language].latest} 🌟\n\n`, {
      parse_mode: 'HTML'
    });

    for (let i = 0; i < products.length; i++) {
      const product = products[i];
      const productMessage = await formatProductMessage(product, language);
      const keyboard = createProductKeyboard(product._id, language);
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
      
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  } catch (error) {
    console.error('Error sending latest products:', error);
    await bot.sendMessage(chatId, messages[language].error);
  }
};

// Send top channels
const sendTopChannels = async (chatId, language = 'en') => {
  try {
    const channels = await Channel.getPopularChannels(5);
    
    if (!channels || channels.length === 0) {
      await bot.sendMessage(chatId, "No channels available at the moment.");
      return;
    }
    
    await bot.sendMessage(chatId, `📺 ${messages[language].channels}\n\n`);
    
    for (const channel of channels) {
      const channelMsg = messages[language].channelInfo
        .replace('{name}', channel.name)
        .replace('{description}', channel.description.substring(0, 100))
        .replace('{products}', channel.productCount)
        .replace('{members}', channel.memberCount)
        .replace('{link}', channel.formattedTelegramLink);
      
      const keyboard = {
        inline_keyboard: [
          [{ text: "🔗 Visit Channel", url: channel.formattedTelegramLink }],
          [{ text: "📦 View Products", callback_data: `channel_${channel._id}` }]
        ]
      };
      
      if (channel.logoPath) {
        const logoUrl = channel.logoPath.startsWith('http')
          ? channel.logoPath
          : `${WEBSITE_URL}${channel.logoPath}`;
        
        await bot.sendPhoto(chatId, logoUrl, {
          caption: channelMsg,
          reply_markup: keyboard
        });
      } else {
        await bot.sendMessage(chatId, channelMsg, {
          reply_markup: keyboard
        });
      }
      
      await new Promise(resolve => setTimeout(resolve, 300));
    }
  } catch (error) {
    console.error('Error sending top channels:', error);
    await bot.sendMessage(chatId, messages[language].error);
  }
};

// Setup bot commands and handlers
const setupBotHandlers = () => {
  if (!bot) return;

  bot.onText(/\/start/, async (msg) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id;
    const language = detectLanguage(userId);
    
    const welcomeMessage = `${messages[language].welcome}\n\n`;
    
    await bot.sendMessage(chatId, welcomeMessage, {
      parse_mode: 'HTML',
      reply_markup: {
        keyboard: [
          [{ text: '🆕 Latest Products' }, { text: '📺 Top Channels' }],
          [{ text: '🛍️ Shop Now' }, { text: '📞 Contact' }],
          [{ text: 'ℹ️ Help' }]
        ],
        resize_keyboard: true,
        one_time_keyboard: false
      }
    });
  });

  bot.onText(/\/latest/, async (msg) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id;
    const language = detectLanguage(userId);
    await sendLatestProducts(chatId, language);
  });

  bot.onText(/\/channels/, async (msg) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id;
    const language = detectLanguage(userId);
    await sendTopChannels(chatId, language);
  });

  bot.onText(/\/help/, async (msg) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id;
    const language = detectLanguage(userId);
    await bot.sendMessage(chatId, messages[language].help);
  });

  bot.onText(/\/contact/, async (msg) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id;
    const language = detectLanguage(userId);
    await bot.sendMessage(chatId, messages[language].contact);
  });

  // Handle keyboard buttons
  bot.onText(/🆕 Latest Products/, async (msg) => {
    const chatId = msg.chat.id;
    const language = detectLanguage(msg.from.id);
    await sendLatestProducts(chatId, language);
  });

  bot.onText(/📺 Top Channels/, async (msg) => {
    const chatId = msg.chat.id;
    const language = detectLanguage(msg.from.id);
    await sendTopChannels(chatId, language);
  });

  bot.onText(/🛍️ Shop Now/, async (msg) => {
    const chatId = msg.chat.id;
    await bot.sendMessage(chatId, `🛒 Start shopping now!\n\nVisit our website: ${WEBSITE_URL}`);
  });

  bot.onText(/📞 Contact/, async (msg) => {
    const chatId = msg.chat.id;
    const language = detectLanguage(msg.from.id);
    await bot.sendMessage(chatId, messages[language].contact);
  });

  bot.onText(/ℹ️ Help/, async (msg) => {
    const chatId = msg.chat.id;
    const language = detectLanguage(msg.from.id);
    await bot.sendMessage(chatId, messages[language].help);
  });

  // Handle callback queries
  bot.on('callback_query', async (callbackQuery) => {
    const action = callbackQuery.data;
    const chatId = callbackQuery.message.chat.id;
    
    if (action.startsWith('share_')) {
      const productId = action.split('_')[1];
      const productUrl = `${WEBSITE_URL}/product/${productId}`;
      
      await bot.answerCallbackQuery(callbackQuery.id, {
        text: '🔗 Link ready to share!',
        show_alert: false
      });
      
      await bot.sendMessage(chatId, `📤 Share this product:\n${productUrl}`);
    } else if (action.startsWith('channel_')) {
      const channelId = action.split('_')[1];
      const channel = await Channel.findById(channelId);
      
      if (channel) {
        const products = await Product.find({ channelId, isActive: true })
          .sort({ createdAt: -1 })
          .limit(5);
        
        if (products.length > 0) {
          await bot.sendMessage(chatId, `📦 Latest products from ${channel.name}:`);
          
          for (const product of products) {
            const productUrl = `${WEBSITE_URL}/product/${product._id}`;
            await bot.sendMessage(chatId, `• ${product.title}\n💰 ETB ${product.price}\n🔗 ${productUrl}`);
          }
        } else {
          await bot.sendMessage(chatId, `No products yet in ${channel.name}`);
        }
      }
    }
    
    await bot.answerCallbackQuery(callbackQuery.id);
  });

  console.log('Telegram bot handlers configured');
};

// Initialize bot handlers
if (bot) {
  setupBotHandlers();
}

// Service exports
const getBot = () => bot;
const isBotConfigured = () => !!(bot && BOT_TOKEN);

module.exports = {
  bot,
  postProductToChannel,
  editProductPost,
  sendLatestProducts,
  sendTopChannels,
  getBot,
  isBotConfigured
};