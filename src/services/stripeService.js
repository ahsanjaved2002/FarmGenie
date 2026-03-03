// Stripe service for handling payments
import { loadStripe } from '@stripe/stripe-js';

const STRIPE_PUBLISHABLE_KEY = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 
  'pk_test_51SHMiUP4RuCGvOwJx9v2QKz8JZ4H7L6s5M3n2P8rT1Y9W0XqV7K6N5B4C3A2D1E9F8G7H6I5J4K3L2M1N0O9P8Q7R6S5T4U3V2W1X0Z9Y8';

let stripePromise;

export const getStripe = () => {
  if (!stripePromise) {
    stripePromise = loadStripe(STRIPE_PUBLISHABLE_KEY);
  }
  return stripePromise;
};

export const createCheckoutSession = async (paymentData) => {
  try {
    const response = await fetch(
      import.meta.env.PROD
        ? "https://farmgenie-alpha.vercel.app/api/create-checkout-session"
        : "http://localhost:3000/api/create-checkout-session",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(paymentData),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Stripe service error:', error);
    throw error;
  }
};

export const createRentalCheckoutSession = async (rentalData) => {
  try {
    const response = await fetch(
      import.meta.env.PROD
        ? "https://farmgenie-alpha.vercel.app/api/create-rental-checkout-session"
        : "http://localhost:3000/api/create-rental-checkout-session",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(rentalData),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Stripe rental service error:', error);
    throw error;
  }
};

export const verifyPayment = async (sessionId) => {
  try {
    const response = await fetch(
      import.meta.env.PROD
        ? `https://farmgenie-alpha.vercel.app/api/verify-payment.js?sessionId=${sessionId}`
        : `http://localhost:3000/api/verify-payment/${sessionId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Payment verification error:', error);
    throw error;
  }
};
