from typing import Any, Dict

from agent.maintenance_agent import run_maintenance_agent


def decide(
	prediction: Dict[str, Any],
	explanation: Dict[str, Any],
	equipment: Dict[str, Any],
) -> Dict[str, Any]:
	return run_maintenance_agent(
		prediction=prediction,
		shap_explanation=explanation,
		equipment=equipment,
	)
