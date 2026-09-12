# MedGuard AI

MedGuard AI is a medical-equipment predictive-maintenance application. It combines:

1. Data preparation and feature engineering with pandas.
2. An XGBoost binary classifier for critical-failure risk.
3. SHAP explanations for the most influential features.
4. A maintenance agent that creates priority, recommendation, alert, and human-review decisions.
5. A FastAPI backend and React/Vite frontend.

## Project Structure

```text
medguard-ai/
|-- backend/                         FastAPI application
|   |-- main.py                      API app and CORS configuration
|   |-- schemas.py                   Request and response models
|   |-- routes/                      Prediction, equipment, alert, maintenance routes
|   |-- services/                    Prediction, SHAP, and agent orchestration
|   `-- database/                    SQLite connection, models, and CRUD
|-- ml/
|   |-- data/raw/                    Original device, manufacturer, and event CSV files
|   |-- data/processed/              Processed medical-failure dataset
|   |-- preprocess.py                Cleaning and feature engineering
|   |-- train.py                     XGBoost training and evaluation
|   `-- predict.py                   Batch prediction script
|-- models/                          Runtime model artifacts used by the backend
|-- agent/                           Maintenance decision logic
|-- explainability/                  SHAP utilities and tests
|-- frontend/                        React/Vite application
|-- data/                            Data-generation utilities
|-- tests/                           Backend tests
|-- requirements.txt                 Python dependencies
`-- run_backend.py                   Uvicorn runner on port 8001
```

## Requirements and Installation

- Python 3.10 or newer
- Node.js and npm

From the repository root:

```bash
python -m pip install -r requirements.txt
cd frontend
npm install
cd ..
```

## 1. Raw Data

Training inputs are stored in `ml/data/raw/`:

- `devices-1681209661.csv`: device attributes.
- `manufacturers-1681209657.csv`: manufacturer metadata.
- `events-1681209680.csv`: device events and maintenance history.

The training pipeline merges these files by device and manufacturer identifiers. Keep the column names expected by `ml/preprocess.py` when replacing the raw files.

## 2. Data Cleaning and Feature Engineering

`ml/preprocess.py` performs the following steps:

1. Loads CSV or Excel tables.
2. Merges devices with manufacturer metadata.
3. Normalizes risk-class values such as `II` to `2`.
4. Normalizes implanted values to `YES` or `NO`.
5. Fills missing categorical values with `Unknown`.
6. Aggregates events by device.
7. Calculates event, recall, safety-alert, and worst-severity features.
8. Keeps records with known severity labels for supervised training.
9. Calculates manufacturer track record.
10. One-hot encodes categorical features using saved encoder columns.

The current processed dataset is `ml/data/processed/medical_failure_dataset.csv`. It contains 500 unique devices. It is used by the current Equipment API as the application equipment source.

## 3. Train the XGBoost Model

From the `ml` directory:

```bash
cd ml
python train.py
cd ..
```

Training loads and cleans the raw data, creates features, splits train/test data, balances the training set with SMOTE, trains XGBoost, calculates accuracy/precision/recall/F1/ROC-AUC, and saves artifacts.

Runtime artifacts are saved in the root `models/` directory:

- `models/xgboost_model.pkl`
- `models/feature_columns.pkl`
- `models/encoders.pkl`
- `models/xgboost_results.csv`

The backend uses these saved artifacts for prediction and does not retrain during an API request.

## 4. Run Batch Predictions

```bash
python ml/predict.py --input ml/test_input.csv --output prediction_results.csv
```

This applies the saved encoders and feature-column order before writing probabilities and binary predictions.

## 5. Runtime Prediction Flow

```text
Frontend form
    -> FastAPI /predict
    -> engineer_features(fit=False)
    -> saved encoders and feature columns
    -> saved XGBoost model
    -> SHAP explanation
    -> maintenance agent decision
    -> SQLite equipment and alert persistence
    -> JSON response to frontend
```

## 6. Start the Backend

The repository runner uses port `8001`:

```bash
python run_backend.py
```

Equivalent command:

```bash
python -m uvicorn backend.main:app --reload --host 127.0.0.1 --port 8001
```

The current Vite proxy is configured for port `8002`. To run the frontend with its default configuration, use:

```bash
python -m uvicorn backend.main:app --reload --host 127.0.0.1 --port 8002
```

Check the service:

- Health: `http://127.0.0.1:8002/health`
- Swagger UI: `http://127.0.0.1:8002/docs`

Expected health response:

```json
{"status":"ok","model_loaded":true}
```

## 7. Start the Frontend

From the repository root:

```bash
cd frontend
npm run dev -- --host 127.0.0.1 --port 5174
```

Open `http://127.0.0.1:5174/`.

The frontend uses the same-origin `/api` proxy by default. The proxy forwards requests to the backend on port `8002`. To use another backend URL, set `VITE_API_URL` before starting Vite.

For a production build:

```bash
npm run build
npm run preview
```

## 8. Use the Application

1. Open the frontend URL.
2. Sign in.
3. Open **Analyze Equipment**.
4. Select one of the processed numeric device IDs `1` through `500`.
5. Review the device fields loaded from the processed data.
6. Submit **Analyze Equipment**.
7. Review the risk probability and visual risk chart.
8. Review SHAP key drivers under **Risk Explanation**.
9. Review maintenance priority, alert status, and recommended action under **Maintenance Review**.
10. Approve, reject, or request additional inspection in **Human Review**.

## API Endpoints

### Health

```http
GET /health
```

### Prediction

```http
POST /predict
```

The response contains `prediction`, `explanation`, and `decision` objects.

### Processed Equipment

```http
GET /equipment?status=All&search=
GET /equipment/{equipment_id}/shap
GET /equipment/{equipment_id}/recommendation
```

The current `/equipment` endpoint reads the processed 500-device CSV and calculates a model probability for each record.

### Alerts

```http
GET /alerts
POST /alerts/{alert_id}/acknowledge
POST /alerts/{alert_id}/resolve
```

High and critical prediction decisions can create SQLite-backed alerts.

## Database and Persistence

The default SQLite database is `medguard.db` in the repository root. To use another location:

```powershell
$env:MEDGUARD_DB_PATH = "C:\path\to\medguard.db"
```

SQLite stores application records and alerts. The processed CSV remains the source for the current 500-device Equipment API.

## Tests and Validation

Frontend build:

```bash
cd frontend
npm run build
```

Agent integration test:

```bash
python -m agent.test_agent_integration
```

Backend tests:

```bash
pytest
```

Check the processed dataset:

```bash
python -c "import pandas as pd; df = pd.read_csv('ml/data/processed/medical_failure_dataset.csv'); print(len(df), df['device_id'].nunique())"
```

Expected result:

```text
500 500
```

## Troubleshooting

### Dashboard or Assessment shows no data

1. Start the backend on port `8002`.
2. Open `http://127.0.0.1:8002/health`.
3. Confirm `model_loaded` is `true`.
4. Open `http://127.0.0.1:8002/equipment?status=All`.
5. Restart Vite and hard-refresh with `Ctrl+F5`.

### Port already in use

Stop the existing Uvicorn process or choose another port, then update the Vite proxy or `VITE_API_URL` to match.

### Model artifacts are missing

```bash
cd ml
python train.py
```

### SHAP import fails

```bash
python -m pip install -r requirements.txt
```

## Data Source Summary

- Raw CSV files provide the original training inputs.
- `ml/data/processed/medical_failure_dataset.csv` contains the current 500 processed devices.
- Files in `models/` are used for runtime predictions.
- SQLite stores application-created records and alerts.
- The frontend sends requests to FastAPI; it does not train the model.
