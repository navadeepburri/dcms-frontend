import { useState, useEffect } from "react";
import axios from "axios";

const API_BASE = "http://localhost:8081/api";
const getAuthHeader = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
});

const STATUS_STEPS = ["Submitted", "Under Review", "In Progress", "Resolved"];
const STATUS_COLORS = {
  "Submitted":    { bg:"#fffbeb", color:"#d97706", border:"#fde68a" },
  "Under Review": { bg:"#f5f3ff", color:"#7c3aed", border:"#ddd6fe" },
  "In Progress":  { bg:"#eff6ff", color:"#2563eb", border:"#bfdbfe" },
  "Resolved":     { bg:"#f0fdf4", color:"#16a34a", border:"#bbf7d0" },
  "Closed":       { bg:"#f9fafb", color:"#6b7280", border:"#e5e7eb" },
};
const PRIORITY_COLORS = {
  "High":   { bg:"#fef2f2", color:"#dc2626", border:"#fecaca" },
  "Medium": { bg:"#fffbeb", color:"#d97706", border:"#fde68a" },
  "Low":    { bg:"#f0fdf4", color:"#16a34a", border:"#bbf7d0" },
};
const PRODUCT_CAT_COLORS = {
  "Electronics":     { bg:"#eff6ff", color:"#2563eb", border:"#bfdbfe" },
  "Fashion":         { bg:"#fdf4ff", color:"#9333ea", border:"#e9d5ff" },
  "Home Appliances": { bg:"#f0fdf4", color:"#16a34a", border:"#bbf7d0" },
  "Beauty":          { bg:"#fff1f2", color:"#e11d48", border:"#fecdd3" },
  "Books":           { bg:"#fffbeb", color:"#d97706", border:"#fde68a" },
};

function getProductInfo(productId) {
  const map = {
    1:  { name:"Wireless Headphones", category:"Electronics"     },
    2:  { name:"Smart Watch",         category:"Electronics"     },
    3:  { name:"Bluetooth Speaker",   category:"Electronics"     },
    4:  { name:"Laptop",              category:"Electronics"     },
    5:  { name:"Mobile Phone",        category:"Electronics"     },
    6:  { name:"Running Shoes",       category:"Fashion"         },
    7:  { name:"Cotton T-Shirt",      category:"Fashion"         },
    8:  { name:"Denim Jeans",         category:"Fashion"         },
    9:  { name:"Mixer Grinder",       category:"Home Appliances" },
    10: { name:"Air Fryer",           category:"Home Appliances" },
  };
  return map[productId] || { name:"—", category:"—" };
}

function TrackingTimeline({ status }) {
  const currentIndex = STATUS_STEPS.findIndex(s => s.toLowerCase().trim() === (status||"").toLowerCase().trim());
  return (
    <div style={{ display:"flex", alignItems:"flex-start", margin:"16px 0 8px" }}>
      {STATUS_STEPS.map((step, i) => {
        const isDone    = i < currentIndex;
        const isCurrent = i === currentIndex;
        return (
          <div key={step} style={{ display:"flex", alignItems:"flex-start", flex: i < STATUS_STEPS.length - 1 ? 1 : "none" }}>
            <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:"6px" }}>
              <div style={{
                width:"28px", height:"28px", borderRadius:"50%", flexShrink:0,
                display:"flex", alignItems:"center", justifyContent:"center", fontSize:"12px", fontWeight:700,
                background: isDone ? "#10b981" : isCurrent ? "#3b82f6" : "#e2e8f0",
                color: isDone || isCurrent ? "#fff" : "#94a3b8",
                boxShadow: isCurrent ? "0 0 0 3px rgba(59,130,246,0.2)" : "none",
              }}>
                {isDone ? "✓" : i + 1}
              </div>
              <span style={{ fontSize:"10px", textAlign:"center", fontWeight: isCurrent ? 700 : 500, color: isDone ? "#10b981" : isCurrent ? "#3b82f6" : "#94a3b8", maxWidth:"60px", lineHeight:"1.3" }}>
                {step}
              </span>
            </div>
            {i < STATUS_STEPS.length - 1 && (
              <div style={{ flex:1, height:"3px", marginTop:"12px", margin:"12px 4px 0", background: isDone ? "#10b981" : "#e2e8f0", borderRadius:"2px" }} />
            )}
          </div>
        );
      })}
    </div>
  );
}

