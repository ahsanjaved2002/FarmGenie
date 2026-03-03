import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Search,
  Filter,
  Plus,
  MapPin,
  DollarSign,
  Package,
  Image,
  Sparkles,
  ShoppingBag,
  ChevronDown,
} from "lucide-react";
import { useData } from "../context/DataContext";
import { useAuth } from "../context/AuthContext";
import { useTranslation } from "react-i18next";
import translationService from "../services/translationService";

const Marketplace = () => {
  const { sales } = useData();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [conditionFilter, setConditionFilter] = useState("all");
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const [isConditionDropdownOpen, setIsConditionDropdownOpen] = useState(false);
  const { t, i18n } = useTranslation("common");

  // Translation state
  const [translatedSales, setTranslatedSales] = useState([]);
  const [isTranslating, setIsTranslating] = useState(false);
  const [translationProgress, setTranslationProgress] = useState(0);

  // Translation effect
  useEffect(() => {
    let isMounted = true;

    const translateAll = async () => {
      if (!sales || sales.length === 0) {
        setTranslatedSales([]);
        setIsTranslating(false);
        return;
      }

      if (i18n.language === "en") {
        setTranslatedSales(sales);
        setIsTranslating(false);
        setTranslationProgress(0);
        return;
      }

      setIsTranslating(true);
      const targetLang = i18n.language;

      try {
        const translated = await translationService.translateArray(
          sales,
          ["title", "description", "location", "ownerName"],
          targetLang,
          (progress) => {
            if (isMounted) {
              setTranslationProgress(progress.percentage);
            }
          }
        );

        if (isMounted) {
          setTranslatedSales(translated);
          setIsTranslating(false);
          setTranslationProgress(100);
        }
      } catch (error) {
        console.error("Translation failed:", error);
        if (isMounted) {
          setTranslatedSales(sales);
          setIsTranslating(false);
        }
      }
    };

    const timer = setTimeout(translateAll, 500);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [sales, i18n.language]);

  // Use translated data
  const list = translatedSales.length > 0 ? translatedSales : sales;

  const filteredSales = list.filter((sale) => {
    const matchesSearch =
      sale.title && sale.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sale.description && sale.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      categoryFilter === "all" || sale.category === categoryFilter;
    const matchesCondition =
      conditionFilter === "all" || sale.condition === conditionFilter;

    return (
      matchesSearch && matchesCategory && matchesCondition && sale.available
    );
  });

  const categories = [
    { value: "all", label: t("categoriesAll") },
    { value: "crops", label: t("crops") },
    { value: "seeds", label: t("seeds") },
    { value: "tools", label: t("tools") },
    { value: "fertilizer", label: t("fertilizer") },
    { value: "other", label: t("other") },
  ];

  const conditions = [
    { value: "all", label: t("conditionsAll") },
    { value: "new", label: t("new") },
    { value: "used", label: t("used") },
    { value: "refurbished", label: t("refurbished") },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-green-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="h-8 w-8 text-emerald-600" />
              <h1 className="text-4xl leading-[1.5] font-bold bg-gradient-to-r from-emerald-700 to-green-600 bg-clip-text text-transparent">
                {t("marketplaceTitle")}
              </h1>
            </div>
            <p className="text-gray-600 text-lg">{t("marketplaceSubtitle")}</p>
          </div>
          {user && (
            <Link
              to="/add-sale"
              className="mt-4 md:mt-0 bg-gradient-to-br from-emerald-500 to-green-600 text-white px-6 py-3 rounded-2xl hover:from-emerald-600 hover:to-green-700 transition-all duration-300 inline-flex items-center font-semibold shadow-lg hover:shadow-xl hover:scale-105"
            >
              <Plus className="h-5 w-5 mr-2" />
              {t("listProduct")}
            </Link>
          )}
        </div>

        {/* Filters */}
        <div className="bg-white p-8 rounded-3xl shadow-xl border-2 border-emerald-200 mb-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Search */}
            <div className="relative group">
              <Search className="absolute left-4 rtl:left-auto rtl:right-4 top-4 h-5 w-5 text-emerald-600 group-focus-within:text-emerald-700 transition-colors pointer-events-none" />
              <input
                type="text"
                placeholder={t("searchProducts")}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 rtl:pl-4 rtl:pr-12 pr-4 py-3 border-2 border-emerald-200 rounded-xl focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 focus:outline-none bg-white transition-all hover:border-emerald-400 text-gray-700 font-medium text-left rtl:text-right"
              />
            </div>

            {/* Category Filter */}
            <div className="relative">
              <button
                type="button"
                onClick={() =>
                  setIsCategoryDropdownOpen(!isCategoryDropdownOpen)
                }
                className="w-full pl-12 rtl:pl-4 rtl:pr-12 pr-10 py-3 border-2 border-emerald-200 rounded-xl focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 focus:outline-none bg-white transition-all cursor-pointer hover:border-emerald-400 text-left rtl:text-right font-medium text-gray-700"
              >
                {categories.find((cat) => cat.value === categoryFilter)?.label}
              </button>
              <Filter className="absolute left-4 rtl:left-auto rtl:right-4 top-4 h-5 w-5 text-emerald-600 pointer-events-none" />
              <ChevronDown
                className={`absolute right-4 rtl:right-auto rtl:left-4 top-4 h-5 w-5 text-emerald-600 pointer-events-none transition-transform ${
                  isCategoryDropdownOpen ? "rotate-180" : ""
                }`}
              />
              {/* Dropdown Menu */}
              {isCategoryDropdownOpen && (
                <>
                  {/* Backdrop to close dropdown */}
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setIsCategoryDropdownOpen(false)}
                  />
                  {/* Options */}
                  <div className="absolute z-20 w-full mt-2 bg-white border-2 border-emerald-200 rounded-xl shadow-2xl overflow-hidden">
                    {categories.map((category) => (
                      <button
                        key={category.value}
                        type="button"
                        onClick={() => {
                          setCategoryFilter(category.value);
                          setIsCategoryDropdownOpen(false);
                        }}
                        className={`w-full px-4 py-3 text-left rtl:text-right hover:bg-gradient-to-r hover:from-emerald-50 hover:to-green-50 transition-all font-medium ${
                          categoryFilter === category.value
                            ? "bg-gradient-to-r from-emerald-50 to-green-50 text-emerald-700 border-l-4 rtl:border-l-0 rtl:border-r-4 border-emerald-600"
                            : "text-gray-700"
                        }`}
                      >
                        {category.label}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Condition Filter */}
            <div className="relative">
              <button
                type="button"
                onClick={() =>
                  setIsConditionDropdownOpen(!isConditionDropdownOpen)
                }
                className="w-full pl-12 rtl:pl-4 rtl:pr-12 pr-10 py-3 border-2 border-emerald-200 rounded-xl focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 focus:outline-none bg-white transition-all cursor-pointer hover:border-emerald-400 text-left rtl:text-right font-medium text-gray-700"
              >
                {
                  conditions.find((cond) => cond.value === conditionFilter)
                    ?.label
                }
              </button>
              <ShoppingBag className="absolute left-4 rtl:left-auto rtl:right-4 top-4 h-5 w-5 text-emerald-600 pointer-events-none" />
              <ChevronDown
                className={`absolute right-4 rtl:right-auto rtl:left-4 top-4 h-5 w-5 text-emerald-600 pointer-events-none transition-transform ${
                  isConditionDropdownOpen ? "rotate-180" : ""
                }`}
              />
              {/* Dropdown Menu */}
              {isConditionDropdownOpen && (
                <>
                  {/* Backdrop to close dropdown */}
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setIsConditionDropdownOpen(false)}
                  />
                  {/* Options */}
                  <div className="absolute z-20 w-full mt-2 bg-white border-2 border-emerald-200 rounded-xl shadow-2xl overflow-hidden">
                    {conditions.map((condition) => (
                      <button
                        key={condition.value}
                        type="button"
                        onClick={() => {
                          setConditionFilter(condition.value);
                          setIsConditionDropdownOpen(false);
                        }}
                        className={`w-full px-4 py-3 text-left rtl:text-right hover:bg-gradient-to-r hover:from-emerald-50 hover:to-green-50 transition-all font-medium ${
                          conditionFilter === condition.value
                            ? "bg-gradient-to-r from-emerald-50 to-green-50 text-emerald-700 border-l-4 rtl:border-l-0 rtl:border-r-4 border-emerald-600"
                            : "text-gray-700"
                        }`}
                      >
                        {condition.label}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-emerald-100 to-green-100 rounded-2xl p-4 inline-block">
            <p className="text-emerald-800 font-semibold">
              {isTranslating && i18n.language !== "en" && (
                <span className="mr-2">
                  {translationProgress > 0 && `${translationProgress}%`}
                </span>
              )}
              {i18n.language === "ur" ? (
                // Urdu word order
                <>
                  <span className="text-emerald-600 font-bold">
                    {filteredSales.length}
                  </span>{" "}
                  {t("of")}{" "}
                  <span className="text-emerald-600 font-bold">
                    {sales.filter((s) => s.available).length}
                  </span>{" "}
                  {t("availableProducts")} {t("showing")}
                </>
              ) : (
                // English word order
                <>
                  {t("showing")}{" "}
                  <span className="text-emerald-600 font-bold">
                    {filteredSales.length}
                  </span>{" "}
                  {t("of")}{" "}
                  <span className="text-emerald-600 font-bold">
                    {sales.filter((s) => s.available).length}
                  </span>{" "}
                  {t("availableProducts")}
                </>
              )}
            </p>
          </div>
        </div>

        {/* Products Grid */}
        {filteredSales.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredSales.map((sale) => (
              <Link
                key={sale.id}
                to={`/marketplace/${sale.id}`}
                className="group bg-white rounded-3xl shadow-lg border-2 border-emerald-200 hover:border-emerald-400 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 overflow-hidden flex flex-col"
              >
                <div className="relative aspect-w-16 aspect-h-10 overflow-hidden rounded-t-3xl">
                  <img
                    src={sale.images[0]}
                    alt={sale.title}
                    className="w-full h-56 object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  {/* Image Count Badge */}
                  {sale.images && sale.images.length > 1 && (
                    <div className="absolute top-3 right-3 bg-black/70 backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-sm font-semibold flex items-center shadow-lg">
                      <Image className="h-4 w-4 mr-1" />
                      {sale.images.length}
                    </div>
                  )}
                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>

                <div className="p-6 flex-grow">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      <span className="bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-700 text-sm font-bold px-4 py-1.5 rounded-full">
                        {sale.category}
                      </span>
                      <span
                        className={`text-sm font-bold px-4 py-1.5 rounded-full ${
                          sale.condition === "new"
                            ? "bg-gradient-to-r from-emerald-100 to-green-100 text-emerald-700"
                            : sale.condition === "used"
                            ? "bg-gradient-to-r from-yellow-100 to-amber-100 text-yellow-700"
                            : "bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700"
                        }`}
                      >
                        {sale.condition}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-emerald-600 font-bold text-sm">
                      Rs
                    </span>
                    <span className="text-emerald-600 font-bold text-2xl">
                      {sale.price.toLocaleString()}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-emerald-600 transition-colors line-clamp-1">
                    {sale.title}
                  </h3>

                  <p className="text-gray-600 text-sm mb-4 line-clamp-2 leading-relaxed">
                    {sale.description}
                  </p>

                  <div className="flex items-center text-gray-500 text-sm mb-4">
                    <MapPin className="h-4 w-4 mr-2 text-emerald-600" />
                    <span className="line-clamp-1">{sale.location}</span>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div className="flex items-center gap-1">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-green-500 flex items-center justify-center text-white font-bold text-sm mr-3">
                        {sale.ownerName?.charAt(0) || "O"}
                      </div>
                      <span
                        dir="ltr"
                        className="text-sm text-gray-600 font-medium flex items-center gap-1"
                      >
                        <span dir="rtl" className="line-clamp-1">
                          {t("by")}
                        </span>
                        <span className=" flex-1">{sale.ownerName}</span>
                      </span>
                    </div>
                    <div className="flex items-center text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full">
                      <Package className="h-4 w-4 mr-1" />
                      <span className="text-sm font-bold">
                        {t("available")}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Bottom accent bar - now properly contained */}
                <div className="h-1.5 bg-gradient-to-r from-emerald-400 to-green-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-3xl border-2 border-emerald-200">
            <div className="mb-6">
              <div className="inline-flex p-6 rounded-full bg-gradient-to-br from-emerald-100 to-green-100">
                <Search className="h-16 w-16 text-emerald-600" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">
              {t("noProductsFound")}
            </h3>
            <p className="text-gray-600 mb-8 text-lg">{t("adjustFilters")}</p>
            {user && (
              <Link
                to="/add-sale"
                className="bg-gradient-to-br from-emerald-500 to-green-600 text-white px-8 py-4 rounded-2xl hover:from-emerald-600 hover:to-green-700 transition-all duration-300 inline-flex items-center font-semibold shadow-lg hover:shadow-xl hover:scale-105"
              >
                <Plus className="h-5 w-5 mr-2" />
                {t("listYourProduct")}
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Marketplace;
