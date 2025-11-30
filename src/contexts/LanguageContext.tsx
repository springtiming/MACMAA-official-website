import React, { createContext, useContext, useState, useEffect } from "react";

type Language = "zh" | "en";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
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
      "澳洲万年市华人互助会的使命，是为万年市及周边地区的华人社区提供支持与关怀，促进文化交流、长者福祉、多元文化融合，并通过各种活动增强社区成员之间",
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
    "events.memberFee": "会员价",
    "events.memberOnly": "会员限定",
    "events.allWelcome": "欢迎所有人",

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
    "membership.form.email": "电子邮箱",
    "membership.form.phone": "联系电话",
    "membership.form.address": "居住地址",
    "membership.form.emergency": "紧急联络人",
    "membership.form.emergencyName": "紧急联络人姓名",
    "membership.form.emergencyPhone": "紧急联络人电话",
    "membership.form.emergencyRelation": "与本人关系",
    "membership.form.memberType": "会员类型",
    "membership.form.regular": "普通会员（$20/年）",
    "membership.form.agree1": "我确认所填信息真实无误",
    "membership.form.agree2": "我同意遵守会员守则",
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
    "admin.dashboard.title": "管理后台",
    "admin.dashboard.welcome": "欢迎回来",
    "admin.dashboard.stats.events": "活动总数",
    "admin.dashboard.stats.news": "新闻总数",
    "admin.dashboard.stats.members": "待审核会员",
    "admin.dashboard.stats.registrations": "最近报名",
    "admin.nav.events": "活动管理",
    "admin.nav.news": "新闻管理",
    "admin.nav.members": "会员管理",
    "admin.nav.settings": "账号设置",
    "admin.logout": "退出登录",
    "admin.backToDashboard": "返回管理后台",

    // Admin - Event Management
    "admin.events.title": "活动管理",
    "admin.events.add": "添加活",
    "admin.events.edit": "编辑活动",
    "admin.events.search": "搜索活动...",
    "admin.events.all": "全部活动",
    "admin.events.delete": "删除",
    "admin.events.view": "查看",
    "admin.events.form.titleZh": "活动标题（中文）",
    "admin.events.form.titleEn": "活动标题（英文）",
    "admin.events.form.descZh": "活动描述（中文）",
    "admin.events.form.descEn": "活动描述（英文）",
    "admin.events.form.date": "活动日期",
    "admin.events.form.time": "活动时间",
    "admin.events.form.location": "活动地点",
    "admin.events.form.fee": "活动费用",
    "admin.events.form.memberFee": "会员价格",
    "admin.events.form.capacity": "名额限制",
    "admin.events.form.image": "图片关键词",
    "admin.events.form.accessType": "访问类型",
    "admin.events.form.membersOnly": "会员限定",
    "admin.events.form.allWelcome": "欢迎所有人",
    "admin.events.form.save": "保存活动",
    "admin.events.deleteConfirm": "确定要删除这个活动吗？",
    "admin.events.form.unlimited": "不限制人数",
    "admin.events.unlimited": "不限制",
    "admin.events.form.imageType": "图片类型",
    "admin.events.form.unsplash": "Unsplash搜索",
    "admin.events.form.uploadImage": "上传图片",
    "admin.events.form.upload": "选择文件",
    "admin.events.form.imagePreview": "图片预览",
    "admin.events.form.memberOnly": "仅限会员",
    "admin.events.form.memberPrice": "会员价格",
    "admin.events.form.nonMemberPrice": "非会员价格",
    "admin.events.form.price": "活动费用",
    "admin.events.form.imageLabel": "活动图片",
    "admin.events.form.imageHint": "建议尺寸：1200x600px",
    "admin.events.form.cropImage": "裁剪图片",
    "admin.events.save": "保存",
    "admin.events.cancel": "取消",
    "admin.events.viewRegistrations": "查看报名",
    "admin.events.registrations.title": "活动报名信息",
    "admin.events.registrations.count": "报名人数",
    "admin.events.registrations.export": "导出报名",
    "admin.events.registrations.search": "搜索报名（姓名、电话、邮箱）",
    "admin.events.registrations.name": "姓名",
    "admin.events.registrations.phone": "电话",
    "admin.events.registrations.email": "邮箱",
    "admin.events.registrations.tickets": "票数",
    "admin.events.registrations.payment": "付款方式",
    "admin.events.registrations.registrationDate": "报名时间",
    "admin.events.registrations.close": "关闭",
    "admin.events.payment.card": "信用卡/借记卡",
    "admin.events.payment.cash": "现金",
    "admin.events.payment.transfer": "银行转账",

    // Admin - News Management
    "admin.news.title": "新闻管理",
    "admin.news.add": "添加新闻",
    "admin.news.edit": "编辑新闻",
    "admin.news.search": "搜索新闻...",
    "admin.news.all": "全部新闻",
    "admin.news.delete": "删除",
    "admin.news.view": "查看",
    "admin.news.form.titleZh": "新闻标题（中文）",
    "admin.news.form.titleEn": "新闻标题（英文）",
    "admin.news.form.summaryZh": "新闻摘要（中文）",
    "admin.news.form.summaryEn": "新闻摘要（英文）",
    "admin.news.form.contentZh": "新闻内容（中文）",
    "admin.news.form.contentEn": "新闻内容（英文）",
    "admin.news.form.date": "发布日期",
    "admin.news.form.imageKeyword": "封面图片关键词（Unsplash搜索）",
    "admin.news.form.imageKeywordPlaceholder":
      "例如: chinese,new,year,celebration",
    "admin.news.form.imageKeywordHelp":
      "用逗号分隔多个关键词，系统会从Unsplash图库搜索相关图片作为封面",
    "admin.news.form.imageUpload": "或上传自定义封面图片",
    "admin.news.form.imageUploadBtn": "选择图片",
    "admin.news.form.imagePreview": "封面预览",
    "admin.news.form.coverImageSettings": "封面图片设置",
    "admin.news.form.useUnsplash": "使用Unsplash搜索",
    "admin.news.form.useUpload": "上传本地图片",
    "admin.news.form.unsplashKeywords": "搜索关键词",
    "admin.news.form.unsplashKeywordsPlaceholder":
      "输入英文关键词，用逗号分隔（如：chinese,new,year,celebration）",
    "admin.news.form.unsplashHelp":
      "系统将从Unsplash免费图库中搜索匹配的高质量图片",
    "admin.news.form.uploadImageBtn": "选择并上传图片",
    "admin.news.form.uploadHelp": "支持JPG、PNG、GIF等格式，上传后可以裁剪调整",
    "admin.news.form.fullscreenEdit": "全屏编辑",
    "admin.news.form.exitFullscreen": "退出全屏",
    "admin.news.form.fullscreenTitle": "全屏编辑 - ",
    "admin.news.form.saveDraft": "保存成草稿",
    "admin.news.form.save": "保存新闻",
    "admin.news.deleteConfirm": "确定要删除这条新闻吗？",

    // Admin - Member Management
    "admin.members.title": "会员审核",
    "admin.members.search": "搜索会员（姓名、手机、邮箱）",
    "admin.members.all": "全部",
    "admin.members.pending": "待审核",
    "admin.members.approved": "已通过",
    "admin.members.rejected": "已拒绝",
    "admin.members.view": "查看详情",
    "admin.members.approve": "通过",
    "admin.members.reject": "拒绝",
    "admin.members.revoke": "取消资格",
    "admin.members.delete": "删除记录",
    "admin.members.close": "关闭",
    "admin.members.reopen": "重新审核",
    "admin.members.export": "导出Excel",
    "admin.members.rejectedNote":
      "提示：已拒绝的会员申请记录将在30天后自动删除",
    "admin.members.confirm.approve.title": "确认通过",
    "admin.members.confirm.approve.message": "确定要通过该会员申请吗？",
    "admin.members.confirm.reject.title": "确认拒绝",
    "admin.members.confirm.reject.message": "确定要拒绝该会员申请吗？",
    "admin.members.confirm.revoke.title": "确认取消资格",
    "admin.members.confirm.revoke.message":
      "确定要取消该会员的会员资格吗？此操作将把会员状态改为已拒绝。",
    "admin.members.confirm.delete.title": "确认删除",
    "admin.members.confirm.delete.message":
      "确定要删除该会员申请记录吗？此操作无法撤销。",
    "admin.members.confirm.reopen.title": "确认重新审核",
    "admin.members.confirm.reopen.message":
      "确定要将该会员申请重新标记为待审核状态吗？",
    "admin.members.confirm.confirm": "确认",
    "admin.members.confirm.cancel": "取消",
    "admin.members.table.name": "姓名",
    "admin.members.table.phone": "电话",
    "admin.members.table.email": "邮箱",
    "admin.members.table.applyDate": "申请日期",
    "admin.members.table.status": "状态",
    "admin.members.table.actions": "操作",
    "admin.members.detail.title": "会员详细信息",
    "admin.members.detail.chineseName": "中文姓名",
    "admin.members.detail.englishName": "英文姓名",
    "admin.members.detail.gender": "性别",
    "admin.members.detail.birthday": "出生日期",
    "admin.members.detail.phone": "联系电话",
    "admin.members.detail.email": "电子邮箱",
    "admin.members.detail.address": "居住地址",
    "admin.members.detail.emergency": "紧急联系人",
    "admin.members.detail.emergencyPhone": "紧急联系电话",
    "admin.members.detail.emergencyRelation": "紧急联系人关系",

    // Admin - Account Settings (Simplified)
    "admin.settings.title": "账号设置",
    "admin.settings.emailSection": "电子邮箱",
    "admin.settings.emailDesc": "用于接收通知和找回密码",
    "admin.settings.email": "电子邮箱",
    "admin.settings.saveEmail": "保存邮箱",
    "admin.settings.emailUpdated": "邮箱已更新",
    "admin.settings.changePassword": "修改密码",
    "admin.settings.passwordRequirements":
      "密码要求：至少8个字符，包含大小写字母和数字",
    "admin.settings.currentPassword": "当前密码",
    "admin.settings.newPassword": "新密码",
    "admin.settings.confirmPassword": "确认新密码",
    "admin.settings.passwordUpdated": "密码已修改",
    "admin.settings.passwordMismatch": "新密码和确认密码不匹配",
    "admin.settings.notificationsSection": "邮件通知",
    "admin.settings.notificationsDesc": "管理邮件通知设置",
    "admin.settings.emailNotifications": "接收所有邮件通知",
    "admin.settings.emailNotificationsDesc":
      "会员申请和活动报名的邮件通知总开关",
    "admin.settings.memberNotifications": "会员申请通知",
    "admin.settings.memberNotificationsDesc": "收到新的会员申请时发送邮件通知",
    "admin.settings.eventNotifications": "活动报名通知",
    "admin.settings.eventNotificationsDesc": "有新的活动报名时发送邮件通知",
    "admin.settings.saveNotifications": "保存通知设置",
    "admin.settings.notificationsUpdated": "通知设置已保存",
    "admin.settings.emailLanguageSection": "邮件语言偏好",
    "admin.settings.emailLanguageDesc": "选择接收邮件通知的语言",
    "admin.settings.chinese": "中文",
    "admin.settings.chineseDesc": "使用中文发送邮件",
    "admin.settings.english": "English",
    "admin.settings.englishDesc": "使用英文发送邮件",
    "admin.settings.saveLanguage": "保存语言设置",
    "admin.settings.emailLanguageUpdated": "邮件语言已更新",

    // Admin - Account Management
    "admin.accounts.title": "账户管理",
    "admin.accounts.createAccount": "创建新账户",
    "admin.accounts.totalAccounts": "账户总数",
    "admin.accounts.owners": "站长账户",
    "admin.accounts.admins": "管理员账户",
    "admin.accounts.searchPlaceholder": "搜索用户名或邮箱...",
    "admin.accounts.viewOnlyNotice":
      "您当前为管理员权限，仅可查看账户信息。只有站长可以创建、删除账户。",
    "admin.accounts.noResults": "没有找到匹配的账户",
    "admin.accounts.table.username": "用户名",
    "admin.accounts.table.email": "邮箱",
    "admin.accounts.table.role": "角色",
    "admin.accounts.table.createdAt": "创建时间",
    "admin.accounts.table.lastLogin": "最后登录",
    "admin.accounts.table.actions": "操作",
    "admin.accounts.role.owner": "站长",
    "admin.accounts.role.admin": "管理员",
    "admin.accounts.deleteDialog.title": "确认删除账户",
    "admin.accounts.deleteDialog.description":
      '您确定要删除账户 "{username}" 吗？此操作无法撤销。',
    "admin.accounts.deleteDialog.confirm": "删除账户",
    "admin.accounts.createDialog.title": "创建新账户",
    "admin.accounts.createDialog.description": "填写以下信息创建新的管理员账户",
    "admin.accounts.createDialog.create": "创建账户",
    "admin.accounts.form.username": "用户名",
    "admin.accounts.form.usernamePlaceholder": "请输入用户名",
    "admin.accounts.form.email": "电子邮箱",
    "admin.accounts.form.emailPlaceholder": "请输入邮箱地址",
    "admin.accounts.form.password": "初始密码",
    "admin.accounts.form.passwordPlaceholder": "请设置初始密码",
    "admin.accounts.form.passwordHelp":
      "密码要求：至少8个字符，包含大小写字母和数字",
    "admin.accounts.form.role": "账户角色",
    "admin.accounts.permissionInfo.title": "权限说明",
    "admin.accounts.permissionInfo.owner1":
      "站长：拥有所有管理权限，可以创建和删除管理员账户，不可被其他账户删除",
    "admin.accounts.permissionInfo.owner2":
      "站长：可以管理活动、新闻、会员审核，以及账户管理",
    "admin.accounts.permissionInfo.admin1":
      "管理员：可以管理活动、新闻、会员审核，但无法访问账户管理",
    "admin.accounts.permissionInfo.admin2":
      "管理员：只有站长可以创建和删除管理员账户",

    // Common
    "common.submit": "提交",
    "common.cancel": "取消",
    "common.back": "返回",
    "common.loading": "加载中...",
    "common.free": "免费",

    // Footer
    "footer.contact": "联系我们",
    "footer.email": "邮箱",
    "footer.phone": "电话",
    "footer.address": "地址",
    "footer.follow": "关注我们",
    "footer.rights": "© 2025 澳洲万年市华人互助会。本网站的所有内容、图片、设计和品牌标识均保留所有权利。",
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
    "events.memberFee": "Member Price",
    "events.memberOnly": "Members Only",
    "events.allWelcome": "All Welcome",

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
    "membership.form.email": "Email",
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
    "membership.form.agree2": "I agree to abide by the membership guidelines",
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
    "admin.backToDashboard": "Back to Dashboard",

    // Admin - Event Management
    "admin.events.title": "Event Management",
    "admin.events.add": "Add Event",
    "admin.events.edit": "Edit Event",
    "admin.events.search": "Search Events...",
    "admin.events.all": "All Events",
    "admin.events.delete": "Delete",
    "admin.events.view": "View",
    "admin.events.form.titleZh": "Event Title (Chinese)",
    "admin.events.form.titleEn": "Event Title (English)",
    "admin.events.form.descZh": "Event Description (Chinese)",
    "admin.events.form.descEn": "Event Description (English)",
    "admin.events.form.date": "Event Date",
    "admin.events.form.time": "Event Time",
    "admin.events.form.location": "Event Location",
    "admin.events.form.fee": "Event Fee",
    "admin.events.form.memberFee": "Member Price",
    "admin.events.form.capacity": "Capacity Limit",
    "admin.events.form.image": "Image Keyword",
    "admin.events.form.accessType": "Access Type",
    "admin.events.form.membersOnly": "Members Only",
    "admin.events.form.allWelcome": "All Welcome",
    "admin.events.form.save": "Save Event",
    "admin.events.deleteConfirm": "Are you sure you want to delete this event?",
    "admin.events.form.unlimited": "Unlimited Capacity",
    "admin.events.unlimited": "Unlimited",
    "admin.events.form.imageType": "Image Type",
    "admin.events.form.unsplash": "Unsplash Search",
    "admin.events.form.uploadImage": "Upload Image",
    "admin.events.form.upload": "Select File",
    "admin.events.form.imagePreview": "Image Preview",
    "admin.events.form.memberOnly": "Members Only",
    "admin.events.form.memberPrice": "Member Price",
    "admin.events.form.nonMemberPrice": "Non-Member Price",
    "admin.events.form.price": "Event Fee",
    "admin.events.form.imageLabel": "Event Image",
    "admin.events.form.imageHint": "Recommended size: 1200x600px",
    "admin.events.form.cropImage": "Crop Image",
    "admin.events.save": "Save",
    "admin.events.cancel": "Cancel",
    "admin.events.viewRegistrations": "View Registrations",
    "admin.events.registrations.title": "Event Registration Information",
    "admin.events.registrations.count": "Number of Registrations",
    "admin.events.registrations.export": "Export Registrations",
    "admin.events.registrations.search":
      "Search Registrations (Name, Phone, Email)...",
    "admin.events.registrations.name": "Name",
    "admin.events.registrations.phone": "Phone",
    "admin.events.registrations.email": "Email",
    "admin.events.registrations.tickets": "Tickets",
    "admin.events.registrations.payment": "Payment Method",
    "admin.events.registrations.registrationDate": "Registration Date",
    "admin.events.registrations.close": "Close",
    "admin.events.payment.card": "Credit Card/Debit Card",
    "admin.events.payment.cash": "Cash",
    "admin.events.payment.transfer": "Bank Transfer",

    // Admin - News Management
    "admin.news.title": "News Management",
    "admin.news.add": "Add News",
    "admin.news.edit": "Edit News",
    "admin.news.search": "Search News...",
    "admin.news.all": "All News",
    "admin.news.delete": "Delete",
    "admin.news.view": "View",
    "admin.news.form.titleZh": "News Title (Chinese)",
    "admin.news.form.titleEn": "News Title (English)",
    "admin.news.form.summaryZh": "News Summary (Chinese)",
    "admin.news.form.summaryEn": "News Summary (English)",
    "admin.news.form.contentZh": "News Content (Chinese)",
    "admin.news.form.contentEn": "News Content (English)",
    "admin.news.form.date": "Publication Date",
    "admin.news.form.imageKeyword": "Cover Image Keyword (Unsplash Search)",
    "admin.news.form.imageKeywordPlaceholder":
      "e.g.: chinese,new,year,celebration",
    "admin.news.form.imageKeywordHelp":
      "Separate multiple keywords with commas, the system will search for relevant images from the Unsplash library as the cover",
    "admin.news.form.imageUpload": "Or upload a custom cover image",
    "admin.news.form.imageUploadBtn": "Select Image",
    "admin.news.form.imagePreview": "Cover Preview",
    "admin.news.form.coverImageSettings": "Cover Image Settings",
    "admin.news.form.useUnsplash": "Use Unsplash Search",
    "admin.news.form.useUpload": "Upload Local Image",
    "admin.news.form.unsplashKeywords": "Search Keywords",
    "admin.news.form.unsplashKeywordsPlaceholder":
      "Enter English keywords, separated by commas (e.g.: chinese,new,year,celebration)",
    "admin.news.form.unsplashHelp":
      "The system will search for high-quality images from the Unsplash free library",
    "admin.news.form.uploadImageBtn": "Select and Upload Image",
    "admin.news.form.uploadHelp":
      "Supports JPG, PNG, GIF, etc. formats, can be cropped and adjusted after upload",
    "admin.news.form.fullscreenEdit": "Fullscreen Edit",
    "admin.news.form.exitFullscreen": "Exit Fullscreen",
    "admin.news.form.fullscreenTitle": "Fullscreen Edit - ",
    "admin.news.form.saveDraft": "Save as draft",
    "admin.news.form.save": "Save News",
    "admin.news.deleteConfirm":
      "Are you sure you want to delete this news item?",

    // Admin - Member Management
    "admin.members.title": "Member Management",
    "admin.members.search": "Search Members (Name, Phone, Email)...",
    "admin.members.all": "All Members",
    "admin.members.pending": "Pending",
    "admin.members.approved": "Approved",
    "admin.members.rejected": "Rejected",
    "admin.members.view": "View Details",
    "admin.members.approve": "Approve",
    "admin.members.reject": "Reject",
    "admin.members.revoke": "Revoke Membership",
    "admin.members.delete": "Delete Record",
    "admin.members.close": "Close",
    "admin.members.reopen": "Reopen for Review",
    "admin.members.export": "Export to Excel",
    "admin.members.rejectedNote":
      "Note: Rejected member application records will be automatically deleted after 30 days",
    "admin.members.confirm.approve.title": "Confirm Approval",
    "admin.members.confirm.approve.message":
      "Are you sure you want to approve this member application?",
    "admin.members.confirm.reject.title": "Confirm Rejection",
    "admin.members.confirm.reject.message":
      "Are you sure you want to reject this member application?",
    "admin.members.confirm.revoke.title": "Confirm Revocation",
    "admin.members.confirm.revoke.message":
      "Are you sure you want to revoke this member's membership? This action will change the member status to rejected.",
    "admin.members.confirm.delete.title": "Confirm Deletion",
    "admin.members.confirm.delete.message":
      "Are you sure you want to delete this member application record? This action cannot be undone.",
    "admin.members.confirm.reopen.title": "Confirm Reopen",
    "admin.members.confirm.reopen.message":
      "Are you sure you want to reopen this member application for review?",
    "admin.members.confirm.confirm": "Confirm",
    "admin.members.confirm.cancel": "Cancel",
    "admin.members.table.name": "Name",
    "admin.members.table.phone": "Phone",
    "admin.members.table.email": "Email",
    "admin.members.table.applyDate": "Application Date",
    "admin.members.table.status": "Status",
    "admin.members.table.actions": "Actions",
    "admin.members.detail.title": "Member Details",
    "admin.members.detail.chineseName": "Chinese Name",
    "admin.members.detail.englishName": "English Name",
    "admin.members.detail.gender": "Gender",
    "admin.members.detail.birthday": "Date of Birth",
    "admin.members.detail.phone": "Phone Number",
    "admin.members.detail.email": "Email Address",
    "admin.members.detail.address": "Residential Address",
    "admin.members.detail.emergency": "Emergency Contact",
    "admin.members.detail.emergencyPhone": "Emergency Contact Phone",
    "admin.members.detail.emergencyRelation": "Relationship",

    // Admin - Account Settings (Simplified)
    "admin.settings.title": "Account Settings",
    "admin.settings.emailSection": "Email",
    "admin.settings.emailDesc":
      "Used for receiving notifications and password recovery",
    "admin.settings.email": "Email Address",
    "admin.settings.saveEmail": "Save Email",
    "admin.settings.emailUpdated": "Email updated",
    "admin.settings.changePassword": "Change Password",
    "admin.settings.passwordRequirements":
      "Password Requirements: At least 8 characters, including uppercase and lowercase letters and numbers",
    "admin.settings.currentPassword": "Current Password",
    "admin.settings.newPassword": "New Password",
    "admin.settings.confirmPassword": "Confirm New Password",
    "admin.settings.passwordUpdated": "Password changed",
    "admin.settings.passwordMismatch":
      "New password and confirm password do not match",
    "admin.settings.notificationsSection": "Email Notifications",
    "admin.settings.notificationsDesc": "Manage email notification settings",
    "admin.settings.emailNotifications": "Receive all email notifications",
    "admin.settings.emailNotificationsDesc":
      "Master switch for member applications and event registrations email notifications",
    "admin.settings.memberNotifications": "Member Application Notifications",
    "admin.settings.memberNotificationsDesc":
      "Send email notifications when a new member application is received",
    "admin.settings.eventNotifications": "Event Registration Notifications",
    "admin.settings.eventNotificationsDesc":
      "Send email notifications when there is a new event registration",
    "admin.settings.saveNotifications": "Save Notification Settings",
    "admin.settings.notificationsUpdated": "Notification settings saved",
    "admin.settings.emailLanguageSection": "Email Language Preference",
    "admin.settings.emailLanguageDesc":
      "Choose the language for email notifications",
    "admin.settings.chinese": "Chinese",
    "admin.settings.chineseDesc": "Send emails in Chinese",
    "admin.settings.english": "English",
    "admin.settings.englishDesc": "Send emails in English",
    "admin.settings.saveLanguage": "Save Language Settings",
    "admin.settings.emailLanguageUpdated": "Email language updated",

    // Admin - Account Management
    "admin.accounts.title": "Account Management",
    "admin.accounts.createAccount": "Create New Account",
    "admin.accounts.totalAccounts": "Total Accounts",
    "admin.accounts.owners": "Owner Accounts",
    "admin.accounts.admins": "Admin Accounts",
    "admin.accounts.searchPlaceholder": "Search by username or email...",
    "admin.accounts.viewOnlyNotice":
      "You currently have admin permissions, only able to view account information. Only owners can create and delete accounts.",
    "admin.accounts.noResults": "No matching accounts found",
    "admin.accounts.table.username": "Username",
    "admin.accounts.table.email": "Email",
    "admin.accounts.table.role": "Role",
    "admin.accounts.table.createdAt": "Created At",
    "admin.accounts.table.lastLogin": "Last Login",
    "admin.accounts.table.actions": "Actions",
    "admin.accounts.role.owner": "Owner",
    "admin.accounts.role.admin": "Admin",
    "admin.accounts.deleteDialog.title": "Confirm Account Deletion",
    "admin.accounts.deleteDialog.description":
      'Are you sure you want to delete the account "{username}"? This action cannot be undone.',
    "admin.accounts.deleteDialog.confirm": "Delete Account",
    "admin.accounts.createDialog.title": "Create New Account",
    "admin.accounts.createDialog.description":
      "Fill in the following information to create a new admin account",
    "admin.accounts.createDialog.create": "Create Account",
    "admin.accounts.form.username": "Username",
    "admin.accounts.form.usernamePlaceholder": "Enter a username",
    "admin.accounts.form.email": "Email Address",
    "admin.accounts.form.emailPlaceholder": "Enter an email address",
    "admin.accounts.form.password": "Initial Password",
    "admin.accounts.form.passwordPlaceholder": "Set an initial password",
    "admin.accounts.form.passwordHelp":
      "Password Requirements: At least 8 characters, including uppercase and lowercase letters and numbers",
    "admin.accounts.form.role": "Account Role",
    "admin.accounts.permissionInfo.title": "Permission Information",
    "admin.accounts.permissionInfo.owner1":
      "Owner: Has all management permissions, can create and delete admin accounts, cannot be deleted by other accounts",
    "admin.accounts.permissionInfo.owner2":
      "Owner: Can manage events, news, member reviews, and account management",
    "admin.accounts.permissionInfo.admin1":
      "Admin: Can manage events, news, member reviews, but cannot access account management",
    "admin.accounts.permissionInfo.admin2":
      "Admin: Only owners can create and delete admin accounts",

    // Common
    "common.submit": "Submit",
    "common.cancel": "Cancel",
    "common.back": "Back",
    "common.loading": "Loading...",
    "common.free": "Free",

    // Footer
    "footer.contact": "Contact Us",
    "footer.email": "Email",
    "footer.phone": "Phone",
    "footer.address": "Address",
    "footer.follow": "Follow Us",
    "footer.rights":
      "© 2025 Manningham Australian Chinese Mutual Aid Association. All rights to the website's content, images, design, and branding reserved.",
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
    throw new Error("useLanguage must be used within LanguageProvider");
  }
  return context;
}
