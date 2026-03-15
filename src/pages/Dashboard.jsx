import { useState, useEffect } from "react";
import axios from "axios";
import {
  BarChart, Bar, PieChart, Pie, Cell,
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer
} from "recharts";

const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:8081/api";
const getAuthHeader = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
});

const CATEGORY_COLORS  = ["#6366f1","#f59e0b","#10b981","#ef4444","#8b5cf6","#06b6d4"];
const PRIORITY_COLORS  = { High:"#ef4444", Medium:"#f59e0b", Low:"#10b981" };
const PRODUCT_COLORS   = { Electronics:"#6366f1", Fashion:"#f59e0b", "Home Appliances":"#10b981", Beauty:"#ec4899", Books:"#06b6d4" };
const STATUS_COLORS    = {
  "Submitted":    "#f59e0b",
  "Under Review": "#8b5cf6",
  "In Progress":  "#3b82f6",
  "Resolved":     "#10b981",
  "Closed":       "#6b7280",
};
const LANGUAGE_COLORS  = ["#6366f1","#f59e0b","#10b981","#ef4444","#8b5cf6","#06b6d4","#ec4899","#14b8a6","#f97316"];

function StatCard({ label, value, color, icon }) {
  return (
    <div style={{
      background:"#fff", borderRadius:14, padding:"20px 24px",
      boxShadow:"0 1px 4px rgba(0,0,0,.06),0 4px 16px rgba(0,0,0,.04)",
      borderLeft:`4px solid ${color}`, display:"flex", flexDirection:"column", gap:6,
    }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
        <span style={{ fontSize:11, fontWeight:700, color:"#94a3b8", textTransform:"uppercase", letterSpacing:".06em" }}>{label}</span>
        <span style={{ fontSize:20 }}>{icon}</span>
      </div>
      <span style={{ fontSize:36, fontWeight:900, color:"#0f172a", lineHeight:1 }}>{value ?? "—"}</span>
    </div>
  );
}

function Card({ title, children, style }) {
  return (
    <div style={{ background:"#fff", borderRadius:14, padding:"22px 24px", boxShadow:"0 1px 4px rgba(0,0,0,.06),0 4px 16px rgba(0,0,0,.04)", ...style }}>
      {title && (
        <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:18 }}>
          <div style={{ width:3, height:16, borderRadius:2, background:"#6366f1" }} />
          <h3 style={{ margin:0, fontSize:13, fontWeight:700, color:"#374151", textTransform:"uppercase", letterSpacing:".05em" }}>{title}</h3>
        </div>
      )}
      {children}
    </div>
  );
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background:"#1e293b", color:"#f1f5f9", padding:"10px 14px", borderRadius:10, fontSize:13, boxShadow:"0 4px 16px rgba(0,0,0,.2)" }}>
      {label && <div style={{ fontWeight:700, marginBottom:6, color:"#e2e8f0" }}>{label}</div>}
      {payload.map((p,i) => (
        <div key={i} style={{ color:p.color||"#a5b4fc" }}>{p.name}: <strong>{p.value}</strong></div>
      ))}
    </div>
  );
}

const empty = <div style={{ textAlign:"center", color:"#94a3b8", padding:"40px 0" }}>No data yet</div>;

