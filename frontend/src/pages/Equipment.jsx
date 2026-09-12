import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_URL } from "../config";

function Equipment() {
  const navigate = useNavigate();

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

  const getRiskLabel = (status) => {
    if (status === "critical") return "High";
    if (status === "warning") return "Medium";
    return "Low";
  };

  const getRiskColor = (status) => {
    if (status === "critical") {
      return "text-red-600 font-semibold";
    }

    if (status === "warning") {
      return "text-orange-500 font-semibold";
    }

    return "text-green-600 font-semibold";
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">
          Equipment
        </h1>

        <p className="text-gray-500 mt-1">
          Medical equipment failure risk monitoring
        </p>
      </div>

      <div className="bg-white rounded-xl shadow p-6">

        <h2 className="text-xl font-bold text-black mb-5" style={{ color: "#111827" }}>
          Equipment List
        </h2>

        {loading && (
          <p className="text-gray-500">
            Loading equipment...
          </p>
        )}

        {error && (
          <div className="bg-red-100 text-red-700 p-4 rounded-lg">
            {error}
          </div>
        )}

        {!loading && !error && (
          <div className="overflow-x-auto">

            <table className="w-full text-left">

              <thead>
                <tr className="border-b">
                  <th className="p-3">Equipment ID</th>
                  <th className="p-3">Equipment</th>
                  <th className="p-3">Risk</th>
                  <th className="p-3">Failure Probability</th>
                  <th className="p-3">Priority</th>
                  <th className="p-3">Production Line</th>
                  <th className="p-3">Action</th>
                </tr>
              </thead>

              <tbody>

                {equipment.map((item) => (

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
                      <span className={getRiskColor(item.status)}>
                        {getRiskLabel(item.status)}
                      </span>
                    </td>

                    <td className="p-3">
                      {(item.failureRisk * 100).toFixed(1)}%
                    </td>

                    <td className="p-3">
                      {item.priority}
                    </td>

                    <td className="p-3">
                      {item.productionLine}
                    </td>

                    <td className="p-3">
                      <button
                        onClick={() =>
                          navigate(
                            `/equipment/${item.equipmentId}`
                          )
                        }
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                      >
                        View
                      </button>
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

export default Equipment;