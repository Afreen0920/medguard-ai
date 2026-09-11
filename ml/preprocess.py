import joblib
import numpy as np
import pandas as pd

from pathlib import Path


# ============================================================
# CONFIGURATION
# ============================================================

BASE_DIR = Path(__file__).resolve().parent.parent

MODEL_DIR = BASE_DIR / "models"

MODEL_DIR.mkdir(
    parents=True,
    exist_ok=True
)

TARGET_COL = "is_critical"
LABEL_KNOWN_COL = "severity_known"

CATEGORICAL_COLS = [
    "risk_class",
    "classification",
    "implanted",
    "country"
]

NUMERIC_COLS = [
    "event_count",
    "recall_count",
    "safety_alert_count"
]

ENCODERS_PATH = MODEL_DIR / "encoders.pkl"

FEATURE_COLUMNS_PATH = MODEL_DIR / "feature_columns.pkl"

MISSING_TOKEN = "Unknown"


# ============================================================
# 1. LOAD CSV / EXCEL
# ============================================================

def load_table(path):

    path = Path(path)

    if path.suffix.lower() in [".xlsx", ".xls"]:
        return pd.read_excel(path)

    return pd.read_csv(
        path,
        low_memory=False
    )


# ============================================================
# 2. LOAD DATA
# ============================================================

def load_data(path):

    return load_table(path)


# ============================================================
# 3. STANDARDIZE RISK CLASS
# ============================================================

def _standardize_risk_class(value):

    value = str(value).strip()

    mapping = {
        "1": "1",
        "2": "2",
        "3": "3",
        "II": "2"
    }

    return mapping.get(
        value,
        MISSING_TOKEN
    )


# ============================================================
# 4. STANDARDIZE IMPLANTED
# ============================================================

def _standardize_implanted(value):

    value = str(value).strip().upper()

    if value in ["YES", "NO"]:
        return value

    return MISSING_TOKEN


# ============================================================
# 5. CLEAN CATEGORICAL DATA
# ============================================================

def _clean_categoricals(df):

    df = df.copy()

    df["risk_class"] = df[
        "risk_class"
    ].apply(
        _standardize_risk_class
    )

    df["implanted"] = df[
        "implanted"
    ].apply(
        _standardize_implanted
    )

    df["classification"] = df[
        "classification"
    ].fillna(
        MISSING_TOKEN
    )

    df["country"] = df[
        "country"
    ].fillna(
        MISSING_TOKEN
    )

    return df


# ============================================================
# 6. MANUFACTURER TRACK RECORD
# ============================================================

def _manufacturer_track_record(df):

    counts = df[
        "manufacturer_id"
    ].value_counts()

    return df[
        "manufacturer_id"
    ].map(
        counts
    ).fillna(0)


# ============================================================
# 7. BUILD EVENT FEATURES
# ============================================================

def _build_event_aggregates(events):

    events = events.copy()

    severity_map = {

        "Class 1": "Class I",
        "I": "Class I",
        "Class I": "Class I",

        "Class 2": "Class II",
        "II": "Class II",
        "Class II": "Class II",

        "Class 3": "Class III",
        "III": "Class III",
        "Class III": "Class III"
    }

    events["severity"] = events[
        "action_classification"
    ].map(
        severity_map
    )

    def simplify_type(value):

        value = str(value)

        if "Recall" in value:
            return "Recall"

        if (
            "Safety alert" in value
            or "Safety Notice" in value
        ):
            return "Safety Alert"

        return value

    events["event_type"] = events[
        "type"
    ].apply(
        simplify_type
    )

    aggregate = events.groupby(
        "device_id"
    ).agg(

        event_count=(
            "id",
            "count"
        ),

        recall_count=(
            "event_type",
            lambda x: (
                x == "Recall"
            ).sum()
        ),

        safety_alert_count=(
            "event_type",
            lambda x: (
                x == "Safety Alert"
            ).sum()
        ),

        max_severity=(
            "severity",
            lambda x:
            x.dropna().min()
            if x.notna().any()
            else np.nan
        )
    ).reset_index()

    return aggregate


# ============================================================
# 8. MERGE THREE DATASETS
# ============================================================

