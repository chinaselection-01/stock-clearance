import AsyncStorage from '@react-native-async-storage/async-storage';
import { I18n } from 'i18n-js';
import * as Localization from 'expo-localization';

export const translations = {
  en: {
    appName: 'StockClearance',
    tabHome: 'Home',
    tabBrowse: 'Browse',
    tabPost: 'Post',
    tabInq: 'Inquiries',
    popular: 'Popular searches',
    allStock: 'All stock lots',
    searchPlaceholder: 'Search stock, category, belt…',
    qty: 'Qty',
    moq: 'MOQ',
    unit: 'unit',
    cond: 'Condition',
    brand: 'Brand',
    contactSupplier: 'Contact supplier',
    sendInquiry: 'Send inquiry',
    yourName: 'Your name',
    yourEmail: 'Your email',
    whatsapp: 'WhatsApp (optional)',
    message: 'Message (qty, target price…)',
    submit: 'Submit',
    inquirySent: 'Inquiry sent! The supplier will contact you.',
    contactEmail: 'Contact: BOB@stock-clearance.ai',
    postTitle: 'Post your stock',
    photo: 'Photo',
    takePhoto: 'Take photo',
    pickPhoto: 'Pick from gallery',
    productName: 'Product name',
    category: 'Category',
    belt: 'Industrial belt / city',
    quantity: 'Quantity',
    condition: 'Condition (new / like-new / used)',
    priceWas: 'Original price (optional)',
    priceNow: 'Clearance price',
    yourNameSup: 'Your name / company',
    yourWhatsapp: 'Your WhatsApp (buyers reach you via platform)',
    publish: 'Publish',
    publishing: 'Publishing…',
    published: 'Published! It will appear in Browse shortly.',
    myInquiries: 'Inquiries on my posts',
    noInquiries: 'No inquiries yet on the stock you posted from this device.',
    language: '中文 / EN',
    back: 'Back',
  },
  zh: {
    appName: '清仓库存',
    tabHome: '首页',
    tabBrowse: '浏览',
    tabPost: '发布',
    tabInq: '询盘',
    popular: '热门搜索',
    allStock: '全部库存',
    searchPlaceholder: '搜库存、品类、产业带…',
    qty: '数量',
    moq: '起订',
    unit: '件',
    cond: '成色',
    brand: '品牌',
    contactSupplier: '联系供应商',
    sendInquiry: '发送询盘',
    yourName: '您的姓名',
    yourEmail: '您的邮箱',
    whatsapp: 'WhatsApp（选填）',
    message: '留言（数量、目标价…）',
    submit: '提交',
    inquirySent: '询盘已发送！供应商会尽快联系您。',
    contactEmail: '联系邮箱：BOB@stock-clearance.ai',
    postTitle: '发布你的库存',
    photo: '照片',
    takePhoto: '拍照',
    pickPhoto: '从相册选择',
    productName: '产品名称',
    category: '品类',
    belt: '产业带 / 城市',
    quantity: '数量',
    condition: '成色（全新 / 近新 / 二手）',
    priceWas: '原价（选填）',
    priceNow: '清仓价',
    yourNameSup: '您的姓名 / 公司',
    yourWhatsapp: '您的 WhatsApp（买家通过平台联系您）',
    publish: '发布',
    publishing: '发布中…',
    published: '已发布！稍后可在「浏览」中看到。',
    myInquiries: '我发布库存的询盘',
    noInquiries: '本机发布的库存暂无询盘。',
    language: '中文 / EN',
    back: '返回',
  },
};

export const i18nInstance = new I18n(translations);
i18nInstance.enableFallback = true;
i18nInstance.defaultLocale = 'en';

export async function initI18n() {
  const saved = await AsyncStorage.getItem('sc_lang');
  if (saved === 'en' || saved === 'zh') {
    i18nInstance.locale = saved;
  } else {
    const loc = Localization.getLocales()[0]?.languageCode;
    i18nInstance.locale = loc === 'zh' ? 'zh' : 'en';
  }
  return i18nInstance.locale;
}

export async function toggleLang() {
  const next = i18nInstance.locale === 'zh' ? 'en' : 'zh';
  i18nInstance.locale = next;
  await AsyncStorage.setItem('sc_lang', next);
  return next;
}

export const t = (key) => i18nInstance.t(key);
