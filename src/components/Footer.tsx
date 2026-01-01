import { useLanguage } from "../contexts/LanguageContext";
import {
  Mail,
  Phone,
  MapPin,
  Facebook,
  Twitter,
  Instagram,
} from "lucide-react";

const logoUrl = "/assets/486cb6c21a188aae71ad06b3d541eb54ff86e307.png";

export function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="bg-[#2B5F9E] text-white mt-12 sm:mt-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {/* Logo & Description */}
          <div>
            <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
              <img
                src={logoUrl}
                alt="MACMAA Logo"
                className="h-10 w-10 sm:h-12 sm:w-12 bg-white rounded-full p-1"
              />
              <span className="text-lg sm:text-xl">MACMAA</span>
            </div>
            <p className="text-blue-100 text-xs sm:text-sm">
              {t("home.hero.subtitle")}
            </p>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="mb-3 sm:mb-4 text-base sm:text-lg">
              {t("footer.contact")}
            </h3>
            <div className="space-y-2 sm:space-y-3 text-xs sm:text-sm text-blue-100">
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
                <span>macmaa112025@gmail.com</span>
              </div>
              <div className="flex items-start gap-2">
                <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0 mt-0.5" />
                <span>293-297 Manningham Rd, Templestowe Lower VIC 3107</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
                <span>0451 727 631</span>
              </div>
            </div>
          </div>

          {/* Social Media */}
          <div>
            <h3 className="mb-3 sm:mb-4 text-base sm:text-lg">
              {t("footer.follow")}
            </h3>
            <div className="flex gap-3 sm:gap-4">
              <a
                href="#"
                className="w-9 h-9 sm:w-10 sm:h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors"
              >
                <Facebook className="w-4 h-4 sm:w-5 sm:h-5" />
              </a>
              <a
                href="#"
                className="w-9 h-9 sm:w-10 sm:h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors"
              >
                <Twitter className="w-4 h-4 sm:w-5 sm:h-5" />
              </a>
              <a
                href="#"
                className="w-9 h-9 sm:w-10 sm:h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors"
              >
                <Instagram className="w-4 h-4 sm:w-5 sm:h-5" />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-white/20 mt-6 sm:mt-8 pt-6 sm:pt-8 text-center text-xs sm:text-sm text-blue-100">
          <p>{t("footer.rights")}</p>
        </div>
      </div>
    </footer>
  );
}
