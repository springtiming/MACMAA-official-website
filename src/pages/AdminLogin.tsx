import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../contexts/LanguageContext";
import { motion } from "motion/react";
import { Lock, User } from "lucide-react";
import logo from "figma:asset/486cb6c21a188aae71ad06b3d541eb54ff86e307.png";

export function AdminLogin() {
  const navigate = useNavigate();
  const { language, t } = useLanguage();
  const [credentials, setCredentials] = useState({
    username: "",
    password: "",
  });
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Mock authentication - support multiple test accounts
    const validAccounts = [
      { username: "owner_admin", password: "Owner@123", role: "owner" },
      { username: "zhang_admin", password: "Admin@123", role: "admin" },
      { username: "admin", password: "demo123", role: "admin" }, // Legacy account
    ];

    const account = validAccounts.find(
      (acc) =>
        acc.username === credentials.username &&
        acc.password === credentials.password
    );

    if (account) {
      // Store auth token and role (mock)
      sessionStorage.setItem("adminAuth", "true");
      sessionStorage.setItem("adminRole", account.role);
      sessionStorage.setItem("adminUsername", account.username);
      navigate("/admin/dashboard");
    } else {
      setError(
        language === "zh"
          ? "用户名或密码错误。测试账户请参考下方提示。"
          : "Invalid credentials. Please refer to test accounts below."
      );
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", delay: 0.2 }}
            className="flex justify-center mb-4"
          >
            <img src={logo} alt="MACMAA Logo" className="h-20 w-20" />
          </motion.div>
          <h1 className="text-[#2B5F9E] mb-2">{t("admin.login.title")}</h1>
          <p className="text-gray-600">MACMAA Management System</p>
        </div>

        {/* Login Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl shadow-lg p-8"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-gray-700 mb-2">
                {t("admin.login.username")}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="w-5 h-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  required
                  value={credentials.username}
                  onChange={(e) =>
                    setCredentials({ ...credentials, username: e.target.value })
                  }
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2B5F9E]"
                  placeholder="admin"
                />
              </div>
            </div>

            <div>
              <label className="block text-gray-700 mb-2">
                {t("admin.login.password")}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="w-5 h-5 text-gray-400" />
                </div>
                <input
                  type="password"
                  required
                  value={credentials.password}
                  onChange={(e) =>
                    setCredentials({ ...credentials, password: e.target.value })
                  }
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2B5F9E]"
                  placeholder="demo123"
                />
              </div>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm"
              >
                {error}
              </motion.div>
            )}

            <motion.button
              type="submit"
              className="w-full px-6 py-3 bg-[#2B5F9E] text-white rounded-lg hover:bg-[#234a7e] transition-colors"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {t("admin.login.submit")}
            </motion.button>
          </form>

          <div className="mt-6 p-4 bg-[#F5EFE6] rounded-lg text-sm text-gray-700">
            <p className="mb-3">
              <strong>
                {language === "zh" ? "测试账户：" : "Test Accounts:"}
              </strong>
            </p>
            <div className="space-y-3">
              <div className="border-b border-[#EB8C3A]/30 pb-2">
                <p className="text-[#EB8C3A] mb-1">
                  👑 {language === "zh" ? "站长账户" : "Owner Account"}
                </p>
                <p className="ml-4 text-xs">
                  {t("admin.login.username")}: <strong>owner_admin</strong>
                </p>
                <p className="ml-4 text-xs">
                  {t("admin.login.password")}: <strong>Owner@123</strong>
                </p>
              </div>
              <div>
                <p className="text-[#6BA868] mb-1">
                  👤 {language === "zh" ? "管理员账户" : "Admin Account"}
                </p>
                <p className="ml-4 text-xs">
                  {t("admin.login.username")}: <strong>zhang_admin</strong>{" "}
                  {language === "zh" ? "或" : "or"} <strong>admin</strong>
                </p>
                <p className="ml-4 text-xs">
                  {t("admin.login.password")}: <strong>Admin@123</strong>{" "}
                  {language === "zh" ? "或" : "or"} <strong>demo123</strong>
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
