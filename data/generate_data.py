import pandas as pd
from pathlib import Path


# ============================================================
# 1. PROJECT PATHS
# ============================================================

BASE_DIR = Path(__file__).resolve().parent
RAW_DIR = BASE_DIR / "raw"
PROCESSED_DIR = BASE_DIR / "processed"

PROCESSED_DIR.mkdir(parents=True, exist_ok=True)


# ============================================================
# 2. LOAD DATASETS
# ============================================================

devices = pd.read_csv(
    RAW_DIR / "devices-1681209661.csv",
    low_memory=False
)

events = pd.read_csv(
    RAW_DIR / "events-1681209680.csv",
    low_memory=False
)

manufacturers = pd.read_csv(
    RAW_DIR / "manufacturers-1681209657.csv",
    low_memory=False
)

print("Datasets loaded successfully!\n")

print("Devices shape:", devices.shape)
print("Events shape:", events.shape)
print("Manufacturers shape:", manufacturers.shape)


# ============================================================
# 3. CLEAN COLUMN NAMES
# ============================================================

def clean_column_names(df):
    df = df.copy()

    df.columns = (
        df.columns
        .astype(str)
        .str.strip()
        .str.lower()
        .str.replace(" ", "_", regex=False)
        .str.replace("-", "_", regex=False)
        .str.replace("/", "_", regex=False)
    )

    return df


devices = clean_column_names(devices)
events = clean_column_names(events)
manufacturers = clean_column_names(manufacturers)


# ============================================================
# 4. REMOVE EXACT DUPLICATES
# ============================================================

print("\nDuplicates before cleaning:")

print("Devices:", devices.duplicated().sum())
print("Events:", events.duplicated().sum())
print("Manufacturers:", manufacturers.duplicated().sum())

devices = devices.drop_duplicates()
events = events.drop_duplicates()
manufacturers = manufacturers.drop_duplicates()


# ============================================================
# 5. CLEAN TEXT COLUMNS
# ============================================================

def clean_text_columns(df):

    df = df.copy()

    text_columns = df.select_dtypes(
        include=["object", "string"]
    ).columns

    for col in text_columns:
        df[col] = (
            df[col]
            .astype("string")
            .str.strip()
        )

        # Convert common missing-value strings to NA
        df[col] = df[col].replace(
            [
                "",
                " ",
                "NA",
                "N/A",
                "NULL",
                "null",
                "None",
                "none",
                "NaN",
                "nan"
            ],
            pd.NA
        )

    return df


devices = clean_text_columns(devices)
events = clean_text_columns(events)
manufacturers = clean_text_columns(manufacturers)


# ============================================================
# 6. HANDLE MISSING CATEGORICAL VALUES
# ============================================================

def fill_categorical_missing(df):

    df = df.copy()

    categorical_columns = df.select_dtypes(
        include=["object", "string", "category"]
    ).columns

    for col in categorical_columns:
        df[col] = df[col].fillna("Unknown")

    return df


devices = fill_categorical_missing(devices)
events = fill_categorical_missing(events)
manufacturers = fill_categorical_missing(manufacturers)


# ============================================================
# 7. CONVERT DATE COLUMNS
# ============================================================

def convert_date_columns(df):

    df = df.copy()

    for col in df.columns:

        if any(
            keyword in col.lower()
            for keyword in ["date", "timestamp", "datetime"]
        ):

            df[col] = pd.to_datetime(
                df[col],
                errors="coerce"
            )

    return df


devices = convert_date_columns(devices)
events = convert_date_columns(events)
manufacturers = convert_date_columns(manufacturers)


# ============================================================
# 8. HANDLE NUMERIC MISSING VALUES
# ============================================================

def fill_numeric_missing(df):

    df = df.copy()

    numeric_columns = df.select_dtypes(
        include=["number"]
    ).columns

    for col in numeric_columns:

        # Do NOT fill identifier columns with median values
        if (
            col == "id"
            or col.endswith("_id")
            or col == "device_id"
            or col == "manufacturer_id"
        ):
            continue

        if df[col].isna().sum() > 0:

            median_value = df[col].median()

            if pd.notna(median_value):
                df[col] = df[col].fillna(median_value)

    return df


devices = fill_numeric_missing(devices)
events = fill_numeric_missing(events)
manufacturers = fill_numeric_missing(manufacturers)


# ============================================================
# 9. RESET INDEX
# ============================================================

devices = devices.reset_index(drop=True)
events = events.reset_index(drop=True)
manufacturers = manufacturers.reset_index(drop=True)


# ============================================================
# 10. FINAL QUALITY CHECK
# ============================================================

def quality_report(df, name):

    print(f"\n========== {name} ==========")

    print("Shape:", df.shape)

    print("\nMissing values:")

    missing = df.isna().sum()

    if missing.sum() == 0:
        print("No missing values.")
    else:
        print(missing[missing > 0])

    print("\nDuplicate rows:", df.duplicated().sum())


quality_report(devices, "DEVICES")
quality_report(events, "EVENTS")
quality_report(manufacturers, "MANUFACTURERS")


# ============================================================
# 11. SAVE CLEAN DATA
# ============================================================

devices.to_csv(
    PROCESSED_DIR / "final_clean_devices.csv",
    index=False
)

events.to_csv(
    PROCESSED_DIR / "final_clean_events.csv",
    index=False
)

manufacturers.to_csv(
    PROCESSED_DIR / "final_clean_manufacturers.csv",
    index=False
)


print("\n===================================")
print("Cleaning completed successfully!")
print("===================================")

print(
    "\nFiles saved in:",
    PROCESSED_DIR
)