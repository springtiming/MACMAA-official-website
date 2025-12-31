import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { motion } from "motion/react";
import { Lock, User } from "lucide-react";
import logo from "figma:asset/486cb6c21a188aae71ad06b3d541eb54ff86e307.png";
import { adminAuthLogin } from "@/lib/supabaseApi";
import { setToken } from "@/lib/tokenStorage";

export function AdminLogin() {
  const navigate = useNavigate();
  const { language, t } = useLanguage();
  const [credentials, setCredentials] = useState({
    username: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    setError("");

    if (!credentials.username || !credentials.password) {
      setError(
        language === "zh" ? "请输入用户名和密码" : "Enter username and password"
      );
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await adminAuthLogin(credentials);
      // 存储token
      setToken(response.token);
      // 临时存储username以便getCurrentAdmin使用（未来可以从token解析）
      sessionStorage.setItem("adminUsername", response.admin.username);
      navigate("/admin/dashboard");
    } catch (err) {
      const message =
        (err as Error)?.message === "invalid-credentials"
          ? language === "zh"
            ? "用户名或密码错误"
            : "Invalid username or password"
          : language === "zh"
            ? "登录失败，请稍后再试"
            : "Login failed, please try again";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 bg-gray-50">
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
                  placeholder={t("admin.login.username")}
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
                  placeholder={t("admin.login.password")}
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
              disabled={isSubmitting}
              className={`w-full px-6 py-3 rounded-lg text-white transition-colors ${
                isSubmitting
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-[#2B5F9E] hover:bg-[#234a7e]"
              }`}
              whileHover={isSubmitting ? undefined : { scale: 1.02 }}
              whileTap={isSubmitting ? undefined : { scale: 0.98 }}
            >
              {isSubmitting
                ? t("admin.login.processing")
                : t("admin.login.submit")}
            </motion.button>
          </form>
        </motion.div>
      </motion.div>
    </div>
  );
}
