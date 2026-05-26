"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import Dashboard from "./components/Dashboard";
import ProductManagement from "./components/ProductManagement";
import { PageLoader } from "./components/Loading";
import CallSlotManagement from "./components/CallSlotManagement";
import Booking from "./components/Booking";
import OrdersTab from "./components/OrdersTab";
import { actionAsyncStorage } from "next/dist/server/app-render/action-async-storage.external";
import CouponsTab from "./components/CouponsTab";
import ContactTab from "./components/ContactTab";

const dummyStats = {
  totalRevenue: 125430,
  totalOrders: 342,
  totalCustomers: 1289,
  totalProducts: 24,
  pendingOrders: 8,
};

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    setTimeout(() => setLoading(false), 800);
  }, []);

  if (loading) return <PageLoader />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F4FAFB] via-white to-[#E8F4F7]">
      <div className="flex">
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
        />
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-30 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
        <div className="flex-1 min-h-screen">
          <Header
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            sidebarOpen={sidebarOpen}
            setSidebarOpen={setSidebarOpen}
          />
          <div className="p-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                {activeTab === "dashboard" && <Dashboard stats={dummyStats} />}
                {activeTab === "products" && <ProductManagement searchTerm={searchTerm} />}
                {activeTab === "availability" && <CallSlotManagement/>}
                {activeTab === "bookings" && <Booking/>}
                {activeTab === "orders" && <OrdersTab/>}
                {activeTab === "coupon" && <CouponsTab/>}
                {activeTab === "contact" && <ContactTab/>}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}