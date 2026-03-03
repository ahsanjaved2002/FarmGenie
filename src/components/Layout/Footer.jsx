import React from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import appLogo from "../../images/appLogo.png";
import { FaReddit } from "react-icons/fa";

import {
  Sprout,
  Mail,
  Phone,
  MapPin,
  Facebook,
  Twitter,
  Instagram,
  X,
} from "lucide-react";

const Footer = () => {
  const { t } = useTranslation("common");
  return (
    <footer className="bg-emerald-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="col-span-1 md:col-span-2">
            <Link to="/" className="inline-block mb-6">
              <img
                src={appLogo}
                alt={t("appName")}
                className="h-16 w-auto bg-transparent object-contain"
              />
            </Link>
            <p className="text-amber-100 mb-6 max-w-md">
              {t("footerTagline")}
              {t("footerTagline2")}
            </p>
            <div className="space-y-2 flex justify-between">
              <div className="flex items-center space-x-2 text-amber-100">
                <Mail className="h-4 w-4" />
                <span>farmgenie2002@gmail.com</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-bold text-amber-200 mb-4">
              {t("quickLinks")}
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/rentals"
                  className="text-amber-100 hover:text-white transition-colors"
                >
                  {t("equipmentRentals")}
                </Link>
              </li>
              <li>
                <Link
                  to="/bidding"
                  className="text-amber-100 hover:text-white transition-colors"
                >
                  {t("landBidding")}
                </Link>
              </li>
              <li>
                <Link
                  to="/marketplace"
                  className="text-amber-100 hover:text-white transition-colors"
                >
                  {t("marketplace")}
                </Link>
              </li>
              <li>
                <Link
                  to="/dashboard"
                  className="text-amber-100 hover:text-white transition-colors"
                >
                  {t("dashboard")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-lg font-bold text-amber-200 mb-4">
              {t("support")}
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/about-us"
                  className="text-amber-100 hover:text-white transition-colors"
                >
                  {t("aboutUs")}
                </Link>
              </li>

              <li>
                <Link
                  to="/contact-us"
                  className="text-amber-100 hover:text-white transition-colors"
                >
                  {t("contactUs")}
                </Link>
              </li>
              <li>
                <Link
                  to="/privacy-policy"
                  className="text-amber-100 hover:text-white transition-colors"
                >
                  {t("privacyPolicy")}
                </Link>
              </li>
              <li>
                <Link
                  to="/terms-and-services"
                  className="text-amber-100 hover:text-white transition-colors"
                >
                  {t("termsOfService")}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-amber-100 text-sm">
              © 2025 {t("brandAlt")}. {t("allRights")}
            </p>
            <div className="flex mx-4 mt-4 gap-4 md:mt-0">
              <a
                href="https://www.facebook.com/profile.php?id=61584457814968"
                target="_blank"
                className="text-amber-100 hover:text-white transition-colors"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a
                href="https://x.com/FarmGenie2002"
                target="_blank"
                className="text-amber-100 hover:text-white transition-colors"
              >
                <X className="h-5 w-5" />
              </a>
              <a
                href="https://www.instagram.com/farmgenie2002/"
                target="_blank"
                className="text-amber-100 hover:text-white transition-colors"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a
                href="https://www.reddit.com/user/Glum-Raise-4489/"
                target="_blank"
                className="text-amber-100 hover:text-white transition-colors"
              >
                <FaReddit className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
