import React, { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import {
  ArrowLeft,
  X,
  ImagePlus,
  Sparkles,
  Loader,
  Check,
  ChevronDown,
} from "lucide-react";
import { useData } from "../context/DataContext";
import { useAuth } from "../context/AuthContext";
import { uploadImage } from "../supabase";
import { useTranslation } from "react-i18next";

const AddSale = () => {
  const { t } = useTranslation("common");
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = !!id;
  const { sales, addSale, updateSale } = useData();
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    category: "crops",
    condition: "new",
    location: "",
    images: [],
    available: true,
  });

  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const [isConditionDropdownOpen, setIsConditionDropdownOpen] = useState(false);

  const categories = [
    { value: "crops", label: t("crops") },
    { value: "seeds", label: t("seeds") },
    { value: "tools", label: t("tools") },
    { value: "fertilizer", label: t("fertilizer") },
    { value: "other", label: t("other") },
  ];

  const conditions = [
    { value: "new", label: t("new") },
    { value: "used", label: t("used") },
    { value: "refurbished", label: t("refurbished") },
  ];

  // Load existing sale data if editing
  useEffect(() => {
    if (isEditing) {
      const sale = sales.find((s) => s.id === id);
      if (sale) {
        if (sale.ownerId !== user?.uid) {
          navigate("/marketplace");
          return;
        }
        setFormData({
          title: sale.title,
          description: sale.description,
          price: sale.price.toString(),
          category: sale.category,
          condition: sale.condition,
          location: sale.location,
          images: sale.images,
          available: sale.available,
        });
      }
    }
  }, [isEditing, id, sales, user, navigate]);

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
      alert(t("saleFormMaxImagesAlert"));
      return;
    }

    const validFiles = files.filter((file) => {
      const isValidType = file.type.startsWith("image/");
      const isValidSize = file.size <= 5 * 1024 * 1024;

      if (!isValidType) {
        alert(t("saleFormInvalidFileType", { fileName: file.name }));
        return false;
      }
      if (!isValidSize) {
        alert(t("saleFormFileTooLarge", { fileName: file.name }));
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

  const uploadImages = async () => {
    const imageUrls = [];

    for (let i = 0; i < imageFiles.length; i++) {
      const file = imageFiles[i];

      try {
        const url = await uploadImage(file, "sales");
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
    if (!formData.price || parseFloat(formData.price) < 500)
      newErrors.price = t("fieldRequiredValidPrice");
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
      console.log("Starting sale submission...");

      // Upload new images if any
      let imageUrls = [...formData.images];
      if (imageFiles.length > 0) {
        console.log("Uploading images to Supabase...");
        const newImageUrls = await uploadImages();
        imageUrls = [...imageUrls, ...newImageUrls];
        console.log("Images uploaded successfully:", imageUrls);
      }

      const saleData = {
        ...formData,
        images: imageUrls,
        price: parseFloat(formData.price),
        ownerId: user.uid,
        ownerName: user.displayName || user.email || "Unknown",
        ownerEmail: user.email,
      };

      console.log("Sale data prepared:", saleData);

      if (isEditing) {
        console.log("Updating existing sale...");
        await updateSale(id, saleData);
      } else {
        console.log("Creating new sale...");
        await addSale(saleData);
      }

      console.log("Sale saved successfully!");
      alert(isEditing ? (t("saleUpdateSuccess") || "Product updated successfully!") : (t("saleCreateSuccess") || "Product listed successfully!"));
      navigate("/dashboard");
    } catch (error) {
      console.error("Full error details:", error);
      console.error("Error message:", error.message);
      alert(
        `${t("saleListFailedPrefix") || "Failed to list product"}\n\nError: ${
          error.message
        }\n\nCheck console for details.`
      );
    } finally {
      setIsSubmitting(false);
      setUploadProgress(0);
    }
  };

  const getCategoryLabel = () => {
    return (
      categories.find((cat) => cat.value === formData.category)?.label ||
      t("selectCategory")
    );
  };

  const getConditionLabel = () => {
    return (
      conditions.find((cond) => cond.value === formData.condition)?.label ||
      t("selectCondition")
    );
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
              {isEditing ? t("addSaleTitleEdit") : t("addSaleTitleNew")}
            </h1>
          </div>
          <p className="text-gray-600 text-lg">
            {isEditing ? t("addSaleSubtitleEdit") : t("addSaleSubtitleNew")}
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
                {t("saleFormProductTitle")}
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
                placeholder={t("saleFormProductTitlePlaceholder")}
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
                {t("saleFormDescriptionLabel")}
              </label>
              <textarea
                id="description"
                name="description"
                rows={5}
                value={formData.description}
                onChange={handleChange}
                className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors bg-white resize-none ${
                  errors.description
                    ? "border-red-300"
                    : "border-emerald-200 focus:border-emerald-500 hover:border-emerald-400"
                }`}
                placeholder={t("saleFormDescriptionPlaceholder")}
              />
              {errors.description && (
                <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                  <X className="h-4 w-4" />
                  {errors.description}
                </p>
              )}
            </div>

            {/* Category, Condition, and Price */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Category Dropdown */}
              <div>
                <label
                  htmlFor="category"
                  className="block text-gray-700 font-semibold mb-2"
                >
                  {t("saleFormCategoryLabel")}
                </label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() =>
                      setIsCategoryDropdownOpen(!isCategoryDropdownOpen)
                    }
                    className="w-full px-4 py-3 border-2 border-emerald-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white transition-colors cursor-pointer hover:border-emerald-400 text-left rtl:text-right font-medium text-gray-700"
                  >
                    {getCategoryLabel()}
                  </button>
                  <ChevronDown
                    className={`absolute right-4 rtl:right-auto rtl:left-4 top-4 h-5 w-5 text-emerald-600 pointer-events-none transition-transform ${
                      isCategoryDropdownOpen ? "rotate-180" : ""
                    }`}
                  />

                  {isCategoryDropdownOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-10"
                        onClick={() => setIsCategoryDropdownOpen(false)}
                      />
                      <div className="absolute z-20 w-full mt-2 bg-white border-2 border-emerald-200 rounded-xl shadow-2xl overflow-hidden">
                        {categories.map((category) => (
                          <button
                            key={category.value}
                            type="button"
                            onClick={() => {
                              handleChange({
                                target: {
                                  name: "category",
                                  value: category.value,
                                },
                              });
                              setIsCategoryDropdownOpen(false);
                            }}
                            className={`w-full px-4 py-3 text-left rtl:text-right hover:bg-gradient-to-r hover:from-emerald-50 hover:to-green-50 transition-all font-medium ${
                              formData.category === category.value
                                ? "bg-gradient-to-r from-emerald-50 to-green-50 text-emerald-700 border-l-4 rtl:border-l-0 rtl:border-r-4 border-emerald-600"
                                : "text-gray-700"
                            }`}
                          >
                            {category.label}
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Condition Dropdown */}
              <div>
                <label
                  htmlFor="condition"
                  className="block text-gray-700 font-semibold mb-2"
                >
                  {t("saleFormConditionLabel")}
                </label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() =>
                      setIsConditionDropdownOpen(!isConditionDropdownOpen)
                    }
                    className="w-full px-4 py-3 border-2 border-emerald-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white transition-colors cursor-pointer hover:border-emerald-400 text-left rtl:text-right font-medium text-gray-700"
                  >
                    {getConditionLabel()}
                  </button>
                  <ChevronDown
                    className={`absolute right-4 rtl:right-auto rtl:left-4 top-4 h-5 w-5 text-emerald-600 pointer-events-none transition-transform ${
                      isConditionDropdownOpen ? "rotate-180" : ""
                    }`}
                  />

                  {isConditionDropdownOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-10"
                        onClick={() => setIsConditionDropdownOpen(false)}
                      />
                      <div className="absolute z-20 w-full mt-2 bg-white border-2 border-emerald-200 rounded-xl shadow-2xl overflow-hidden">
                        {conditions.map((condition) => (
                          <button
                            key={condition.value}
                            type="button"
                            onClick={() => {
                              handleChange({
                                target: {
                                  name: "condition",
                                  value: condition.value,
                                },
                              });
                              setIsConditionDropdownOpen(false);
                            }}
                            className={`w-full px-4 py-3 text-left rtl:text-right hover:bg-gradient-to-r hover:from-emerald-50 hover:to-green-50 transition-all font-medium ${
                              formData.condition === condition.value
                                ? "bg-gradient-to-r from-emerald-50 to-green-50 text-emerald-700 border-l-4 rtl:border-l-0 rtl:border-r-4 border-emerald-600"
                                : "text-gray-700"
                            }`}
                          >
                            {condition.label}
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Price */}
              <div>
                <label
                  htmlFor="price"
                  className="block text-gray-700 font-semibold mb-2"
                >
                  {t("saleFormPriceLabel")}
                </label>
                <input
                  type="number"
                  id="price"
                  name="price"
                  min="500"
                  step="1"
                  value={formData.price}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors bg-white ${
                    errors.price
                      ? "border-red-300"
                      : "border-emerald-200 focus:border-emerald-500 hover:border-emerald-400"
                  }`}
                  placeholder="1250"
                />
                {errors.price && (
                  <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                    <X className="h-4 w-4" />
                    {errors.price}
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
                {t("saleFormLocationLabel")}
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
                placeholder={t("saleFormLocationPlaceholder")}
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
                  id="available"
                  name="available"
                  checked={formData.available}
                  onChange={handleChange}
                  className="h-5 w-5 text-emerald-600 focus:ring-emerald-500 border-emerald-300 rounded"
                />
                <label
                  htmlFor="available"
                  className="ml-3 rtl:ml-0 rtl:mr-3 block text-gray-700 font-semibold"
                >
                  {t("saleFormAvailabilityLabel")}
                </label>
              </div>
            </div>

            {/* Image Upload */}
            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                {t("saleFormImagesLabel")}
              </label>

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
                  <ImagePlus className="h-12 w-12 mx-auto text-emerald-500 mb-3" />
                  <p className="text-gray-700 font-medium mb-1">
                    {imageFiles.length >= 5
                      ? t("saleFormMaxImagesReached")
                      : t("saleFormUploadCta")}
                  </p>
                  <p className="text-sm text-gray-500">
                    {t("saleFormUploadHint")}
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
                    <span>{t("saleFormUploadingImages")}</span>
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
                        <Loader className="h-5 w-5 animate-spin" />
                        {`${t("saleFormSubmitUploading")} ${Math.round(
                          uploadProgress
                        )}%`}
                      </>
                    ) : (
                      <>
                        <Check className="h-5 w-5 animate-pulse" />
                        {isEditing
                          ? t("saleFormSubmitUpdatingProduct")
                          : t("saleFormSubmitListingProduct")}
                      </>
                    )}
                  </>
                ) : (
                  <>
                    <Sparkles className="h-5 w-5" />
                    {isEditing
                      ? t("saleFormSubmitUpdateProduct")
                      : t("saleFormSubmitListProduct")}
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

export default AddSale;