import api from "./api";

export const heroApi = {
  // Get active slides for public home page
  getPublicSlides: async () => {
    const res = await api.get("/hero-slides");
    return res.data;
  },

  // Get all slides for admin (including inactive)
  getAllAdminSlides: async () => {
    const res = await api.get("/hero-slides/admin/all");
    return res.data;
  },

  // Create new slide
  createSlide: async (formData) => {
    const res = await api.post("/hero-slides", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return res.data;
  },

  // Update slide
  updateSlide: async (id, formData) => {
    const res = await api.put(`/hero-slides/${id}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return res.data;
  },

  // Toggle active status
  toggleSlideStatus: async (id) => {
    const res = await api.patch(`/hero-slides/${id}/toggle`);
    return res.data;
  },

  // Delete slide
  deleteSlide: async (id) => {
    const res = await api.delete(`/hero-slides/${id}`);
    return res.data;
  },
};
