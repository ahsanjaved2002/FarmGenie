import React from "react";
import { useTranslation } from "react-i18next";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X, User, LogOut } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import appLogo from "../../images/appLogo.png";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [isProfileOpen, setIsProfileOpen] = React.useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation("common");
  const profileRef = React.useRef(null);

  const isRtl = i18n.language?.startsWith("ur");
  React.useEffect(() => {
    const html = document.documentElement;
    html.setAttribute("dir", isRtl ? "rtl" : "ltr");
    html.setAttribute("lang", i18n.language || "en");
  }, [isRtl, i18n.language]);

  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    };

    if (isProfileOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isProfileOpen]);

  const handleLogout = () => {
    logout();
    setIsProfileOpen(false);
    setIsMenuOpen(false);
    navigate("/login");
  };

  const navigation = [
    { name: t("home"), href: "/" },
    { name: t("rentals"), href: "/rentals" },
    { name: t("bidding"), href: "/bidding" },
    { name: t("marketplace"), href: "/marketplace" },
    { name: t("chatbot"), href: "/chatbot" },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <header className="bg-emerald-900 text-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link
            to="/"
            className={`flex items-center group ${
              isRtl ? "space-x-reverse space-x-2" : "space-x-2"
            }`}
          >
            <img
              src={appLogo}
              alt={t("appName")}
              className="h-14 w-auto bg-transparent object-contain"
            />
          </Link>

          {/* Desktop Navigation */}
          <nav
            className={`hidden md:flex space-x-4 ${
              isRtl ? "space-x-reverse" : ""
            }`}
          >
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`px-3 py-2 rounded-md text-xl font-medium transition-all duration-200 ${
                  isActive(item.href)
                    ? "text-amber-100 bg-green-600"
                    : "text-amber-100 hover:text-white hover:bg-green-700"
                }`}
              >
                {item.name}
              </Link>
            ))}{" "}
          </nav>

          {/* User Menu */}
          <div
            className={`hidden md:flex items-center ${
              isRtl ? "space-x-reverse space-x-2" : "space-x-2"
            }`}
          >
            <button
              onClick={() =>
                i18n.changeLanguage(
                  i18n.language?.startsWith("ur") ? "en" : "ur"
                )
              }
              className="px-3 py-2 rounded-md text-xl font-medium bg-green-600 text-amber-100 hover:bg-green-700 hover:text-white transition-colors"
            >
              {t("langToggle")}
            </button>
            {user ? (
              <div className="relative" ref={profileRef}>
                <button
                  onClick={() => {
                    console.log('Profile button clicked');
                    setIsProfileOpen(!isProfileOpen);
                  }}
                  className="flex items-center justify-center w-10 h-10 rounded-full bg-green-600 text-amber-100 hover:bg-green-700 hover:text-white transition-colors font-semibold text-lg touch-manipulation-none"
                  style={{ WebkitTapHighlightColor: 'transparent' }}
                >
                  {user.name?.charAt(0).toUpperCase()}
                </button>

                {isProfileOpen && (
                  <>
                    {/* Backdrop for mobile */}
                    <div 
                      className="fixed inset-0 bg-black/50 z-[9998] md:hidden -webkit-backdrop-blur-sm backdrop-blur-sm"
                      style={{ WebkitBackdropFilter: 'blur(4px)', backdropFilter: 'blur(4px)' }}
                      onClick={() => setIsProfileOpen(false)}
                    />
                    <div className="absolute right-auto rtl:right-auto rtl:left-0 top-full mt-2 w-80 bg-white rounded-2xl shadow-2xl py-6 z-[9999] md:z-[9999] lg:z-[9999] fixed sm:fixed md:absolute lg:absolute top-full right-auto sm:right-auto md:right-auto lg:right-auto left-0 sm:left-0 md:left-0 lg:left-0 -translate-x-64 sm:-translate-x-64 md:-translate-x-64 lg:-translate-x-64 max-h-[70vh] sm:max-h-[60vh] overflow-y-auto border-2 border-emerald-200 transform-gpu will-change-transform" 
                     style={{ 
                       maxHeight: '70vh',
                       WebkitTransform: 'translateZ(0)',
                       transform: 'translateZ(0) translateX(-16rem)'
                     }}>
                      {/* User Info Section */}
                      <div className="flex flex-col items-center mb-6">
                        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-pink-500 via-purple-500 to-blue-500 flex items-center justify-center text-white font-bold text-3xl mb-3">
                          {user.name?.charAt(0).toUpperCase()}
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          {t("greetingUser", { name: t(user.name) })}
                        </h3>
                        <p className="text-sm text-gray-600 truncate w-full text-center">{user.email}</p>
                      </div>

                      {/* Dashboard Button */}
                      <div className="px-4 mb-4">
                        <Link
                          to="/dashboard"
                          className="block w-full text-center px-4 py-2.5 text-sm font-medium text-green-600 border border-green-600 rounded-full hover:bg-green-50 transition-colors"
                          onClick={() => setIsProfileOpen(false)}
                        >
                          {t("dashboard")}
                        </Link>
                      </div>

                      {/* Action Buttons */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 px-4 mb-4">
                        <Link
                          to="/profile"
                          className="flex items-center justify-center space-x-2 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors touch-manipulation-none"
                          style={{ WebkitTapHighlightColor: 'transparent' }}
                          onClick={(e) => {
                            console.log('Profile link clicked');
                            setIsProfileOpen(false);
                          }}
                        >
                          <User className="h-5 w-5" />
                          <span className="text-sm font-medium">
                            {t("profile")}
                          </span>
                        </Link>
                        <button
                          onClick={handleLogout}
                          className="flex items-center justify-center space-x-2 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors"
                        >
                          <LogOut className="h-5 w-5" />
                          <span className="text-sm font-medium">
                            {t("signout")}
                          </span>
                        </button>
                      </div>

                      {/* Footer Links */}
                      <div className="px-4 pt-4 border-t border-gray-200">
                        <div className="flex items-center justify-center space-x-2 text-xs text-gray-500">
                          <a href="#" className="hover:text-gray-700">
                            Privacy policy
                          </a>
                          <span>•</span>
                          <a href="#" className="hover:text-gray-700">
                            Terms of Service
                          </a>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/login"
                  className="text-amber-100 hover:text-white px-4 transition-colors text-xl font-medium"
                >
                  {t("login")}
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-amber-100 hover:text-white transition-colors"
            >
              {isMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`block px-3 py-2 rounded-md text-base font-medium ${
                  isActive(item.href)
                    ? "text-green-600 bg-green-50"
                    : "text-gray-700 hover:text-green-600 hover:bg-green-50"
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}
            <button
              onClick={() =>
                i18n.changeLanguage(
                  i18n.language?.startsWith("ur") ? "en" : "ur"
                )
              }
              className="w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-green-600 hover:bg-green-50"
            >
              {t("langToggle")}
            </button>
            {user ? (
              <>
                <Link
                  to="/dashboard"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-green-600 hover:bg-green-50"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {t("dashboard")}
                </Link>
                <Link
                  to="/profile"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-green-600 hover:bg-green-50"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {t("profile")}
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-green-600 hover:bg-green-50"
                >
                  {t("signout")}
                </button>
              </>
            ) : (
              <div className="border-t pt-2">
                <Link
                  to="/login"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-green-600 hover:bg-green-50"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {t("login")}
                </Link>
                <Link
                  to="/signup"
                  className="block px-3 py-2 rounded-md text-base font-medium text-white bg-green-600 hover:bg-green-700"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {t("signup")}
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;