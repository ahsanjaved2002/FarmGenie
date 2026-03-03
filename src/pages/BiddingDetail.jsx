import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  MapPin,
  Clock,
  DollarSign,
  User,
  Edit,
  Trash2,
  Gavel,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  CheckCircle,
  TrendingUp,
  X,
  Trophy,
  Mail,
  Shield,
} from "lucide-react";
import { useData } from "../context/DataContext";
import { useAuth } from "../context/AuthContext";
import { formatDistanceToNow } from "date-fns";
import { useTranslation } from "react-i18next";
import translationService from "../services/translationService";
import emailService from "../services/emailService";
import { supabase } from "../supabase";

const BiddingDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { biddings, deleteBidding, placeBid } = useData();
  const { user } = useAuth();
  const { t, i18n } = useTranslation("common");

  const [bidAmount, setBidAmount] = useState("");
  const [bidError, setBidError] = useState("");
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [emailSent, setEmailSent] = useState(false);

  // Translation state
  const [translatedBidding, setTranslatedBidding] = useState(null);
  const [isTranslating, setIsTranslating] = useState(false);

  const bidding = biddings.find((b) => b.id === id);

  // Check if auction ended and send emails - FIXED
  useEffect(() => {
    const checkAuctionEnd = async () => {
      if (bidding && !emailSent) {
        const result = await emailService.checkAndNotifyAuctionEnd(bidding);
        if (result.notificationSent) {
          setEmailSent(true);
          console.log('✅ Auction end emails sent to owner and winner');
        }
      }
    };

    checkAuctionEnd();
  }, [bidding, emailSent]);

  // Translation effect
  useEffect(() => {
    let isMounted = true;

    const translateBidding = async () => {
      if (!bidding) {
        setTranslatedBidding(null);
        setIsTranslating(false);
        return;
      }

      if (i18n.language === "en") {
        setTranslatedBidding(bidding);
        setIsTranslating(false);
        return;
      }

      setIsTranslating(true);
      const targetLang = i18n.language;

      try {
        const translated = await translationService.translateObject(
          bidding,
          ["title", "description", "location", "ownerName"],
          targetLang
        );

        if (isMounted) {
          setTranslatedBidding(translated);
          setIsTranslating(false);
        }
      } catch (error) {
        console.error("Translation failed:", error);
        if (isMounted) {
          setTranslatedBidding(bidding);
          setIsTranslating(false);
        }
      }
    };

    const timer = setTimeout(translateBidding, 300);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [bidding, i18n.language]);

  // Use translated data
  const displayBidding = translatedBidding || bidding;

  if (!bidding) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-green-50 flex items-center justify-center">
        <div className="text-center bg-white rounded-3xl shadow-2xl border-2 border-emerald-200 p-12">
          <div className="inline-flex p-6 rounded-full bg-gradient-to-br from-red-100 to-red-200 mb-6">
            <Gavel className="h-16 w-16 text-red-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            {t("auctionNotFound")}
          </h1>
          <Link
            to="/bidding"
            className="inline-flex items-center text-emerald-600 hover:text-emerald-700 font-semibold group"
          >
            <ArrowLeft className="h-5 w-5 mr-2 group-hover:-translate-x-1 transition-transform" />
            {t("backToBidding")}
          </Link>
        </div>
      </div>
    );
  }

  const isOwner = user?.uid === bidding.ownerId;
  const isActive =
    bidding.status === "active" && new Date() < new Date(bidding.endDate);
  const auctionEnded = new Date() >= new Date(bidding.endDate);

  // Get winner info
  const highestBid = bidding.bids && bidding.bids.length > 0
    ? bidding.bids.reduce((prev, current) =>
        prev.amount > current.amount ? prev : current
      )
    : null;

  const handleDelete = () => {
    if (
      window.confirm(
        t("confirmDeleteAuction") ||
          "Are you sure you want to delete this auction?"
      )
    ) {
      deleteBidding(id);
      navigate("/bidding");
    }
  };

  const handlePlaceBid = (e) => {
    e.preventDefault();
    setBidError("");

    if (!user) {
      setBidError(t("pleaseLoginToBid") || "Please login to place a bid.");
      // Redirect to login after a short delay
      setTimeout(() => {
        navigate("/login");
      }, 2000);
      return;
    }

    if (isOwner) {
      setBidError(t("cannotBidOwn") || "You cannot bid on your own auction.");
      return;
    }

    const amount = parseFloat(bidAmount);
    if (!amount || amount <= bidding.currentBid) {
      setBidError(
        `${t("bidHigherThan")} Rs ${bidding.currentBid.toLocaleString()}`
      );
      return;
    }

    placeBid(id, {
      amount: amount,
      bidderId: user.uid,
      bidderName: user.displayName || user.email,
      bidderEmail: user.email,
    });

    setBidAmount("");
  };

  const formatTimeRemaining = (endDate) => {
    const now = new Date();
    const end = new Date(endDate);
    const diff = end - now;

    if (diff <= 0) return t("auctionEnded");

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) return `${days}d ${hours}h ${minutes}m`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) =>
      prev === bidding.images.length - 1 ? 0 : prev + 1
    );
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) =>
      prev === 0 ? bidding.images.length - 1 : prev - 1
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-green-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <Link
          to="/bidding"
          className="inline-flex items-center text-emerald-600 hover:text-emerald-700 mb-6 transition-colors font-semibold group"
        >
          <ArrowLeft className="h-5 w-5 mr-2 group-hover:-translate-x-1 transition-transform" />
          {t("backToBidding")}
        </Link>

        {isTranslating && (
          <div className="mb-4 text-center">
            <span className="text-emerald-600 text-sm">{t("translating")}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Image Gallery */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="relative bg-gray-100 rounded-3xl overflow-hidden shadow-2xl border-2 border-emerald-200 group">
              <img
                src={bidding.images[currentImageIndex]}
                alt={`${displayBidding.title} - Image ${currentImageIndex + 1}`}
                className="w-full h-96 object-cover"
              />

              {/* Navigation Arrows */}
              {bidding.images.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-emerald-600 backdrop-blur-sm text-white p-3 rounded-full opacity-0 group-hover:opacity-100 transition-all hover:scale-110"
                    aria-label="Previous image"
                  >
                    <ChevronLeft className="h-6 w-6" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-emerald-600 backdrop-blur-sm text-white p-3 rounded-full opacity-0 group-hover:opacity-100 transition-all hover:scale-110"
                    aria-label="Next image"
                  >
                    <ChevronRight className="h-6 w-6" />
                  </button>

                  {/* Image Counter */}
                  <div className="absolute bottom-4 right-4 bg-black/70 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-bold">
                    {currentImageIndex + 1} / {bidding.images.length}
                  </div>
                </>
              )}
            </div>

            {/* Thumbnails */}
            {bidding.images.length > 1 && (
              <div className="grid grid-cols-5 gap-3">
                {bidding.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`relative aspect-square rounded-2xl overflow-hidden border-2 transition-all ${
                      currentImageIndex === index
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
                {isOwner && (
                  <div className="flex space-x-2">
                    <Link
                      to={`/edit-bidding/${bidding.id}`}
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
                  {displayBidding.title}
                </h1>
              </div>

              <p className="text-gray-600 text-lg leading-relaxed mb-6">
                {displayBidding.description}
              </p>

              {/* Time Remaining */}
              <div className="bg-gradient-to-r from-orange-50 to-amber-50 border-2 border-orange-200 p-5 rounded-2xl mb-6">
                <div className="flex items-center justify-center">
                  <Clock className="h-6 w-6 text-orange-600 mr-2" />
                  <span className="text-lg font-bold text-orange-600">
                    {formatTimeRemaining(bidding.endDate)}
                  </span>
                </div>
              </div>

              {/* Price Information */}
              <div className="space-y-4 mb-6">
                <div className="bg-gray-50 p-4 rounded-xl">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 font-medium">
                      {t("startingPrice")}
                    </span>
                    <span className="text-lg font-bold text-gray-900">
                      Rs {bidding.startingPrice.toLocaleString()}
                    </span>
                  </div>
                </div>
                <div className="bg-gradient-to-br from-emerald-50 to-green-50 border-2 border-emerald-200 p-5 rounded-2xl">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 font-medium">
                      {t("currentBidLabel")}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-3xl font-bold text-emerald-600">
                        Rs {bidding.currentBid.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Details */}
              <div className="space-y-3 mb-6">
                <div className="flex items-center text-gray-700 bg-gray-50 p-4 rounded-xl">
                  <MapPin className="h-5 w-5 mr-3 text-emerald-600" />
                  <span className="font-medium">{displayBidding.location}</span>
                </div>
                <div className="flex items-center text-gray-700 bg-gray-50 p-4 rounded-xl">
                  <TrendingUp className="h-5 w-5 mr-3 text-emerald-600" />
                  <span className="font-medium">
                    {t("areaLabel")}: {bidding.area}
                  </span>
                </div>
                <div className="flex items-center text-gray-700 bg-gray-50 p-4 rounded-xl">
                  <User className="h-5 w-5 mr-3 text-emerald-600" />
                  <span className="font-medium">
                    {t("owner")}: {displayBidding.ownerName}
                  </span>
                </div>
              </div>

              {/* Winner Info - Only visible to owner when auction ends */}
              {isOwner && auctionEnded && highestBid && (
                <div className="bg-gradient-to-br from-yellow-50 to-amber-50 border-2 border-yellow-400 rounded-2xl p-6 mb-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Trophy className="h-6 w-6 text-yellow-600" />
                    <h3 className="text-xl font-bold text-yellow-900">
                      🏆 Auction Winner
                    </h3>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between bg-white/60 p-3 rounded-lg">
                      <span className="text-gray-700 font-medium flex items-center gap-2">
                        <User className="h-4 w-4 text-yellow-600" />
                        Winner Name:
                      </span>
                      <span className="font-bold text-gray-900">
                        {highestBid.bidderName}
                      </span>
                    </div>
                    <div className="flex items-center justify-between bg-white/60 p-3 rounded-lg">
                      <span className="text-gray-700 font-medium flex items-center gap-2">
                        <Mail className="h-4 w-4 text-yellow-600" />
                        Email:
                      </span>
                      <span className="font-bold text-gray-900">
                        {highestBid.bidderEmail}
                      </span>
                    </div>
                    <div className="flex items-center justify-between bg-white/60 p-3 rounded-lg">
                      <span className="text-gray-700 font-medium flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-yellow-600" />
                        Winning Bid:
                      </span>
                      <span className="font-bold text-emerald-600 text-xl">
                        Rs {highestBid.amount.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between bg-white/60 p-3 rounded-lg">
                      <span className="text-gray-700 font-medium flex items-center gap-2">
                        <Clock className="h-4 w-4 text-yellow-600" />
                        Bid Time:
                      </span>
                      <span className="font-bold text-gray-900">
                        {formatDistanceToNow(new Date(highestBid.timestamp), {
                          addSuffix: true,
                        })}
                      </span>
                    </div>
                  </div>
                  <div className="mt-4 p-3 bg-yellow-100 rounded-lg">
                    <p className="text-sm text-yellow-900 flex items-start gap-2">
                      <Shield className="h-5 w-5 flex-shrink-0 mt-0.5" />
                      <span>
                        <strong>📧 Email Sent!</strong> Both you and the winner have received emails with contact details and a unique verification code for secure transaction.
                      </span>
                    </p>
                  </div>
                </div>
              )}

              {/* Bidding Form */}
              {isActive && !isOwner && user && (
                <div className="bg-gradient-to-br from-emerald-50 to-green-50 border-2 border-emerald-200 rounded-2xl p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Gavel className="h-5 w-5 text-emerald-600" />
                    {t("placeYourBid")}
                  </h3>
                  <form onSubmit={handlePlaceBid} className="space-y-4">
                    <div>
                      <input
                        type="number"
                        value={bidAmount}
                        onChange={(e) => setBidAmount(e.target.value)}
                        placeholder={`${t("minimum")}: Rs ${(
                          bidding.currentBid + 1
                        ).toLocaleString()}`}
                        min={bidding.currentBid + 1}
                        className="w-full px-4 py-3 border-2 border-emerald-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-0 bg-white transition-all"
                      />
                      {bidError && (
                        <p className="mt-2 text-sm text-red-600 font-medium flex items-center">
                          <X className="h-4 w-4 mr-1" />
                          {bidError}
                        </p>
                      )}
                    </div>
                    <button
                      type="submit"
                      className="w-full bg-gradient-to-br from-emerald-500 to-green-600 text-white py-4 px-6 rounded-2xl hover:from-emerald-600 hover:to-green-700 transition-all duration-300 font-bold text-lg shadow-lg hover:shadow-xl hover:scale-[1.02] flex items-center justify-center gap-2"
                    >
                      <Gavel className="h-5 w-5" />
                      {t("placeBid")}
                    </button>
                  </form>
                </div>
              )}

              {!user && isActive && (
                <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border-2 border-blue-200 rounded-2xl p-6">
                  <p className="text-blue-700 font-bold">
                    <Link to="/login" className="underline hover:text-blue-800">
                      {t("loginToBidPrefix")}
                    </Link>{" "}
                    {t("loginToBidSuffix")}
                  </p>
                </div>
              )}

              {!isActive && !isOwner && (
                <div className="bg-gradient-to-r from-red-50 to-red-100 border-2 border-red-200 rounded-2xl p-6">
                  <p className="text-red-700 font-bold flex items-center">
                    <Sparkles className="h-5 w-5 mr-2" />
                    {t("auctionEnded")}
                  </p>
                </div>
              )}

              {isOwner && !auctionEnded && (
                <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border-2 border-blue-200 rounded-2xl p-6">
                  <p className="text-blue-700 font-bold flex items-center">
                    <CheckCircle className="h-5 w-5 mr-2" />
                    {t("auctionOwnerNotice") ||
                      "This is your auction listing. You can edit or delete it using the buttons above."}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bid History */}
        <div className="mt-12">
          <div className="flex items-center gap-2 mb-8">
            <Sparkles className="h-6 w-6 text-emerald-600" />
            <h2 className="text-3xl leading-[1.5] font-bold bg-gradient-to-r from-emerald-700 to-green-600 bg-clip-text text-transparent">
              {t("bidHistory")}
            </h2>
          </div>
          <div className="bg-white rounded-3xl shadow-2xl border-2 border-emerald-200 overflow-hidden">
            {bidding.bids && bidding.bids.length > 0 ? (
              <div className="divide-y divide-gray-200">
                {bidding.bids
                  .slice()
                  .reverse()
                  .map((bid, index) => (
                    <div
                      key={bid.id}
                      className="p-6 flex items-center justify-between hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center space-x-4">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-lg ${
                            index === 0
                              ? "bg-gradient-to-br from-emerald-500 to-green-600"
                              : "bg-gradient-to-br from-gray-400 to-gray-500"
                          }`}
                        >
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900">
                            {bid.bidderName}
                          </p>
                          <p className="text-sm text-gray-500">
                            {formatDistanceToNow(new Date(bid.timestamp), {
                              addSuffix: true,
                            })}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p
                          className={`text-2xl font-bold ${
                            index === 0 ? "text-emerald-600" : "text-gray-900"
                          }`}
                        >
                          Rs {bid.amount.toLocaleString()}
                        </p>
                        {index === 0 && (
                          <p className="text-sm text-emerald-600 font-bold flex items-center justify-end gap-1">
                            <CheckCircle className="h-4 w-4" />
                            {t("highestBid")}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <div className="p-12 text-center">
                <div className="inline-flex p-6 rounded-full bg-gradient-to-br from-emerald-100 to-green-100 mb-4">
                  <Gavel className="h-12 w-12 text-emerald-600" />
                </div>
                <p className="text-gray-500 text-lg">{t("noBidsYet")}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BiddingDetail;