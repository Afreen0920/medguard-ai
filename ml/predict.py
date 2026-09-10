from pathlib import Path
import argparse
import joblib
import pandas as pd

from preprocess import engineer_features


BASE_DIR = Path(__file__).resolve().parent.parent
MODEL_DIR = BASE_DIR / "models"

MODEL_PATH = MODEL_DIR / "xgboost_model.pkl"
FEATURE_COLUMNS_PATH = MODEL_DIR / "feature_columns.pkl"
ENCODERS_PATH = MODEL_DIR / "encoders.pkl"


def load_artifacts():
    model = joblib.load(MODEL_PATH)
    feature_columns = joblib.load(FEATURE_COLUMNS_PATH)
    encoders = joblib.load(ENCODERS_PATH)
    return model, feature_columns, encoders


def predict_devices(df):
    model, feature_columns, encoders = load_artifacts()

    X, _ = engineer_features(
        df.copy(),
        encoders=encoders,
        fit=False
    )

    X = X.reindex(
        columns=feature_columns,
        fill_value=0
    )

    X = X.astype(float)

    probabilities = model.predict_proba(X)[:, 1]
    predictions = (probabilities >= 0.50).astype(int)

    result = df.copy()
    result["critical_risk_probability"] = probabilities
    result["predicted_critical"] = predictions

    return result


def main():

    parser = argparse.ArgumentParser(
        description="MedGuard AI - XGBoost Prediction"
    )

    parser.add_argument(
        "--input",
        required=True
    )

    parser.add_argument(
        "--output",
        default="prediction_results.csv"
    )

    args = parser.parse_args()

    print("=" * 60)
    print("MEDGUARD AI - XGBOOST PREDICTION")
    print("=" * 60)

    print("\nLoading trained XGBoost model...")

    if not MODEL_PATH.exists():
        raise FileNotFoundError(
            f"Model not found: {MODEL_PATH}"
        )

    if not FEATURE_COLUMNS_PATH.exists():
        raise FileNotFoundError(
            f"Feature columns not found: {FEATURE_COLUMNS_PATH}"
        )

    if not ENCODERS_PATH.exists():
        raise FileNotFoundError(
            f"Encoders not found: {ENCODERS_PATH}"
        )

    model, feature_columns, encoders = load_artifacts()

    print("Model loaded successfully!")

    print("\nReading input file:")
    print(args.input)

    df = pd.read_csv(args.input)

    print(f"Input shape: {df.shape}")

    result = predict_devices(df)

    result.to_csv(
        args.output,
        index=False
    )

    print("\n" + "=" * 60)
    print("PREDICTION SUCCESS")
    print("=" * 60)

    print("\nPredictions saved to:")
    print(Path(args.output).resolve())

    print("\nPrediction result:")

    print(
        result[
            [
                "critical_risk_probability",
                "predicted_critical"
            ]
        ].to_string(index=False)
    )


if __name__ == "__main__":
    main()
