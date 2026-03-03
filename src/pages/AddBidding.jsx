// src/pages/AddBidding.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, useParams, Link, Navigate } from "react-router-dom";
import {
  ArrowLeft,
  Upload,
  X,
  MapPin,
  Loader,
  Sparkles,
  ImagePlus,
  Calendar,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useData } from "../context/DataContext";
import { uploadImage } from "../supabase";
import CustomDatePicker from "../components/CustomDatePicker";
import CustomTimePicker from "../components/CustomTimePicker";
import { useTranslation } from "react-i18next";

const AddBidding = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = !!id;
  const { user, isLoading } = useAuth();
  const { biddings, addBidding, updateBidding } = useData();
  const { t } = useTranslation("common");

  if (isLoading)
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-green-50 flex items-center justify-center">
        <div className="text-center">
          <Loader className="h-12 w-12 text-emerald-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 text-lg">{t("loading")}</p>
        </div>
      </div>
    );

  if (!user) return <Navigate to="/login" replace />;

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    startingPrice: "",
    location: "",
    coordinates: null,
    area: "",
    images: [],
    endDate: null,
    endTime: "",
    status: "active",
  });

  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isSearchingLocation, setIsSearchingLocation] = useState(false);
  const [locationSuggestions, setLocationSuggestions] = useState([]);

  useEffect(() => {
    if (!isEditing) {
      const defaultEndDate = new Date();
      defaultEndDate.setDate(defaultEndDate.getDate() + 7);
      setFormData((prev) => ({
        ...prev,
        endDate: defaultEndDate,
      }));
    }
  }, [isEditing]);

  useEffect(() => {
    if (isEditing) {
      const bidding = biddings.find((b) => b.id === id);
      if (bidding) {
        if (bidding.ownerId !== user?.uid) {
          navigate("/bidding");
          return;
        }
        const endDate = new Date(bidding.endDate);
        setFormData({
          title: bidding.title,
          description: bidding.description,
          startingPrice: bidding.startingPrice.toString(),
          location: bidding.location,
          coordinates: bidding.coordinates,
          area: bidding.area,
          images: bidding.images,
          endDate: endDate,
          endTime: `${endDate.getHours().toString().padStart(2, '0')}:${endDate.getMinutes().toString().padStart(2, '0')}`,
          status: bidding.status,
        });
      }
    }
  }, [isEditing, id, biddings, user, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleDateChange = (date) => {
    setFormData((prev) => {
      if (prev.endTime) {
        const [hours, minutes] = prev.endTime.split(":");
        const newDate = new Date(date);
        newDate.setHours(parseInt(hours), parseInt(minutes));
        return {
          ...prev,
          endDate: newDate,
        };
      }
      return {
        ...prev,
        endDate: date,
      };
    });

    if (errors.endDate) {
      setErrors((prev) => ({ ...prev, endDate: "" }));
    }
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);

    if (files.length + imageFiles.length > 5) {
      alert(t("biddingFormMaxImagesAlert"));
      return;
    }

    const validFiles = files.filter((file) => {
      const isValidType = file.type.startsWith("image/");
      const isValidSize = file.size <= 5 * 1024 * 1024;

      if (!isValidType) {
        alert(t("biddingFormInvalidFileType", { fileName: file.name }));
        return false;
      }
      if (!isValidSize) {
        alert(t("biddingFormFileTooLarge", { fileName: file.name }));
        return false;
      }
      return true;
    });

    setImageFiles((prev) => [...prev, ...validFiles]);

    validFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviews((prev) => [...prev, reader.result]);
      };
      reader.readAsDataURL(file);
    });

    if (errors.images) {
      setErrors((prev) => ({ ...prev, images: "" }));
    }
  };

  const removeImage = (index) => {
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const searchLocation = async (query) => {
    if (query.length < 3) {
      setLocationSuggestions([]);
      return;
    }

    setIsSearchingLocation(true);

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          query
        )}&limit=5`
      );
      const data = await response.json();

      setLocationSuggestions(
        data.map((item) => ({
          display_name: item.display_name,
          lat: item.lat,
          lon: item.lon,
        }))
      );
    } catch (error) {
      console.error("Error searching location:", error);
      setLocationSuggestions([]);
    } finally {
      setIsSearchingLocation(false);
    }
  };

  const handleLocationChange = (e) => {
    const value = e.target.value;
    setFormData((prev) => ({
      ...prev,
      location: value,
    }));

    if (errors.location) {
      setErrors((prev) => ({ ...prev, location: "" }));
    }

    searchLocation(value);
  };

  const selectLocation = (suggestion) => {
    setFormData((prev) => ({
      ...prev,
      location: suggestion.display_name,
      coordinates: {
        lat: parseFloat(suggestion.lat),
        lng: parseFloat(suggestion.lon),
      },
    }));
    setLocationSuggestions([]);

    if (errors.location) {
      setErrors((prev) => ({ ...prev, location: "" }));
    }
  };

  const uploadImages = async () => {
    const imageUrls = [];

    for (let i = 0; i < imageFiles.length; i++) {
      const file = imageFiles[i];

      try {
        const url = await uploadImage(file, "biddings");
        imageUrls.push(url);
        setUploadProgress(((i + 1) / imageFiles.length) * 100);
      } catch (error) {
        console.error("Error uploading image:", error);
        throw error;
      }
    }

    return imageUrls;
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = t("fieldRequiredTitle");
    if (!formData.description.trim())
      newErrors.description = t("fieldRequiredDescription");
    if (!formData.startingPrice || formData.startingPrice <= 0)
      newErrors.startingPrice = t("fieldRequiredValidStartingPrice");
    if (!formData.location.trim())
      newErrors.location = t("fieldRequiredLocation");
    if (!formData.area.trim()) newErrors.area = t("fieldRequiredArea");
    if (!formData.endDate) newErrors.endDate = t("fieldRequiredEndDate");
    if (imageFiles.length === 0 && formData.images.length === 0)
      newErrors.images = t("fieldRequiredAtLeastOneImage");

    const endDate = new Date(formData.endDate);
    if (endDate <= new Date())
      newErrors.endDate = t("fieldRequiredFutureEndDate");

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      console.log("Starting bidding submission...");
      console.log("User object:", user);

      let imageUrls = [...formData.images];
      if (imageFiles.length > 0) {
        console.log("Uploading images to Supabase...");
        const newImageUrls = await uploadImages();
        imageUrls = [...imageUrls, ...newImageUrls];
        console.log("Images uploaded successfully:", imageUrls);
      }

      const biddingData = {
        title: formData.title,
        description: formData.description,
        startingPrice: parseFloat(formData.startingPrice),
        currentBid: parseFloat(formData.startingPrice),
        location: formData.location,
        coordinates: formData.coordinates,
        area: formData.area,
        images: imageUrls,
        endDate: formData.endDate.toISOString(),
        status: formData.status,
        bids: [],
        ownerId: user.uid,
        ownerName: user.displayName || user.email || "Unknown",
        ownerEmail: user.email, // Added owner email
      };

      console.log("Bidding data prepared:", biddingData);

      if (isEditing) {
        console.log("Updating existing bidding...");
        await updateBidding(id, biddingData);
      } else {
        console.log("Creating new bidding...");
        await addBidding(biddingData);
      }

      console.log("Bidding saved successfully!");
      alert(isEditing ? (t("biddingUpdateSuccess") || "Auction updated successfully!") : (t("biddingCreateSuccess") || "Auction created successfully!"));
      navigate("/dashboard");
    } catch (error) {
      console.error("Full error details:", error);
      console.error("Error message:", error.message);
      alert(
        `${t("biddingCreateFailedPrefix")}\n\nError: ${
          error.message
        }\n\nCheck console for details.`
      );
    } finally {
      setIsSubmitting(false);
      setUploadProgress(0);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-green-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-10">
          <Link
            to="/dashboard"
            className="inline-flex items-center text-emerald-600 hover:text-emerald-700 mb-6 transition-colors font-semibold group"
          >
            <ArrowLeft className="h-5 w-5 mr-2 rtl:mr-0 rtl:ml-2 group-hover:-translate-x-1 rtl:group-hover:translate-x-1 transition-transform" />
            {t("backToDashboard")}
          </Link>
          <div className="flex items-center gap-3 mb-4">
            <Sparkles className="h-10 w-10 text-emerald-600" />
            <h1 className="text-4xl leading-[1.5] font-bold bg-gradient-to-r from-emerald-700 to-green-600 bg-clip-text text-transparent">
              {isEditing ? t("addBiddingTitleEdit") : t("addBiddingTitleNew")}
            </h1>
          </div>
          <p className="text-gray-600 text-lg">
            {isEditing
              ? t("addBiddingSubtitleEdit")
              : t("addBiddingSubtitleNew")}
          </p>
        </div>

        <div className="bg-white rounded-3xl shadow-2xl border-2 border-emerald-200 p-8 md:p-10">
          <form onSubmit={handleSubmit} className="space-y-8">
            <div>
              <label
                htmlFor="title"
                className="block text-gray-700 font-semibold mb-2"
              >
                {t("biddingFormLandTitle")}
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-1 focus:ring-emerald-500 focus:outline-none transition-all bg-white ${
                  errors.title
                    ? "border-red-300"
                    : "border-emerald-200 focus:border-emerald-500 hover:border-emerald-400"
                }`}
                placeholder={t("biddingFormLandTitlePlaceholder")}
              />
              {errors.title && (
                <p className="mt-2 text-sm text-red-600 flex items-center">
                  <X className="h-4 w-4 mr-1" />
                  {errors.title}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="description"
                className="block text-gray-700 font-semibold mb-2"
              >
                {t("biddingFormDescriptionLabel")}
              </label>
              <textarea
                id="description"
                name="description"
                rows={5}
                value={formData.description}
                onChange={handleChange}
                className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-1 focus:ring-emerald-500 focus:outline-none transition-all resize-none bg-white ${
                  errors.description
                    ? "border-red-300"
                    : "border-emerald-200 focus:border-emerald-500 hover:border-emerald-400"
                }`}
                placeholder={t("biddingFormDescriptionPlaceholder")}
              />
              {errors.description && (
                <p className="mt-2 text-sm text-red-600 flex items-center">
                  <X className="h-4 w-4 mr-1" />
                  {errors.description}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label
                  htmlFor="startingPrice"
                  className="block text-gray-700 font-semibold mb-2"
                >
                  {t("biddingFormStartingPrice")}
                </label>
                <input
                  type="number"
                  id="startingPrice"
                  name="startingPrice"
                  min="1"
                  value={formData.startingPrice}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border-2 rounded-xl focus:ring1 focus:ring-emerald-500 focus:outline-none transition-all bg-white ${
                    errors.startingPrice
                      ? "border-red-300"
                      : "border-emerald-200 focus:border-emerald-500 hover:border-emerald-400"
                  }`}
                  placeholder="7000000"
                />
                {errors.startingPrice && (
                  <p className="mt-2 text-sm text-red-600 flex items-center">
                    <X className="h-4 w-4 mr-1" />
                    {errors.startingPrice}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="area"
                  className="block text-gray-700 font-semibold mb-2"
                >
                  {t("biddingFormLandArea")}
                </label>
                <input
                  type="text"
                  id="area"
                  name="area"
                  value={formData.area}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-1 focus:ring-emerald-500 focus:outline-none transition-all bg-white ${
                    errors.area
                      ? "border-red-300"
                      : "border-emerald-200 focus:border-emerald-500 hover:border-emerald-400"
                  }`}
                  placeholder={t("biddingFormLandAreaPlaceholder")}
                />
                {errors.area && (
                  <p className="mt-2 text-sm text-red-600 flex items-center">
                    <X className="h-4 w-4 mr-1" />
                    {errors.area}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  {t("biddingFormEndDate")}
                </label>
                <CustomDatePicker
                  selected={formData.endDate}
                  onChange={handleDateChange}
                  minDate={new Date()}
                  error={errors.endDate}
                />
              </div>

              <div className="mt-8">
                <label className="block text-gray-700 font-semibold mb-2">
                  {t("biddingFormEndTime")}
                </label>
                <CustomTimePicker
                  value={formData.endTime}
                  onChange={(timeValue) => {
                    setFormData((prev) => ({
                      ...prev,
                      endTime: timeValue,
                    }));

                    if (formData.endDate && timeValue) {
                      const [hours, minutes] = timeValue.split(":");
                      const newDate = new Date(formData.endDate);
                      newDate.setHours(parseInt(hours), parseInt(minutes));
                      setFormData((prev) => ({
                        ...prev,
                        endDate: newDate,
                      }));
                    }
                  }}
                  error={errors.endDate}
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="location"
                className="block text-gray-700 font-semibold mb-2"
              >
                {t("biddingFormLocationLabel")}
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleLocationChange}
                  className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-1 focus:ring-emerald-500 focus:outline-none transition-all bg-white ${
                    errors.location
                      ? "border-red-300"
                      : "border-emerald-200 focus:border-emerald-500 hover:border-emerald-400"
                  }`}
                  placeholder={t("biddingFormLocationPlaceholder")}
                  autoComplete="off"
                />
                {isSearchingLocation && (
                  <div className="absolute right-4 top-4">
                    <Loader className="h-5 w-5 text-emerald-600 animate-spin" />
                  </div>
                )}

                {locationSuggestions.length > 0 && (
                  <div className="absolute z-10 w-full mt-2 bg-white border-2 border-emerald-200 rounded-xl shadow-2xl max-h-60 overflow-y-auto custom-scrollbar">
                    {locationSuggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => selectLocation(suggestion)}
                        className="w-full text-left px-4 py-3 hover:bg-gradient-to-r hover:from-emerald-50 hover:to-green-50 transition-all border-b border-emerald-100 last:border-0 first:rounded-t-xl last:rounded-b-xl"
                      >
                        <div className="flex items-start">
                          <MapPin className="h-5 w-5 text-emerald-600 mr-3 mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-gray-700 font-medium">
                            {suggestion.display_name}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              {errors.location && (
                <p className="mt-2 text-sm text-red-600 flex items-center">
                  <X className="h-4 w-4 mr-1" />
                  {errors.location}
                </p>
              )}
              <p className="mt-2 text-xs text-gray-500">
                {t("biddingFormLocationHint")}
              </p>
            </div>

            {isEditing && (
              <div>
                <label
                  htmlFor="status"
                  className="block text-gray-700 font-semibold mb-2"
                >
                  {t("biddingFormAuctionStatus")}
                </label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-2 border-emerald-200 bg-white rounded-xl focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 focus:outline-none transition-all appearance-none cursor-pointer hover:border-emerald-400"
                >
                  <option value="active">{t("activeStatus")}</option>
                  <option value="ended">{t("endedStatus")}</option>
                </select>
              </div>
            )}

            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                {t("biddingFormImagesLabel")}
              </label>

              <div
                className={`border-2 border-dashed rounded-xl p-10 text-center transition-all ${
                  imageFiles.length >= 5
                    ? "border-emerald-200 bg-gray-50 cursor-not-allowed opacity-60"
                    : "border-emerald-300 bg-white hover:bg-emerald-50/30 hover:border-emerald-500 cursor-pointer"
                }`}
              >
                <input
                  type="file"
                  id="imageUpload"
                  accept="image/*"
                  multiple
                  onChange={handleImageChange}
                  className="hidden"
                  disabled={imageFiles.length >= 5}
                />
                <label
                  htmlFor="imageUpload"
                  className={`cursor-pointer ${
                    imageFiles.length >= 5 ? "cursor-not-allowed" : ""
                  }`}
                >
                  <div className="inline-flex p-4 rounded-full bg-gradient-to-br from-emerald-400 to-green-500 mb-4">
                    <ImagePlus className="h-10 w-10 text-white" />
                  </div>
                  <p className="text-base font-semibold text-gray-700 mb-2">
                    {imageFiles.length >= 5
                      ? t("biddingFormMaxImagesReached")
                      : t("biddingFormUploadCta")}
                  </p>
                  <p className="text-sm text-gray-500">
                    {t("biddingFormUploadHint")}
                  </p>
                </label>
              </div>

              {errors.images && (
                <p className="mt-2 text-sm text-red-600 flex items-center">
                  <X className="h-4 w-4 mr-1" />
                  {errors.images}
                </p>
              )}

              {imagePreviews.length > 0 && (
                <div className="mt-6 grid grid-cols-2 md:grid-cols-3 gap-4">
                  {imagePreviews.map((preview, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={preview}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-40 object-cover rounded-xl border-2 border-emerald-200 group-hover:border-emerald-400 transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute -top-2 -right-2 bg-gradient-to-br from-red-500 to-red-600 text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-all shadow-lg hover:scale-110"
                      >
                        <X className="h-4 w-4" />
                      </button>
                      <div className="absolute inset-0 bg-black/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    </div>
                  ))}
                </div>
              )}

              {isSubmitting && uploadProgress > 0 && uploadProgress < 100 && (
                <div className="mt-6 bg-gradient-to-r from-emerald-100 to-green-100 rounded-xl p-6 border border-emerald-200">
                  <div className="flex justify-between text-sm font-semibold text-emerald-700 mb-3">
                    <span>{t("biddingFormUploadingImages")}</span>
                    <span>{Math.round(uploadProgress)}%</span>
                  </div>
                  <div className="w-full bg-emerald-200 rounded-full h-3 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-emerald-500 to-green-600 h-3 rounded-full transition-all duration-300 shadow-lg"
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                </div>
              )}
            </div>

            <div className="pt-6">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-emerald-500 to-green-600 text-white py-4 px-6 rounded-xl hover:from-emerald-600 hover:to-green-700 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:ring-offset-2 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed font-bold text-lg shadow-lg hover:shadow-xl hover:scale-[1.02] flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader className="h-5 w-5 animate-spin" />
                    {uploadProgress > 0 && uploadProgress < 100
                      ? `${t("biddingFormSubmitUploading")} ${Math.round(
                          uploadProgress
                        )}%`
                      : isEditing
                      ? t("biddingFormSubmitUpdatingAuction")
                      : t("biddingFormSubmitCreatingAuction")}
                  </>
                ) : (
                  <>
                    <Sparkles className="h-5 w-5" />
                    {isEditing
                      ? t("biddingFormSubmitUpdateAuction")
                      : t("biddingFormSubmitCreateAuction")}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddBidding;