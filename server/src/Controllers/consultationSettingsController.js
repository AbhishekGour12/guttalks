import ConsultationSettings from '../Models/ConsultationSettings.js';

// Get consultation offer & pricing settings (Public / Admin)
export const getConsultationSettings = async (req, res) => {
  try {
    let settings = await ConsultationSettings.findOne();
    if (!settings) {
      settings = await ConsultationSettings.create({
        basePrice: 499,
        offerPrice: 99,
        timerDurationMinutes: 5,
        isOfferActive: true,
        bannerText: "⚡ Special Offer! Book Root Rx Session for ₹99 (Was ₹499)"
      });
    }
    res.json({ success: true, settings });
  } catch (error) {
    console.error("Get consultation settings error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update consultation offer & pricing settings (Admin only)
export const updateConsultationSettings = async (req, res) => {
  try {
    const { basePrice, offerPrice, timerDurationMinutes, isOfferActive, bannerText } = req.body;
    
    let settings = await ConsultationSettings.findOne();
    if (!settings) {
      settings = new ConsultationSettings({});
    }

    if (basePrice !== undefined) settings.basePrice = Number(basePrice);
    if (offerPrice !== undefined) settings.offerPrice = Number(offerPrice);
    if (timerDurationMinutes !== undefined) settings.timerDurationMinutes = Number(timerDurationMinutes);
    if (isOfferActive !== undefined) settings.isOfferActive = Boolean(isOfferActive);
    if (bannerText !== undefined) settings.bannerText = bannerText;

    await settings.save();

    res.json({ success: true, message: "Consultation settings updated successfully", settings });
  } catch (error) {
    console.error("Update consultation settings error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
