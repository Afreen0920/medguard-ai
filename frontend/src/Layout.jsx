import Sidebar from "./components/Sidebar";

function Layout({ children }) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <Sidebar />
      <main className="ml-0 md:ml-72">
        <div className="min-h-screen p-4 sm:p-6 lg:p-8">{children}</div>
      </main>
    </div>
  );
}

export default Layout;
