import React, { useState } from 'react';
import { createCheckoutSession } from '../services/stripeService';

const PaymentTest = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const testPayment = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      console.log('Testing payment with demo data...');
      
      const testData = {
        price: 10.00, // $10 USD test amount
        productName: 'Test Product',
        productDescription: 'This is a test product for payment debugging',
        productId: 'test-product-123',
        sellerId: 'test-seller-456',
        sellerName: 'Test Seller',
      };

      const result = await createCheckoutSession(testData);
      console.log('Payment test result:', result);
      
      setSuccess(`Checkout session created! Session ID: ${result.sessionId}`);
      
      // Optionally redirect to Stripe checkout
      if (result.url && window.confirm('Redirect to Stripe checkout?')) {
        window.location.href = result.url;
      }
    } catch (error) {
      console.error('Payment test error:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Stripe Payment Test</h1>
        
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 mb-2">Test Details:</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Amount: $10.00 USD</li>
              <li>• Product: Test Product</li>
              <li>• Uses your Stripe test keys</li>
              <li>• Test card: 4242 4242 4242 4242</li>
            </ul>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h3 className="font-semibold text-red-900 mb-1">Error:</h3>
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="font-semibold text-green-900 mb-1">Success:</h3>
              <p className="text-sm text-green-800">{success}</p>
            </div>
          )}

          <button
            onClick={testPayment}
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Processing...' : 'Test Payment ($10)'}
          </button>

          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-2">Test Card Numbers:</h3>
            <div className="text-sm text-gray-700 space-y-1">
              <p><strong>Success:</strong> 4242 4242 4242 4242</p>
              <p><strong>Declined:</strong> 4000 0000 0000 0002</p>
              <p><strong>Requires 3DS:</strong> 4000 0025 0000 3155</p>
              <p className="text-xs mt-2">Use any future expiry date and any 3-digit CVC</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentTest;
