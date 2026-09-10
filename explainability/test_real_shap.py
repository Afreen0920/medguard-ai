"""
MedGuard AI - Real Model SHAP Explainability Test
This script uses Vijay's trained XGBoost model and the
same preprocessing used during prediction.
It:
1. Loads the trained XGBoost model
2. Loads the saved feature columns
3. Loads the saved encoders
4. Reads ml/test_input.csv
5. Applies the same feature engineering
6. Calculates SHAP values
7. Finds the top features increasing risk
8. Generates a plain-English explanation
9. Saves SHAP plots
"""
from pathlib import Path
import joblib
import pandas as pd
import shap
import matplotlib.pyplot as plt
from ml.preprocess import engineer_features
# ============================================================
# PATHS
# ============================================================
BASE_DIR = Path(__file__).resolve().parent.parent
MODEL_PATH = BASE_DIR / "models" / "xgboost_model.pkl"
FEATURE_COLUMNS_PATH = BASE_DIR / "models" / "feature_columns.pkl"
ENCODERS_PATH = BASE_DIR / "models" / "encoders.pkl"
INPUT_PATH = BASE_DIR / "ml" / "test_input.csv"
SUMMARY_PLOT_PATH = (
    BASE_DIR / "explainability" / "shap_summary_real.png"
)
WATERFALL_PLOT_PATH = (
    BASE_DIR / "explainability" / "shap_device_real.png"
)
# ============================================================
# LOAD MODEL ARTIFACTS
# ============================================================
print("=" * 70)
print("MEDGUARD AI - REAL MODEL SHAP EXPLAINABILITY")
print("=" * 70)
print("\nLoading model...")
model = joblib.load(MODEL_PATH)
print("Model loaded:")
print(type(model))
print("\nLoading feature columns...")
feature_columns = joblib.load(
    FEATURE_COLUMNS_PATH
)
print("Number of features:", len(feature_columns))


print("\nLoading encoders...")

encoders = joblib.load(
    ENCODERS_PATH
)

print("Encoders loaded successfully.")


# ============================================================
# LOAD INPUT
# ============================================================

print("\nLoading test input...")

df = pd.read_csv(INPUT_PATH)

print("Input shape:", df.shape)

print("\nInput columns:")
print(df.columns.tolist())


# ============================================================
# APPLY SAME PREPROCESSING AS PREDICT.PY
# ============================================================

print("\nApplying Vijay's feature engineering...")

X, _ = engineer_features(
    df.copy(),
    encoders=encoders,
    fit=False
)

# IMPORTANT:
# Use exactly the same feature order as the trained model.

X = X.reindex(
    columns=feature_columns,
    fill_value=0
)

X = X.astype(float)

print("\nFinal SHAP input shape:", X.shape)

print("\nFinal feature columns:")
print(X.columns.tolist())


# ============================================================
# MODEL PREDICTION
# ============================================================

print("\nCalculating model prediction...")

probabilities = model.predict_proba(X)

predictions = model.predict(X)

print("\nModel classes:")
print(model.classes_)

print("\nPrediction probabilities:")
print(probabilities)

print("\nPredicted class:")
print(predictions)


# ============================================================
# FAILURE / CRITICAL RISK PROBABILITY
# ============================================================

# Vijay's predict.py uses [:, 1].
# We use the same definition here.

critical_probability = probabilities[:, 1]

print("\nCritical risk probability:")

for index, probability in enumerate(
    critical_probability
):
    print(
        f"Device {index + 1}: "
        f"{probability:.4%}"
    )


# ============================================================
# SHAP EXPLAINER
# ============================================================

print("\nCreating SHAP TreeExplainer...")

explainer = shap.TreeExplainer(
    model
)

print("SHAP explainer created successfully.")


# ============================================================
# CALCULATE SHAP VALUES
# ============================================================

print("\nCalculating SHAP values...")

shap_explanation = explainer(X)

print("SHAP calculation completed.")

print(
    "SHAP value shape:",
    shap_explanation.values.shape
)


# ============================================================
# EXPLAIN FIRST DEVICE
# ============================================================

device_index = 0

device_shap_values = shap_explanation.values[
    device_index
]

device_features = X.iloc[
    device_index
]


# ============================================================
# BUILD CONTRIBUTION TABLE
# ============================================================

contributions = pd.DataFrame(
    {
        "feature": feature_columns,
        "feature_value": device_features.values,
        "shap_value": device_shap_values
    }
)


# ============================================================
# TOP FEATURES INCREASING RISK
# ============================================================

