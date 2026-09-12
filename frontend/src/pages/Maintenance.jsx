function Maintenance() {
  const maintenance = [
    {
      id: "EQ001",
      equipment: "Ventilator",
      risk: "High",
      priority: "Urgent",
      action: "Inspect cooling system",
    },
    {
      id: "EQ004",
      equipment: "Defibrillator",
      risk: "High",
      priority: "Urgent",
      action: "Check battery and internal components",
    },
    {
      id: "EQ003",
      equipment: "Patient Monitor",
      risk: "Medium",
      priority: "Medium",
      action: "Inspect temperature sensors",
    },
    {
      id: "EQ002",
      equipment: "Infusion Pump",
      risk: "Low",
      priority: "Low",
      action: "Routine inspection",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-100 p-8">

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">
          Maintenance
        </h1>

        <p className="text-gray-500 mt-1">
          Equipment maintenance priorities and recommended actions
        </p>
      </div>

      {/* Maintenance Table */}
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
                <th className="p-3">Recommended Action</th>
              </tr>
            </thead>

            <tbody>

              {maintenance.map((item) => (
                <tr key={item.id} className="border-b">

                  <td className="p-3 font-medium">
                    {item.id}
                  </td>

                  <td className="p-3">
                    {item.equipment}
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
                    <span
                      className={
                        item.priority === "Urgent"
                          ? "text-red-600 font-semibold"
                          : item.priority === "Medium"
                          ? "text-orange-500 font-semibold"
                          : "text-green-600 font-semibold"
                      }
                    >
                      {item.priority}
                    </span>
                  </td>

                  <td className="p-3">
                    {item.action}
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

export default Maintenance;