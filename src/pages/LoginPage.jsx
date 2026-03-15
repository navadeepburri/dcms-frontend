import { useState } from "react";
import { useAuth } from "../context/AuthContext";

const API_BASE = "http://localhost:8081/api";

export default function LoginPage({ onSwitch }) {
  const { login } = useAuth();
  const [form, setForm]       = useState({ username:"", password:"" });
  const [error, setError]     = useState("");
  const [loading, setLoading] = useState(false);
  const [showPwd, setShowPwd] = useState(false);

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true); setError("");
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Login failed"); return; }
      localStorage.setItem("token", data.token);
      login(data);
    } catch (_) {
      setError("Cannot connect to server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", background:"#f0f2fa", fontFamily:"'Segoe UI', sans-serif" }}>
      <div style={{ display:"flex", width:"100%", maxWidth:900, minHeight:560, borderRadius:20, overflow:"hidden", boxShadow:"0 20px 60px rgba(59,77,187,.15), 0 4px 20px rgba(0,0,0,.08)" }}>

        {/* ── Left Panel ── */}
        <div style={{ width:"42%", background:"linear-gradient(145deg,#3b4dbb 0%,#6472e0 60%,#818cf8 100%)", display:"flex", flexDirection:"column", justifyContent:"space-between", padding:"40px 36px", position:"relative", overflow:"hidden" }}>
          {/* decorative circles */}
          <div style={{ position:"absolute", width:220, height:220, borderRadius:"50%", border:"1.5px solid rgba(255,255,255,.12)", top:-60, right:-60 }} />
          <div style={{ position:"absolute", width:160, height:160, borderRadius:"50%", border:"1.5px solid rgba(255,255,255,.1)", bottom:60, left:-50 }} />
          <div style={{ position:"absolute", width:80,  height:80,  borderRadius:"50%", background:"rgba(255,255,255,.08)", bottom:160, right:30 }} />

          {/* brand */}
          <div style={{ display:"flex", alignItems:"center", gap:12, position:"relative" }}>
            <div style={{ width:42, height:42, background:"rgba(255,255,255,.2)", borderRadius:12, display:"flex", alignItems:"center", justifyContent:"center", fontSize:22 }}>🛡️</div>
            <div>
              <div style={{ fontWeight:800, fontSize:20, color:"#fff", letterSpacing:".02em" }}>DCMS</div>
              <div style={{ fontSize:11, color:"rgba(255,255,255,.6)", letterSpacing:".04em" }}>COMPLAINT MANAGEMENT</div>
            </div>
          </div>

          {/* body */}
          <div style={{ flex:1, display:"flex", flexDirection:"column", justifyContent:"center", padding:"24px 0", position:"relative" }}>
            <div style={{ fontSize:26, fontWeight:800, color:"#fff", lineHeight:1.25, marginBottom:14 }}>
              Manage complaints<br />with ease.
            </div>
            <div style={{ fontSize:13, color:"rgba(255,255,255,.7)", lineHeight:1.7 }}>
              A unified platform to raise, track, and resolve complaints — fast and transparently.
            </div>
            <div style={{ marginTop:28, display:"flex", flexDirection:"column", gap:12 }}>
              {["Real-time complaint tracking","Multi-language support","Role-based access control","Analytics & reporting"].map(f => (
                <div key={f} style={{ display:"flex", alignItems:"center", gap:10, fontSize:13, color:"rgba(255,255,255,.85)" }}>
                  <div style={{ width:7, height:7, borderRadius:"50%", background:"rgba(255,255,255,.5)", flexShrink:0 }} />
                  {f}
                </div>
              ))}
            </div>
          </div>

          <div style={{ fontSize:11, color:"rgba(255,255,255,.4)", position:"relative" }}>© 2026 DCMS · Digital Complaint Management System</div>
        </div>

        {/* ── Right Panel ── */}
        <div style={{ flex:1, background:"#ffffff", display:"flex", alignItems:"center", justifyContent:"center", padding:"40px 48px" }}>
          <div style={{ width:"100%", maxWidth:340 }}>
            <div style={{ fontSize:22, fontWeight:800, color:"#0f172a", marginBottom:6 }}>Welcome back</div>
            <div style={{ fontSize:13, color:"#94a3b8", marginBottom:24 }}>Sign in to your account to continue</div>

            {/* status badges */}
            <div style={{ display:"flex", gap:8, marginBottom:24 }}>
              {[["#10b981","System online"],["#6472e0","Secure login"]].map(([color, label]) => (
                <div key={label} style={{ display:"flex", alignItems:"center", gap:5, padding:"5px 10px", borderRadius:20, background:"#f8fafc", border:"1px solid #e2e8f0", fontSize:11, color:"#64748b", fontWeight:500 }}>
                  <div style={{ width:6, height:6, borderRadius:"50%", background:color }} />
                  {label}
                </div>
              ))}
            </div>

            {error && (
              <div style={{ background:"#fef2f2", color:"#b91c1c", border:"1px solid #fecaca", borderRadius:10, padding:"10px 14px", fontSize:13, marginBottom:18 }}>
                ⚠️ {error}
              </div>
            )}

            <form onSubmit={submit} style={{ display:"flex", flexDirection:"column", gap:0 }}>

              {/* username */}
              <div style={{ marginBottom:18 }}>
                <label style={{ display:"block", fontSize:12, fontWeight:600, color:"#475569", marginBottom:7, letterSpacing:".04em", textTransform:"uppercase" }}>Username</label>
                <div style={{ position:"relative", display:"flex", alignItems:"center" }}>
                  <span style={{ position:"absolute", left:13, color:"#cbd5e1", display:"flex", alignItems:"center", pointerEvents:"none" }}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                    </svg>
                  </span>
                  <input name="username" value={form.username} onChange={handle}
                    placeholder="Enter your username" required
                    style={{ width:"100%", padding:"11px 14px 11px 40px", borderRadius:10, border:"1.5px solid #e2e8f0", fontFamily:"inherit", fontSize:14, color:"#0f172a", outline:"none", background:"#f8fafc", boxSizing:"border-box" }}
                    onFocus={e => { e.target.style.borderColor="#6472e0"; e.target.style.background="#fff"; e.target.style.boxShadow="0 0 0 3px rgba(100,114,224,.12)"; }}
                    onBlur={e  => { e.target.style.borderColor="#e2e8f0"; e.target.style.background="#f8fafc"; e.target.style.boxShadow="none"; }}
                  />
                </div>
              </div>

              {/* password */}
              <div style={{ marginBottom:6 }}>
                <label style={{ display:"block", fontSize:12, fontWeight:600, color:"#475569", marginBottom:7, letterSpacing:".04em", textTransform:"uppercase" }}>Password</label>
                <div style={{ position:"relative", display:"flex", alignItems:"center" }}>
                  <span style={{ position:"absolute", left:13, color:"#cbd5e1", display:"flex", alignItems:"center", pointerEvents:"none" }}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                    </svg>
                  </span>
                  <input name="password" type={showPwd ? "text" : "password"} value={form.password} onChange={handle}
                    placeholder="Enter your password" required
                    style={{ width:"100%", padding:"11px 40px 11px 40px", borderRadius:10, border:"1.5px solid #e2e8f0", fontFamily:"inherit", fontSize:14, color:"#0f172a", outline:"none", background:"#f8fafc", boxSizing:"border-box" }}
                    onFocus={e => { e.target.style.borderColor="#6472e0"; e.target.style.background="#fff"; e.target.style.boxShadow="0 0 0 3px rgba(100,114,224,.12)"; }}
                    onBlur={e  => { e.target.style.borderColor="#e2e8f0"; e.target.style.background="#f8fafc"; e.target.style.boxShadow="none"; }}
                  />
                  <button type="button" onClick={() => setShowPwd(s => !s)}
                    style={{ position:"absolute", right:12, background:"none", border:"none", cursor:"pointer", color:"#cbd5e1", display:"flex", padding:0 }}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                    </svg>
                  </button>
                </div>
              </div>

              <button type="submit" disabled={loading}
                style={{ width:"100%", marginTop:24, padding:13, background:"linear-gradient(135deg,#3b4dbb,#6472e0)", border:"none", borderRadius:10, fontSize:15, fontWeight:700, color:"#fff", cursor:"pointer", letterSpacing:".02em", boxShadow:"0 4px 14px rgba(100,114,224,.35)", opacity: loading ? 0.75 : 1 }}>
                {loading ? "Signing in…" : "Sign In"}
              </button>
            </form>

            <div style={{ display:"flex", alignItems:"center", gap:12, margin:"22px 0 18px" }}>
              <div style={{ flex:1, height:1, background:"#f1f5f9" }} />
              <span style={{ fontSize:11, color:"#cbd5e1" }}>or</span>
              <div style={{ flex:1, height:1, background:"#f1f5f9" }} />
            </div>

            <div style={{ textAlign:"center", fontSize:13, color:"#94a3b8" }}>
              Don't have an account?{" "}
              <span onClick={onSwitch} style={{ color:"#6472e0", fontWeight:600, cursor:"pointer" }}>Register now</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}