const getStatusColor   = s => ({ Resolved: "#27ae60", "In Progress": "#2980b9", Closed: "#7f8c8d", Rejected: "#c0392b" }[s] || "#e67e22");
const getPriorityColor = p => ({ High: "#e74c3c", Medium: "#f39c12" }[p] || "#27ae60");

const API_BASE = "http://localhost:8081/api";

function ComplaintList({ complaints }) {
  if (!complaints || complaints.length === 0) {
    return <p style={{ color: "#6c757d", marginTop: "20px", fontSize: "14px" }}>No previous complaints found for this order.</p>;
  }

  return (
    <div style={{ marginTop: "30px" }}>
      <h3 style={{ marginBottom: "16px", color: "#1f2933", fontSize: "16px" }}>
        📋 Previous Complaints ({complaints.length})
      </h3>

      {complaints.map(c => (
        <div key={c.id} className="complaint-card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
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

          {c.attachmentPath && (
            <div style={{ marginTop: "12px" }}>
              <strong style={{ display: "block", marginBottom: "8px" }}>Attachment:</strong>
              {c.attachmentPath.endsWith(".mp4") ? (
                <video src={`${API_BASE}/complaints/uploads/${c.attachmentPath.split("/").pop()}`}
                  controls style={{ display: "block", maxWidth: "300px", borderRadius: "8px" }} />
              ) : (
                <img src={`${API_BASE}/complaints/uploads/${c.attachmentPath.split("/").pop()}`}
                  alt="Evidence" style={{ display: "block", maxWidth: "300px", borderRadius: "8px", border: "1px solid #e0e0e0" }} />
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export default ComplaintList;