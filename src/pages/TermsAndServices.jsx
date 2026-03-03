import React from "react";
import {
  FileCheck,
  Scale,
  UserCheck,
  Server,
  Copyright,
  AlertTriangle,
  XCircle,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import { useTranslation } from "react-i18next";

const TermsAndServices = () => {
  const { t } = useTranslation("common");

  const sections = [
    {
      icon: FileCheck,
      title: t("termsSection1Title"),
      content: t("termsSection1Content"),
    },
    {
      icon: Scale,
      title: t("termsSection2Title"),
      content: t("termsSection2Content"),
    },
    {
      icon: UserCheck,
      title: t("termsSection3Title"),
      content: t("termsSection3Content"),
    },
    {
      icon: Server,
      title: t("termsSection4Title"),
      content: t("termsSection4Content"),
    },
    {
      icon: Copyright,
      title: t("termsSection5Title"),
      content: t("termsSection5Content"),
    },
    {
      icon: AlertTriangle,
      title: t("termsSection6Title"),
      content: t("termsSection6Content"),
    },
    {
      icon: XCircle,
      title: t("termsSection7Title"),
      content: t("termsSection7Content"),
    },
    {
      icon: RefreshCw,
      title: t("termsSection8Title"),
      content: t("termsSection8Content"),
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-green-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Compact Header */}
        <div className="text-center mb-8 pt-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <FileCheck className="h-8 w-8 text-emerald-600 animate-pulse" />
            <h1 className="text-4xl leading-[1.5] md:text-5xl md:leading-[1.5] font-bold bg-gradient-to-r from-emerald-700 to-green-600 bg-clip-text text-transparent">
              {t("termsAndServicesTitle")}
            </h1>
          </div>
          <p className="text-gray-700 max-w-3xl mx-auto leading-relaxed">
            {t("termsAndServicesSubtitle")}
          </p>
        </div>

        {/* Terms Sections Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {sections.map((section, index) => (
            <div
              key={index}
              className="group relative p-6 rounded-3xl bg-white border-2 border-emerald-200 hover:border-emerald-400 hover:shadow-xl transition-all duration-300 hover:-translate-y-2 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/50 to-green-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative">
                <div
                  className={`inline-flex p-4 rounded-xl bg-gradient-to-br from-emerald-400 to-green-500 mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg`}
                >
                  <section.icon className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-emerald-600 transition-colors">
                  {index + 1}. {section.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {section.content}
                </p>
              </div>
              <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-400 to-green-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TermsAndServices;
