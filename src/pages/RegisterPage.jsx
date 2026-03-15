import { useState } from "react";

const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:8081/api";

export default function RegisterPage({ onSwitch }) {
  const [form, setForm]       = useState({ username:"", email:"", password:"", role:"ROLE_USER" });
  const [error, setError]     = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true); setError(""); setSuccess("");
    try {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method:"POST",
        headers:{ "Content-Type":"application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Registration failed"); return; }
      setSuccess("Registered! You can now login.");
      setTimeout(onSwitch, 1500);
    } catch (_) {
      setError("Cannot connect to server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.logo}>📝</div>
        <h1 style={styles.title}>Create Account</h1>
        <p style={styles.sub}>Join the DCMS platform</p>

        {error   && <div style={styles.error}>{error}</div>}
        {success && <div style={styles.success}>{success}</div>}

        <form onSubmit={submit} style={styles.form}>
          <label style={styles.label}>Username</label>
          <input name="username" value={form.username} onChange={handle}
            placeholder="Choose a username" required style={styles.input} />

          <label style={styles.label}>Email</label>
          <input name="email" type="email" value={form.email} onChange={handle}
            placeholder="Enter email" required style={styles.input} />

          <label style={styles.label}>Password</label>
          <input name="password" type="password" value={form.password} onChange={handle}
            placeholder="Create password" required style={styles.input} />

          <label style={styles.label}>Role</label>
          <select name="role" value={form.role} onChange={handle} style={styles.input}>
            <option value="ROLE_USER">User (Customer)</option>
            <option value="ROLE_STAFF">Staff</option>
            <option value="ROLE_ADMIN">Admin</option>
          </select>

          <button type="submit" disabled={loading} style={styles.btn}>
            {loading ? "Registering…" : "Register"}
          </button>
        </form>

        <p style={styles.switch}>
          Already have an account?{" "}
          <span onClick={onSwitch} style={styles.link}>Login</span>
        </p>
      </div>
    </div>
  );
}

const styles = {
  page:    { minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", background:"#f1f5f9" },
  card:    { background:"#fff", borderRadius:20, padding:"48px 40px", width:"100%", maxWidth:420, boxShadow:"0 4px 32px rgba(0,0,0,.10)", textAlign:"center" },
  logo:    { fontSize:48, marginBottom:12 },
  title:   { fontSize:26, fontWeight:800, color:"#111827", margin:0 },
  sub:     { fontSize:13, color:"#9ca3af", margin:"6px 0 28px" },
  form:    { display:"flex", flexDirection:"column", gap:12, textAlign:"left" },
  label:   { fontSize:13, fontWeight:600, color:"#374151" },
  input:   { padding:"11px 14px", borderRadius:10, border:"1.5px solid #e5e7eb", fontSize:14, outline:"none", width:"100%", boxSizing:"border-box" },
  btn:     { marginTop:8, padding:"13px", background:"#6366f1", color:"#fff", border:"none", borderRadius:10, fontSize:15, fontWeight:700, cursor:"pointer" },
  error:   { background:"#fef2f2", color:"#b91c1c", border:"1px solid #fecaca", borderRadius:10, padding:"10px 14px", fontSize:13, marginBottom:16 },
  success: { background:"#f0fdf4", color:"#166534", border:"1px solid #bbf7d0", borderRadius:10, padding:"10px 14px", fontSize:13, marginBottom:16 },
  switch:  { marginTop:20, fontSize:13, color:"#6b7280" },
  link:    { color:"#6366f1", fontWeight:600, cursor:"pointer" },
};
