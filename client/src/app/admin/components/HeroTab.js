"use client";
import React, { useState, useEffect } from "react";
import { 
  FaPlus, 
  FaPencilAlt, 
  FaTrashAlt, 
  FaEye, 
  FaEyeSlash, 
  FaImages, 
  FaTag, 
  FaSortAmountDown, 
  FaTimes, 
  FaUpload, 
  FaCheck, 
  FaSpinner 
} from "react-icons/fa";
import toast from "react-hot-toast";
import { heroApi } from "../../lib/heroApi";
import { getImageUrl } from "../../lib/api";
import Image from "next/image";

export default function HeroTab() {
  const [slides, setSlides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSlide, setEditingSlide] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleteModalId, setDeleteModalId] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    badge: "",
    image: "",
    originalPrice: 399,
    offerPrice: 99,
    ctaText: "Book Consultation for",
    order: 1,
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");

  const fetchSlides = async () => {
    try {
      setLoading(true);
      const res = await heroApi.getAllAdminSlides();
      if (res.success) {
        setSlides(res.slides || []);
      }
    } catch (err) {
      toast.error("Failed to load hero slides");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSlides();
  }, []);

  const handleOpenAddModal = () => {
    setEditingSlide(null);
    setFormData({
      title: "",
      description: "",
      badge: "",
      image: "",
      originalPrice: 399,
      offerPrice: 99,
      ctaText: "Book Consultation for",
      order: (slides.length || 0) + 1,
    });
    setImageFile(null);
    setImagePreview("");
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (slide) => {
    setEditingSlide(slide);
    setFormData({
      title: slide.title || "",
      description: slide.description || "",
      badge: slide.badge || "",
      image: slide.image || "",
      originalPrice: slide.originalPrice ?? 399,
      offerPrice: slide.offerPrice ?? 99,
      ctaText: slide.ctaText || "Book Consultation for",
      order: slide.order ?? 1,
    });
    setImageFile(null);
    setImagePreview(slide.image ? getImageUrl(slide.image) : "");
    setIsModalOpen(true);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      toast.error("Title is required");
      return;
    }
    if (!editingSlide && !imageFile && !formData.image) {
      toast.error("Slide image is required");
      return;
    }

    try {
      setSubmitting(true);
      const data = new FormData();
      data.append("title", formData.title);
      data.append("description", formData.description);
      data.append("badge", formData.badge);
      data.append("originalPrice", formData.originalPrice);
      data.append("offerPrice", formData.offerPrice);
      data.append("ctaText", formData.ctaText);
      data.append("order", formData.order);

      if (imageFile) {
        data.append("image", imageFile);
      } else if (formData.image) {
        data.append("image", formData.image);
      }

      if (editingSlide) {
        await heroApi.updateSlide(editingSlide._id, data);
        toast.success("Hero slide updated successfully!");
      } else {
        await heroApi.createSlide(data);
        toast.success("Hero slide created successfully!");
      }

      setIsModalOpen(false);
      fetchSlides();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save slide");
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      const res = await heroApi.toggleSlideStatus(id);
      if (res.success) {
        toast.success(res.message);
        setSlides(prev => prev.map(s => s._id === id ? { ...s, isActive: !s.isActive } : s));
      }
    } catch (err) {
      toast.error("Failed to toggle status");
    }
  };

  const handleDelete = async (id) => {
    try {
      const res = await heroApi.deleteSlide(id);
      if (res.success) {
        toast.success("Hero slide deleted successfully!");
        setDeleteModalId(null);
        fetchSlides();
      }
    } catch (err) {
      toast.error("Failed to delete slide");
    }
  };

  const activeCount = slides.filter(s => s.isActive).length;

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#D9EEF2] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1A4D3E] flex items-center gap-2">
            <FaImages className="text-[#18606D]" /> Hero Carousel Management
          </h1>
          <p className="text-sm text-[#64748B] mt-1">
            Manage banner images, titles, offer badges, and descriptions for the homepage hero carousel.
          </p>
        </div>
        <button
          onClick={handleOpenAddModal}
          className="bg-gradient-to-r from-[#18606D] to-[#2A7F8F] hover:opacity-90 text-white font-semibold px-5 py-2.5 rounded-xl shadow-md transition-all flex items-center gap-2 text-sm"
        >
          <FaPlus /> Add New Slide
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-[#D9EEF2] shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#E8F4F7] text-[#18606D] flex items-center justify-center text-xl font-bold">
            {slides.length}
          </div>
          <div>
            <p className="text-xs text-[#64748B] font-medium">Total Slides</p>
            <p className="text-lg font-bold text-[#1A4D3E]">{slides.length} Slides Created</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-[#D9EEF2] shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-green-50 text-green-600 flex items-center justify-center text-xl font-bold">
            {activeCount}
          </div>
          <div>
            <p className="text-xs text-[#64748B] font-medium">Active Slides</p>
            <p className="text-lg font-bold text-green-700">{activeCount} Visible on Site</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-[#D9EEF2] shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gray-100 text-gray-500 flex items-center justify-center text-xl font-bold">
            {slides.length - activeCount}
          </div>
          <div>
            <p className="text-xs text-[#64748B] font-medium">Disabled Slides</p>
            <p className="text-lg font-bold text-gray-600">{slides.length - activeCount} Hidden</p>
          </div>
        </div>
      </div>

      {/* Slide Cards Grid */}
      {loading ? (
        <div className="bg-white p-12 rounded-2xl border border-[#D9EEF2] text-center">
          <FaSpinner className="animate-spin text-3xl text-[#18606D] mx-auto mb-3" />
          <p className="text-[#64748B] text-sm">Loading carousel slides...</p>
        </div>
      ) : slides.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border border-[#D9EEF2] text-center">
          <FaImages className="text-5xl text-gray-300 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-[#1A4D3E]">No Carousel Slides Found</h3>
          <p className="text-sm text-[#64748B] mt-1 mb-4">Click below to add your first homepage slide.</p>
          <button
            onClick={handleOpenAddModal}
            className="bg-[#18606D] text-white px-5 py-2 rounded-xl text-sm font-medium"
          >
            + Add Slide
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {slides.map((slide) => (
            <div
              key={slide._id}
              className={`bg-white rounded-2xl border transition-all duration-300 shadow-sm hover:shadow-md overflow-hidden flex flex-col ${
                slide.isActive ? "border-[#D9EEF2]" : "border-gray-200 opacity-75 bg-gray-50"
              }`}
            >
              {/* Image Header with Badges */}
              <div className="relative h-48 w-full bg-gray-100 border-b border-[#D9EEF2]">
                <img
                  src={getImageUrl(slide.image)}
                  alt={slide.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src = "/herocraousel_1.png";
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />
                
                {/* Top Badges */}
                <div className="absolute top-3 left-3 flex items-center gap-2">
                  <span className="bg-black/60 backdrop-blur-sm text-white px-2.5 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                    <FaSortAmountDown className="text-[10px]" /> Order #{slide.order}
                  </span>
                  {slide.badge && (
                    <span className="bg-[#18606D] text-white px-2.5 py-1 rounded-full text-xs font-semibold">
                      {slide.badge}
                    </span>
                  )}
                </div>

                {/* Status Toggle Badge */}
                <button
                  onClick={() => handleToggleStatus(slide._id)}
                  className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-md transition ${
                    slide.isActive
                      ? "bg-green-500 text-white hover:bg-green-600"
                      : "bg-gray-600 text-white hover:bg-gray-700"
                  }`}
                >
                  {slide.isActive ? <FaEye size={12} /> : <FaEyeSlash size={12} />}
                  {slide.isActive ? "Active" : "Disabled"}
                </button>

                {/* Offer Price Floating Overlay */}
                <div className="absolute bottom-3 right-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white px-2.5 py-1 rounded-lg shadow text-xs font-bold flex items-center gap-1">
                  <FaTag className="text-[10px]" />
                  <span className="line-through opacity-75 text-[10px]">₹{slide.originalPrice}</span>
                  <span>₹{slide.offerPrice}</span>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <h3 className="font-bold text-lg text-[#1A4D3E] line-clamp-1">{slide.title}</h3>
                  <p className="text-xs text-[#64748B] mt-1.5 line-clamp-2 leading-relaxed">
                    {slide.description || "No description provided."}
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="pt-3 border-t border-[#D9EEF2] flex items-center justify-between gap-2">
                  <button
                    onClick={() => handleToggleStatus(slide._id)}
                    className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition flex items-center gap-1.5 ${
                      slide.isActive
                        ? "border-amber-200 text-amber-700 hover:bg-amber-50"
                        : "border-green-200 text-green-700 hover:bg-green-50"
                    }`}
                  >
                    {slide.isActive ? <FaEyeSlash /> : <FaEye />}
                    {slide.isActive ? "Disable" : "Enable"}
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleOpenEditModal(slide)}
                      className="p-2 text-[#18606D] hover:bg-[#E8F4F7] rounded-lg border border-[#D9EEF2] transition"
                      title="Edit Slide"
                    >
                      <FaPencilAlt size={14} />
                    </button>
                    <button
                      onClick={() => setDeleteModalId(slide._id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg border border-red-200 transition"
                      title="Delete Slide"
                    >
                      <FaTrashAlt size={14} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Slide Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-[#D9EEF2] relative my-8">
            <div className="flex justify-between items-center pb-4 border-b border-[#D9EEF2]">
              <h2 className="text-xl font-bold text-[#1A4D3E]">
                {editingSlide ? "Edit Carousel Slide" : "Add New Carousel Slide"}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg"
              >
                <FaTimes size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              {/* Slide Title */}
              <div>
                <label className="block text-xs font-semibold text-[#1A4D3E] mb-1">
                  Headline Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Understand Your Inner World"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-sm border border-[#D9EEF2] rounded-xl focus:ring-2 focus:ring-[#18606D] outline-none"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-[#1A4D3E] mb-1">Description</label>
                <textarea
                  rows={2}
                  placeholder="e.g. GutMap Complete™ — advanced at-home microbiome testing..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3.5 py-2 py-2 text-sm border border-[#D9EEF2] rounded-xl focus:ring-2 focus:ring-[#18606D] outline-none"
                />
              </div>

              {/* Badge & Order Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#1A4D3E] mb-1">Badge Text</label>
                  <input
                    type="text"
                    placeholder="e.g. GutMap Complete"
                    value={formData.badge}
                    onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-sm border border-[#D9EEF2] rounded-xl focus:ring-2 focus:ring-[#18606D] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#1A4D3E] mb-1">Display Order</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.order}
                    onChange={(e) => setFormData({ ...formData, order: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-sm border border-[#D9EEF2] rounded-xl focus:ring-2 focus:ring-[#18606D] outline-none"
                  />
                </div>
              </div>

              {/* Offer Pricing Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#1A4D3E] mb-1">Original Price (₹)</label>
                  <input
                    type="number"
                    value={formData.originalPrice}
                    onChange={(e) => setFormData({ ...formData, originalPrice: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-sm border border-[#D9EEF2] rounded-xl focus:ring-2 focus:ring-[#18606D] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#1A4D3E] mb-1">Offer Price (₹)</label>
                  <input
                    type="number"
                    value={formData.offerPrice}
                    onChange={(e) => setFormData({ ...formData, offerPrice: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-sm border border-[#D9EEF2] rounded-xl focus:ring-2 focus:ring-[#18606D] outline-none"
                  />
                </div>
              </div>

              {/* Image Upload Box */}
              <div>
                <label className="block text-xs font-semibold text-[#1A4D3E] mb-1">
                  Banner Image {!editingSlide && <span className="text-red-500">*</span>}
                </label>
                
                {imagePreview && (
                  <div className="relative h-40 w-full mb-3 rounded-xl overflow-hidden border border-[#D9EEF2] bg-gray-50">
                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                    <div className="absolute top-2 right-2 bg-black/70 text-white text-[10px] px-2 py-0.5 rounded">
                      Preview
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-3">
                  <label className="flex-1 cursor-pointer bg-[#F4FAFB] border-2 border-dashed border-[#D9EEF2] hover:border-[#18606D] rounded-xl p-4 text-center transition">
                    <FaUpload className="text-[#18606D] text-lg mx-auto mb-1" />
                    <span className="text-xs font-semibold text-[#1A4D3E]">
                      {imageFile ? imageFile.name : "Click to upload banner image"}
                    </span>
                    <p className="text-[10px] text-[#64748B] mt-0.5">PNG, JPG, WEBP recommended</p>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </label>
                </div>

                {/* Fallback image path input */}
                <div className="mt-2">
                  <input
                    type="text"
                    placeholder="Or paste public image path (e.g. /herocraousel_1.png)"
                    value={formData.image}
                    onChange={(e) => {
                      setFormData({ ...formData, image: e.target.value });
                      if (!imageFile) setImagePreview(e.target.value ? getImageUrl(e.target.value) : "");
                    }}
                    className="w-full px-3 py-1.5 text-xs border border-[#D9EEF2] rounded-lg outline-none text-[#64748B]"
                  />
                </div>
              </div>

              {/* Modal Actions */}
              <div className="pt-4 border-t border-[#D9EEF2] flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-gradient-to-r from-[#18606D] to-[#2A7F8F] text-white px-6 py-2 rounded-xl text-xs font-bold shadow-md hover:opacity-90 transition flex items-center gap-2 disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <FaSpinner className="animate-spin" /> Saving...
                    </>
                  ) : (
                    <>
                      <FaCheck /> {editingSlide ? "Update Slide" : "Create Slide"}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModalId && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-red-100 text-center">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-3">
              <FaTrashAlt size={20} />
            </div>
            <h3 className="text-lg font-bold text-gray-900">Delete Slide?</h3>
            <p className="text-xs text-gray-500 mt-1 mb-6">
              Are you sure you want to delete this hero section slide? This action cannot be undone.
            </p>
            <div className="flex justify-center gap-3">
              <button
                onClick={() => setDeleteModalId(null)}
                className="px-4 py-2 border border-gray-300 rounded-xl text-xs font-semibold text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteModalId)}
                className="px-5 py-2 bg-red-600 text-white rounded-xl text-xs font-bold hover:bg-red-700 shadow-md"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
