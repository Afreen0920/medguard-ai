import unittest
from fastapi.testclient import TestClient
from backend.main import app
from backend.database.crud import list_equipment, list_alerts

client = TestClient(app)


class TestMedGuardBackendAPI(unittest.TestCase):

    def test_01_health(self):
        """Test health check endpoint."""
        response = client.get("/health")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["status"], "ok")
        self.assertTrue(data["model_loaded"])

    def test_02_predict_normal_equipment(self):
        """Test /predict with a standard equipment profile."""
        payload = {
            "classification": "Diagnostic Devices",
            "country": "USA",
            "risk_class": "2",
            "implanted": "No",
            "manufacturer_id": 14,
            "event_count": 1,
            "recall_count": 0,
            "safety_alert_count": 0,
            "equipment_id": "TEST-NORM-01",
            "equipment_name": "Test Diagnostic Device",
            "criticality": "NORMAL",
            "days_since_maintenance": 10,
        }
        response = client.post("/predict", json=payload)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        
        # Check prediction structure
        self.assertIn("prediction", data)
        self.assertIn("critical_risk_probability", data["prediction"])
        self.assertIn("predicted_critical", data["prediction"])
        
        # Check explanation structure (SHAP)
        self.assertIn("explanation", data)
        self.assertIn("top_factors", data["explanation"])
        self.assertIsInstance(data["explanation"]["top_factors"], list)
        
        # Check decision structure (Agentic AI)
        self.assertIn("decision", data)
        self.assertIn("risk", data["decision"])
        self.assertIn("maintenance", data["decision"])
        self.assertIn("alert", data["decision"])
        self.assertIn("human_review_required", data["decision"])

    def test_03_predict_critical_equipment_triggers_alert(self):
        """Test /predict with high-risk profile triggers an alert."""
        payload = {
            "classification": "Cardiovascular Devices",
            "country": "USA",
            "risk_class": "3",
            "implanted": "Yes",
            "manufacturer_id": 14,
            "event_count": 12,
            "recall_count": 3,
            "safety_alert_count": 3,
            "equipment_id": "TEST-CRIT-99",
            "equipment_name": "High Risk Critical Implant",
            "criticality": "CRITICAL",
            "days_since_maintenance": 90,
        }
        response = client.post("/predict", json=payload)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        
        # Verify alert was created in agent decision
        self.assertTrue(data["decision"]["alert"]["created"])
        self.assertTrue(data["decision"]["human_review_required"])

    def test_04_equipment_list(self):
        """Test /equipment fleet listing and filtering."""
        response = client.get("/equipment")
        self.assertEqual(response.status_code, 200)
        items = response.json()
        self.assertGreater(len(items), 0)
        
        # Verify equipment fields match frontend contract
        first = items[0]
        self.assertIn("equipmentId", first)
        self.assertIn("name", first)
        self.assertIn("failureRisk", first)
        self.assertIn("status", first)
        self.assertIn("priority", first)
        self.assertIn("productionLine", first)

        # Test status filter
        resp_filtered = client.get("/equipment?status=critical")
        self.assertEqual(resp_filtered.status_code, 200)
        for item in resp_filtered.json():
            self.assertEqual(item["status"], "critical")

    def test_05_equipment_shap(self):
        """Test /equipment/{id}/shap endpoint."""
        response = client.get("/equipment/DEV-001/shap")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["equipmentId"], "DEV-001")
        self.assertIn("critical_risk_probability", data)
        self.assertIn("top_factors", data)

    def test_06_equipment_recommendation(self):
        """Test /equipment/{id}/recommendation endpoint."""
        response = client.get("/equipment/DEV-001/recommendation")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["equipmentId"], "DEV-001")
        self.assertIn("risk", data)
        self.assertIn("maintenance", data)
        self.assertIn("recommendation", data["maintenance"])

    def test_07_equipment_not_found(self):
        """Test 404 for nonexistent equipment."""
        response = client.get("/equipment/NONEXISTENT-999/shap")
        self.assertEqual(response.status_code, 404)

    def test_08_alerts_lifecycle(self):
        """Test alerts listing, acknowledge, and resolve."""
        response = client.get("/alerts")
        self.assertEqual(response.status_code, 200)
        alerts = response.json()
        self.assertGreater(len(alerts), 0)
        
        target_alert = alerts[0]["alert_id"]
        
        # Acknowledge
        ack_res = client.post(f"/alerts/{target_alert}/acknowledge", json={"operator_name": "Dr. Yogesh"})
        self.assertEqual(ack_res.status_code, 200)
        self.assertEqual(ack_res.json()["status"], "acknowledged")
        self.assertEqual(ack_res.json()["acknowledged_by"], "Dr. Yogesh")

        # Resolve
        res_res = client.post(f"/alerts/{target_alert}/resolve", json={"operator_name": "Dr. Yogesh"})
        self.assertEqual(res_res.status_code, 200)
        self.assertEqual(res_res.json()["status"], "resolved")
        self.assertEqual(res_res.json()["resolved_by"], "Dr. Yogesh")

    def test_09_standalone_maintenance_recommendation(self):
        """Test POST /maintenance/recommendation endpoint."""
        payload = {
            "equipment_id": "TEST-MAINT-01",
            "equipment_name": "Test Pump",
            "criticality": "HIGH",
            "days_since_maintenance": 45,
            "prediction": {"critical_risk_probability": 0.82, "predicted_critical": 1},
            "explanation": {"critical_risk_probability": 0.82, "top_factors": [{"feature": "event_count", "value": 0.45, "direction": "increases risk"}]}
        }
        response = client.post("/maintenance/recommendation", json=payload)
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("risk", data)
        self.assertIn("maintenance", data)


if __name__ == "__main__":
    unittest.main()
