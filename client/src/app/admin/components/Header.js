import { FaSearch, FaBars } from "react-icons/fa";
import { Bell, User } from "lucide-react";

export default function Header({ searchTerm, setSearchTerm, sidebarOpen, setSidebarOpen }) {
  return (
    <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-[#D9EEF2] px-6 py-3 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="lg:hidden p-2 rounded-lg hover:bg-[#F4FAFB]"
        >
          <FaBars className="text-[#18606D]" />
        </button>
        <div className="relative hidden md:block">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8A9B6E] text-sm" />
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 w-80 bg-[#F4FAFB] border border-[#D9EEF2] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#18606D]"
          />
        </div>
      </div>
      <div className="flex items-center gap-4">
        
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-[#18606D] flex items-center justify-center text-white font-bold">
            A
          </div>
          <span className="hidden md:block text-sm font-medium text-[#1A4D3E]">Admin</span>
        </div>
      </div>
    </header>
  );
}