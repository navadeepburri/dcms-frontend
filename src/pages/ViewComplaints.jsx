import { useState } from "react";
import axios from "axios";

function ViewComplaints() {
  const [orderId, setOrderId] = useState("");
  const [complaints, setComplaints] = useState([]);

  const fetchComplaints = async () => {
    if (!orderId) {
      alert("Please enter Order ID");
      return;
    }

    try {
      const response = await axios.get(
        `http://localhost:8081/api/complaints/order/${orderId}`
      );
      setComplaints(response.data);
    } catch (error) {
      console.error(error);
      alert("Error fetching complaints");
    }
  };

  return (
    <div className="fade-in">
      <div className="breadcrumb">Dashboard &gt; View Complaints</div>

      <div className="page-header">
        <h2>View Complaints</h2>
        <p>Check complaint status for your orders</p>
      </div>

      <div
        style={{
          background: "#fff",
          padding: "30px",
          borderRadius: "16px",
          boxShadow: "0 12px 30px rgba(0,0,0,0.12)",
          width: "70%",
          minWidth: "600px"
        }}
      >
        <label>Enter Order ID</label>

        <div style={{ display: "flex", gap: "10px", marginTop: "8px" }}>
          <input
            type="number"
            value={orderId}
            onChange={(e) => setOrderId(e.target.value)}
            style={{ flex: 1, padding: "10px" }}
          />

          <button
            onClick={fetchComplaints}
            style={{
              padding: "10px 20px",
              background: "linear-gradient(135deg,#40739e,#273c75)",
              color: "#fff",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer"
            }}
          >
            Fetch
          </button>
        </div>
      </div>

      <div style={{ marginTop: "30px", width: "70%", minWidth: "600px" }}>
        {complaints.length === 0 ? (
          <p>No complaints found.</p>
        ) : (
          complaints.map((c) => (
            <div
              key={c.id}
              style={{
                background: "#fff",
                padding: "20px",
                marginBottom: "15px",
                borderRadius: "12px",
                boxShadow: "0 8px 20px rgba(0,0,0,0.1)"
              }}
            >
              <p><strong>Complaint ID:</strong> {c.id}</p>
              <p><strong>Description:</strong> {c.description}</p>
              <p><strong>Language:</strong> {c.language}</p>
              <p><strong>Category:</strong> {c.category}</p>
              <p><strong>Status:</strong> {c.status}</p>
              <p><strong>Created:</strong> {c.createdAt}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default ViewComplaints;
