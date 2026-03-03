// src/supabase.js
import { createClient } from '@supabase/supabase-js';

// Replace with your Supabase credentials
const supabaseUrl = 'https://khlywqsbnqcfkkpbuoxs.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtobHl3cXNibnFjZmtrcGJ1b3hzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA0Mzk4MzgsImV4cCI6MjA3NjAxNTgzOH0.nIIfXj7Dz7_2OZi0jh8VsyJE7JNY_hwqgprMYr7lT9M'; // Replace with your actual anon key

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ==================== IMAGE UPLOAD ====================

export const uploadImage = async (file, folder = 'biddings') => {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
    const filePath = `${folder}/${fileName}`;

    // Use bidding-images bucket for all uploads
    const bucket = 'bidding-images';

    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filePath, file);

    if (error) throw error;

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath);

    return publicUrl;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
};

// ==================== BIDDINGS ====================

export const createBidding = async (biddingData) => {
  const { data, error } = await supabase
    .from('biddings')
    .insert([{
      title: biddingData.title,
      description: biddingData.description,
      starting_price: biddingData.startingPrice,
      current_bid: biddingData.currentBid || biddingData.startingPrice,
      location: biddingData.location,
      coordinates: biddingData.coordinates || null,
      area: biddingData.area,
      images: biddingData.images || [],
      end_date: biddingData.endDate,
      status: biddingData.status || 'active',
      bids: biddingData.bids || [],
      owner_id: biddingData.ownerId,
      owner_name: biddingData.ownerName,
    }])
    .select();

  if (error) throw error;
  return data[0];
};

export const getBiddings = async () => {
  const { data, error } = await supabase
    .from('biddings')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
};

export const updateBidding = async (id, updates) => {
  const { data, error } = await supabase
    .from('biddings')
    .update({
      title: updates.title,
      description: updates.description,
      starting_price: updates.startingPrice,
      current_bid: updates.currentBid,
      location: updates.location,
      coordinates: updates.coordinates,
      area: updates.area,
      images: updates.images,
      end_date: updates.endDate,
      status: updates.status,
      bids: updates.bids,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select();

  if (error) throw error;
  return data[0];
};

export const deleteBidding = async (id) => {
  const { error } = await supabase
    .from('biddings')
    .delete()
    .eq('id', id);

  if (error) throw error;
};

export const placeBid = async (id, bidData) => {
  // First get the current bidding
  const { data: bidding, error: fetchError } = await supabase
    .from('biddings')
    .select('*')
    .eq('id', id)
    .single();

  if (fetchError) throw fetchError;

  const newBids = [...(bidding.bids || []), bidData];
  
  const { data, error } = await supabase
    .from('biddings')
    .update({
      current_bid: bidData.amount,
      bids: newBids,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select();

  if (error) throw error;
  return data[0];
};

// ==================== RENTALS ====================

export const createRental = async (rentalData) => {
  const { data, error } = await supabase
    .from('rentals')
    .insert([{
      title: rentalData.title,
      description: rentalData.description,
      price_per_day: rentalData.pricePerDay,
      category: rentalData.category,
      location: rentalData.location,
      coordinates: rentalData.coordinates || null,
      images: rentalData.images || [],
      available: rentalData.available !== false,
      owner_id: rentalData.ownerId,
      owner_name: rentalData.ownerName,
    }])
    .select();

  if (error) throw error;
  return data[0];
};

export const getRentals = async () => {
  const { data, error } = await supabase
    .from('rentals')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
};

export const updateRental = async (id, updates) => {
  const { data, error } = await supabase
    .from('rentals')
    .update({
      title: updates.title,
      description: updates.description,
      price_per_day: updates.pricePerDay,
      category: updates.category,
      location: updates.location,
      coordinates: updates.coordinates,
      images: updates.images,
      available: updates.available,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select();

  if (error) throw error;
  return data[0];
};

export const deleteRental = async (id) => {
  const { error } = await supabase
    .from('rentals')
    .delete()
    .eq('id', id);

  if (error) throw error;
};

// ==================== SALES (MARKETPLACE) ====================

export const createSale = async (saleData) => {
  const { data, error } = await supabase
    .from('sales')
    .insert([{
      title: saleData.title,
      description: saleData.description,
      price: saleData.price,
      category: saleData.category,
      condition: saleData.condition,
      location: saleData.location,
      coordinates: saleData.coordinates || null,
      images: saleData.images || [],
      available: saleData.available !== false,
      owner_id: saleData.ownerId,
      owner_name: saleData.ownerName,
    }])
    .select();

  if (error) throw error;
  return data[0];
};

export const getSales = async () => {
  const { data, error } = await supabase
    .from('sales')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
};

export const updateSale = async (id, updates) => {
  const { data, error } = await supabase
    .from('sales')
    .update({
      title: updates.title,
      description: updates.description,
      price: updates.price,
      category: updates.category,
      condition: updates.condition,
      location: updates.location,
      coordinates: updates.coordinates,
      images: updates.images,
      available: updates.available,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select();

  if (error) throw error;
  return data[0];
};

export const deleteSale = async (id) => {
  const { error } = await supabase
    .from('sales')
    .delete()
    .eq('id', id);

  if (error) throw error;
};