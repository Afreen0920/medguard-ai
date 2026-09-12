import { NavLink, useNavigate } from "react-router-dom";

function Sidebar() {
  const navigate = useNavigate();

  const menuItems = [
    {
      name: "Dashboard",
      path: "/dashboard",
    },
    {
      name: "Equipment",
      path: "/equipment",
    },
    {
      name: "Alerts",
      path: "/alerts",
    },
    {
      name: "Maintenance",
      path: "/maintenance",
    },
  ];

  const handleLogout = () => {
    navigate("/login");
  };

  return (
    <div className="w-64 min-h-screen bg-white shadow-md fixed left-0 top-0">

      {/* Logo */}
      <div className="p-6 border-b">
        <h1 className="text-2xl font-bold text-blue-600">
          MedGuard AI
        </h1>

        <p className="text-sm text-gray-500 mt-1">
          Medical Equipment
        </p>
      </div>

      {/* Navigation */}
      <nav className="p-4">

        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `block px-4 py-3 rounded-lg mb-2 ${
                isActive
                  ? "bg-blue-600 text-white"
                  : "text-gray-700 hover:bg-gray-100"
              }`
            }
          >
            {item.name}
          </NavLink>
        ))}

      </nav>

      {/* Logout */}
      <div className="absolute bottom-6 left-4 right-4">

        <button
          onClick={handleLogout}
          className="w-full px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 text-left"
        >
          Logout
        </button>

      </div>

    </div>
  );
}

export default Sidebar;