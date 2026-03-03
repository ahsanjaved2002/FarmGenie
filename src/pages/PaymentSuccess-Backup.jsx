import React, { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { CheckCircle, ArrowRight, Package, Sparkles, Mail } from "lucide-react";
import { useTranslation } from "react-i18next";

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const productId = searchParams.get("product_id");
  const [paymentDetails, setPaymentDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { t } = useTranslation("common");

  useEffect(() => {
    if (sessionId) {
      fetch(
        import.meta.env.PROD
          ? `https://farmgenie-alpha.vercel.app/api/verify-payment/${sessionId}`
          : `http://172.22.16.1:3000/verify-payment/${sessionId}`
      )
        .then((res) => {
          if (!res.ok) {
            throw new Error('Payment verification failed');
          }
          return res.json();
        })
        .then((data) => {
          if (data.status !== 'complete' && data.status !== 'paid') {
            // If payment is not complete, show message and redirect
            setError('Payment not completed. Redirecting to home...');
            setTimeout(() => {
              window.location.href = '/';
            }, 3000);
            return;
          }
          setPaymentDetails(data);
          setLoading(false);
        })
        .catch((err) => {
          console.error("Error verifying payment:", err);
          setError('Payment verification failed. Redirecting to home...');
          setTimeout(() => {
            window.location.href = '/';
          }, 3000);
        });
    } else {
      // No session ID, show message and redirect
      setError('No payment session found. Redirecting to home...');
      setTimeout(() => {
        window.location.href = '/';
      }, 3000);
    }
  }, [sessionId]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-green-50 flex items-center justify-center px-4 py-12">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden opacity-20 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-emerald-300 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-green-300 rounded-full blur-3xl animate-pulse delay-700"></div>
      </div>

      <div className="relative max-w-md w-full">
        <div className="bg-white rounded-3xl shadow-2xl border-2 border-emerald-200 p-10 relative overflow-hidden">
          {/* Decorative top gradient */}
          <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-emerald-400 to-green-500"></div>

          {/* Success Icon */}
          <div className="flex justify-center mb-8">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-400 to-green-500 rounded-full blur-xl opacity-50 animate-pulse"></div>
              <div className="relative bg-gradient-to-br from-emerald-100 to-green-100 rounded-full p-6 border-4 border-white shadow-xl">
                <CheckCircle
                  className="h-20 w-20 text-emerald-600 animate-bounce"
                  style={{ animationDuration: "2s" }}
                />
              </div>
            </div>
          </div>

          {/* Success Message */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Sparkles className="h-6 w-6 text-emerald-600" />
              <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-700 to-green-600 bg-clip-text text-transparent">
                {t("paymentSuccessTitle")}
              </h1>
            </div>
            <p className="text-gray-600 text-lg leading-relaxed">
              {t("paymentSuccessBody")}
            </p>
          </div>

          {/* Payment Details */}
          {error ? (
            <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-green-50 flex items-center justify-center px-4 py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-emerald-600 mx-auto mb-4"></div>
                <p className="text-gray-600 font-semibold">{error}</p>
              </div>
            </div>
          ) : loading ? (
            <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-2xl border-2 border-emerald-200 p-6 mb-8">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 font-semibold">
                    {t("paymentStatusLabel")}
                  </span>
                  <span className="font-bold text-emerald-600 capitalize px-4 py-1 bg-emerald-100 rounded-full">
                    {paymentDetails && paymentDetails.status}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 font-semibold">
                    {t("paymentAmountPaidLabel")}
                  </span>
                  <span className="font-bold text-gray-900 text-xl">
                    ${paymentDetails && paymentDetails.amount}
                  </span>
                </div>
                {paymentDetails && paymentDetails.customerEmail && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 font-semibold">
                      {t("paymentEmailLabel")}
                    </span>
                    <span className="font-semibold text-gray-900 text-sm">
                      {paymentDetails.customerEmail}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-2xl border-2 border-emerald-200 p-6 mb-8">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 font-semibold">
                    {t("paymentStatusLabel")}
                  </span>
                  <span className="font-bold text-emerald-600 capitalize px-4 py-1 bg-emerald-100 rounded-full">
                    {paymentDetails.status}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 font-semibold">
                    {t("paymentAmountPaidLabel")}
                  </span>
                  <span className="font-bold text-gray-900 text-xl">
                    ${paymentDetails.amount}
                  </span>
                </div>
                {paymentDetails.customerEmail && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 font-semibold">
                      {t("paymentEmailLabel")}
                    </span>
                    <span className="font-semibold text-gray-900 text-sm">
                      {paymentDetails.customerEmail}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-3 mb-8">
            {productId && (
              <Link
                to={`/marketplace/${productId}`}
                className="w-full bg-gradient-to-br from-emerald-500 to-green-600 text-white py-4 px-6 rounded-2xl hover:from-emerald-600 hover:to-green-700 transition-all duration-300 font-bold text-lg shadow-lg hover:shadow-xl hover:scale-[1.02] flex items-center justify-center gap-2"
              >
                <Package className="h-5 w-5" />
                {t("viewProduct")}
              </Link>
            )}
            <Link
              to="/marketplace"
              className="w-full border-2 border-emerald-600 text-emerald-600 py-4 px-6 rounded-2xl hover:bg-emerald-50 transition-all duration-300 font-bold text-lg flex items-center justify-center gap-2"
            >
              {t("continueShopping")}
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>

          {/* Additional Info */}
          <div className="pt-6 border-t-2 border-gray-100">
            <div className="flex items-center justify-center gap-2 text-gray-500 text-sm">
              <Mail className="h-4 w-4" />
              <p className="text-center">{t("confirmationEmailNote")}</p>
            </div>
          </div>

          {/* Decorative bottom corners */}
          <div className="absolute -bottom-2 -left-2 w-20 h-20 bg-gradient-to-br from-emerald-400 to-green-500 rounded-full blur-2xl opacity-20"></div>
          <div className="absolute -top-2 -right-2 w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full blur-2xl opacity-20"></div>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;
