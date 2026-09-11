from dataclasses import dataclass
from typing import Any, Dict, Optional


@dataclass
class EquipmentRecord:
	equipment_id: str
	name: str
	criticality: str
	days_since_maintenance: int
	profile: Dict[str, Any]


@dataclass
class AlertRecord:
	alert_id: str
	equipment_id: str
	severity: str
	message: str
	status: str = "active"
	acknowledged_by: Optional[str] = None
	acknowledged_at: Optional[str] = None
	resolved_by: Optional[str] = None
	resolved_at: Optional[str] = None
	created_at: str = ""
