import React, { useState, useEffect } from "react";
import { X, Send, User, Phone, MessageSquare, Loader } from "lucide-react";
import { useTranslation } from "react-i18next";
import emailService from "../services/emailService";

const MessageModal = ({
  isOpen,
  onClose,
  ownerEmail,
  ownerName,
  productName,
  productType,
  productDetails = {},
}) => {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const { t } = useTranslation("common");

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
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
  }, [isOpen]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate all fields
    if (
      !formData.name.trim() ||
      !formData.phone.trim() ||
      !formData.message.trim()
    ) {
      setError(t("msgAllFieldsRequired"));
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Prepare message data for email service
      const messageData = {
        ownerEmail: ownerEmail,
        ownerName: ownerName,
        productName: productName,
        productType: productType,
        senderName: formData.name,
        senderPhone: formData.phone,
        message: formData.message,
        category: productDetails.category || "",
        location: productDetails.location || "",
        price: productDetails.price || "",
      };

      console.log("📤 Sending message via email service...", messageData);

      // Send email using emailService
      await emailService.sendRentalMessage(messageData);

      console.log("✅ Message sent successfully!");

      setSuccess(true);
      setFormData({ name: "", phone: "", message: "" });

      // Close modal after 2 seconds
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 2000);
    } catch (error) {
      console.error("❌ Email send error:", error);
      setError(t("msgFailed") || "Failed to send message. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50"
      onClick={onClose}
    >
      <div
        className="bg-gradient-to-br from-emerald-50 via-white to-green-50 rounded-3xl shadow-2xl border-2 border-emerald-200 w-full max-w-lg relative custom-scrollbar max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-emerald-600 rounded-full transition-colors z-10"
        >
          <X className="h-6 w-6" />
        </button>

        {/* Header */}
        <div className="p-8 pb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="inline-flex p-3 rounded-xl bg-gradient-to-br from-emerald-400 to-green-500 shadow-lg">
              <MessageSquare className="h-6 w-6 text-white" />
            </div>
            <h2 className="text-3xl leading-[1.5] font-bold bg-gradient-to-r from-emerald-700 to-green-600 bg-clip-text text-transparent">
              {t("msgSendTitle")}
            </h2>
          </div>
          <p className="text-gray-600 leading-relaxed">
            {t("msgContactAbout", { ownerName, productName })}
          </p>
          
          {/* Display product details if available */}
          {(productDetails.category || productDetails.location || productDetails.price) && (
            <div className="mt-4 bg-white rounded-xl p-4 border border-emerald-200">
              <p className="text-sm font-semibold text-emerald-700 mb-2">{productType} Details:</p>
              <div className="space-y-1 text-sm text-gray-600">
                {productDetails.category && (
                  <p><span className="font-medium">Category:</span> {productDetails.category}</p>
                )}
                {productDetails.location && (
                  <p><span className="font-medium">Location:</span> {productDetails.location}</p>
                )}
                {productDetails.price && (
                  <p><span className="font-medium">Price:</span> Rs {productDetails.price.toLocaleString()}{productType === "Rental" ? "/day" : ""}</p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Success Message */}
        {success && (
          <div className="mx-8 mb-4 bg-gradient-to-r from-emerald-100 to-green-100 border border-emerald-200 rounded-xl p-4">
            <p className="text-emerald-700 font-semibold flex items-center gap-2">
              <Send className="h-5 w-5" />
              {t("msgSuccess")}
            </p>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mx-8 mb-4 bg-gradient-to-r from-red-100 to-red-50 border border-red-200 rounded-xl p-4">
            <p className="text-red-700 font-semibold">{error}</p>
          </div>
        )}

        {/* Form */}
        <div className="p-8 pt-0 space-y-5">
          <div>
            <label className="block text-gray-700 font-semibold mb-2 flex items-center gap-2">
              <User className="h-4 w-4 text-emerald-600" />
              {t("msgYourNameLabel")} <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder={t("msgYourNamePlaceholder")}
              required
              className="w-full px-4 py-3 border-2 border-emerald-200 rounded-xl focus:border-emerald-500 focus:outline-none bg-white transition-colors"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-semibold mb-2 flex items-center gap-2">
              <Phone className="h-4 w-4 text-emerald-600" />
              {t("msgYourPhoneLabel")} <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder={t("msgYourPhonePlaceholder")}
              required
              className="w-full px-4 py-3 border-2 border-emerald-200 rounded-xl focus:border-emerald-500 focus:outline-none bg-white transition-colors"
            />
          </div>

          <div>
            <label className="block text-gray-700 font-semibold mb-2 flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-emerald-600" />
              {t("msgYourMessageLabel")} <span className="text-red-500">*</span>
            </label>
            <textarea
              name="message"
              value={formData.message}
              onChange={handleChange}
              placeholder={t("msgYourMessagePlaceholder")}
              required
              rows="4"
              className="w-full px-4 py-3 border-2 border-emerald-200 rounded-xl focus:border-emerald-500 focus:outline-none bg-white transition-colors resize-none"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border-2 border-emerald-500 text-emerald-500 rounded-xl hover:bg-emerald-50 transition-all font-semibold"
            >
              {t("msgCancel")}
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading || success}
              className="flex-1 bg-gradient-to-r from-emerald-500 to-green-600 text-white px-6 py-3 rounded-xl hover:from-emerald-600 hover:to-green-700 transition-all font-semibold shadow-lg hover:shadow-xl hover:scale-105 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader className="h-5 w-5 animate-spin" />
                  {t("msgSending")}
                </>
              ) : (
                <>
                  <Send className="h-5 w-5" />
                  {t("msgSendButton")}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessageModal;