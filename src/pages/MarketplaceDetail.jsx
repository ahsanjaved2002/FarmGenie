import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  MapPin,
  Package,
  DollarSign,
  User,
  Edit,
  Trash2,
  ShoppingCart,
  MessageCircle,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { useData } from "../context/DataContext";
import { useAuth } from "../context/AuthContext";
import MessageModal from "../components/MessageModal";
import { useTranslation } from "react-i18next";
import translationService from "../services/translationService";
import { createCheckoutSession } from "../services/stripeService";

const MarketplaceDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { sales, deleteSale } = useData();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [paymentError, setPaymentError] = useState(null);
  const { t, i18n } = useTranslation("common");

  // Translation state
  const [translatedSale, setTranslatedSale] = useState(null);
  const [isTranslating, setIsTranslating] = useState(false);

  const sale = sales.find((s) => s.id === id);

  // Translation effect
  useEffect(() => {
    let isMounted = true;

    const translateSale = async () => {
      if (!sale) {
        setTranslatedSale(null);
        setIsTranslating(false);
        return;
      }

      if (i18n.language === "en") {
        setTranslatedSale(sale);
        setIsTranslating(false);
        return;
      }

      setIsTranslating(true);
      const targetLang = i18n.language;

      try {
        const translated = await translationService.translateArray(
          [sale],
          ["title", "description", "location", "ownerName"],
          targetLang
        );

        if (isMounted && translated.length > 0) {
          setTranslatedSale(translated[0]);
          setIsTranslating(false);
        }
      } catch (error) {
        console.error("Translation failed:", error);
        if (isMounted) {
          setTranslatedSale(sale);
          setIsTranslating(false);
        }
      }
    };

    const timer = setTimeout(translateSale, 300);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [sale, i18n.language]);

  // Use translated data
  const displaySale = translatedSale || sale;

  if (!sale) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-green-50 flex items-center justify-center">
        <div className="text-center bg-white rounded-3xl shadow-2xl border-2 border-emerald-200 p-12">
          <div className="inline-flex p-6 rounded-full bg-gradient-to-br from-red-100 to-red-200 mb-6">
            <Package className="h-16 w-16 text-red-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            {t("productNotFound")}
          </h1>
          <Link
            to="/marketplace"
            className="inline-flex items-center text-emerald-600 hover:text-emerald-700 font-semibold group"
          >
            <ArrowLeft className="h-5 w-5 mr-2 group-hover:-translate-x-1 transition-transform" />
            {t("backToMarketplace")}
          </Link>
        </div>
      </div>
    );
  }

  const isOwner = user?.id === sale.ownerId;

  const handlePayment = async () => {
    // Check if user is logged in
    if (!user) {
      alert(t("pleaseLoginToBuy") || "Please login to purchase this product.");
      navigate("/login");
      return;
    }

    // Check if user is the owner
    if (isOwner) {
      alert(t("cannotBuyOwn") || "You cannot purchase your own product.");
      return;
    }

    setLoading(true);
    setPaymentError(null);

    try {
      console.log('Starting payment process for product:', sale.title);
      
      // Convert PKR to USD (approximate rate: 1 USD = 280 PKR)
      const pkrToUsdRate = 280;
      const priceInUSD = Math.round((sale.price / pkrToUsdRate) * 100) / 100;
      
      console.log('Payment details:', {
        title: sale.title,
        originalPrice: sale.price,
        priceInUSD,
        productId: sale.id
      });
      
      const paymentData = {
        price: priceInUSD,
        productName: sale.title,
        productDescription: `Rs ${sale.price.toLocaleString()} - ${sale.description}`,
        productId: sale.id,
        sellerId: sale.ownerId,
        sellerName: sale.ownerName,
      };

      const data = await createCheckoutSession(paymentData);
      console.log('Checkout session created:', data);

      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error("No checkout URL received from Stripe");
      }
    } catch (error) {
      console.error("Payment error details:", {
        message: error.message,
        stack: error.stack,
        response: error.response
      });
      
      setPaymentError(error.message);
      setLoading(false);
      
      // Show user-friendly error message
      const errorMessage = error.message.includes('Failed to fetch') 
        ? 'Network error. Please check your internet connection and try again.'
        : error.message.includes('API key')
        ? 'Payment service configuration error. Please contact support.'
        : `Payment failed: ${error.message}`;
      
      alert(errorMessage);
    }
  };

  const handleDelete = () => {
    if (
      window.confirm(
        t("confirmDeleteProduct") ||
          "Are you sure you want to delete this product listing?"
      )
    ) {
      deleteSale(id);
      navigate("/marketplace");
    }
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) =>
      prev === sale.images.length - 1 ? 0 : prev + 1
    );
  };

  const previousImage = () => {
    setCurrentImageIndex((prev) =>
      prev === 0 ? sale.images.length - 1 : prev - 1
    );
  };

  const getConditionColor = (condition) => {
    switch (condition) {
      case "new":
        return "from-emerald-100 to-green-100 text-emerald-700";
      case "used":
        return "from-yellow-100 to-amber-100 text-yellow-700";
      case "refurbished":
        return "from-purple-100 to-pink-100 text-purple-700";
      default:
        return "from-gray-100 to-gray-200 text-gray-700";
    }
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case "crops":
        return "from-emerald-100 to-green-100 text-emerald-700";
      case "seeds":
        return "from-blue-100 to-cyan-100 text-blue-700";
      case "tools":
        return "from-orange-100 to-amber-100 text-orange-700";
      case "fertilizer":
        return "from-purple-100 to-pink-100 text-purple-700";
      default:
        return "from-gray-100 to-gray-200 text-gray-700";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-green-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <Link
          to="/marketplace"
          className="inline-flex items-center text-emerald-600 hover:text-emerald-700 mb-8 transition-colors font-semibold group"
        >
          <ArrowLeft className="h-5 w-5 mr-2 group-hover:-translate-x-1 transition-transform" />
          {t("backToMarketplace")}
        </Link>

        {/* Translation indicator */}
        {isTranslating && (
          <div className="mb-4 bg-gradient-to-r from-emerald-100 to-green-100 rounded-2xl p-3 inline-block">
            <p className="text-emerald-700 font-semibold text-sm">
              {t("translating") || "Translating..."}
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Image Carousel */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="relative bg-gray-100 rounded-3xl overflow-hidden shadow-2xl border-2 border-emerald-200">
              <img
                src={sale.images[currentImageIndex]}
                alt={`${displaySale.title} - Image ${currentImageIndex + 1}`}
                className="w-full h-96 object-cover"
              />

              {/* Navigation Arrows */}
              {sale.images.length > 1 && (
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
                    {currentImageIndex + 1} / {sale.images.length}
                  </div>
                </>
              )}
            </div>

            {/* Thumbnails */}
            {sale.images.length > 1 && (
              <div className="grid grid-cols-5 gap-3">
                {sale.images.map((image, index) => (
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

          {/* Details */}
          <div className="space-y-6">
            <div className="bg-white rounded-3xl shadow-2xl border-2 border-emerald-200 p-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-2 gap-2">
                  <span
                    className={`text-sm font-bold px-5 py-2 rounded-full bg-gradient-to-r ${getCategoryColor(
                      sale.category
                    )}`}
                  >
                    {t(sale.category)}
                  </span>
                  <span
                    className={`text-sm font-bold px-5 py-2 rounded-full bg-gradient-to-r ${getConditionColor(
                      sale.condition
                    )}`}
                  >
                    {t(sale.condition)}
                  </span>
                </div>
                {isOwner && (
                  <div className="flex space-x-2">
                    <Link
                      to={`/edit-sale/${sale.id}`}
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
                  {displaySale.title}
                </h1>
              </div>

              <p className="text-gray-600 text-lg leading-relaxed mb-6">
                {displaySale.description}
              </p>

              {/* Price */}
              <div className="bg-gradient-to-br from-emerald-50 to-green-50 border-2 border-emerald-200 p-6 rounded-2xl mb-6">
                <div className="flex items-center justify-center">
                  <div className="text-center">
                    <span className="text-4xl font-bold text-emerald-600 block">
                      Rs {sale.price.toLocaleString()}
                    </span>
                    <span className="text-sm text-gray-500">
                      (~${Math.round((sale.price / 280) * 100) / 100} USD)
                    </span>
                  </div>
                </div>
              </div>

              {/* Details */}
              <div className="space-y-4 mb-6">
                <div className="flex items-center text-gray-700 bg-gray-50 p-4 rounded-xl">
                  <MapPin className="h-5 w-5 mr-3 text-emerald-600" />
                  <span className="font-medium">{displaySale.location}</span>
                </div>
                <div className="flex items-center text-gray-700 bg-gray-50 p-4 rounded-xl">
                  <User className="h-5 w-5 mr-3 text-emerald-600" />
                  <span className="font-medium">
                    {t("sellerLabel") || "Seller"}: {displaySale.ownerName}
                  </span>
                </div>
                <div className="flex items-center text-gray-700 bg-gray-50 p-4 rounded-xl">
                  <Package className="h-5 w-5 mr-3 text-emerald-600" />
                  <span className="font-medium">
                    {t("statusLabel") || "Status"}:
                    <span
                      className={
                        sale.available
                          ? "text-emerald-600 ml-2"
                          : "text-red-600 ml-2"
                      }
                    >
                      {sale.available ? t("available") : t("sold")}
                    </span>
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              {sale.available && !isOwner && (
                <div className="space-y-3">
                  <button
                    onClick={handlePayment}
                    disabled={loading}
                    className="w-full bg-gradient-to-br from-emerald-500 to-green-600 text-white py-4 px-6 rounded-2xl hover:from-emerald-600 hover:to-green-700 transition-all duration-300 font-bold text-lg shadow-lg hover:shadow-xl hover:scale-[1.02] flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    <ShoppingCart className="h-5 w-5" />
                    {loading ? t("processing") : t("buyNow")}
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

              {!sale.available && (
                <div className="bg-gradient-to-r from-red-50 to-red-100 border-2 border-red-200 rounded-2xl p-6">
                  <p className="text-red-700 font-bold flex items-center">
                    <Sparkles className="h-5 w-5 mr-2" />
                    {t("thisProductNotAvailable")}
                  </p>
                </div>
              )}

              {isOwner && (
                <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border-2 border-blue-200 rounded-2xl p-6">
                  <p className="text-blue-700 font-bold flex items-center">
                    <CheckCircle className="h-5 w-5 mr-2" />
                    {t("yourProductListingNotice") ||
                      "This is your product listing. You can edit or delete it using the buttons above."}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Additional Information */}
        <div className="mt-12">
          <div className="flex items-center gap-2 mb-8">
            <Sparkles className="h-6 w-6 text-emerald-600" />
            <h2 className="text-3xl leading-[1.5] font-bold bg-gradient-to-r from-emerald-700 to-green-600 bg-clip-text text-transparent">
              {t("productDetailsTitle") || "Product Details"}
            </h2>
          </div>
          <div className="bg-white rounded-3xl shadow-2xl border-2 border-emerald-200 p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-emerald-600" />
                  {t("productInformationTitle") || "Product Information"}
                </h3>
                <div className="space-y-4">
                  <div className="bg-gradient-to-r from-emerald-50 to-green-50 p-4 rounded-xl">
                    <div className="flex justify-between">
                      <span className="text-gray-600 font-medium">
                        {t("category")}
                      </span>
                      <span className="font-bold text-gray-900 capitalize">
                        {t(sale.category)}
                      </span>
                    </div>
                  </div>
                  <div className="bg-gradient-to-r from-emerald-50 to-green-50 p-4 rounded-xl">
                    <div className="flex justify-between">
                      <span className="text-gray-600 font-medium">
                        {t("condition")}
                      </span>
                      <span className="font-bold text-gray-900 capitalize">
                        {t(sale.condition)}
                      </span>
                    </div>
                  </div>
                  <div className="bg-gradient-to-r from-emerald-50 to-green-50 p-4 rounded-xl">
                    <div className="flex justify-between">
                      <span className="text-gray-600 font-medium">
                        {t("price")}
                      </span>
                      <span className="font-bold text-emerald-600">
                        Rs {sale.price.toLocaleString()}
                        <span className="text-xs text-gray-500 block">
                          (~${Math.round((sale.price / 280) * 100) / 100} USD)
                        </span>
                      </span>
                    </div>
                  </div>
                  <div className="bg-gradient-to-r from-emerald-50 to-green-50 p-4 rounded-xl">
                    <div className="flex justify-between">
                      <span className="text-gray-600 font-medium">
                        {t("availabilityLabel") || "Availability"}:
                      </span>
                      <span
                        className={`font-bold ${
                          sale.available ? "text-emerald-600" : "text-red-600"
                        }`}
                      >
                        {sale.available ? t("available") : t("sold")}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="text-xl  font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <User className="h-5 w-5 text-emerald-600" />
                  {t("sellerInformationTitle") || "Seller Information"}
                </h3>
                <div className="space-y-4">
                  <div className="bg-gradient-to-r from-emerald-50 to-green-50 p-4 rounded-xl">
                    <div className="flex justify-between">
                      <span className="text-gray-600 font-medium">
                        {t("sellerLabel") || "Seller"}:
                      </span>
                      <span className="font-bold text-gray-900">
                        {displaySale.ownerName}
                      </span>
                    </div>
                  </div>
                  <div className="bg-gradient-to-r from-emerald-50 to-green-50 p-4 rounded-xl">
                    <div className="flex justify-between">
                      <span className="text-gray-600 font-medium">
                        {t("location")}:
                      </span>
                      <span className="font-bold text-gray-900">
                        {displaySale.location}
                      </span>
                    </div>
                  </div>
                  <div className="bg-gradient-to-r from-emerald-50 to-green-50 p-4 rounded-xl">
                    <div className="flex justify-between">
                      <span className="text-gray-600 font-medium">
                        {t("listed")}:
                      </span>
                      <span className="font-bold text-gray-900">
                        {new Date(sale.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className="bg-gradient-to-r from-emerald-50 to-green-50 p-4 rounded-xl">
                    <div className="flex justify-between">
                      <span className="text-gray-600 font-medium">
                        {t("updatedLabel") || "Updated"}:
                      </span>
                      <span className="font-bold text-gray-900">
                        {new Date(sale.updatedAt).toLocaleDateString()}
                      </span>
                    </div>
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
        ownerEmail={sale.ownerEmail}
        ownerName={sale.ownerName}
        productName={sale.title}
        productType="Product"
        productDetails={{
          category: sale.category,
          condition: sale.condition,
          location: sale.location,
          price: sale.price
        }}
      />
    </div>
  );
};

export default MarketplaceDetail;