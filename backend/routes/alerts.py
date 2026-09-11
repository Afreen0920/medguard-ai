from datetime import datetime, timezone
from typing import Any, Dict, List

from fastapi import APIRouter, HTTPException

from backend.database.crud import list_alerts, update_alert
from backend.schemas import AlertUpdate


router = APIRouter(prefix="/alerts", tags=["alerts"])


@router.get("")
def get_alert_list() -> List[Dict[str, Any]]:
    return list_alerts()


@router.post("/{alert_id}/acknowledge")
def acknowledge_alert(alert_id: str, update: AlertUpdate) -> Dict[str, Any]:
    alert = update_alert(alert_id, {
        "status": "acknowledged",
        "acknowledged_by": update.operator_name,
        "acknowledged_at": _timestamp(),
    })
    if alert is None:
        raise HTTPException(status_code=404, detail="Alert not found")
    return alert


@router.post("/{alert_id}/resolve")
def resolve_alert(alert_id: str, update: AlertUpdate) -> Dict[str, Any]:
    alert = update_alert(alert_id, {
        "status": "resolved",
        "resolved_by": update.operator_name,
        "resolved_at": _timestamp(),
    })
    if alert is None:
        raise HTTPException(status_code=404, detail="Alert not found")
    return alert


def _timestamp() -> str:
    return datetime.now(timezone.utc).isoformat()
