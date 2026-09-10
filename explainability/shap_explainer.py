"""
MedGuard AI - SHAP Explainability Module

This module explains predictions made by the trained MedGuard
XGBoost model.

The ML model predicts critical risk.
SHAP explains which model features pushed that prediction
towards higher or lower risk.
"""

from pathlib import Path

import joblib
import numpy as np
import pandas as pd
import shap

from ml.preprocess import engineer_features


# ============================================================
# PATHS
# ============================================================

BASE_DIR = Path(__file__).resolve().parent.parent

MODEL_PATH = BASE_DIR / "models" / "xgboost_model.pkl"
FEATURE_COLUMNS_PATH = BASE_DIR / "models" / "feature_columns.pkl"
ENCODERS_PATH = BASE_DIR / "models" / "encoders.pkl"


# ============================================================
# FEATURE LABELS
# ============================================================

FEATURE_LABELS = {
    "event_count": "total number of recorded events",
    "recall_count": "number of recalls",
    "safety_alert_count": "number of safety alerts",
    "manufacturer_track_record": "manufacturer event history",
    "risk_class_1": "device risk class 1",
    "risk_class_2": "device risk class 2",
    "risk_class_3": "device risk class 3",
    "risk_class_Unknown": "unknown device risk class",
    "implanted_YES": "implanted status",
    "implanted_NO": "non-implanted status",
    "implanted_Unknown": "unknown implanted status",
}


# ============================================================
# LOAD MODEL ARTIFACTS
# ============================================================

def load_model(model_path=MODEL_PATH):
    """Load the trained XGBoost model."""
    return joblib.load(model_path)


def load_artifacts():
    """
    Load the trained model, feature columns, and encoders.
    """

    model = joblib.load(MODEL_PATH)

    feature_columns = joblib.load(
        FEATURE_COLUMNS_PATH
    )

    encoders = joblib.load(
        ENCODERS_PATH
    )

    return model, feature_columns, encoders


# ============================================================
# PREPARE FEATURES
# ============================================================

def prepare_features(
    df,
    encoders,
    feature_columns,
):
    """
    Apply the same preprocessing used by Vijay's
    prediction pipeline.
    """

    X, _ = engineer_features(
        df.copy(),
        encoders=encoders,
        fit=False,
    )

    X = X.reindex(
        columns=feature_columns,
        fill_value=0,
    )

    X = X.astype(float)

    return X


# ============================================================
# SHAP EXPLAINER
# ============================================================

def create_explainer(model):
    """
    Create a SHAP TreeExplainer for XGBoost.
    """

    return shap.TreeExplainer(model)


def calculate_shap_values(
    explainer,
    X,
):
    """
    Calculate SHAP values.
    """

    if not isinstance(X, pd.DataFrame):
        X = pd.DataFrame(X)

    return explainer(X)


# ============================================================
# FEATURE CONTRIBUTIONS
# ============================================================

def get_feature_contributions(
    shap_explanation,
    feature_names=None,
    row_index=0,
):
    """
    Convert SHAP values for one prediction into
    feature contribution dictionaries.
    """

    values = np.asarray(
        shap_explanation.values
    )

    if values.ndim == 1:
        row_values = values
    else:
        row_values = values[row_index]

    if feature_names is None:
        feature_names = list(
            shap_explanation.feature_names
        )

    contributions = []

    for feature, value in zip(
        feature_names,
        row_values,
    ):

        value = float(value)

        if value > 0:
            direction = "increases risk"
        elif value < 0:
            direction = "decreases risk"
        else:
            direction = "neutral"

        contributions.append(
            {
                "feature": str(feature),
                "shap_value": value,
                "direction": direction,
            }
        )

    return contributions


# ============================================================
# TOP RISK FACTORS
# ============================================================

def get_top_factors(
    shap_explanation,
    feature_names=None,
    top_n=3,
    row_index=0,
):
    """
    Return the strongest positive SHAP contributors.
    """

    contributions = get_feature_contributions(
        shap_explanation,
        feature_names=feature_names,
        row_index=row_index,
    )

    positive = [
        item
        for item in contributions
        if item["shap_value"] > 0
    ]

    positive.sort(
        key=lambda item: item["shap_value"],
        reverse=True,
    )

    return positive[:top_n]


# ============================================================
# PLAIN ENGLISH EXPLANATION
# ============================================================

