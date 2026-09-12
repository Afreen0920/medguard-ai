import { useEffect, useState } from "react";

const API_URL =
  import.meta.env.VITE_API_URL || "http://127.0.0.1:8001";

function Maintenance() {
  const [equipment, setEquipment] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`${API_URL}/equipment?status=All`)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch equipment");
        }

        return response.json();
      })
      .then((data) => {
        setEquipment(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError("Unable to load equipment from backend.");
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="p-8">
        <h1 className="text-3xl font-bold text-gray-800">
          Maintenance
        </h1>

        <p className="text-gray-500 mt-4">
          Loading maintenance data...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <h1 className="text-3xl font-bold text-gray-800">
          Maintenance
        </h1>

        <p className="text-red-600 mt-4">
          {error}
        </p>
      </div>
    );
  }

  return (
    <div className="p-8">

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">
          Maintenance
        </h1>

        <p className="text-gray-500 mt-1">
          Equipment maintenance priorities and recommended actions
        </p>
      </div>

      <div className="bg-white rounded-xl shadow p-6">

        <h2 className="text-xl font-bold text-gray-800 mb-5">
          Maintenance Schedule
        </h2>

        <div className="overflow-x-auto">

          <table className="w-full text-left">

            <thead>
              <tr className="border-b">
                <th className="p-3">Equipment ID</th>
                <th className="p-3">Equipment</th>
                <th className="p-3">Risk Level</th>
                <th className="p-3">Priority</th>
                <th className="p-3">Production Line</th>
              </tr>
            </thead>

            <tbody>

              {equipment.map((item) => {

                const risk =
                  item.status === "critical"
                    ? "Critical"
                    : item.status === "warning"
                    ? "High"
                    : "Low";

                return (
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

                    <td className="p-3">
                      <span
                        className={
                          risk === "Critical"
                            ? "text-red-600 font-semibold"
                            : risk === "High"
                            ? "text-orange-500 font-semibold"
                            : "text-green-600 font-semibold"
                        }
                      >
                        {risk}
                      </span>
                    </td>

                    <td className="p-3">
                      <span
                        className={
                          item.priority === "urgent"
                            ? "text-red-600 font-semibold"
                            : item.priority === "high"
                            ? "text-orange-500 font-semibold"
                            : "text-green-600 font-semibold"
                        }
                      >
                        {item.priority}
                      </span>
                    </td>

                    <td className="p-3">
                      {item.productionLine}
                    </td>

                  </tr>
                );
              })}

            </tbody>

          </table>

        </div>
      </div>

    </div>
  );
}

export default Maintenance;