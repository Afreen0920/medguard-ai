from typing import Any, Dict, List, Optional

from pydantic import BaseModel, Field


class PredictionRequest(BaseModel):
	classification: str = "Diagnostic Devices"
	country: str = "USA"
	risk_class: str = "2"
	implanted: str = "No"
	manufacturer_id: int = Field(default=0, ge=0)
	event_count: int = Field(default=0, ge=0)
	recall_count: int = Field(default=0, ge=0)
	safety_alert_count: int = Field(default=0, ge=0)
	equipment_id: Optional[str] = None
	equipment_name: Optional[str] = None
	criticality: str = "NORMAL"
	days_since_maintenance: int = Field(default=0, ge=0)


class PredictionResponse(BaseModel):
	prediction: Dict[str, Any]
	explanation: Dict[str, Any]
	decision: Dict[str, Any]


class HealthResponse(BaseModel):
	status: str
	model_loaded: bool


class MaintenanceRequest(BaseModel):
	equipment_id: str
	equipment_name: Optional[str] = None
	criticality: str = "NORMAL"
	days_since_maintenance: int = Field(default=0, ge=0)
	prediction: Dict[str, Any]
	explanation: Dict[str, Any]


class AlertUpdate(BaseModel):
	operator_name: str = "Operator"
