"use client";
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FaCalendarAlt, FaClock, FaPlus, FaTrash, FaSave, FaSpinner, 
  FaCalendarWeek, FaRegCalendar, FaTimesCircle, FaSearch 
} from 'react-icons/fa';
import { availabilityAPI } from '../../lib/availablity';
import toast from 'react-hot-toast';

const formatTimeTo12Hour = (time24) => {
  if (!time24) return '';
  const [h, m] = time24.split(':');
  const hour = parseInt(h);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const hour12 = hour % 12 || 12;
  return `${hour12}:${m} ${ampm}`;
};

export default function CallSlotManagement() {
  const [slots, setSlots] = useState({});
  const [loading, setLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(null);
  const [isRangeMode, setIsRangeMode] = useState(false);
  const [rangeStart, setRangeStart] = useState('');
  const [rangeEnd, setRangeEnd] = useState('');
  const [singleDate, setSingleDate] = useState('');
  const [startTime, setStartTime] = useState('18:00');
  const [endTime, setEndTime] = useState('21:00');
  const [slotDuration, setSlotDuration] = useState(45);
  const [breakBetweenSlots, setBreakBetweenSlots] = useState(5);

  const fetchSlots = async () => {
    try {
      const res = await availabilityAPI.getAll();
      setSlots(res.slots || {});
    } catch (error) {
      toast.error('Failed to fetch slots');
    }
  };

  useEffect(() => { fetchSlots(); }, []);

  const handleGenerateSlots = async (e) => {
    e.preventDefault();
    if (isRangeMode && (!rangeStart || !rangeEnd)) {
      return toast.error('Please select start and end date');
    }
    if (!isRangeMode && !singleDate) {
      return toast.error('Please select a date');
    }
    
    setLoading(true);
    try {
      const data = {
        startDate: isRangeMode ? rangeStart : singleDate,
        endDate: isRangeMode ? rangeEnd : singleDate,
        startTime,
        endTime,
        slotDuration,
        breakBetweenSlots
      };
      
      const res = await availabilityAPI.generateSlots(data);
      toast.success(`Created ${res.created} slots, skipped ${res.skipped}`);
      fetchSlots();
      setRangeStart('');
      setRangeEnd('');
      setSingleDate('');
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSlot = async (id, dateStr, time) => {
    if (!confirm(`Delete slot at ${formatTimeTo12Hour(time)}? This will free the slot.`)) return;
    setDeleteLoading(id);
    try {
      await availabilityAPI.deleteSlot(id);
      toast.success('Slot deleted');
      fetchSlots();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setDeleteLoading(null);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#1A4D3E]">Call Slot Management</h1>
        <p className="text-[#64748B] mt-1">Generate and manage individual time slots</p>
      </div>

      {/* Generate Slots Card */}
      <div className="bg-white rounded-2xl shadow-lg border border-[#D9EEF2] overflow-hidden mb-8">
        <div className="bg-gradient-to-r from-[#18606D] to-[#2A7F8F] px-6 py-4 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            {isRangeMode ? <FaCalendarWeek /> : <FaPlus />}
            {isRangeMode ? 'Generate Slots for Date Range' : 'Generate Slots'}
          </h2>
          <button
            onClick={() => setIsRangeMode(!isRangeMode)}
            className="bg-white/20 hover:bg-white/30 text-white px-3 py-1 rounded-lg text-sm flex items-center gap-2 transition"
          >
            {isRangeMode ? <FaRegCalendar /> : <FaCalendarWeek />}
            {isRangeMode ? 'Single Date' : 'Date Range'}
          </button>
        </div>
        <form onSubmit={handleGenerateSlots} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
            {isRangeMode ? (
              <>
                <div>
                  <label className="block text-sm font-medium text-[#1A4D3E] mb-1">Start Date *</label>
                  <input 
                    type="date" 
                    required 
                    value={rangeStart} 
                    onChange={e => setRangeStart(e.target.value)}
                    className="w-full px-4 py-2.5 border border-[#D9EEF2] rounded-xl focus:ring-2 focus:ring-[#18606D] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#1A4D3E] mb-1">End Date *</label>
                  <input 
                    type="date" 
                    required 
                    value={rangeEnd} 
                    onChange={e => setRangeEnd(e.target.value)}
                    className="w-full px-4 py-2.5 border border-[#D9EEF2] rounded-xl focus:ring-2 focus:ring-[#18606D] focus:outline-none"
                  />
                </div>
              </>
            ) : (
              <div>
                <label className="block text-sm font-medium text-[#1A4D3E] mb-1">Date *</label>
                <input 
                  type="date" 
                  required 
                  value={singleDate} 
                  onChange={e => setSingleDate(e.target.value)}
                  className="w-full px-4 py-2.5 border border-[#D9EEF2] rounded-xl focus:ring-2 focus:ring-[#18606D] focus:outline-none"
                />
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-[#1A4D3E] mb-1">Start Time</label>
              <input 
                type="time" 
                value={startTime} 
                onChange={e => setStartTime(e.target.value)}
                className="w-full px-4 py-2.5 border border-[#D9EEF2] rounded-xl focus:ring-2 focus:ring-[#18606D] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#1A4D3E] mb-1">End Time</label>
              <input 
                type="time" 
                value={endTime} 
                onChange={e => setEndTime(e.target.value)}
                className="w-full px-4 py-2.5 border border-[#D9EEF2] rounded-xl focus:ring-2 focus:ring-[#18606D] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#1A4D3E] mb-1">Slot Duration (min)</label>
              <input 
                type="number" 
                value={slotDuration} 
                onChange={e => setSlotDuration(Number(e.target.value))}
                className="w-full px-4 py-2.5 border border-[#D9EEF2] rounded-xl focus:ring-2 focus:ring-[#18606D] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#1A4D3E] mb-1">Break (min)</label>
              <input 
                type="number" 
                value={breakBetweenSlots} 
                onChange={e => setBreakBetweenSlots(Number(e.target.value))}
                className="w-full px-4 py-2.5 border border-[#D9EEF2] rounded-xl focus:ring-2 focus:ring-[#18606D] focus:outline-none"
              />
            </div>
            <div className="flex items-end">
              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-gradient-to-r from-[#18606D] to-[#2A7F8F] text-white px-6 py-2.5 rounded-xl font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? <FaSpinner className="animate-spin" /> : <FaSave />}
                {loading ? 'Generating...' : 'Generate Slots'}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Existing Slots */}
      <div className="bg-white rounded-2xl shadow-lg border border-[#D9EEF2] overflow-hidden">
        <div className="bg-gradient-to-r from-[#F4FAFB] to-white px-6 py-4 border-b border-[#D9EEF2]">
          <h2 className="text-lg font-semibold text-[#1A4D3E] flex items-center gap-2">
            <FaCalendarAlt /> Existing Slots
          </h2>
        </div>
        <div className="divide-y divide-[#E8F4F7]">
          {Object.keys(slots).length === 0 ? (
            <div className="text-center py-12">
              <FaClock className="text-4xl text-[#64748B] mx-auto mb-3" />
              <p className="text-[#64748B]">No slots generated yet.</p>
            </div>
          ) : (
            Object.entries(slots).slice().reverse().map(([dateStr, daySlots]) => (
              <div key={dateStr} className="p-4 hover:bg-[#F4FAFB] transition-colors">
                <div className="flex justify-between items-center mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#E8F4F7] flex items-center justify-center">
                      <FaCalendarAlt className="text-[#18606D]" />
                    </div>
                    <p className="font-semibold text-[#1A4D3E]">
                      {new Date(dateStr).toLocaleDateString('en-IN', { 
                        weekday: 'short', 
                        year: 'numeric', 
                        month: 'short', 
                        day: 'numeric' 
                      })}
                    </p>
                  </div>
                </div>
                
                {/* Individual slots */}
                <div className="ml-12 flex flex-wrap gap-2">
                  {daySlots.map(slot => (
                    <div key={slot._id} className="flex items-center gap-2 bg-white border border-[#D9EEF2] rounded-lg px-3 py-1.5 shadow-sm">
                      <FaClock className="text-xs text-[#18606D]" />
                      <span className="text-sm text-[#1A4D3E]">
                        {formatTimeTo12Hour(slot.startTime)} – {formatTimeTo12Hour(slot.endTime)}
                      </span>
                      {slot.isBooked && (
                        <span className="text-xs bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full ml-1">Booked</span>
                      )}
                      <button
                        onClick={() => handleDeleteSlot(slot._id, dateStr, slot.startTime)}
                        disabled={deleteLoading === slot._id}
                        className="ml-1 p-1 text-red-400 hover:text-red-600 transition disabled:opacity-50"
                        title="Delete this time slot"
                      >
                        {deleteLoading === slot._id ? <FaSpinner className="animate-spin" /> : <FaTimesCircle size={14} />}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}