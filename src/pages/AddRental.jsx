import React, { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import {
  ArrowLeft,
  Upload,
  X,
  Sparkles,
  CheckCircle,
  ChevronDown,
} from "lucide-react";
import { useData } from "../context/DataContext";
import { useAuth } from "../context/AuthContext";
import { uploadImage } from "../supabase";
import { useTranslation } from "react-i18next";

const AddRental = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = !!id;
  const { rentals, addRental, updateRental } = useData();
  const { user } = useAuth();
  const { t } = useTranslation("common");

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "equipment",
    pricePerDay: "",
    location: "",
    images: [],
    availability: true,
  });

  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);

  useEffect(() => {
    if (isEditing) {
      const rental = rentals.find((r) => r.id === id);
      if (rental) {
        if (rental.ownerId !== user?.uid) {
          navigate("/rentals");
          return;
        }
        setFormData({
          title: rental.title,
          description: rental.description,
          category: rental.category,
          pricePerDay: rental.pricePerDay.toString(),
          location: rental.location,
          images: rental.images,
          availability: rental.availability,
        });
      }
    }
  }, [isEditing, id, rentals, user, navigate]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);

    if (files.length + imageFiles.length > 5) {
      alert(t("rentalFormMaxImagesAlert"));
      return;
    }

    // Validate file types and sizes
    const validFiles = files.filter((file) => {
      const isValidType = file.type.startsWith("image/");
      const isValidSize = file.size <= 5 * 1024 * 1024; // 5MB

      if (!isValidType) {
        alert(t("rentalFormInvalidFileType", { fileName: file.name }));
        return false;
      }
      if (!isValidSize) {
        alert(t("rentalFormFileTooLarge", { fileName: file.name }));
        return false;
      }
      return true;
    });

    setImageFiles((prev) => [...prev, ...validFiles]);

    // Create previews
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

  const uploadImages = async () => {
    const imageUrls = [];

    for (let i = 0; i < imageFiles.length; i++) {
      const file = imageFiles[i];

      try {
        const url = await uploadImage(file, "rentals");
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
    if (!formData.pricePerDay || parseFloat(formData.pricePerDay) < 500)
      newErrors.pricePerDay = t("fieldRequiredValidPrice");
    if (!formData.location.trim())
      newErrors.location = t("fieldRequiredLocation");
    if (imageFiles.length === 0 && formData.images.length === 0)
      newErrors.images = t("fieldRequiredAtLeastOneImage");

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      console.log("Starting rental submission...");

      // Upload new images if any
      let imageUrls = [...formData.images];
      if (imageFiles.length > 0) {
        console.log("Uploading images to Supabase...");
        const newImageUrls = await uploadImages();
        imageUrls = [...imageUrls, ...newImageUrls];
        console.log("Images uploaded successfully:", imageUrls);
      }

      const rentalData = {
        ...formData,
        images: imageUrls,
        pricePerDay: parseFloat(formData.pricePerDay),
        ownerId: user.uid,
        ownerName: user.displayName || user.email || "Unknown",
        ownerEmail: user.email,
      };

      console.log("Rental data prepared:", rentalData);

      if (isEditing) {
        console.log("Updating existing rental...");
        await updateRental(id, rentalData);
      } else {
        console.log("Creating new rental...");
        await addRental(rentalData);
      }

      console.log("Rental saved successfully!");
      alert(isEditing ? (t("rentalUpdateSuccess") || "Rental updated successfully!") : (t("rentalCreateSuccess") || "Rental listed successfully!"));
      navigate("/dashboard");
    } catch (error) {
      console.error("Full error details:", error);
      console.error("Error message:", error.message);
      alert(
        `${t("rentalListFailedPrefix")}\n\nError: ${
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
        {/* Header */}
        <div className="mb-8">
          <Link
            to="/dashboard"
            className="inline-flex items-center text-emerald-600 hover:text-emerald-700 mb-6 transition-colors font-semibold group"
          >
            <ArrowLeft className="h-5 w-5 mr-2 rtl:mr-0 rtl:ml-2 group-hover:-translate-x-1 rtl:group-hover:translate-x-1 transition-transform" />
            {t("backToDashboard")}
          </Link>
          <div className="flex items-center gap-3 mb-4">
            <Sparkles className="h-8 w-8 text-emerald-600" />
            <h1 className="text-4xl leading-[1.5] font-bold bg-gradient-to-r from-emerald-700 to-green-600 bg-clip-text text-transparent">
              {isEditing ? t("addRentalTitleEdit") : t("addRentalTitleNew")}
            </h1>
          </div>
          <p className="text-gray-600 text-lg">
            {isEditing ? t("addRentalSubtitleEdit") : t("addRentalSubtitleNew")}
          </p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-3xl shadow-2xl border-2 border-emerald-200 p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div>
              <label
                htmlFor="title"
                className="block text-gray-700 font-semibold mb-2"
              >
                {t("rentalFormEquipmentTitle")}
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors bg-white ${
                  errors.title
                    ? "border-red-300"
                    : "border-emerald-200 focus:border-emerald-500 hover:border-emerald-400"
                }`}
                placeholder={t("rentalFormEquipmentTitlePlaceholder")}
              />
              {errors.title && (
                <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                  <X className="h-4 w-4" />
                  {errors.title}
                </p>
              )}
            </div>

            {/* Description */}
            <div>
              <label
                htmlFor="description"
                className="block text-gray-700 font-semibold mb-2"
              >
                {t("rentalFormDescriptionLabel")}
              </label>
              <textarea
                id="description"
                name="description"
                rows={4}
                value={formData.description}
                onChange={handleChange}
                className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors bg-white resize-none ${
                  errors.description
                    ? "border-red-300"
                    : "border-emerald-200 focus:border-emerald-500 hover:border-emerald-400"
                }`}
                placeholder={t("rentalFormDescriptionPlaceholder")}
              />
              {errors.description && (
                <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                  <X className="h-4 w-4" />
                  {errors.description}
                </p>
              )}
            </div>

            {/* Category and Price */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label
                  htmlFor="category"
                  className="block text-gray-700 font-semibold mb-2"
                >
                  {t("rentalFormCategoryLabel")}
                </label>

                <div className="relative">
                  <button
                    type="button"
                    onClick={() =>
                      setIsCategoryDropdownOpen(!isCategoryDropdownOpen)
                    }
                    className="w-full px-4 py-3 border-2 border-emerald-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white transition-colors cursor-pointer hover:border-emerald-400 text-left rtl:text-right font-medium text-gray-700"
                  >
                    {formData.category === "equipment"
                      ? t("rentalCategoryEquipment")
                      : t("rentalCategoryLand")}
                  </button>
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
                        <button
                          type="button"
                          onClick={() => {
                            handleChange({
                              target: { name: "category", value: "equipment" },
                            });
                            setIsCategoryDropdownOpen(false);
                          }}
                          className={`w-full px-4 py-3 text-left rtl:text-right hover:bg-gradient-to-r hover:from-emerald-50 hover:to-green-50 transition-all font-medium ${
                            formData.category === "equipment"
                              ? "bg-gradient-to-r from-emerald-50 to-green-50 text-emerald-700 border-l-4 rtl:border-l-0 rtl:border-r-4 border-emerald-600"
                              : "text-gray-700"
                          }`}
                        >
                          {t("rentalCategoryEquipment")}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            handleChange({
                              target: { name: "category", value: "land" },
                            });
                            setIsCategoryDropdownOpen(false);
                          }}
                          className={`w-full px-4 py-3 text-left rtl:text-right hover:bg-gradient-to-r hover:from-emerald-50 hover:to-green-50 transition-all font-medium ${
                            formData.category === "land"
                              ? "bg-gradient-to-r from-emerald-50 to-green-50 text-emerald-700 border-l-4 rtl:border-l-0 rtl:border-r-4 border-emerald-600"
                              : "text-gray-700"
                          }`}
                        >
                          {t("rentalCategoryLand")}
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div>
                <label
                  htmlFor="pricePerDay"
                  className="block text-gray-700 font-semibold mb-2"
                >
                  {t("rentalFormPriceLabel")}
                </label>
                <input
                  type="number"
                  id="pricePerDay"
                  name="pricePerDay"
                  min="500"
                  step="1"
                  value={formData.pricePerDay}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors bg-white ${
                    errors.pricePerDay
                      ? "border-red-300"
                      : "border-emerald-200 focus:border-emerald-500 hover:border-emerald-400"
                  }`}
                  placeholder="4200"
                />
                {errors.pricePerDay && (
                  <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                    <X className="h-4 w-4" />
                    {errors.pricePerDay}
                  </p>
                )}
              </div>
            </div>

            {/* Location */}
            <div>
              <label
                htmlFor="location"
                className="block text-gray-700 font-semibold mb-2"
              >
                {t("rentalFormLocationLabel")}
              </label>
              <input
                type="text"
                id="location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors bg-white ${
                  errors.location
                    ? "border-red-300"
                    : "border-emerald-200 focus:border-emerald-500 hover:border-emerald-400"
                }`}
                placeholder={t("rentalFormLocationPlaceholder")}
              />
              {errors.location && (
                <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                  <X className="h-4 w-4" />
                  {errors.location}
                </p>
              )}
            </div>

            {/* Availability */}
            <div className="bg-gradient-to-r from-emerald-50 to-green-50 border-2 border-emerald-200 rounded-xl p-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="availability"
                  name="availability"
                  checked={formData.availability}
                  onChange={handleChange}
                  className="h-5 w-5 text-emerald-600 focus:ring-emerald-500 border-emerald-300 rounded"
                />
                <label
                  htmlFor="availability"
                  className="ml-3 rtl:ml-0 rtl:mr-3 block text-gray-700 font-semibold"
                >
                  {t("rentalFormAvailabilityLabel")}
                </label>
              </div>
            </div>

            {/* Image Upload */}
            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                {t("rentalFormImagesLabel")}
              </label>

              {/* Upload Area */}
              <div className="border-2 border-dashed border-emerald-300 rounded-xl p-8 text-center hover:border-emerald-500 transition-colors bg-white hover:bg-emerald-50/30">
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
                    imageFiles.length >= 5
                      ? "opacity-50 cursor-not-allowed"
                      : ""
                  }`}
                >
                  <Upload className="h-12 w-12 mx-auto text-emerald-500 mb-3" />
                  <p className="text-gray-700 font-medium mb-1">
                    {imageFiles.length >= 5
                      ? t("rentalFormMaxImagesReached")
                      : t("rentalFormUploadCta")}
                  </p>
                  <p className="text-sm text-gray-500">
                    {t("rentalFormUploadHint")}
                  </p>
                </label>
              </div>

              {errors.images && (
                <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                  <X className="h-4 w-4" />
                  {errors.images}
                </p>
              )}

              {/* Image Previews */}
              {imagePreviews.length > 0 && (
                <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-4">
                  {imagePreviews.map((preview, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={preview}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-32 object-cover rounded-xl border-2 border-emerald-200 group-hover:border-emerald-400 transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute -top-2 -right-2 bg-gradient-to-br from-red-500 to-red-600 text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-all shadow-lg hover:scale-110"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Upload Progress */}
              {isSubmitting && uploadProgress > 0 && uploadProgress < 100 && (
                <div className="mt-4 bg-gradient-to-r from-emerald-100 to-green-100 border border-emerald-200 rounded-xl p-4">
                  <div className="flex justify-between text-sm text-emerald-700 font-semibold mb-2">
                    <span>{t("rentalFormUploadingImages")}</span>
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

            {/* Submit Button */}
            <div className="pt-6">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-emerald-500 to-green-600 text-white py-4 px-6 rounded-xl hover:from-emerald-600 hover:to-green-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-bold text-lg shadow-lg hover:shadow-xl hover:scale-[1.02] flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    {uploadProgress > 0 && uploadProgress < 100 ? (
                      <>
                        <Upload className="h-5 w-5 animate-pulse" />
                        {`${t("rentalFormSubmitUploading")} ${Math.round(
                          uploadProgress
                        )}%`}
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-5 w-5 animate-pulse" />
                        {isEditing
                          ? t("rentalFormSubmitUpdatingListing")
                          : t("rentalFormSubmitCreatingListing")}
                      </>
                    )}
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-5 w-5" />
                    {isEditing
                      ? t("rentalFormSubmitUpdateListing")
                      : t("rentalFormSubmitCreateListing")}
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

export default AddRental;
