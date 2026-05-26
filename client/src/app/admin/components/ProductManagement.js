"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaPlus, FaEdit, FaTrash, FaSave, FaTimes, FaImage,
  FaStar, FaBoxes, FaUpload, FaChevronDown, FaChevronUp
} from "react-icons/fa";
import { ProductApi } from "../../lib/ProductApi";

// Empty product template
const emptyProduct = {
  _id: null,
  name: "",
  description: "",
  shortDescription: "",
  productType: "consultation",
  rating: 4.5,
  reviewCount: 0,
  originalPrice: 0,
  salePrice: 0,
  taxNote: "Tax included. Shipping calculated at checkout.",
  benefits: [],
  whatToExpect: [],
  features: [],
  faqs: [],
  imageUrls: [],
  isActive: true,
  consultationDuration: "30 mins",
  expertName: "",
  stock: 0,
  weight: 0.5,
};

// Helper to create an empty bulk product row
const emptyBulkProduct = () => ({
  name: "",
  shortDescription: "",
  description: "",
  productType: "consultation",
  originalPrice: 0,
  salePrice: 0,
  taxNote: "Tax included. Shipping calculated at checkout.",
  rating: 4.5,
  reviewCount: 0,
  benefits: [],
  whatToExpect: [],
  faqs: [],
  images: [],
  isActive: true,
  consultationDuration: "30 mins",
  expertName: "",
  stock: 0,
  weight: 0.5,
  durationOptions: [],
  packOptions: [],
});

