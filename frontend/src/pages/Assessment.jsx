import { useEffect, useMemo, useState } from "react";
import { API_URL } from "../config";

const baseForm = {
  classification: "Diagnostic Devices",
  country: "USA",
  risk_class: 2,
  implanted: "No",
  manufacturer_id: 14,
  event_count: 3,
  recall_count: 1,
  safety_alert_count: 0,
  equipment_id: "1",
  equipment_name: "Device 0",
  criticality: "NORMAL",
  days_since_maintenance: 14,
};

const baseTelemetry = {
  temperature: 88.4,
  vibration: 4.82,
  pressure: 142.1,
  rpm: 1750,
  operating_hours: 6480,
  flow_rate: 18.1,
};

const progressSteps = [
  "Processing equipment data",
  "Running risk prediction",
  "Generating explanation",
  "Evaluating maintenance priority",
];

const classificationOptions = [
  "Diagnostic Devices",
  "Cardiovascular Devices",
  "Respiratory Devices",
  "Imaging Systems",
  "Monitoring Equipment",
  "Therapeutic Devices",
  "Surgical Equipment",
  "Laboratory Devices",
];

const countryOptions = ["USA", "UK", "Germany", "Canada", "France", "India", "Japan", "Australia"];
const implantedOptions = ["No", "Yes"];
const criticalityOptions = ["NORMAL", "HIGH", "CRITICAL"];
const manufacturerOptions = Array.from({ length: 19 }, (_, index) => index + 1);
const numericOptions = (values) => values.map((value) => ({ value, label: String(value) }));

const riskClassOptions = numericOptions([1, 2, 3, 4, 5]);
const eventCountOptions = numericOptions([0, 1, 2, 3, 4, 5, 6, 8, 10, 12]);
const recallCountOptions = numericOptions([0, 1, 2, 3, 4, 5]);
const safetyAlertOptions = numericOptions([0, 1, 2, 3, 4, 5, 6]);
const maintenanceDaysOptions = numericOptions([0, 7, 14, 30, 45, 60, 90, 180]);
const temperatureOptions = numericOptions([60, 72, 80, 88, 95, 105, 115]);
const vibrationOptions = numericOptions([1.5, 2.2, 3.4, 4.8, 6.1, 7.5, 9.2]);
const pressureOptions = numericOptions([90, 110, 125, 142, 160, 180, 210]);
const rpmOptions = numericOptions([700, 1200, 1500, 1750, 2200, 2600]);
const operatingHoursOptions = numericOptions([500, 1500, 3500, 6480, 8200, 9800]);
const flowRateOptions = numericOptions([10, 14, 18, 22, 28, 32]);

const defaultEquipmentOptions = [
  { id: "1", name: "Device 0" },
];

const riskPalette = {
  CRITICAL: "bg-red-100 text-red-700 border-red-200",
  HIGH: "bg-orange-100 text-orange-700 border-orange-200",
  MEDIUM: "bg-amber-100 text-amber-700 border-amber-200",
  LOW: "bg-emerald-100 text-emerald-700 border-emerald-200",
};

function formatPercent(value) {
  const numeric = Number(value ?? 0);
  if (!Number.isFinite(numeric)) return "0.0%";
  return `${(numeric * 100).toFixed(1)}%`;
}

function getRiskLevelFromScore(score) {
  const numeric = Number(score ?? 0);
  if (numeric >= 0.75) return "CRITICAL";
  if (numeric >= 0.5) return "HIGH";
  if (numeric >= 0.3) return "MEDIUM";
  return "LOW";
}

