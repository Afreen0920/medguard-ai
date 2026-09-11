"""
MedGuard AI - FastAPI Backend Runner
Launches the Uvicorn server hosting the MedGuard AI REST API.
"""

import uvicorn

if __name__ == "__main__":
    print("=" * 60)
    print("MEDGUARD AI - FASTAPI BACKEND SERVER")
    print("Interactive API Docs: http://127.0.0.1:8001/docs")
    print("Health Check:         http://127.0.0.1:8001/health")
    print("Main Predict API:     http://127.0.0.1:8001/predict")
    print("=" * 60)
    uvicorn.run(
        "backend.main:app",
        host="127.0.0.1",
        port=8001,
        reload=True,
    )
