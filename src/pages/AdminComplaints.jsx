import { useState, useEffect } from "react";
import axios from "axios";

const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:8081/api";
const getAuthHeader = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
});

const STATUS_STEPS = ["Submitted", "Under Review", "In Progress", "Resolved", "Closed"];
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

function Badge({ text, colorMap }) {
  const s = colorMap[text] || { bg:"#f3f4f6", color:"#374151", border:"#e5e7eb" };
  return (
    <span style={{ fontSize:"12px", fontWeight:600, padding:"4px 12px", borderRadius:20, background:s.bg, color:s.color, border:`1px solid ${s.border}`, whiteSpace:"nowrap" }}>
      {text}
    </span>
  );
}

function ComplaintRow({ c, onStatusChange }) {
  const [expanded, setExpanded] = useState(false);
  const nextStatus = STATUS_STEPS[STATUS_STEPS.indexOf(c.status) + 1];
  const product    = getProductInfo(c.productId);
  const catStyle   = PRODUCT_CAT_COLORS[product.category] || { bg:"#f8fafc", color:"#475569", border:"#e2e8f0" };

  return (
    <div style={{ background:"#fff", borderRadius:"12px", border:"1px solid #e2e8f0", marginBottom:10, overflow:"hidden", boxShadow:"0 1px 4px rgba(0,0,0,.04)" }}>
      <div style={{ display:"grid", gridTemplateColumns:"2fr 2fr 120px 160px 200px 40px", alignItems:"center", padding:"16px 20px", gap:12, cursor:"pointer" }}
        onClick={() => setExpanded(e => !e)}>

        <div>
          <div style={{ fontFamily:"monospace", fontSize:13, color:"#2563eb", fontWeight:700 }}>
            {c.trackingNumber || <span style={{ color:"#94a3b8", fontFamily:"sans-serif", fontSize:12 }}>No tracking #</span>}
          </div>
          <div style={{ fontSize:12, color:"#94a3b8", marginTop:2 }}>Order #{c.orderId} · ID #{c.id}</div>
        </div>

        <div>
          <div style={{ fontSize:13, fontWeight:600, color:"#1e293b" }}>{c.category || "—"}</div>
          <div style={{ fontSize:12, color:"#94a3b8", marginTop:2 }}>{new Date(c.createdAt).toLocaleDateString("en-IN", { day:"2-digit", month:"short", year:"numeric" })}</div>
        </div>

        <div><Badge text={c.priority || "Low"} colorMap={PRIORITY_COLORS} /></div>
        <div><Badge text={c.status  || "Submitted"} colorMap={STATUS_COLORS} /></div>

        <div style={{ display:"flex", gap:6 }}>
          {nextStatus && (
            <button onClick={e => { e.stopPropagation(); onStatusChange(c.id, nextStatus); }}
              style={{ padding:"6px 14px", borderRadius:8, border:"none", cursor:"pointer", fontSize:12, fontWeight:600, background:"#2563eb", color:"#fff", whiteSpace:"nowrap" }}>
              → {nextStatus}
            </button>
          )}
          {!nextStatus && <span style={{ fontSize:12, color:"#10b981", fontWeight:600 }}>✓ Closed</span>}
        </div>

        <div style={{ color:"#94a3b8", fontSize:14, textAlign:"center" }}>{expanded ? "▲" : "▼"}</div>
      </div>

      {expanded && (
        <div style={{ padding:"0 20px 20px", borderTop:"1px solid #f1f5f9" }}>

          {/* Product banner */}
          <div style={{ marginTop:16, padding:"10px 14px", borderRadius:"10px", background:catStyle.bg, border:`1px solid ${catStyle.border}`, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <div style={{ fontSize:13, fontWeight:700, color:"#1e293b" }}>{product.name}</div>
            <span style={{ fontSize:11, fontWeight:700, padding:"3px 10px", borderRadius:"20px", background:"#fff", color:catStyle.color, border:`1px solid ${catStyle.border}` }}>
              {product.category}
            </span>
          </div>

          {/* Complaint text */}
          <div style={{ marginTop:12, padding:"14px", background:"#f8fafc", borderRadius:10, fontSize:14, color:"#374151", lineHeight:"1.6" }}>
            <strong>Complaint:</strong> {c.originalText}
          </div>
          {c.translatedText && c.translatedText !== c.originalText && (
            <div style={{ marginTop:8, padding:"14px", background:"#f0f9ff", borderRadius:10, fontSize:14, color:"#374151" }}>
              <strong>Translated:</strong> {c.translatedText}
            </div>
          )}

          {/* Meta info */}
          <div style={{ display:"flex", gap:16, marginTop:12, flexWrap:"wrap" }}>
            <span style={{ fontSize:13, color:"#64748b" }}><strong>Language:</strong> {c.detectedLanguage}</span>
            <span style={{ fontSize:13, color:"#64748b" }}><strong>User ID:</strong> {c.userId}</span>
            <span style={{ fontSize:13, color:"#64748b" }}><strong>Updated:</strong> {new Date(c.updatedAt).toLocaleString("en-IN")}</span>
          </div>

          {c.attachmentPath && (
            <a href={`${API_BASE}/complaints/uploads/${c.attachmentPath.split("/").pop()}`}
              target="_blank" rel="noreferrer"
              style={{ display:"inline-block", marginTop:10, color:"#2563eb", fontSize:13, fontWeight:600 }}>
              📎 View Attachment
            </a>
          )}

          {/* Override buttons */}
          <div style={{ marginTop:16, display:"flex", gap:8, flexWrap:"wrap", alignItems:"center" }}>
            <span style={{ fontSize:12, color:"#94a3b8" }}>Override status:</span>
            {STATUS_STEPS.filter(s => s !== c.status).map(s => (
              <button key={s} onClick={() => onStatusChange(c.id, s)}
                style={{ padding:"5px 12px", borderRadius:8, border:`1px solid ${STATUS_COLORS[s]?.border||"#e2e8f0"}`, cursor:"pointer", fontSize:12, fontWeight:600, background:STATUS_COLORS[s]?.bg||"#f9fafb", color:STATUS_COLORS[s]?.color||"#374151" }}>
                {s}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminComplaints() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [filterStatus,   setFilterStatus]   = useState("All");
  const [filterPriority, setFilterPriority] = useState("All");
  const [filterCategory, setFilterCategory] = useState("All");
  const [search, setSearch] = useState("");

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

  const categories = ["All", ...new Set(complaints.map(c => c.category).filter(Boolean))];
  const filtered = complaints.filter(c => {
    if (filterStatus   !== "All" && c.status   !== filterStatus)   return false;
    if (filterPriority !== "All" && c.priority !== filterPriority) return false;
    if (filterCategory !== "All" && c.category !== filterCategory) return false;
    if (search && !c.trackingNumber?.toLowerCase().includes(search.toLowerCase()) &&
        !String(c.orderId).includes(search)) return false;
    return true;
  });

  const sel = (val, set, options) => (
    <select value={val} onChange={e => set(e.target.value)}
      style={{ padding:"8px 12px", borderRadius:8, border:"1.5px solid #e2e8f0", fontSize:13, color:"#374151", background:"#fff", cursor:"pointer" }}>
      {options.map(o => <option key={o}>{o}</option>)}
    </select>
  );

  const counts = {};
  STATUS_STEPS.forEach(s => { counts[s] = complaints.filter(c => c.status === s).length; });

  return (
    <div style={{ padding:"8px 0" }}>
      <div style={{ fontSize:12, color:"#94a3b8", marginBottom:8 }}>Dashboard › All Complaints</div>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
        <div>
          <h2 style={{ margin:"0 0 4px", color:"#0f172a", fontSize:22, fontWeight:800 }}>All Complaints</h2>
          <p style={{ margin:0, color:"#64748b", fontSize:14 }}>{filtered.length} of {complaints.length} complaints</p>
        </div>
        <button onClick={fetchAll} style={{ padding:"9px 18px", borderRadius:10, background:"#2563eb", color:"#fff", border:"none", fontWeight:600, cursor:"pointer", fontSize:13 }}>
          ↻ Refresh
        </button>
      </div>

      {/* Status summary pills */}
      <div style={{ display:"flex", gap:8, marginBottom:16, flexWrap:"wrap" }}>
        {STATUS_STEPS.map(s => (
          <div key={s} onClick={() => setFilterStatus(filterStatus === s ? "All" : s)}
            style={{ padding:"6px 14px", borderRadius:20, border:`1px solid ${STATUS_COLORS[s].border}`, background:STATUS_COLORS[s].bg, color:STATUS_COLORS[s].color, fontSize:12, fontWeight:600, cursor:"pointer", opacity: filterStatus !== "All" && filterStatus !== s ? 0.4 : 1 }}>
            {s} ({counts[s] || 0})
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display:"flex", gap:10, marginBottom:16, flexWrap:"wrap", background:"#fff", padding:"14px 16px", borderRadius:12, border:"1px solid #e2e8f0" }}>
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search by tracking # or order ID..."
          style={{ flex:1, minWidth:200, padding:"8px 12px", borderRadius:8, border:"1.5px solid #e2e8f0", fontSize:13, outline:"none" }} />
        {sel(filterStatus,   setFilterStatus,   ["All", ...STATUS_STEPS])}
        {sel(filterPriority, setFilterPriority, ["All", "High", "Medium", "Low"])}
        {sel(filterCategory, setFilterCategory, categories)}
        {(filterStatus !== "All" || filterPriority !== "All" || filterCategory !== "All" || search) && (
          <button onClick={() => { setFilterStatus("All"); setFilterPriority("All"); setFilterCategory("All"); setSearch(""); }}
            style={{ padding:"8px 14px", borderRadius:8, border:"1px solid #e2e8f0", background:"#f9fafb", color:"#6b7280", cursor:"pointer", fontSize:13, fontWeight:600 }}>
            ✕ Clear
          </button>
        )}
      </div>

      {/* Column headers */}
      <div style={{ display:"grid", gridTemplateColumns:"2fr 2fr 120px 160px 200px 40px", padding:"8px 20px", fontSize:11, fontWeight:700, color:"#94a3b8", textTransform:"uppercase", letterSpacing:"0.06em", gap:12 }}>
        <div>Tracking / Order</div>
        <div>Category / Date</div>
        <div>Priority</div>
        <div>Status</div>
        <div>Action</div>
        <div></div>
      </div>

      {loading
        ? <div style={{ textAlign:"center", padding:"60px", color:"#94a3b8" }}>Loading complaints…</div>
        : filtered.length === 0
        ? <div style={{ textAlign:"center", padding:"60px", color:"#94a3b8" }}>No complaints match the filters.</div>
        : filtered.map(c => <ComplaintRow key={c.id} c={c} onStatusChange={updateStatus} />)
      }
    </div>
  );
}
