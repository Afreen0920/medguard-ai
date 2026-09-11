from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.routes.predict import router as predict_router
from backend.routes.alerts import router as alerts_router
from backend.routes.equipment import router as equipment_router
from backend.routes.maintenance import router as maintenance_router
from backend.schemas import HealthResponse
from backend.services.prediction_service import artifacts_available


app = FastAPI(
	title="MedGuard AI API",
	version="1.0.0",
	description="Medical equipment failure prediction, explanation, and maintenance decisions.",
)
app.add_middleware(
	CORSMiddleware,
	allow_origins=[
		"http://localhost:5173",
		"http://127.0.0.1:5173",
		"http://localhost:3000",
		"http://127.0.0.1:3000",
		"http://localhost:4173",
		"http://127.0.0.1:4173",
	],
	allow_origin_regex=r"^https?://(localhost|127\.0\.0\.1)(:\d+)?$",
	allow_credentials=True,
	allow_methods=["*"],
	allow_headers=["*"],
)
app.include_router(predict_router)
app.include_router(equipment_router)
app.include_router(maintenance_router)
app.include_router(alerts_router)


@app.get("/health", response_model=HealthResponse, tags=["system"])
def health() -> HealthResponse:
	return HealthResponse(status="ok", model_loaded=artifacts_available())
