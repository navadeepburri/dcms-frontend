import axios from "axios";

const BASE = process.env.REACT_APP_API_URL || "http://localhost:8081/api";

// ── Submit a new complaint (with optional file) ──────────────────────────────
export async function submitComplaint({ orderId, originalText, file }) {
  const form = new FormData();
  form.append("orderId", orderId);
  form.append("originalText", originalText);
  if (file) form.append("file", file);

  const { data } = await axios.post(`${BASE}/complaints`, form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
}

// ── Get all complaints for an order ─────────────────────────────────────────
export async function getComplaintsByOrder(orderId) {
  const { data } = await axios.get(`${BASE}/complaints/order/${orderId}`);
  // Normalise: backend may return array or {orderId, total, complaints}
  if (Array.isArray(data)) {
    return { orderId, total: data.length, complaints: data };
  }
  return data;
}

// ── Update complaint status ──────────────────────────────────────────────────
export async function updateComplaintStatus(id, status) {
  const { data } = await axios.put(
    `${BASE}/complaints/${id}/status`,
    null,
    { params: { status } }
  );
  return data;
}

// ── Get dashboard stats ──────────────────────────────────────────────────────
export async function getComplaintStats() {
  const { data } = await axios.get(`${BASE}/complaints/stats`);
  return data;
}
