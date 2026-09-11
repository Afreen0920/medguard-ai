"""
MedGuard AI - Risk Decision Engine

Converts ML risk probability into:
- Risk level
- Maintenance priority
- Alert decision

This is a deterministic decision layer, not another ML model.
"""

from typing import Dict, Any


def get_risk_level(probability: float) -> str:
    """
    Convert critical-risk probability into a risk level.
    """

    probability = float(probability)

    if probability >= 0.75:
        return "CRITICAL"
    elif probability >= 0.50:
        return "HIGH"
    elif probability >= 0.30:
        return "MEDIUM"
    else:
        return "LOW"


def get_maintenance_priority(
    risk_level: str,
    equipment_criticality: str = "NORMAL",
    days_since_maintenance: int = 0
) -> str:
    """
    Determine maintenance priority using:
    - ML risk level
    - Equipment criticality
    - Days since maintenance
    """

    risk_level = risk_level.upper()
    equipment_criticality = equipment_criticality.upper()

    # Critical risk always requires urgent attention
    if risk_level == "CRITICAL":
        return "URGENT"

    # High-risk critical equipment
    if risk_level == "HIGH" and equipment_criticality == "CRITICAL":
        return "URGENT"

    # High risk or overdue maintenance
    if risk_level == "HIGH" or days_since_maintenance >= 45:
        return "HIGH"

    # Medium risk
    if risk_level == "MEDIUM":
        return "MEDIUM"

    return "LOW"


def should_create_alert(risk_level: str) -> bool:
    """
    Create an alert for HIGH or CRITICAL risk.
    """

    return risk_level.upper() in ["HIGH", "CRITICAL"]


def build_risk_decision(
    critical_risk_probability: float,
    equipment_criticality: str = "NORMAL",
    days_since_maintenance: int = 0
) -> Dict[str, Any]:
    """
    Build the complete risk decision.
    """

    probability = float(critical_risk_probability)

    risk_level = get_risk_level(probability)

    maintenance_priority = get_maintenance_priority(
        risk_level=risk_level,
        equipment_criticality=equipment_criticality,
        days_since_maintenance=days_since_maintenance
    )

    alert_required = should_create_alert(risk_level)

    return {
        "critical_risk_probability": round(probability, 4),
        "risk_level": risk_level,
        "maintenance_priority": maintenance_priority,
        "alert_required": alert_required
    }