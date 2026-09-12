from functools import lru_cache
from pathlib import Path
from typing import Any, Dict, List

import pandas as pd
from fastapi import APIRouter, HTTPException

from backend.database.crud import get_equipment, list_equipment, seed_default_equipment
from backend.schemas import PredictionRequest
from backend.services.agent_service import decide
from backend.services.prediction_service import predict
from backend.services.shap_service import explain


router = APIRouter(prefix="/equipment", tags=["equipment"])

seed_default_equipment()

PROCESSED_DATASET_PATH = Path(__file__).resolve().parents[2] / "ml" / "data" / "processed" / "medical_failure_dataset.csv"


@lru_cache(maxsize=1)
def _processed_equipment() -> Dict[str, Dict[str, Any]]:
    if not PROCESSED_DATASET_PATH.exists():
        raise FileNotFoundError(f"Processed equipment dataset is missing: {PROCESSED_DATASET_PATH}")

    data = pd.read_csv(PROCESSED_DATASET_PATH).fillna("")
    items = {}
    for row in data.to_dict(orient="records"):
        equipment_id = str(row["device_id"])
        criticality = "CRITICAL" if int(row["target"]) == 1 else "NORMAL"
        items[equipment_id] = {
            "equipment_id": equipment_id,
            "name": str(row["name"]),
            "criticality": criticality,
            "days_since_maintenance": 0,
            "profile": {
                "classification": str(row["classification"]),
                "country": str(row["country"]),
                "risk_class": str(row["risk_class"]),
                "implanted": str(row["implanted"]),
                "manufacturer_id": int(row["manufacturer_id"]),
                "event_count": 0,
                "recall_count": 0,
                "safety_alert_count": 0,
                "equipment_id": equipment_id,
                "equipment_name": str(row["name"]),
                "criticality": criticality,
                "days_since_maintenance": 0,
                "target": int(row["target"]),
            },
        }
    return items


@router.get("")
def get_equipment_list(status: str = "All", search: str = "") -> List[Dict[str, Any]]:
    items = []
    for equipment in _processed_equipment().values():
        prediction = predict(equipment["profile"])
        probability = prediction["critical_risk_probability"]
        is_critical = equipment["profile"]["target"] == 1
        item = {
            "equipmentId": equipment["equipment_id"],
            "name": equipment["name"],
            "failureRisk": probability,
            "status": "critical" if is_critical else "healthy",
            "priority": "urgent" if is_critical else "low",
            "lastUpdated": "just now",
            "productionLine": equipment["profile"].get("production_line", "Medical Operations"),
            "profile": equipment["profile"],
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
    equipment = _processed_equipment().get(str(equipment_id))
    if equipment is None:
        raise HTTPException(status_code=404, detail="Equipment not found")
    return equipment
