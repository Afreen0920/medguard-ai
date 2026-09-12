function Alerts() {
  const alerts = [
    {
      id: "AL001",
      equipment: "EQ001 - Ventilator",
      risk: "High",
      probability: "87%",
      reason: "High temperature and abnormal pressure",
      priority: "Urgent",
    },
    {
      id: "AL002",
      equipment: "EQ004 - Defibrillator",
      risk: "High",
      probability: "79%",
      reason: "Abnormal vibration detected",
      priority: "Urgent",
    },
    {
      id: "AL003",
      equipment: "EQ003 - Patient Monitor",
      risk: "Medium",
      probability: "54%",
      reason: "Unusual temperature pattern",
      priority: "Medium",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-100 p-8">

      <h1 className="text-3xl font-bold text-gray-800">
        Alerts
      </h1>

      <p className="text-gray-500 mt-1 mb-8">
        Equipment failure risk alerts requiring attention
      </p>

      <div className="space-y-4">

        {alerts.map((alert) => (
          <div
            key={alert.id}
            className="bg-white rounded-xl shadow p-6"
          >
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

              <div>
                <p className="text-sm text-gray-500">
                  {alert.id}
                </p>

                <h2 className="text-xl font-bold text-gray-800 mt-1">
                  {alert.equipment}
                </h2>

                <p className="text-gray-600 mt-2">
                  {alert.reason}
                </p>
              </div>

              <div className="text-left md:text-right">

                <p className="text-red-600 font-bold">
                  {alert.risk} Risk
                </p>

                <p className="text-gray-600">
                  Failure Probability: {alert.probability}
                </p>

                <p className="text-red-600 font-semibold mt-1">
                  Priority: {alert.priority}
                </p>

              </div>

            </div>
          </div>
        ))}

      </div>

    </div>
  );
}

export default Alerts;