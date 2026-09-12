function Dashboard() {
  const equipment = [
    {
      id: "EQ001",
      name: "Ventilator",
      risk: "High",
      probability: "87%",
      status: "Needs Attention",
    },
    {
      id: "EQ002",
      name: "Infusion Pump",
      risk: "Low",
      probability: "18%",
      status: "Normal",
    },
    {
      id: "EQ003",
      name: "Patient Monitor",
      risk: "Medium",
      probability: "54%",
      status: "Monitor",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-100 p-8">

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">
          Dashboard
        </h1>

        <p className="text-gray-500 mt-1">
          Medical Equipment Failure Prediction Overview
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">

        <div className="bg-white p-6 rounded-xl shadow">
          <p className="text-gray-500">Total Equipment</p>
          <h2 className="text-3xl font-bold mt-2">24</h2>
        </div>

        <div className="bg-white p-6 rounded-xl shadow">
          <p className="text-gray-500">High Risk</p>
          <h2 className="text-3xl font-bold text-red-600 mt-2">5</h2>
        </div>

        <div className="bg-white p-6 rounded-xl shadow">
          <p className="text-gray-500">Active Alerts</p>
          <h2 className="text-3xl font-bold text-orange-500 mt-2">7</h2>
        </div>

        <div className="bg-white p-6 rounded-xl shadow">
          <p className="text-gray-500">Maintenance Due</p>
          <h2 className="text-3xl font-bold text-blue-600 mt-2">4</h2>
        </div>

      </div>

      {/* Recent Equipment */}
      <div className="bg-white rounded-xl shadow p-6">

        <h2 className="text-xl font-bold text-gray-800 mb-5">
          Recent Equipment
        </h2>

        <div className="overflow-x-auto">

          <table className="w-full text-left">

            <thead>
              <tr className="border-b">
                <th className="p-3">Equipment ID</th>
                <th className="p-3">Equipment</th>
                <th className="p-3">Risk Level</th>
                <th className="p-3">Failure Probability</th>
                <th className="p-3">Status</th>
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

                </tr>
              ))}

            </tbody>

          </table>

        </div>
      </div>

    </div>
  );
}

export default Dashboard;