export default function ProductManagement({ searchTerm }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productForm, setProductForm] = useState({ ...emptyProduct });
  const [tempImageFiles, setTempImageFiles] = useState([]);
  const [bulkProducts, setBulkProducts] = useState([emptyBulkProduct()]);
  const [durationOptions, setDurationOptions] = useState([]);
  const [packOptions, setPackOptions] = useState([]);
  // Fetch products
  useEffect(() => {
    fetchProducts();
  }, [searchTerm]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await ProductApi.getProducts({ search: searchTerm });
      setProducts(res.products || []);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setProductForm({ ...emptyProduct });
    setTempImageFiles([]);
    setDurationOptions([]);
setPackOptions([]);
  };

  const openAddModal = () => {
    resetForm();
    setShowAddModal(true);
  };

  const openEditModal = (product) => {
    setEditingProduct(product);
    setProductForm({
      ...emptyProduct,
      ...product,
      benefits: product.benefits || [],
      whatToExpect: product.whatToExpect || [],
      features: product.features || [],
      faqs: product.faqs || [],
      
    });
    setTempImageFiles([]);
    setShowEditModal(true);
    setDurationOptions(product.durationOptions || []);
setPackOptions(product.packOptions || []);
  };

  // Helper functions for arrays (same as before)
  const addBenefit = () => {
    setProductForm({ ...productForm, benefits: [...productForm.benefits, ""] });
  };
  const updateBenefit = (idx, val) => {
    const newBenefits = [...productForm.benefits];
    newBenefits[idx] = val;
    setProductForm({ ...productForm, benefits: newBenefits });
  };
  const removeBenefit = (idx) => {
    setProductForm({ ...productForm, benefits: productForm.benefits.filter((_, i) => i !== idx) });
  };

  const addWhatToExpect = () => {
    setProductForm({ ...productForm, whatToExpect: [...productForm.whatToExpect, { title: "", description: "" }] });
  };
  const updateWhatToExpect = (idx, field, val) => {
    const newList = [...productForm.whatToExpect];
    newList[idx][field] = val;
    setProductForm({ ...productForm, whatToExpect: newList });
  };
  const removeWhatToExpect = (idx) => {
    setProductForm({ ...productForm, whatToExpect: productForm.whatToExpect.filter((_, i) => i !== idx) });
  };

  const addFaq = () => {
    setProductForm({ ...productForm, faqs: [...productForm.faqs, { question: "", answer: "" }] });
  };
  const updateFaq = (idx, field, val) => {
    const newFaqs = [...productForm.faqs];
    newFaqs[idx][field] = val;
    setProductForm({ ...productForm, faqs: newFaqs });
  };
  const removeFaq = (idx) => {
    setProductForm({ ...productForm, faqs: productForm.faqs.filter((_, i) => i !== idx) });
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    setTempImageFiles([...tempImageFiles, ...files]);
  };

  const removeTempImage = (idx) => {
    setTempImageFiles(tempImageFiles.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData();
      const productData = { ...productForm, durationOptions, packOptions };
      if (!productData._id) delete productData._id;
      formData.append("product", JSON.stringify(productData));
      tempImageFiles.forEach((file) => formData.append("images", file));

      if (productData._id) {
        await ProductApi.updateProduct(productData._id, formData);
      } else {
        await ProductApi.createProduct(formData);
      }
      await fetchProducts();
      setShowAddModal(false);
      setShowEditModal(false);
      resetForm();
    } catch (error) {
      console.error("Save error:", error);
      alert("Failed to save product");
    } finally {
      setLoading(false);
    }
  };

  const deleteProduct = async (id) => {
    if (!confirm("Delete this product?")) return;
    try {
      await ProductApi.deleteProduct(id);
      await fetchProducts();
    } catch (error) {
      alert("Delete failed");
    }
  };

  // ============== BULK UPLOAD FUNCTIONS ==============
  const addBulkProductRow = () => {
    setBulkProducts([...bulkProducts, emptyBulkProduct()]);
  };

  const removeBulkProductRow = (index) => {
    if (bulkProducts.length === 1) return;
    setBulkProducts(bulkProducts.filter((_, i) => i !== index));
  };

  const updateBulkProduct = (index, field, value) => {
    const updated = [...bulkProducts];
    updated[index][field] = value;
    setBulkProducts(updated);
  };

  const handleBulkImageUpload = (index, e) => {
    const files = Array.from(e.target.files);
    const updated = [...bulkProducts];
    updated[index].images = [...(updated[index].images || []), ...files];
    setBulkProducts(updated);
  };

  const removeBulkImage = (productIdx, imgIdx) => {
    const updated = [...bulkProducts];
    updated[productIdx].images = updated[productIdx].images.filter((_, i) => i !== imgIdx);
    setBulkProducts(updated);
  };

  const handleBulkBenefitAdd = (idx) => {
    const updated = [...bulkProducts];
    updated[idx].benefits = [...(updated[idx].benefits || []), ""];
    setBulkProducts(updated);
  };
  const updateBulkBenefit = (pIdx, bIdx, val) => {
    const updated = [...bulkProducts];
    updated[pIdx].benefits[bIdx] = val;
    setBulkProducts(updated);
  };
  const removeBulkBenefit = (pIdx, bIdx) => {
    const updated = [...bulkProducts];
    updated[pIdx].benefits = updated[pIdx].benefits.filter((_, i) => i !== bIdx);
    setBulkProducts(updated);
  };

  const handleBulkWhatToExpectAdd = (idx) => {
    const updated = [...bulkProducts];
    updated[idx].whatToExpect = [...(updated[idx].whatToExpect || []), { title: "", description: "" }];
    setBulkProducts(updated);
  };
  const updateBulkWhatToExpect = (pIdx, wIdx, field, val) => {
    const updated = [...bulkProducts];
    updated[pIdx].whatToExpect[wIdx][field] = val;
    setBulkProducts(updated);
  };
  const removeBulkWhatToExpect = (pIdx, wIdx) => {
    const updated = [...bulkProducts];
    updated[pIdx].whatToExpect = updated[pIdx].whatToExpect.filter((_, i) => i !== wIdx);
    setBulkProducts(updated);
  };

  const handleBulkFaqAdd = (idx) => {
    const updated = [...bulkProducts];
    updated[idx].faqs = [...(updated[idx].faqs || []), { question: "", answer: "" }];
    setBulkProducts(updated);
  };
  const updateBulkFaq = (pIdx, fIdx, field, val) => {
    const updated = [...bulkProducts];
    updated[pIdx].faqs[fIdx][field] = val;
    setBulkProducts(updated);
  };
  const removeBulkFaq = (pIdx, fIdx) => {
    const updated = [...bulkProducts];
    updated[pIdx].faqs = updated[pIdx].faqs.filter((_, i) => i !== fIdx);
    setBulkProducts(updated);
  };

  const handleBulkSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData();
      const productsData = bulkProducts.map((p) => ({
        name: p.name,
        shortDescription: p.shortDescription,
        description: p.description,
        productType: p.productType,
        originalPrice: Number(p.originalPrice),
        salePrice: Number(p.salePrice),
        taxNote: p.taxNote,
        rating: Number(p.rating),
        reviewCount: Number(p.reviewCount),
        benefits: p.benefits,
        whatToExpect: p.whatToExpect,
        faqs: p.faqs,
        isActive: p.isActive,
        consultationDuration: p.consultationDuration,
        expertName: p.expertName,
        stock: p.productType === "program" ? Number(p.stock) : 0,
        weight: p.productType === "program" ? Number(p.weight) : 0.5,
        imageFilesCount: p.images?.length || 0,
        durationOptions: p.durationOptions || [],
        packOptions: p.packOptions || [],
      }));
      formData.append("products", JSON.stringify(productsData));
      bulkProducts.forEach((p) => {
        if (p.images && p.images.length) {
          p.images.forEach((file) => formData.append("images", file));
        }
      });
      await ProductApi.bulkAddProducts(formData);
      alert(`${bulkProducts.length} product(s) added successfully!`);
      setBulkProducts([emptyBulkProduct()]);
      setShowBulkModal(false);
      fetchProducts();
    } catch (error) {
      console.error("Bulk upload error:", error);
      alert("Failed to upload products: " + error.message);
    } finally {
      setLoading(false);
    }
  };
