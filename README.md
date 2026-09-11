# MedGuard AI

MedGuard AI predicts medical equipment critical-failure risk and combines three
layers in one FastAPI workflow:

1. XGBoost predicts the critical-risk probability.
2. SHAP explains the strongest feature contributions.
3. The maintenance agent converts the result into priority, recommendation,
   alert, and human-review decisions.

## Run locally

From the repository root:

```bash
pip install -r requirements.txt
uvicorn backend.main:app --reload --host 127.0.0.1 --port 8001
```

In a second terminal:

```bash
cd frontend
npm install
npm run dev
```

Open `http://127.0.0.1:5173/`. FastAPI documentation is available at
`http://127.0.0.1:8001/docs`.

## Test the integration

```bash
python -m agent.test_agent_integration
```

The frontend sends prediction requests to `VITE_API_URL` when set, or to
`http://127.0.0.1:8001` by default.

## Persistence

Equipment and alerts are stored in SQLite. The default database file is
`medguard.db` in the repository root. Set `MEDGUARD_DB_PATH` to use another
location.
