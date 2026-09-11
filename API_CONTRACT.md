# MedGuard AI API Contract

Base URL: `http://127.0.0.1:8001`

## `GET /health`

Returns model availability.

```json
{"status":"ok","model_loaded":true}
```

## `POST /predict`

Request fields include `classification`, `country`, `risk_class`, `implanted`,
`manufacturer_id`, `event_count`, `recall_count`, `safety_alert_count`,
`equipment_id`, `criticality`, and `days_since_maintenance`.

The response contains:

- `prediction`: probability and binary critical prediction
- `explanation`: SHAP base value and ranked factors
- `decision`: risk, maintenance, alert, and human-review result

## Equipment

- `GET /equipment?status=All&search=` lists persisted equipment with risk status.
- `GET /equipment/{equipment_id}/shap` returns SHAP factors.
- `GET /equipment/{equipment_id}/recommendation` returns the agent decision.

## Alerts

- `GET /alerts` lists persisted alerts.
- `POST /alerts/{alert_id}/acknowledge` accepts `{"operator_name":"..."}`.
- `POST /alerts/{alert_id}/resolve` accepts `{"operator_name":"..."}`.

High and critical `/predict` decisions create SQLite-backed alerts.
