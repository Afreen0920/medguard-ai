import Sidebar from "./components/Sidebar";

function Layout({ children }) {
  return (
    <div className="min-h-screen bg-gray-100">

      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <main className="ml-64">
        {children}
      </main>

    </div>
  );
}

export default Layout;