risk_increasing = contributions[
    contributions["shap_value"] > 0
].copy()

risk_increasing = risk_increasing.sort_values(
    by="shap_value",
    ascending=False
)

top_factors = risk_increasing.head(3)


# ============================================================
# TOP FEATURES DECREASING RISK
# ============================================================

risk_decreasing = contributions[
    contributions["shap_value"] < 0
].copy()

risk_decreasing["absolute_shap"] = (
    risk_decreasing["shap_value"].abs()
)

risk_decreasing = risk_decreasing.sort_values(
    by="absolute_shap",
    ascending=False
)

top_protective_factors = (
    risk_decreasing.head(3)
)


# ============================================================
# DISPLAY RESULTS
# ============================================================

print("\n" + "=" * 70)
print("DEVICE SHAP EXPLANATION")
print("=" * 70)

print(
    f"\nCritical risk probability: "
    f"{critical_probability[device_index]:.4%}"
)

print(
    f"Predicted critical: "
    f"{predictions[device_index]}"
)


print("\nTop factors increasing critical risk:")

if top_factors.empty:

    print(
        "No features with positive SHAP contribution."
    )

else:

    for rank, (_, row) in enumerate(
        top_factors.iterrows(),
        start=1
    ):

        print(
            f"{rank}. {row['feature']} "
            f"(value={row['feature_value']}, "
            f"SHAP={row['shap_value']:.6f})"
        )


print("\nTop factors decreasing critical risk:")

if top_protective_factors.empty:

    print(
        "No features with negative SHAP contribution."
    )

else:

    for rank, (_, row) in enumerate(
        top_protective_factors.iterrows(),
        start=1
    ):

        print(
            f"{rank}. {row['feature']} "
            f"(value={row['feature_value']}, "
            f"SHAP={row['shap_value']:.6f})"
        )


# ============================================================
# PLAIN ENGLISH FEATURE LABELS
# ============================================================

FEATURE_LABELS = {

    "event_count":
        "total number of recorded events",

    "recall_count":
        "number of recalls",

    "safety_alert_count":
        "number of safety alerts",

    "manufacturer_track_record":
        "manufacturer event history",

    "risk_class_1":
        "device risk class 1",

    "risk_class_2":
        "device risk class 2",

    "risk_class_3":
        "device risk class 3",

    "risk_class_Unknown":
        "unknown device risk class",

    "implanted_YES":
        "whether the device is implanted",

    "implanted_NO":
        "whether the device is not implanted",

    "implanted_Unknown":
        "unknown implanted status"
}


# ============================================================
# BUILD PLAIN ENGLISH EXPLANATION
# ============================================================

labels = []

for _, row in top_factors.iterrows():

    feature = row["feature"]

    label = FEATURE_LABELS.get(
        feature,
        feature.replace("_", " ")
    )

    labels.append(label)


if len(labels) == 0:

    explanation = (
        "No individual feature strongly increased "
        "the predicted critical risk."
    )

elif len(labels) == 1:

    explanation = (
        f"Mainly driven by {labels[0]}."
    )

elif len(labels) == 2:

    explanation = (
        f"Mainly driven by {labels[0]} "
        f"and {labels[1]}."
    )

else:

    explanation = (
        f"Mainly driven by {labels[0]}, "
        f"{labels[1]}, and {labels[2]}."
    )


print("\nPlain-English explanation:")

print(explanation)


# ============================================================
# SAVE LOCAL WATERFALL PLOT
# ============================================================

print("\nSaving local SHAP waterfall plot...")

shap.plots.waterfall(
    shap_explanation[device_index],
    max_display=10,
    show=False
)

plt.tight_layout()

plt.savefig(
    WATERFALL_PLOT_PATH,
    dpi=200,
    bbox_inches="tight"
)

plt.close()

print(
    "Saved:",
    WATERFALL_PLOT_PATH
)


# ============================================================
# SAVE GLOBAL SUMMARY PLOT
# ============================================================

print("\nSaving SHAP summary plot...")

shap.summary_plot(
    shap_explanation,
    X,
    max_display=15,
    show=False
)

plt.tight_layout()

plt.savefig(
    SUMMARY_PLOT_PATH,
    dpi=200,
    bbox_inches="tight"
)

plt.close()
print(
    "Saved:",
    SUMMARY_PLOT_PATH
)
# ============================================================
# FINISHED
# ============================================================

print("\n" + "=" * 70)
print("SHAP EXPLAINABILITY TEST COMPLETED")
print("=" * 70)