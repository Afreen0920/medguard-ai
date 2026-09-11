from uuid import uuid4

from fastapi import APIRouter, HTTPException

from backend.database.crud import create_alert, upsert_equipment
from backend.schemas import PredictionRequest, PredictionResponse
from backend.services.agent_service import decide
from backend.services.prediction_service import predict
from backend.services.shap_service import explain


router = APIRouter(tags=["prediction"])


@router.post("/predict", response_model=PredictionResponse)
def create_prediction(request: PredictionRequest) -> PredictionResponse:
	payload = request.model_dump()
	equipment_id = payload.pop("equipment_id") or "DEV-001"
	equipment_name = payload.pop("equipment_name") or f"Device {equipment_id}"
	criticality = payload.pop("criticality")
	days_since_maintenance = payload.pop("days_since_maintenance")

	equipment = {
		"id": equipment_id,
		"name": equipment_name,
		"criticality": criticality,
		"days_since_maintenance": days_since_maintenance,
	}
	try:
		prediction = predict(payload)
		explanation = explain(payload, prediction)
		decision = decide(prediction, explanation, equipment)

		# Save or update equipment profile in inventory
		profile_data = dict(payload)
		profile_data.update(equipment)
		profile_data["equipment_id"] = equipment_id
		profile_data["equipment_name"] = equipment_name
		upsert_equipment(
			equipment_id=equipment_id,
			name=equipment_name,
			criticality=criticality,
			days_since_maintenance=days_since_maintenance,
			profile=profile_data,
		)

		if decision["alert"]["created"]:
			create_alert(
				alert_id=f"ALT-{uuid4().hex[:8].upper()}",
				equipment_id=equipment["id"] or "UNKNOWN",
				severity=decision["alert"]["severity"],
				message=decision["alert"]["message"],
			)
	except (FileNotFoundError, KeyError, ValueError, RuntimeError) as exc:
		raise HTTPException(status_code=503, detail=str(exc)) from exc
	return PredictionResponse(
		prediction=prediction,
		explanation=explanation,
		decision=decision,
	)
