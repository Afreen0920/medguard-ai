from typing import Any, Dict

from fastapi import APIRouter

from backend.schemas import MaintenanceRequest
from backend.services.agent_service import decide


router = APIRouter(prefix="/maintenance", tags=["maintenance"])


@router.post("/recommendation")
def maintenance_recommendation(request: MaintenanceRequest) -> Dict[str, Any]:
	return decide(
		prediction=request.prediction,
		explanation=request.explanation,
		equipment={
			"id": request.equipment_id,
			"name": request.equipment_name,
			"criticality": request.criticality,
			"days_since_maintenance": request.days_since_maintenance,
		},
	)
