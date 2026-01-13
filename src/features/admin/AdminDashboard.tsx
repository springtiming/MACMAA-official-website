import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useLanguage } from "@/contexts/LanguageContext";
import { motion } from "motion/react";
import {
  Calendar,
  Newspaper,
  Users,
  UserCheck,
  Settings,
  LogOut,
  Clock,
  Shield,
} from "lucide-react";
import {
  fetchEvents,
  fetchNewsPosts,
  fetchActivities,
  fetchMembers,
  fetchAdminEventRegistrations,
  type ActivityRecord,
} from "@/lib/supabaseApi";
import { getCurrentAdmin, logout } from "@/lib/auth";

export function AdminDashboard() {
  const router = useRouter();
  const { language, t } = useLanguage();
  const [newsCount, setNewsCount] = useState(0);
  const [eventsCount, setEventsCount] = useState(0);
  const [pendingMembersCount, setPendingMembersCount] = useState(0);
  const [recentRegistrationsCount, setRecentRegistrationsCount] = useState(0);
  const [statsError, setStatsError] = useState<string | null>(null);
  const [statsLoading, setStatsLoading] = useState(false);
  const [activities, setActivities] = useState<ActivityRecord[]>([]);
  const [activitiesLoading, setActivitiesLoading] = useState(false);
  const [activitiesError, setActivitiesError] = useState<string | null>(null);

  const admin = getCurrentAdmin();
  const adminUsername = admin?.username ?? "Admin";
  const currentUserRole = admin?.role ?? "admin";

  useEffect(() => {
    let active = true;
    setStatsLoading(true);
    Promise.all([
      fetchEvents(),
      fetchNewsPosts({ publishedOnly: false }),
      fetchMembers(),
      fetchAdminEventRegistrations(),
    ])
      .then(([events, news, members, registrations]) => {
        if (!active) return;
        setEventsCount(events.length);
        setNewsCount(news.length);
        const pendingMembers = members.filter(
          (member) => member.status === "pending"
        ).length;
        setPendingMembersCount(pendingMembers);
        const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
        const recentRegistrations = registrations.filter((registration) => {
          const ts = new Date(registration.registration_date).getTime();
          return !Number.isNaN(ts) && ts >= sevenDaysAgo;
        }).length;
        setRecentRegistrationsCount(recentRegistrations);
      })
      .catch(() => {
        if (active) setStatsError(t("common.error"));
      })
      .finally(() => {
        if (active) setStatsLoading(false);
      });

    return () => {
      active = false;
    };
  }, [t]);

  useEffect(() => {
    let active = true;
    setActivitiesLoading(true);
    fetchActivities({ limit: 5, days: 7 })
      .then((data) => {
        if (active) {
          setActivities(data);
          setActivitiesError(null);
        }
      })
      .catch(() => {
        if (active) setActivitiesError(t("common.error"));
      })
      .finally(() => {
        if (active) setActivitiesLoading(false);
      });
    return () => {
      active = false;
    };
  }, [t]);

  const handleLogout = () => {
    logout();
    router.push("/admin");
  };

  const stats = [
    {
      icon: Calendar,
      label: t("admin.dashboard.stats.events"),
      value: statsLoading ? "…" : eventsCount,
      color: "#2B5F9E",
    },
    {
      icon: Newspaper,
      label: t("admin.dashboard.stats.news"),
      value: statsLoading ? "…" : newsCount,
      color: "#6BA868",
    },
    {
      icon: Users,
      label: t("admin.dashboard.stats.members"),
      value: statsLoading ? "…" : pendingMembersCount,
      color: "#EB8C3A",
    },
    {
      icon: UserCheck,
      label: t("admin.dashboard.stats.registrations"),
      value: statsLoading ? "…" : recentRegistrationsCount,
      color: "#8B5CF6",
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
      path: "/admin/events",
    },
    {
      icon: Newspaper,
      title: t("admin.nav.news"),
      description:
        language === "zh"
          ? "发布新闻、编辑内容、管理分类"
          : "Publish news, edit content, manage categories",
      color: "#6BA868",
      path: "/admin/news",
    },
    {
      icon: Users,
      title: t("admin.nav.members"),
      description:
        language === "zh"
          ? "审核会员申请、管理会员信息"
          : "Review membership applications, manage member info",
      color: "#EB8C3A",
      path: "/admin/members",
    },
    {
      icon: Shield,
      title: t("admin.accounts.title"),
      description:
        language === "zh"
          ? "管理站长和管理员账户，配置权限"
          : "Manage owner and admin accounts, configure permissions",
      color: "#DC2626",
      path: "/admin/accounts",
    },
    {
      icon: Settings,
      title: t("admin.nav.settings"),
      description:
        language === "zh"
          ? "个人账号设置、密码修改、通知偏好"
          : "Personal account settings, password, notifications",
      color: "#8B5CF6",
      path: "/admin/settings",
    },
  ];

  const formatRelativeTime = (iso: string) => {
    const ts = new Date(iso).getTime();
    if (Number.isNaN(ts)) return "";
    const diff = Date.now() - ts;
    const mins = Math.floor(diff / (60 * 1000));
    if (mins < 1) return language === "zh" ? "刚刚" : "just now";
    if (mins < 60)
      return language === "zh"
        ? `${mins} 分钟前`
        : `${mins} minute${mins === 1 ? "" : "s"} ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24)
      return language === "zh"
        ? `${hours} 小时前`
        : `${hours} hour${hours === 1 ? "" : "s"} ago`;
    const days = Math.floor(hours / 24);
    return language === "zh"
      ? `${days} 天前`
      : `${days} day${days === 1 ? "" : "s"} ago`;
  };

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
            {t("admin.dashboard.welcome")}, {adminUsername}
          </h2>
          {statsError && (
            <p className="text-red-600 text-sm mt-2" role="alert">
              {statsError}
            </p>
          )}
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
              <div className="mb-4">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: `${stat.color}20` }}
                >
                  <stat.icon
                    className="w-6 h-6"
                    style={{ color: stat.color }}
                  />
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
              {managementSections
                .filter((section) => {
                  // Hide account management for admins, only show to owners
                  if (section.path === "/admin/accounts") {
                    return currentUserRole === "owner";
                  }
                  return true;
                })
                .map((section, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 + index * 0.1 }}
                    whileHover={{ scale: 1.02 }}
                    onClick={() => section.path && router.push(section.path)}
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
                    <p className="text-gray-600 text-sm">
                      {section.description}
                    </p>
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
                {activitiesLoading && (
                  <p className="text-gray-600 text-sm">{t("common.loading")}</p>
                )}
                {activitiesError && (
                  <p className="text-red-600 text-sm" role="alert">
                    {activitiesError}
                  </p>
                )}
                {!activitiesLoading &&
                  !activitiesError &&
                  activities.length === 0 && (
                    <p className="text-gray-500 text-sm">
                      {language === "zh"
                        ? "暂无最近活动"
                        : "No recent activity"}
                    </p>
                  )}
                {activities.map((activity) => {
                  let Icon = Newspaper;
                  let color = "#6BA868";

                  if (activity.type === "registration") {
                    Icon = Calendar;
                    color = "#2B5F9E";
                  } else if (activity.type === "member") {
                    Icon = Users;
                    color = "#EB8C3A";
                  } else if (activity.type === "event") {
                    Icon = Calendar;
                    color = "#7BA3C7";
                  }
                  const actionText =
                    language === "zh" ? activity.action.zh : activity.action.en;
                  return (
                    <div
                      key={activity.id}
                      className="flex gap-3 pb-4 border-b last:border-b-0 last:pb-0"
                    >
                      <div className="w-10 h-10 bg-[#F5EFE6] rounded-full flex items-center justify-center flex-shrink-0">
                        <Icon className="w-5 h-5" style={{ color }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-gray-900 text-sm">
                          <strong>{activity.user}</strong> {actionText}
                        </p>
                        <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                          <Clock className="w-3 h-3" />
                          <span>{formatRelativeTime(activity.timestamp)}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
