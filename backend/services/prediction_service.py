from pathlib import Path
from typing import Any, Dict

import joblib
import pandas as pd

from ml.preprocess import engineer_features


BASE_DIR = Path(__file__).resolve().parents[2]
MODEL_DIR = BASE_DIR / "models"
MODEL_PATH = MODEL_DIR / "xgboost_model.pkl"
FEATURE_COLUMNS_PATH = MODEL_DIR / "feature_columns.pkl"
ENCODERS_PATH = MODEL_DIR / "encoders.pkl"


def artifacts_available() -> bool:
	return all(path.exists() for path in (
		MODEL_PATH,
		FEATURE_COLUMNS_PATH,
		ENCODERS_PATH,
	))


def load_artifacts():
	if not artifacts_available():
		raise FileNotFoundError(f"Model artifacts are missing from {MODEL_DIR}")
	return (
		joblib.load(MODEL_PATH),
		joblib.load(FEATURE_COLUMNS_PATH),
		joblib.load(ENCODERS_PATH),
	)


def prepare_features(payload: Dict[str, Any]):
	model, feature_columns, encoders = load_artifacts()
	frame = pd.DataFrame([payload])
	features, _ = engineer_features(frame, encoders=encoders, fit=False)
	features = features.reindex(columns=feature_columns, fill_value=0).astype(float)
	return model, features


def predict(payload: Dict[str, Any]) -> Dict[str, Any]:
	model, features = prepare_features(payload)
	probability = float(model.predict_proba(features)[0, 1])
	return {
		"critical_risk_probability": round(probability, 6),
		"predicted_critical": int(probability >= 0.50),
	}
