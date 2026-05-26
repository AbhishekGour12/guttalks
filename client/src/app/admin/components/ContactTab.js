// components/ContactsTab.js
"use client";
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  FaEnvelope,
  FaUser,
  FaPhone,
  FaCalendar,
  FaFilter,
  FaSearch,
  FaEye,
  FaCheckCircle,
  FaTimesCircle,
  FaReply,
  FaTrash,
  FaClock,
  FaPaperPlane,
  FaSort,
  FaSortUp,
  FaSortDown
} from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import api from '../../lib/api';

const ContactTab = () => {
  const [contacts, setContacts] = useState([]);
  const [filteredContacts, setFilteredContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortField, setSortField] = useState('createdAt');
  const [sortDirection, setSortDirection] = useState('desc');
  const [selectedContact, setSelectedContact] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showReplyModal, setShowReplyModal] = useState(false);
  const [replyMessage, setReplyMessage] = useState('');
  const [sendingReply, setSendingReply] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalContacts, setTotalContacts] = useState(0);
  const limit = 10;

  const statusOptions = [
    { value: 'all', label: 'All Status', color: 'gray' },
    { value: 'pending', label: 'Pending', color: 'yellow' },
    { value: 'replied', label: 'Replied', color: 'green' },
  ];

  // Fetch contacts
  const fetchContacts = async (page = 1) => {
    try {
      setLoading(true);
      const params = {
        page,
        limit,
        status: statusFilter === 'all' ? undefined : statusFilter,
        search: searchTerm || undefined
      };

      const response = await api.get('/contact/all', { params });
      
      if (response.data.success) {
        setContacts(response.data.data);
        setFilteredContacts(response.data.data);
        setTotalContacts(response.data.pagination.total);
        setTotalPages(response.data.pagination.totalPages);
      }
    } catch (error) {
      console.error('Fetch contacts error:', error);
      toast.error('Failed to load contacts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContacts(currentPage);
  }, [currentPage, statusFilter]);

  // Search filter
  useEffect(() => {
    if (!searchTerm) {
      setFilteredContacts(contacts);
      return;
    }

    const filtered = contacts.filter(contact =>
      contact.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.message?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.phone?.includes(searchTerm)
    );
    setFilteredContacts(filtered);
  }, [searchTerm, contacts]);

  // Sort contacts
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const getSortedContacts = () => {
    return [...filteredContacts].sort((a, b) => {
      let aValue = a[sortField];
      let bValue = b[sortField];
      
      if (sortField === 'createdAt' || sortField === 'updatedAt') {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      }
      
      if (sortDirection === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
  };

  // View contact details
  const viewContactDetails = (contact) => {
    setSelectedContact(contact);
    setShowDetailsModal(true);
    
    // Mark as read if still pending
    if (contact.status === 'pending') {
      updateContactStatus(contact._id, 'read');
    }
  };

  // Delete contact
  const deleteContact = async (contactId) => {
    if (!window.confirm('Are you sure you want to delete this contact?')) return;
    
    try {
      const response = await api.delete(`/contact/${contactId}`);
      
      if (response.data.success) {
        setContacts(prev => prev.filter(contact => contact._id !== contactId));
        toast.success('Contact deleted successfully');
      }
    } catch (error) {
      console.error('Delete contact error:', error);
      toast.error('Failed to delete contact');
    }
  };

  // Send reply
  const sendReply = async () => {
    if (!replyMessage.trim()) {
      toast.error('Please enter a reply message');
      return;
    }

    setSendingReply(true);
    try {
      const response = await api.put(`/contact/${selectedContact._id}/status`, { 
        status: 'replied',
        replyMessage: replyMessage.trim()
      });
      
      if (response.data.success) {
        setContacts(prev =>
          prev.map(contact =>
            contact._id === selectedContact._id 
              ? { ...contact, status: 'replied', updatedAt: new Date() }
              : contact
          )
        );
        
        toast.success(response.data.message || 'Reply sent successfully');
        setShowReplyModal(false);
        setReplyMessage('');
        setShowDetailsModal(false);
      }
    } catch (error) {
      console.error('Send reply error:', error);
      toast.error(error.response?.data?.message || 'Failed to send reply');
    } finally {
      setSendingReply(false);
    }
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get status badge color (teal theme)
  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-amber-100 text-amber-700';
      case 'read': return 'bg-blue-100 text-blue-700';
      case 'replied': return 'bg-green-100 text-green-700';
      case 'closed': return 'bg-gray-100 text-gray-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  // Get status icon
  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <FaClock className="text-amber-600" />;
      case 'read': return <FaEye className="text-blue-600" />;
      case 'replied': return <FaCheckCircle className="text-green-600" />;
      case 'closed': return <FaTimesCircle className="text-gray-600" />;
      default: return <FaClock className="text-gray-600" />;
    }
  };

  // Pagination
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const renderPagination = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`px-3 py-1 rounded-lg ${
            currentPage === i
              ? 'bg-[#18606D] text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          {i}
        </button>
      );
    }
    
    return (
      <div className="flex items-center justify-center gap-2 mt-6">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200"
        >
          Previous
        </button>
        
        {pages}
        
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200"
        >
          Next
        </button>
      </div>
    );
  };

  if (loading && contacts.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#18606D]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#18606D] to-[#2A7F8F] rounded-2xl p-6 text-white">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold mb-2">Contact Messages</h1>
            <p className="text-white/80">Manage and respond to user inquiries</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold">{totalContacts}</div>
              <div className="text-sm text-white/70">Total Messages</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold">
                {contacts.filter(c => c.status === 'pending').length}
              </div>
              <div className="text-sm text-white/70">Pending</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#D9EEF2]">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#64748B]" />
              <input
                type="text"
                placeholder="Search by name, email, phone, or message..."
                className="w-full pl-10 pr-4 py-2.5 border border-[#D9EEF2] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#18606D]"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          <div className="flex gap-4">
            <div className="relative">
              <select
                className="pl-10 pr-4 py-2.5 border border-[#D9EEF2] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#18606D] appearance-none bg-white"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                {statusOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <FaFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#64748B]" />
            </div>
            
            <button
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('all');
                setCurrentPage(1);
              }}
              className="px-4 py-2.5 bg-[#F4FAFB] text-[#1A4D3E] rounded-xl hover:bg-[#E8F4F7] font-medium border border-[#D9EEF2]"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Contacts Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-[#D9EEF2] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-[#F4FAFB] border-b border-[#D9EEF2]">
                <th className="py-3 px-4 text-left">
                  <button
                    onClick={() => handleSort('name')}
                    className="flex items-center gap-1 font-medium text-[#1A4D3E] hover:text-[#18606D]"
                  >
                    <span>Contact</span>
                    {sortField === 'name' && (
                      sortDirection === 'asc' ? <FaSortUp /> : <FaSortDown />
                    )}
                    {sortField !== 'name' && <FaSort className="text-[#64748B]" />}
                  </button>
                </th>
                <th className="py-3 px-4 text-left">
                  <button
                    onClick={() => handleSort('subject')}
                    className="flex items-center gap-1 font-medium text-[#1A4D3E] hover:text-[#18606D]"
                  >
                    <span>Subject</span>
                    {sortField === 'subject' && (
                      sortDirection === 'asc' ? <FaSortUp /> : <FaSortDown />
                    )}
                    {sortField !== 'subject' && <FaSort className="text-[#64748B]" />}
                  </button>
                </th>
                <th className="py-3 px-4 text-left">
                  <button
                    onClick={() => handleSort('createdAt')}
                    className="flex items-center gap-1 font-medium text-[#1A4D3E] hover:text-[#18606D]"
                  >
                    <span>Date</span>
                    {sortField === 'createdAt' && (
                      sortDirection === 'asc' ? <FaSortUp /> : <FaSortDown />
                    )}
                    {sortField !== 'createdAt' && <FaSort className="text-[#64748B]" />}
                  </button>
                </th>
                <th className="py-3 px-4 text-left">
                  <button
                    onClick={() => handleSort('status')}
                    className="flex items-center gap-1 font-medium text-[#1A4D3E] hover:text-[#18606D]"
                  >
                    <span>Status</span>
                    {sortField === 'status' && (
                      sortDirection === 'asc' ? <FaSortUp /> : <FaSortDown />
                    )}
                    {sortField !== 'status' && <FaSort className="text-[#64748B]" />}
                  </button>
                </th>
                <th className="py-3 px-4 text-left font-medium text-[#1A4D3E]">Actions</th>
              </tr>
            </thead>
            <tbody>
              {getSortedContacts().map((contact, index) => (
                <motion.tr
                  key={contact._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="border-b border-[#D9EEF2] hover:bg-[#F4FAFB]"
                >
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-[#18606D] to-[#2A7F8F] rounded-full flex items-center justify-center text-white font-bold">
                        {contact.name?.charAt(0).toUpperCase() || 'U'}
                      </div>
                      <div>
                        <p className="font-medium text-[#1A4D3E]">{contact.name}</p>
                        <div className="flex flex-col text-sm text-[#64748B]">
                          <span className="flex items-center gap-1">
                            <FaEnvelope className="text-xs" />
                            {contact.email}
                          </span>
                          {contact.phone && (
                            <span className="flex items-center gap-1">
                              <FaPhone className="text-xs" />
                              {contact.phone}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="capitalize text-[#1A4D3E]">{contact.subject}</div>
                    <div className="text-sm text-[#64748B] truncate max-w-xs">
                      {contact.message?.substring(0, 60)}...
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <FaCalendar className="text-[#64748B]" />
                      <div>
                        <div className="text-sm text-[#1A4D3E]">{formatDate(contact.createdAt)}</div>
                        <div className="text-xs text-[#64748B]">
                          {contact.status === 'pending' ? 'Awaiting response' : 'Updated'}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(contact.status)}`}>
                      {getStatusIcon(contact.status)}
                      {contact.status.charAt(0).toUpperCase() + contact.status.slice(1)}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => viewContactDetails(contact)}
                        className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200"
                        title="View Details"
                      >
                        <FaEye />
                      </button>
                      <button
                        onClick={() => {
                          setSelectedContact(contact);
                          setShowReplyModal(true);
                        }}
                        className="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200"
                        title="Send Reply"
                      >
                        <FaReply />
                      </button>
                      <button
                        onClick={() => deleteContact(contact._id)}
                        className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200"
                        title="Delete"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredContacts.length === 0 && (
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-[#F4FAFB] rounded-full flex items-center justify-center mx-auto mb-4">
              <FaEnvelope className="text-3xl text-[#64748B]" />
            </div>
            <h3 className="text-lg font-medium text-[#1A4D3E] mb-2">No contacts found</h3>
            <p className="text-[#64748B]">No contact messages match your current filters</p>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-[#D9EEF2]">
            <div className="flex items-center justify-between">
              <div className="text-sm text-[#64748B]">
                Showing {(currentPage - 1) * limit + 1} to {Math.min(currentPage * limit, totalContacts)} of {totalContacts} contacts
              </div>
              {renderPagination()}
            </div>
          </div>
        )}
      </div>

      {/* Contact Details Modal */}
      {showDetailsModal && selectedContact && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-[#D9EEF2]"
          >
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-xl font-bold text-[#1A4D3E]">Contact Details</h2>
                <p className="text-[#64748B]">Submitted on {formatDate(selectedContact.createdAt)}</p>
              </div>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="text-[#64748B] hover:text-[#1A4D3E]"
              >
                ✕
              </button>
            </div>

            <div className="space-y-6">
              {/* Contact Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-[#F4FAFB] p-4 rounded-lg border border-[#D9EEF2]">
                  <h3 className="font-medium text-[#1A4D3E] mb-2">Contact Information</h3>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <FaUser className="text-[#64748B]" />
                      <span className="text-[#1A4D3E]">{selectedContact.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FaEnvelope className="text-[#64748B]" />
                      <span className="text-[#1A4D3E]">{selectedContact.email}</span>
                    </div>
                    {selectedContact.phone && (
                      <div className="flex items-center gap-2">
                        <FaPhone className="text-[#64748B]" />
                        <span className="text-[#1A4D3E]">{selectedContact.phone}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-[#F4FAFB] p-4 rounded-lg border border-[#D9EEF2]">
                  <h3 className="font-medium text-[#1A4D3E] mb-2">Details</h3>
                  <div className="space-y-2">
                    <div>
                      <span className="text-sm text-[#64748B]">Subject:</span>
                      <p className="capitalize font-medium text-[#1A4D3E]">{selectedContact.subject}</p>
                    </div>
                    <div>
                      <span className="text-sm text-[#64748B]">Status:</span>
                      <span className={`ml-2 inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedContact.status)}`}>
                        {getStatusIcon(selectedContact.status)}
                        {selectedContact.status}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Message */}
              <div>
                <h3 className="font-medium text-[#1A4D3E] mb-3">Message</h3>
                <div className="bg-[#F4FAFB] p-4 rounded-lg whitespace-pre-wrap border border-[#D9EEF2]">
                  {selectedContact.message}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t border-[#D9EEF2]">
                <button
                  onClick={() => {
                    setShowDetailsModal(false);
                    setShowReplyModal(true);
                  }}
                  className="px-4 py-2 bg-[#18606D] text-white rounded-lg hover:bg-[#2A7F8F] flex items-center gap-2"
                >
                  <FaReply /> Reply
                </button>
                
                <button
                  onClick={() => deleteContact(selectedContact._id)}
                  className="px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 ml-auto"
                >
                  Delete
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Reply Modal */}
      {showReplyModal && selectedContact && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-2xl p-6 max-w-md w-full border border-[#D9EEF2]"
          >
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-xl font-bold text-[#1A4D3E]">Send Reply</h2>
                <p className="text-[#64748B]">To: {selectedContact.email}</p>
              </div>
              <button
                onClick={() => {
                  setShowReplyModal(false);
                  setReplyMessage('');
                }}
                className="text-[#64748B] hover:text-[#1A4D3E]"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#1A4D3E] mb-2">Reply Message *</label>
                <textarea
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                  rows="6"
                  className="w-full p-3 border border-[#D9EEF2] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#18606D]"
                  placeholder="Type your response here..."
                />
              </div>

              <div className="bg-[#E8F4F7] p-3 rounded-lg border border-[#D9EEF2]">
                <p className="text-sm text-[#18606D]">
                  <strong>Note:</strong> This will send an email to {selectedContact.email} and mark the contact as "Replied".
                </p>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => {
                    setShowReplyModal(false);
                    setReplyMessage('');
                  }}
                  className="px-4 py-2 bg-[#F4FAFB] text-[#1A4D3E] rounded-lg hover:bg-[#E8F4F7] border border-[#D9EEF2]"
                >
                  Cancel
                </button>
                <button
                  onClick={sendReply}
                  disabled={sendingReply || !replyMessage.trim()}
                  className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
                    sendingReply || !replyMessage.trim()
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-[#18606D] hover:bg-[#2A7F8F] text-white'
                  }`}
                >
                  {sendingReply ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Sending...
                    </>
                  ) : (
                    <>
                      <FaPaperPlane /> Send Reply
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default ContactTab;