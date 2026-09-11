from typing import Any, Dict, List

from fastapi import APIRouter, HTTPException

from backend.database.crud import get_equipment, list_equipment, seed_default_equipment
from backend.schemas import PredictionRequest
from backend.services.agent_service import decide
from backend.services.prediction_service import predict
from backend.services.shap_service import explain


router = APIRouter(prefix="/equipment", tags=["equipment"])

seed_default_equipment()


@router.get("")
def get_equipment_list(status: str = "All", search: str = "") -> List[Dict[str, Any]]:
    items = []
    for equipment in list_equipment():
        prediction = predict(equipment["profile"])
        probability = prediction["critical_risk_probability"]
        item = {
            "equipmentId": equipment["equipment_id"],
            "name": equipment["name"],
            "failureRisk": probability,
            "status": "critical" if probability >= 0.7 else "warning" if probability >= 0.4 else "healthy",
            "priority": "urgent" if probability >= 0.8 else "high" if probability >= 0.7 else "medium" if probability >= 0.4 else "low",
            "lastUpdated": "just now",
            "productionLine": equipment["profile"].get("production_line", "Medical Operations"),
        }
        if status.lower() != "all" and item["status"] != status.lower():
            continue
        if search and search.lower() not in f'{item["equipmentId"]} {item["name"]}'.lower():
            continue
        items.append(item)
    return sorted(items, key=lambda item: item["failureRisk"], reverse=True)


@router.get("/{equipment_id}/shap")
def equipment_shap(equipment_id: str) -> Dict[str, Any]:
    equipment = _get_equipment(equipment_id)
    prediction = predict(equipment["profile"])
    return {"equipmentId": equipment_id, **explain(equipment["profile"], prediction)}


@router.get("/{equipment_id}/recommendation")
def equipment_recommendation(equipment_id: str) -> Dict[str, Any]:
    equipment = _get_equipment(equipment_id)
    payload = equipment["profile"]
    prediction = predict(payload)
    explanation = explain(payload, prediction)
    return {"equipmentId": equipment_id, **decide(prediction, explanation, equipment)}


def _get_equipment(equipment_id: str) -> Dict[str, Any]:
    equipment = get_equipment(equipment_id)
    if equipment is None:
        raise HTTPException(status_code=404, detail="Equipment not found")
    return equipment
