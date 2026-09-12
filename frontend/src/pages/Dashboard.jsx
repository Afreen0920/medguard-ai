import { useEffect, useState } from "react";

const API_URL =
  import.meta.env.VITE_API_URL || "http://127.0.0.1:8001";

function Dashboard() {
  const [equipment, setEquipment] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const [equipmentResponse, alertsResponse] = await Promise.all([
          fetch(`${API_URL}/equipment?status=All`),
          fetch(`${API_URL}/alerts`),
        ]);

        if (!equipmentResponse.ok) {
          throw new Error("Failed to load equipment");
        }

        if (!alertsResponse.ok) {
          throw new Error("Failed to load alerts");
        }

        const equipmentData = await equipmentResponse.json();
        const alertsData = await alertsResponse.json();

        setEquipment(equipmentData);
        setAlerts(alertsData);
      } catch (err) {
        console.error(err);
        setError("Unable to connect to backend.");
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  const totalEquipment = equipment.length;

  const highRiskEquipment = equipment.filter(
    (item) =>
      item.status?.toLowerCase() === "critical" ||
      item.failureRisk >= 0.8
  ).length;

  const activeAlerts = alerts.filter(
    (alert) => alert.status?.toLowerCase() === "active"
  ).length;

  const maintenanceDue = equipment.filter(
    (item) =>
      item.priority?.toLowerCase() === "urgent" ||
      item.priority?.toLowerCase() === "high"
  ).length;

  return (
    <div className="min-h-screen bg-gray-100 p-8">

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">
          Dashboard
        </h1>

        <p className="text-gray-500 mt-1">
          Medical equipment failure prediction overview
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-100 text-red-700 p-4 rounded-lg mb-6">
          {error}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="bg-white rounded-xl shadow p-6 mb-6">
          Loading dashboard data...
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">

        <div className="bg-white rounded-xl shadow p-6">
          <p className="text-gray-500">
            Total Equipment
          </p>

          <p className="text-3xl font-bold text-gray-800 mt-2">
            {totalEquipment}
          </p>
        </div>

        <div className="bg-white rounded-xl shadow p-6">
          <p className="text-gray-500">
            High Risk
          </p>

          <p className="text-3xl font-bold text-red-600 mt-2">
            {highRiskEquipment}
          </p>
        </div>

        <div className="bg-white rounded-xl shadow p-6">
          <p className="text-gray-500">
            Active Alerts
          </p>

          <p className="text-3xl font-bold text-orange-500 mt-2">
            {activeAlerts}
          </p>
        </div>

        <div className="bg-white rounded-xl shadow p-6">
          <p className="text-gray-500">
            Maintenance Due
          </p>

          <p className="text-3xl font-bold text-blue-600 mt-2">
            {maintenanceDue}
          </p>
        </div>

      </div>

      {/* Equipment Overview */}
      <div className="bg-white rounded-xl shadow p-6">

        <h2 className="text-xl font-bold text-gray-800 mb-5">
          Equipment Overview
        </h2>

        {equipment.length === 0 ? (
          <p className="text-gray-500">
            No equipment data available.
          </p>
        ) : (
          <div className="overflow-x-auto">

            <table className="w-full text-left">

              <thead>
                <tr className="border-b">
                  <th className="p-3">
                    Equipment ID
                  </th>

                  <th className="p-3">
                    Equipment
                  </th>

                  <th className="p-3">
                    Failure Risk
                  </th>

                  <th className="p-3">
                    Status
                  </th>

                  <th className="p-3">
                    Priority
                  </th>
                </tr>
              </thead>

              <tbody>

                {equipment.slice(0, 10).map((item) => (

                  <tr
                    key={item.equipmentId}
                    className="border-b"
                  >

                    <td className="p-3 font-medium">
                      {item.equipmentId}
                    </td>

                    <td className="p-3">
                      {item.name}
                    </td>

                    <td className="p-3 font-semibold">
                      {(item.failureRisk * 100).toFixed(1)}%
                    </td>

                    <td className="p-3">
                      <span
                        className={
                          item.status?.toLowerCase() === "critical"
                            ? "text-red-600 font-semibold"
                            : item.status?.toLowerCase() === "warning"
                            ? "text-orange-500 font-semibold"
                            : "text-green-600 font-semibold"
                        }
                      >
                        {item.status}
                      </span>
                    </td>

                    <td className="p-3">
                      <span
                        className={
                          item.priority?.toLowerCase() === "urgent"
                            ? "text-red-600 font-semibold"
                            : item.priority?.toLowerCase() === "high"
                            ? "text-orange-500 font-semibold"
                            : "text-green-600 font-semibold"
                        }
                      >
                        {item.priority}
                      </span>
                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>
        )}

      </div>

    </div>
  );
}

export default Dashboard;