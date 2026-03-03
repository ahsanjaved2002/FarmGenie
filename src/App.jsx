// src/App.jsx
import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { DataProvider } from "./context/DataContext";
import Header from "./components/Layout/Header";
import Footer from "./components/Layout/Footer";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Rentals from "./pages/Rentals";
import RentalDetail from "./pages/RentalDetail";
import AddRental from "./pages/AddRental";
import Bidding from "./pages/Bidding";
import BiddingDetail from "./pages/BiddingDetail";
import AddBidding from "./pages/AddBidding";
import Marketplace from "./pages/Marketplace";
import MarketplaceDetail from "./pages/MarketplaceDetail";
import AddSale from "./pages/AddSale";
import Dashboard from "./pages/Dashboard";
import SimpleChatbot from "./pages/SimpleChatbot";
import Profile from "./pages/Profile";
import ProtectedRoute from "./components/ProtectedRoute";
import PaymentSuccess from "./pages/PaymentSuccess";
import RentalSuccess from "./pages/RentalSuccess";
import PaymentTest from "./pages/PaymentTest";
import AboutUs from "./pages/AboutUs";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsAndServices from "./pages/TermsAndServices";
import ContactUs from "./pages/ContactUs";
import ScrollToTop from "./components/ScrollToTop";

function AppContent() {
  const location = useLocation();
  const hideFooter =
    location.pathname === "/login" || location.pathname === "/signup";

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      <main className="flex-grow">
        <Routes>
          {/* Public */}
          <Route path="/" element={<Home />} />
          <Route path="/chatbot" element={<SimpleChatbot />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/rentals" element={<Rentals />} />
          <Route path="/rentals/:id" element={<RentalDetail />} />
          <Route path="/bidding" element={<Bidding />} />
          <Route path="/bidding/:id" element={<BiddingDetail />} />
          <Route path="/marketplace" element={<Marketplace />} />
          <Route path="/marketplace/:id" element={<MarketplaceDetail />} />
          <Route path="/payment-success" element={<PaymentSuccess />} />
          <Route path="/rental-success" element={<RentalSuccess />} />
          <Route path="/payment-test" element={<PaymentTest />} />
          <Route path="/about-us" element={<AboutUs />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/terms-and-services" element={<TermsAndServices />} />
          <Route path="/contact-us" element={<ContactUs />} />

          {/* Protected */}
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/add-rental"
            element={
              <ProtectedRoute>
                <AddRental />
              </ProtectedRoute>
            }
          />
          <Route
            path="/edit-rental/:id"
            element={
              <ProtectedRoute>
                <AddRental />
              </ProtectedRoute>
            }
          />
          <Route
            path="/add-bidding"
            element={
              <ProtectedRoute>
                <AddBidding />
              </ProtectedRoute>
            }
          />
          <Route
            path="/edit-bidding/:id"
            element={
              <ProtectedRoute>
                <AddBidding />
              </ProtectedRoute>
            }
          />
          <Route
            path="/add-sale"
            element={
              <ProtectedRoute>
                <AddSale />
              </ProtectedRoute>
            }
          />
          <Route
            path="/edit-sale/:id"
            element={
              <ProtectedRoute>
                <AddSale />
              </ProtectedRoute>
            }
          />
        </Routes>
      </main>
      {!hideFooter && <Footer />}
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <DataProvider>
        <Router>
          <ScrollToTop />
          <AppContent />
        </Router>
      </DataProvider>
    </AuthProvider>
  );
}

export default App;
