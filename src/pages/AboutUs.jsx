import React from "react";
import {
  Leaf,
  Sprout,
  Users,
  Sparkles,
  Target,
  Eye,
  Shield,
  TrendingUp,
  Heart,
  Zap,
} from "lucide-react";
import { useTranslation } from "react-i18next";

export default function AboutUs() {
  const { t } = useTranslation("common");

  const values = [
    {
      icon: Sprout,
      title: t("value1Title"),
      description: t("value1Description"),
    },
    {
      icon: Users,
      title: t("value2Title"),
      description: t("value2Description"),
    },
    {
      icon: Sparkles,
      title: t("value3Title"),
      description: t("value3Description"),
    },
  ];

  const features = [
    {
      icon: Shield,
      title: t("feature1Title"),
      description: t("feature1Description"),
    },
    {
      icon: TrendingUp,
      title: t("feature2Title"),
      description: t("feature2Description"),
    },
    {
      icon: Heart,
      title: t("feature3Title"),
      description: t("feature3Description"),
    },
    {
      icon: Zap,
      title: t("feature4Title"),
      description: t("feature4Description"),
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-green-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Compact Hero */}
        <div className="text-center mb-12 pt-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Leaf className="h-8 w-8 text-emerald-600 animate-pulse" />
            <h1 className="text-4xl leading-[1.5] md:text-5xl md:leading-[1.5] font-bold bg-gradient-to-r from-emerald-700 to-green-600 bg-clip-text text-transparent">
              {t("aboutTitle")}
            </h1>
          </div>
          <p className="text-gray-700 max-w-3xl mx-auto leading-relaxed">
            {t("aboutSubtitle")}
          </p>
        </div>

        {/* Mission & Vision Grid */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Mission */}
          <div className="bg-white rounded-3xl border-2 border-emerald-200 p-8 hover:border-emerald-400 hover:shadow-xl transition-all">
            <div className="flex items-center gap-3 mb-4">
              <Target className="h-8 w-8 text-emerald-600" />
              <h2 className="text-2xl font-bold bg-gradient-to-r from-emerald-700 to-green-600 bg-clip-text text-transparent">
                {t("missionTitle")}
              </h2>
            </div>
            <div className="space-y-3 text-gray-700 leading-relaxed">
              <p>
                {t("missionText1")}{" "}
                <span className="font-bold text-emerald-700">
                  {t("missionHighlight")}
                </span>{" "}
                {t("missionText2")}
              </p>
              <p className="text-sm">{t("missionText3")}</p>
            </div>
          </div>

          {/* Vision */}
          <div className="bg-white rounded-3xl border-2 border-emerald-200 p-8 hover:border-emerald-400 hover:shadow-xl transition-all">
            <div className="flex items-center gap-3 mb-4">
              <Eye className="h-8 w-8 text-emerald-600" />
              <h2 className="text-2xl font-bold bg-gradient-to-r from-emerald-700 to-green-600 bg-clip-text text-transparent">
                {t("visionTitle")}
              </h2>
            </div>
            <div className="space-y-3 text-gray-700 leading-relaxed">
              <p>
                {t("visionText1")}{" "}
                <span className="font-bold text-emerald-700">
                  {t("visionHighlight")}
                </span>
                {t("visionText2")}
              </p>
              <p className="text-sm">{t("visionText3")}</p>
            </div>
          </div>
        </div>

        {/* Core Values */}
        <div className="mb-8">
          <h2 className="text-3xl leading-[1.4] font-bold bg-gradient-to-r from-emerald-700 to-green-600 bg-clip-text text-transparent text-center mb-6">
            {t("coreValuesTitle")}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {values.map((value, index) => (
              <div
                key={index}
                className="group relative p-6 rounded-3xl bg-white border-2 border-emerald-200 hover:border-emerald-400 hover:shadow-xl transition-all duration-300 hover:-translate-y-2 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/50 to-green-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative">
                  <div
                    className={`inline-flex p-4 rounded-xl bg-gradient-to-br from-emerald-400 to-green-500 mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg`}
                  >
                    <value.icon className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-emerald-600 transition-colors">
                    {value.title}
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {value.description}
                  </p>
                </div>
                <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-400 to-green-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
              </div>
            ))}
          </div>
        </div>

        {/* Compact Features */}
        <div className="bg-gradient-to-r from-emerald-500 to-green-600 rounded-3xl p-8 shadow-xl mb-8">
          <h2 className="text-3xl font-bold text-white text-center mb-6">
            {t("whyChooseTitle")}
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-white/10 backdrop-blur-sm p-4 rounded-xl border border-white/20 hover:bg-white/20 transition-all text-center"
              >
                <div className="bg-white rounded-lg p-3 inline-flex mb-3">
                  <feature.icon className="h-6 w-6 text-emerald-600" />
                </div>
                <h3 className="text-sm font-bold text-white mb-1">
                  {feature.title}
                </h3>
                <p className="text-xs text-green-100">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
