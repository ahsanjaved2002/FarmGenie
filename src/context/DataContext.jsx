import React, { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "./AuthContext";
import { supabase } from "../supabase";

const DataContext = createContext();

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error("useData must be used within a DataProvider");
  }
  return context;
};

export const DataProvider = ({ children }) => {
  const { user } = useAuth();
  const [biddings, setBiddings] = useState([]);
  const [rentals, setRentals] = useState([]);
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch biddings from Supabase
  const fetchBiddings = async () => {
    try {
      const { data, error } = await supabase
        .from('biddings')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const biddingsData = data.map(item => ({
        id: item.id,
        title: item.title,
        description: item.description,
        startingPrice: item.starting_price,
        currentBid: item.current_bid,
        location: item.location,
        coordinates: item.coordinates,
        area: item.area,
        images: item.images,
        endDate: new Date(item.end_date),
        status: item.status,
        bids: item.bids || [],
        ownerId: item.owner_id,
        ownerName: item.owner_name,
        ownerEmail: item.owner_email,
        createdAt: new Date(item.created_at),
        updatedAt: new Date(item.updated_at)
      }));

      setBiddings(biddingsData);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching biddings:", error);
      setLoading(false);
    }
  };

  // Fetch rentals from Supabase
  const fetchRentals = async () => {
    try {
      const { data, error } = await supabase
        .from('rentals')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const rentalsData = data.map(item => ({
        id: item.id,
        title: item.title,
        description: item.description,
        pricePerDay: item.price_per_day,
        category: item.category,
        location: item.location,
        coordinates: item.coordinates,
        images: item.images,
        availability: item.available,
        ownerId: item.owner_id,
        ownerName: item.owner_name,
        ownerEmail: item.owner_email, // FIXED: Now mapping owner_email
        createdAt: new Date(item.created_at),
        updatedAt: new Date(item.updated_at)
      }));

      setRentals(rentalsData);
    } catch (error) {
      console.error("Error fetching rentals:", error);
    }
  };

  // Fetch sales from Supabase
  const fetchSales = async () => {
    try {
      const { data, error } = await supabase
        .from('sales')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const salesData = data.map(item => ({
        id: item.id,
        title: item.title,
        description: item.description,
        price: item.price,
        category: item.category,
        condition: item.condition,
        location: item.location,
        coordinates: item.coordinates,
        images: item.images,
        available: item.available,
        ownerId: item.owner_id,
        ownerName: item.owner_name,
        ownerEmail: item.owner_email, // FIXED: Now mapping owner_email
        createdAt: new Date(item.created_at),
        updatedAt: new Date(item.updated_at)
      }));

      setSales(salesData);
    } catch (error) {
      console.error("Error fetching sales:", error);
    }
  };

  // Subscribe to real-time changes
  useEffect(() => {
    fetchBiddings();
    fetchRentals();
    fetchSales();

    // Set up real-time subscriptions
    const biddingsSubscription = supabase
      .channel('biddings_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'biddings' }, () => {
        fetchBiddings();
      })
      .subscribe();

    const rentalsSubscription = supabase
      .channel('rentals_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'rentals' }, () => {
        fetchRentals();
      })
      .subscribe();

    const salesSubscription = supabase
      .channel('sales_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'sales' }, () => {
        fetchSales();
      })
      .subscribe();

    return () => {
      biddingsSubscription.unsubscribe();
      rentalsSubscription.unsubscribe();
      salesSubscription.unsubscribe();
    };
  }, []);

  // Add Bidding
  const addBidding = async (biddingData) => {
    try {
      const { data, error } = await supabase
        .from('biddings')
        .insert([{
          id: biddingData.id || crypto.randomUUID(),
          title: biddingData.title,
          description: biddingData.description,
          starting_price: biddingData.startingPrice,
          current_bid: biddingData.currentBid || biddingData.startingPrice || 0,
          location: biddingData.location,
          coordinates: biddingData.coordinates,
          area: biddingData.area,
          images: biddingData.images,
          end_date: biddingData.endDate,
          status: biddingData.status || 'active',
          bids: biddingData.bids || [],
          owner_id: biddingData.ownerId,
          owner_name: biddingData.ownerName,
          owner_email: biddingData.ownerEmail
        }])
        .select()
        .single();

      if (error) throw error;
      console.log("Bidding added:", data);
      return data.id;
    } catch (error) {
      console.error("Error adding bidding:", error);
      throw error;
    }
  };

  // Update Bidding
  const updateBidding = async (id, biddingData) => {
    try {
      const { error } = await supabase
        .from('biddings')
        .update({
          title: biddingData.title,
          description: biddingData.description,
          starting_price: biddingData.startingPrice,
          current_bid: biddingData.currentBid,
          location: biddingData.location,
          coordinates: biddingData.coordinates,
          area: biddingData.area,
          images: biddingData.images,
          end_date: biddingData.endDate,
          status: biddingData.status,
          bids: biddingData.bids,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;
      console.log("Bidding updated:", id);
    } catch (error) {
      console.error("Error updating bidding:", error);
      throw error;
    }
  };

  // Delete Bidding
  const deleteBidding = async (id) => {
    try {
      const { error } = await supabase
        .from('biddings')
        .delete()
        .eq('id', id);

      if (error) throw error;
      console.log("Bidding deleted:", id);
    } catch (error) {
      console.error("Error deleting bidding:", error);
      throw error;
    }
  };

  // Place Bid
  const placeBid = async (biddingId, bidData) => {
    try {
      // Get current bidding data
      const { data: currentBidding, error: fetchError } = await supabase
        .from('biddings')
        .select('*')
        .eq('id', biddingId)
        .single();

      if (fetchError) throw fetchError;

      // Create new bid object
      const newBid = {
        id: crypto.randomUUID(),
        amount: bidData.amount,
        bidderId: bidData.bidderId,
        bidderName: bidData.bidderName,
        bidderEmail: bidData.bidderEmail,
        timestamp: new Date().toISOString()
      };

      // Get existing bids and add new one
      const updatedBids = [...(currentBidding.bids || []), newBid];

      // Update bidding with new bid and current bid amount
      const { error: updateError } = await supabase
        .from('biddings')
        .update({
          bids: updatedBids,
          current_bid: bidData.amount,
          updated_at: new Date().toISOString()
        })
        .eq('id', biddingId);

      if (updateError) throw updateError;

      console.log("Bid placed successfully:", newBid);
    } catch (error) {
      console.error("Error placing bid:", error);
      throw error;
    }
  };

  // Add Rental - FIXED: Now saves owner_email
  const addRental = async (rentalData) => {
    try {
      const { data, error } = await supabase
        .from('rentals')
        .insert([{
          id: rentalData.id || crypto.randomUUID(),
          title: rentalData.title,
          description: rentalData.description,
          price_per_day: rentalData.pricePerDay,
          category: rentalData.category,
          location: rentalData.location,
          coordinates: rentalData.coordinates,
          images: rentalData.images,
          available: rentalData.availability,
          owner_id: rentalData.ownerId,
          owner_name: rentalData.ownerName,
          owner_email: rentalData.ownerEmail // FIXED: Added owner_email
        }])
        .select()
        .single();

      if (error) throw error;
      console.log("Rental added:", data);
      return data.id;
    } catch (error) {
      console.error("Error adding rental:", error);
      throw error;
    }
  };

  // Update Rental - FIXED: Now updates owner_email
  const updateRental = async (id, rentalData) => {
    try {
      const { error } = await supabase
        .from('rentals')
        .update({
          title: rentalData.title,
          description: rentalData.description,
          price_per_day: rentalData.pricePerDay,
          category: rentalData.category,
          location: rentalData.location,
          coordinates: rentalData.coordinates,
          images: rentalData.images,
          available: rentalData.availability,
          owner_email: rentalData.ownerEmail, // FIXED: Added owner_email
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;
      console.log("Rental updated:", id);
    } catch (error) {
      console.error("Error updating rental:", error);
      throw error;
    }
  };

  // Delete Rental
  const deleteRental = async (id) => {
    try {
      const { error } = await supabase
        .from('rentals')
        .delete()
        .eq('id', id);

      if (error) throw error;
      console.log("Rental deleted:", id);
    } catch (error) {
      console.error("Error deleting rental:", error);
      throw error;
    }
  };

  // Add Sale - FIXED: Now saves owner_email
  const addSale = async (saleData) => {
    try {
      const { data, error } = await supabase
        .from('sales')
        .insert([{
          id: saleData.id || crypto.randomUUID(),
          title: saleData.title,
          description: saleData.description,
          price: saleData.price,
          category: saleData.category,
          condition: saleData.condition,
          location: saleData.location,
          coordinates: saleData.coordinates,
          images: saleData.images,
          available: saleData.available,
          owner_id: saleData.ownerId,
          owner_name: saleData.ownerName,
          owner_email: saleData.ownerEmail // FIXED: Added owner_email
        }])
        .select()
        .single();

      if (error) throw error;
      console.log("Sale added:", data);
      return data.id;
    } catch (error) {
      console.error("Error adding sale:", error);
      throw error;
    }
  };

  // Update Sale - FIXED: Now updates owner_email
  const updateSale = async (id, saleData) => {
    try {
      const { error } = await supabase
        .from('sales')
        .update({
          title: saleData.title,
          description: saleData.description,
          price: saleData.price,
          category: saleData.category,
          condition: saleData.condition,
          location: saleData.location,
          coordinates: saleData.coordinates,
          images: saleData.images,
          available: saleData.available,
          owner_email: saleData.ownerEmail, // FIXED: Added owner_email
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;
      console.log("Sale updated:", id);
    } catch (error) {
      console.error("Error updating sale:", error);
      throw error;
    }
  };

  // Delete Sale
  const deleteSale = async (id) => {
    try {
      const { error } = await supabase
        .from('sales')
        .delete()
        .eq('id', id);

      if (error) throw error;
      console.log("Sale deleted:", id);
    } catch (error) {
      console.error("Error deleting sale:", error);
      throw error;
    }
  };

  const value = {
    biddings,
    rentals,
    sales,
    loading,
    addBidding,
    updateBidding,
    deleteBidding,
    placeBid,
    addRental,
    updateRental,
    deleteRental,
    addSale,
    updateSale,
    deleteSale,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};