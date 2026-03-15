const API_BASE = "http://localhost:8081/api";

function getToken() {
  const user = localStorage.getItem("dcms_user");
  return user ? JSON.parse(user).token : null;
}

function authHeaders(isFormData = false) {
  const token = getToken();
  const headers = {};
  if (token) headers["Authorization"] = `Bearer ${token}`;
  if (!isFormData) headers["Content-Type"] = "application/json";
  return headers;
}

export const authAPI = {
  login: (username, password) =>
    fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    }).then(r => r.json()),

  register: (username, email, password, role) =>
    fetch(`${API_BASE}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, email, password, role }),
    }).then(r => r.json()),
};

export const complaintsAPI = {
  create: (formData) =>
    fetch(`${API_BASE}/complaints`, {
      method: "POST",
      headers: authHeaders(true),
      body: formData,
    }).then(r => r.json()),

  getByOrder: (orderId) =>
    fetch(`${API_BASE}/complaints/order/${orderId}`, {
      headers: authHeaders(),
    }).then(r => r.json()),

  getAll: () =>
    fetch(`${API_BASE}/complaints/all`, {
      headers: authHeaders(),
    }).then(r => r.json()),

  getStats: () =>
    fetch(`${API_BASE}/complaints/stats`, {
      headers: authHeaders(),
    }).then(r => r.json()),

  updateStatus: (id, status) =>
    fetch(`${API_BASE}/complaints/${id}/status?status=${status}`, {
      method: "PUT",
      headers: authHeaders(),
    }).then(r => r.json()),
};