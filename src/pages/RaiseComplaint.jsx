import ComplaintForm from "../components/ComplaintForm";

function RaiseComplaint() {
  return (
    <div className="fade-in">
      <div className="breadcrumb">Dashboard &gt; Raise Complaint</div>

      <div className="page-header">
        <h2>Raise Complaint</h2>
        <p>Submit an issue related to your order</p>
      </div>

      <div style={{ display: "flex", justifyContent: "center" }}>
        <ComplaintForm />
      </div>
    </div>
  );
}

export default RaiseComplaint;
