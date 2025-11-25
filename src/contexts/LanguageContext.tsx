import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'zh' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations = {
  zh: {
    // Navigation
    'nav.home': '首页',
    'nav.news': '新闻动态',
    'nav.events': '活动中心',
    'nav.membership': '会员申请',
    'nav.about': '关于我们',
    'nav.admin': '后台管理',
    
    // Home
    'home.hero.title': '维多利亚多元文化社区促进协会',
    'home.hero.subtitle': '携手共建和谐多元社区，传承文化，促进交流',
    'home.hero.cta.news': '最新动态',
    'home.hero.cta.join': '加入我们',
    'home.about.title': '关于协会',
    'home.about.desc': 'VMCA致力于促进维多利亚地区多元文化交流，为社区成员提供文化活动、教育培训和互助服务。我们相信多元文化的力量能够让社区更加包容、和谐与繁荣。',
    'home.services.title': '我们的服务',
    'home.services.events': '文化活动',
    'home.services.events.desc': '定期举办文化节庆、艺术展览和社区聚会',
    'home.services.education': '教育培训',
    'home.services.education.desc': '提供语言课程、职业培训和文化讲座',
    'home.services.support': '社区支持',
    'home.services.support.desc': '为新移民提供安居服务和法律咨询',
    
    // News
    'news.title': '新闻动态',
    'news.readMore': '阅读更多',
    'news.back': '返回列表',
    'news.date': '发布时间',
    'news.share': '分享',
    
    // Events
    'events.title': '活动中心',
    'events.upcoming': '即将举行',
    'events.register': '立即报名',
    'events.details': '活动详情',
    'events.date': '活动时间',
    'events.location': '活动地点',
    'events.fee': '活动费用',
    'events.capacity': '名额限制',
    'events.back': '返回列表',
    
    // Event Registration
    'register.title': '活动报名',
    'register.form.name': '姓名',
    'register.form.email': '电子邮箱',
    'register.form.phone': '联系电话',
    'register.form.notes': '备注信息',
    'register.form.participants': '参与人数',
    'register.next': '下一步：选择支付方式',
    'register.payment.title': '选择支付方式',
    'register.payment.online': '在线支付',
    'register.payment.onsite': '现场支付',
    'register.payment.transfer': '银行转账',
    'register.payment.confirm': '确认报名',
    'register.success.title': '报名成功！',
    'register.success.message': '您的报名已提交，我们将通过邮件发送确认信息。',
    'register.success.back': '返回活动列表',
    
    // Membership
    'membership.title': '会员申请',
    'membership.subtitle': '成为VMCA会员，享受更多社区服务和活动优惠',
    'membership.form.title': '申请表单',
    'membership.form.firstName': '名',
    'membership.form.lastName': '姓',
    'membership.form.email': '电子邮箱',
    'membership.form.phone': '联系电话',
    'membership.form.address': '居住地址',
    'membership.form.background': '文化背景',
    'membership.form.interests': '感兴趣的服务',
    'membership.form.volunteer': '是否愿意参与志愿服务',
    'membership.form.yes': '是',
    'membership.form.no': '否',
    'membership.form.submit': '提交申请',
    'membership.success.title': '申请已提交！',
    'membership.success.message': '感谢您的申请，管理员将在3个工作日内审核并通过邮件通知您。',
    'membership.success.home': '返回首页',
    
    // Admin
    'admin.login.title': '后台登录',
    'admin.login.username': '用户名',
    'admin.login.password': '密码',
    'admin.login.submit': '登录',
    'admin.dashboard.title': '管理仪表盘',
    'admin.dashboard.welcome': '欢迎回来',
    'admin.dashboard.stats.events': '活动总数',
    'admin.dashboard.stats.news': '新闻总数',
    'admin.dashboard.stats.members': '待审核会员',
    'admin.dashboard.stats.registrations': '最新报名',
    'admin.nav.events': '活动管理',
    'admin.nav.news': '新闻管理',
    'admin.nav.members': '会员审核',
    'admin.nav.settings': '账号设置',
    'admin.logout': '退出登录',
    
    // Common
    'common.submit': '提交',
    'common.cancel': '取消',
    'common.back': '返回',
    'common.loading': '加载中...',
    'common.free': '免费',
    'common.note': '注：本原型使用模拟数据，实际系统将对接API、邮件服务和支付网关。',
    
    // Footer
    'footer.contact': '联系我们',
    'footer.email': '邮箱',
    'footer.phone': '电话',
    'footer.address': '地址',
    'footer.follow': '关注我们',
    'footer.rights': '© 2025 维多利亚多元文化社区促进协会 版权所有',
  },
  en: {
    // Navigation
    'nav.home': 'Home',
    'nav.news': 'News',
    'nav.events': 'Events',
    'nav.membership': 'Membership',
    'nav.about': 'About Us',
    'nav.admin': 'Admin',
    
    // Home
    'home.hero.title': 'Victoria Multicultural Community Promotion Association',
    'home.hero.subtitle': 'Building Harmonious Multicultural Communities Together',
    'home.hero.cta.news': 'Latest News',
    'home.hero.cta.join': 'Join Us',
    'home.about.title': 'About VMCA',
    'home.about.desc': 'VMCA is dedicated to promoting multicultural exchange in Victoria, providing cultural activities, education, and mutual support services. We believe in the power of multiculturalism to create a more inclusive, harmonious, and prosperous community.',
    'home.services.title': 'Our Services',
    'home.services.events': 'Cultural Events',
    'home.services.events.desc': 'Regular cultural festivals, art exhibitions, and community gatherings',
    'home.services.education': 'Education & Training',
    'home.services.education.desc': 'Language courses, career training, and cultural lectures',
    'home.services.support': 'Community Support',
    'home.services.support.desc': 'Settlement services and legal consultation for newcomers',
    
    // News
    'news.title': 'News & Updates',
    'news.readMore': 'Read More',
    'news.back': 'Back to List',
    'news.date': 'Published',
    'news.share': 'Share',
    
    // Events
    'events.title': 'Events',
    'events.upcoming': 'Upcoming',
    'events.register': 'Register Now',
    'events.details': 'Event Details',
    'events.date': 'Date & Time',
    'events.location': 'Location',
    'events.fee': 'Fee',
    'events.capacity': 'Capacity',
    'events.back': 'Back to List',
    
    // Event Registration
    'register.title': 'Event Registration',
    'register.form.name': 'Full Name',
    'register.form.email': 'Email Address',
    'register.form.phone': 'Phone Number',
    'register.form.notes': 'Additional Notes',
    'register.form.participants': 'Number of Participants',
    'register.next': 'Next: Payment Method',
    'register.payment.title': 'Select Payment Method',
    'register.payment.online': 'Online Payment',
    'register.payment.onsite': 'Pay On-Site',
    'register.payment.transfer': 'Bank Transfer',
    'register.payment.confirm': 'Confirm Registration',
    'register.success.title': 'Registration Successful!',
    'register.success.message': 'Your registration has been submitted. We will send a confirmation email shortly.',
    'register.success.back': 'Back to Events',
    
    // Membership
    'membership.title': 'Membership Application',
    'membership.subtitle': 'Become a VMCA member and enjoy more community services and event discounts',
    'membership.form.title': 'Application Form',
    'membership.form.firstName': 'First Name',
    'membership.form.lastName': 'Last Name',
    'membership.form.email': 'Email Address',
    'membership.form.phone': 'Phone Number',
    'membership.form.address': 'Residential Address',
    'membership.form.background': 'Cultural Background',
    'membership.form.interests': 'Service Interests',
    'membership.form.volunteer': 'Willing to Volunteer',
    'membership.form.yes': 'Yes',
    'membership.form.no': 'No',
    'membership.form.submit': 'Submit Application',
    'membership.success.title': 'Application Submitted!',
    'membership.success.message': 'Thank you for your application. Our admin team will review it within 3 business days and notify you via email.',
    'membership.success.home': 'Back to Home',
    
    // Admin
    'admin.login.title': 'Admin Login',
    'admin.login.username': 'Username',
    'admin.login.password': 'Password',
    'admin.login.submit': 'Login',
    'admin.dashboard.title': 'Admin Dashboard',
    'admin.dashboard.welcome': 'Welcome Back',
    'admin.dashboard.stats.events': 'Total Events',
    'admin.dashboard.stats.news': 'Total News',
    'admin.dashboard.stats.members': 'Pending Members',
    'admin.dashboard.stats.registrations': 'Recent Registrations',
    'admin.nav.events': 'Event Management',
    'admin.nav.news': 'News Management',
    'admin.nav.members': 'Member Review',
    'admin.nav.settings': 'Account Settings',
    'admin.logout': 'Logout',
    
    // Common
    'common.submit': 'Submit',
    'common.cancel': 'Cancel',
    'common.back': 'Back',
    'common.loading': 'Loading...',
    'common.free': 'Free',
    'common.note': 'Note: This prototype uses mock data. The production system will integrate with APIs, email services, and payment gateways.',
    
    // Footer
    'footer.contact': 'Contact Us',
    'footer.email': 'Email',
    'footer.phone': 'Phone',
    'footer.address': 'Address',
    'footer.follow': 'Follow Us',
    'footer.rights': '© 2025 Victoria Multicultural Community Promotion Association. All rights reserved.',
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>('zh');

  useEffect(() => {
    const browserLang = navigator.language.toLowerCase();
    if (browserLang.startsWith('en')) {
      setLanguage('en');
    }
  }, []);

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
}
