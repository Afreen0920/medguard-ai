import { useEffect, useState } from 'react'
import './App.css'

const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8001'
const numericFields = ['manufacturer_id', 'event_count', 'recall_count', 'safety_alert_count', 'days_since_maintenance']
const initialForm = { classification: 'Diagnostic Devices', country: 'USA', risk_class: '2', implanted: 'No', manufacturer_id: 14, event_count: 3, recall_count: 1, safety_alert_count: 0, equipment_id: 'DEV-001', criticality: 'NORMAL', days_since_maintenance: 14 }

function App() {
  const [form, setForm] = useState(initialForm)
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [apiStatus, setApiStatus] = useState('checking')

  useEffect(() => {
    fetch(`${API_URL}/health`)
      .then((response) => {
        if (!response.ok) throw new Error('Backend unavailable')
        return response.json()
      })
      .then((health) => setApiStatus(health.model_loaded ? 'ready' : 'model-missing'))
      .catch(() => setApiStatus('offline'))
  }, [])

  const update = (event) => {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: numericFields.includes(name) ? Number(value) : value }))
  }

  const submit = async (event) => {
    event.preventDefault()
    setLoading(true)
    setError('')
    try {
      const response = await fetch(`${API_URL}/predict`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
      const body = await response.json()
      if (!response.ok) throw new Error(body.detail || 'Prediction request failed')
      setResult(body)
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setLoading(false)
    }
  }

  const probability = result?.prediction?.critical_risk_probability ?? 0
  const risk = result?.decision?.risk
  return (
    <main className="shell">
      <header className="masthead">
        <div><p className="eyebrow">MEDGUARD / OPERATIONS INTELLIGENCE</p><h1>Equipment risk, explained.</h1><p className="lede">Run a device profile through the failure model, inspect the factors behind its score, and hand the decision to maintenance.</p></div>
        <div className={`status status-${apiStatus}`}><span /> {apiStatus === 'ready' ? 'API ready' : apiStatus === 'checking' ? 'Checking API' : apiStatus === 'model-missing' ? 'Model unavailable' : 'API offline'}</div>
      </header>
      <section className="workspace">
        <form className="panel form-panel" onSubmit={submit}>
          <div className="panel-heading"><span>01</span><h2>Device profile</h2></div>
          <div className="field-grid">
            <label>Equipment ID<input name="equipment_id" value={form.equipment_id} onChange={update} /></label>
            <label>Manufacturer ID<input name="manufacturer_id" type="number" min="0" value={form.manufacturer_id} onChange={update} /></label>
            <label>Classification<select name="classification" value={form.classification} onChange={update}><option>Diagnostic Devices</option><option>Cardiovascular Devices</option><option>Respiratory Devices</option></select></label>
            <label>Country<select name="country" value={form.country} onChange={update}><option>USA</option><option>India</option><option>UK</option></select></label>
            <label>Risk class<select name="risk_class" value={form.risk_class} onChange={update}><option>1</option><option>2</option><option>3</option></select></label>
            <label>Implanted<select name="implanted" value={form.implanted} onChange={update}><option>No</option><option>Yes</option></select></label>
            <label>Events<input name="event_count" type="number" min="0" value={form.event_count} onChange={update} /></label>
            <label>Recalls<input name="recall_count" type="number" min="0" value={form.recall_count} onChange={update} /></label>
            <label>Safety alerts<input name="safety_alert_count" type="number" min="0" value={form.safety_alert_count} onChange={update} /></label>
            <label>Days since service<input name="days_since_maintenance" type="number" min="0" value={form.days_since_maintenance} onChange={update} /></label>
            <label>Equipment criticality<select name="criticality" value={form.criticality} onChange={update}><option>NORMAL</option><option>CRITICAL</option></select></label>
          </div>
          <button className="submit" type="submit" disabled={loading}>{loading ? 'Analysing profile...' : 'Run risk analysis'} <span>↗</span></button>
          {error && <p className="error">{error}</p>}
        </form>
        <section className="results" aria-live="polite">
          <div className="score panel"><div className="panel-heading"><span>02</span><h2>Model output</h2></div>{result ? <><div className="score-line"><strong>{Math.round(probability * 100)}<small>%</small></strong><div><p className="eyebrow">CRITICAL RISK PROBABILITY</p><b className={`risk risk-${risk.risk_level.toLowerCase()}`}>{risk.risk_level}</b></div></div><div className="meter"><i style={{ width: `${probability * 100}%` }} /></div></> : <p className="empty">Submit a device profile to generate a scored assessment.</p>}</div>
          <div className="lower-results">
            <section className="panel"><div className="panel-heading"><span>03</span><h2>SHAP factors</h2></div>{result?.explanation.top_factors?.length ? <ul className="factors">{result.explanation.top_factors.map((factor) => <li key={factor.feature}><span>{factor.feature.replaceAll('_', ' ')}</span><b className={factor.value >= 0 ? 'positive' : 'negative'}>{factor.value >= 0 ? '+' : ''}{factor.value.toFixed(3)}</b></li>)}</ul> : <p className="empty">Waiting for explanation.</p>}</section>
            <section className="panel"><div className="panel-heading"><span>04</span><h2>Maintenance action</h2></div>{result ? <><b className="priority">{result.decision.maintenance.priority}</b><p className="recommendation">{result.decision.maintenance.recommendation}</p>{result.decision.alert.created && <div className="alert">Human review required</div>}</> : <p className="empty">Agent recommendation appears here.</p>}</section>
          </div>
        </section>
      </section>
    </main>
  )
}

export default App
