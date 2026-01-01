import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useLanguage } from "../contexts/LanguageContext";
import { motion } from "motion/react";
import { Menu, X, Globe } from "lucide-react";

const logoUrl = "/assets/486cb6c21a188aae71ad06b3d541eb54ff86e307.png";

export function Header() {
  const { language, setLanguage, t } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const router = useRouter();

  const navItems = [
    { path: "/", label: t("nav.home") },
    { path: "/about", label: t("nav.about") },
    { path: "/news", label: t("nav.news") },
    { path: "/events", label: t("nav.events") },
    { path: "/membership", label: t("nav.membership") },
    { path: "/admin", label: t("nav.admin") },
  ];

  const isActive = (path: string) => {
    return router.asPath.split("?")[0] === path;
  };

  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm">
      <nav className="mx-auto max-w-7xl px-3 sm:px-4 lg:px-8">
        <div className="flex h-16 sm:h-20 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 sm:gap-3">
            <img
              src={logoUrl}
              alt="MACMAA Logo"
              className="h-12 w-12 sm:h-14 sm:w-14"
            />
            <span className="hidden sm:block text-[#2B5F9E]">
              {language === "zh" ? "MACMAA" : "MACMAA"}
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6 lg:gap-8">
            {navItems.map((item) => (
              <Link key={item.path} href={item.path} className="relative">
                <motion.span
                  className={`text-sm lg:text-base transition-colors ${
                    isActive(item.path)
                      ? "text-[#2B5F9E]"
                      : "text-gray-700 hover:text-[#2B5F9E]"
                  }`}
                  whileHover={{ y: -2 }}
                  transition={{ duration: 0.2 }}
                >
                  {item.label}
                </motion.span>
                {isActive(item.path) && (
                  <motion.div
                    className="absolute -bottom-2 left-0 right-0 h-0.5 bg-[#2B5F9E]"
                    layoutId="underline"
                  />
                )}
              </Link>
            ))}
          </div>

          {/* Language Switcher & Mobile Menu */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Language Switcher */}
            <motion.button
              onClick={() => setLanguage(language === "zh" ? "en" : "zh")}
              className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg bg-[#F5EFE6] text-[#2B5F9E] hover:bg-[#E8DCC8] transition-colors text-sm"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Globe className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="text-xs sm:text-sm">
                {language === "zh" ? "EN" : "中文"}
              </span>
            </motion.button>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-gray-700"
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5 sm:w-6 sm:h-6" />
              ) : (
                <Menu className="w-5 h-5 sm:w-6 sm:h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden py-2 sm:py-4 border-t"
          >
            {navItems.map((item) => (
              <Link
                key={item.path}
                href={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`block py-2.5 sm:py-3 px-3 sm:px-4 text-sm sm:text-base ${
                  isActive(item.path)
                    ? "bg-[#F5EFE6] text-[#2B5F9E]"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </motion.div>
        )}
      </nav>
    </header>
  );
}
