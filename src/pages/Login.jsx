import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTranslation } from "react-i18next";
import {
  Mail,
  Lock,
  LogIn,
  Sparkles,
  ArrowRight,
  AlertCircle,
  CheckCircle,
  Eye,
  EyeOff,
} from "lucide-react";

const Login = () => {
  const { login, isLoading, resetPassword } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation("common");

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });

    if (errors[e.target.name]) {
      setErrors((prev) => ({ ...prev, [e.target.name]: "" }));
    }
    setMessage("");
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.email) newErrors.email = t("emailRequired");
    if (!formData.password) newErrors.password = t("passwordRequired");
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const { success, error } = await login(formData.email, formData.password);

    if (success) {
      navigate("/dashboard");
    } else {
      setErrors({ email: error });
    }
  };

  const handleForgotPassword = async () => {
    if (!formData.email) {
      setErrors({ email: t("pleaseEnterEmailFirst") });
      return;
    }

    const { success, error } = await resetPassword(formData.email);
    if (success) {
      setMessage(t("passwordResetSent"));
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
            <LogIn className="h-10 w-10 text-white" />
          </div>
          <h2 className="text-3xl leading-[1.6] font-bold bg-gradient-to-r from-emerald-700 to-green-600 bg-clip-text text-transparent mb-2">
            {t("loginTitle")}
          </h2>
          <p className="text-gray-600">{t("welcomeBack")}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email Input */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              {t("email")}
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-4 h-5 w-5 text-gray-400" />
              <input
                type="email"
                name="email"
                placeholder={t("emailPlaceholder")}
                value={formData.email}
                onChange={handleChange}
                className={`w-full pl-12 pr-4 py-3 border-2 rounded-xl bg-gray-50 transition-all border-gray-200 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 
    ${errors.name ? "border-red-300 bg-red-50" : ""}`}
              />
            </div>
            {errors.email && (
              <p className="text-red-600 text-sm mt-2 flex items-center">
                <AlertCircle className="h-4 w-4 mr-1" />
                {errors.email}
              </p>
            )}
          </div>

          {/* Password Input */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              {t("password")}
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-4 h-5 w-5 text-gray-400" />
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder={t("passwordPlaceholder")}
                value={formData.password}
                onChange={handleChange}
                className={`w-full pl-12 pr-12 py-3 border-2 rounded-xl bg-gray-50 transition-all border-gray-200 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 ${
                  errors.name ? "border-red-300 bg-red-50" : ""
                }`}
              />
              {formData.password && (
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 transition-colors"
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

          {/* Forgot Password */}
          <div className="text-right">
            <button
              type="button"
              onClick={handleForgotPassword}
              className="text-emerald-600 text-sm font-semibold hover:text-emerald-700 transition-colors inline-flex items-center group"
            >
              {t("forgotPassword")}
              <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          {/* Success Message */}
          {message && (
            <div className="bg-gradient-to-r from-emerald-50 to-green-50 border-2 border-emerald-200 rounded-xl p-4">
              <p className="text-emerald-700 text-sm font-semibold flex items-center">
                <CheckCircle className="h-5 w-5 mr-2" />
                {message}
              </p>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-br from-emerald-500 to-green-600 text-white py-4 rounded-2xl hover:from-emerald-600 hover:to-green-700 disabled:opacity-50 disabled:cursor-not-allowed font-bold text-lg transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-[1.02] flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                {t("loggingIn")}
              </>
            ) : (
              <>
                <Sparkles className="h-5 w-5" />
                {t("login")}
              </>
            )}
          </button>
        </form>

        {/* Sign Up Link */}
        <div className="mt-8 text-center">
          <p className="text-gray-600">
            {t("dontHaveAccount")}{" "}
            <Link
              to="/signup"
              className="text-emerald-600 font-bold hover:text-emerald-700 transition-colors inline-flex items-center group"
            >
              {t("signUp")}
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

export default Login;
