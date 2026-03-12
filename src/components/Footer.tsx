import { useState, useRef, useEffect } from "react";
import { useLanguage } from "../contexts/LanguageContext";
import { organization } from "../lib/seo/config";
import { Mail, Phone, MapPin, X } from "lucide-react";

const logoUrl = "/assets/486cb6c21a188aae71ad06b3d541eb54ff86e307.png";
const wechatQrcodeUrl = "/assets/wechat-qrcode.png";

function WeChatIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M8.691 2.188C3.891 2.188 0 5.476 0 9.53c0 2.212 1.17 4.203 3.002 5.55a.59.59 0 0 1 .213.665l-.39 1.48c-.019.07-.048.141-.048.213 0 .163.13.295.29.295a.326.326 0 0 0 .167-.054l1.903-1.114a.864.864 0 0 1 .717-.098 10.16 10.16 0 0 0 2.837.403c.276 0 .543-.027.811-.05a6.329 6.329 0 0 1-.261-1.786c0-3.725 3.413-6.75 7.621-6.75.254 0 .503.015.75.04C16.593 4.455 12.97 2.188 8.691 2.188zM5.785 5.991a1.1 1.1 0 1 1 0 2.2 1.1 1.1 0 0 1 0-2.2zm5.812 0a1.1 1.1 0 1 1 0 2.2 1.1 1.1 0 0 1 0-2.2zm3.265 4.643c-3.712 0-6.726 2.641-6.726 5.898 0 3.258 3.014 5.898 6.726 5.898a8.2 8.2 0 0 0 2.347-.34.723.723 0 0 1 .59.083l1.558.912a.272.272 0 0 0 .138.045c.133 0 .24-.108.24-.243 0-.06-.023-.118-.038-.174l-.322-1.218a.484.484 0 0 1 .175-.546c1.516-1.112 2.484-2.762 2.484-4.585 0-3.17-3.014-5.73-6.726-5.73h-.446zm-2.508 2.674a.914.914 0 1 1 0 1.828.914.914 0 0 1 0-1.828zm5.012 0a.914.914 0 1 1 0 1.828.914.914 0 0 1 0-1.828z" />
    </svg>
  );
}

export function Footer() {
  const { t } = useLanguage();
  const [showQrCode, setShowQrCode] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!showQrCode) return;
    function handleClickOutside(e: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setShowQrCode(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showQrCode]);

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
                <span>{organization.email}</span>
              </div>
              <div className="flex items-start gap-2">
                <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0 mt-0.5" />
                <span>
                  {organization.address?.streetAddress}, {organization.address?.addressLocality} {organization.address?.addressRegion} {organization.address?.postalCode}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
                <span>{organization.telephone}</span>
              </div>
            </div>
          </div>

          {/* WeChat */}
          <div>
            <h3 className="mb-3 sm:mb-4 text-base sm:text-lg">
              {t("footer.follow")}
            </h3>
            <div className="relative" ref={popoverRef}>
              <button
                onClick={() => setShowQrCode((v) => !v)}
                className="w-9 h-9 sm:w-10 sm:h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors"
                aria-label="WeChat"
              >
                <WeChatIcon className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
              {showQrCode && (
                <div className="absolute bottom-full mb-3 left-0 bg-white rounded-xl shadow-2xl p-4 w-56 z-50">
                  <button
                    onClick={() => setShowQrCode(false)}
                    className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  <img
                    src={wechatQrcodeUrl}
                    alt="WeChat QR Code"
                    className="w-full rounded-lg"
                  />
                  <p className="text-gray-700 text-xs text-center mt-2 leading-relaxed">
                    {t("footer.wechat.scan")}
                  </p>
                </div>
              )}
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
