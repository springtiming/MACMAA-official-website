import React, { createContext, useContext, useState, useEffect } from "react";

type Language = "zh" | "en";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations = {
  zh: {
    // Navigation
    "nav.home": "首页",
    "nav.news": "新闻动态",
    "nav.events": "活动中心",
    "nav.membership": "会员申请",
    "nav.about": "协会简介",
    "nav.admin": "后台管理",

    // Home
    "home.hero.title": "澳洲万年市华人互助会",
    "home.hero.subtitle": "服务年长者，推动邻里互助、社区融合与文化传承",
    "home.hero.cta.news": "最新动态",
    "home.hero.cta.join": "加入我们",
    "home.about.title": "关于我们",
    "home.about.desc":
      "澳洲万年市华人互助会致力于服务年长者，推动邻里互助、社区融合与文化传承。我们通过多元化活动，关爱健康、丰富生活，打造温馨、友爱的社区家园。",
    "home.mission.title": "我们的使命",
    "home.mission.desc":
      "澳洲万年市华人互助会的使命，是为万年市及周边地区的华人社区提供支持与关怀，促进文化交流、长者福祉、多元文化融合，并通过各种活动增强社区成员之间联系。",
    "home.services.title": "我们的服务",
    "home.services.mutual": "公益互助",
    "home.services.mutual.desc":
      "倡导邻里守望相助，关爱年长群体，积极参与社区志愿服务",
    "home.services.community": "社区融合",
    "home.services.community.desc":
      "建设友善包容的社区氛围，鼓励居民之间的沟通交流",
    "home.services.diverse": "多元服务",
    "home.services.diverse.desc":
      "提供太极、舞蹈、麻将、唱歌、英文、书法、乒乓球等丰富活动",
    "home.services.health": "健康养生",
    "home.services.health.desc":
      "定期举办健康讲座、健身活动、体检服务，提升长者生活质量",
    "home.services.culture": "文化传承",
    "home.services.culture.desc":
      "弘扬中华优秀传统文化，促进多元文化的互学互鉴",
    "home.weekly.title": "每周四社区活动",
    "home.weekly.time": "每周四  •  上午10:00 - 下午2:00",
    "home.weekly.location":
      "地址：293-297 Manningham Rd, Templestowe Lower VIC 3107",
    "home.activities.title": "精彩瞬间",
    "home.activities.desc": "记录我们社区的温暖时刻与精彩活动",

    // News
    "news.title": "新闻动态",
    "news.readMore": "阅读更多",
    "news.back": "返回列表",
    "news.date": "发布时间",
    "news.share": "分享",

    // Events
    "events.title": "活动中心",
    "events.upcoming": "即将举行",
    "events.register": "立即报名",
    "events.details": "活动详情",
    "events.date": "活动时间",
    "events.location": "活动地点",
    "events.fee": "活动费用",
    "events.capacity": "名额限制",
    "events.back": "返回列表",

    // Event Registration
    "register.title": "活动报名",
    "register.form.name": "姓名",
    "register.form.email": "电子邮箱",
    "register.form.phone": "联系电话",
    "register.form.notes": "备注信息",
    "register.form.participants": "参与人数",
    "register.next": "下一步：选择支付方式",
    "register.payment.title": "选择支付方式",
    "register.payment.online": "在线支付",
    "register.payment.onsite": "现场支付",
    "register.payment.transfer": "银行转账",
    "register.payment.confirm": "确认报名",
    "register.success.title": "报名成功！",
    "register.success.message": "您的报名已提交，我们将通过邮件发送确认信息。",
    "register.success.back": "返回活动列表",

    // Membership
    "membership.title": "会员申请",
    "membership.subtitle": "成为MACMAA会员，享受更多社区服务和活动优惠",
    "membership.fee": "会员费：$20/年",
    "membership.feeNote": "（会员年度为1月1日至12月31日）",
    "membership.form.title": "申请表单",
    "membership.form.chineseName": "中文姓名",
    "membership.form.englishName": "英文姓名",
    "membership.form.gender": "性别",
    "membership.form.male": "男",
    "membership.form.female": "女",
    "membership.form.birthday": "出生日期",
    "membership.form.email": "电子邮箱（可选）",
    "membership.form.phone": "联系电话",
    "membership.form.address": "居住地址",
    "membership.form.emergency": "紧急联络人",
    "membership.form.emergencyName": "紧急联络人姓名",
    "membership.form.emergencyPhone": "紧急联络人电话",
    "membership.form.emergencyRelation": "与本人关系",
    "membership.form.memberType": "会员类型",
    "membership.form.regular": "普通会员（$20/年）",
    "membership.form.agree1": "我确认所填信息真实无误",
    "membership.form.agree2": "我同意遵守MACMAA的章程与社区守则",
    "membership.form.agree3": "我同意在审核通过后缴纳年度会员费",
    "membership.form.submit": "提交申请",
    "membership.success.title": "申请已提交！",
    "membership.success.message":
      "感谢您的申请，管理员将在3个工作日内审核并通过邮件通知您。",
    "membership.success.home": "返回首页",
    "membership.privacy.title": "隐私声明",
    "membership.privacy.desc":
      "MACMAA尊重并保护您的个人隐私。我们仅会收集用于会员管理、活动通知、紧急联络及社区服务所需的基本信息。我们不会出售、交换、发布或向未经授权的第三方分享您的个人资料。",

    // Admin
    "admin.login.title": "后台登录",
    "admin.login.username": "用户名",
    "admin.login.password": "密码",
    "admin.login.submit": "登录",
    "admin.dashboard.title": "管理仪表盘",
    "admin.dashboard.welcome": "欢迎回来",
    "admin.dashboard.stats.events": "活动总数",
    "admin.dashboard.stats.news": "新闻总数",
    "admin.dashboard.stats.members": "待审核会员",
    "admin.dashboard.stats.registrations": "最新报名",
    "admin.nav.events": "活动管理",
    "admin.nav.news": "新闻管理",
    "admin.nav.members": "会员审核",
    "admin.nav.settings": "账号设置",
    "admin.logout": "退出登录",

    // Common
    "common.submit": "提交",
    "common.cancel": "取消",
    "common.back": "返回",
    "common.loading": "加载中...",
    "common.free": "免费",
    "common.note":
      "注：本原型使用模拟数据，实际系统将对接API、邮件服务和支付网关。",

    // Footer
    "footer.contact": "联系我们",
    "footer.email": "邮箱",
    "footer.phone": "电话",
    "footer.address": "地址",
    "footer.follow": "关注我们",
    "footer.rights": "© 2025 澳洲万年市华人互助会 版权所有",
  },
  en: {
    // Navigation
    "nav.home": "Home",
    "nav.news": "News",
    "nav.events": "Events",
    "nav.membership": "Membership",
    "nav.about": "About Us",
    "nav.admin": "Admin",

    // Home
    "home.hero.title": "Manningham Australian Chinese Mutual Aid Association",
    "home.hero.subtitle":
      "Serving seniors, fostering mutual support, community harmony, and cultural heritage",
    "home.hero.cta.news": "Latest News",
    "home.hero.cta.join": "Join Us",
    "home.about.title": "About Us",
    "home.about.desc":
      "Manningham Australian Chinese Mutual Aid Association is dedicated to serving seniors, fostering mutual support, community harmony, and cultural heritage. Through diverse activities, we promote health, enrich lives, and build a warm, caring community.",
    "home.mission.title": "Our Mission",
    "home.mission.desc":
      "MACMAA is committed to providing support and care for the Chinese community in Manningham and surrounding areas, promoting cultural exchange, senior wellbeing, multicultural integration, and strengthening connections among community members.",
    "home.services.title": "Our Services",
    "home.services.mutual": "Mutual Support",
    "home.services.mutual.desc":
      "Promoting neighbourly care, supporting seniors, and encouraging volunteer participation",
    "home.services.community": "Community Harmony",
    "home.services.community.desc":
      "Building a friendly and inclusive community atmosphere through communication",
    "home.services.diverse": "Diverse Services",
    "home.services.diverse.desc":
      "Offering Tai Chi, dance, mahjong, singing, English, calligraphy, table tennis and more",
    "home.services.health": "Health & Wellbeing",
    "home.services.health.desc":
      "Regular health talks, fitness sessions, and medical check-ups for seniors",
    "home.services.culture": "Cultural Heritage",
    "home.services.culture.desc":
      "Promoting traditional Chinese culture and multicultural exchange",
    "home.weekly.title": "Weekly Thursday Activities",
    "home.weekly.time": "Time: Every Thursday 9:30 AM - 3:30 PM",
    "home.weekly.location": "Location: Lower Templestowe Community Centre",
    "home.activities.title": "Activity Highlights",
    "home.activities.desc":
      "Capturing the warm moments and wonderful activities of our community",

    // News
    "news.title": "News & Updates",
    "news.readMore": "Read More",
    "news.back": "Back to List",
    "news.date": "Published",
    "news.share": "Share",

    // Events
    "events.title": "Events",
    "events.upcoming": "Upcoming",
    "events.register": "Register Now",
    "events.details": "Event Details",
    "events.date": "Date & Time",
    "events.location": "Location",
    "events.fee": "Fee",
    "events.capacity": "Capacity",
    "events.back": "Back to List",

    // Event Registration
    "register.title": "Event Registration",
    "register.form.name": "Full Name",
    "register.form.email": "Email Address",
    "register.form.phone": "Phone Number",
    "register.form.notes": "Additional Notes",
    "register.form.participants": "Number of Participants",
    "register.next": "Next: Payment Method",
    "register.payment.title": "Select Payment Method",
    "register.payment.online": "Online Payment",
    "register.payment.onsite": "Pay On-Site",
    "register.payment.transfer": "Bank Transfer",
    "register.payment.confirm": "Confirm Registration",
    "register.success.title": "Registration Successful!",
    "register.success.message":
      "Your registration has been submitted. We will send a confirmation email shortly.",
    "register.success.back": "Back to Events",

    // Membership
    "membership.title": "Membership Application",
    "membership.subtitle":
      "Become a MACMAA member and enjoy more community services and event benefits",
    "membership.fee": "Membership Fee: $20/year",
    "membership.feeNote": "(Membership period: January 1 - December 31)",
    "membership.form.title": "Application Form",
    "membership.form.chineseName": "Chinese Name",
    "membership.form.englishName": "English Name",
    "membership.form.gender": "Gender",
    "membership.form.male": "Male",
    "membership.form.female": "Female",
    "membership.form.birthday": "Date of Birth",
    "membership.form.email": "Email (Optional)",
    "membership.form.phone": "Phone Number",
    "membership.form.address": "Residential Address",
    "membership.form.emergency": "Emergency Contact",
    "membership.form.emergencyName": "Emergency Contact Name",
    "membership.form.emergencyPhone": "Emergency Contact Phone",
    "membership.form.emergencyRelation": "Relationship",
    "membership.form.memberType": "Membership Type",
    "membership.form.regular": "Regular Member ($20/year)",
    "membership.form.agree1":
      "I confirm that the information provided is true and accurate",
    "membership.form.agree2":
      "I agree to abide by MACMAA's constitution and community guidelines",
    "membership.form.agree3":
      "I agree to pay the annual membership fee after approval",
    "membership.form.submit": "Submit Application",
    "membership.success.title": "Application Submitted!",
    "membership.success.message":
      "Thank you for your application. Our admin team will review it within 3 business days and notify you via email.",
    "membership.success.home": "Back to Home",
    "membership.privacy.title": "Privacy Statement",
    "membership.privacy.desc":
      "MACMAA respects and protects your personal privacy. We only collect basic information necessary for membership management, event notifications, emergency contact, and community services. We will not sell, exchange, publish or share your personal information with unauthorized third parties.",

    // Admin
    "admin.login.title": "Admin Login",
    "admin.login.username": "Username",
    "admin.login.password": "Password",
    "admin.login.submit": "Login",
    "admin.dashboard.title": "Admin Dashboard",
    "admin.dashboard.welcome": "Welcome Back",
    "admin.dashboard.stats.events": "Total Events",
    "admin.dashboard.stats.news": "Total News",
    "admin.dashboard.stats.members": "Pending Members",
    "admin.dashboard.stats.registrations": "Recent Registrations",
    "admin.nav.events": "Event Management",
    "admin.nav.news": "News Management",
    "admin.nav.members": "Member Review",
    "admin.nav.settings": "Account Settings",
    "admin.logout": "Logout",

    // Common
    "common.submit": "Submit",
    "common.cancel": "Cancel",
    "common.back": "Back",
    "common.loading": "Loading...",
    "common.free": "Free",
    "common.note":
      "Note: This prototype uses mock data. The production system will integrate with APIs, email services, and payment gateways.",

    // Footer
    "footer.contact": "Contact Us",
    "footer.email": "Email",
    "footer.phone": "Phone",
    "footer.address": "Address",
    "footer.follow": "Follow Us",
    "footer.rights":
      "© 2025 Manningham Australian Chinese Mutual Aid Association. All rights reserved.",
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined
);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>("zh");

  useEffect(() => {
    const browserLang = navigator.language.toLowerCase();
    if (browserLang.startsWith("en")) {
      setLanguage("en");
    }
  }, []);

  const t = (key: string): string => {
    return (translations[language] as Record<string, string>)[key] || key;
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
    throw new Error("useLanguage must be used within LanguageProvider");
  }
  return context;
}
