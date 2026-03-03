import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTranslation } from "react-i18next";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Lock,
  UserPlus,
  Sparkles,
  ArrowRight,
  AlertCircle,
  Eye,
  EyeOff,
} from "lucide-react";

const Signup = () => {
  const { signup, isLoading } = useAuth();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation("common");

  // RTL layout effect
  useEffect(() => {
    const html = document.documentElement;
    const isRtl = i18n.language?.startsWith("ur");
    html.setAttribute("dir", isRtl ? "rtl" : "ltr");
    html.setAttribute("lang", i18n.language || "en");
  }, [i18n.language]);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    location: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Name validation - only alphabets allowed
    if (name === 'name') {
      const alphabetOnlyValue = value.replace(/[^a-zA-Z\s]/g, '');
      setFormData({ ...formData, [name]: alphabetOnlyValue });
    }
    // Location validation - only alphabets allowed
    else if (name === 'location') {
      const alphabetOnlyValue = value.replace(/[^a-zA-Z\s]/g, '');
      setFormData({ ...formData, [name]: alphabetOnlyValue });
    }
    // Password validation - no spaces allowed
    else if (name === 'password') {
      const noSpacesValue = value.replace(/\s/g, '');
      setFormData({ ...formData, [name]: noSpacesValue });
    }
    // Confirm password validation - no spaces allowed
    else if (name === 'confirmPassword') {
      const noSpacesValue = value.replace(/\s/g, '');
      setFormData({ ...formData, [name]: noSpacesValue });
    }
    // Phone validation - only numbers allowed, max 11 digits
    else if (name === 'phone') {
      const numbersOnlyValue = value.replace(/[^0-9]/g, '').slice(0, 11);
      setFormData({ ...formData, [name]: numbersOnlyValue });
    }
    // Email and other fields - normal handling
    else {
      setFormData({ ...formData, [name]: value });
    }
    
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name) newErrors.name = t("nameRequired");
    
    // Email validation with Google Gmail criteria
    if (!formData.email) {
      newErrors.email = t("emailRequired");
    } else {
      // Google Gmail criteria:
      // - 1-30 characters total
      // - Letters, numbers, and dots allowed
      // - Cannot start or end with dot
      // - Cannot have consecutive dots
      // - Must end with @gmail.com
      const gmailPattern = /^[a-z][a-z0-9.]{0,28}@gmail\.com$/;
      
      // Additional checks for Gmail rules
      const username = formData.email.split('@')[0];
      const hasConsecutiveDots = /\.\./.test(username);
      const startsOrEndsWithDot = username.startsWith('.') || username.endsWith('.');
      
      if (!gmailPattern.test(formData.email) || hasConsecutiveDots || startsOrEndsWithDot) {
        newErrors.email = "Must be valid Gmail address (1-30 chars, letters/numbers/dots, no consecutive dots, end with @gmail.com)";
      }
    }
    
    if (!formData.password) {
      newErrors.password = t("passwordRequired");
    } else if (formData.password.length < 8) {
      newErrors.password = t("passwordMinLength");
    } else if (formData.password.length > 50) {
      newErrors.password = t("passwordMaxLength");
    }
    if (formData.password !== formData.confirmPassword)
      newErrors.confirmPassword = t("passwordsDoNotMatch");
    
    // Phone validation - exactly 11 digits required if provided
    if (formData.phone && formData.phone.length !== 11) {
      newErrors.phone = "Phone number must be exactly 11 digits";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const { success, error } = await signup(
      formData.email,
      formData.password,
      formData.name,
      formData.phone,
      formData.location
    );

    if (success) {
      alert(t("accountCreated"));
      navigate("/login");
    } else {
      setErrors({ email: error });
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-emerald-500 via-green-600 to-emerald-700 py-12 px-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden opacity-20">
        <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-green-300 rounded-full blur-3xl animate-pulse delay-700"></div>
      </div>

      <div className="relative bg-white p-10 rounded-3xl shadow-2xl w-full max-w-md border-2 border-emerald-200">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex p-4 bg-gradient-to-br from-emerald-400 to-green-500 rounded-2xl shadow-lg mb-4">
            <UserPlus className="h-10 w-10 text-white" />
          </div>
          <h2 className="text-3xl leading-[1.5] font-bold bg-gradient-to-r from-emerald-700 to-green-600 bg-clip-text text-transparent mb-2">
            {t("createAccount")}
          </h2>
          <p className="text-gray-600">{t("joinOurCommunity")}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name Input */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              {t("fullName")} *
            </label>
            <div className="relative">
              <User className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
              <input
                type="text"
                name="name"
                placeholder={t("fullName")}
                value={formData.name}
                onChange={handleChange}
                className={`w-full pl-12 pr-4 py-3 border-2 rounded-xl bg-gray-50 transition-all border-gray-200 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 ${
                  errors.name ? "border-red-300 bg-red-50" : ""
                }`}
              />
            </div>
            {errors.name && (
              <p className="text-red-600 text-sm mt-2 flex items-center">
                <AlertCircle className="h-4 w-4 mr-1" />
                {errors.name}
              </p>
            )}
          </div>

          {/* Email Input */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              {t("email")} *
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
              <input
                type="email"
                name="email"
                placeholder={t("emailPlaceholder")}
                inputMode="email"
                autoCapitalize="none"
                autoComplete="email"
                value={formData.email}
                onChange={handleChange}
                className={`w-full pl-12 pr-4 py-3 border-2 rounded-xl bg-gray-50 transition-all border-gray-200 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 ${
                  errors.email ? "border-red-300 bg-red-50" : ""
                }`}
              />
            </div>
            <p className="text-gray-500 text-xs mt-1">{t("emailHint")}</p>
            {errors.email && (
              <p className="text-red-600 text-sm mt-2 flex items-center">
                <AlertCircle className="h-4 w-4 mr-1" />
                {errors.email}
              </p>
            )}
          </div>

          {/* Phone Input */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              {t("phone")} ({t("optional")})
            </label>
            <div className="relative">
              <Phone className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
              <input
                type="text"
                name="phone"
                maxLength={11}
                placeholder={t("phonePlaceholder")}
                value={formData.phone}
                onChange={handleChange}
                className="w-full pl-12 pr-4 py-3 border-2 rounded-xl bg-gray-50 transition-all border-gray-200 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>
            {errors.phone && (
              <p className="text-red-600 text-sm mt-2 flex items-center">
                <AlertCircle className="h-4 w-4 mr-1" />
                {errors.phone}
              </p>
            )}
          </div>

          {/* Location Input */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              {t("location")} ({t("optional")})
            </label>
            <div className="relative">
              <MapPin className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
              <input
                type="text"
                name="location"
                placeholder={t("location")}
                value={formData.location}
                onChange={handleChange}
                className="w-full pl-12 pr-4 py-3 border-2 rounded-xl bg-gray-50 transition-all border-gray-200 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Password Input */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              {t("password")} *
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder={t("passwordPlaceholder")}
                value={formData.password}
                onChange={handleChange}
                className={`w-full pl-12 pr-12 py-3 border-2 rounded-xl bg-gray-50 transition-all border-gray-200 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 ${
                  errors.password ? "border-red-300 bg-red-50" : ""
                }`}
              />
              {formData.password && (
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-3.5 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              )}
            </div>
            {errors.password && (
              <p className="text-red-600 text-sm mt-2 flex items-center">
                <AlertCircle className="h-4 w-4 mr-1" />
                {errors.password}
              </p>
            )}
          </div>

          {/* Confirm Password Input */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              {t("confirmPassword")} *
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                placeholder={t("confirmPassword")}
                value={formData.confirmPassword}
                onChange={handleChange}
                className={`w-full pl-12 pr-12 py-3 border-2 rounded-xl bg-gray-50 transition-all border-gray-200 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 ${
                  errors.confirmPassword ? "border-red-300 bg-red-50" : ""
                }`}
              />
              {formData.confirmPassword && (
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-3.5 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              )}
            </div>
            {errors.confirmPassword && (
              <p className="text-red-600 text-sm mt-2 flex items-center">
                <AlertCircle className="h-4 w-4 mr-1" />
                {errors.confirmPassword}
              </p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-br from-emerald-500 to-green-600 text-white py-4 rounded-2xl hover:from-emerald-600 hover:to-green-700 disabled:opacity-50 disabled:cursor-not-allowed font-bold text-lg transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-[1.02] flex items-center justify-center gap-2 mt-6"
          >
            {isLoading ? (
              <>
                <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                {t("accountCreating")}
              </>
            ) : (
              <>
                <Sparkles className="h-5 w-5" />
                {t("signUp")}
              </>
            )}
          </button>
        </form>

        {/* Login Link */}
        <div className="mt-8 text-center">
          <p className="text-gray-600">
            {t("alreadyHaveAccount")}{" "}
            <Link
              to="/login"
              className="text-emerald-600 font-bold hover:text-emerald-700 transition-colors inline-flex items-center group"
            >
              {t("login")}
              <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
            </Link>
          </p>
        </div>

        {/* Decorative Elements */}
        <div className="absolute -top-2 -right-2 w-20 h-20 bg-gradient-to-br from-emerald-400 to-green-500 rounded-full blur-2xl opacity-20"></div>
        <div className="absolute -bottom-2 -left-2 w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full blur-2xl opacity-20"></div>
      </div>
    </div>
  );
};

export default Signup;
