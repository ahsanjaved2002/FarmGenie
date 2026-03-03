import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTranslation } from "react-i18next";

const ProtectedRoute = ({ children }) => {
  const { user, isLoading } = useAuth();
  const { t } = useTranslation("common");

  if (isLoading) return <p>{t("loading")}</p>;

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-green-50 py-12 px-4">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl border-2 border-emerald-200 p-8 text-center">
          <div className="mb-6">
            <div className="inline-flex p-4 bg-gradient-to-br from-emerald-400 to-green-500 rounded-2xl shadow-lg mb-4">
              <div className="text-white text-4xl font-bold">🔒</div>
            </div>
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            {t("loginRequired")}
          </h2>
          
          <p className="text-gray-600 mb-6">
            {t("loginToContinue")}
          </p>
          
          <div className="space-y-4">
            <a
              href="/login"
              className="block w-full bg-gradient-to-br from-emerald-500 to-green-600 text-white px-6 py-3 rounded-xl hover:from-emerald-600 hover:to-green-700 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl text-center"
            >
              {t("login")}
            </a>
            
            <a
              href="/signup"
              className="block w-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white px-6 py-3 rounded-xl hover:from-blue-600 hover:to-indigo-700 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl text-center"
            >
              {t("signUp")}
            </a>
          </div>
        </div>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;
