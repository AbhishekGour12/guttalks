// OrdersTab.jsx (fully updated – no Shiprocket)
"use client";
import { motion } from "framer-motion";
import { FaEye, FaFileExcel, FaTimesCircle } from "react-icons/fa";
import { useEffect, useState, useMemo } from "react";
import * as XLSX from "xlsx";
import axios from "axios";
import toast from "react-hot-toast";

const OrdersTab = ({ orders: initialOrders = [], searchTerm = "" }) => {
  const [orders, setOrders] = useState(initialOrders);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateRange, setDateRange] = useState({ from: "", to: "" });
  const [page, setPage] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedStatusOrder, setSelectedStatusOrder] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [trackingIdInput, setTrackingIdInput] = useState('');

  const LIMIT = 10;

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API}/api/admin/orders`);
      if (res?.data?.orders) setOrders(res.data.orders);
    } catch (err) {
      console.error("Error fetching orders:", err);
      toast.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    setPage(1);
  }, [searchTerm, statusFilter, dateRange.from, dateRange.to]);

  const filteredOrders = useMemo(() => {
    const s = searchTerm.toLowerCase().trim();
    return orders.filter((order) => {
      const user = order.userId || {};
      const created = new Date(order.createdAt);
      const matchesSearch =
        !s ||
        (user.username || user.name || "").toLowerCase().includes(s) ||
        (user.email || "").toLowerCase().includes(s) ||
        (user.phone || "").toLowerCase().includes(s) ||
        (order._id || "").toLowerCase().includes(s);
      const matchesStatus = statusFilter === "all" || (order.customStatus === statusFilter);
      let matchesDate = true;
      if (dateRange.from) {
        const from = new Date(dateRange.from);
        matchesDate = matchesDate && created >= from;
      }
      if (dateRange.to) {
        const to = new Date(dateRange.to);
        to.setHours(23, 59, 59, 999);
        matchesDate = matchesDate && created <= to;
      }
      return matchesSearch && matchesStatus && matchesDate;
    });
  }, [orders, searchTerm, statusFilter, dateRange]);

  const handleExport = () => {
    if (!filteredOrders.length) {
      alert("No orders to export!");
      return;
    }
    const dataToExport = filteredOrders.map((order) => {
      const user = order.userId || {};
      const itemsString = Array.isArray(order.items)
        ? order.items.map(i => {
            const prodName = i.name || i.productId?.name || 'Item';
            const variantStr = i.variant?.name ? ` (${i.variant.name})` : '';
            return `${prodName}${variantStr} (x${i.quantity})`;
          }).join(", ")
        : "No Items";
      return {
        "Order ID": order._id,
        "Date": new Date(order.createdAt).toLocaleDateString(),
        "Time": new Date(order.createdAt).toLocaleTimeString(),
        "Customer Name": user.username || user.name || "Unknown",
        "Customer Email": user.email || address.email || "",
        "Customer Phone": user.phone || address.phone || "",
        "Shipping Address": `${address.addressLine1 || ""} ${address.addressLine2 || ""}, ${address.city || ""} ${address.state || ""} - ${address.pincode || ""}`.trim(),
        "Items Summary": itemsString,
        "Total Items": Array.isArray(order.items) ? order.items.reduce((acc, curr) => acc + (curr.quantity || 0), 0) : 0,
        "Total Amount (INR)": order.totalAmount || 0,
        "Payment Method": order.paymentMethod,
        "Payment Status": order.paymentStatus,
        "Order Status": getStatusLabel(order.customStatus || 'order_placed'),
        "Tracking ID": order.trackingId || "N/A"
      };
    });
    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Orders");
    XLSX.writeFile(workbook, `Orders_Export_${new Date().toISOString().slice(0,10)}.xlsx`);
  };

  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / LIMIT));
  const currentPage = Math.min(page, totalPages);
  const startIndex = (currentPage - 1) * LIMIT;
  const paginatedOrders = filteredOrders.slice(startIndex, startIndex + LIMIT);

  const handleChangePage = (nextPage) => {
    if (nextPage < 1 || nextPage > totalPages) return;
    setPage(nextPage);
  };

  const getItemsSummary = (order) => {
    const items = Array.isArray(order.items) ? order.items : [];
    if (!items.length) return "No items";
    const first = items[0];
    const name = first?.name || first?.productId?.name || first?.productName || "Item";
    const variantStr = first?.variant?.name ? ` (${first.variant.name})` : '';
    if (items.length === 1) return `${name}${variantStr} (x${first.quantity || 1})`;
    return `${name}${variantStr} (x${first.quantity || 1}) + ${items.length - 1} more`;
  };

  const totalItemCount = (order) => {
    const items = Array.isArray(order.items) ? order.items : [];
    return items.reduce((sum, i) => sum + (i.quantity || 0), 0);
  };

  // Status options
  const statusOptions = [
    { value: 'order_placed', label: 'Order Placed', color: 'bg-gray-100 text-gray-700' },
    { value: 'kit_dispatched', label: 'Kit Dispatched', color: 'bg-blue-100 text-blue-700' },
    { value: 'kit_delivered', label: 'Kit Delivered', color: 'bg-indigo-100 text-indigo-700' },
    { value: 'pickup_requested', label: 'Pickup Requested', color: 'bg-purple-100 text-purple-700' },
    { value: 'pickup_initiated', label: 'Pickup Initiated', color: 'bg-cyan-100 text-cyan-700' },
    { value: 'sample_picked_up', label: 'Sample Picked Up', color: 'bg-teal-100 text-teal-700' },
    { value: 'sample_received', label: 'Sample Received', color: 'bg-emerald-100 text-emerald-700' },
    { value: 'qc_passed', label: 'QC Passed', color: 'bg-green-100 text-green-700' },
    { value: 'completed', label: 'Completed', color: 'bg-green-200 text-green-800' },
    { value: 'cancelled', label: 'Cancelled', color: 'bg-red-100 text-red-700' },
  ];

  const updateOrderStatus = async (orderId, customStatus, trackingId = null) => {
    setUpdatingStatus(orderId);
    try {
      await axios.put(`${process.env.NEXT_PUBLIC_API}/api/admin/${orderId}/status`, {
        customStatus
      });
      toast.success('Order status updated');
      fetchOrders();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to update status');
    } finally {
      setUpdatingStatus(null);
    }
  };

  const getStatusLabel = (statusValue) => {
    const option = statusOptions.find(opt => opt.value === statusValue);
    return option ? option.label : statusValue;
  };

  const getStatusColorClass = (statusValue) => {
    const option = statusOptions.find(opt => opt.value === statusValue);
    return option ? option.color : 'bg-gray-100 text-gray-700';
  };

  return (
    <div className="space-y-6">
      {/* Header + Filters */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl lg:text-3xl font-bold text-[#1A4D3E]">Order Management</h2>
          <p className="text-[#64748B] text-sm lg:text-base">Manage all customer orders</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-3 lg:items-center">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-[#D9EEF2] text-sm text-[#1A4D3E] bg-white focus:outline-none focus:ring-2 focus:ring-[#18606D]"
          >
            <option value="all">All Status</option>
            {statusOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>

          <div className="flex gap-2">
            <input
              type="date"
              value={dateRange.from}
              onChange={(e) => setDateRange((prev) => ({ ...prev, from: e.target.value }))}
              className="px-3 py-2 rounded-xl border border-[#D9EEF2] text-sm text-[#1A4D3E] bg-white focus:outline-none focus:ring-2 focus:ring-[#18606D]"
            />
            <input
              type="date"
              value={dateRange.to}
              onChange={(e) => setDateRange((prev) => ({ ...prev, to: e.target.value }))}
              className="px-3 py-2 rounded-xl border border-[#D9EEF2] text-sm text-[#1A4D3E] bg-white focus:outline-none focus:ring-2 focus:ring-[#18606D]"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[#64748B] bg-[#F4FAFB] px-4 py-1 rounded-full text-sm hidden xl:inline-block">
              {filteredOrders.length} orders
            </span>

            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#18606D] hover:bg-[#2A7F8F] text-white text-sm transition-colors"
              title="Download Excel"
            >
              <FaFileExcel className="text-base" />
              <span className="hidden md:inline">Export</span>
            </button>

            <button
              onClick={fetchOrders}
              disabled={loading}
              className="px-3 py-2 rounded-xl bg-[#18606D] text-white text-sm disabled:opacity-50 hover:bg-[#2A7F8F] transition"
            >
              {loading ? "..." : "Refresh"}
            </button>
          </div>
        </div>
      </div>

      {/* Desktop Table */}
      <div className="hidden sm:block bg-white border border-[#D9EEF2] rounded-2xl shadow-sm overflow-hidden">
        <div className="max-h-[calc(100vh-260px)] overflow-y-auto">
          <table className="w-full text-sm min-w-[900px]">
            <thead className="bg-[#F4FAFB] sticky top-0 z-10">
              <tr className="text-[#1A4D3E] border-b border-[#D9EEF2]">
                <th className="px-4 py-3 text-left">Order</th>
                <th className="px-4 py-3 text-left">Customer</th>
                <th className="px-4 py-3 text-left">Date</th>
                <th className="px-4 py-3 text-left">Items</th>
                <th className="px-4 py-3 text-left">Amount</th>
                <th className="px-4 py-3 text-left">Payment</th>
                <th className="px-4 py-3 text-left">Order Status</th>
                <th className="px-4 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedOrders.map((order) => {
                const user = order.userId || {};
                return (
                  <motion.tr
                    key={order._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="border-t border-[#E8F4F7] hover:bg-[#F4FAFB] transition"
                  >
                    <td className="px-4 py-3 font-semibold text-[#1A4D3E]">
                      #{order._id.slice(-6)}
                      <div className="text-xs text-[#64748B]">
                        ID: {order._id}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium">{user.username || user.name || order.shippingAddress?.fullName || "Unknown User"}</p>
                      <p className="text-xs text-[#64748B] line-clamp-1">{user.email || order.shippingAddress?.email || "—"}</p>
                      <p className="text-xs text-[#64748B]">{user.phone || order.shippingAddress?.phone || ""}</p>
                    </td>
                    <td className="px-4 py-3 text-[#64748B]">
                      {new Date(order.createdAt).toLocaleDateString()}
                      <div className="text-xs">{new Date(order.createdAt).toLocaleTimeString()}</div>
                    </td>
                    <td className="px-4 py-3 text-xs text-[#1A4D3E]">
                      <div>{getItemsSummary(order)}</div>
                      <div className="text-[11px] text-[#64748B]">{totalItemCount(order)} item(s)</div>
                    </td>
                    <td className="px-4 py-3 text-[#18606D] font-bold">
                      ₹{order.totalAmount?.toFixed(2)}
                      <div className="text-[11px] text-[#64748B]">
                        Subtotal: ₹{order.subtotal?.toFixed(2)} + GST: ₹{order.gstAmount?.toFixed(2)}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs">
                      <div className="font-semibold text-[#1A4D3E]">
                        {order.paymentMethod === "online" ? "Prepaid" : "COD"}
                      </div>
                      <div className={`mt-1 inline-block px-2 py-1 rounded-full ${
                        order.paymentStatus === "Paid"
                          ? "bg-green-100 text-green-700"
                          : order.paymentStatus === "Failed"
                          ? "bg-red-100 text-red-700"
                          : "bg-amber-100 text-amber-700"
                      }`}>
                        {order.paymentStatus || "Pending"}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${getStatusColorClass(order.customStatus || 'order_placed')}`}>
                          {getStatusLabel(order.customStatus || 'order_placed')}
                        </span>
                        <button
                          onClick={() => {
                            setSelectedStatusOrder(order);
                            setNewStatus(order.customStatus || 'order_placed');
                            setTrackingIdInput(order.orderId || '');
                            setShowStatusModal(true);
                          }}
                          className="text-xs text-[#18606D] hover:underline"
                        >
                          Update
                        </button>
                      </div>
                      {order.orderId && (
                        <p className="text-xs text-[#64748B] mt-1">Tracking: {order.orderId}</p>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <ActionIcon icon={<FaEye />} tooltip="View details" onClick={() => setSelectedOrder(order)} />
                      </div>
                    </td>
                  </motion.tr>
                );
              })}
              {!paginatedOrders.length && (
                <tr>
                  <td colSpan="8" className="text-center text-sm text-[#64748B] py-6">No orders found for selected filters.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex justify-between items-center gap-3 px-4 py-3 bg-[#F4FAFB] border-t border-[#D9EEF2] text-sm">
          <div className="text-[#64748B]">
            Showing <span className="font-semibold">{filteredOrders.length ? startIndex + 1 : 0}-{Math.min(startIndex + LIMIT, filteredOrders.length)}</span> of <span className="font-semibold">{filteredOrders.length}</span> orders
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => handleChangePage(currentPage - 1)} disabled={currentPage === 1} className="px-3 py-1 rounded-lg bg-[#18606D] text-white disabled:opacity-40 hover:bg-[#2A7F8F] transition">Prev</button>
            {[...Array(totalPages)].map((_, i) => (
              <button key={i} onClick={() => handleChangePage(i + 1)} className={`px-2.5 py-1 rounded-lg border text-xs ${currentPage === i + 1 ? "bg-[#18606D] text-white border-[#18606D]" : "text-[#1A4D3E] border-[#D9EEF2] hover:bg-[#F4FAFB]"}`}>
                {i + 1}
              </button>
            ))}
            <button onClick={() => handleChangePage(currentPage + 1)} disabled={currentPage === totalPages} className="px-3 py-1 rounded-lg bg-[#18606D] text-white disabled:opacity-40 hover:bg-[#2A7F8F] transition">Next</button>
          </div>
        </div>
      </div>

      {/* Mobile Cards */}
      <div className="grid sm:hidden gap-4">
        {paginatedOrders.map((order) => {
          const user = order.userId || {};
          return (
            <motion.div key={order._id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="bg-white p-4 rounded-2xl shadow border border-[#D9EEF2]">
              <div className="flex justify-between">
                <h3 className="font-semibold text-[#1A4D3E] text-sm">#{order._id.slice(-6)}</h3>
                <span className="text-xs font-semibold text-[#18606D]">₹{order.totalAmount?.toFixed(2)}</span>
              </div>
              <p className="text-sm text-[#64748B] mt-1">{user.username || user.name || order.shippingAddress?.fullName || "Unknown User"}</p>
              <div className="flex justify-between mt-2 text-xs text-[#64748B]">
                <span>{totalItemCount(order)} item(s)</span>
                <span>{new Date(order.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="mt-2">
                <p className="text-xs text-[#64748B]">Order Status:</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${getStatusColorClass(order.customStatus || 'order_placed')}`}>
                    {getStatusLabel(order.customStatus || 'order_placed')}
                  </span>
                  <button
                    onClick={() => {
                      setSelectedStatusOrder(order);
                      setNewStatus(order.customStatus || 'order_placed');
                      setTrackingIdInput(order.orderId || '');
                      setShowStatusModal(true);
                    }}
                    className="text-xs text-[#18606D]"
                  >
                    Update
                  </button>
                </div>
                {order.trackingId && <p className="text-xs text-[#64748B] mt-1">Tracking: {order.orderId}</p>}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Status Update Modal */}
      {showStatusModal && selectedStatusOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-2xl w-full max-w-md p-6"
          >
            <h3 className="text-xl font-bold text-[#1A4D3E] mb-4">Update Order Status</h3>
            <p className="text-sm text-[#64748B] mb-4">Order #{selectedStatusOrder._id.slice(-6)}</p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Status</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-[#D9EEF2] rounded-xl focus:ring-2 focus:ring-[#18606D]"
                >
                  {statusOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Tracking ID (optional)</label>
                <input
                  type="text"
                  value={trackingIdInput}
                  onChange={(e) => setTrackingIdInput(e.target.value)}
                  placeholder="Enter courier tracking number"
                  className="w-full px-3 py-2 border border-[#D9EEF2] rounded-xl focus:ring-2 focus:ring-[#18606D]"
                />
              </div>
              
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowStatusModal(false)}
                  className="flex-1 py-2 border border-[#D9EEF2] rounded-xl"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    updateOrderStatus(selectedStatusOrder._id, newStatus, trackingIdInput);
                    setShowStatusModal(false);
                  }}
                  disabled={updatingStatus === selectedStatusOrder._id}
                  className="flex-1 bg-[#18606D] text-white py-2 rounded-xl disabled:opacity-50"
                >
                  {updatingStatus === selectedStatusOrder._id ? 'Updating...' : 'Update'}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Order Details Modal */}
      {selectedOrder && <OrderDetailsModal order={selectedOrder} onClose={() => setSelectedOrder(null)} />}
    </div>
  );
};

const ActionIcon = ({ icon, onClick, tooltip }) => (
  <motion.button
    whileHover={{ scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    onClick={onClick}
    title={tooltip}
    className="p-2 rounded-lg bg-[#F4FAFB] text-[#18606D] hover:bg-[#18606D] hover:text-white transition"
  >
    {icon}
  </motion.button>
);

const OrderDetailsModal = ({ order, onClose }) => {
  const user = order.userId || {};
  const items = order.items || [];

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.94 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-xl border border-[#D9EEF2]"
      >
        <div className="flex justify-between items-center px-6 py-4 border-b border-[#D9EEF2]">
          <div>
            <h3 className="text-xl font-bold text-[#1A4D3E]">Order #{order._id.slice(-6)}</h3>
            <p className="text-xs text-[#64748B] mt-1">Placed on {new Date(order.createdAt).toLocaleString()}</p>
          </div>
          <button onClick={onClose} className="text-sm px-3 py-1 rounded-xl bg-[#F4FAFB] text-[#1A4D3E] hover:bg-[#E8F4F7] transition">Close</button>
        </div>

        <div className="px-6 py-4 space-y-6">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-[#F4FAFB] rounded-2xl p-4">
              <h4 className="font-semibold text-[#1A4D3E] mb-2">Customer</h4>
              <p className="text-sm text-[#1A4D3E]">{user.username || user.name || order.shippingAddress?.fullName || "Unknown User"}</p>
              <p className="text-xs text-[#64748B]">{user.email || order.shippingAddress?.email || "—"}</p>
              <p className="text-xs text-[#64748B]">{user.phone || order.shippingAddress?.phone || "—"}</p>
            </div>
            <div className="bg-[#F4FAFB] rounded-2xl p-4">
              <h4 className="font-semibold text-[#1A4D3E] mb-2">Shipping Address</h4>
              <p className="text-sm text-[#1A4D3E]">{order.shippingAddress?.fullName}</p>
              <p className="text-xs text-[#1A4D3E]">{order.shippingAddress?.addressLine1}</p>
              {order.shippingAddress?.addressLine2 && <p className="text-xs text-[#1A4D3E]">{order.shippingAddress.addressLine2}</p>}
              <p className="text-xs text-[#1A4D3E]">{order.shippingAddress?.city}, {order.shippingAddress?.state} - {order.shippingAddress?.pincode}</p>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-[#1A4D3E] mb-3">Items</h4>
            <div className="space-y-3">
              {items.map((item, idx) => {
                const prodName = item.name || item.productId?.name || "Product";
                const imgUrl = item.image
                  ? (item.image.startsWith('http')
                      ? item.image
                      : `${process.env.NEXT_PUBLIC_IMAGE_URL || process.env.NEXT_PUBLIC_API || ''}${item.image}`)
                  : "/placeholder.png";

                return (
                  <div key={idx} className="flex flex-col sm:flex-row sm:items-center gap-4 bg-[#F4FAFB] rounded-2xl p-4 border border-[#E8F4F7] hover:border-[#18606D]/30 transition-all duration-300">
                    <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-white border border-[#D9EEF2] flex-shrink-0">
                      <img src={imgUrl} alt={prodName} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-base font-bold text-[#1A4D3E] truncate">{prodName}</p>
                      
                      {/* Variant and Package Option details */}
                      {item.variant && item.variant.name && (
                        <div className="mt-1 flex flex-wrap gap-2 items-center">
                          <span className="inline-flex items-center text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#E8F4F7] text-[#18606D] border border-[#D9EEF2]">
                            {item.variant.type === 'duration' ? '⏱️ Duration: ' : item.variant.type === 'pack' ? '📦 Pack: ' : '✨ Option: '}
                            {item.variant.name}
                          </span>
                          {item.variant.price && item.variant.price !== item.priceAtPurchase && (
                            <span className="text-[11px] text-[#64748B]">
                              (Base Option Price: ₹{item.variant.price})
                            </span>
                          )}
                        </div>
                      )}

                      <div className="mt-2 text-sm text-[#64748B] flex items-center gap-4 flex-wrap">
                        <span>Quantity: <strong className="text-[#1A4D3E] font-semibold">{item.quantity}</strong></span>
                        <span>Price per unit: <strong className="text-[#18606D] font-semibold">₹{item.priceAtPurchase?.toFixed(2)}</strong></span>
                      </div>
                    </div>
                    <div className="text-right sm:text-right flex sm:flex-col justify-between sm:justify-center items-center sm:items-end border-t sm:border-t-0 pt-2 sm:pt-0 border-dashed border-[#D9EEF2] min-w-[80px]">
                      <span className="text-xs text-[#64748B] sm:hidden">Total:</span>
                      <div className="text-base font-extrabold text-[#18606D]">₹{(item.quantity * item.priceAtPurchase).toFixed(2)}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-[#F4FAFB] rounded-2xl p-4 flex flex-col sm:flex-row sm:justify-between gap-3">
            <div className="text-sm text-[#1A4D3E] space-y-1">
              <p>Subtotal: <span className="font-semibold">₹{order.subtotal?.toFixed(2)}</span></p>
              <p>GST: <span className="font-semibold">₹{order.gstAmount?.toFixed(2)}</span></p>
              <p>Shipping: <span className="font-semibold">₹{order.shippingCharge?.toFixed(2)}</span></p>
              {order.discount ? <p>Discount: <span className="font-semibold text-green-700">-₹{order.discount?.toFixed(2)}</span></p> : null}
              {order.trackingId && <p>Tracking ID: <span className="font-semibold">{order.orderId}</span></p>}
            </div>
            <div className="text-right">
              <p className="text-xs text-[#64748B]">Total Amount</p>
              <p className="text-xl font-bold text-[#18606D]">₹{order.totalAmount?.toFixed(2)}</p>
              <p className="text-xs mt-2 text-[#64748B]">Payment: {order.paymentMethod === "online" ? "Prepaid" : "COD"} ({order.paymentStatus || "Pending"})</p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default OrdersTab;