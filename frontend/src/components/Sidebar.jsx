 import { Link, NavLink, useNavigate } from "react-router-dom";

const menuItems = [
  { name: "+ Analyze Equipment", path: "/assessment" },
  { name: "Risk Explanation", path: "/assessment#risk-explanation" },
  { name: "Maintenance Review", path: "/assessment#maintenance-review" },
];

function Sidebar() {
  const navigate = useNavigate();

  const handleSectionNavigation = (event, path) => {
    event.preventDefault();
    const [route, hash] = path.split("#");
    navigate(`${route}#${hash}`);
    window.setTimeout(() => {
      document.getElementById(hash)?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  };

  const handleLogout = () => {
    navigate("/login");
  };

  return (
    <aside className="fixed left-0 top-0 z-30 h-screen w-72 border-r border-slate-200 bg-white/95 backdrop-blur-sm">
      <div className="flex h-full flex-col p-5">
        <div className="mb-8 flex items-center gap-3 border-b border-slate-200 pb-5">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-600 text-lg font-black text-white shadow-sm">
            M
          </div>
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight" style={{ color: '#2d3748' }}>MedGuard AI</h1>
          </div>
        </div>

        <nav className="flex flex-1 flex-col gap-2">
          {menuItems.map((item) => {
            const isSectionLink = item.path.includes("#");
            const className = "rounded-2xl px-4 py-3 text-sm font-semibold transition text-slate-600 hover:bg-slate-100 hover:text-slate-900";
            return isSectionLink ? (
              <Link key={item.path} to={item.path} className={className} onClick={(event) => handleSectionNavigation(event, item.path)}>
                {item.name}
              </Link>
            ) : (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                    isActive
                      ? "bg-emerald-600 text-white shadow-sm"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  }`
                }
              >
                {item.name}
              </NavLink>
            );
          })}
        </nav>

        <button
          type="button"
          onClick={handleLogout}
          className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700 transition hover:bg-red-100"
        >
          Log Out
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;
