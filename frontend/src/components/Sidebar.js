import { Link, useLocation } from "react-router-dom";

const Sidebar = () => {
  const location = useLocation();

  const navItems = [
    { path: "/rfq", label: "Quotation Management" },
    { path: "/product", label: "Product Management" },
  ];

  return (
    <aside className="d-flex flex-column bg-white border-end shadow-sm" style={{ width: "240px", height: "100vh" }}>
      <div className="px-5 py-4 ">
        <span className="fs-4 fw-semibold text-primary">AUMA</span>
      </div>

      <nav className="nav flex-column px-2 pt-3">
        {navItems.map(({ path, label }) => (
          <Link
            key={path}
            to={path}
            className={`nav-link rounded px-4 py-2 mb-1 fw-bold ${location.pathname === path
              ? "bg-primary text-white shadow-sm"
              : "text-body hover-bg"
              }`}
            style={{ transition: "all 0.2s ease" }}
          >
            {label}
          </Link>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;

