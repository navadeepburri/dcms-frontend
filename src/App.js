import { AuthProvider, useAuth } from "./context/AuthContext";
import { useState } from "react";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import Dashboard from "./pages/Dashboard";
import AdminComplaints from "./pages/AdminComplaints";
import StaffDashboard from "./pages/StaffDashboard";
import RaiseComplaint from "./pages/RaiseComplaint";
import TrackComplaint from "./pages/TrackComplaint";
import "./App.css";

function AppContent() {
  const { user, logout } = useAuth();
  const [page, setPage] = useState("login");
  const [nav, setNav]   = useState(null);

  if (!user) {
    return page === "login"
      ? <LoginPage    onSwitch={() => setPage("register")} />
      : <RegisterPage onSwitch={() => setPage("login")} />;
  }

  const isAdmin = user.role === "ROLE_ADMIN";
  const isStaff = user.role === "ROLE_STAFF";
  const isUser  = user.role === "ROLE_USER";

  const defaultNav = isAdmin ? "dashboard" : isStaff ? "staff" : "raise";
  const activeNav  = nav || defaultNav;

  const roleBadge = {
    ROLE_ADMIN: { bg:"#fef3c7", color:"#92400e", label:"Admin" },
    ROLE_STAFF: { bg:"#ede9fe", color:"#5b21b6", label:"Staff" },
    ROLE_USER:  { bg:"#dcfce7", color:"#166534", label:"User"  },
  }[user.role] ?? { bg:"#f3f4f6", color:"#374151", label: user.role };

  const navBtn = (id, icon, label) => (
    <button
      className={`sidebar-link${activeNav === id ? " active" : ""}`}
      onClick={() => setNav(id)}
    >
      {icon} {label}
    </button>
  );

  const handleLogout = () => {
    setNav(null);
    logout();
  };

  return (
    <div className="app-container">
      <div className="sidebar">
        <h2>🛡️ DCMS<br /><span style={{ fontSize:12, fontWeight:400, color:"#a5b4fc" }}>Complaint Management</span></h2>

        <nav>
          {isAdmin && navBtn("dashboard",  "📊", "Dashboard")}
          {isAdmin && navBtn("complaints", "📋", "All Complaints")}
          {isStaff && navBtn("staff",      "📋", "Complaint Queue")}
          {isUser  && navBtn("raise",      "📝", "Raise Complaint")}
          {isUser  && navBtn("track",      "🔍", "Track Complaint")}
        </nav>

        {/* Profile section */}
        <div style={{ marginTop:"auto", paddingTop:16, borderTop:"1px solid rgba(255,255,255,.1)" }}>
          <div style={{ background:"rgba(255,255,255,.07)", borderRadius:12, padding:"14px 16px", marginBottom:10 }}>
            <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:8 }}>
              <div style={{ width:36, height:36, borderRadius:"50%", background:"linear-gradient(135deg,#6366f1,#8b5cf6)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:16, fontWeight:700, color:"#fff", flexShrink:0 }}>
                {user.username.charAt(0).toUpperCase()}
              </div>
              <div>
                <div style={{ fontSize:13, fontWeight:700, color:"#e0e7ff" }}>{user.username}</div>
                <div style={{ fontSize:11, color:"#94a3b8" }}>{user.email || ""}</div>
              </div>
            </div>
            <span style={{ fontSize:11, fontWeight:700, background:roleBadge.bg, color:roleBadge.color, borderRadius:6, padding:"2px 10px", display:"inline-block" }}>
              {roleBadge.label}
            </span>
          </div>
          <button onClick={handleLogout} className="sidebar-link" style={{ width:"100%", textAlign:"center", background:"rgba(239,68,68,.15)", color:"#fca5a5", justifyContent:"center" }}>
            🚪 Logout
          </button>
        </div>
      </div>

      <div className="main-content">
        {/* Admin pages */}
        {isAdmin && activeNav === "dashboard"  && <Dashboard />}
        {isAdmin && activeNav === "complaints" && <AdminComplaints />}
        {isAdmin && activeNav !== "dashboard" && activeNav !== "complaints" && <Dashboard />}

        {/* Staff pages */}
        {isStaff && activeNav === "staff" && <StaffDashboard />}
        {isStaff && activeNav !== "staff" && <StaffDashboard />}

        {/* User pages */}
        {isUser && activeNav === "raise" && <RaiseComplaint />}
        {isUser && activeNav === "track" && <TrackComplaint />}
        {isUser && activeNav !== "raise" && activeNav !== "track" && <RaiseComplaint />}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}