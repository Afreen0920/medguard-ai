import joblib
import pandas as pd

from pathlib import Path
from sklearn.model_selection import train_test_split
from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    roc_auc_score,
    classification_report
)
from xgboost import XGBClassifier
from imblearn.over_sampling import SMOTE

from preprocess import (
    load_and_merge,
    prepare_training_data,
    save_encoders,
    FEATURE_COLUMNS_PATH
)


# ============================================================
# PATHS
# ============================================================

BASE_DIR = Path(__file__).resolve().parent.parent
MODEL_DIR = BASE_DIR / "models"

MODEL_DIR.mkdir(
    parents=True,
    exist_ok=True
)

MODEL_PATH = MODEL_DIR / "xgboost_model.pkl"
RESULTS_PATH = MODEL_DIR / "xgboost_results.csv"


# ============================================================
# TRAINING
# ============================================================

def run_training(
    devices_path,
    manufacturers_path,
    events_path
):

    print("=" * 60)
    print("MEDGUARD AI - XGBOOST TRAINING")
    print("=" * 60)

    # Load and merge datasets
    print("\nLoading datasets...")

    df = load_and_merge(
        devices_path,
        manufacturers_path,
        events_path
    )

    print("Merged data shape:", df.shape)

    # Prepare features and target
    X, y, encoders = prepare_training_data(df)

    print("\nFeature shape:", X.shape)
    print("Target distribution:")
    print(y.value_counts())

    # Train/test split
    X_train, X_test, y_train, y_test = train_test_split(
        X,
        y,
        test_size=0.20,
        random_state=42,
        stratify=y
    )

    print("\nTraining samples:", len(X_train))
    print("Testing samples:", len(X_test))

    # Balance training data
    print("\nApplying SMOTE...")

    smote = SMOTE(random_state=42)

    X_train, y_train = smote.fit_resample(
        X_train,
        y_train
    )

    print("Balanced training samples:", len(X_train))

    # ========================================================
    # XGBOOST MODEL
    # ========================================================

    print("\nTraining XGBoost...")

    model = XGBClassifier(
        n_estimators=300,
        max_depth=4,
        learning_rate=0.05,
        subsample=0.8,
        colsample_bytree=0.8,
        objective="binary:logistic",
        eval_metric="logloss",
        random_state=42,
        n_jobs=-1
    )

    model.fit(
        X_train,
        y_train
    )

    print("XGBoost training completed!")

    # ========================================================
    # EVALUATION
    # ========================================================

    predictions = model.predict(X_test)

    probabilities = model.predict_proba(X_test)[:, 1]

    accuracy = accuracy_score(
        y_test,
        predictions
    )

    precision = precision_score(
        y_test,
        predictions,
        zero_division=0
    )

    recall = recall_score(
        y_test,
        predictions,
        zero_division=0
    )

    f1 = f1_score(
        y_test,
        predictions,
        zero_division=0
    )

    roc_auc = roc_auc_score(
        y_test,
        probabilities
    )

    print("\n" + "=" * 60)
    print("XGBOOST RESULTS")
    print("=" * 60)

    print(f"Accuracy : {accuracy:.4f}")
    print(f"Precision: {precision:.4f}")
    print(f"Recall   : {recall:.4f}")
    print(f"F1 Score : {f1:.4f}")
    print(f"ROC-AUC  : {roc_auc:.4f}")

    print("\nClassification Report:")
    print(
        classification_report(
            y_test,
            predictions,
            zero_division=0
        )
    )

    # ========================================================
    # SAVE RESULTS
    # ========================================================

    results = pd.DataFrame([
        {
            "Model": "XGBoost",
            "Accuracy": accuracy,
            "Precision": precision,
            "Recall": recall,
            "F1 Score": f1,
            "ROC-AUC": roc_auc
        }
    ])

    results.to_csv(
        RESULTS_PATH,
        index=False
    )

    # ========================================================
    # SAVE MODEL
    # ========================================================

    joblib.dump(
        model,
        MODEL_PATH
    )

    joblib.dump(
        list(X.columns),
        MODEL_DIR / "feature_columns.pkl"
    )

    save_encoders(
        encoders,
        MODEL_DIR / "encoders.pkl"
    )

    print("\n" + "=" * 60)
    print("SUCCESS")
    print("=" * 60)

    print("\nXGBoost model saved as:")
    print(MODEL_PATH)

    print("\nOther files:")
    print(MODEL_DIR / "feature_columns.pkl")
    print(MODEL_DIR / "encoders.pkl")
    print(RESULTS_PATH)


# ============================================================
# RUN
# ============================================================

if __name__ == "__main__":

    run_training(
        "final_clean_devices.xlsx",
        "final_clean_manufacturers.xlsx",
        "final_clean_events.xlsx"
    )