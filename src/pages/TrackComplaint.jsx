import { useState } from "react";
import axios from "axios";

const API_BASE = "http://localhost:8081/api";
const getAuthHeader = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
});

const STATUS_STEPS = ["Submitted", "Under Review", "In Progress", "Resolved", "Closed"];

const STATUS_META = {
  "Submitted":    { color:"#f59e0b", bg:"#fffbeb", border:"#fde68a", icon:"📝" },
  "Under Review": { color:"#8b5cf6", bg:"#f5f3ff", border:"#ddd6fe", icon:"🔍" },
  "In Progress":  { color:"#3b82f6", bg:"#eff6ff", border:"#bfdbfe", icon:"🔄" },
  "Resolved":     { color:"#10b981", bg:"#f0fdf4", border:"#bbf7d0", icon:"✅" },
  "Closed":       { color:"#6b7280", bg:"#f9fafb", border:"#e5e7eb", icon:"🔒" },
};

const PRIORITY_META = {
  "High":   { color:"#ef4444", bg:"#fef2f2", border:"#fecaca" },
  "Medium": { color:"#f59e0b", bg:"#fffbeb", border:"#fde68a" },
  "Low":    { color:"#10b981", bg:"#f0fdf4", border:"#bbf7d0" },
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
    <div style={{ padding:"24px", background:"#f8fafc", borderRadius:"14px", border:"1px solid #e2e8f0", margin:"20px 0" }}>
      <div style={{ fontSize:"11px", fontWeight:700, color:"#94a3b8", marginBottom:"24px", textTransform:"uppercase", letterSpacing:"0.08em" }}>
        Complaint Progress
      </div>
      <div style={{ display:"flex", alignItems:"flex-start" }}>
        {STATUS_STEPS.map((step, i) => {
          const isDone    = i < currentIndex;
          const isCurrent = i === currentIndex;
          const meta      = STATUS_META[step];
          return (
            <div key={step} style={{ display:"flex", alignItems:"flex-start", flex: i < STATUS_STEPS.length - 1 ? 1 : "none" }}>
              <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:"10px" }}>
                <div style={{
                  width:"36px", height:"36px", borderRadius:"50%", flexShrink:0,
                  display:"flex", alignItems:"center", justifyContent:"center", fontSize:"15px",
                  background: isDone ? "#10b981" : isCurrent ? meta.bg : "#f1f5f9",
                  border: isDone ? "2px solid #10b981" : isCurrent ? `2px solid ${meta.color}` : "2px solid #e2e8f0",
                  boxShadow: isCurrent ? `0 0 0 4px ${meta.bg}` : "none",
                }}>
                  {isDone ? "✓" : isCurrent ? meta.icon : "○"}
                </div>
                <span style={{
                  fontSize:"11px", textAlign:"center", lineHeight:"1.3",
                  fontWeight: isCurrent ? 700 : 500,
                  color: isDone ? "#10b981" : isCurrent ? meta.color : "#94a3b8",
                  maxWidth:"70px",
                }}>
                  {step}
                </span>
              </div>
              {i < STATUS_STEPS.length - 1 && (
                <div style={{ flex:1, height:"3px", marginTop:"16px", margin:"16px 6px 0", background: isDone ? "#10b981" : "#e2e8f0", borderRadius:"2px" }} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ComplaintCard({ c }) {
  const statusMeta   = STATUS_META[c.status]    || STATUS_META["Submitted"];
  const priorityMeta = PRIORITY_META[c.priority] || PRIORITY_META["Low"];
  const product      = getProductInfo(c.productId);
  const catStyle     = PRODUCT_CAT_COLORS[product.category] || { bg:"#f8fafc", color:"#475569", border:"#e2e8f0" };

  return (
    <div style={{ background:"#fff", borderRadius:"16px", padding:"24px", border:"1px solid #e2e8f0", marginBottom:"20px", boxShadow:"0 2px 12px rgba(0,0,0,0.06)" }}>
      {/* Header */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
        <div>
          <div style={{ fontFamily:"monospace", fontSize:"15px", color:"#2563eb", fontWeight:700, marginBottom:"4px" }}>{c.trackingNumber}</div>
          <div style={{ fontSize:"13px", color:"#94a3b8" }}>Complaint ID #{c.id} · Order #{c.orderId}</div>
        </div>
        <div style={{ display:"flex", gap:"8px", flexDirection:"column", alignItems:"flex-end" }}>
          <span style={{ fontSize:"12px", fontWeight:700, padding:"4px 12px", borderRadius:"20px", background:priorityMeta.bg, color:priorityMeta.color, border:`1px solid ${priorityMeta.border}` }}>
            {c.priority} Priority
          </span>
          <span style={{ fontSize:"12px", fontWeight:700, padding:"4px 12px", borderRadius:"20px", background:statusMeta.bg, color:statusMeta.color, border:`1px solid ${statusMeta.border}` }}>
            {statusMeta.icon} {c.status}
          </span>
        </div>
      </div>

      {/* Product info banner */}
      <div style={{ marginTop:"16px", padding:"12px 16px", borderRadius:"10px", background:catStyle.bg, border:`1px solid ${catStyle.border}`, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
        <div>
          <div style={{ fontSize:"13px", fontWeight:700, color:"#1e293b" }}>{product.name}</div>
          <div style={{ fontSize:"11px", color:"#64748b", marginTop:"2px" }}>Product ordered</div>
        </div>
        <span style={{ fontSize:"12px", fontWeight:700, padding:"4px 12px", borderRadius:"20px", background:"#fff", color:catStyle.color, border:`1px solid ${catStyle.border}` }}>
          {product.category}
        </span>
      </div>

      {/* Tracking Timeline */}
      <TrackingTimeline status={c.status} />

      {/* Details grid */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"12px", marginTop:"4px" }}>
        {[
          ["Issue Type",       c.category],
          ["Priority",         c.priority],
          ["Submitted",        new Date(c.createdAt).toLocaleString("en-IN")],
          ["Last Updated",     new Date(c.updatedAt).toLocaleString("en-IN")],
          ["Language",         c.detectedLanguage],
          ["Complaint ID",     `#${c.id}`],
        ].map(([label, value]) => (
          <div key={label} style={{ background:"#f8fafc", borderRadius:"10px", padding:"12px 14px" }}>
            <div style={{ fontSize:"11px", fontWeight:700, color:"#94a3b8", textTransform:"uppercase", marginBottom:"4px" }}>{label}</div>
            <div style={{ fontSize:"14px", color:"#1e293b", fontWeight:600 }}>{value}</div>
          </div>
        ))}
      </div>

      {/* Complaint text */}
      <div style={{ marginTop:"16px", padding:"14px 16px", background:"#fafafa", borderRadius:"10px", border:"1px solid #f1f5f9" }}>
        <div style={{ fontSize:"11px", fontWeight:700, color:"#94a3b8", textTransform:"uppercase", marginBottom:"6px" }}>Your Complaint</div>
        <div style={{ fontSize:"14px", color:"#374151", lineHeight:"1.6" }}>{c.originalText}</div>
        {c.translatedText && c.translatedText !== c.originalText && (
          <div style={{ marginTop:"8px", paddingTop:"8px", borderTop:"1px solid #e5e7eb" }}>
            <div style={{ fontSize:"11px", fontWeight:700, color:"#94a3b8", textTransform:"uppercase", marginBottom:"4px" }}>Translated</div>
            <div style={{ fontSize:"14px", color:"#374151" }}>{c.translatedText}</div>
          </div>
        )}
      </div>

      {c.attachmentPath && (
        <a href={`${API_BASE}/complaints/uploads/${c.attachmentPath.split("/").pop()}`}
          target="_blank" rel="noreferrer"
          style={{ display:"inline-block", marginTop:"12px", color:"#2563eb", fontSize:"13px", fontWeight:600, textDecoration:"none" }}>
          📎 View Attachment
        </a>
      )}

      {c.status === "Resolved" && (
        <div style={{ marginTop:"16px", padding:"12px 16px", background:"#f0fdf4", borderRadius:"10px", border:"1px solid #bbf7d0", color:"#15803d", fontSize:"13px", fontWeight:600 }}>
          ✅ Your complaint has been resolved. Contact support if the issue persists.
        </div>
      )}
      {c.status === "Closed" && (
        <div style={{ marginTop:"16px", padding:"12px 16px", background:"#f9fafb", borderRadius:"10px", border:"1px solid #e5e7eb", color:"#6b7280", fontSize:"13px", fontWeight:600 }}>
          🔒 This complaint is closed.
        </div>
      )}
    </div>
  );
}

export default function TrackComplaint() {
  const [orderId, setOrderId]       = useState("");
  const [complaints, setComplaints] = useState([]);
  const [searched, setSearched]     = useState(false);
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState("");

  const fetchComplaints = async () => {
    if (!orderId.trim()) { alert("Enter Order ID"); return; }
    setError(""); setSearched(false); setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/complaints/order/${orderId}`, getAuthHeader());
      setComplaints(Array.isArray(res.data) ? res.data : res.data.complaints || []);
      setSearched(true);
    } catch (err) {
      setError(err.response?.data?.error || "Could not fetch complaints. Please check the Order ID.");
      setComplaints([]); setSearched(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding:"8px 0" }}>
      <div style={{ fontSize:"12px", color:"#94a3b8", marginBottom:"8px" }}>Dashboard › Track Complaint</div>
      <div style={{ marginBottom:"28px" }}>
        <h2 style={{ margin:"0 0 4px", color:"#0f172a", fontSize:"22px", fontWeight:800 }}>Track Your Complaint</h2>
        <p style={{ margin:0, color:"#64748b", fontSize:"14px" }}>Enter your Order ID to see all complaints and their current status</p>
      </div>

      <div style={{ background:"#fff", padding:"24px", borderRadius:"16px", border:"1px solid #e2e8f0", maxWidth:"540px", marginBottom:"28px", boxShadow:"0 2px 8px rgba(0,0,0,0.04)" }}>
        <label style={{ fontWeight:700, color:"#374151", fontSize:"14px", display:"block", marginBottom:"10px" }}>Order ID</label>
        <div style={{ display:"flex", gap:"10px" }}>
          <input type="number" value={orderId} onChange={e => setOrderId(e.target.value)}
            onKeyDown={e => e.key === "Enter" && fetchComplaints()} placeholder="e.g. 3"
            style={{ flex:1, padding:"11px 14px", borderRadius:"10px", border:"1.5px solid #e2e8f0", fontSize:"15px", outline:"none" }} />
          <button onClick={fetchComplaints} disabled={loading}
            style={{ padding:"11px 28px", borderRadius:"10px", background:"#2563eb", color:"#fff", border:"none", fontWeight:700, cursor:"pointer", fontSize:"14px", opacity: loading ? 0.7 : 1 }}>
            {loading ? "..." : "Track"}
          </button>
        </div>
      </div>

      {error && (
        <div style={{ background:"#fef2f2", border:"1px solid #fecaca", color:"#dc2626", padding:"12px 16px", borderRadius:"10px", marginBottom:"20px", maxWidth:"540px", fontSize:"14px" }}>
          ⚠️ {error}
        </div>
      )}
      {searched && !error && (
        <div style={{ marginBottom:"20px", color:"#475569", fontSize:"14px", fontWeight:600 }}>
          {complaints.length === 0
            ? `No complaints found for Order #${orderId}.`
            : `${complaints.length} complaint${complaints.length !== 1 ? "s" : ""} found for Order #${orderId}`}
        </div>
      )}
      <div style={{ maxWidth:"760px" }}>
        {complaints.map(c => <ComplaintCard key={c.id} c={c} />)}
      </div>
    </div>
  );
}