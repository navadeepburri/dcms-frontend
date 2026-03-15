import axios from "axios";

const BASE_URL = "http://localhost:8081/api/complaints";

// Get dashboard statistics
export const getStats = () => {
  return axios.get(`${BASE_URL}/stats`);
};

// Submit complaint
export const submitComplaint = (orderId, text) => {
  return axios.post(BASE_URL, {
    orderId: Number(orderId),
    originalText: text
  });
};

// Get complaints by order ID
export const getComplaintsByOrderId = (orderId) => {
  return axios.get(`${BASE_URL}/order/${orderId}`);
};

// Update complaint status
export const updateComplaintStatus = (id, status) => {
  return axios.put(`${BASE_URL}/${id}/status?status=${status}`);
};