import React, { useState } from "react";
import {
  Mail,
  Phone,
  MapPin,
  Send,
  MessageSquare,
  Sparkles,
} from "lucide-react";
import { useTranslation } from "react-i18next";

const ContactUs = () => {
  const { t } = useTranslation("common");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert(t("contactMessageSuccess"));
    setFormData({ name: "", email: "", message: "" });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-green-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Compact Header */}
        <div className="text-center mb-8 pt-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <MessageSquare className="h-8 w-8 text-emerald-600 animate-pulse" />
            <h1 className="text-4xl leading-[1.5] md:text-5xl md:leading-[1.5] font-bold bg-gradient-to-r from-emerald-700 to-green-600 bg-clip-text text-transparent">
              {t("contactUsTitle")}
            </h1>
          </div>
          <p className="text-gray-700 max-w-2xl mx-auto leading-relaxed">
            {t("contactUsSubtitle")}
          </p>
        </div>

        {/* Contact Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 max-w-4xl mx-auto">
          <div className="group relative p-6 rounded-3xl bg-white border-2 border-emerald-200 hover:border-emerald-400 hover:shadow-xl transition-all duration-300 hover:-translate-y-2 overflow-hidden text-center">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/50 to-green-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative">
              <div className="inline-flex p-4 rounded-xl bg-gradient-to-br from-emerald-400 to-green-500 mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <Mail className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-emerald-600 transition-colors">
                {t("contactEmailUsTitle")}
              </h3>
              <p className="text-gray-600 font-medium">
                farmgenie2002@gmail.com
              </p>
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-400 to-green-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
          </div>

          <div className="group relative p-6 rounded-3xl bg-white border-2 border-emerald-200 hover:border-emerald-400 hover:shadow-xl transition-all duration-300 hover:-translate-y-2 overflow-hidden text-center">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/50 to-green-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative">
              <div className="inline-flex p-4 rounded-xl bg-gradient-to-br from-emerald-400 to-green-500 mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <MapPin className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-emerald-600 transition-colors">
                {t("contactVisitUsTitle")}
              </h3>
              <p className="text-gray-600 font-medium">
                {t("contactLocation")}
              </p>
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-400 to-green-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-3xl shadow-2xl border-2 border-emerald-200 p-8">
            <div className="text-center mb-6">
              <h2 className="text-3xl leading-[1.5] font-bold bg-gradient-to-r from-emerald-700 to-green-600 bg-clip-text text-transparent mb-2">
                {t("contactFormTitle")}
              </h2>
              <p className="text-gray-600">{t("contactFormSubtitle")}</p>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  {t("contactNameLabel")}
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-2 border-emerald-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors bg-white"
                  placeholder={t("contactNamePlaceholder")}
                />
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  {t("contactEmailLabel")}
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-2 border-emerald-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors bg-white"
                  placeholder={t("contactEmailPlaceholder")}
                />
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  {t("contactMessageLabel")}
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows={5}
                  className="w-full px-4 py-3 border-2 border-emerald-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors bg-white resize-none"
                  placeholder={t("contactMessagePlaceholder")}
                ></textarea>
              </div>

              <button
                onClick={handleSubmit}
                className="w-full bg-gradient-to-r from-emerald-500 to-green-600 text-white py-4 px-6 rounded-xl hover:from-emerald-600 hover:to-green-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transition-all font-bold text-lg shadow-lg hover:shadow-xl hover:scale-[1.02] flex items-center justify-center gap-2"
              >
                <Send className="h-5 w-5" />
                {t("contactSendButton")}
              </button>
            </div>
          </div>
        </div>

        {/* Additional Help Section */}
        <div className="mt-8 bg-gradient-to-r from-emerald-500 to-green-600 rounded-3xl p-8 shadow-xl text-center">
          <Sparkles className="h-12 w-12 text-white mx-auto mb-4 animate-pulse" />
          <h3 className="text-2xl font-bold text-white mb-3">
            {t("contactImmediateTitle")}
          </h3>
          <p className="text-green-100 mb-6 max-w-2xl mx-auto">
            {t("contactImmediateSubtitle")}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="mailto:farmgenie2002@gmail.com"
              className="bg-white text-emerald-600 px-6 py-3 rounded-xl font-bold hover:bg-green-50 transition-all inline-flex items-center justify-center shadow-lg hover:scale-105"
            >
              <Mail className="h-5 w-5 mr-2" />
              {t("contactEmailSupportButton")}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactUs;
