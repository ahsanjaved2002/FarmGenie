import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  MapPin,
  Calendar,
  DollarSign,
  User,
  Edit,
  Trash2,
  ChevronLeft,
  ChevronRight,
  MessageCircle,
  Sparkles,
  Package,
  CheckCircle,
  ShoppingCart,
} from "lucide-react";
import { useData } from "../context/DataContext";
import { useAuth } from "../context/AuthContext";
import { createRentalCheckoutSession } from "../services/stripeService";
import { useTranslation } from "react-i18next";
import MessageModal from "../components/MessageModal";
import translationService from "../services/translationService";

const RentalDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { rentals, deleteRental } = useData();
  const { user } = useAuth();
  const { t, i18n } = useTranslation("common");
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showMessageModal, setShowMessageModal] = useState(false);

  // Translation state
  const [translatedRental, setTranslatedRental] = useState(null);
  const [isTranslating, setIsTranslating] = useState(false);

  const rental = rentals.find((r) => r.id === id);

  console.log("📊 FULL RENTAL OBJECT:", rental);
console.log("📧 Owner Email Field:", rental?.ownerEmail);
console.log("🔍 All rental fields:", Object.keys(rental || {}));
console.log("👤 User object:", user);

  // Translation effect
  useEffect(() => {
    let isMounted = true;

    const translateRental = async () => {
      if (!rental) {
        setTranslatedRental(null);
        setIsTranslating(false);
        return;
      }

      if (i18n.language === "en") {
        setTranslatedRental(rental);
        setIsTranslating(false);
        return;
      }

      setIsTranslating(true);
      const targetLang = i18n.language;

      try {
        const translated = await translationService.translateObject(
          rental,
          ["title", "description", "location", "ownerName"],
          targetLang
        );

        if (isMounted) {
          setTranslatedRental(translated);
          setIsTranslating(false);
        }
      } catch (error) {
        console.error("Translation failed:", error);
        if (isMounted) {
          setTranslatedRental(rental);
          setIsTranslating(false);
        }
      }
    };

    const timer = setTimeout(translateRental, 300);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [rental, i18n.language]);

  // Use translated data
  const displayRental = translatedRental || rental;

  if (!rental) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-green-50 flex items-center justify-center">
        <div className="text-center bg-white rounded-3xl shadow-2xl border-2 border-emerald-200 p-12">
          <div className="inline-flex p-6 rounded-full bg-gradient-to-br from-red-100 to-red-200 mb-6">
            <Package className="h-16 w-16 text-red-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            {t("rentalNotFound")}
          </h1>
          <Link
            to="/rentals"
            className="inline-flex items-center text-emerald-600 hover:text-emerald-700 font-semibold group"
          >
            <ArrowLeft className="h-5 w-5 mr-2 group-hover:-translate-x-1 transition-transform" />
            {t("backToRentals")}
          </Link>
        </div>
      </div>
    );
  }

  const isOwner = user?.id === rental.ownerId;

  const handlePayment = async () => {
    // Check if user is logged in
    if (!user) {
      alert(t("pleaseLoginToBuy") || "Please login to rent this equipment.");
      navigate("/login");
      return;
    }

    // Check if user is the owner
    if (isOwner) {
      alert(t("cannotBuyOwn") || "You cannot rent your own equipment.");
      return;
    }

    setLoading(true);

    try {
      // Convert PKR to USD (approximate rate: 1 USD = 280 PKR)
      const pkrToUsdRate = 280;
      const priceInUSD = Math.round((rental.pricePerDay / pkrToUsdRate) * 100) / 100;
      
      const rentalData = {
        pricePerDay: priceInUSD,
        rentalName: rental.title,
        rentalDescription: `Rs ${rental.pricePerDay.toLocaleString()}/day - ${rental.description}`,
        rentalId: rental.id,
        ownerId: rental.ownerId,
        ownerName: rental.ownerName,
      };

      const data = await createRentalCheckoutSession(rentalData);

      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error("No checkout URL received");
      }
    } catch (error) {
      console.error("Payment error:", error);
      setLoading(false);
      alert(t("paymentFailed"));
    }
  };

  const handleDelete = () => {
    if (
      window.confirm(
        t("confirmDeleteRental") ||
          "Are you sure you want to delete this rental listing?"
      )
    ) {
      deleteRental(id);
      navigate("/rentals");
    }
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) =>
      prev === rental.images.length - 1 ? 0 : prev + 1
    );
  };

  const previousImage = () => {
    setCurrentImageIndex((prev) =>
      prev === 0 ? rental.images.length - 1 : prev - 1
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-green-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <Link
          to="/rentals"
          className="inline-flex items-center text-emerald-600 hover:text-emerald-700 mb-8 transition-colors font-semibold group"
        >
          <ArrowLeft className="h-5 w-5 mr-2 group-hover:-translate-x-1 transition-transform" />
          {t("backToRentals")}
        </Link>

        {isTranslating && (
          <div className="mb-4 text-center">
            <span className="text-emerald-600 text-sm">
              🔄 {t("translating")}...
            </span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Image Carousel */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="relative bg-gray-100 rounded-3xl overflow-hidden shadow-2xl border-2 border-emerald-200">
              <img
                src={rental.images[currentImageIndex]}
                alt={`${displayRental.title} - Image ${currentImageIndex + 1}`}
                className="w-full h-96 object-cover"
              />

              {/* Navigation Arrows */}
              {rental.images.length > 1 && (
                <>
                  <button
                    onClick={previousImage}
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-emerald-600 backdrop-blur-sm text-white p-3 rounded-full transition-all hover:scale-110"
                    aria-label="Previous image"
                  >
                    <ChevronLeft className="h-6 w-6" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-emerald-600 backdrop-blur-sm text-white p-3 rounded-full transition-all hover:scale-110"
                    aria-label="Next image"
                  >
                    <ChevronRight className="h-6 w-6" />
                  </button>

                  {/* Image Counter */}
                  <div className="absolute bottom-4 right-4 bg-black/70 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-bold">
                    {currentImageIndex + 1} / {rental.images.length}
                  </div>
                </>
              )}
            </div>

            {/* Thumbnails */}
            {rental.images.length > 1 && (
              <div className="grid grid-cols-5 gap-3">
                {rental.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`relative aspect-square rounded-2xl overflow-hidden border-2 transition-all ${
                      index === currentImageIndex
                        ? "border-emerald-600 ring-2 ring-emerald-400 scale-105"
                        : "border-gray-300 hover:border-emerald-400 hover:scale-105"
                    }`}
                  >
                    <img
                      src={image}
                      alt={`Thumbnail ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details Section */}
          <div className="space-y-6">
            <div className="bg-white rounded-3xl shadow-2xl border-2 border-emerald-200 p-8">
              <div className="flex items-center justify-between mb-6">
                <span className="bg-gradient-to-r from-emerald-100 to-green-100 text-emerald-700 text-sm font-bold px-5 py-2 rounded-full">
                  {rental.category}
                </span>
                {isOwner && (
                  <div className="flex space-x-2">
                    <Link
                      to={`/edit-rental/${rental.id}`}
                      className="p-3 text-blue-600 hover:bg-blue-50 rounded-xl transition-all hover:scale-110"
                      title="Edit"
                    >
                      <Edit className="h-5 w-5" />
                    </Link>
                    <button
                      onClick={handleDelete}
                      className="p-3 text-red-600 hover:bg-red-50 rounded-xl transition-all hover:scale-110"
                      title="Delete"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="h-6 w-6 text-emerald-600" />
                <h1 className="text-3xl leading-[1.5] font-bold bg-gradient-to-r from-emerald-700 to-green-600 bg-clip-text text-transparent">
                  {displayRental.title}
                </h1>
              </div>

              <p className="text-gray-600 text-lg leading-relaxed mb-6">
                {displayRental.description}
              </p>

              {/* Price */}
              <div className="bg-gradient-to-br from-emerald-50 to-green-50 border-2 border-emerald-200 p-6 rounded-2xl mb-6">
                <div className="flex items-center justify-center">
                  <div className="text-center">
                    <span className="text-4xl font-bold text-emerald-600 block">
                      Rs {rental.pricePerDay.toLocaleString()}
                    </span>
                    <span className="text-gray-600 ml-3 text-lg">
                      {t("perDayLong")}
                    </span>
                    <span className="text-sm text-gray-500 block mt-1">
                      (~${Math.round((rental.pricePerDay / 280) * 100) / 100} USD/day)
                    </span>
                  </div>
                </div>
              </div>

              {/* Info */}
              <div className="space-y-4 mb-6">
                <div className="flex items-center text-gray-700 bg-gray-50 p-4 rounded-xl">
                  <MapPin className="h-5 w-5 mr-3 text-emerald-600" />
                  <span className="font-medium">{displayRental.location}</span>
                </div>
                <div className="flex items-center text-gray-700 bg-gray-50 p-4 rounded-xl">
                  <User className="h-5 w-5 mr-3 text-emerald-600" />
                  <span className="font-medium">
                    {t("owner")}: {displayRental.ownerName}
                  </span>
                </div>
                <div className="flex items-center text-gray-700 bg-gray-50 p-4 rounded-xl">
                  <Calendar className="h-5 w-5 mr-3 text-emerald-600" />
                  <span className="font-medium">
                    {t("available")}:
                    <span
                      className={
                        rental.availability
                          ? "text-emerald-600 ml-2"
                          : "text-red-600 ml-2"
                      }
                    >
                      {rental.availability ? t("yes") : t("no")}
                    </span>
                  </span>
                </div>
              </div>

              {/* Actions */}
              {rental.availability && !isOwner && (
                <div className="space-y-3">
                  <button
                    onClick={handlePayment}
                    disabled={loading}
                    className="w-full bg-gradient-to-br from-emerald-500 to-green-600 text-white py-4 px-6 rounded-2xl hover:from-emerald-600 hover:to-green-700 transition-all duration-300 font-bold text-lg shadow-lg hover:shadow-xl hover:scale-[1.02] flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    <ShoppingCart className="h-5 w-5" />
                    {loading ? t("processing") : t("rentNow")}
                  </button>
                  <button
                    onClick={() => setShowMessageModal(true)}
                    className="w-full border-2 border-emerald-600 text-emerald-600 py-4 px-6 rounded-2xl hover:bg-emerald-50 transition-all duration-300 font-bold text-lg flex items-center justify-center gap-2"
                  >
                    <MessageCircle className="h-5 w-5" />
                    {t("msgSendButton")}
                  </button>
                </div>
              )}

              {!rental.availability && (
                <div className="bg-gradient-to-r from-red-50 to-red-100 border-2 border-red-200 rounded-2xl p-6">
                  <p className="text-red-700 font-bold flex items-center">
                    <Sparkles className="h-5 w-5 mr-2" />
                    {t("rentalUnavailableNotice")}
                  </p>
                </div>
              )}

              {isOwner && (
                <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border-2 border-blue-200 rounded-2xl p-6">
                  <p className="text-blue-700 font-bold flex items-center">
                    <CheckCircle className="h-5 w-5 mr-2" />
                    {t("rentalOwnerNotice")}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-12">
          <div className="flex items-center gap-2 mb-8">
            <Sparkles className="h-6 w-6 text-emerald-600" />
            <h2 className="text-3xl leading-[1.5] font-bold bg-gradient-to-r from-emerald-700 to-green-600 bg-clip-text text-transparent">
              {t("additionalInformation")}
            </h2>
          </div>
          <div className="bg-white rounded-3xl shadow-2xl border-2 border-emerald-200 p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-emerald-600" />
                  {t("rentalTerms")}
                </h3>
                <ul className="text-gray-700 space-y-3">
                  <li className="flex items-start">
                    <span className="text-emerald-600 mr-3 font-bold">•</span>
                    <span className="leading-relaxed">
                      {t("termMinPeriod")}
                    </span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-emerald-600 mr-3 font-bold">•</span>
                    <span className="leading-relaxed">{t("termDeposit")}</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-emerald-600 mr-3 font-bold">•</span>
                    <span className="leading-relaxed">
                      {t("termInspection")}
                    </span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-emerald-600 mr-3 font-bold">•</span>
                    <span className="leading-relaxed">{t("termFuel")}</span>
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <User className="h-5 w-5 text-emerald-600" />
                  {t("contactInformation")}
                </h3>
                <div className="space-y-4">
                  <div className="bg-gradient-to-r from-emerald-50 to-green-50 p-4 rounded-xl">
                    <p className="text-gray-700">
                      <span className="font-bold text-emerald-700">
                        {t("owner")}:
                      </span>{" "}
                      {displayRental.ownerName}
                    </p>
                  </div>
                  <div className="bg-gradient-to-r from-emerald-50 to-green-50 p-4 rounded-xl">
                    <p className="text-gray-700">
                      <span className="font-bold text-emerald-700">
                        {t("location")}:
                      </span>{" "}
                      {displayRental.location}
                    </p>
                  </div>
                  <div className="bg-gradient-to-r from-emerald-50 to-green-50 p-4 rounded-xl">
                    <p className="text-gray-700">
                      <span className="font-bold text-emerald-700">
                        {t("listed")}:
                      </span>{" "}
                      {new Date(rental.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Message Modal - UPDATED WITH PRODUCT DETAILS */}
      <MessageModal
        isOpen={showMessageModal}
        onClose={() => setShowMessageModal(false)}
        ownerEmail={rental.ownerEmail}
        ownerName={rental.ownerName}
        productName={rental.title}
        productType="Rental"
        productDetails={{
          category: rental.category,
          location: rental.location,
          price: rental.pricePerDay
        }}
      />
    </div>
  );
};

export default RentalDetail;