export default function Dashboard() {
  const [stats, setStats]           = useState(null);
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [updated, setUpdated]       = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [statsRes, allRes] = await Promise.all([
        axios.get(`${API_BASE}/complaints/stats`, getAuthHeader()),
        axios.get(`${API_BASE}/complaints/all`,   getAuthHeader()),
      ]);
      setStats(statsRes.data);
      setComplaints(Array.isArray(allRes.data) ? allRes.data : []);
      setUpdated(new Date());
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  if (loading) return (
    <div style={{ display:"flex", justifyContent:"center", alignItems:"center", height:300, flexDirection:"column", gap:12 }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <div style={{ width:36, height:36, border:"3px solid #e2e8f0", borderTopColor:"#6366f1", borderRadius:"50%", animation:"spin .8s linear infinite" }} />
      <p style={{ color:"#94a3b8", fontSize:14 }}>Loading analytics…</p>
    </div>
  );

  const total       = stats?.total       ?? 0;
  const pending     = stats?.pending     ?? 0;
  const inProgress  = stats?.inProgress  ?? 0;
  const underReview = stats?.underReview ?? 0;
  const resolved    = stats?.resolved    ?? 0;
  const rate        = total > 0 ? Math.round((resolved / total) * 100) : 0;

  // Complaint category chart
  const categoryMap = {};
  complaints.forEach(c => { const k = c.category||"General"; categoryMap[k]=(categoryMap[k]||0)+1; });
  const categoryData = Object.entries(categoryMap).sort(([,a],[,b])=>b-a).map(([name,count])=>({name,count}));

  // Priority chart
  const priorityMap = {};
  complaints.forEach(c => { const k = c.priority||"Low"; priorityMap[k]=(priorityMap[k]||0)+1; });
  const priorityData = Object.entries(priorityMap).map(([name,value])=>({name,value}));

  // Status chart
  const statusMap = {};
  complaints.forEach(c => { const k = c.status||"Submitted"; statusMap[k]=(statusMap[k]||0)+1; });
  const statusData = Object.entries(statusMap).map(([name,value])=>({name,value}));

  // Language chart
  const langMap = {};
  complaints.forEach(c => { const k = c.detectedLanguage||"ENGLISH"; langMap[k]=(langMap[k]||0)+1; });
  const langData = Object.entries(langMap).sort(([,a],[,b])=>b-a).map(([name,value])=>({name,value}));

  // Timeline chart
  const timeMap = {};
  complaints.forEach(c => {
    if (!c.createdAt) return;
    const day = c.createdAt.slice(0,10);
    timeMap[day] = (timeMap[day]||0)+1;
  });
  const timeData = Object.entries(timeMap).sort(([a],[b])=>a.localeCompare(b)).slice(-10)
    .map(([date,count])=>({ date:date.slice(5), count }));

  // Product category chart — from productId mapping
  // We'll use a static map based on what we know from the data
  const productCatMap = {};
  complaints.forEach(c => {
    // Map product_id to category based on our products table
    const productCategories = {
      1:"Electronics", 2:"Electronics", 3:"Electronics", 4:"Electronics", 5:"Electronics",
      6:"Fashion", 7:"Fashion", 8:"Fashion",
      9:"Home Appliances", 10:"Home Appliances",
      11:"Beauty", 12:"Beauty", 13:"Books"
    };
    const cat = productCategories[c.productId] || "Other";
    productCatMap[cat] = (productCatMap[cat]||0)+1;
  });
  const productCatData = Object.entries(productCatMap).sort(([,a],[,b])=>b-a).map(([name,value])=>({name,value}));

  return (
    <div style={{ padding:"0 0 40px" }}>
      {/* Header */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:28 }}>
        <div>
          <h1 style={{ fontSize:22, fontWeight:800, color:"#0f172a", margin:0 }}>Analytics Dashboard</h1>
          <p style={{ fontSize:13, color:"#94a3b8", margin:"4px 0 0" }}>
            {updated ? `Last updated ${updated.toLocaleTimeString("en-IN")}` : ""}
          </p>
        </div>
        <button onClick={fetchData} style={{ background:"#6366f1", color:"#fff", border:"none", borderRadius:10, padding:"9px 18px", fontSize:13, fontWeight:700, cursor:"pointer" }}>
          ↻ Refresh
        </button>
      </div>

      {/* Stat Cards */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(150px,1fr))", gap:14, marginBottom:20 }}>
        <StatCard label="Total"        value={total}       color="#6366f1" icon="📋" />
        <StatCard label="Submitted"    value={pending}     color="#f59e0b" icon="📥" />
        <StatCard label="Under Review" value={underReview} color="#8b5cf6" icon="🔍" />
        <StatCard label="In Progress"  value={inProgress}  color="#3b82f6" icon="🔄" />
        <StatCard label="Resolved"     value={resolved}    color="#10b981" icon="✅" />
      </div>

      {/* Resolution Rate */}
      <Card style={{ marginBottom:20 }}>
        <div style={{ display:"flex", alignItems:"center", gap:24 }}>
          <div style={{ flex:1 }}>
            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:8 }}>
              <span style={{ fontSize:13, fontWeight:600, color:"#374151" }}>Resolution Rate</span>
              <span style={{ fontSize:13, color:"#94a3b8" }}>{resolved} of {total} resolved</span>
            </div>
            <div style={{ height:10, background:"#f1f5f9", borderRadius:99, overflow:"hidden" }}>
              <div style={{ width:`${rate}%`, height:"100%", background:"linear-gradient(90deg,#6366f1,#10b981)", borderRadius:99, transition:"width .5s ease" }} />
            </div>
          </div>
          <div style={{ fontSize:40, fontWeight:900, color:"#6366f1", minWidth:60, textAlign:"right" }}>{rate}%</div>
        </div>
      </Card>

      {/* Row 1 — Complaint Category + Priority */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:18, marginBottom:18 }}>
        <Card title="Complaints by Issue Type">
          {categoryData.length === 0 ? empty : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={categoryData} margin={{ top:4, right:8, bottom:28, left:0 }} barSize={28}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize:11, fill:"#94a3b8" }} angle={-20} textAnchor="end" interval={0} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize:11, fill:"#94a3b8" }} allowDecimals={false} tickLine={false} axisLine={false} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill:"rgba(99,102,241,.05)" }} />
                <Bar dataKey="count" name="Complaints" radius={[6,6,0,0]}>
                  {categoryData.map((_,i) => <Cell key={i} fill={CATEGORY_COLORS[i%CATEGORY_COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </Card>

        <Card title="Complaints by Priority">
          {priorityData.length === 0 ? empty : (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={priorityData} cx="50%" cy="48%" innerRadius={52} outerRadius={82} paddingAngle={4} dataKey="value" nameKey="name">
                  {priorityData.map((e,i) => <Cell key={i} fill={PRIORITY_COLORS[e.name]??"#94a3b8"} />)}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend iconType="circle" iconSize={9} wrapperStyle={{ fontSize:12, paddingTop:8 }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </Card>
      </div>

      {/* Row 2 — Product Category + Language */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:18, marginBottom:18 }}>
        <Card title="Complaints by Product Category">
          {productCatData.length === 0 ? empty : (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={productCatData} cx="50%" cy="48%" innerRadius={52} outerRadius={82} paddingAngle={4} dataKey="value" nameKey="name">
                  {productCatData.map((e,i) => <Cell key={i} fill={PRODUCT_COLORS[e.name] ?? CATEGORY_COLORS[i%CATEGORY_COLORS.length]} />)}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend iconType="circle" iconSize={9} wrapperStyle={{ fontSize:12, paddingTop:8 }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </Card>

        <Card title="Complaints by Language">
          {langData.length === 0 ? empty : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={langData} margin={{ top:4, right:8, bottom:28, left:0 }} barSize={24}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize:10, fill:"#94a3b8" }} angle={-20} textAnchor="end" interval={0} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize:11, fill:"#94a3b8" }} allowDecimals={false} tickLine={false} axisLine={false} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill:"rgba(99,102,241,.05)" }} />
                <Bar dataKey="value" name="Complaints" radius={[6,6,0,0]}>
                  {langData.map((_,i) => <Cell key={i} fill={LANGUAGE_COLORS[i%LANGUAGE_COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </Card>
      </div>

      {/* Row 3 — Status + Timeline */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:18 }}>
        <Card title="Complaints by Status">
          {statusData.length === 0 ? empty : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={statusData} layout="vertical" margin={{ top:0, right:16, bottom:0, left:8 }} barSize={18}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                <XAxis type="number" tick={{ fontSize:11, fill:"#94a3b8" }} tickLine={false} axisLine={false} allowDecimals={false} />
                <YAxis type="category" dataKey="name" tick={{ fontSize:11, fill:"#94a3b8" }} tickLine={false} axisLine={false} width={80} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill:"rgba(99,102,241,.05)" }} />
                <Bar dataKey="value" name="Count" radius={[0,6,6,0]}>
                  {statusData.map((e,i) => <Cell key={i} fill={STATUS_COLORS[e.name]??"#94a3b8"} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </Card>

        <Card title="Complaints Over Time (last 10 days)">
          {timeData.length === 0 ? empty : (
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={timeData} margin={{ top:4, right:16, bottom:4, left:0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize:11, fill:"#94a3b8" }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize:11, fill:"#94a3b8" }} allowDecimals={false} tickLine={false} axisLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey="count" name="Complaints" stroke="#6366f1" strokeWidth={2.5}
                  dot={{ r:4, fill:"#6366f1", strokeWidth:0 }} activeDot={{ r:6 }} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </Card>
      </div>
    </div>
  );
}
