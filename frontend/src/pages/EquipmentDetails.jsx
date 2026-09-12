import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

const API_URL =
  import.meta.env.VITE_API_URL || "http://127.0.0.1:8001";

function EquipmentDetails() {
  const { id } = useParams();

  const [equipment, setEquipment] = useState(null);
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
        const selectedEquipment = data.find(
          (item) => item.equipmentId === id
        );

        if (!selectedEquipment) {
          setError("Equipment not found.");
        } else {
          setEquipment(selectedEquipment);
        }

        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError("Unable to connect to backend.");
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 p-8">
        <h1 className="text-3xl font-bold text-gray-800">
          Equipment Details
        </h1>

        <p className="mt-4 text-gray-500">
          Loading equipment details...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 p-8">
        <h1 className="text-3xl font-bold text-gray-800">
          Equipment Details
        </h1>

        <p className="mt-4 text-red-600">
          {error}
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">

      <h1 className="text-3xl font-bold text-gray-800 mb-2">
        Equipment Details
      </h1>

      <p className="text-gray-500 mb-8">
        Detailed failure prediction information
      </p>

      <div className="bg-white rounded-xl shadow p-6">

        <h2 className="text-2xl font-bold mb-6">
          Equipment ID: {equipment.equipmentId}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Equipment Name */}
          <div className="border rounded-lg p-4">
            <p className="text-gray-500">
              Equipment Name
            </p>

            <p className="text-xl font-semibold mt-1">
              {equipment.name}
            </p>
          </div>

          {/* Status */}
          <div className="border rounded-lg p-4">
            <p className="text-gray-500">
              Status
            </p>

            <p className="text-xl font-semibold mt-1 capitalize">
              {equipment.status}
            </p>
          </div>

          {/* Failure Probability */}
          <div className="border rounded-lg p-4">
            <p className="text-gray-500">
              Failure Probability
            </p>

            <p className="text-xl font-semibold text-red-600 mt-1">
              {(equipment.failureRisk * 100).toFixed(1)}%
            </p>
          </div>

          {/* Risk Level */}
          <div className="border rounded-lg p-4">
            <p className="text-gray-500">
              Risk Level
            </p>

            <p className="text-xl font-semibold mt-1 capitalize">
              {equipment.status}
            </p>
          </div>

          {/* Maintenance Priority */}
          <div className="border rounded-lg p-4">
            <p className="text-gray-500">
              Maintenance Priority
            </p>

            <p className="text-xl font-semibold mt-1 capitalize">
              {equipment.priority}
            </p>
          </div>

          {/* Production Line */}
          <div className="border rounded-lg p-4">
            <p className="text-gray-500">
              Production Line
            </p>

            <p className="text-xl font-semibold mt-1">
              {equipment.productionLine}
            </p>
          </div>

          {/* Last Updated */}
          <div className="border rounded-lg p-4">
            <p className="text-gray-500">
              Last Updated
            </p>

            <p className="text-xl font-semibold mt-1">
              {equipment.lastUpdated}
            </p>
          </div>

        </div>


      </div>
    </div>
  );
}

export default EquipmentDetails;