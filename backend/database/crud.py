import json
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional

from backend.database.database import get_connection, initialize_database


DEFAULT_FLEET = [
	{
		"equipment_id": "DEV-001",
		"equipment_name": "Diagnostic Imaging Unit 001",
		"classification": "Diagnostic Devices",
		"country": "USA",
		"risk_class": "2",
		"implanted": "No",
		"manufacturer_id": 14,
		"event_count": 2,
		"recall_count": 0,
		"safety_alert_count": 0,
		"criticality": "NORMAL",
		"days_since_maintenance": 14,
		"production_line": "Radiology & Imaging",
	},
	{
		"equipment_id": "VENT-102",
		"equipment_name": "ICU Mechanical Ventilator",
		"classification": "Respiratory Devices",
		"country": "USA",
		"risk_class": "3",
		"implanted": "No",
		"manufacturer_id": 8,
		"event_count": 9,
		"recall_count": 2,
		"safety_alert_count": 2,
		"criticality": "CRITICAL",
		"days_since_maintenance": 68,
		"production_line": "Critical Care Unit",
	},
	{
		"equipment_id": "PUMP-205",
		"equipment_name": "Volumetric Infusion Pump",
		"classification": "Cardiovascular Devices",
		"country": "India",
		"risk_class": "2",
		"implanted": "No",
		"manufacturer_id": 12,
		"event_count": 1,
		"recall_count": 0,
		"safety_alert_count": 0,
		"criticality": "NORMAL",
		"days_since_maintenance": 8,
		"production_line": "General Surgery",
	},
	{
		"equipment_id": "DEFIB-301",
		"equipment_name": "Emergency Biphasic Defibrillator",
		"classification": "Cardiovascular Devices",
		"country": "UK",
		"risk_class": "3",
		"implanted": "No",
		"manufacturer_id": 5,
		"event_count": 7,
		"recall_count": 1,
		"safety_alert_count": 1,
		"criticality": "CRITICAL",
		"days_since_maintenance": 52,
		"production_line": "Emergency Response",
	},
	{
		"equipment_id": "DIAL-404",
		"equipment_name": "Hemodialysis System",
		"classification": "Diagnostic Devices",
		"country": "USA",
		"risk_class": "2",
		"implanted": "No",
		"manufacturer_id": 6,
		"event_count": 3,
		"recall_count": 0,
		"safety_alert_count": 1,
		"criticality": "NORMAL",
		"days_since_maintenance": 24,
		"production_line": "Nephrology Care",
	},
	{
		"equipment_id": "MON-508",
		"equipment_name": "Multi-Parameter Patient Monitor",
		"classification": "Diagnostic Devices",
		"country": "India",
		"risk_class": "1",
		"implanted": "No",
		"manufacturer_id": 3,
		"event_count": 0,
		"recall_count": 0,
		"safety_alert_count": 0,
		"criticality": "NORMAL",
		"days_since_maintenance": 5,
		"production_line": "Post-Anesthesia Care",
	},
	{
		"equipment_id": "PACEM-612",
		"equipment_name": "Cardiac Pacemaker Programmer",
		"classification": "Cardiovascular Devices",
		"country": "USA",
		"risk_class": "3",
		"implanted": "Yes",
		"manufacturer_id": 14,
		"event_count": 6,
		"recall_count": 2,
		"safety_alert_count": 1,
		"criticality": "CRITICAL",
		"days_since_maintenance": 42,
		"production_line": "Cardiology Center",
	},
	{
		"equipment_id": "ANESTH-701",
		"equipment_name": "Anesthesia Delivery Workstation",
		"classification": "Respiratory Devices",
		"country": "UK",
		"risk_class": "3",
		"implanted": "No",
		"manufacturer_id": 9,
		"event_count": 4,
		"recall_count": 1,
		"safety_alert_count": 0,
		"criticality": "CRITICAL",
		"days_since_maintenance": 19,
		"production_line": "Operating Theater 3",
	},
]


