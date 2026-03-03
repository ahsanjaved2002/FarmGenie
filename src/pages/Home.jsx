import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Tractor,
  MapPin,
  ShoppingBag,
  Users,
  Star,
  TrendingUp,
  Sparkles,
  MessageSquare,
  Upload,
  X,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useTranslation } from "react-i18next";
import { db } from "../firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import heroDesktop from "../images/hero_desktop.webp";
import heroMobile from "../images/hero_mobile.webp";
import emailService from "../services/emailService.js";


const Home = () => {
  const { user } = useAuth();
  const { t } = useTranslation("common");
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [feedbackData, setFeedbackData] = useState({
    name: "",
    message: "",
    screenshot: null,
  });
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [ratingMessage, setRatingMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // Set scrollbar to always show on mount
  useEffect(() => {
    document.documentElement.style.overflowY = "scroll";
  }, []);

  useEffect(() => {
    if (showFeedbackModal) {
      const scrollY = window.scrollY;
      document.body.style.position = "fixed";
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = "100%";
      document.body.style.left = "0";
      document.body.style.right = "0";
    } else {
      const scrollY = document.body.style.top;
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.width = "";
      document.body.style.left = "";
      document.body.style.right = "";
      if (scrollY) {
        window.scrollTo(0, parseInt(scrollY || "0") * -1);
      }
    }

    return () => {
      const scrollY = document.body.style.top;
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.width = "";
      document.body.style.left = "";
      document.body.style.right = "";
      if (scrollY) {
        window.scrollTo(0, parseInt(scrollY || "0") * -1);
      }
    };
  }, [showFeedbackModal]);

  // Prevent body scroll when rating modal is open
  useEffect(() => {
    if (showRatingModal) {
      const scrollY = window.scrollY;
      document.body.style.position = "fixed";
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = "100%";
      document.body.style.left = "0";
      document.body.style.right = "0";
    } else {
      const scrollY = document.body.style.top;
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.width = "";
      document.body.style.left = "";
      document.body.style.right = "";
      if (scrollY) {
        window.scrollTo(0, parseInt(scrollY || "0") * -1);
      }
    }

    return () => {
      const scrollY = document.body.style.top;
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.width = "";
      document.body.style.left = "";
      document.body.style.right = "";
      if (scrollY) {
        window.scrollTo(0, parseInt(scrollY || "0") * -1);
      }
    };
  }, [showRatingModal]);

  const features = [
    {
      icon: Tractor,
      title: t("equipmentRentals"),
      description: t("featuresSubtitle"),
      color: "from-emerald-400 to-green-500",
      link: "/rentals",
      requiresAuth: false,
    },
    {
      icon: MapPin,
      title: t("landBidding"),
      description: t("step2Desc"),
      color: "from-blue-400 to-cyan-500",
      link: "/bidding",
      requiresAuth: false,
    },
    {
      icon: ShoppingBag,
      title: t("marketplace"),
      description: t("homeHeroSubtitle"),
      color: "from-orange-400 to-amber-500",
      link: "/marketplace",
      requiresAuth: false,
    },
    {
      icon: TrendingUp,
      title: t("dashboard") || "Dashboard",
      description:
        t("dashboardDesc") ||
        "Access your personal dashboard to manage your activities",
      color: "from-purple-400 to-indigo-500",
      link: "/dashboard",
      requiresAuth: true,
    },
  ];

  const stats = [
    { label: t("statActiveFarmers"), value: "2,500+", icon: Users },
    { label: t("statEquipmentListed"), value: "1,200+", icon: Tractor },
    { label: t("statLandParcels"), value: "800+", icon: MapPin },
    { label: t("statProductsSold"), value: "15,000+", icon: TrendingUp },
  ];

  const testimonials = [
    {
      name: "John Miller",
      location: "Iowa",
      text: "FarmConnect helped me rent the perfect harvester for my corn crop. Saved me thousands compared to buying new equipment.",
      rating: 5,
    },
    {
      name: "Sarah Johnson",
      location: "Nebraska",
      text: "I successfully bid on 50 acres of prime farmland through this platform. The process was transparent and fair.",
      rating: 5,
    },
    {
      name: "Mike Anderson",
      location: "Kansas",
      text: "Great marketplace for selling our organic produce. Connected with buyers across multiple states.",
      rating: 5,
    },
  ];

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFeedbackData({ ...feedbackData, screenshot: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFeedbackSubmit = async () => {
    console.log("🚀 FEEDBACK SUBMIT CLICKED!");
    
    if (!feedbackData.name || !feedbackData.message) {
      alert(t("feedbackRequiredAlert"));
      return;
    }
  
    setLoading(true);
    setSuccessMessage("");
  
    try {
      // Save to Firebase
      await addDoc(collection(db, "feedback"), {
        name: feedbackData.name,
        message: feedbackData.message,
        screenshot: feedbackData.screenshot,
        targetEmail: "farmgenie2002@gmail.com",
        timestamp: serverTimestamp(),
        type: "feedback",
        status: "pending",
      });
  
      // ADDED: Send email to website owner
      console.log("📧 Sending feedback email...");
      await emailService.sendFeedbackEmail({
        senderName: feedbackData.name,
        message: feedbackData.message,
        hasScreenshot: !!feedbackData.screenshot,
        ownerEmail: "farmgenie2002@gmail.com"
      });
      console.log("✅ Feedback email sent!");
  
      setSuccessMessage(t("feedbackSuccess"));
      setFeedbackData({ name: "", message: "", screenshot: null });
      setTimeout(() => {
        setShowFeedbackModal(false);
        setSuccessMessage("");
      }, 2000);
    } catch (error) {
      console.error("Error submitting feedback:", error);
      alert(t("feedbackError"));
    } finally {
      setLoading(false);
    }
  };
  
  const handleRatingSubmit = async () => {
    console.log("🚀 RATING SUBMIT CLICKED!");
    
    if (rating === 0) {
      alert(t("ratingSelectAlert"));
      return;
    }
  
    setLoading(true);
    setSuccessMessage("");
  
    try {
      // Save to Firebase
      await addDoc(collection(db, "ratings"), {
        rating: rating,
        message: ratingMessage,
        targetEmail: "farmgenie2002@gmail.com",
        timestamp: serverTimestamp(),
        type: "rating",
        status: "pending",
      });
  
      // ADDED: Send email to website owner
      console.log("📧 Sending rating email...");
      await emailService.sendRatingEmail({
        rating: rating,
        message: ratingMessage,
        ownerEmail: "farmgenie2002@gmail.com"
      });
      console.log("✅ Rating email sent!");
  
      setSuccessMessage(t("ratingSuccess"));
      setRating(0);
      setRatingMessage("");
      setTimeout(() => {
        setShowRatingModal(false);
        setSuccessMessage("");
      }, 2000);
    } catch (error) {
      console.error("Error submitting rating:", error);
      alert(t("ratingError"));
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="bg-gradient-to-br from-emerald-50 via-white to-green-50">
      <section className="relative overflow-hidden min-h-[70vh] md:min-h-screen flex items-center">
        {/* Desktop Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat z-0 md:hidden"
          style={{ backgroundImage: `url(${heroMobile})` }} // mobile image here
        ></div>

        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat z-0 hidden md:block"
          style={{ backgroundImage: `url(${heroDesktop})` }} // desktop image here
        ></div>
        <div className="absolute inset-0 bg-black/50 z-10"></div>
        <div className="absolute inset-0 opacity-10 z-20">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-green-300 rounded-full blur-3xl animate-pulse delay-700"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center text-center z-30">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-6">
              <Sparkles className="h-8 w-8 text-green-200 animate-pulse" />
              <h1 className="text-5xl md:text-7xl font-bold text-white leading-tight">
                {t("homeHeroTitle1")}
              </h1>
              <Sparkles className="h-8 w-8 text-green-200 animate-pulse" />
            </div>
            <h2 className="text-4xl md:text-6xl font-bold text-green-100 mb-8">
              {t("homeHeroTitle2")}
            </h2>
            <p className="text-xl md:text-2xl mb-10 text-white max-w-3xl mx-auto leading-relaxed">
              {t("homeHeroSubtitle")}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {user ? (
                <Link
                  to="/dashboard"
                  className="bg-white text-emerald-600 px-10 py-4 rounded-2xl font-bold hover:bg-green-50 transition-all duration-300 inline-flex items-center justify-center group shadow-2xl hover:shadow-3xl hover:scale-105"
                >
                  {t("goToDashboard")}
                  <ArrowRight className="ml-2 h-6 w-6 group-hover:translate-x-2 transition-transform" />
                </Link>
              ) : (
                <>
                  <Link
                    to="/signup"
                    className="bg-white text-emerald-600 px-10 py-4 rounded-2xl font-bold hover:bg-green-50 transition-all duration-300 inline-flex items-center justify-center group shadow-2xl hover:shadow-3xl hover:scale-105"
                  >
                    {t("getStarted")}
                    <ArrowRight className="ml-2 h-6 w-6 group-hover:translate-x-2 transition-transform" />
                  </Link>
                  <Link
                    to="/rentals"
                    className="border-2 border-white text-white px-10 py-4 rounded-2xl font-bold hover:bg-white hover:text-emerald-600 transition-all duration-300 inline-flex items-center justify-center backdrop-blur-sm hover:scale-105"
                  >
                    {t("browseEquipment")}
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="pt-24 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl md:leading-[1.5] font-bold bg-gradient-to-r from-emerald-700 to-green-600 bg-clip-text text-transparent mb-6">
              {t("featuresTitle")}
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
              {t("featuresSubtitle")}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {features.map((feature, index) => {
              // If feature requires auth and user is not logged in, use div instead of Link
              const FeatureComponent =
                feature.requiresAuth && !user ? "div" : Link;
              const componentProps =
                feature.requiresAuth && !user
                  ? {
                      onClick: () => (window.location.href = "/login"),
                      style: { cursor: "pointer" },
                    }
                  : { to: feature.link };

              return (
                <FeatureComponent
                  key={index}
                  {...componentProps}
                  className="group relative p-10 rounded-3xl bg-white border-2 border-emerald-200 hover:border-emerald-400 hover:shadow-2xl transition-all duration-500 hover:-translate-y-3 overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/50 to-green-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <div className="relative">
                    <div
                      className={`inline-flex p-5 rounded-2xl bg-gradient-to-br ${feature.color} mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg`}
                    >
                      <feature.icon className="h-10 w-10 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-emerald-600 transition-colors">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600 mb-6 leading-relaxed">
                      {feature.description}
                    </p>
                    {feature.requiresAuth && !user && (
                      <div className="mb-4 text-sm text-orange-600 font-semibold bg-orange-50 px-3 py-2 rounded-lg inline-block">
                        {t("loginRequired") || "Login Required"}
                      </div>
                    )}
                    <div className="flex items-center text-emerald-600 font-bold group-hover:text-emerald-700">
                      {t("learnMore")}
                      <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-2 transition-transform" />
                    </div>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 h-2 bg-gradient-to-r from-emerald-400 to-green-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
                </FeatureComponent>
              );
            })}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl md:leading-[1.5] font-bold bg-gradient-to-r from-emerald-700 to-green-600 bg-clip-text text-transparent mb-6">
              {t("testimonialsTitle")}
            </h2>
            <p className="text-xl text-gray-600">{t("testimonialsSubtitle")}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="group bg-white p-8 rounded-3xl border-2 border-emerald-200 hover:border-emerald-400 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2"
              >
                <div className="flex items-center mb-6 gap-1">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star
                      key={i}
                      className="h-6 w-6 text-yellow-400 fill-current group-hover:scale-110 transition-transform"
                      style={{ transitionDelay: `${i * 50}ms` }}
                    />
                  ))}
                </div>
                <p className="text-gray-700 mb-6 italic leading-relaxed text-lg">
                  "{testimonial.text}"
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-400 to-green-500 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                    {testimonial.name.charAt(0)}
                  </div>
                  <div>
                    <div className="font-bold text-gray-900">
                      {testimonial.name}
                    </div>
                    <div className="text-sm text-gray-500">
                      {testimonial.location}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Feedback and Rating Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-12">
            <button
              onClick={() => setShowFeedbackModal(true)}
              className="bg-gradient-to-r from-emerald-500 to-green-600 text-white px-10 py-4 rounded-2xl font-bold hover:from-emerald-600 hover:to-green-700 transition-all duration-300 inline-flex items-center justify-center group shadow-2xl hover:shadow-3xl hover:scale-105"
            >
              <MessageSquare className="mr-2 h-6 w-6" />
              {t("shareFeedbackButton")}
            </button>
            <button
              onClick={() => setShowRatingModal(true)}
              className="border-2 border-emerald-500 bg-transparent text-emerald-500 px-10 py-4 rounded-2xl font-bold hover:bg-gradient-to-r hover:from-emerald-500 hover:to-green-600 hover:text-white hover:border-transparent transition-all duration-300 inline-flex items-center justify-center backdrop-blur-sm hover:scale-105 shadow-xl"
            >
              <Star className="mr-2 h-6 w-6" />
              {t("rateUsButton")}
            </button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      {!user && (
        <section className="py-24 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-600 via-green-600 to-emerald-700"></div>
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-1/2 left-1/4 w-96 h-96 bg-white rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-green-300 rounded-full blur-3xl animate-pulse delay-500"></div>
          </div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              {t("ctaTitle")}
            </h2>
            <p className="text-xl text-green-100 mb-10 max-w-2xl mx-auto leading-relaxed">
              {t("ctaSubtitle")}
            </p>
            <Link
              to="/signup"
              className="bg-white text-emerald-600 px-10 py-4 rounded-2xl font-bold hover:bg-green-50 transition-all duration-300 inline-flex items-center justify-center group shadow-2xl hover:scale-105"
            >
              {t("ctaStart")}
              <ArrowRight className="ml-2 h-6 w-6 group-hover:translate-x-2 transition-transform" />
            </Link>
          </div>
        </section>
      )}

      {/* Feedback Modal */}
      {showFeedbackModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowFeedbackModal(false)}
        >
          <div
            className="bg-gradient-to-br from-emerald-50 via-white to-green-50 rounded-3xl max-w-md w-full p-8 relative max-h-[90vh] overflow-y-auto border-2 border-emerald-200 shadow-2xl custom-scrollbar"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowFeedbackModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-emerald-600 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
            <h3 className="text-3xl font-bold bg-gradient-to-r from-emerald-700 to-green-600 bg-clip-text text-transparent mb-6">
              {t("feedbackModalTitle")}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  {t("feedbackNameLabel")}
                </label>
                <input
                  type="text"
                  required
                  value={feedbackData.name}
                  onChange={(e) =>
                    setFeedbackData({ ...feedbackData, name: e.target.value })
                  }
                  className="w-full px-4 py-3 border-2 border-emerald-200 rounded-xl focus:border-emerald-500 focus:outline-none transition-colors bg-white"
                  placeholder="Enter your name"
                />
              </div>
              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  {t("feedbackMessageLabel")}
                </label>
                <textarea
                  required
                  value={feedbackData.message}
                  onChange={(e) =>
                    setFeedbackData({
                      ...feedbackData,
                      message: e.target.value,
                    })
                  }
                  className="w-full px-4 py-3 border-2 border-emerald-200 rounded-xl focus:border-emerald-500 focus:outline-none h-32 resize-none transition-colors bg-white"
                  placeholder={t("feedbackMessageLabel")}
                />
              </div>
              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  {t("feedbackScreenshotLabel")}
                </label>
                <div className="border-2 border-dashed border-emerald-300 rounded-xl p-6 text-center hover:border-emerald-500 transition-colors bg-white hover:bg-emerald-50/30">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                    id="screenshot-upload"
                  />
                  <label htmlFor="screenshot-upload" className="cursor-pointer">
                    <Upload className="h-8 w-8 text-emerald-500 mx-auto mb-2" />
                    <span className="text-sm text-gray-600">
                      {t("feedbackScreenshotHint")}
                    </span>
                  </label>
                  {feedbackData.screenshot && (
                    <p className="text-sm text-emerald-600 mt-2 font-semibold">
                      {t("feedbackScreenshotUploaded")}
                    </p>
                  )}
                </div>
              </div>
              {successMessage && (
                <div className="p-4 bg-gradient-to-r from-emerald-100 to-green-100 text-emerald-700 rounded-xl text-center font-semibold border border-emerald-200">
                  {successMessage}
                </div>
              )}
              <button
                onClick={handleFeedbackSubmit}
                disabled={loading}
                className="w-full bg-gradient-to-r from-emerald-500 to-green-600 text-white py-4 rounded-xl font-bold hover:from-emerald-600 hover:to-green-700 transition-all duration-300 disabled:opacity-50 shadow-lg hover:shadow-xl hover:scale-105"
              >
                {loading ? t("feedbackSubmitting") : t("feedbackSubmitButton")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rating Modal */}
      {showRatingModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowRatingModal(false)}
        >
          <div
            className="bg-gradient-to-br from-emerald-50 via-white to-green-50 rounded-3xl max-w-md w-full p-8 relative border-2 border-emerald-200 shadow-2xl custom-scrollbar"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowRatingModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-emerald-600 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
            <h3 className="text-3xl font-bold bg-gradient-to-r from-emerald-700 to-green-600 bg-clip-text text-transparent mb-6">
              {t("ratingModalTitle")}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-gray-700 font-semibold mb-4 text-center">
                  {t("ratingQuestionLabel")}
                </label>
                <div className="flex justify-center gap-2 bg-white p-4 rounded-2xl border-2 border-emerald-200">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      className="transition-transform hover:scale-125"
                    >
                      <Star
                        className={`h-12 w-12 ${
                          star <= (hoverRating || rating)
                            ? "text-yellow-400 fill-current"
                            : "text-gray-300"
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  {t("ratingCommentsLabel")}
                </label>
                <textarea
                  value={ratingMessage}
                  onChange={(e) => setRatingMessage(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-emerald-200 rounded-xl focus:border-emerald-500 focus:outline-none h-24 resize-none transition-colors bg-white"
                  placeholder={t("ratingCommentsPlaceholder")}
                />
              </div>
              {successMessage && (
                <div className="p-4 bg-gradient-to-r from-emerald-100 to-green-100 text-emerald-700 rounded-xl text-center font-semibold border border-emerald-200">
                  {successMessage}
                </div>
              )}
              <button
                onClick={handleRatingSubmit}
                disabled={loading}
                className="w-full bg-gradient-to-r from-emerald-500 to-green-600 text-white py-4 rounded-xl font-bold hover:from-emerald-600 hover:to-green-700 transition-all duration-300 disabled:opacity-50 shadow-lg hover:shadow-xl hover:scale-105"
              >
                {loading ? t("ratingSubmitting") : t("ratingSubmitButton")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
