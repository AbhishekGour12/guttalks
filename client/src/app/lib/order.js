import api from "./api";

export const orderAPI = {
    createOrder: async(formData) =>{
        const response = await api.post("/order", formData);
        return response.data;
    },
   getUserOrders: async () => {
    const res = await api.get("/order");
    return res.data;
  },

  getOrderDetail: async (id) => {
    const res = await api.get(`/order/${id}`);
    return res.data;
  },

  trackOrder: async (shipmentId) => {
    const res = await api.get(`/shipping/track/${shipmentId}`);
    return res.data;
  },
   // --- 5. Order Management ---
   
    updateOrderStatus: async (id, status) => {
        try {
            const response = await api.patch(`/orders/${id}`, { status });
            return response.data;
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Failed to update order status.';
            throw new Error(errorMessage);
        }
    },
};
