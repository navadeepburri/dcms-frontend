import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import axios from "axios";

const API_BASE = "http://localhost:8081/api";
const getAuthHeader = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
});

const STATUS_STEPS = ["Submitted", "Under Review", "In Progress", "Resolved", "Closed"];

const STATUS_COLORS = {
  "Submitted":    { bg: "#fff7ed", color: "#c2410c", border: "#fed7aa" },
  "Under Review": { bg: "#fefce8", color: "#a16207", border: "#fde68a" },
  "In Progress":  { bg: "#eff6ff", color: "#1d4ed8", border: "#bfdbfe" },
  "Resolved":     { bg: "#f0fdf4", color: "#15803d", border: "#bbf7d0" },
  "Closed":       { bg: "#f3f4f6", color: "#4b5563", border: "#d1d5db" },
};

const PRIORITY_COLORS = {
  "High":   { bg: "#fef2f2", color: "#dc2626", border: "#fecaca" },
  "Medium": { bg: "#fffbeb", color: "#d97706", border: "#fde68a" },
  "Low":    { bg: "#f0fdf4", color: "#16a34a", border: "#bbf7d0" },
};

function TrackingTimeline({ status }) {
  const currentIndex = STATUS_STEPS.indexOf(status);
  return (
    <div style={{ margin: "20px 0 8px", padding: "20px 24px", background: "#f8fafc", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
      <div style={{ fontSize: "11px", fontWeight: 700, color: "#94a3b8", marginBottom: "18px", textTransform: "uppercase", letterSpacing: "0.07em" }}>
        Complaint Progress
      </div>
      <div style={{ display: "flex", alignItems: "flex-start" }}>
        {STATUS_STEPS.map((step, i) => {
          const isDone    = i < currentIndex;
          const isCurrent = i === currentIndex;
          return (
            <div key={step} style={{ display: "flex", alignItems: "flex-start", flex: i < STATUS_STEPS.length - 1 ? 1 : "none" }}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
                <div style={{
                  width: "30px", height: "30px", borderRadius: "50%", flexShrink: 0,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "13px", fontWeight: 700,
                  background: isDone ? "#22c55e" : isCurrent ? "#3b82f6" : "#e2e8f0",
                  color: isDone || isCurrent ? "#fff" : "#94a3b8",
                  boxShadow: isCurrent ? "0 0 0 4px rgba(59,130,246,0.15)" : "none",
                }}>
                  {isDone ? "✓" : isCurrent ? "●" : "○"}
                </div>
                <span style={{
                  fontSize: "11px", textAlign: "center",
                  fontWeight: isCurrent ? 700 : 500,
                  color: isDone ? "#22c55e" : isCurrent ? "#3b82f6" : "#94a3b8",
                  maxWidth: "68px", lineHeight: "1.3",
                }}>
                  {step}
                </span>
              </div>
              {i < STATUS_STEPS.length - 1 && (
                <div style={{ flex: 1, height: "3px", marginTop: "13px", margin: "13px 4px 0", background: isDone ? "#22c55e" : "#e2e8f0", borderRadius: "2px" }} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ComplaintCard({ c, onUpdateStatus, isAdmin }) {
  const statusStyle   = STATUS_COLORS[c.status]    || STATUS_COLORS["Submitted"];
  const priorityStyle = PRIORITY_COLORS[c.priority] || PRIORITY_COLORS["Low"];
  return (
    <div style={{ background: "#fff", borderRadius: "14px", padding: "24px", border: "1px solid #e2e8f0", marginBottom: "16px", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "4px" }}>
        <div>
          <span style={{ fontFamily: "monospace", fontSize: "14px", color: "#2563eb", fontWeight: 700 }}>{c.trackingNumber}</span>
          <span style={{ color: "#cbd5e1", margin: "0 8px" }}>·</span>
          <span style={{ fontSize: "13px", color: "#94a3b8" }}>ID #{c.id}</span>
        </div>
        <div style={{ display: "flex", gap: "8px" }}>
          <span style={{ fontSize: "12px", fontWeight: 600, padding: "3px 10px", borderRadius: "20px", background: priorityStyle.bg, color: priorityStyle.color, border: `1px solid ${priorityStyle.border}` }}>{c.priority}</span>
          <span style={{ fontSize: "12px", fontWeight: 600, padding: "3px 10px", borderRadius: "20px", background: statusStyle.bg, color: statusStyle.color, border: `1px solid ${statusStyle.border}` }}>{c.status}</span>
        </div>
      </div>

      <TrackingTimeline status={c.status} />

      <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "16px" }}>
        <div>
          <span style={{ fontWeight: 600, color: "#475569", fontSize: "13px" }}>Complaint: </span>
          <span style={{ color: "#1e293b", fontSize: "14px" }}>{c.originalText}</span>
        </div>
        {c.translatedText && c.translatedText !== c.originalText && (
          <div>
            <span style={{ fontWeight: 600, color: "#475569", fontSize: "13px" }}>Translated: </span>
            <span style={{ color: "#1e293b", fontSize: "14px" }}>{c.translatedText}</span>
          </div>
        )}
        <div style={{ display: "flex", gap: "20px", flexWrap: "wrap", marginTop: "4px" }}>
          {[["Language", c.detectedLanguage], ["Category", c.category], ["Submitted", new Date(c.createdAt).toLocaleString("en-IN")]].map(([label, value]) => (
            <div key={label}>
              <span style={{ fontWeight: 600, color: "#475569", fontSize: "12px" }}>{label}: </span>
              <span style={{ color: "#64748b", fontSize: "13px" }}>{value}</span>
            </div>
          ))}
        </div>
      </div>

      {c.attachmentPath && (
        <div style={{ marginTop: "12px" }}>
          <a href={`${API_BASE}/complaints/uploads/${c.attachmentPath.split("/").pop()}`} target="_blank" rel="noreferrer" style={{ color: "#2563eb", fontSize: "13px", textDecoration: "none" }}>
            📎 View Attachment
          </a>
        </div>
      )}

      <div style={{ display: "flex", gap: "10px", marginTop: "18px", flexWrap: "wrap" }}>
        {isAdmin && (
          <>
            {c.status === "Submitted" && (
              <button onClick={() => onUpdateStatus(c.id, "Under Review")} style={{ padding: "8px 16px", borderRadius: "8px", border: "none", cursor: "pointer", fontSize: "13px", fontWeight: 600, background: "#fef9c3", color: "#a16207" }}>🔍 Mark Under Review</button>
            )}
            {c.status === "Under Review" && (
              <button onClick={() => onUpdateStatus(c.id, "In Progress")} style={{ padding: "8px 16px", borderRadius: "8px", border: "none", cursor: "pointer", fontSize: "13px", fontWeight: 600, background: "#dbeafe", color: "#1d4ed8" }}>🔄 Mark In Progress</button>
            )}
            {c.status === "In Progress" && (
              <button onClick={() => onUpdateStatus(c.id, "Resolved")} style={{ padding: "8px 16px", borderRadius: "8px", border: "none", cursor: "pointer", fontSize: "13px", fontWeight: 600, background: "#dcfce7", color: "#15803d" }}>✅ Mark Resolved</button>
            )}
            {c.status !== "Closed" && c.status !== "Resolved" && (
              <button onClick={() => onUpdateStatus(c.id, "Closed")} style={{ padding: "8px 16px", borderRadius: "8px", border: "none", cursor: "pointer", fontSize: "13px", fontWeight: 600, background: "#f1f5f9", color: "#475569" }}>🔒 Force Close</button>
            )}
          </>
        )}
        {!isAdmin && c.status === "Resolved" && (
          <button onClick={() => onUpdateStatus(c.id, "Closed")} style={{ padding: "8px 16px", borderRadius: "8px", border: "none", cursor: "pointer", fontSize: "13px", fontWeight: 600, background: "#f1f5f9", color: "#475569" }}>🔒 Mark as Closed</button>
        )}
        {!isAdmin && c.status === "Closed" && (
          <span style={{ fontSize: "13px", color: "#22c55e", fontWeight: 600 }}>✅ This complaint is resolved and closed.</span>
        )}
      </div>
    </div>
  );
}

function ComplaintStatus() {
  const { user } = useAuth();
  const [orderId, setOrderId]       = useState("");
  const [complaints, setComplaints] = useState([]);
  const [searched, setSearched]     = useState(false);
  const [error, setError]           = useState("");
  const isAdmin = user?.role === "ROLE_ADMIN" || user?.role === "ROLE_STAFF";

  const fetchComplaints = async () => {
    if (!orderId) { alert("Enter Order ID"); return; }
    setError(""); setSearched(false);
    try {
      const res  = await axios.get(`${API_BASE}/complaints/order/${orderId}`, getAuthHeader());
      const data = res.data;
      setComplaints(Array.isArray(data) ? data : data.complaints || []);
      setSearched(true);
    } catch (err) {
      setError(err.response?.data?.detail || err.response?.data?.error || "Error fetching complaints. Please check the Order ID and try again.");
      setComplaints([]); setSearched(true);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await axios.put(`${API_BASE}/complaints/${id}/status?status=${status}`, null, getAuthHeader());
      fetchComplaints();
    } catch (err) {
      alert(err.response?.data?.error || "Error updating status");
    }
  };

  return (
    <div style={{ padding: "8px 0" }}>
      <div style={{ fontSize: "12px", color: "#94a3b8", marginBottom: "8px" }}>Dashboard › Complaint Status</div>
      <div style={{ marginBottom: "24px" }}>
        <h2 style={{ margin: "0 0 4px", color: "#0f172a", fontSize: "22px", fontWeight: 700 }}>Track Complaint</h2>
        <p style={{ margin: 0, color: "#64748b", fontSize: "14px" }}>Enter your Order ID to view complaint status and progress</p>
      </div>

      <div style={{ background: "#fff", padding: "24px", borderRadius: "14px", border: "1px solid #e2e8f0", maxWidth: "520px", marginBottom: "24px" }}>
        <label style={{ fontWeight: 600, color: "#374151", fontSize: "14px" }}>Order ID</label>
        <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
          <input type="number" value={orderId} onChange={e => setOrderId(e.target.value)} onKeyDown={e => e.key === "Enter" && fetchComplaints()} placeholder="e.g. 45678"
            style={{ flex: 1, padding: "10px 14px", borderRadius: "8px", border: "1.5px solid #e2e8f0", fontSize: "15px", outline: "none" }} />
          <button onClick={fetchComplaints} style={{ padding: "10px 24px", borderRadius: "8px", background: "#2563eb", color: "#fff", border: "none", fontWeight: 600, cursor: "pointer", fontSize: "14px" }}>
            Track
          </button>
        </div>
      </div>

      {error && (
        <div style={{ background: "#fef2f2", border: "1px solid #fecaca", color: "#dc2626", padding: "12px 16px", borderRadius: "10px", marginBottom: "16px", maxWidth: "520px" }}>
          ⚠️ {error}
        </div>
      )}

      {searched && !error && (
        <div style={{ marginBottom: "16px", color: "#475569", fontSize: "14px", fontWeight: 500 }}>
          {complaints.length === 0 ? "No complaints found for this order."
            : `${complaints.length} complaint${complaints.length !== 1 ? "s" : ""} found for Order #${orderId}`}
          {complaints.length >= 5 && (
            <span style={{ marginLeft: "10px", background: "#fef2f2", color: "#dc2626", border: "1px solid #fecaca", borderRadius: "20px", fontSize: "12px", padding: "2px 10px", fontWeight: 600 }}>
              ⚠️ Complaint limit reached
            </span>
          )}
        </div>
      )}

      <div style={{ maxWidth: "760px" }}>
        {complaints.map(c => <ComplaintCard key={c.id} c={c} onUpdateStatus={updateStatus} isAdmin={isAdmin} />)}
      </div>
    </div>
  );
}

export default ComplaintStatus;