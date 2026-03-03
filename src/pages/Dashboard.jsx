import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  DollarSign,
  MapPin,
  Clock,
  Package,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { useData } from "../context/DataContext";
import { useAuth } from "../context/AuthContext";
import { useTranslation } from "react-i18next";
import translationService from "../services/translationService";

const Dashboard = () => {
  const { rentals, biddings, sales, deleteRental, deleteBidding, deleteSale } =
    useData();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("rentals");
  const { t, i18n } = useTranslation("common");

  // Translation state
  const [translatedRentals, setTranslatedRentals] = useState([]);
  const [translatedBiddings, setTranslatedBiddings] = useState([]);
  const [translatedSales, setTranslatedSales] = useState([]);
  const [isTranslating, setIsTranslating] = useState(false);

  if (!user) return null;

  const userRentals = rentals.filter((rental) => rental.ownerId === user.uid);
  const userBiddings = biddings.filter(
    (bidding) => bidding.ownerId === user.uid
  );
  const userSales = sales.filter((sale) => sale.ownerId === user.uid);

  // Translation effect
  useEffect(() => {
    let isMounted = true;

    const translateAll = async () => {
      if (i18n.language === "en") {
        setTranslatedRentals(userRentals);
        setTranslatedBiddings(userBiddings);
        setTranslatedSales(userSales);
        setIsTranslating(false);
        return;
      }

      setIsTranslating(true);
      const targetLang = i18n.language;

      try {
        // Translate rentals
        const rentalsTranslated = await translationService.translateArray(
          userRentals,
          ["title", "description", "location"],
          targetLang
        );

        // Translate biddings
        const biddingsTranslated = await translationService.translateArray(
          userBiddings,
          ["title", "description"],
          targetLang
        );

        // Translate sales
        const salesTranslated = await translationService.translateArray(
          userSales,
          ["title", "description", "location"],
          targetLang
        );

        if (isMounted) {
          setTranslatedRentals(rentalsTranslated);
          setTranslatedBiddings(biddingsTranslated);
          setTranslatedSales(salesTranslated);
          setIsTranslating(false);
        }
      } catch (error) {
        console.error("Translation failed:", error);
        if (isMounted) {
          setTranslatedRentals(userRentals);
          setTranslatedBiddings(userBiddings);
          setTranslatedSales(userSales);
          setIsTranslating(false);
        }
      }
    };

    const timer = setTimeout(translateAll, 500);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [userRentals, userBiddings, userSales, i18n.language]);

  // Use translated data
  const displayRentals =
    translatedRentals.length > 0 ? translatedRentals : userRentals;
  const displayBiddings =
    translatedBiddings.length > 0 ? translatedBiddings : userBiddings;
  const displaySales = translatedSales.length > 0 ? translatedSales : userSales;

  const handleDeleteRental = async (id) => {
    if (
      window.confirm(
        t("confirmDeleteRental") ||
          "Are you sure you want to delete this rental listing?"
      )
    ) {
      try {
        await deleteRental(id);
        alert(t("rentalDeleteSuccess") || "Rental deleted successfully!");
      } catch (error) {
        console.error("Error deleting rental:", error);
        alert(t("rentalDeleteError") || "Failed to delete rental. Please try again.");
      }
    }
  };

  const handleDeleteBidding = async (id) => {
    if (
      window.confirm(
        t("confirmDeleteAuction") ||
          "Are you sure you want to delete this auction?"
      )
    ) {
      try {
        await deleteBidding(id);
        alert(t("biddingDeleteSuccess") || "Auction deleted successfully!");
      } catch (error) {
        console.error("Error deleting bidding:", error);
        alert(t("biddingDeleteError") || "Failed to delete auction. Please try again.");
      }
    }
  };

  const handleDeleteSale = async (id) => {
    if (
      window.confirm(
        t("confirmDeleteProduct") ||
          "Are you sure you want to delete this product listing?"
      )
    ) {
      try {
        await deleteSale(id);
        alert(t("saleDeleteSuccess") || "Product deleted successfully!");
      } catch (error) {
        console.error("Error deleting sale:", error);
        alert(t("saleDeleteError") || "Failed to delete product. Please try again.");
      }
    }
  };

  const formatTimeRemaining = (endDate) => {
    const now = new Date();
    const end = new Date(endDate);
    const diff = end - now;

    if (diff <= 0) return t("ended");

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    if (days > 0) return `${days}d ${hours}h`;
    return `${hours}h`;
  };

  const tabs = [
    {
      id: "rentals",
      name: t("tabEquipmentRentals"),
      count: userRentals.length,
    },
    { id: "biddings", name: t("tabLandAuctions"), count: userBiddings.length },
    { id: "sales", name: t("tabProductSales"), count: userSales.length },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-green-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="h-8 w-8 text-emerald-600" />
            <h1 className="text-4xl leading-[1.5] font-bold bg-gradient-to-r from-emerald-700 to-green-600 bg-clip-text text-transparent">
              {t("dashboardTitle")}
            </h1>
          </div>
          <p className="text-gray-600 text-lg">{t("dashboardSubtitle")}</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="group bg-white border-2 border-emerald-200 rounded-3xl p-8">
            <div className="flex items-center">
              <div className="flex-shrink-0 p-4 bg-gradient-to-br from-emerald-400 to-green-500 rounded-2xl shadow-lg">
                <Package className="h-8 w-8 text-white" />
              </div>
              <div className="mx-5">
                <p className="text-sm font-bold text-emerald-600 uppercase tracking-wide">
                  {t("tabEquipmentRentals")}
                </p>
                <p className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
                  {userRentals.length}
                </p>
              </div>
            </div>
          </div>

          <div className="group bg-white border-2 border-emerald-200 rounded-3xl p-8">
            <div className="flex items-center">
              <div className="flex-shrink-0 p-4 bg-gradient-to-br from-emerald-400 to-green-500 rounded-2xl shadow-lg">
                <MapPin className="h-8 w-8 text-white" />
              </div>
              <div className="mx-5">
                <p className="text-sm font-bold text-emerald-600 uppercase tracking-wide">
                  {t("tabLandAuctions")}
                </p>
                <p className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
                  {userBiddings.length}
                </p>
              </div>
            </div>
          </div>

          <div className="group bg-white border-2 border-emerald-200 rounded-3xl p-8 ">
            <div className="flex items-center">
              <div className="flex-shrink-0 p-4 bg-gradient-to-br from-emerald-400 to-green-500 rounded-2xl shadow-lg">
                <DollarSign className="h-8 w-8 text-white" />
              </div>
              <div className="mx-5">
                <p className="text-sm font-bold text-emerald-600 uppercase tracking-wide">
                  {t("tabProductSales")}
                </p>
                <p className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
                  {userSales.length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-3xl shadow-2xl border-2 border-emerald-200">
          <div className="border-b-2 border-gray-100">
            <nav className="flex flex-col sm:flex-row sm:space-x-2 px-4 sm:px-6 py-2" aria-label="Tabs">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative py-3 sm:py-4 px-4 sm:px-6 font-bold text-sm rounded-t-2xl transition-all duration-300 ${
                    activeTab === tab.id
                      ? "bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-lg"
                      : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <span className="flex items-center justify-center gap-2">
                    {tab.name}
                    <span
                      className={`py-1 px-3 rounded-full text-xs font-bold ${
                        activeTab === tab.id
                          ? "bg-white/20 text-white"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {tab.count}
                    </span>
                  </span>
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-4 sm:p-8">
            {isTranslating && i18n.language !== "en" && (
              <div className="mb-4 text-center text-emerald-600 text-sm">
                🔄 {t("translating")}...
              </div>
            )}

            {/* Rentals Tab */}
            {activeTab === "rentals" && (
              <div>
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-8">
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-0">
                    {t("yourEquipmentRentals")}
                  </h2>
                  <Link
                    to="/add-rental"
                    className="bg-gradient-to-br from-emerald-500 to-green-600 text-white px-4 sm:px-6 py-3 rounded-2xl hover:from-emerald-600 hover:to-green-700 transition-all duration-300 inline-flex items-center font-semibold shadow-lg hover:shadow-xl hover:scale-105"
                  >
                    <Plus className="h-5 w-5 mr-2" />
                    {t("addEquipment")}
                  </Link>
                </div>

                {displayRentals.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                    {displayRentals.map((rental) => (
                      <div
                        key={rental.id}
                        className="group border-2 border-gray-200 rounded-2xl p-4 sm:p-6 hover:border-emerald-400 hover:shadow-xl transition-all duration-300"
                      >
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-4 gap-2">
                          <h3 className="font-bold text-gray-900 truncate text-lg group-hover:text-emerald-600 transition-colors flex-1">
                            {rental.title}
                          </h3>
                          <div className="flex space-x-1 ml-0 sm:ml-2 flex-shrink-0">
                            <Link
                              to={`/rentals/${rental.id}`}
                              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                              title="View"
                            >
                              <Eye className="h-4 w-4" />
                            </Link>
                            <Link
                              to={`/edit-rental/${rental.id}`}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Edit"
                            >
                              <Edit className="h-4 w-4" />
                            </Link>
                            <button
                              onClick={() => handleDeleteRental(rental.id)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>

                        <p className="text-gray-600 text-sm mb-4 line-clamp-2 leading-relaxed">
                          {rental.description}
                        </p>

                        <div className="space-y-3 text-sm">
                          <div className="flex items-center text-gray-700 font-semibold">
                            <DollarSign className="h-4 w-4 mr-2 text-emerald-600" />
                            <span>Rs {rental.pricePerDay}/day</span>
                          </div>
                          <div className="flex items-center text-gray-600">
                            <MapPin className="h-4 w-4 mr-2 text-emerald-600" />
                            <span className="truncate">{rental.location}</span>
                          </div>
                          <div className="flex items-center">
                            <span
                              className={`px-4 py-1.5 rounded-full text-xs font-bold ${
                                rental.availability
                                  ? "bg-gradient-to-r from-emerald-100 to-green-100 text-emerald-700"
                                  : "bg-gradient-to-r from-red-100 to-red-200 text-red-700"
                              }`}
                            >
                              {rental.availability
                                ? t("available")
                                : t("unavailable")}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16 bg-gradient-to-br from-emerald-50 to-green-50 rounded-3xl border-2 border-emerald-200">
                    <div className="inline-flex p-6 rounded-full bg-white shadow-lg mb-6">
                      <Package className="h-16 w-16 text-emerald-600" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">
                      {t("noEquipmentListed")}
                    </h3>
                    <p className="text-gray-600 mb-8 text-lg">
                      {t("addFirstEquipment")}
                    </p>
                    <Link
                      to="/add-rental"
                      className="bg-gradient-to-br from-emerald-500 to-green-600 text-white px-8 py-4 rounded-2xl hover:from-emerald-600 hover:to-green-700 transition-all duration-300 inline-flex items-center font-semibold shadow-lg hover:shadow-xl hover:scale-105"
                    >
                      <Plus className="h-5 w-5 mr-2" />
                      {t("addEquipment")}
                    </Link>
                  </div>
                )}
              </div>
            )}

            {/* Biddings Tab */}
            {activeTab === "biddings" && (
              <div>
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-8">
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-0">
                    {t("yourLandAuctions")}
                  </h2>
                  <Link
                    to="/add-bidding"
                    className="bg-gradient-to-br from-emerald-500 to-green-600 text-white px-4 sm:px-6 py-3 rounded-2xl hover:from-emerald-600 hover:to-green-700 transition-all duration-300 inline-flex items-center font-semibold shadow-lg hover:shadow-xl hover:scale-105"
                  >
                    <Plus className="h-5 w-5 mr-2" />
                    {t("addLandAuction")}
                  </Link>
                </div>

                {displayBiddings.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                    {displayBiddings.map((bidding) => (
                      <div
                        key={bidding.id}
                        className="group border-2 border-gray-200 rounded-2xl p-4 sm:p-6 hover:border-emerald-400 hover:shadow-xl transition-all duration-300"
                      >
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-4 gap-2">
                          <h3 className="font-bold text-gray-900 truncate text-lg group-hover:text-emerald-600 transition-colors flex-1">
                            {bidding.title}
                          </h3>
                          <div className="flex space-x-1 ml-0 sm:ml-2 flex-shrink-0">
                            <Link
                              to={`/bidding/${bidding.id}`}
                              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                              title="View"
                            >
                              <Eye className="h-4 w-4" />
                            </Link>
                            <Link
                              to={`/edit-bidding/${bidding.id}`}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Edit"
                            >
                              <Edit className="h-4 w-4" />
                            </Link>
                            <button
                              onClick={() => handleDeleteBidding(bidding.id)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>

                        <p className="text-gray-600 text-sm mb-4 line-clamp-2 leading-relaxed">
                          {bidding.description}
                        </p>

                        <div className="space-y-3 text-sm">
                          <div className="flex justify-between items-center bg-gradient-to-r from-emerald-50 to-green-50 rounded-xl p-3">
                            <span className="text-gray-600 font-medium">
                              {t("currentBid")}
                            </span>
                            <span className="font-bold text-emerald-600 text-lg">
                              Rs {bidding.currentBid.toLocaleString()}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">{t("area")}</span>
                            <span className="font-semibold text-gray-900">
                              {bidding.area}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center text-gray-600">
                              <Clock className="h-4 w-4 mr-2 text-emerald-600" />
                              <span className="font-medium">
                                {formatTimeRemaining(bidding.endDate)}
                              </span>
                            </div>
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-bold ${
                                bidding.status === "active"
                                  ? "bg-emerald-100 text-emerald-700"
                                  : bidding.status === "ended"
                                  ? "bg-red-100 text-red-700"
                                  : "bg-blue-100 text-blue-700"
                              }`}
                            >
                              {bidding.status}
                            </span>
                          </div>
                          <div className="text-gray-600 font-medium pt-2 border-t border-gray-200">
                            <TrendingUp className="h-4 w-4 inline mr-1 text-emerald-600" />
                            {bidding.bids.length} {t("bidsCount")}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16 bg-gradient-to-br from-emerald-50 to-green-50 rounded-3xl border-2 border-emerald-200">
                    <div className="inline-flex p-6 rounded-full bg-white shadow-lg mb-6">
                      <MapPin className="h-16 w-16 text-emerald-600" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">
                      {t("noLandAuctions")}
                    </h3>
                    <p className="text-gray-600 mb-8 text-lg">
                      {t("addFirstLandAuction")}
                    </p>
                    <Link
                      to="/add-bidding"
                      className="bg-gradient-to-br from-emerald-500 to-green-600 text-white px-8 py-4 rounded-2xl hover:from-emerald-600 hover:to-green-700 transition-all duration-300 inline-flex items-center font-semibold shadow-lg hover:shadow-xl hover:scale-105"
                    >
                      <Plus className="h-5 w-5 mr-2" />
                      {t("addLandAuction")}
                    </Link>
                  </div>
                )}
              </div>
            )}

            {/* Sales Tab */}
            {activeTab === "sales" && (
              <div>
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-8">
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-0">
                    {t("yourProductSales")}
                  </h2>
                  <Link
                    to="/add-sale"
                    className="bg-gradient-to-br from-emerald-500 to-green-600 text-white px-4 sm:px-6 py-3 rounded-2xl hover:from-emerald-600 hover:to-green-700 transition-all duration-300 inline-flex items-center font-semibold shadow-lg hover:shadow-xl hover:scale-105"
                  >
                    <Plus className="h-5 w-5 mr-2" />
                    {t("addProduct")}
                  </Link>
                </div>

                {displaySales.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                    {displaySales.map((sale) => (
                      <div
                        key={sale.id}
                        className="group border-2 border-gray-200 rounded-2xl p-4 sm:p-6 hover:border-emerald-400 hover:shadow-xl transition-all duration-300"
                      >
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-4 gap-2">
                          <h3 className="font-bold text-gray-900 truncate text-lg group-hover:text-emerald-600 transition-colors flex-1">
                            {sale.title}
                          </h3>
                          <div className="flex space-x-1 ml-0 sm:ml-2 flex-shrink-0">
                            <Link
                              to={`/marketplace/${sale.id}`}
                              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                              title="View"
                            >
                              <Eye className="h-4 w-4" />
                            </Link>
                            <Link
                              to={`/edit-sale/${sale.id}`}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Edit"
                            >
                              <Edit className="h-4 w-4" />
                            </Link>
                            <button
                              onClick={() => handleDeleteSale(sale.id)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>

                        <p className="text-gray-600 text-sm mb-4 line-clamp-2 leading-relaxed">
                          {sale.description}
                        </p>

                        <div className="space-y-3 text-sm">
                          <div className="flex justify-between items-center bg-gradient-to-r from-emerald-50 to-green-50 rounded-xl p-3">
                            <span className="text-gray-600 font-medium text-xs sm:text-sm">
                              {t("price")}
                            </span>
                            <span className="font-bold text-emerald-600 text-sm sm:text-lg">
                              Rs {sale.price}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600 text-xs sm:text-sm">
                              {t("category")}
                            </span>
                            <span className="font-semibold text-gray-900 capitalize text-xs sm:text-sm">
                              {sale.category}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600 text-xs sm:text-sm">
                              {t("condition")}
                            </span>
                            <span className="font-semibold text-gray-900 capitalize text-xs sm:text-sm">
                              {sale.condition}
                            </span>
                          </div>
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pt-2 border-t border-gray-200 gap-2">
                            <div className="flex items-center text-gray-600">
                              <MapPin className="h-4 w-4 mr-1 text-emerald-600" />
                              <span className="truncate text-xs">
                                {sale.location}
                              </span>
                            </div>
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-bold ${
                                sale.available
                                  ? "bg-emerald-100 text-emerald-700"
                                  : "bg-red-100 text-red-700"
                              }`}
                            >
                              {sale.available ? t("available") : t("sold")}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16 bg-gradient-to-br from-emerald-50 to-green-50 rounded-3xl border-2 border-emerald-200">
                    <div className="inline-flex p-6 rounded-full bg-white shadow-lg mb-6">
                      <DollarSign className="h-16 w-16 text-emerald-600" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">
                      {t("noProductsListed")}
                    </h3>
                    <p className="text-gray-600 mb-8 text-lg">
                      {t("addFirstProduct")}
                    </p>
                    <Link
                      to="/add-sale"
                      className="bg-gradient-to-br from-emerald-500 to-green-600 text-white px-8 py-4 rounded-2xl hover:from-emerald-600 hover:to-green-700 transition-all duration-300 inline-flex items-center font-semibold shadow-lg hover:shadow-xl hover:scale-105"
                    >
                      <Plus className="h-5 w-5 mr-2" />
                      {t("addProduct")}
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
