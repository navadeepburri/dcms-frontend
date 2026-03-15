import { useState, useEffect } from "react";
import axios from "axios";

const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:8081/api";

const getAuthHeader = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
});

const CATEGORY_COLORS = {
  "Electronics":     { bg:"#eff6ff", color:"#2563eb", border:"#bfdbfe" },
  "Fashion":         { bg:"#fdf4ff", color:"#9333ea", border:"#e9d5ff" },
  "Home Appliances": { bg:"#f0fdf4", color:"#16a34a", border:"#bbf7d0" },
  "Beauty":          { bg:"#fff1f2", color:"#e11d48", border:"#fecdd3" },
  "Books":           { bg:"#fffbeb", color:"#d97706", border:"#fde68a" },
};

function ComplaintForm() {
  const [orders, setOrders]               = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderId, setOrderId]             = useState("");
  const [description, setDescription]     = useState("");
  const [file, setFile]                   = useState(null);
  const [uploading, setUploading]         = useState(false);
  const [error, setError]                 = useState("");
  const [success, setSuccess]             = useState(null);
  const [loadingOrders, setLoadingOrders] = useState(true);

  useEffect(() => {
    axios.get(`${API_BASE}/orders/my`, getAuthHeader())
      .then(res => {
        const data = Array.isArray(res.data) ? res.data : [];
        setOrders(data);
        setLoadingOrders(false);
      })
      .catch(() => setLoadingOrders(false));
  }, []);

  const handleOrderChange = (e) => {
    const id = e.target.value;
    setOrderId(id);
    const found = orders.find(o => String(o.orderId) === String(id));
    setSelectedOrder(found || null);
  };

  const handleSubmit = async () => {
    if (!orderId || !description) { alert("Please select an order and enter a description"); return; }
    setError(""); setSuccess(null);
    try {
      setUploading(true);
      const formData = new FormData();
      formData.append("orderId", Number(orderId));
      formData.append("originalText", description);
      if (file) formData.append("file", file);

      const res = await axios.post(`${API_BASE}/complaints`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        }
      });

      setSuccess({ id: res.data.id, trackingNumber: res.data.trackingNumber });
      setDescription("");
      setFile(null);
      setOrderId("");
      setSelectedOrder(null);
    } catch (err) {
      setError(err.response?.data?.detail || err.response?.data?.error || "Error submitting complaint");
    } finally {
      setUploading(false);
    }
  };

  const catStyle = selectedOrder?.productCategory
    ? (CATEGORY_COLORS[selectedOrder.productCategory] || { bg:"#f8fafc", color:"#475569", border:"#e2e8f0" })
    : null;

  return (
    <div style={{ background:"#fff", padding:"32px", borderRadius:"16px", boxShadow:"0 12px 30px rgba(0,0,0,0.12)", width:"560px" }}>
      <h3 style={{ margin:"0 0 24px", color:"#1f2933", fontSize:"18px" }}>Complaint Details</h3>

      {success && (
        <div style={{ background:"#f0fdf4", border:"1px solid #bbf7d0", borderRadius:"12px", padding:"16px 20px", marginBottom:"20px" }}>
          <div style={{ fontWeight:700, color:"#15803d", fontSize:"15px" }}>✅ Complaint Submitted!</div>
          <div style={{ fontSize:"13px", color:"#166534", marginTop:"6px" }}>
            Complaint ID: <strong>#{success.id}</strong> &nbsp;·&nbsp;
            Tracking: <strong style={{ fontFamily:"monospace" }}>{success.trackingNumber}</strong>
          </div>
        </div>
      )}

      {error && (
        <div style={{ background:"#fef2f2", border:"1px solid #fecaca", borderRadius:"10px", padding:"12px 16px", marginBottom:"16px", color:"#dc2626", fontSize:"14px" }}>
          ⚠️ {error}
        </div>
      )}

      <div style={{ marginBottom:"16px" }}>
        <label style={{ fontWeight:700, color:"#374151", fontSize:"14px", display:"block", marginBottom:"8px" }}>
          Select Order
        </label>
        {loadingOrders ? (
          <div style={{ padding:"12px", color:"#94a3b8", fontSize:"14px" }}>Loading your orders…</div>
        ) : orders.length === 0 ? (
          <div style={{ padding:"12px", color:"#ef4444", fontSize:"14px" }}>No orders found for your account.</div>
        ) : (
          <select
            value={orderId}
            onChange={handleOrderChange}
            style={{ width:"100%", padding:"12px", borderRadius:"10px", border:"1.5px solid #e2e8f0", fontSize:"14px", background:"#fff", cursor:"pointer", outline:"none" }}
          >
            <option value="">-- Select an order --</option>
            {orders.map((o, idx) => (
              <option key={idx} value={o.orderId}>
                Order #{o.orderId} — {o.productName} — ₹{o.totalAmount} — {o.orderStatus}
              </option>
            ))}
          </select>
        )}
      </div>

      {selectedOrder && catStyle && (
        <div style={{ marginBottom:"16px", padding:"14px 16px", borderRadius:"12px", border:`1px solid ${catStyle.border}`, background:catStyle.bg }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <div>
              <div style={{ fontSize:"15px", fontWeight:700, color:"#1e293b" }}>
                {selectedOrder.productName}
              </div>
              <div style={{ fontSize:"12px", color:"#64748b", marginTop:"4px" }}>
                Order #{selectedOrder.orderId} · {new Date(selectedOrder.orderDate).toLocaleDateString("en-IN")} · ₹{selectedOrder.totalAmount}
              </div>
            </div>
            <div style={{ textAlign:"right" }}>
              <span style={{ fontSize:"12px", fontWeight:700, padding:"4px 12px", borderRadius:"20px", background:catStyle.bg, color:catStyle.color, border:`1px solid ${catStyle.border}` }}>
                {selectedOrder.productCategory}
              </span>
              <div style={{ fontSize:"12px", color:"#16a34a", fontWeight:600, marginTop:"6px" }}>
                ✓ {selectedOrder.orderStatus}
              </div>
            </div>
          </div>
        </div>
      )}

      <div style={{ marginBottom:"16px" }}>
        <label style={{ fontWeight:700, color:"#374151", fontSize:"14px", display:"block", marginBottom:"8px" }}>
          Complaint Description
        </label>
        <textarea
          rows="4"
          value={description}
          onChange={e => setDescription(e.target.value)}
          placeholder="Describe your issue in detail..."
          style={{ resize:"vertical", width:"100%", padding:"12px", borderRadius:"10px", border:"1.5px solid #e2e8f0", fontSize:"14px", fontFamily:"Segoe UI, sans-serif", outline:"none" }}
        />
      </div>

      <div style={{ marginBottom:"20px" }}>
        <label style={{ fontWeight:700, color:"#374151", fontSize:"14px", display:"block", marginBottom:"8px" }}>
          Attach Evidence (optional)
        </label>
        <div style={{ marginTop:"4px" }}>
          <input
            type="file"
            accept=".jpg,.jpeg,.png,.mp4"
            onChange={e => setFile(e.target.files[0])}
            style={{ display:"none" }}
            id="fileInput"
          />
          <label htmlFor="fileInput" style={{ padding:"10px 16px", backgroundColor:"#f8f9fa", border:"2px dashed #ced4da", borderRadius:"10px", cursor:"pointer", display:"inline-flex", alignItems:"center", gap:"8px", fontSize:"14px", color:"#6c757d" }}>
            📎 {file ? file.name : "Choose file (JPG, PNG, MP4)"}
          </label>
          {file && (
            <button onClick={() => setFile(null)} style={{ marginLeft:"10px", background:"none", border:"none", color:"#e74c3c", cursor:"pointer", fontSize:"13px", padding:"4px 8px", boxShadow:"none", transform:"none" }}>
              ✕ Remove
            </button>
          )}
        </div>
      </div>

      <button
        onClick={handleSubmit}
        disabled={uploading || orders.length === 0}
        style={{ width:"100%", borderRadius:"10px" }}
      >
        {uploading ? "⏳ Submitting..." : "Submit Complaint"}
      </button>
    </div>
  );
}

export default ComplaintForm;