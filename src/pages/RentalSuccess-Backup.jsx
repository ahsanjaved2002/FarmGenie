import React, { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { CheckCircle, ArrowLeft, Calendar, DollarSign } from "lucide-react";
import { useTranslation } from "react-i18next";

const RentalSuccess = () => {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const rentalId = searchParams.get("rental_id");
  const [paymentDetails, setPaymentDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const { t } = useTranslation("common");

  useEffect(() => {
    const verifyPayment = async () => {
      if (sessionId) {
        try {
          const response = await fetch(
            import.meta.env.PROD
              ? `https://farmgenie-alpha.vercel.app/api/verify-payment/${sessionId}`
              : `http://172.22.16.1:3000/verify-payment/${sessionId}`
          );
          
          if (!response.ok) {
            throw new Error('Payment verification failed');
          }
          
          const data = await response.json();
          
          if (data.status !== 'complete' && data.status !== 'paid') {
            // If payment is not complete, redirect to home
            window.location.href = '/';
            return;
          }
          
          setPaymentDetails(data);
        } catch (error) {
          console.error("Error verifying payment:", error);
          // Redirect to home on error
          window.location.href = '/';
        } finally {
          setLoading(false);
        }
      } else {
        // No session ID, redirect to home
        window.location.href = '/';
        setLoading(false);
      }
    };

    verifyPayment();
  }, [sessionId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-semibold">
            {t("rentalVerifyingPayment")}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-green-50 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl shadow-2xl border-2 border-emerald-200 p-12 text-center">
          {/* Success Icon */}
          <div className="inline-flex p-6 rounded-full bg-gradient-to-br from-emerald-100 to-green-100 mb-6">
            <CheckCircle className="h-20 w-20 text-emerald-600" />
          </div>

          {/* Success Message */}
          <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-700 to-green-600 bg-clip-text text-transparent mb-4">
            {t("rentalConfirmedTitle")}
          </h1>
          <p className="text-gray-600 text-lg mb-8">
            {t("rentalConfirmedBody")}
          </p>

          {/* Payment Details */}
          {paymentDetails && (
            <div className="bg-gradient-to-br from-emerald-50 to-green-50 border-2 border-emerald-200 rounded-2xl p-6 mb-8 text-left">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-emerald-600" />
                {t("rentalPaymentDetails")}
              </h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">{t("amountPaid")}</span>
                  <span className="font-bold text-emerald-600">
                    ${paymentDetails.amount}{" "}
                    {paymentDetails.currency.toUpperCase()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">{t("statusLabel")}</span>
                  <span className="font-bold text-emerald-600 capitalize">
                    {paymentDetails.status}
                  </span>
                </div>
                {paymentDetails.customerEmail && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">
                      {t("confirmationEmailLabel")}
                    </span>
                    <span className="font-medium text-gray-900">
                      {paymentDetails.customerEmail}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Next Steps */}
          <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-6 mb-8 text-left">
            <h3 className="text-lg font-bold text-blue-900 mb-3 flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-600" />
              {t("whatsNext")}
            </h3>
            <ul className="text-blue-700 space-y-2 text-sm">
              <li className="flex items-start">
                <span className="text-blue-600 mr-2">✓</span>
                <span>{t("rentalNextStep1")}</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-600 mr-2">✓</span>
                <span>{t("rentalNextStep2")}</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-600 mr-2">✓</span>
                <span>{t("rentalNextStep3")}</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-600 mr-2">✓</span>
                <span>{t("rentalNextStep4")}</span>
              </li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/rentals"
              className="bg-gradient-to-br from-emerald-500 to-green-600 text-white px-8 py-4 rounded-2xl hover:from-emerald-600 hover:to-green-700 transition-all duration-300 font-bold shadow-lg hover:shadow-xl hover:scale-105 inline-flex items-center justify-center gap-2"
            >
              <ArrowLeft className="h-5 w-5" />
              {t("browseMoreRentals")}
            </Link>
            {rentalId && (
              <Link
                to={`/rentals/${rentalId}`}
                className="border-2 border-emerald-600 text-emerald-600 px-8 py-4 rounded-2xl hover:bg-emerald-50 transition-all duration-300 font-bold inline-flex items-center justify-center gap-2"
              >
                {t("viewRentalDetails")}
              </Link>
            )}
          </div>
        </div>

        {/* Help Section */}
        <div className="mt-8 text-center">
          <p className="text-gray-600">
            {t("needHelp")}{" "}
            <a
              href="/support"
              className="text-emerald-600 hover:text-emerald-700 font-semibold"
            >
              {t("contactSupport")}
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RentalSuccess;