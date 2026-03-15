function ComplaintSuccess({ complaintId, trackingNumber }) {
  return (
    <div className="alert-success fade-in">
      <div style={{ fontSize: "36px", marginBottom: "8px" }}>🎉</div>
      <h2 style={{ margin: "0 0 10px", color: "#1e8449", fontSize: "20px" }}>
        Complaint Submitted Successfully!
      </h2>
      <p style={{ margin: "0 0 6px", color: "#555", fontSize: "14px" }}>Your complaint ID is:</p>
      <h3 style={{ margin: "0 0 10px", color: "#1f2933", fontSize: "22px" }}>#{complaintId}</h3>
      <p style={{ margin: "0 0 6px", color: "#555", fontSize: "14px" }}>Your tracking number is:</p>
      <h3 style={{ margin: "0 0 10px", color: "#2980b9", letterSpacing: "2px", fontSize: "18px", fontFamily: "monospace" }}>
        {trackingNumber}
      </h3>
      <p style={{ margin: 0, color: "#6c757d", fontSize: "13px" }}>
        Our team will review your complaint shortly.
      </p>
    </div>
  );
}

export default ComplaintSuccess;
