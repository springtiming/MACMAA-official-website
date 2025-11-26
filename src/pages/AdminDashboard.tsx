import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../contexts/LanguageContext";
import { motion } from "motion/react";
import {
  Calendar,
  Newspaper,
  Users,
  UserCheck,
  Settings,
  LogOut,
  TrendingUp,
  Clock,
} from "lucide-react";
import { mockEvents, mockNews } from "../data/mockData";

export function AdminDashboard() {
  const navigate = useNavigate();
  const { language, t } = useLanguage();

  useEffect(() => {
    // Check authentication
    const isAuth = sessionStorage.getItem("adminAuth");
    if (!isAuth) {
      navigate("/admin");
    }
  }, [navigate]);

  const handleLogout = () => {
    sessionStorage.removeItem("adminAuth");
    navigate("/admin");
  };

  const stats = [
    {
      icon: Calendar,
      label: t("admin.dashboard.stats.events"),
      value: mockEvents.length,
      color: "#2B5F9E",
      trend: "+2",
    },
    {
      icon: Newspaper,
      label: t("admin.dashboard.stats.news"),
      value: mockNews.length,
      color: "#6BA868",
      trend: "+1",
    },
    {
      icon: Users,
      label: t("admin.dashboard.stats.members"),
      value: 5,
      color: "#EB8C3A",
      trend: "+5",
    },
    {
      icon: UserCheck,
      label: t("admin.dashboard.stats.registrations"),
      value: 12,
      color: "#8B5CF6",
      trend: "+3",
    },
  ];

  const managementSections = [
    {
      icon: Calendar,
      title: t("admin.nav.events"),
      description:
        language === "zh"
          ? "管理活动发布、报名统计、活动更新"
          : "Manage event publishing, registration stats, updates",
      color: "#2B5F9E",
    },
    {
      icon: Newspaper,
      title: t("admin.nav.news"),
      description:
        language === "zh"
          ? "发布新闻、编辑内容、管理分类"
          : "Publish news, edit content, manage categories",
      color: "#6BA868",
    },
    {
      icon: Users,
      title: t("admin.nav.members"),
      description:
        language === "zh"
          ? "审核会员申请、管理会员信息"
          : "Review membership applications, manage member info",
      color: "#EB8C3A",
    },
    {
      icon: Settings,
      title: t("admin.nav.settings"),
      description:
        language === "zh"
          ? "网站设置、账号管理、权限配置"
          : "Site settings, account management, permissions",
      color: "#8B5CF6",
    },
  ];

  const recentActivities = [
    {
      type: "registration",
      user: "John Smith",
      action:
        language === "zh"
          ? '报名了"元宵节庆祝活动"'
          : 'registered for "Lantern Festival"',
      time: "2 hours ago",
    },
    {
      type: "member",
      user: "Wei Li",
      action:
        language === "zh"
          ? "提交了会员申请"
          : "submitted membership application",
      time: "5 hours ago",
    },
    {
      type: "news",
      user: "Admin",
      action:
        language === "zh"
          ? '发布了新闻"多元文化艺术展览"'
          : 'published "Multicultural Art Exhibition"',
      time: "1 day ago",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-[#2B5F9E]">{t("admin.dashboard.title")}</h1>
            <motion.button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-[#2B5F9E] transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <LogOut className="w-4 h-4" />
              {t("admin.logout")}
            </motion.button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Message */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h2 className="text-gray-900 mb-2">
            {t("admin.dashboard.welcome")}, Admin
          </h2>
          <p className="text-gray-600">
            {language === "zh"
              ? "这是管理仪表盘的原型界面，展示核心管理功能模块"
              : "This is the prototype admin dashboard showcasing core management modules"}
          </p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -4 }}
              className="bg-white rounded-xl p-6 shadow-lg"
            >
              <div className="flex items-center justify-between mb-4">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: `${stat.color}20` }}
                >
                  <stat.icon
                    className="w-6 h-6"
                    style={{ color: stat.color }}
                  />
                </div>
                <div className="flex items-center gap-1 text-sm text-[#6BA868]">
                  <TrendingUp className="w-4 h-4" />
                  <span>{stat.trend}</span>
                </div>
              </div>
              <p className="text-gray-600 text-sm mb-1">{stat.label}</p>
              <p className="text-3xl" style={{ color: stat.color }}>
                {stat.value}
              </p>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Management Sections */}
          <div className="lg:col-span-2">
            <h3 className="text-gray-900 mb-4">
              {language === "zh" ? "管理模块" : "Management Modules"}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {managementSections.map((section, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                  whileHover={{ scale: 1.02 }}
                  className="bg-white rounded-xl p-6 shadow-lg cursor-pointer hover:shadow-xl transition-shadow"
                >
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center mb-4"
                    style={{ backgroundColor: `${section.color}20` }}
                  >
                    <section.icon
                      className="w-6 h-6"
                      style={{ color: section.color }}
                    />
                  </div>
                  <h3 className="text-gray-900 mb-2">{section.title}</h3>
                  <p className="text-gray-600 text-sm">{section.description}</p>
                  <div
                    className="mt-4 text-sm"
                    style={{ color: section.color }}
                  >
                    {language === "zh" ? "进入管理 →" : "Manage →"}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div>
            <h3 className="text-gray-900 mb-4">
              {language === "zh" ? "最近活动" : "Recent Activity"}
            </h3>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.8 }}
              className="bg-white rounded-xl shadow-lg p-6"
            >
              <div className="space-y-4">
                {recentActivities.map((activity, index) => (
                  <div
                    key={index}
                    className="flex gap-3 pb-4 border-b last:border-b-0 last:pb-0"
                  >
                    <div className="w-10 h-10 bg-[#F5EFE6] rounded-full flex items-center justify-center flex-shrink-0">
                      {activity.type === "registration" && (
                        <Calendar className="w-5 h-5 text-[#2B5F9E]" />
                      )}
                      {activity.type === "member" && (
                        <Users className="w-5 h-5 text-[#EB8C3A]" />
                      )}
                      {activity.type === "news" && (
                        <Newspaper className="w-5 h-5 text-[#6BA868]" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-gray-900 text-sm">
                        <strong>{activity.user}</strong> {activity.action}
                      </p>
                      <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                        <Clock className="w-3 h-3" />
                        <span>{activity.time}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>

        {/* Integration Notes */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-6"
        >
          <h3 className="text-[#2B5F9E] mb-3">
            {language === "zh" ? "系统集成说明" : "System Integration Notes"}
          </h3>
          <ul className="space-y-2 text-sm text-gray-700">
            <li>
              •{" "}
              {language === "zh"
                ? "后台将使用React + Node.js/Django构建，支持RESTful API"
                : "Backend will be built with React + Node.js/Django supporting RESTful API"}
            </li>
            <li>
              •{" "}
              {language === "zh"
                ? "内容管理将集成富文本编辑器（如TinyMCE或Quill）"
                : "Content management will integrate rich text editor (TinyMCE or Quill)"}
            </li>
            <li>
              •{" "}
              {language === "zh"
                ? "用户角色权限系统：超级管理员、内容编辑、活动协调员"
                : "User role permissions: Super Admin, Content Editor, Event Coordinator"}
            </li>
            <li>
              •{" "}
              {language === "zh"
                ? "数据导出功能：CSV/Excel格式的报名数据和统计报表"
                : "Data export: Registration data and statistics in CSV/Excel format"}
            </li>
          </ul>
        </motion.div>
      </div>
    </div>
  );
}
