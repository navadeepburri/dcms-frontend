import { NavLink } from "react-router-dom";

function Sidebar() {
  const getLinkClass = ({ isActive }) =>
    isActive ? "sidebar-link active" : "sidebar-link";

  return (
    <div className="sidebar">
      <h2>DCMS</h2>

      <NavLink to="/" className={getLinkClass} data-tooltip="Dashboard Overview">
        📊 Dashboard
      </NavLink>

      <NavLink to="/raise" className={getLinkClass} data-tooltip="Submit a complaint">
        📝 Raise Complaint
      </NavLink>

      <NavLink to="/status" className={getLinkClass} data-tooltip="Track complaint status">
        📄 Complaint Status
      </NavLink>

      <NavLink to="/order-complaints" className={getLinkClass} data-tooltip="View complaints by order">
        📦 Order Complaints
      </NavLink>
    </div>
  );
}

export default Sidebar;