def load_and_merge(
    devices_path,
    manufacturers_path,
    events_path=None
):

    devices = load_table(
        devices_path
    )

    manufacturers = load_table(
        manufacturers_path
    )

    # --------------------------------------------------------
    # Devices + Manufacturers
    # --------------------------------------------------------

    manufacturer_cols = ["id", "name"]

    if "parent_company" in manufacturers.columns:
        manufacturer_cols.append("parent_company")

    manufacturer_data = manufacturers[
        manufacturer_cols
    ].rename(
        columns={
            "id": "manufacturer_id",
            "name": "manufacturer_name"
        }
    )

    if "parent_company" not in manufacturer_data.columns:
        manufacturer_data["parent_company"] = "Unknown"

    df = devices.merge(
        manufacturer_data,
        on="manufacturer_id",
        how="left"
    )

    # --------------------------------------------------------
    # Events
    # --------------------------------------------------------

    if events_path is not None:

        events = load_table(
            events_path
        )

        event_data = _build_event_aggregates(
            events
        )

        df = df.merge(
            event_data,
            left_on="id",
            right_on="device_id",
            how="left"
        )

        df["event_count"] = df[
            "event_count"
        ].fillna(0)

        df["recall_count"] = df[
            "recall_count"
        ].fillna(0)

        df["safety_alert_count"] = df[
            "safety_alert_count"
        ].fillna(0)

        # Critical = worst event was Class I

        df["is_critical"] = (
            df["max_severity"]
            == "Class I"
        ).astype(int)

        df["severity_known"] = (
            df["max_severity"]
            .notna()
        ).astype(int)

    return df


# ============================================================
# 9. FEATURE ENGINEERING
# ============================================================

def engineer_features(
    df,
    encoders=None,
    fit=True
):

    df = df.copy()

    df = _clean_categoricals(
        df
    )

    # Manufacturer history
    df[
        "manufacturer_track_record"
    ] = _manufacturer_track_record(
        df
    )

    # Make sure event columns exist
    for col in NUMERIC_COLS:

        if col not in df.columns:
            df[col] = 0

    if encoders is None:
        encoders = {}

    feature_frames = []

    # Numeric features
    numeric_data = df[
        NUMERIC_COLS
        + ["manufacturer_track_record"]
    ].reset_index(
        drop=True
    )

    feature_frames.append(
        numeric_data
    )

    # Categorical features
    for col in CATEGORICAL_COLS:

        if fit:

            dummies = pd.get_dummies(
                df[col],
                prefix=col
            )

            encoders[
                f"{col}_columns"
            ] = dummies.columns.tolist()

        else:

            known_columns = encoders[
                f"{col}_columns"
            ]

            dummies = pd.get_dummies(
                df[col],
                prefix=col
            )

            dummies = dummies.reindex(
                columns=known_columns,
                fill_value=0
            )

        feature_frames.append(
            dummies.reset_index(
                drop=True
            )
        )

    X = pd.concat(
        feature_frames,
        axis=1
    )

    X = X.fillna(0)

    return X, encoders


# ============================================================
# 10. PREPARE TRAINING DATA
# ============================================================

def prepare_training_data(df):

    if (
        TARGET_COL not in df.columns
        or LABEL_KNOWN_COL not in df.columns
    ):

        raise ValueError(
            "Training requires the events file."
        )

    # Only records with known severity
    labeled = df[
        df[LABEL_KNOWN_COL] == 1
    ].copy()

    y = labeled[
        TARGET_COL
    ].astype(int)

    X, encoders = engineer_features(
        labeled,
        fit=True
    )

    return (
        X,
        y,
        encoders
    )


# ============================================================
# 11. SAVE ENCODERS
# ============================================================

def save_encoders(
    encoders,
    path=ENCODERS_PATH
):

    joblib.dump(
        encoders,
        path
    )


# ============================================================
# 12. LOAD ENCODERS
# ============================================================

def load_encoders(
    path=ENCODERS_PATH
):

    return joblib.load(
        path
    )


# ============================================================
# TEST
# ============================================================

if __name__ == "__main__":

    print(
        "Preprocessing module loaded successfully."
    )