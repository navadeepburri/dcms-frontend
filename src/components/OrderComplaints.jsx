import { useState } from "react";
import axios from "axios";

const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:8081/api";

const getStatusColor   = s => ({ Resolved: "#27ae60", "In Progress": "#2980b9", Closed: "#7f8c8d", Rejected: "#c0392b" }[s] || "#e67e22");
const getPriorityColor = p => ({ High: "#e74c3c", Medium: "#f39c12" }[p] || "#27ae60");

function ComplaintCard({ c, onUpdateStatus }) {
  return (
    <div className="complaint-card">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "14px" }}>
        <div>
          <span style={{ fontFamily: "monospace", fontSize: "13px", color: "#2980b9", fontWeight: 600 }}>
            {c.trackingNumber}
          </span>
          <span style={{ color: "#adb5bd", margin: "0 8px" }}>·</span>
          <span style={{ fontSize: "13px", color: "#adb5bd" }}>ID #{c.id}</span>
        </div>
        <div style={{ display: "flex", gap: "8px" }}>
          <span className="badge" style={{ background: getPriorityColor(c.priority) + "20", color: getPriorityColor(c.priority), border: `1px solid ${getPriorityColor(c.priority)}40` }}>
            {c.priority}
          </span>
          <span className="badge" style={{ background: getStatusColor(c.status) + "20", color: getStatusColor(c.status), border: `1px solid ${getStatusColor(c.status)}40` }}>
            {c.status}
          </span>
        </div>
      </div>

      <p><strong>Original Complaint:</strong> {c.originalText}</p>
      {c.translatedText && c.translatedText !== c.originalText && (
        <p><strong>Translated:</strong> {c.translatedText}</p>
      )}
      <p><strong>Detected Language:</strong> {c.detectedLanguage}</p>
      <p><strong>Category:</strong> {c.category}</p>
      <p><strong>Created At:</strong> {new Date(c.createdAt).toLocaleString("en-IN")}</p>

      {c.attachmentPath && (
        <p>
          <strong>Attachment:</strong>{" "}
          <a href={`${API_BASE}/complaints/uploads/${c.attachmentPath.split("/").pop()}`}
            target="_blank" rel="noreferrer" style={{ color: "#273c75", fontSize: "14px" }}>
            📎 View File
          </a>
        </p>
      )}

      <div style={{ display: "flex", gap: "10px", marginTop: "14px" }}>
        {c.status === "Submitted" && (
          <button className="btn-small" onClick={() => onUpdateStatus(c.id, "In Progress")} style={{ background: "#2980b9" }}>
            🔄 Mark In Progress
          </button>
        )}
        {c.status !== "Resolved" && c.status !== "Closed" && (
          <button className="btn-small" onClick={() => onUpdateStatus(c.id, "Resolved")} style={{ background: "#27ae60" }}>
            ✅ Resolve
          </button>
        )}
        {c.status !== "Closed" && c.status !== "Resolved" && (
          <button className="btn-small" onClick={() => onUpdateStatus(c.id, "Closed")} style={{ background: "#7f8c8d" }}>
            🔒 Close
          </button>
        )}
      </div>
    </div>
  );
}

function OrderComplaints() {
  const [orderId, setOrderId]       = useState("");
  const [complaints, setComplaints] = useState([]);
  const [searched, setSearched]     = useState(false);
  const [error, setError]           = useState("");

  const fetchComplaints = async () => {
    if (!orderId) { alert("Enter Order ID"); return; }
    setError("");
    try {
      const res  = await axios.get(`${API_BASE}/complaints/order/${orderId}`);
      const data = res.data;
      setComplaints(Array.isArray(data) ? data : data.complaints || []);
      setSearched(true);
    } catch (err) {
      console.error(err);
      setError("Error fetching complaints. Please check the Order ID and try again.");
      setComplaints([]);
      setSearched(true);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await axios.put(`${API_BASE}/complaints/${id}/status?status=${status}`);
      fetchComplaints();
    } catch (err) {
      console.error(err);
      alert("Error updating status");
    }
  };

  return (
    <div className="fade-in">
      <div className="breadcrumb">Dashboard &gt; Order Complaints</div>
      <div className="page-header">
        <h2>Order Complaints</h2>
        <p>View and manage all complaints linked to a specific order</p>
      </div>

      <div className="content-box">
        <label>Order ID</label>
        <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
          <input
            type="number" value={orderId}
            onChange={e => setOrderId(e.target.value)}
            onKeyDown={e => e.key === "Enter" && fetchComplaints()}
            placeholder="Enter your order ID" style={{ flex: 1 }}
          />
          <button onClick={fetchComplaints} style={{ padding: "10px 24px", borderRadius: "8px" }}>
            Search
          </button>
        </div>
      </div>

      {error && <div className="alert-error" style={{ width: "70%", minWidth: "600px" }}>⚠️ {error}</div>}

      <div style={{ marginTop: "24px", width: "70%", minWidth: "600px" }}>
        {searched && !error && (
          <div className="summary-row">
            <span>
              {complaints.length === 0
                ? "No complaints found for this order."
                : `${complaints.length} complaint${complaints.length !== 1 ? "s" : ""} found for Order #${orderId}`}
            </span>
            {complaints.length >= 5 && (
              <span className="badge" style={{ background: "#fff0f0", color: "#c0392b", border: "1px solid #ffcccc" }}>
                ⚠️ Complaint limit reached
              </span>
            )}
          </div>
        )}
        {complaints.map(c => (
          <ComplaintCard key={c.id} c={c} onUpdateStatus={updateStatus} />
        ))}
      </div>
    </div>
  );
}

export default OrderComplaints;
