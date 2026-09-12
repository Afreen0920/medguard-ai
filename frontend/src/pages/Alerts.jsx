import { useEffect, useState } from "react";
import { API_URL } from "../config";

function Alerts() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchAlerts = async () => {
    try {
      const response = await fetch(`${API_URL}/alerts`);

      if (!response.ok) {
        throw new Error("Failed to fetch alerts");
      }

      const data = await response.json();

      setAlerts(data);
      setError("");
    } catch (err) {
      console.error(err);
      setError("Unable to connect to backend.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  const acknowledgeAlert = async (alertId) => {
    try {
      const response = await fetch(
        `${API_URL}/alerts/${alertId}/acknowledge`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            operator_name: "Frontend Operator",
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to acknowledge alert");
      }

      await fetchAlerts();
    } catch (err) {
      console.error(err);
      alert("Failed to acknowledge alert");
    }
  };

  const resolveAlert = async (alertId) => {
    try {
      const response = await fetch(
        `${API_URL}/alerts/${alertId}/resolve`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            operator_name: "Frontend Operator",
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to resolve alert");
      }

      await fetchAlerts();
    } catch (err) {
      console.error(err);
      alert("Failed to resolve alert");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 p-8">
        <h1 className="text-3xl font-bold text-gray-800">
          Alerts
        </h1>

        <p className="mt-4 text-gray-500">
          Loading alerts...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 p-8">
        <h1 className="text-3xl font-bold text-gray-800">
          Alerts
        </h1>

        <p className="mt-4 text-red-600">
          {error}
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">

      <h1 className="text-3xl font-bold text-gray-800">
        Alerts
      </h1>

      <p className="text-gray-500 mt-1 mb-8">
        Equipment failure risk alerts requiring attention
      </p>

      <div className="space-y-4">

        {alerts.length === 0 ? (
          <div className="bg-white rounded-xl shadow p-6">
            <p className="text-gray-500">
              No alerts available.
            </p>
          </div>
        ) : (
          alerts.map((alert) => (

            <div
              key={alert.alert_id}
              className="bg-white rounded-xl shadow p-6"
            >

              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

                <div>

                  <p className="text-sm text-gray-500">
                    {alert.alert_id}
                  </p>

                  <h2 className="text-xl font-bold text-black mt-1" style={{ color: "#111827" }}>
                    Equipment: {alert.equipment_id}
                  </h2>

                  <p className="text-gray-600 mt-2">
                    {alert.message}
                  </p>

                  <p className="text-sm text-gray-500 mt-1">
                    Created:{" "}
                    {new Date(alert.created_at).toLocaleString()}
                  </p>

                </div>

                <div className="text-left md:text-right">

                  <p
                    className={
                      alert.severity === "CRITICAL"
                        ? "text-red-600 font-bold"
                        : "text-orange-500 font-bold"
                    }
                  >
                    {alert.severity}
                  </p>

                  <p className="text-gray-600">
                    Status: {alert.status}
                  </p>

                  {alert.acknowledged_by && (
                    <p className="text-gray-500 text-sm">
                      Acknowledged by: {alert.acknowledged_by}
                    </p>
                  )}

                  {alert.resolved_by && (
                    <p className="text-gray-500 text-sm">
                      Resolved by: {alert.resolved_by}
                    </p>
                  )}

                  <div className="flex gap-2 mt-3 justify-end">

                    {alert.status === "active" && (
                      <>
                        <button
                          onClick={() =>
                            acknowledgeAlert(alert.alert_id)
                          }
                          className="bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600"
                        >
                          Acknowledge
                        </button>

                        <button
                          onClick={() =>
                            resolveAlert(alert.alert_id)
                          }
                          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                        >
                          Resolve
                        </button>
                      </>
                    )}

                    {alert.status === "acknowledged" && (
                      <button
                        onClick={() =>
                          resolveAlert(alert.alert_id)
                        }
                        className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                      >
                        Resolve
                      </button>
                    )}

                  </div>

                </div>

              </div>

            </div>

          ))
        )}

      </div>

    </div>
  );
}

export default Alerts;