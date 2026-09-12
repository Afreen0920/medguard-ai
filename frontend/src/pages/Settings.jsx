const settings = [
  {
    label: "Clinical governance",
    description: "Risk thresholds, escalation windows, and approval requirements.",
    value: "Standard policy",
  },
  {
    label: "Device coverage",
    description: "Connected monitoring for imaging, diagnostic, and infusion devices.",
    value: "24 devices",
  },
  {
    label: "Alert routing",
    description: "Notifications sent to engineering, clinical engineering, and operations.",
    value: "Active",
  },
  {
    label: "Model override",
    description: "Human review required for any predicted failure probability above 80%.",
    value: "Enabled",
  },
];

function Settings() {
  return (
    <div className="space-y-6">
      <header className="medguard-card p-6 md:p-8">
        <p className="medguard-eyebrow">System settings</p>
        <h1 className="mt-3 text-3xl font-bold text-slate-900">Clinical operations configuration</h1>
        <p className="mt-3 max-w-3xl text-base text-slate-600">
          Configure governance, alerting, and operational policies for the predictive maintenance network.
        </p>
      </header>

      <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Active sites", value: "08", tone: "emerald" },
          { label: "Escalations", value: "14", tone: "amber" },
          { label: "Open reviews", value: "03", tone: "red" },
          { label: "Coverage", value: "96%", tone: "emerald" },
        ].map((item) => (
          <div key={item.label} className="medguard-card p-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">{item.label}</p>
            <p className="mt-4 text-3xl font-black text-slate-900">{item.value}</p>
            <div className={`mt-3 inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.2em] ${
              item.tone === "red"
                ? "bg-red-100 text-red-700"
                : item.tone === "amber"
                  ? "bg-amber-100 text-amber-700"
                  : "bg-emerald-100 text-emerald-700"
            }`}>
              {item.tone === "red" ? "Review" : item.tone === "amber" ? "Monitor" : "Healthy"}
            </div>
          </div>
        ))}
      </section>

      <section className="medguard-card p-6 md:p-8">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="medguard-eyebrow">Policy management</p>
            <h2 className="mt-2 text-2xl font-bold text-slate-900">Operational settings</h2>
          </div>
          <button type="button" className="rounded-2xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800">
            Save changes
          </button>
        </div>

        <div className="mt-6 space-y-4">
          {settings.map((item) => (
            <div key={item.label} className="rounded-2xl border border-slate-200 bg-slate-50 p-4 md:flex md:items-center md:justify-between md:gap-6">
              <div>
                <p className="text-base font-semibold text-slate-900">{item.label}</p>
                <p className="mt-1 text-sm text-slate-600">{item.description}</p>
              </div>

              <div className="mt-3 md:mt-0">
                <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.2em] text-emerald-700">
                  {item.value}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export default Settings;
