"use client";
import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import api from "../lib/api";

const ConsultationOfferContext = createContext();

export const useConsultationOffer = () => {
  const context = useContext(ConsultationOfferContext);
  if (!context) {
    return {
      settings: { basePrice: 499, offerPrice: 99, timerDurationMinutes: 5, isOfferActive: false, bannerText: "" },
      effectivePrice: 499,
      basePrice: 499,
      offerPrice: 99,
      timeLeft: 0,
      isExpired: true,
      isOfferActive: false,
      isOfferValid: false,
      bannerDismissed: true,
      dismissBanner: () => {},
      isInitialized: true,
    };
  }
  return context;
};

export const ConsultationOfferProvider = ({ children }) => {
  const [settings, setSettings] = useState({
    basePrice: 499,
    offerPrice: 99,
    timerDurationMinutes: 5,
    isOfferActive: true,
    bannerText: "⚡ Special Offer! Book Root Rx Session for ₹99 (Was ₹499)"
  });

  const [timeLeft, setTimeLeft] = useState(0);
  const [isExpired, setIsExpired] = useState(false);
  const [bannerDismissed, setBannerDismissed] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Fetch admin settings on mount
  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await api.get("/booking/consultation-settings");
      if (res.data.success && res.data.settings) {
        setSettings(res.data.settings);
      }
    } catch (err) {
      console.error("Failed to fetch consultation settings:", err);
    }
  };

  // Initialize persistent LocalStorage timer once settings are ready
  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      const expiredFlag = localStorage.getItem("gut_consultation_offer_expired");
      const dismissedFlag = localStorage.getItem("gut_consultation_banner_dismissed");

      if (dismissedFlag === "true") {
        setBannerDismissed(true);
      }

      if (expiredFlag === "true") {
        setIsExpired(true);
        setTimeLeft(0);
        setIsInitialized(true);
        return;
      }

      let expiration = localStorage.getItem("gut_consultation_offer_expiration");

      if (!expiration && settings.isOfferActive) {
        // First time visitor: Set expiration timestamp
        const durationMs = (settings.timerDurationMinutes || 5) * 60 * 1000;
        const newExpiration = Date.now() + durationMs;
        localStorage.setItem("gut_consultation_offer_expiration", newExpiration.toString());
        expiration = newExpiration.toString();
      }

      if (expiration) {
        const expirationTime = parseInt(expiration, 10);
        const remainingSec = Math.max(0, Math.floor((expirationTime - Date.now()) / 1000));

        if (remainingSec <= 0) {
          setIsExpired(true);
          setTimeLeft(0);
          localStorage.setItem("gut_consultation_offer_expired", "true");
        } else {
          setTimeLeft(remainingSec);
          setIsExpired(false);
        }
      }
    } catch (e) {
      console.error("LocalStorage access error:", e);
    } finally {
      setIsInitialized(true);
    }
  }, [settings]);

  // Live Countdown Interval
  useEffect(() => {
    if (!settings.isOfferActive || isExpired || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setIsExpired(true);
          try {
            localStorage.setItem("gut_consultation_offer_expired", "true");
          } catch (e) {}
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [settings.isOfferActive, isExpired, timeLeft]);

  // Dismiss Top Banner (retains floating corner badge)
  const dismissBanner = useCallback(() => {
    setBannerDismissed(true);
    try {
      localStorage.setItem("gut_consultation_banner_dismissed", "true");
    } catch (e) {}
  }, []);

  // Compute effective price dynamically
  const isOfferValid = settings.isOfferActive && !isExpired && timeLeft > 0;
  const effectivePrice = isOfferValid ? settings.offerPrice : settings.basePrice;

  return (
    <ConsultationOfferContext.Provider
      value={{
        settings,
        effectivePrice,
        basePrice: settings.basePrice,
        offerPrice: settings.offerPrice,
        timeLeft,
        isExpired,
        isOfferActive: settings.isOfferActive,
        isOfferValid,
        bannerDismissed,
        dismissBanner,
        isInitialized,
      }}
    >
      {children}
    </ConsultationOfferContext.Provider>
  );
};