function ComplaintCard({ c, onUpdateStatus }) {
  const statusStyle   = STATUS_COLORS[c.status]    || STATUS_COLORS["Submitted"];
  const priorityStyle = PRIORITY_COLORS[c.priority] || PRIORITY_COLORS["Low"];
  const nextStatus    = STATUS_STEPS[STATUS_STEPS.indexOf(c.status) + 1];
  const product       = getProductInfo(c.productId);
  const catStyle      = PRODUCT_CAT_COLORS[product.category] || { bg:"#f8fafc", color:"#475569", border:"#e2e8f0" };

  return (
    <div style={{ background:"#fff", borderRadius:"14px", padding:"22px", border:"1px solid #e2e8f0", marginBottom:"14px", boxShadow:"0 2px 8px rgba(0,0,0,0.05)" }}>
      {/* Header */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
        <div>
          <span style={{ fontFamily:"monospace", fontSize:"14px", color:"#2563eb", fontWeight:700 }}>{c.trackingNumber}</span>
          <span style={{ color:"#cbd5e1", margin:"0 8px" }}>·</span>
          <span style={{ fontSize:"13px", color:"#94a3b8" }}>Order #{c.orderId}</span>
        </div>
        <div style={{ display:"flex", gap:"8px" }}>
          <span style={{ fontSize:"12px", fontWeight:600, padding:"3px 10px", borderRadius:"20px", background:priorityStyle.bg, color:priorityStyle.color, border:`1px solid ${priorityStyle.border}` }}>{c.priority}</span>
          <span style={{ fontSize:"12px", fontWeight:600, padding:"3px 10px", borderRadius:"20px", background:statusStyle.bg, color:statusStyle.color, border:`1px solid ${statusStyle.border}` }}>{c.status}</span>
        </div>
      </div>

      {/* Product info banner */}
      <div style={{ marginTop:"12px", padding:"10px 14px", borderRadius:"10px", background:catStyle.bg, border:`1px solid ${catStyle.border}`, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
        <div style={{ fontSize:"13px", fontWeight:700, color:"#1e293b" }}>{product.name}</div>
        <span style={{ fontSize:"11px", fontWeight:700, padding:"3px 10px", borderRadius:"20px", background:"#fff", color:catStyle.color, border:`1px solid ${catStyle.border}` }}>
          {product.category}
        </span>
      </div>

      <TrackingTimeline status={c.status} />

      {/* Complaint text */}
      <div style={{ marginTop:"12px", padding:"12px 14px", background:"#f8fafc", borderRadius:"10px", fontSize:"14px", color:"#374151", lineHeight:"1.6" }}>
        {c.originalText}
      </div>

      {/* Details */}
      <div style={{ display:"flex", gap:"16px", marginTop:"12px", flexWrap:"wrap" }}>
        <span style={{ fontSize:"13px", color:"#64748b" }}><strong>Issue Type:</strong> {c.category}</span>
        <span style={{ fontSize:"13px", color:"#64748b" }}><strong>Language:</strong> {c.detectedLanguage}</span>
        <span style={{ fontSize:"13px", color:"#64748b" }}><strong>Submitted:</strong> {new Date(c.createdAt).toLocaleString("en-IN")}</span>
      </div>

      {c.attachmentPath && (
        <a href={`${API_BASE}/complaints/uploads/${c.attachmentPath.split("/").pop()}`}
          target="_blank" rel="noreferrer"
          style={{ display:"inline-block", marginTop:"10px", color:"#2563eb", fontSize:"13px", fontWeight:600, textDecoration:"none" }}>
          📎 View Attachment
        </a>
      )}

      {/* Action buttons */}
      {c.status !== "Resolved" && c.status !== "Closed" && (
        <div style={{ display:"flex", gap:"10px", marginTop:"16px", flexWrap:"wrap" }}>
          {nextStatus && (
            <button onClick={() => onUpdateStatus(c.id, nextStatus)}
              style={{ padding:"8px 18px", borderRadius:"8px", border:"none", cursor:"pointer", fontSize:"13px", fontWeight:600, background:"#2563eb", color:"#fff" }}>
              → Move to {nextStatus}
            </button>
          )}
          <button onClick={() => onUpdateStatus(c.id, "Resolved")}
            style={{ padding:"8px 18px", borderRadius:"8px", border:"none", cursor:"pointer", fontSize:"13px", fontWeight:600, background:"#dcfce7", color:"#15803d" }}>
            ✅ Mark Resolved
          </button>
        </div>
      )}
      {(c.status === "Resolved" || c.status === "Closed") && (
        <div style={{ marginTop:"14px", fontSize:"13px", color:"#16a34a", fontWeight:600 }}>✅ Complaint {c.status.toLowerCase()}.</div>
      )}
    </div>
  );
}

export default function StaffDashboard() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [filter, setFilter]         = useState("Active");

  const fetchAll = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/complaints/all`, getAuthHeader());
      setComplaints(Array.isArray(res.data) ? res.data : []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchAll(); }, []);

  const updateStatus = async (id, status) => {
    try {
      await axios.put(`${API_BASE}/complaints/${id}/status?status=${status}`, null, getAuthHeader());
      fetchAll();
    } catch (e) { alert(e.response?.data?.error || "Error updating status"); }
  };

  const activeStatuses = ["Submitted", "Under Review", "In Progress"];
  const filtered = filter === "Active" ? complaints.filter(c => activeStatuses.includes(c.status))
    : filter === "Resolved" ? complaints.filter(c => c.status === "Resolved" || c.status === "Closed")
    : complaints;

  const counts = {
    Active:   complaints.filter(c => activeStatuses.includes(c.status)).length,
    Resolved: complaints.filter(c => c.status === "Resolved" || c.status === "Closed").length,
    All:      complaints.length,
  };

  return (
    <div style={{ padding:"8px 0" }}>
      <div style={{ fontSize:"12px", color:"#94a3b8", marginBottom:"8px" }}>Dashboard › Complaint Queue</div>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"24px" }}>
        <div>
          <h2 style={{ margin:"0 0 4px", color:"#0f172a", fontSize:"22px", fontWeight:800 }}>Complaint Queue</h2>
          <p style={{ margin:0, color:"#64748b", fontSize:"14px" }}>Review and update complaint statuses</p>
        </div>
        <button onClick={fetchAll} style={{ padding:"9px 18px", borderRadius:"10px", background:"#2563eb", color:"#fff", border:"none", fontWeight:600, cursor:"pointer", fontSize:"13px" }}>↻ Refresh</button>
      </div>
      <div style={{ display:"flex", gap:"8px", marginBottom:"20px" }}>
        {["Active", "Resolved", "All"].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            style={{ padding:"8px 20px", borderRadius:"8px", border:"none", cursor:"pointer", fontSize:"13px", fontWeight:600, background: filter === f ? "#2563eb" : "#f1f5f9", color: filter === f ? "#fff" : "#475569" }}>
            {f} ({counts[f]})
          </button>
        ))}
      </div>
      {loading ? <div style={{ textAlign:"center", padding:"60px", color:"#94a3b8" }}>Loading…</div>
        : filtered.length === 0 ? <div style={{ textAlign:"center", padding:"60px", color:"#94a3b8" }}>No complaints in this queue.</div>
        : <div style={{ maxWidth:"760px" }}>{filtered.map(c => <ComplaintCard key={c.id} c={c} onUpdateStatus={updateStatus} />)}</div>}
    </div>
  );
}