const addDurationOption = () => {
  setDurationOptions([...durationOptions, { duration: '', originalPrice: '', salePrice: '', discountPercent: 0 }]);
};
const updateDurationOption = (idx, field, val) => {
  const updated = [...durationOptions];
  updated[idx][field] = val;
  if (field === 'originalPrice' || field === 'salePrice') {
    const original = field === 'originalPrice' ? Number(val) : updated[idx].originalPrice;
    const sale = field === 'salePrice' ? Number(val) : updated[idx].salePrice;
    if (original && sale) {
      updated[idx].discountPercent = Math.round(((original - sale) / original) * 100);
    }
  }
  setDurationOptions(updated);
};
const removeDurationOption = (idx) => {
  setDurationOptions(durationOptions.filter((_, i) => i !== idx));
};

const addPackOption = () => {
  setPackOptions([...packOptions, { pack: '', price: 0 }]);
};
const updatePackOption = (idx, field, val) => {
  const updated = [...packOptions];
  updated[idx][field] = field === 'price' ? parseFloat(val) : val;
  setPackOptions(updated);
};
const removePackOption = (idx) => {
  setPackOptions(packOptions.filter((_, i) => i !== idx));
};

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-[#1A4D3E]">Product Management</h1>
          <p className="text-sm text-[#8A9B6E]">Manage consultations & program kits</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowBulkModal(true)}
            className="bg-gradient-to-r from-[#2A7F8F] to-[#18606D] text-white px-5 py-2 rounded-xl flex items-center gap-2 hover:shadow-lg transition"
          >
            <FaUpload /> Bulk Upload
          </button>
          <button
            onClick={openAddModal}
            className="bg-gradient-to-r from-[#18606D] to-[#2A7F8F] text-white px-5 py-2 rounded-xl flex items-center gap-2 hover:shadow-lg transition"
          >
            <FaPlus /> Add Product
          </button>
        </div>
      </div>

      {/* Products Table (unchanged) */}
      <div className="bg-white rounded-2xl shadow-md border border-[#D9EEF2] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#F4FAFB] border-b border-[#D9EEF2]">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-[#1A4D3E]">Product</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-[#1A4D3E]">Type</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-[#1A4D3E]">Price</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-[#1A4D3E]">Rating</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-[#1A4D3E]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8F4F7]">
              {products.map((product) => (
                <tr key={product._id} className="hover:bg-[#F4FAFB] transition">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#E8F4F7] flex items-center justify-center overflow-hidden">
                        {product.imageUrls?.[0] ? (
                          <img src={`${process.env.NEXT_PUBLIC_IMAGE_URL}${product.imageUrls[0]}`} alt={product.name} className="w-full h-full object-cover" />
                        ) : (
                          <FaImage className="text-[#18606D]" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-[#1A4D3E]">{product.name}</p>
                        <p className="text-xs text-[#64748B] line-clamp-1">{product.shortDescription}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      product.productType === "consultation" 
                        ? "bg-blue-100 text-blue-700" 
                        : "bg-green-100 text-green-700"
                    }`}>
                      {product.productType === "consultation" ? "Consultation" : "Program / Kit"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-semibold text-[#1A4D3E]">₹{product.salePrice}</p>
                    <p className="text-xs text-[#8A9B6E] line-through">₹{product.originalPrice}</p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1">
                      <FaStar className="text-amber-400 text-sm" />
                      <span className="text-sm font-medium">{product.rating}</span>
                      <span className="text-xs text-[#64748B]">({product.reviewCount})</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button onClick={() => openEditModal(product)} className="p-2 text-[#18606D] hover:bg-[#E8F4F7] rounded-lg">
                        <FaEdit />
                      </button>
                      <button onClick={() => deleteProduct(product._id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg">
                        <FaTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {products.length === 0 && !loading && (
          <div className="text-center py-12">
            <FaBoxes className="text-4xl text-[#8A9B6E] mx-auto mb-3" />
            <p className="text-[#1A4D3E]">No products found</p>
            <button onClick={openAddModal} className="mt-3 text-[#18606D] underline">Add your first product</button>
          </div>
        )}
      </div>

     
         {/* Add/Edit Modal (simplified form) */}
      <AnimatePresence>
        {(showAddModal || showEditModal) && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto"
            >
              <div className="sticky top-0 bg-white p-5 border-b border-[#D9EEF2] flex justify-between items-center">
                <h2 className="text-xl font-bold text-[#1A4D3E]">
                  {showAddModal ? "Add New Product" : "Edit Product"}
                </h2>
                <button onClick={() => {
                  setShowAddModal(false);
                  setShowEditModal(false);
                  resetForm();
                }} className="p-2 hover:bg-[#F4FAFB] rounded-lg">
                  <FaTimes />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                {/* Basic Info */}
                <div className="grid md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-semibold text-[#1A4D3E] mb-1">Product Name *</label>
                    <input type="text" required value={productForm.name} onChange={e => setProductForm({...productForm, name: e.target.value})}
                      className="w-full px-4 py-2 bg-[#F4FAFB] border border-[#D9EEF2] rounded-xl focus:ring-2 focus:ring-[#18606D]" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-[#1A4D3E] mb-1">Product Type *</label>
                    <select value={productForm.productType} onChange={e => setProductForm({...productForm, productType: e.target.value})}
                      className="w-full px-4 py-2 bg-[#F4FAFB] border border-[#D9EEF2] rounded-xl">
                      <option value="consultation">Consultation</option>
                      <option value="program">Program / Kit</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-[#1A4D3E] mb-1">Original Price (₹)</label>
                    <input type="number" step="0.01" value={productForm.originalPrice} onChange={e => setProductForm({...productForm, originalPrice: parseFloat(e.target.value)})}
                      className="w-full px-4 py-2 bg-[#F4FAFB] border border-[#D9EEF2] rounded-xl" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-[#1A4D3E] mb-1">Sale Price (₹) *</label>
                    <input type="number" step="0.01" required value={productForm.salePrice} onChange={e => setProductForm({...productForm, salePrice: parseFloat(e.target.value)})}
                      className="w-full px-4 py-2 bg-[#F4FAFB] border border-[#D9EEF2] rounded-xl" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-[#1A4D3E] mb-1">Rating (0-5)</label>
                    <input type="number" step="0.1" min="0" max="5" value={productForm.rating} onChange={e => setProductForm({...productForm, rating: parseFloat(e.target.value)})}
                      className="w-full px-4 py-2 bg-[#F4FAFB] border border-[#D9EEF2] rounded-xl" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-[#1A4D3E] mb-1">Review Count</label>
                    <input type="number" value={productForm.reviewCount} onChange={e => setProductForm({...productForm, reviewCount: parseInt(e.target.value)})}
                      className="w-full px-4 py-2 bg-[#F4FAFB] border border-[#D9EEF2] rounded-xl" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[#1A4D3E] mb-1">Short Description</label>
                  <textarea rows={2} value={productForm.shortDescription} onChange={e => setProductForm({...productForm, shortDescription: e.target.value})}
                    className="w-full px-4 py-2 bg-[#F4FAFB] border border-[#D9EEF2] rounded-xl" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#1A4D3E] mb-1">Full Description</label>
                  <textarea rows={4} value={productForm.description} onChange={e => setProductForm({...productForm, description: e.target.value})}
                    className="w-full px-4 py-2 bg-[#F4FAFB] border border-[#D9EEF2] rounded-xl" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#1A4D3E] mb-1">Tax Note</label>
                  <input type="text" value={productForm.taxNote} onChange={e => setProductForm({...productForm, taxNote: e.target.value})}
                    className="w-full px-4 py-2 bg-[#F4FAFB] border border-[#D9EEF2] rounded-xl" />
                </div>

                {/* Consultation specific */}
                {productForm.productType === "consultation" && (
                  <div className="grid md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-semibold text-[#1A4D3E] mb-1">Duration (e.g., 30 mins)</label>
                      <input type="text" value={productForm.consultationDuration} onChange={e => setProductForm({...productForm, consultationDuration: e.target.value})}
                        className="w-full px-4 py-2 bg-[#F4FAFB] border border-[#D9EEF2] rounded-xl" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-[#1A4D3E] mb-1">Expert Name</label>
                      <input type="text" value={productForm.expertName} onChange={e => setProductForm({...productForm, expertName: e.target.value})}
                        className="w-full px-4 py-2 bg-[#F4FAFB] border border-[#D9EEF2] rounded-xl" />
                    </div>
                  </div>
                )}

                {/* Program specific */}
                {productForm.productType === "program" && (
                  <div className="grid md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-semibold text-[#1A4D3E] mb-1">Stock</label>
                      <input type="number" value={productForm.stock} onChange={e => setProductForm({...productForm, stock: parseInt(e.target.value)})}
                        className="w-full px-4 py-2 bg-[#F4FAFB] border border-[#D9EEF2] rounded-xl" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-[#1A4D3E] mb-1">Weight (kg)</label>
                      <input type="number" step="0.01" value={productForm.weight} onChange={e => setProductForm({...productForm, weight: parseFloat(e.target.value)})}
                        className="w-full px-4 py-2 bg-[#F4FAFB] border border-[#D9EEF2] rounded-xl" />
                    </div>
                  </div>
                )}
              {productForm.productType === "program" && (
  <>
    {/* Duration Options */}
    <div>
      <div className="flex justify-between items-center mb-2">
        <label className="text-sm font-semibold text-[#1A4D3E]">Duration Options (e.g., 1 Month, 3 Months)</label>
        <button type="button" onClick={addDurationOption} className="text-xs text-[#18606D] flex items-center gap-1">
          <FaPlus size={10} /> Add Duration
        </button>
      </div>
      {durationOptions.map((opt, idx) => (
        <div key={idx} className="border border-[#D9EEF2] rounded-xl p-3 mb-3 bg-[#F4FAFB]">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-2">
            <div>
              <label className="block text-xs mb-1">Duration</label>
              <input type="text" value={opt.duration} onChange={e => updateDurationOption(idx, 'duration', e.target.value)} placeholder="e.g., 1 Month" className="w-full px-2 py-1 bg-white border rounded-lg text-sm" />
            </div>
            <div>
              <label className="block text-xs mb-1">Original Price (₹)</label>
              <input type="number" step="0.01" value={opt.originalPrice} onChange={e => updateDurationOption(idx, 'originalPrice', parseFloat(e.target.value))} className="w-full px-2 py-1 bg-white border rounded-lg text-sm" />
            </div>
            <div>
              <label className="block text-xs mb-1">Sale Price (₹)</label>
              <input type="number" step="0.01" value={opt.salePrice} onChange={e => updateDurationOption(idx, 'salePrice', parseFloat(e.target.value))} className="w-full px-2 py-1 bg-white border rounded-lg text-sm" />
            </div>
            <div className="flex justify-between items-end">
              <div>
                <label className="block text-xs mb-1">Discount %</label>
                <input type="text" value={opt.discountPercent} disabled className="w-full px-2 py-1 bg-gray-100 border rounded-lg text-sm" />
              </div>
              <button type="button" onClick={() => removeDurationOption(idx)} className="text-red-500 p-1"><FaTrash size={14} /></button>
            </div>
          </div>
        </div>
      ))}
    </div>

    {/* Pack Options */}
    <div>
      <div className="flex justify-between items-center mb-2">
        <label className="text-sm font-semibold text-[#1A4D3E]">Pack Options (e.g., Single, Pack of 2)</label>
        <button type="button" onClick={addPackOption} className="text-xs text-[#18606D] flex items-center gap-1">
          <FaPlus size={10} /> Add Pack
        </button>
      </div>
      {packOptions.map((opt, idx) => (
        <div key={idx} className="border border-[#D9EEF2] rounded-xl p-3 mb-3 bg-[#F4FAFB]">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-2">
            <div>
              <label className="block text-xs mb-1">Pack Name</label>
              <input type="text" value={opt.name} onChange={e => updatePackOption(idx, 'name', e.target.value)} placeholder="e.g., Family Pack" className="w-full px-2 py-1 bg-white border rounded-lg text-sm" />
            </div>
            <div>
              <label className="block text-xs mb-1">Original Price (₹)</label>
              <input type="number" step="0.01" value={opt.originalPrice} onChange={e => updatePackOption(idx, 'originalPrice', parseFloat(e.target.value))} className="w-full px-2 py-1 bg-white border rounded-lg text-sm" />
            </div>
            <div>
              <label className="block text-xs mb-1">Sale Price (₹)</label>
              <input type="number" step="0.01" value={opt.salePrice} onChange={e => updatePackOption(idx, 'salePrice', parseFloat(e.target.value))} className="w-full px-2 py-1 bg-white border rounded-lg text-sm" />
            </div>
            <div className="flex justify-between items-end">
              <div>
                <label className="block text-xs mb-1">Discount %</label>
                <input type="text" value={opt.discountPercent} disabled className="w-full px-2 py-1 bg-gray-100 border rounded-lg text-sm" />
              </div>
              <button type="button" onClick={() => removePackOption(idx)} className="text-red-500 p-1"><FaTrash size={14} /></button>
            </div>
          </div>
        </div>
      ))}
    </div>
  </>
)}
                {/* Benefits */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-sm font-semibold text-[#1A4D3E]">Benefits (list)</label>
                    <button type="button" onClick={addBenefit} className="text-xs text-[#18606D] flex items-center gap-1"><FaPlus size={10} /> Add</button>
                  </div>
                  {productForm.benefits.map((benefit, idx) => (
                    <div key={idx} className="flex gap-2 mb-2">
                      <input type="text" value={benefit} onChange={e => updateBenefit(idx, e.target.value)} className="flex-1 px-3 py-2 bg-[#F4FAFB] border border-[#D9EEF2] rounded-lg text-sm" />
                      <button type="button" onClick={() => removeBenefit(idx)} className="text-red-500"><FaTrash size={14} /></button>
                    </div>
                  ))}
                </div>

                {/* What to Expect */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-sm font-semibold text-[#1A4D3E]">What to Expect</label>
                    <button type="button" onClick={addWhatToExpect} className="text-xs text-[#18606D]"><FaPlus size={10} /> Add item</button>
                  </div>
                  {productForm.whatToExpect.map((item, idx) => (
                    <div key={idx} className="border border-[#D9EEF2] rounded-xl p-3 mb-3 bg-[#F4FAFB]">
                      <div className="flex justify-between mb-2">
                        <input type="text" placeholder="Title" value={item.title} onChange={e => updateWhatToExpect(idx, "title", e.target.value)}
                          className="flex-1 px-3 py-1 bg-white border rounded-lg text-sm" />
                        <button type="button" onClick={() => removeWhatToExpect(idx)} className="ml-2 text-red-500"><FaTrash size={12} /></button>
                      </div>
                      <textarea placeholder="Description" rows={2} value={item.description} onChange={e => updateWhatToExpect(idx, "description", e.target.value)}
                        className="w-full px-3 py-2 bg-white border rounded-lg text-sm" />
                    </div>
                  ))}
                </div>

                {/* FAQs */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-sm font-semibold text-[#1A4D3E]">FAQs</label>
                    <button type="button" onClick={addFaq} className="text-xs text-[#18606D]"><FaPlus size={10} /> Add FAQ</button>
                  </div>
                  {productForm.faqs.map((faq, idx) => (
                    <div key={idx} className="border border-[#D9EEF2] rounded-xl p-3 mb-3">
                      <div className="flex justify-between mb-2">
                        <input type="text" placeholder="Question" value={faq.question} onChange={e => updateFaq(idx, "question", e.target.value)}
                          className="flex-1 px-3 py-1 bg-[#F4FAFB] border rounded-lg text-sm" />
                        <button type="button" onClick={() => removeFaq(idx)} className="ml-2 text-red-500"><FaTrash size={12} /></button>
                      </div>
                      <textarea placeholder="Answer" rows={2} value={faq.answer} onChange={e => updateFaq(idx, "answer", e.target.value)}
                        className="w-full px-3 py-2 bg-[#F4FAFB] border rounded-lg text-sm" />
                    </div>
                  ))}
                </div>

                {/* Images */}
                <div>
                  <label className="block text-sm font-semibold text-[#1A4D3E] mb-2">Product Images</label>
                  <div className="border-2 border-dashed border-[#D9EEF2] rounded-xl p-4 text-center bg-[#F4FAFB]">
                    <input type="file" multiple accept="image/*" onChange={handleImageUpload} className="hidden" id="productImages" />
                    <label htmlFor="productImages" className="cursor-pointer flex flex-col items-center">
                      <FaImage className="text-2xl text-[#18606D] mb-1" />
                      <span className="text-sm text-[#18606D]">Click to upload images</span>
                    </label>
                  </div>
                  {tempImageFiles.length > 0 && (
                    <div className="flex gap-2 mt-3 flex-wrap">
                      {tempImageFiles.map((file, idx) => (
                        <div key={idx} className="relative w-16 h-16 rounded-lg overflow-hidden border">
                          <img src={URL.createObjectURL(file)} className="w-full h-full object-cover" />
                          <button type="button" onClick={() => removeTempImage(idx)} className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-0.5 text-xs">&times;</button>
                        </div>
                      ))}
                    </div>
                  )}
                  {productForm.imageUrls?.length > 0 && !tempImageFiles.length && (
                    <div className="text-xs text-[#64748B] mt-2">{productForm.imageUrls.length} existing image(s)</div>
                  )}
                </div>

                <div className="flex gap-4 pt-4 border-t">
                  <button type="button" onClick={() => { setShowAddModal(false); setShowEditModal(false); resetForm(); }} className="flex-1 py-2 border border-[#D9EEF2] rounded-xl">Cancel</button>
                  <button type="submit" disabled={loading} className="flex-1 bg-gradient-to-r from-[#18606D] to-[#2A7F8F] text-white py-2 rounded-xl font-semibold disabled:opacity-50">
                    {loading ? "Saving..." : (showAddModal ? "Create Product" : "Update Product")}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
       

      {/* BULK UPLOAD MODAL */}
      <AnimatePresence>
        {showBulkModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl w-full max-w-5xl max-h-[90vh] overflow-y-auto"
            >
              <div className="sticky top-0 bg-white p-5 border-b border-[#D9EEF2] flex justify-between items-center">
                <h2 className="text-xl font-bold text-[#1A4D3E]">Bulk Upload Products</h2>
                <button onClick={() => { setShowBulkModal(false); setBulkProducts([emptyBulkProduct()]); }} className="p-2 hover:bg-[#F4FAFB] rounded-lg">
                  <FaTimes />
                </button>
              </div>
              <form onSubmit={handleBulkSubmit} className="p-6 space-y-6">
                <div className="space-y-6 max-h-96 overflow-y-auto pr-2">
                  {bulkProducts.map((product, idx) => (
                    <div key={idx} className="bg-[#F4FAFB] rounded-xl p-4 border border-[#D9EEF2]">
                      <div className="flex justify-between items-center mb-3">
                        <h3 className="font-bold text-[#1A4D3E]">Product {idx + 1}</h3>
                        {bulkProducts.length > 1 && (
                          <button type="button" onClick={() => removeBulkProductRow(idx)} className="text-red-500">
                            <FaTrash />
                          </button>
                        )}
                      </div>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-semibold">Name *</label>
                          <input type="text" required value={product.name} onChange={e => updateBulkProduct(idx, 'name', e.target.value)} className="w-full px-3 py-2 bg-white border rounded-lg" />
                        </div>
                        <div>
                          <label className="text-sm font-semibold">Product Type *</label>
                          <select value={product.productType} onChange={e => updateBulkProduct(idx, 'productType', e.target.value)} className="w-full px-3 py-2 bg-white border rounded-lg">
                            <option value="consultation">Consultation</option>
                            <option value="program">Program / Kit</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-sm font-semibold">Original Price (₹)</label>
                          <input type="number" step="0.01" value={product.originalPrice} onChange={e => updateBulkProduct(idx, 'originalPrice', parseFloat(e.target.value))} className="w-full px-3 py-2 bg-white border rounded-lg" />
                        </div>
                        <div>
                          <label className="text-sm font-semibold">Sale Price (₹) *</label>
                          <input type="number" step="0.01" required value={product.salePrice} onChange={e => updateBulkProduct(idx, 'salePrice', parseFloat(e.target.value))} className="w-full px-3 py-2 bg-white border rounded-lg" />
                        </div>
                        <div>
                          <label className="text-sm font-semibold">Rating</label>
                          <input type="number" step="0.1" min="0" max="5" value={product.rating} onChange={e => updateBulkProduct(idx, 'rating', parseFloat(e.target.value))} className="w-full px-3 py-2 bg-white border rounded-lg" />
                        </div>
                        <div>
                          <label className="text-sm font-semibold">Review Count</label>
                          <input type="number" value={product.reviewCount} onChange={e => updateBulkProduct(idx, 'reviewCount', parseInt(e.target.value))} className="w-full px-3 py-2 bg-white border rounded-lg" />
                        </div>
                        {product.productType === "consultation" && (
                          <>
                            <div>
                              <label className="text-sm font-semibold">Duration</label>
                              <input type="text" value={product.consultationDuration} onChange={e => updateBulkProduct(idx, 'consultationDuration', e.target.value)} className="w-full px-3 py-2 bg-white border rounded-lg" />
                            </div>
                            <div>
                              <label className="text-sm font-semibold">Expert Name</label>
                              <input type="text" value={product.expertName} onChange={e => updateBulkProduct(idx, 'expertName', e.target.value)} className="w-full px-3 py-2 bg-white border rounded-lg" />
                            </div>
                          </>
                        )}
                        {product.productType === "program" && (
                          <>
                            <div>
                              <label className="text-sm font-semibold">Stock</label>
                              <input type="number" value={product.stock} onChange={e => updateBulkProduct(idx, 'stock', parseInt(e.target.value))} className="w-full px-3 py-2 bg-white border rounded-lg" />
                            </div>
                            <div>
                              <label className="text-sm font-semibold">Weight (kg)</label>
                              <input type="number" step="0.01" value={product.weight} onChange={e => updateBulkProduct(idx, 'weight', parseFloat(e.target.value))} className="w-full px-3 py-2 bg-white border rounded-lg" />
                            </div>
                          </>
                        )}
                        <div className="md:col-span-2">
                          <label className="text-sm font-semibold">Short Description</label>
                          <textarea rows={1} value={product.shortDescription} onChange={e => updateBulkProduct(idx, 'shortDescription', e.target.value)} className="w-full px-3 py-2 bg-white border rounded-lg" />
                        </div>
                        <div className="md:col-span-2">
                          <label className="text-sm font-semibold">Full Description</label>
                          <textarea rows={2} value={product.description} onChange={e => updateBulkProduct(idx, 'description', e.target.value)} className="w-full px-3 py-2 bg-white border rounded-lg" />
                        </div>
                        <div className="md:col-span-2">
                          <label className="text-sm font-semibold">Tax Note</label>
                          <input type="text" value={product.taxNote} onChange={e => updateBulkProduct(idx, 'taxNote', e.target.value)} className="w-full px-3 py-2 bg-white border rounded-lg" />
                        </div>
                        {/* Benefits */}
                        <div className="md:col-span-2">
                          <div className="flex justify-between items-center">
                            <label className="text-sm font-semibold">Benefits</label>
                            <button type="button" onClick={() => handleBulkBenefitAdd(idx)} className="text-xs text-[#18606D]">+ Add</button>
                          </div>
                          {(product.benefits || []).map((benefit, bIdx) => (
                            <div key={bIdx} className="flex gap-2 mt-1">
                              <input type="text" value={benefit} onChange={e => updateBulkBenefit(idx, bIdx, e.target.value)} className="flex-1 px-2 py-1 bg-white border rounded text-sm" />
                              <button type="button" onClick={() => removeBulkBenefit(idx, bIdx)} className="text-red-500"><FaTrash size={12} /></button>
                            </div>
                          ))}
                        </div>
                        {/* What to Expect */}
                        <div className="md:col-span-2">
                          <div className="flex justify-between items-center">
                            <label className="text-sm font-semibold">What to Expect</label>
                            <button type="button" onClick={() => handleBulkWhatToExpectAdd(idx)} className="text-xs text-[#18606D]">+ Add</button>
                          </div>
                          {(product.whatToExpect || []).map((item, wIdx) => (
                            <div key={wIdx} className="border rounded p-2 mt-2 bg-white">
                              <input type="text" placeholder="Title" value={item.title} onChange={e => updateBulkWhatToExpect(idx, wIdx, 'title', e.target.value)} className="w-full mb-1 px-2 py-1 border rounded text-sm" />
                              <textarea placeholder="Description" rows={1} value={item.description} onChange={e => updateBulkWhatToExpect(idx, wIdx, 'description', e.target.value)} className="w-full px-2 py-1 border rounded text-sm" />
                              <button type="button" onClick={() => removeBulkWhatToExpect(idx, wIdx)} className="text-red-500 text-xs mt-1">Remove</button>
                            </div>
                          ))}
                        </div>
                        {/* FAQs */}
                        <div className="md:col-span-2">
                          <div className="flex justify-between items-center">
                            <label className="text-sm font-semibold">FAQs</label>
                            <button type="button" onClick={() => handleBulkFaqAdd(idx)} className="text-xs text-[#18606D]">+ Add</button>
                          </div>
                          {(product.faqs || []).map((faq, fIdx) => (
                            <div key={fIdx} className="border rounded p-2 mt-2 bg-white">
                              <input type="text" placeholder="Question" value={faq.question} onChange={e => updateBulkFaq(idx, fIdx, 'question', e.target.value)} className="w-full mb-1 px-2 py-1 border rounded text-sm" />
                              <textarea placeholder="Answer" rows={1} value={faq.answer} onChange={e => updateBulkFaq(idx, fIdx, 'answer', e.target.value)} className="w-full px-2 py-1 border rounded text-sm" />
                              <button type="button" onClick={() => removeBulkFaq(idx, fIdx)} className="text-red-500 text-xs mt-1">Remove</button>
                            </div>
                          ))}
                        </div>
                        {/* Images */}
                        <div className="md:col-span-2">
                          <label className="text-sm font-semibold">Images</label>
                          <div className="border-2 border-dashed rounded p-2 text-center bg-white">
                            <input type="file" multiple accept="image/*" onChange={(e) => handleBulkImageUpload(idx, e)} className="hidden" id={`bulk-img-${idx}`} />
                            <label htmlFor={`bulk-img-${idx}`} className="cursor-pointer text-sm text-[#18606D]">Click to upload</label>
                          </div>
                          {product.images?.length > 0 && (
                            <div className="flex gap-2 mt-2 flex-wrap">
                              {product.images.map((file, imgIdx) => (
                                <div key={imgIdx} className="relative w-12 h-12 rounded border overflow-hidden">
                                  <img src={URL.createObjectURL(file)} className="w-full h-full object-cover" />
                                  <button type="button" onClick={() => removeBulkImage(idx, imgIdx)} className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full text-xs w-4 h-4 flex items-center justify-center">×</button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <button type="button" onClick={addBulkProductRow} className="w-full border-2 border-dashed border-[#D9EEF2] py-3 rounded-xl text-[#18606D] hover:bg-[#F4FAFB] flex items-center justify-center gap-2">
                  <FaPlus /> Add Another Product
                </button>
                <div className="flex gap-4 pt-4 border-t">
                  <button type="button" onClick={() => { setShowBulkModal(false); setBulkProducts([emptyBulkProduct()]); }} className="flex-1 py-2 border border-[#D9EEF2] rounded-xl">Cancel</button>
                  <button type="submit" disabled={loading} className="flex-1 bg-gradient-to-r from-[#18606D] to-[#2A7F8F] text-white py-2 rounded-xl font-semibold disabled:opacity-50">
                    {loading ? "Uploading..." : `Upload ${bulkProducts.length} Product${bulkProducts.length > 1 ? 's' : ''}`}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}