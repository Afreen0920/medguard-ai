from typing import Any, Dict

import numpy as np
import shap

from backend.services.prediction_service import prepare_features


def explain(payload: Dict[str, Any], prediction: Dict[str, Any]) -> Dict[str, Any]:
	model, features = prepare_features(payload)
	values = shap.TreeExplainer(model)(features).values
	values = np.asarray(values)
	if values.ndim == 3:
		values = values[0, :, 1]
	else:
		values = values[0]

	ranked = sorted(
		zip(features.columns.tolist(), values.tolist()),
		key=lambda item: abs(float(item[1])),
		reverse=True,
	)
	top_factors = [
		{
			"feature": feature,
			"value": round(float(value), 6),
			"direction": "increases risk" if value >= 0 else "reduces risk",
		}
		for feature, value in ranked[:5]
		if value != 0
	]
	return {
		"critical_risk_probability": prediction["critical_risk_probability"],
		"base_value": _base_value(model, features),
		"top_factors": top_factors,
	}


def _base_value(model, features) -> float:
	expected = shap.TreeExplainer(model).expected_value
	expected = np.asarray(expected).reshape(-1)
	if expected.size > 1:
		expected = expected[-1:]
	return round(float(expected[0]), 6)
