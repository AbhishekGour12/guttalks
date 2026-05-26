import { FaTachometerAlt, FaBoxes, FaCalendarAlt, FaGift } from "react-icons/fa";
import { HeartPulse } from "lucide-react";

export default function Sidebar({ activeTab, setActiveTab, sidebarOpen }) {
  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: FaTachometerAlt },
    { id: "products", label: "Products", icon: FaBoxes },
    {id: "availability", label: "Availability", icon: FaTachometerAlt },
    { id: "bookings", label: "Bookings", icon: FaCalendarAlt },
    {id: "orders", label: "Orders", icon: FaBoxes },
    {id: "coupon", label: "Coupon", icon: FaGift },
    {id: "contact", label: "Contact", icon: FaTachometerAlt }
  ];

  return (
    <aside
      className={`fixed lg:relative z-40 w-64  min-h-screen bg-white border-r border-[#D9EEF2] shadow-lg transition-transform duration-300 ${
        sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      }`}
    >
      <div className="p-5 border-b border-[#D9EEF2] flex items-center gap-2">
        <HeartPulse className="text-[#18606D] w-6 h-6" />
        <span className="font-bold text-xl text-[#18606D]">GutsTalks</span>
        <span className="text-xs bg-[#E8F4F7] text-[#18606D] px-2 py-0.5 rounded-full ml-2">Admin</span>
      </div>
      <nav className="p-4 space-y-2">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
              activeTab === item.id
                ? "bg-gradient-to-r from-[#18606D] to-[#2A7F8F] text-white shadow-md"
                : "text-[#1A4D3E] hover:bg-[#F4FAFB]"
            }`}
          >
            <item.icon size={18} />
            <span className="font-medium">{item.label}</span>
          </button>
        ))}
      </nav>
    </aside>
  );
}