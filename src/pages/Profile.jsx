import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useTranslation } from "react-i18next";
import translationService from "../services/translationService";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Shield,
  Edit2,
  X,
  Save,
  Loader,
  CheckCircle,
  AlertCircle,
  Sparkles,
} from "lucide-react";

const Profile = () => {
  const { user, updateUserProfile } = useAuth();
  const { t, i18n } = useTranslation("common");
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    phone: "",
    location: "",
  });
  const [editedProfile, setEditedProfile] = useState({
    name: "",
    email: "",
    phone: "",
    location: "",
  });
  const [translatedProfile, setTranslatedProfile] = useState({
    name: "",
    email: "",
    phone: "",
    location: "",
  });
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState("");
  const [isTranslating, setIsTranslating] = useState(false);

  useEffect(() => {
    if (user) {
      const userData = {
        name: user.name || user.displayName || "",
        email: user.email || "",
        phone: user.phone || "",
        location: user.location || "",
      };
      setProfile(userData);
      setEditedProfile(userData);
      setLoading(false);
    }
  }, [user]);

  // Translation effect for profile data
  useEffect(() => {
    let isMounted = true;

    const translateProfile = async () => {
      if (!profile.name && !profile.location) {
        setTranslatedProfile(profile);
        setIsTranslating(false);
        return;
      }

      if (i18n.language === "en") {
        setTranslatedProfile(profile);
        setIsTranslating(false);
        return;
      }

      setIsTranslating(true);
      const targetLang = i18n.language;

      try {
        // Create an object with only the fields that need translation
        const toTranslate = {
          name: profile.name || "",
          location: profile.location || "",
        };

        // Translate the fields
        const translated = await translationService.translateArray(
          [toTranslate],
          ["name", "location"],
          targetLang
        );

        if (isMounted && translated.length > 0) {
          setTranslatedProfile({
            ...profile,
            name: translated[0].name || profile.name,
            location: translated[0].location || profile.location,
          });
          setIsTranslating(false);
        }
      } catch (error) {
        console.error("Translation failed:", error);
        if (isMounted) {
          setTranslatedProfile(profile);
          setIsTranslating(false);
        }
      }
    };

    const timer = setTimeout(translateProfile, 300);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [profile, i18n.language]);

  const handleUpdate = async () => {
    setUpdating(true);
    setError("");
    setShowSuccess(false);

    const res = await updateUserProfile(editedProfile);
    setUpdating(false);

    if (res.success) {
      setProfile(editedProfile);
      setShowSuccess(true);
      setIsEditing(false);
      setTimeout(() => setShowSuccess(false), 3000);
    } else {
      setError(res.error || t("profileUpdateFailed"));
    }
  };

  const handleCancel = () => {
    setEditedProfile(profile);
    setIsEditing(false);
    setError("");
  };

  // Use translated profile for display
  const displayProfile = isTranslating ? profile : translatedProfile;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-green-50 flex items-center justify-center">
        <div className="text-center">
          <Loader className="h-12 w-12 text-emerald-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 text-lg">{t("loadingProfile")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-green-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Success Message */}
        {showSuccess && (
          <div className="mb-6 bg-gradient-to-r from-emerald-50 to-green-50 border-2 border-emerald-200 rounded-2xl p-5 shadow-lg animate-in fade-in slide-in-from-top-2">
            <p className="text-emerald-700 font-bold flex items-center">
              <CheckCircle className="h-5 w-5 mr-2" />
              {t("profileUpdated")}
            </p>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-gradient-to-r from-red-50 to-red-100 border-2 border-red-200 rounded-2xl p-5 shadow-lg animate-in fade-in slide-in-from-top-2">
            <p className="text-red-700 font-bold flex items-center">
              <AlertCircle className="h-5 w-5 mr-2" />
              {error}
            </p>
          </div>
        )}

        {/* Profile Card */}
        <div className="bg-white rounded-3xl shadow-2xl border-2 border-emerald-200 overflow-hidden">
          {/* Header Section with Cover */}
          <div className="h-40 bg-gradient-to-r from-emerald-500 via-green-600 to-emerald-700 relative">
            <div className="absolute inset-0 opacity-20">
              <div className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full blur-3xl animate-pulse"></div>
              <div className="absolute bottom-0 right-0 w-64 h-64 bg-green-300 rounded-full blur-3xl animate-pulse delay-700"></div>
            </div>
            <div className="absolute -bottom-20 left-8">
              <div className="relative group">
                <div className="w-40 h-40 rounded-full border-4 border-white bg-gradient-to-br from-emerald-400 via-green-500 to-emerald-600 flex items-center justify-center text-white font-bold text-5xl overflow-hidden shadow-2xl transition-transform duration-300 group-hover:scale-105">
                  {user?.name?.charAt(0).toUpperCase() ||
                    user?.email?.charAt(0).toUpperCase()
                  }
                </div>
                {isEditing && (
                  <div className="absolute top-2 right-2 flex space-x-2">
                    <button
                      onClick={handleUpdate}
                      disabled={updating}
                      className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {updating ? (
                        <>
                          <Loader className="h-4 w-4 animate-spin mr-2" />
                          {t("saving")}
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-2" />
                          {t("save")}
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => setIsEditing(false)}
                      className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Profile Content */}
          <div className="pt-24 pb-8 px-8">
            <div className="flex flex-col md:flex-row justify-between md:items-start mb-8 gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <h1 className="text-4xl leading-[1.5] font-bold bg-gradient-to-r from-emerald-700 to-green-600 bg-clip-text text-transparent">
                    {isTranslating ? (
                      <span className="inline-flex items-center gap-2">
                        {profile.name || user?.email}
                        <Loader className="h-5 w-5 animate-spin text-emerald-600" />
                      </span>
                    ) : (
                      displayProfile.name || user?.email
                    )}
                  </h1>
                  <Sparkles className="h-6 w-6 text-emerald-600" />
                </div>
                <p className="text-gray-600 text-lg">{profile.email}</p>
              </div>
              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-br from-emerald-500 to-green-600 text-white rounded-2xl hover:from-emerald-600 hover:to-green-700 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 font-semibold"
                >
                  <Edit2 className="h-5 w-5" />
                  {t("Edit Profile")}
                </button>
              )}
            </div>

            {/* Profile Information Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {/* Email */}
              <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-2xl p-5 border-2 border-emerald-200 hover:border-emerald-300 transition-all">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-green-600 rounded-full flex items-center justify-center shadow-lg">
                    <Mail className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-600 font-bold mb-1">
                      {t("emailAddressLabel")}
                    </p>
                    {isEditing ? (
                      <input
                        type="email"
                        value={editedProfile.email}
                        onChange={(e) =>
                          setEditedProfile({
                            ...editedProfile,
                            email: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border-2 border-emerald-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-0 bg-white transition-all"
                        placeholder={t("emailPlaceholder")}
                      />
                    ) : (
                      <p className="text-gray-900 font-semibold">
                        {profile.email}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Name */}
              <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-2xl p-5 border-2 border-emerald-200 hover:border-emerald-300 transition-all">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-green-600 rounded-full flex items-center justify-center shadow-lg">
                    <User className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-600 font-bold mb-1">
                      {t("fullNameLabel")}
                    </p>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editedProfile.name}
                        onChange={(e) =>
                          setEditedProfile({
                            ...editedProfile,
                            name: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border-2 border-emerald-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-0 bg-white transition-all"
                        placeholder={t("enterYourName")}
                      />
                    ) : (
                      <p className="text-gray-900 font-semibold">
                        {isTranslating ? (
                          <span className="inline-flex items-center gap-2">
                            {profile.name || t("notSet")}
                            <Loader className="h-4 w-4 animate-spin text-emerald-600" />
                          </span>
                        ) : (
                          displayProfile.name || t("notSet")
                        )}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Phone */}
              <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-2xl p-5 border-2 border-emerald-200 hover:border-emerald-300 transition-all">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-green-600 rounded-full flex items-center justify-center shadow-lg">
                    <Phone className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-600 font-bold mb-1">
                      {t("phoneNumberLabel")}
                    </p>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editedProfile.phone}
                        onChange={(e) =>
                          setEditedProfile({
                            ...editedProfile,
                            phone: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border-2 border-emerald-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-0 bg-white transition-all"
                        placeholder={t("enterYourPhone")}
                      />
                    ) : (
                      <p className="text-gray-900 font-semibold">
                        {profile.phone || t("notSet")}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Location */}
              <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-2xl p-5 border-2 border-emerald-200 hover:border-emerald-300 transition-all">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-green-600 rounded-full flex items-center justify-center shadow-lg">
                    <MapPin className="h-6 w-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-600 font-bold mb-1">
                      {t("location")}
                    </p>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editedProfile.location}
                        onChange={(e) =>
                          setEditedProfile({
                            ...editedProfile,
                            location: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border-2 border-emerald-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-0 bg-white transition-all"
                        placeholder={t("enterYourLocation")}
                      />
                    ) : (
                      <p className="text-gray-900 font-semibold">
                        {isTranslating ? (
                          <span className="inline-flex items-center gap-2">
                            {profile.location || t("notSet")}
                            <Loader className="h-4 w-4 animate-spin text-emerald-600" />
                          </span>
                        ) : (
                          displayProfile.location || t("notSet")
                        )}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            {isEditing && (
              <div className="flex gap-3 justify-end">
                <button
                  onClick={handleCancel}
                  disabled={updating}
                  className="flex items-center gap-2 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-2xl hover:bg-gray-50 transition-all disabled:opacity-50 font-semibold hover:scale-105"
                >
                  <X className="h-5 w-5" />
                  {t("msgCancel")}
                </button>
                <button
                  onClick={handleUpdate}
                  disabled={updating}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-br from-emerald-500 to-green-600 text-white rounded-2xl hover:from-emerald-600 hover:to-green-700 transition-all duration-300 disabled:opacity-50 shadow-lg hover:shadow-xl font-semibold hover:scale-105"
                >
                  {updating ? (
                    <>
                      <Loader className="h-5 w-5 animate-spin" />
                      {t("updating")}
                    </>
                  ) : (
                    <>
                      <Save className="h-5 w-5" />
                      {t("saveChanges")}
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Account Information Section */}
            <div className="mt-10 pt-8 border-t-2 border-gray-100">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Sparkles className="h-6 w-6 text-emerald-600" />
                {t("accountInformation")}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center gap-4 bg-gradient-to-br from-emerald-50 to-green-50 rounded-2xl p-5 border-2 border-emerald-200">
                  <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-green-600 rounded-full flex items-center justify-center shadow-lg">
                    <Shield className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 font-bold mb-1">
                      {t("userIdLabel")}
                    </p>
                    <p className="text-sm text-gray-900 font-mono font-semibold">
                      {user?.uid?.substring(0, 20)}...
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4 bg-gradient-to-br from-emerald-50 to-green-50 rounded-2xl p-5 border-2 border-emerald-200">
                  <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-green-600 rounded-full flex items-center justify-center shadow-lg">
                    <Calendar className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 font-bold mb-1">
                      {t("memberSince")}
                    </p>
                    <p className="text-sm text-gray-900 font-semibold">
                      {user?.metadata?.creationTime
                        ? new Date(
                            user.metadata.creationTime
                          ).toLocaleDateString()
                        : t("unknown")}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