def seed_default_equipment(profile: Optional[Dict[str, Any]] = None) -> None:
	initialize_database()
	items_to_seed = [profile] if profile else DEFAULT_FLEET
	with get_connection() as connection:
		for item in items_to_seed:
			if not item:
				continue
			connection.execute(
				"""
				INSERT OR IGNORE INTO equipment
				(equipment_id, name, criticality, days_since_maintenance, profile_json)
				VALUES (?, ?, ?, ?, ?)
				""",
				(
					item.get("equipment_id") or "DEV-001",
					item.get("equipment_name") or "Diagnostic Device 001",
					item.get("criticality", "NORMAL"),
					item.get("days_since_maintenance", 0),
					json.dumps(item),
				),
			)


def upsert_equipment(
	equipment_id: str,
	name: str,
	criticality: str,
	days_since_maintenance: int,
	profile: Dict[str, Any],
) -> Dict[str, Any]:
	initialize_database()
	with get_connection() as connection:
		connection.execute(
			"""
			INSERT INTO equipment (equipment_id, name, criticality, days_since_maintenance, profile_json)
			VALUES (?, ?, ?, ?, ?)
			ON CONFLICT(equipment_id) DO UPDATE SET
				name = excluded.name,
				criticality = excluded.criticality,
				days_since_maintenance = excluded.days_since_maintenance,
				profile_json = excluded.profile_json
			""",
			(
				equipment_id,
				name,
				criticality,
				days_since_maintenance,
				json.dumps(profile),
			),
		)
	return get_equipment(equipment_id)  # type: ignore[return-value]


def list_equipment() -> List[Dict[str, Any]]:
	initialize_database()
	with get_connection() as connection:
		rows = connection.execute("SELECT * FROM equipment ORDER BY equipment_id").fetchall()
	return [_equipment_dict(row) for row in rows]


def get_equipment(equipment_id: str) -> Optional[Dict[str, Any]]:
	initialize_database()
	with get_connection() as connection:
		row = connection.execute(
			"SELECT * FROM equipment WHERE equipment_id = ?",
			(equipment_id,),
		).fetchone()
	return _equipment_dict(row) if row else None


def create_alert(
	alert_id: str,
	equipment_id: str,
	severity: str,
	message: str,
) -> Dict[str, Any]:
	created_at = datetime.now(timezone.utc).isoformat()
	with get_connection() as connection:
		connection.execute(
			"""
			INSERT OR REPLACE INTO alerts
			(alert_id, equipment_id, severity, message, status, created_at)
			VALUES (?, ?, ?, ?, 'active', ?)
			""",
			(alert_id, equipment_id, severity, message, created_at),
		)
	return get_alert(alert_id)  # type: ignore[return-value]


def list_alerts() -> List[Dict[str, Any]]:
	initialize_database()
	with get_connection() as connection:
		rows = connection.execute("SELECT * FROM alerts ORDER BY created_at DESC").fetchall()
	return [dict(row) for row in rows]


def get_alert(alert_id: str) -> Optional[Dict[str, Any]]:
	initialize_database()
	with get_connection() as connection:
		row = connection.execute("SELECT * FROM alerts WHERE alert_id = ?", (alert_id,)).fetchone()
	return dict(row) if row else None


def update_alert(alert_id: str, fields: Dict[str, Any]) -> Optional[Dict[str, Any]]:
	alert = get_alert(alert_id)
	if alert is None:
		return None
	allowed = {key: value for key, value in fields.items() if key in {
		"status", "acknowledged_by", "acknowledged_at", "resolved_by", "resolved_at"
	}}
	if allowed:
		assignments = ", ".join(f"{key} = ?" for key in allowed)
		with get_connection() as connection:
			connection.execute(
				f"UPDATE alerts SET {assignments} WHERE alert_id = ?",
				(*allowed.values(), alert_id),
			)
	return get_alert(alert_id)


def _equipment_dict(row: Any) -> Dict[str, Any]:
	return {
		"equipment_id": row["equipment_id"],
		"name": row["name"],
		"criticality": row["criticality"],
		"days_since_maintenance": row["days_since_maintenance"],
		"profile": json.loads(row["profile_json"]),
	}