function Assessment() {
  const [form, setForm] = useState(baseForm);
  const [equipmentOptions, setEquipmentOptions] = useState(defaultEquipmentOptions);
  const [telemetry, setTelemetry] = useState(baseTelemetry);
  const [isLoading, setIsLoading] = useState(false);
  const [progressIndex, setProgressIndex] = useState(0);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);
  const [reviewStatus, setReviewStatus] = useState("pending");
  const [reviewNotes, setReviewNotes] = useState("");
  const [decisionRecorded, setDecisionRecorded] = useState(false);

  useEffect(() => {
    if (!isLoading) return undefined;
    const interval = setInterval(() => {
      setProgressIndex((current) => (current + 1) % progressSteps.length);
    }, 800);
    return () => clearInterval(interval);
  }, [isLoading]);

  useEffect(() => {
    fetch(`${API_URL}/equipment?status=All`)
      .then((response) => {
        if (!response.ok) throw new Error("Unable to load equipment data.");
        return response.json();
      })
      .then((items) => {
        const apiEquipment = items.map((equipment) => ({
          id: equipment.equipmentId,
          name: equipment.name,
          ...equipment.profile,
        }));
        setEquipmentOptions(apiEquipment);
      })
      .catch(() => {
        // Keep the built-in equipment options if the backend is unavailable.
      });
  }, []);

  useEffect(() => {
    const selectedEquipment = equipmentOptions.find((equipment) => String(equipment.id) === String(form.equipment_id));
    if (!selectedEquipment?.classification) return;

    setForm((current) => ({
      ...current,
      equipment_name: selectedEquipment.name,
      classification: selectedEquipment.classification,
      country: selectedEquipment.country,
      risk_class: selectedEquipment.risk_class,
      implanted: selectedEquipment.implanted,
      manufacturer_id: selectedEquipment.manufacturer_id,
      criticality: selectedEquipment.criticality,
      event_count: selectedEquipment.event_count,
      recall_count: selectedEquipment.recall_count,
      safety_alert_count: selectedEquipment.safety_alert_count,
    }));
  }, [equipmentOptions, form.equipment_id]);

  const handleFormChange = (event) => {
    const { name, value } = event.target;
    const numericFields = [
      "risk_class",
      "manufacturer_id",
      "event_count",
      "recall_count",
      "safety_alert_count",
      "days_since_maintenance",
    ];

    setForm((current) => ({
      ...current,
      [name]: numericFields.includes(name) ? Number(value) : value,
    }));
  };

  const handleTelemetryChange = (event) => {
    const { name, value } = event.target;
    setTelemetry((current) => ({
      ...current,
      [name]: Number(value),
    }));
  };

  const handleEquipmentChange = (event) => {
    const { name, value } = event.target;
    const selectedEquipment = equipmentOptions.find((equipment) => String(equipment[name === "equipment_id" ? "id" : "name"]) === String(value));

    if (!selectedEquipment) return;

    setForm((current) => ({
      ...current,
      equipment_id: selectedEquipment.id,
      equipment_name: selectedEquipment.name,
      ...(selectedEquipment.classification ? {
        classification: selectedEquipment.classification,
        country: selectedEquipment.country,
        risk_class: selectedEquipment.risk_class,
        implanted: selectedEquipment.implanted,
        manufacturer_id: selectedEquipment.manufacturer_id,
        criticality: selectedEquipment.criticality,
        event_count: selectedEquipment.event_count,
        recall_count: selectedEquipment.recall_count,
        safety_alert_count: selectedEquipment.safety_alert_count,
      } : {}),
    }));
  };

  const handleAnalyze = async (event) => {
    event.preventDefault();
    setError("");
    setResult(null);
    setDecisionRecorded(false);
    setReviewStatus("pending");
    setReviewNotes("");
    setProgressIndex(0);
    setIsLoading(true);

    try {
      const payload = {
        classification: form.classification,
        country: form.country,
        risk_class: String(form.risk_class),
        implanted: form.implanted,
        manufacturer_id: Number(form.manufacturer_id),
        event_count: Number(form.event_count),
        recall_count: Number(form.recall_count),
        safety_alert_count: Number(form.safety_alert_count),
        equipment_id: form.equipment_id,
        equipment_name: form.equipment_name,
        criticality: form.criticality,
        days_since_maintenance: Number(form.days_since_maintenance),
      };

      const response = await fetch(`${API_URL}/predict`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("Equipment analysis request failed.");
      }

      const data = await response.json();
      setResult(data);
    } catch (apiError) {
      setError(
        apiError instanceof Error
          ? apiError.message
          : "Unable to complete the equipment analysis. Please retry."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const riskPercent = useMemo(() => {
    if (!result) return 0;
    const score = Number(result.prediction?.critical_risk_probability ?? 0);
    return Number.isFinite(score) ? score : 0;
  }, [result]);

  const riskLevel = useMemo(() => {
    if (!result) return "LOW";
    return result.decision?.risk?.risk_level || getRiskLevelFromScore(riskPercent);
  }, [result, riskPercent]);

  const riskChartColor = {
    CRITICAL: "#ef4444",
    HIGH: "#f97316",
    MEDIUM: "#f59e0b",
    LOW: "#10b981",
  }[riskLevel] ?? "#10b981";

  const topFactors = result?.explanation?.top_factors ?? [];

  const handleReviewAction = (status) => {
    setReviewStatus(status);
    setDecisionRecorded(true);
  };

  return (
    <div className="medguard-shell">
      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <form onSubmit={handleAnalyze} className="medguard-card p-6 md:p-8">
          <div className="mb-6 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-2xl font-bold text-black" style={{ color: "#111827" }}>
                Equipment details
              </h2>
              <p className="mt-1 text-xs font-medium text-slate-500">
                {equipmentOptions.filter((equipment) => /^\d+$/.test(String(equipment.id))).length} processed devices available
              </p>
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <label className="medguard-field">
              <span>Equipment ID</span>
              <select name="equipment_id" value={form.equipment_id} onChange={handleEquipmentChange}>
                {equipmentOptions.map((equipment) => (
                  <option key={equipment.id} value={equipment.id}>{equipment.id}</option>
                ))}
              </select>
            </label>
            <label className="medguard-field">
              <span>Equipment Name</span>
              <select name="equipment_name" value={form.equipment_name} onChange={handleEquipmentChange}>
                {equipmentOptions.map((equipment) => (
                  <option key={equipment.id} value={equipment.name}>{equipment.name}</option>
                ))}
              </select>
            </label>
            <label className="medguard-field">
              <span>Equipment Type</span>
              <select name="classification" value={form.classification} onChange={handleFormChange}>
                {classificationOptions.map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </label>
            <label className="medguard-field">
              <span>Country</span>
              <select name="country" value={form.country} onChange={handleFormChange}>
                {countryOptions.map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </label>
            <label className="medguard-field">
              <span>Risk Class</span>
              <select name="risk_class" value={form.risk_class} onChange={handleFormChange}>
                {riskClassOptions.map(({ value, label }) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </label>
            <label className="medguard-field">
              <span>Implanted</span>
              <select name="implanted" value={form.implanted} onChange={handleFormChange}>
                {implantedOptions.map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </label>
            <label className="medguard-field">
              <span>Manufacturer ID</span>
              <select name="manufacturer_id" value={form.manufacturer_id} onChange={handleFormChange}>
                {manufacturerOptions.map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </label>
            <label className="medguard-field">
              <span>Criticality</span>
              <select name="criticality" value={form.criticality} onChange={handleFormChange}>
                {criticalityOptions.map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </label>
            <label className="medguard-field">
              <span>Days Since Maintenance</span>
              <select name="days_since_maintenance" value={form.days_since_maintenance} onChange={handleFormChange}>
                {maintenanceDaysOptions.map(({ value, label }) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </label>
            <label className="medguard-field">
              <span>Event Count</span>
              <select name="event_count" value={form.event_count} onChange={handleFormChange}>
                {eventCountOptions.map(({ value, label }) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </label>
            <label className="medguard-field">
              <span>Recall Count</span>
              <select name="recall_count" value={form.recall_count} onChange={handleFormChange}>
                {recallCountOptions.map(({ value, label }) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </label>
            <label className="medguard-field">
              <span>Safety Alert Count</span>
              <select name="safety_alert_count" value={form.safety_alert_count} onChange={handleFormChange}>
                {safetyAlertOptions.map(({ value, label }) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </label>
          </div>

          <div className="mt-8 rounded-2xl border border-emerald-100 bg-emerald-50/70 p-5">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">Telemetry</p>
                <h3 className="mt-2 text-xl font-bold text-slate-900">Current equipment condition</h3>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <label className="medguard-field">
                <span>Temperature</span>
                <div className="relative">
                  <select name="temperature" value={telemetry.temperature} onChange={handleTelemetryChange}>
                    {temperatureOptions.map(({ value, label }) => (
                      <option key={value} value={value}>{label} °C</option>
                    ))}
                  </select>
                </div>
              </label>
              <label className="medguard-field">
                <span>Vibration</span>
                <div className="relative">
                  <select name="vibration" value={telemetry.vibration} onChange={handleTelemetryChange}>
                    {vibrationOptions.map(({ value, label }) => (
                      <option key={value} value={value}>{label} mm/s</option>
                    ))}
                  </select>
                </div>
              </label>
              <label className="medguard-field">
                <span>Pressure</span>
                <div className="relative">
                  <select name="pressure" value={telemetry.pressure} onChange={handleTelemetryChange}>
                    {pressureOptions.map(({ value, label }) => (
                      <option key={value} value={value}>{label} PSI</option>
                    ))}
                  </select>
                </div>
              </label>
              <label className="medguard-field">
                <span>RPM</span>
                <div className="relative">
                  <select name="rpm" value={telemetry.rpm} onChange={handleTelemetryChange}>
                    {rpmOptions.map(({ value, label }) => (
                      <option key={value} value={value}>{label} RPM</option>
                    ))}
                  </select>
                </div>
              </label>
              <label className="medguard-field">
                <span>Operating Hours</span>
                <div className="relative">
                  <select name="operating_hours" value={telemetry.operating_hours} onChange={handleTelemetryChange}>
                    {operatingHoursOptions.map(({ value, label }) => (
                      <option key={value} value={value}>{label} hrs</option>
                    ))}
                  </select>
                </div>
              </label>
              <label className="medguard-field">
                <span>Flow Rate</span>
                <div className="relative">
                  <select name="flow_rate" value={telemetry.flow_rate} onChange={handleTelemetryChange}>
                    {flowRateOptions.map(({ value, label }) => (
                      <option key={value} value={value}>{label} L/min</option>
                    ))}
                  </select>
                </div>
              </label>
            </div>
          </div>

          <button type="submit" disabled={isLoading} className="medguard-primary mt-8">
            {isLoading ? "Analyzing equipment..." : "Analyze Equipment"}
          </button>

          {error && <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
        </form>

        <aside className="medguard-card p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">System status</p>

          {isLoading ? (
            <div className="mt-6 space-y-5">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm font-semibold text-slate-700">Analyzing Equipment...</p>
              </div>
              <div className="space-y-3">
                {progressSteps.map((step, index) => (
                  <div key={step} className="flex items-center gap-3">
                    <div className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${index === progressIndex ? "bg-emerald-600 text-white" : "bg-slate-200 text-slate-500"}`}>
                      {index + 1}
                    </div>
                    <span className={`text-sm ${index === progressIndex ? "font-semibold text-slate-900" : "text-slate-500"}`}>
                      {step}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : result ? (
            <div className="mt-6 space-y-4">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Risk score</p>
                    <div className="mt-2 flex items-end gap-2">
                      <span className="text-4xl font-black tracking-tight text-slate-900">{formatPercent(riskPercent)}</span>
                    </div>
                  </div>
                  <div
                    className="relative h-24 w-24 shrink-0 rounded-full"
                    style={{ background: `conic-gradient(${riskChartColor} ${Math.min(Math.max(riskPercent * 100, 0), 100)}%, #e2e8f0 0)` }}
                    aria-label={`Risk score ${formatPercent(riskPercent)}`}
                    role="img"
                  >
                    <div className="absolute inset-2 flex items-center justify-center rounded-full bg-slate-50 text-sm font-black text-slate-900">
                      {formatPercent(riskPercent)}
                    </div>
                  </div>
                </div>
                <div className={`mt-4 inline-flex rounded-full border px-2.5 py-1 text-xs font-bold uppercase tracking-[0.2em] ${riskPalette[riskLevel] ?? riskPalette.LOW}`}>
                  {riskLevel}
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Equipment</p>
                <p className="mt-2 text-lg font-bold text-slate-900">{form.equipment_name}</p>
                <p className="mt-1 text-sm text-slate-600">{form.equipment_id}</p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Maintenance priority</p>
                <p className="mt-2 text-lg font-bold text-slate-900 uppercase">{result.decision?.maintenance?.priority || "MEDIUM"}</p>
              </div>
            </div>
          ) : (
            <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-600">
              Input equipment details and telemetry to generate a predictive maintenance analysis.
            </div>
          )}
        </aside>
      </div>

      {!result && (
        <div className="mt-8 grid gap-6 md:grid-cols-2">
          <section id="risk-explanation" className="medguard-card scroll-mt-6 p-6">
            <p className="medguard-eyebrow">Risk explanation</p>
            <h2 className="mt-2 text-xl font-bold text-slate-900">Key risk drivers</h2>
            <p className="mt-3 text-sm text-slate-600">Run an equipment analysis to view SHAP risk drivers.</p>
          </section>
          <section id="maintenance-review" className="medguard-card scroll-mt-6 p-6">
            <p className="medguard-eyebrow">Maintenance recommendation</p>
            <h2 className="mt-2 text-xl font-bold text-slate-900">Priority and alert review</h2>
            <p className="mt-3 text-sm text-slate-600">Run an equipment analysis to generate maintenance actions for review.</p>
          </section>
        </div>
      )}

      {result && (
        <div className="mt-8 space-y-6">
          <section id="risk-explanation" className="medguard-card scroll-mt-6 p-6 md:p-8">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-3xl font-bold text-black" style={{ color: "#111827" }}>
                  About equipment
                </h2>
              </div>
              <div className={`inline-flex rounded-full border px-3 py-2 text-xs font-bold uppercase tracking-[0.2em] ${riskPalette[riskLevel] ?? riskPalette.LOW}`}>
                {riskLevel}
              </div>
            </div>

            <div className="mt-8 grid gap-5 lg:grid-cols-[0.8fr_1.2fr]">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Critical Risk Score</p>
                    <h3 className="mt-2 text-5xl font-black tracking-tight text-slate-900">{formatPercent(riskPercent)}</h3>
                  </div>
                  <div className={`rounded-full border px-3 py-2 text-xs font-bold uppercase tracking-[0.2em] ${riskPalette[riskLevel] ?? riskPalette.LOW}`}>
                    {riskLevel}
                  </div>
                </div>

                <div className="mt-6">
                  <div className="flex items-center justify-between mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                    <span>Low</span>
                    <span>High</span>
                  </div>
                  <div className="risk-meter">
                    <div className="risk-meter-fill" style={{ width: `${Math.min(riskPercent * 100, 100)}%` }} />
                  </div>
                  <div className="mt-3 flex justify-between text-[11px] font-medium text-slate-500">
                    <span>0%</span>
                    <span>50%</span>
                    <span>75%</span>
                    <span>100%</span>
                  </div>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {[
                  { label: "Temperature", value: `${telemetry.temperature} °C`, tone: telemetry.temperature > 85 ? "warning" : "normal" },
                  { label: "Vibration", value: `${telemetry.vibration} mm/s`, tone: telemetry.vibration > 4 ? "warning" : "normal" },
                  { label: "Pressure", value: `${telemetry.pressure} PSI`, tone: telemetry.pressure > 150 ? "warning" : "normal" },
                  { label: "RPM", value: `${telemetry.rpm} RPM`, tone: telemetry.rpm > 1800 ? "warning" : "normal" },
                  { label: "Operating Hours", value: `${telemetry.operating_hours} hrs`, tone: telemetry.operating_hours > 7000 ? "warning" : "normal" },
                  { label: "Days Since Maintenance", value: `${form.days_since_maintenance} days`, tone: form.days_since_maintenance > 45 ? "critical" : "normal" },
                ].map((item) => (
                  <div key={item.label} className="rounded-2xl border border-slate-200 bg-white p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">{item.label}</p>
                    <p className="mt-3 text-xl font-bold text-slate-900">{item.value}</p>
                    <div className={`mt-3 inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.2em] ${item.tone === "critical" ? "bg-red-100 text-red-700" : item.tone === "warning" ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700"}`}>
                      {item.tone === "critical" ? "Critical" : item.tone === "warning" ? "Elevated" : "Normal"}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section id="maintenance-review" className="medguard-card scroll-mt-6 p-6 md:p-8">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="medguard-eyebrow">Risk explanation</p>
                <h3 className="text-2xl font-bold text-slate-900">Key risk drivers</h3>
              </div>
              <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.2em] text-emerald-700">
                SHAP
              </span>
            </div>

            {topFactors.length > 0 ? (
              <div className="mt-6 space-y-3">
                {topFactors.map((factor) => {
                  const value = Number(factor.value ?? factor.shap_value ?? 0);
                  const positive = value >= 0;
                  return (
                    <div key={factor.feature} className="flex flex-col gap-2 rounded-xl border border-slate-200 bg-slate-50 p-3 md:flex-row md:items-center md:justify-between">
                      <span className="text-sm font-semibold capitalize text-slate-700">
                        {String(factor.feature).replace(/_/g, " ")}
                      </span>
                      <span className={positive ? "text-sm font-bold text-red-600" : "text-sm font-bold text-emerald-600"}>
                        {positive ? "+" : ""}{value.toFixed(2)} · {factor.direction || (positive ? "increases risk" : "reduces risk")}
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="mt-6 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-600">
                No key drivers were returned for this assessment.
              </p>
            )}
          </section>

          <section className="medguard-card p-6 md:p-8">
            <p className="medguard-eyebrow">Maintenance recommendation</p>
            <h3 className="text-2xl font-bold text-slate-900">Priority and alert review</h3>

            <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">Priority</p>
                <p className="mt-2 text-lg font-bold uppercase text-slate-900">{result.decision?.maintenance?.priority || "MEDIUM"}</p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">Alert</p>
                <p className="mt-2 text-lg font-bold text-slate-900">{result.decision?.alert?.created ? "Created" : "Not created"}</p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">Human review</p>
                <p className="mt-2 text-lg font-bold text-slate-900">{result.decision?.human_review_required ? "Required" : "Not required"}</p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">Probability</p>
                <p className="mt-2 text-lg font-bold text-slate-900">{formatPercent(riskPercent)}</p>
              </div>
            </div>

            <div className="mt-5 rounded-xl border border-slate-200 bg-white p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Recommended action</p>
              <p className="mt-2 text-sm leading-relaxed text-slate-700">
                {result.decision?.maintenance?.recommendation || "No recommendation available."}
              </p>
            </div>
          </section>

          <section className="medguard-card p-6 md:p-8">
            <p className="medguard-eyebrow">Human review</p>
            <h3 className="text-2xl font-bold text-slate-900">Final decision review</h3>

            {!decisionRecorded ? (
              <div className="mt-6 space-y-5">
                <div className="grid gap-3 md:grid-cols-3">
                  <button type="button" onClick={() => handleReviewAction("approved")} className="rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700">Approve Recommendation</button>
                  <button type="button" onClick={() => handleReviewAction("rejected")} className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700 transition hover:bg-red-100">Reject Recommendation</button>
                  <button type="button" onClick={() => handleReviewAction("inspection")} className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-700 transition hover:bg-amber-100">Request Additional Inspection</button>
                </div>

                <label className="medguard-field">
                  <span>Review notes</span>
                  <textarea value={reviewNotes} onChange={(event) => setReviewNotes(event.target.value)} rows={4} placeholder="Add clinical or operational notes for the review record..." />
                </label>
              </div>
            ) : (
              <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">Decision recorded</p>
                    <h4 className="mt-2 text-2xl font-bold text-slate-900">Review status: {reviewStatus}</h4>
                  </div>
                  <span className="rounded-full bg-emerald-600 px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] text-white">Approved</span>
                </div>
                <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                  <div className="rounded-xl border border-white/70 bg-white/80 p-3"><span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">Equipment</span><p className="mt-2 font-bold text-slate-900">{form.equipment_id}</p></div>
                  <div className="rounded-xl border border-white/70 bg-white/80 p-3"><span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">Risk Level</span><p className="mt-2 font-bold text-slate-900">{riskLevel}</p></div>
                  <div className="rounded-xl border border-white/70 bg-white/80 p-3"><span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">Priority</span><p className="mt-2 font-bold text-slate-900">{result.decision?.maintenance?.priority ?? "MEDIUM"}</p></div>
                  <div className="rounded-xl border border-white/70 bg-white/80 p-3"><span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">Alert</span><p className="mt-2 font-bold text-slate-900">{result.decision?.alert?.created ? "Created" : "Not created"}</p></div>
                </div>
                {reviewNotes && <div className="mt-4 rounded-xl border border-emerald-100 bg-white p-3 text-sm text-slate-700">{reviewNotes}</div>}

                <div className="mt-5 flex flex-wrap gap-3">
                  <button type="button" onClick={() => { setResult(null); setDecisionRecorded(false); window.scrollTo({ top: 0, behavior: "smooth" }); }} className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">Analyze Another Equipment</button>
                </div>
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  );
}

export default Assessment;
