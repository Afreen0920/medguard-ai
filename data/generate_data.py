import pandas as pd
import os

devices = pd.read_csv(
    r"C:\Users\KIRAN\OneDrive\Desktop\DATA SETS\devices-1681209661.csv",
    low_memory=False
)
manufacturers = pd.read_csv(
    r"C:\Users\KIRAN\OneDrive\Desktop\DATA SETS\manufacturers-1681209657.csv",
    low_memory=False
)
events = pd.read_csv(
    r"C:\Users\KIRAN\OneDrive\Desktop\DATA SETS\events-1681209680.csv",
    low_memory=False
)
print("Datasets loaded successfully!")
print("\nDevices:")
print(devices.head())
print("\nManufacturers:")
print(manufacturers.head())
print("\nEvents:")
print(events.head())

print("Devices:")
print(devices.head())
print("\nEvents:")
print(events.head())
print("\nManufacturers:")
print(manufacturers.head())

print("Devices shape:", devices.shape)
print("Events shape:", events.shape)
print("Manufacturers shape:", manufacturers.shape)

print("Devices missing values:")
print(devices.isnull().sum())
print("\nEvents missing values:")
print(events.isnull().sum())
print("\nManufacturers missing values:")
print(manufacturers.isnull().sum())

print("Devices duplicates:", devices.duplicated().sum())
print("Events duplicates:", events.duplicated().sum())
print("Manufacturers duplicates:", manufacturers.duplicated().sum())

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

devices = devices.drop_duplicates()
events = events.drop_duplicates()
manufacturers = manufacturers.drop_duplicates()

def clean_text_columns(df):
    df = df.copy()
    text_columns = df.select_dtypes(
        include=["object", "string"]
    ).columns
    for col in text_columns:
        df[col] = df[col].astype("string").str.strip()
    return df

devices = clean_text_columns(devices)
events = clean_text_columns(events)
manufacturers = clean_text_columns(manufacturers)

def fill_numeric_missing(df):
    df = df.copy()
    numeric_columns = df.select_dtypes(
        include=["number"]
    ).columns
    for col in numeric_columns:
        if df[col].isnull().sum() > 0:
            df[col] = df[col].fillna(df[col].median())
    return df

devices = fill_numeric_missing(devices)
events = fill_numeric_missing(events)
manufacturers = fill_numeric_missing(manufacturers)

def fill_categorical_missing(df):
    df = df.copy()
    categorical_columns = df.select_dtypes(
        include=["object", "string", "category"]
    ).columns
    for col in categorical_columns:
        if df[col].isnull().sum() > 0:
            df[col] = df[col].fillna("Unknown")
    return df

devices = fill_categorical_missing(devices)
events = fill_categorical_missing(events)
manufacturers = fill_categorical_missing(manufacturers)

def convert_date_columns(df):
    df = df.copy()
    for col in df.columns:
        if (
            "date" in col.lower()
            or "timestamp" in col.lower()
            or "datetime" in col.lower()
        ):
            converted = pd.to_datetime(
                df[col],
                errors="coerce"
            )
            if converted.notna().sum() > 0:
                df[col] = converted
    return df

devices = convert_date_columns(devices)
events = convert_date_columns(events)
manufacturers = convert_date_columns(manufacturers)

devices = devices.reset_index(drop=True)
events = events.reset_index(drop=True)
manufacturers = manufacturers.reset_index(drop=True)

print("Devices missing values:")
print(devices.isnull().sum())
print("\nEvents missing values:")
print(events.isnull().sum())
print("\nManufacturers missing values:")
print(manufacturers.isnull().sum())

print("Devices duplicates:", devices.duplicated().sum())
print("Events duplicates:", events.duplicated().sum())
print("Manufacturers duplicates:", manufacturers.duplicated().sum())

import pandas as pd
import numpy as np
# Load Events dataset
events = pd.read_csv(
    r"C:\Users\KIRAN\OneDrive\Desktop\DATA SETS\events-1681209680.csv",
    low_memory=False,
    na_values=[
        "",
        " ",
        "NA",
        "N/A",
        "na",
        "n/a",
        "NULL",
        "null",
        "None",
        "none",
        "NaN",
        "nan"
    ]
)
print("Original shape:", events.shape)

events.columns = (
    events.columns
    .astype(str)
    .str.strip()
    .str.lower()
    .str.replace(" ", "_", regex=False)
    .str.replace("-", "_", regex=False)
    .str.replace("/", "_", regex=False)
)
print(events.columns)

for col in events.columns:
    if events[col].dtype == "object":
        events[col] = events[col].astype("string").str.strip()
        events[col] = events[col].replace(
            ["", " ", "NA", "N/A", "NULL", "null", "None", "none"],
            pd.NA
        )

text_columns = events.select_dtypes(
    include=["object", "string"]
).columns
for col in text_columns:
    events[col] = events[col].fillna("Unknown")

numeric_columns = events.select_dtypes(
    include=["number"]
).columns
for col in numeric_columns:
    if events[col].isna().sum() > 0:
        events[col] = events[col].fillna(events[col].median())

for col in events.columns:
    if (
        "date" in col.lower()
        or "timestamp" in col.lower()
        or "datetime" in col.lower()
    ):
        events[col] = pd.to_datetime(
            events[col],
            errors="coerce"
        )

for col in events.columns:
    if pd.api.types.is_datetime64_any_dtype(events[col]):
        events[col] = events[col].fillna(
            pd.Timestamp("1900-01-01")
        )

events = events.drop_duplicates()
events = events.reset_index(drop=True)

missing = events.isnull().sum()
print("Missing values after cleaning:")
print(missing[missing > 0])

print("Devices missing values:")
print(devices.isnull().sum())
print("\nEvents missing values:")
print(events.isnull().sum())
print("\nManufacturers missing values:")
print(manufacturers.isnull().sum())

print("Devices duplicates:", devices.duplicated().sum())
print("Events duplicates:", events.duplicated().sum())
print("Manufacturers duplicates:", manufacturers.duplicated().sum())

devices.to_csv(
    "final_clean_devices.csv",
    index=False
)
events.to_csv(
    "final_clean_events.csv",
    index=False
)
manufacturers.to_csv(
    "final_clean_manufacturers.csv",
    index=False
)
print("All cleaned CSV files saved successfully!")

print(os.path.exists("final_clean_devices.csv"))
print(os.path.exists("final_clean_events.csv"))
print(os.path.exists("final_clean_manufacturers.csv"))