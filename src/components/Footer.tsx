import { useLanguage } from "../contexts/LanguageContext";
import {
  Mail,
  Phone,
  MapPin,
  Facebook,
  Twitter,
  Instagram,
} from "lucide-react";
import logo from "figma:asset/486cb6c21a188aae71ad06b3d541eb54ff86e307.png";

export function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="bg-[#2B5F9E] text-white mt-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Logo & Description */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <img
                src={logo}
                alt="MACMAA Logo"
                className="h-12 w-12 bg-white rounded-full p-1"
              />
              <span>MACMAA</span>
            </div>
            <p className="text-blue-100 text-sm">{t("home.hero.subtitle")}</p>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="mb-4">{t("footer.contact")}</h3>
            <div className="space-y-3 text-sm text-blue-100">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                <span>info@vmca.org</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                <span>293-297 Manningham Rd, Templestowe Lower VIC 3107</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                <span>0451 727 631</span>
              </div>
            </div>
          </div>

          {/* Social Media */}
          <div>
            <h3 className="mb-4">{t("footer.follow")}</h3>
            <div className="flex gap-4">
              <a
                href="#"
                className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors"
              >
                <Twitter className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors"
              >
                <Instagram className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-white/20 mt-8 pt-8 text-center text-sm text-blue-100">
          <p>{t("footer.rights")}</p>
        </div>
      </div>
    </footer>
  );
}
