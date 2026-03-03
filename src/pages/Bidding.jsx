import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Search,
  Plus,
  MapPin,
  Clock,
  DollarSign,
  Image as ImageIcon,
  Sparkles,
  TrendingUp,
  ChevronDown,
  Users,
} from "lucide-react";
import { useData } from "../context/DataContext";
import { useAuth } from "../context/AuthContext";
import { useTranslation } from "react-i18next";
import translationService from "../services/translationService";

const Bidding = () => {
  const { biddings } = useData();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("active");
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
  const { t, i18n } = useTranslation("common");

  // Translation state
  const [translatedBiddings, setTranslatedBiddings] = useState([]);
  const [isTranslating, setIsTranslating] = useState(false);
  const [translationProgress, setTranslationProgress] = useState(0);

  // Translation effect
  useEffect(() => {
    let isMounted = true;

    const translateAll = async () => {
      if (!biddings || biddings.length === 0) {
        setTranslatedBiddings([]);
        setIsTranslating(false);
        return;
      }

      if (i18n.language === "en") {
        setTranslatedBiddings(biddings);
        setIsTranslating(false);
        setTranslationProgress(0);
        return;
      }

      setIsTranslating(true);
      const targetLang = i18n.language;

      try {
        const translated = await translationService.translateArray(
          biddings,
          ["title", "description", "location", "ownerName"],
          targetLang,
          (progress) => {
            if (isMounted) {
              setTranslationProgress(progress.percentage);
            }
          }
        );

        if (isMounted) {
          setTranslatedBiddings(translated);
          setIsTranslating(false);
          setTranslationProgress(100);
        }
      } catch (error) {
        console.error("Translation failed:", error);
        if (isMounted) {
          setTranslatedBiddings(biddings);
          setIsTranslating(false);
        }
      }
    };

    const timer = setTimeout(translateAll, 500);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [biddings, i18n.language]);

  // Use translated data
  const list = translatedBiddings.length > 0 ? translatedBiddings : biddings;

  const filteredBiddings = list.filter((bidding) => {
    const matchesSearch =
      bidding.title && bidding.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bidding.description && bidding.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const now = new Date();
    const endDate = new Date(bidding.endDate);
    const isAuctionActive = endDate > now;
    
    let matchesStatus = false;
    if (statusFilter === "all") {
      matchesStatus = true;
    } else if (statusFilter === "active") {
      matchesStatus = bidding.status === "active" && isAuctionActive;
    } else if (statusFilter === "ended") {
      matchesStatus = bidding.status === "ended" || !isAuctionActive;
    }

    return matchesSearch && matchesStatus;
  });

  const formatTimeRemaining = (endDate) => {
    const now = new Date();
    const end = new Date(endDate);
    const diff = end - now;

    if (diff <= 0) return t("auctionEnded");

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    if (days > 0) return `${days}d ${hours}h`;
    return `${hours}h`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-green-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="h-8 w-8 text-emerald-600" />
              <h1 className="text-4xl leading-[1.5] font-bold bg-gradient-to-r from-emerald-700 to-green-600 bg-clip-text text-transparent">
                {t("landBiddingTitle")}
              </h1>
            </div>
            <p className="text-gray-600 text-lg">{t("landBiddingSubtitle")}</p>
          </div>
          {user && (
            <Link
              to="/add-bidding"
              className="mt-4 md:mt-0 bg-gradient-to-br from-emerald-500 to-green-600 text-white px-6 py-3 rounded-2xl hover:from-emerald-600 hover:to-green-700 transition-all duration-300 inline-flex items-center font-semibold shadow-lg hover:shadow-xl hover:scale-105"
            >
              <Plus className="h-5 w-5 mr-2" />
              {t("listLand")}
            </Link>
          )}
        </div>

        {/* Filters */}
        <div className="bg-white p-8 rounded-3xl shadow-xl border-2 border-emerald-200 mb-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Search */}
            <div className="relative group">
              <Search className="absolute left-4 rtl:left-auto rtl:right-4 top-4 h-5 w-5 text-emerald-600 group-focus-within:text-emerald-700 transition-colors pointer-events-none" />
              <input
                type="text"
                placeholder={t("searchLand")}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 rtl:pl-4 rtl:pr-12 pr-4 py-3 border-2 border-emerald-200 rounded-xl focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 focus:outline-none bg-white transition-all hover:border-emerald-400 text-gray-700 font-medium text-left rtl:text-right"
              />
            </div>

            {/* Status Filter */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsStatusDropdownOpen(!isStatusDropdownOpen)}
                className="w-full pl-10 pr-10 px-4 py-3 border-2 border-emerald-200 rounded-xl focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 focus:outline-none bg-white transition-all cursor-pointer hover:border-emerald-400 text-left rtl:text-right font-medium text-gray-700"
              >
                {statusFilter === "active" && t("activeAuctions")}
                {statusFilter === "ended" && t("endedAuctions")}
                {statusFilter === "all" && t("allAuctions")}
              </button>
              <TrendingUp className="absolute left-4 rtl:left-auto rtl:right-4 top-4 h-5 w-5 text-emerald-600 pointer-events-none" />
              <ChevronDown
                className={`absolute right-4 rtl:right-auto rtl:left-4 top-4 h-5 w-5 text-emerald-600 pointer-events-none transition-transform ${
                  isStatusDropdownOpen ? "rotate-180" : ""
                }`}
              />

              {/* Dropdown Menu */}
              {isStatusDropdownOpen && (
                <>
                  {/* Backdrop to close dropdown */}
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setIsStatusDropdownOpen(false)}
                  />

                  {/* Options */}
                  <div className="absolute z-20 w-full mt-2 bg-white border-2 border-emerald-200 rounded-xl shadow-2xl overflow-hidden">
                    <button
                      type="button"
                      onClick={() => {
                        setStatusFilter("active");
                        setIsStatusDropdownOpen(false);
                      }}
                      className={`w-full px-4 py-3 text-left rtl:text-right hover:bg-gradient-to-r hover:from-emerald-50 hover:to-green-50 transition-all font-medium ${
                        statusFilter === "active"
                          ? "bg-gradient-to-r from-emerald-50 to-green-50 text-emerald-700 border-l-4 rtl:border-l-0 rtl:border-r-4 border-emerald-600"
                          : "text-gray-700"
                      }`}
                    >
                      {t("activeAuctions")}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setStatusFilter("ended");
                        setIsStatusDropdownOpen(false);
                      }}
                      className={`w-full px-4 py-3 text-left rtl:text-right hover:bg-gradient-to-r hover:from-emerald-50 hover:to-green-50 transition-all font-medium ${
                        statusFilter === "ended"
                          ? "bg-gradient-to-r from-emerald-50 to-green-50 text-emerald-700 border-l-4 rtl:border-l-0 rtl:border-r-4 border-emerald-600"
                          : "text-gray-700"
                      }`}
                    >
                      {t("endedAuctions")}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setStatusFilter("all");
                        setIsStatusDropdownOpen(false);
                      }}
                      className={`w-full px-4 py-3 text-left rtl:text-right hover:bg-gradient-to-r hover:from-emerald-50 hover:to-green-50 transition-all font-medium ${
                        statusFilter === "all"
                          ? "bg-gradient-to-r from-emerald-50 to-green-50 text-emerald-700 border-l-4 rtl:border-l-0 rtl:border-r-4 border-emerald-600"
                          : "text-gray-700"
                      }`}
                    >
                      {t("allAuctions")}
                    </button>
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
                    {filteredBiddings.length}
                  </span>{" "}
                  {t("showingLandAuctions")} {t("showing")}
                </>
              ) : (
                // English word order
                <>
                  {t("showing")}{" "}
                  <span className="text-emerald-600 font-bold">
                    {filteredBiddings.length}
                  </span>{" "}
                  {t("showingLandAuctions")}
                </>
              )}
            </p>
          </div>
        </div>

        {/* Bidding Grid */}
        {filteredBiddings.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredBiddings.map((bidding) => (
              <Link
                key={bidding.id}
                to={`/bidding/${bidding.id}`}
                className="group bg-white rounded-3xl shadow-lg border-2 border-emerald-200 hover:border-emerald-400 hover:shadow-2xl transition-all duration-500 overflow-hidden hover:-translate-y-2 flex flex-col"
              >
                <div className="relative aspect-w-16 aspect-h-10 overflow-hidden rounded-t-3xl">
                  <img
                    src={bidding.images[0]}
                    alt={bidding.title}
                    className="w-full h-56 object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  {/* Image Count Badge */}
                  {bidding.images && bidding.images.length > 1 && (
                    <div className="absolute top-3 right-3 bg-black/70 backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-sm font-semibold flex items-center shadow-lg">
                      <ImageIcon className="h-4 w-4 mr-1" />
                      {bidding.images.length}
                    </div>
                  )}
                  {/* Status Badge */}
                  <div className="absolute top-3 left-3">
                    <span
                      className={`text-sm font-bold px-4 py-1.5 rounded-full shadow-lg backdrop-blur-sm ${
                        bidding.status === "active" &&
                        new Date() < new Date(bidding.endDate)
                          ? "bg-emerald-500/90 text-white"
                          : bidding.status === "ended" ||
                            new Date() >= new Date(bidding.endDate)
                          ? "bg-red-500/90 text-white"
                          : "bg-blue-500/90 text-white"
                      }`}
                    >
                      {bidding.status === "active" &&
                      new Date() < new Date(bidding.endDate)
                        ? t("activeStatus")
                        : bidding.status === "ended" ||
                          new Date() >= new Date(bidding.endDate)
                        ? t("endedStatus")
                        : bidding.status}
                    </span>
                  </div>
                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>

                <div className="p-6 flex-grow">
                  {/* Time Remaining */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center text-orange-600 bg-orange-50 px-3 py-1.5 rounded-full">
                      <Clock className="h-4 w-4 mr-2" />
                      <span className="text-sm font-bold">
                        {formatTimeRemaining(bidding.endDate)}
                      </span>
                    </div>
                    <div className="flex items-center text-gray-500 bg-gray-100 px-3 py-1.5 rounded-full">
                      <Users className="h-4 w-4 mr-1" />
                      <span className="text-sm font-semibold">
                        {bidding.bids.length}
                      </span>
                    </div>
                  </div>

                  <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-emerald-600 transition-colors line-clamp-1">
                    {bidding.title}
                  </h3>

                  <p className="text-gray-600 text-sm mb-4 line-clamp-2 leading-relaxed">
                    {bidding.description}
                  </p>

                  {/* Pricing Info */}
                  <div className="space-y-3 mb-4 bg-gradient-to-br from-emerald-50 to-green-50 rounded-2xl p-4 border border-emerald-200">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600 font-medium">
                        {t("startingPrice")}
                      </span>
                      <span className="font-bold text-gray-700">
                        Rs {bidding.startingPrice.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 font-medium">
                        {t("currentBidLabel")}
                      </span>
                      <div className="flex items-center gap-1">
                        <span className="text-emerald-600 font-bold text-sm">
                          Rs
                        </span>
                        <span className="font-bold text-xl text-emerald-600">
                          {bidding.currentBid.toLocaleString()}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-sm pt-2 border-t border-emerald-200">
                      <span className="text-gray-600 font-medium">
                        {t("areaLabel")}
                      </span>
                      <span className="font-bold text-gray-700">
                        {bidding.area}
                      </span>
                    </div>
                  </div>

                  {/* Location */}
                  <div className="flex items-center text-gray-500 text-sm mb-3">
                    <MapPin className="h-4 w-4 mr-2 text-emerald-600" />
                    <span className="line-clamp-1">{bidding.location}</span>
                  </div>

                  {/* Owner */}
                  <div className="flex items-center pt-3 border-t border-gray-100 gap-1">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-green-500 flex items-center justify-center text-white font-bold text-sm mr-3">
                      {bidding.ownerName?.charAt(0) || "O"}
                    </div>
                    <span
                      dir="ltr"
                      className="text-sm text-gray-600 font-medium"
                    >
                      {t("by")} {bidding.ownerName}
                    </span>
                  </div>
                </div>

                {/* Bottom accent bar */}
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
              {t("noLandAuctionsFound")}
            </h3>
            <p className="text-gray-600 mb-8 text-lg">{t("adjustFilters")}</p>
            {user && (
              <Link
                to="/add-bidding"
                className="bg-gradient-to-br from-emerald-500 to-green-600 text-white px-8 py-4 rounded-2xl hover:from-emerald-600 hover:to-green-700 transition-all duration-300 inline-flex items-center font-semibold shadow-lg hover:shadow-xl hover:scale-105"
              >
                <Plus className="h-5 w-5 mr-2" />
                {t("listYourLand")}
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Bidding;
