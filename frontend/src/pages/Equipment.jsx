import { useNavigate } from "react-router-dom";

function Equipment() {
  const navigate = useNavigate();

  const equipment = [
    {
      id: "EQ001",
      name: "Ventilator",
      department: "ICU",
      risk: "High",
      probability: "87%",
      status: "Needs Attention",
    },
    {
      id: "EQ002",
      name: "Infusion Pump",
      department: "Emergency",
      risk: "Low",
      probability: "18%",
      status: "Normal",
    },
    {
      id: "EQ003",
      name: "Patient Monitor",
      department: "ICU",
      risk: "Medium",
      probability: "54%",
      status: "Monitor",
    },
    {
      id: "EQ004",
      name: "Defibrillator",
      department: "Emergency",
      risk: "High",
      probability: "79%",
      status: "Needs Attention",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-100 p-8">

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">
          Equipment
        </h1>

        <p className="text-gray-500 mt-1">
          Monitor medical equipment and failure risk
        </p>
      </div>

      {/* Equipment Table */}
      <div className="bg-white rounded-xl shadow p-6">

        <h2 className="text-xl font-bold text-gray-800 mb-5">
          Equipment List
        </h2>

        <div className="overflow-x-auto">

          <table className="w-full text-left">

            <thead>
              <tr className="border-b">
                <th className="p-3">Equipment ID</th>
                <th className="p-3">Equipment</th>
                <th className="p-3">Department</th>
                <th className="p-3">Risk Level</th>
                <th className="p-3">Failure Probability</th>
                <th className="p-3">Status</th>
                <th className="p-3">Action</th>
              </tr>
            </thead>

            <tbody>

              {equipment.map((item) => (
                <tr key={item.id} className="border-b">

                  <td className="p-3 font-medium">
                    {item.id}
                  </td>

                  <td className="p-3">
                    {item.name}
                  </td>

                  <td className="p-3">
                    {item.department}
                  </td>

                  <td className="p-3">
                    <span
                      className={
                        item.risk === "High"
                          ? "text-red-600 font-semibold"
                          : item.risk === "Medium"
                          ? "text-orange-500 font-semibold"
                          : "text-green-600 font-semibold"
                      }
                    >
                      {item.risk}
                    </span>
                  </td>

                  <td className="p-3">
                    {item.probability}
                  </td>

                  <td className="p-3">
                    {item.status}
                  </td>

                  <td className="p-3">
                    <button
                      onClick={() =>
                        navigate(`/equipment/${item.id}`)
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
      </div>

    </div>
  );
}

export default Equipment;