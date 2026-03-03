// src/pages/Rentals.jsx

import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Search,
  Filter,
  Plus,
  MapPin,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Sparkles,
} from "lucide-react";
import { useData } from "../context/DataContext";
import { useAuth } from "../context/AuthContext";
import { useTranslation } from "react-i18next";
import translationService from "../services/translationService"; // ← Import service

const Rentals = () => {
  const { rentals } = useData();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [locationFilter, setLocationFilter] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { t, i18n } = useTranslation("common");

  const [translatedRentals, setTranslatedRentals] = useState([]);
  const [isTranslating, setIsTranslating] = useState(false);
  const [translationProgress, setTranslationProgress] = useState(0);

  // Translation logic using centralized service
  useEffect(() => {
    let isMounted = true;

    const translateAll = async () => {
      if (!rentals || rentals.length === 0) {
        setTranslatedRentals([]);
        setIsTranslating(false);
        return;
      }

      if (i18n.language === "en") {
        setTranslatedRentals(rentals);
        setIsTranslating(false);
        setTranslationProgress(0);
        return;
      }

      setIsTranslating(true);
      const targetLang = i18n.language;

      try {
        // Use the centralized translation service
        const translated = await translationService.translateArray(
          rentals,
          ["title", "description", "location", "ownerName"],
          targetLang,
          (progress) => {
            if (isMounted) {
              setTranslationProgress(progress.percentage);
            }
          }
        );

        if (isMounted) {
          setTranslatedRentals(translated);
          setIsTranslating(false);
          setTranslationProgress(100);
        }
      } catch (error) {
        console.error("Translation failed:", error);
        if (isMounted) {
          setTranslatedRentals(rentals);
          setIsTranslating(false);
        }
      }
    };

    const timer = setTimeout(translateAll, 500);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [rentals, i18n.language]);

  const list = translatedRentals.length > 0 ? translatedRentals : rentals;

  const filteredRentals = list.filter((rental) => {
    const matchesSearch =
      rental.title && rental.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rental.description && rental.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      categoryFilter === "all" || rental.category === categoryFilter;
    const matchesLocation =
      !locationFilter ||
      (rental.location && rental.location.toLowerCase().includes(locationFilter.toLowerCase()));

    return (
      matchesSearch && matchesCategory && matchesLocation && rental.availability
    );
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-green-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="h-8 w-8 text-emerald-600" />
              <h1 className="text-4xl leading-[1.5] font-bold bg-gradient-to-r from-emerald-700 to-green-600 bg-clip-text text-transparent">
                {t("rentalsTitle")}
              </h1>
            </div>
            <p className="text-gray-600 text-lg">{t("rentalsSubtitle")}</p>
          </div>
          {user && (
            <Link
              to="/add-rental"
              className="mt-4 md:mt-0 bg-gradient-to-br from-emerald-500 to-green-600 text-white px-6 py-3 rounded-2xl hover:from-emerald-600 hover:to-green-700 transition-all duration-300 inline-flex items-center font-semibold shadow-lg hover:shadow-xl hover:scale-105"
            >
              <Plus className="h-5 w-5 mr-2" />
              {t("listEquipment")}
            </Link>
          )}
        </div>

        {/* Filters */}
        <div className="bg-white p-8 rounded-3xl shadow-xl border-2 border-emerald-200 mb-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Search */}
            <div className="relative group">
              <Search className="absolute left-4 top-4 h-5 w-5 text-emerald-600 group-focus-within:text-emerald-700 transition-colors pointer-events-none" />
              <input
                type="text"
                placeholder={t("searchEquipment")}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border-2 border-emerald-200 rounded-xl focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 focus:outline-none bg-white transition-all hover:border-emerald-400 text-gray-700 font-medium"
              />
            </div>

            {/* Category Filter */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="w-full pl-10 pr-10 px-4 py-3 border-2 border-emerald-200 rounded-xl focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 focus:outline-none bg-white transition-all cursor-pointer hover:border-emerald-400 text-left rtl:text-right font-medium text-gray-700"
              >
                {categoryFilter === "all" && t("allCategories")}
                {categoryFilter === "equipment" && t("categoryEquipment")}
                {categoryFilter === "land" && t("categoryLand")}
              </button>
              <Filter className="absolute left-4 rtl:left-auto rtl:right-4 top-4 h-5 w-5 text-emerald-600 pointer-events-none" />
              <ChevronDown
                className={`absolute right-4 rtl:right-auto rtl:left-4 top-4 h-5 w-5 text-emerald-600 pointer-events-none transition-transform ${
                  isDropdownOpen ? "rotate-180" : ""
                }`}
              />

              {isDropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setIsDropdownOpen(false)}
                  />
                  <div className="absolute z-20 w-full mt-2 bg-white border-2 border-emerald-200 rounded-xl shadow-2xl overflow-hidden">
                    <button
                      type="button"
                      onClick={() => {
                        setCategoryFilter("all");
                        setIsDropdownOpen(false);
                      }}
                      className={`w-full px-4 py-3 text-left rtl:text-right hover:bg-gradient-to-r hover:from-emerald-50 hover:to-green-50 transition-all font-medium ${
                        categoryFilter === "all"
                          ? "bg-gradient-to-r from-emerald-50 to-green-50 text-emerald-700 border-l-4 rtl:border-l-0 rtl:border-r-4 border-emerald-600"
                          : "text-gray-700"
                      }`}
                    >
                      {t("allCategories")}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setCategoryFilter("equipment");
                        setIsDropdownOpen(false);
                      }}
                      className={`w-full px-4 py-3 text-left rtl:text-right hover:bg-gradient-to-r hover:from-emerald-50 hover:to-green-50 transition-all font-medium ${
                        categoryFilter === "equipment"
                          ? "bg-gradient-to-r from-emerald-50 to-green-50 text-emerald-700 border-l-4 rtl:border-l-0 rtl:border-r-4 border-emerald-600"
                          : "text-gray-700"
                      }`}
                    >
                      {t("categoryEquipment")}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setCategoryFilter("land");
                        setIsDropdownOpen(false);
                      }}
                      className={`w-full px-4 py-3 text-left rtl:text-right hover:bg-gradient-to-r hover:from-emerald-50 hover:to-green-50 transition-all font-medium ${
                        categoryFilter === "land"
                          ? "bg-gradient-to-r from-emerald-50 to-green-50 text-emerald-700 border-l-4 rtl:border-l-0 rtl:border-r-4 border-emerald-600"
                          : "text-gray-700"
                      }`}
                    >
                      {t("categoryLand")}
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* Location Filter */}
            <div className="relative group">
              <MapPin className="absolute left-4 top-4 h-5 w-5 text-emerald-600 group-focus-within:text-emerald-700 transition-colors pointer-events-none" />
              <input
                type="text"
                placeholder={t("locationPlaceholder")}
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border-2 border-emerald-200 rounded-xl focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 focus:outline-none bg-white transition-all hover:border-emerald-400 text-gray-700 font-medium"
              />
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-emerald-100 to-green-100 rounded-2xl p-4 inline-block">
            <p className="text-emerald-800 font-semibold">
              {isTranslating && (
                <span className="mr-2">
                  {translationProgress > 0 && `${translationProgress}%`}
                </span>
              )}
              {i18n.language === "ur" ? (
                // Urdu word order
                <>
                  <span className="text-emerald-600 font-bold">
                    {filteredRentals.length}
                  </span>{" "}
                  {t("of")}{" "}
                  <span className="text-emerald-600 font-bold">
                    {rentals.filter((r) => r.availability).length}
                  </span>{" "}
                  {t("availableRentals")} {t("showing")}
                </>
              ) : (
                // English word order
                <>
                  {t("showing")}{" "}
                  <span className="text-emerald-600 font-bold">
                    {filteredRentals.length}
                  </span>{" "}
                  {t("of")}{" "}
                  <span className="text-emerald-600 font-bold">
                    {rentals.filter((r) => r.availability).length}
                  </span>{" "}
                  {t("availableRentals")}
                </>
              )}
            </p>
          </div>
        </div>

        {/* Equipment Grid */}
        {filteredRentals.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredRentals.map((rental) => (
              <RentalCard key={rental.id} rental={rental} t={t} />
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
              {t("noEquipmentFound")}
            </h3>
            <p className="text-gray-600 mb-8 text-lg">{t("adjustFilters")}</p>
            {user && (
              <Link
                to="/add-rental"
                className="bg-gradient-to-br from-emerald-500 to-green-600 text-white px-8 py-4 rounded-2xl hover:from-emerald-600 hover:to-green-700 transition-all duration-300 inline-flex items-center font-semibold shadow-lg hover:shadow-xl hover:scale-105"
              >
                <Plus className="h-5 w-5 mr-2" />
                {t("listYourEquipment")}
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const RentalCard = ({ rental, t }) => {
  const [currentImage, setCurrentImage] = useState(0);
  const totalImages = rental.images?.length || 0;

  const nextImage = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImage((prev) => (prev + 1) % totalImages);
  };

  const prevImage = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImage((prev) => (prev - 1 + totalImages) % totalImages);
  };

  return (
    <Link
      to={`/rentals/${rental.id}`}
      className="group bg-white rounded-3xl shadow-lg border-2 border-emerald-200 hover:border-emerald-400 hover:shadow-2xl transition-all duration-500 overflow-hidden hover:-translate-y-2 flex flex-col h-full"
    >
      <div className="relative aspect-w-16 aspect-h-10 overflow-hidden rounded-t-3xl">
        {totalImages > 0 && (
          <img
            src={rental.images[currentImage]}
            alt={`${rental.title} - Image ${currentImage + 1}`}
            className="w-full h-56 object-cover group-hover:scale-110 transition-transform duration-500"
          />
        )}

        {totalImages > 1 && (
          <>
            <button
              onClick={prevImage}
              className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-emerald-600 text-white rounded-full p-2 transition-all duration-300 hover:scale-110 backdrop-blur-sm"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={nextImage}
              className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-emerald-600 text-white rounded-full p-2 transition-all duration-300 hover:scale-110 backdrop-blur-sm"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex space-x-2">
              {rental.images.map((_, i) => (
                <div
                  key={i}
                  className={`h-2 w-2 rounded-full transition-all duration-300 ${
                    i === currentImage ? "bg-emerald-500 w-6" : "bg-white/70"
                  }`}
                ></div>
              ))}
            </div>
          </>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      </div>

      <div className="p-6 flex-grow">
        <div className="flex items-center justify-between mb-3">
          <span className="bg-gradient-to-r from-emerald-100 to-green-100 text-emerald-700 text-sm font-bold px-4 py-1.5 rounded-full">
            {rental.category}
          </span>
          <span className="text-emerald-600 font-bold text-xl">
            Rs {rental.pricePerDay.toLocaleString()}
            <span className="text-sm text-gray-500">/day</span>
          </span>
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-emerald-600 transition-colors line-clamp-1">
          {rental.title}
        </h3>
        <p className="text-gray-600 text-sm mb-4 line-clamp-2 leading-relaxed">
          {rental.description}
        </p>
        <div className="flex items-center text-gray-500 text-sm mb-3">
          <MapPin className="h-4 w-4 mr-2 text-emerald-600" />
          <span>{rental.location}</span>
        </div>
        <div className="flex items-center pt-3 border-t border-gray-100 mb-0">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-green-500 flex items-center justify-center text-white font-bold text-sm mr-3">
            {rental.ownerName?.charAt(0) || "O"}
          </div>
          <span dir="ltr" className="text-sm text-gray-600 ">
            {t("by")} {rental.ownerName}
          </span>
        </div>
      </div>

      <div className="h-1.5 bg-gradient-to-r from-emerald-400 to-green-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>
    </Link>
  );
};

export default Rentals;
