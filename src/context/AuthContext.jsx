// src/context/AuthContext.jsx
import React, { createContext, useContext, useEffect, useState } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  updateProfile,
} from "firebase/auth";
import { auth, db } from "../firebase";
import { doc, setDoc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Sync auth + Firestore user
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const userRef = doc(db, "users", firebaseUser.uid);
        const snap = await getDoc(userRef);

        if (snap.exists()) {
          setUser({ uid: firebaseUser.uid, ...snap.data() });
        } else {
          await setDoc(userRef, {
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            name: firebaseUser.displayName || "",
            phone: "",
            location: "",
            role: "user",
            createdAt: serverTimestamp(),
          });
          const newSnap = await getDoc(userRef);
          setUser({ uid: firebaseUser.uid, ...newSnap.data() });
        }
      } else {
        setUser(null);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Signup
  const signup = async (email, password, name, phone, location) => {
    try {
      const res = await createUserWithEmailAndPassword(auth, email, password);

      await updateProfile(res.user, { displayName: name });

      await setDoc(doc(db, "users", res.user.uid), {
        uid: res.user.uid,
        email: res.user.email,
        name: name || "",
        phone: phone || "",
        location: location || "",
        role: "user",
        createdAt: serverTimestamp(),
      });

      setUser({
        uid: res.user.uid,
        email: res.user.email,
        name: name || "",
        phone: phone || "",
        location: location || "",
        role: "user",
      });

      return { success: true };
    } catch (error) {
      let message = "Signup failed";
      if (error.code === "auth/email-already-in-use") message = "This email is already registered.";
      else if (error.code === "auth/invalid-email") message = "Invalid email address.";
      else if (error.code === "auth/weak-password") message = "Password should be at least 6 characters.";
      return { success: false, error: message };
    }
  };

  // Login
  const login = async (email, password) => {
    try {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      const snap = await getDoc(doc(db, "users", cred.user.uid));
      if (snap.exists()) {
        setUser({ uid: cred.user.uid, ...snap.data() });
      } else {
        setUser({
          uid: cred.user.uid,
          email: cred.user.email,
          name: cred.user.displayName || "",
        });
      }
      return { success: true };
    } catch (error) {
      let message = "Login failed";
      if (error.code === "auth/user-not-found") message = "This email is not registered.";
      else if (error.code === "auth/wrong-password") message = "Incorrect password.";
      else if (error.code === "auth/invalid-email") message = "Invalid email format.";
      return { success: false, error: message };
    }
  };

  // Update profile
  const updateUserProfile = async (updates) => {
    if (!user?.uid) return { success: false, error: "No user logged in" };
    try {
      const userRef = doc(db, "users", user.uid);

      // Update Firestore
      await updateDoc(userRef, {
        ...updates,
        updatedAt: serverTimestamp(),
      });

      // Update Firebase Auth if name changed
      if (updates.name) {
        await updateProfile(auth.currentUser, { displayName: updates.name });
      }

      // Reload Firestore user to sync local state
      const snap = await getDoc(userRef);
      if (snap.exists()) {
        setUser({ uid: user.uid, ...snap.data() });
      }

      return { success: true };
    } catch (error) {
      console.error("Error updating profile:", error);
      return { success: false, error: "Failed to update profile" };
    }
  };

  // Logout
  const logout = async () => {
    await signOut(auth);
    setUser(null);
  };

  // Reset Password
  const resetPassword = async (email) => {
    try {
      await sendPasswordResetEmail(auth, email);
      return { success: true };
    } catch (error) {
      let message = "Password reset failed";
      if (error.code === "auth/user-not-found") message = "This email is not registered.";
      else if (error.code === "auth/invalid-email") message = "Invalid email format.";
      return { success: false, error: message };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        signup,
        login,
        logout,
        resetPassword,
        updateUserProfile,
      }}
    >
      {!isLoading && children}
    </AuthContext.Provider>
  );
};
