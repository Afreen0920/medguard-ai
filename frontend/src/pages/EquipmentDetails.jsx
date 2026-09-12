import { useParams } from "react-router-dom";

function EquipmentDetails() {
  const { id } = useParams();

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
          Equipment ID: {id}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          <div className="border rounded-lg p-4">
            <p className="text-gray-500">Equipment Type</p>
            <p className="text-xl font-semibold mt-1">
              Ventilator
            </p>
          </div>

          <div className="border rounded-lg p-4">
            <p className="text-gray-500">Status</p>
            <p className="text-xl font-semibold text-orange-500 mt-1">
              Needs Attention
            </p>
          </div>

          <div className="border rounded-lg p-4">
            <p className="text-gray-500">Failure Probability</p>
            <p className="text-xl font-semibold text-red-600 mt-1">
              87%
            </p>
          </div>

          <div className="border rounded-lg p-4">
            <p className="text-gray-500">Risk Level</p>
            <p className="text-xl font-semibold text-red-600 mt-1">
              High
            </p>
          </div>

          <div className="border rounded-lg p-4">
            <p className="text-gray-500">Maintenance Priority</p>
            <p className="text-xl font-semibold text-red-600 mt-1">
              Urgent
            </p>
          </div>

          <div className="border rounded-lg p-4">
            <p className="text-gray-500">Recommendation</p>
            <p className="text-xl font-semibold mt-1">
              Inspect cooling system
            </p>
          </div>

        </div>

        <div className="mt-8 border rounded-lg p-4">
          <p className="text-gray-500 mb-2">
            Key Risk Factors
          </p>

          <ul className="list-disc list-inside text-red-600">
            <li>High temperature</li>
            <li>Abnormal pressure</li>
          </ul>
        </div>

      </div>
    </div>
  );
}

export default EquipmentDetails;