def build_plain_english_explanation(
    top_factors,
    feature_labels=None,
):
    """
    Convert top SHAP factors into a short
    human-readable explanation.
    """

    if not top_factors:
        return (
            "No individual feature strongly increased "
            "the predicted critical risk."
        )

    if feature_labels is None:
        feature_labels = FEATURE_LABELS

    labels = []

    for factor in top_factors:

        feature = factor["feature"]

        label = feature_labels.get(
            feature,
            feature.replace("_", " "),
        )

        labels.append(label)

    if len(labels) == 1:

        reason = labels[0]

    elif len(labels) == 2:

        reason = (
            f"{labels[0]} and {labels[1]}"
        )

    else:

        reason = (
            ", ".join(labels[:-1])
            + f", and {labels[-1]}"
        )

    return (
        f"Mainly driven by: {reason}."
    )


# ============================================================
# MAIN REUSABLE FUNCTION
# ============================================================

def explain_device(
    df,
    top_n=3,
):
    """
    Generate a complete SHAP explanation for raw
    medical-device data.

    Parameters
    ----------
    df : pandas.DataFrame
        Raw device data.

    top_n : int
        Number of top risk factors.

    Returns
    -------
    dict
        Critical-risk probability,
        predicted class,
        top factors,
        plain-English explanation.
    """

    if not isinstance(df, pd.DataFrame):
        df = pd.DataFrame(df)

    (
        model,
        feature_columns,
        encoders,
    ) = load_artifacts()

    # --------------------------------------------------------
    # Prepare features
    # --------------------------------------------------------

    X = prepare_features(
        df,
        encoders,
        feature_columns,
    )

    # --------------------------------------------------------
    # Model prediction
    # --------------------------------------------------------

    probabilities = model.predict_proba(X)

    predictions = model.predict(X)

    classes = list(model.classes_)

    if 1 not in classes:
        raise ValueError(
            "Model does not contain critical class 1."
        )

    critical_index = classes.index(1)

    critical_probability = (
        probabilities[:, critical_index]
    )

    # --------------------------------------------------------
    # SHAP
    # --------------------------------------------------------

    explainer = create_explainer(model)

    shap_explanation = calculate_shap_values(
        explainer,
        X,
    )

    # --------------------------------------------------------
    # Top factors
    # --------------------------------------------------------

    top_factors = get_top_factors(
        shap_explanation,
        feature_names=feature_columns,
        top_n=top_n,
        row_index=0,
    )

    # --------------------------------------------------------
    # Plain-English explanation
    # --------------------------------------------------------

    explanation = (
        build_plain_english_explanation(
            top_factors
        )
    )

    return {
        "critical_risk_probability": float(
            critical_probability[0]
        ),
        "predicted_critical": int(
            predictions[0]
        ),
        "top_factors": top_factors,
        "explanation": explanation,
    }


# ============================================================
# LOCAL WATERFALL PLOT
# ============================================================

def save_local_waterfall_plot(
    model,
    X,
    output_path="shap_device.png",
):
    """
    Save a local SHAP waterfall plot.
    """

    if not isinstance(X, pd.DataFrame):
        X = pd.DataFrame(X)

    explainer = create_explainer(model)

    shap_explanation = (
        calculate_shap_values(
            explainer,
            X,
        )
    )

    shap.plots.waterfall(
        shap_explanation[0],
        max_display=10,
        show=False,
    )

    import matplotlib.pyplot as plt

    plt.tight_layout()

    plt.savefig(
        output_path,
        dpi=200,
        bbox_inches="tight",
    )

    plt.close()


# ============================================================
# GLOBAL SUMMARY PLOT
# ============================================================

def save_global_summary_plot(
    model,
    X,
    output_path="shap_summary.png",
):
    """
    Save a global SHAP summary plot.
    """

    if not isinstance(X, pd.DataFrame):
        X = pd.DataFrame(X)

    explainer = create_explainer(model)

    shap_explanation = (
        calculate_shap_values(
            explainer,
            X,
        )
    )

    shap.summary_plot(
        shap_explanation,
        X,
        max_display=15,
        show=False,
    )

    import matplotlib.pyplot as plt

    plt.tight_layout()

    plt.savefig(
        output_path,
        dpi=200,
        bbox_inches="tight",
    )

    plt.close()