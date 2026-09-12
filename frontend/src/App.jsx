import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import "./App.css";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Equipment from "./pages/Equipment";
import EquipmentDetails from "./pages/EquipmentDetails";
import Alerts from "./pages/Alerts";
import Maintenance from "./pages/Maintenance";
import Layout from "./Layout";


const API_URL =
  import.meta.env.VITE_API_URL || "http://127.0.0.1:8001";


function PredictionApp() {
  const [form, setForm] = useState({
    classification: "Diagnostic Devices",
    country: "USA",
    risk_class: 2,
    implanted: "No",
    manufacturer_id: 14,
    event_count: 3,
    recall_count: 1,
    safety_alert_count: 0,
    equipment_id: "DEV-001",
    criticality: "NORMAL",
    days_since_maintenance: 14,
  });

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [apiStatus, setApiStatus] = useState("Checking...");


  useEffect(() => {
    fetch(`${API_URL}/health`)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Backend unavailable");
        }
        return response.json();
      })
      .then(() => {
        setApiStatus("Connected");
      })
      .catch(() => {
        setApiStatus("Disconnected");
      });
  }, []);


  const handleChange = (e) => {
    const { name, value } = e.target;

    const numericFields = [
      "risk_class",
      "manufacturer_id",
      "event_count",
      "recall_count",
      "safety_alert_count",
      "days_since_maintenance",
    ];

    setForm({
      ...form,
      [name]: numericFields.includes(name) ? Number(value) : value,
    });
  };


  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const response = await fetch(`${API_URL}/predict`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      if (!response.ok) {
        throw new Error("Prediction request failed");
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError(
        "Unable to get prediction. Please make sure the FastAPI backend is running."
      );
    } finally {
      setLoading(false);
    }
  };


  const prediction =
    result?.prediction?.critical_risk_probability ?? null;

  const risk =
    result?.decision?.risk ?? "Not Available";

  const topFactors =
    result?.explanation?.top_factors ?? [];

  const maintenance =
    result?.decision?.maintenance ?? "Not Available";

  const alertCreated =
    result?.decision?.alert?.created;


  return (
    <div className="min-h-screen bg-gray-100 p-6">

      <div className="max-w-6xl mx-auto">

        <div className="bg-white rounded-xl shadow-md p-6 mb-6">

          <div className="flex justify-between items-center">

            <div>
              <h1 className="text-3xl font-bold text-blue-600">
                MedGuard AI
              </h1>

              <p className="text-gray-500 mt-1">
                Medical Equipment Failure Prediction
              </p>
            </div>

            <div className="text-sm">
              Backend Status:{" "}
              <span className="font-semibold">
                {apiStatus}
              </span>
            </div>

          </div>

        </div>


        <div className="bg-white rounded-xl shadow-md p-6">

          <h2 className="text-2xl font-bold mb-6">
            Equipment Risk Prediction
          </h2>


          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 md:grid-cols-2 gap-5"
          >

            <div>
              <label className="block font-medium mb-2">
                Classification
              </label>

              <input
                name="classification"
                value={form.classification}
                onChange={handleChange}
                className="w-full border rounded-lg p-3"
              />
            </div>


            <div>
              <label className="block font-medium mb-2">
                Country
              </label>

              <input
                name="country"
                value={form.country}
                onChange={handleChange}
                className="w-full border rounded-lg p-3"
              />
            </div>


            <div>
              <label className="block font-medium mb-2">
                Risk Class
              </label>

              <input
                type="number"
                name="risk_class"
                value={form.risk_class}
                onChange={handleChange}
                className="w-full border rounded-lg p-3"
              />
            </div>


            <div>
              <label className="block font-medium mb-2">
                Implanted
              </label>

              <select
                name="implanted"
                value={form.implanted}
                onChange={handleChange}
                className="w-full border rounded-lg p-3"
              >
                <option value="No">No</option>
                <option value="Yes">Yes</option>
              </select>
            </div>


            <div>
              <label className="block font-medium mb-2">
                Manufacturer ID
              </label>

              <input
                type="number"
                name="manufacturer_id"
                value={form.manufacturer_id}
                onChange={handleChange}
                className="w-full border rounded-lg p-3"
              />
            </div>


            <div>
              <label className="block font-medium mb-2">
                Event Count
              </label>

              <input
                type="number"
                name="event_count"
                value={form.event_count}
                onChange={handleChange}
                className="w-full border rounded-lg p-3"
              />
            </div>


            <div>
              <label className="block font-medium mb-2">
                Recall Count
              </label>

              <input
                type="number"
                name="recall_count"
                value={form.recall_count}
                onChange={handleChange}
                className="w-full border rounded-lg p-3"
              />
            </div>


            <div>
              <label className="block font-medium mb-2">
                Safety Alert Count
              </label>

              <input
                type="number"
                name="safety_alert_count"
                value={form.safety_alert_count}
                onChange={handleChange}
                className="w-full border rounded-lg p-3"
              />
            </div>


            <div>
              <label className="block font-medium mb-2">
                Equipment ID
              </label>

              <input
                name="equipment_id"
                value={form.equipment_id}
                onChange={handleChange}
                className="w-full border rounded-lg p-3"
              />
            </div>


            <div>
              <label className="block font-medium mb-2">
                Criticality
              </label>

              <select
                name="criticality"
                value={form.criticality}
                onChange={handleChange}
                className="w-full border rounded-lg p-3"
              >
                <option value="NORMAL">NORMAL</option>
                <option value="HIGH">HIGH</option>
                <option value="CRITICAL">CRITICAL</option>
              </select>
            </div>


            <div>
              <label className="block font-medium mb-2">
                Days Since Maintenance
              </label>

              <input
                type="number"
                name="days_since_maintenance"
                value={form.days_since_maintenance}
                onChange={handleChange}
                className="w-full border rounded-lg p-3"
              />
            </div>


            <div className="md:col-span-2">

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
              >
                {loading
                  ? "Predicting..."
                  : "Predict Equipment Risk"}
              </button>

            </div>

          </form>


          {error && (
            <div className="mt-6 bg-red-100 text-red-700 p-4 rounded-lg">
              {error}
            </div>
          )}


          {result && (
            <div className="mt-8 space-y-6">

              <div className="border rounded-xl p-5">

                <h3 className="text-xl font-bold mb-4">
                  Prediction Result
                </h3>

                <p>
                  <strong>Risk:</strong> {risk}
                </p>

                {prediction !== null && (
                  <p className="mt-2">
                    <strong>
                      Critical Risk Probability:
                    </strong>{" "}
                    {(prediction * 100).toFixed(2)}%
                  </p>
                )}

              </div>


              <div className="border rounded-xl p-5">

                <h3 className="text-xl font-bold mb-4">
                  Top Risk Factors
                </h3>

                {topFactors.length > 0 ? (
                  <ul className="list-disc ml-6">
                    {topFactors.map((factor, index) => (
                      <li key={index}>
                        {typeof factor === "string"
                          ? factor
                          : JSON.stringify(factor)}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>No explanation available.</p>
                )}

              </div>


              <div className="border rounded-xl p-5">

                <h3 className="text-xl font-bold mb-4">
                  Maintenance Recommendation
                </h3>

                <p>{maintenance}</p>

              </div>


              <div className="border rounded-xl p-5">

                <h3 className="text-xl font-bold mb-4">
                  Alert
                </h3>

                <p>
                  {alertCreated === true
                    ? "Maintenance alert created."
                    : alertCreated === false
                    ? "No alert created."
                    : "Alert information not available."}
                </p>

              </div>

            </div>
          )}

        </div>

      </div>

    </div>
  );
}


function App() {
  return (
    <BrowserRouter>

      <Routes>

        {/* Login */}
        <Route
          path="/"
          element={<Login />}
        />

        <Route
          path="/login"
          element={<Login />}
        />


        {/* Frontend Core Pages */}
        <Route
          path="/dashboard"
          element={
            <Layout>
              <Dashboard />
            </Layout>
          }
        />

        <Route
          path="/equipment"
          element={
            <Layout>
              <Equipment />
            </Layout>
          }
        />

        <Route
          path="/equipment/:id"
          element={
            <Layout>
              <EquipmentDetails />
            </Layout>
          }
        />

        <Route
          path="/alerts"
          element={
            <Layout>
              <Alerts />
            </Layout>
          }
        />

        <Route
          path="/maintenance"
          element={
            <Layout>
              <Maintenance />
            </Layout>
          }
        />


        {/* FastAPI Prediction Page */}
        <Route
          path="/prediction"
          element={
            <PredictionApp />
          }
        />


        {/* Unknown URL */}
        <Route
          path="*"
          element={
            <Navigate
              to="/login"
              replace
            />
          }
        />

      </Routes>

    </BrowserRouter>
  );
}


export default App;