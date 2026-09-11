"""
MedGuard AI - ML + SHAP + Agent Integration Test
"""

import json
import pandas as pd

from ml.predict import predict_devices
from explainability.shap_explainer import explain_device
from agent.maintenance_agent import run_maintenance_agent


def main():

    print("=" * 70)
    print("MEDGUARD AI - FULL ML + SHAP + AGENT TEST")
    print("=" * 70)

    # --------------------------------------------------------
    # Load the same test input used by ML and SHAP
    # --------------------------------------------------------

    input_path = "ml/test_input.csv"

    df = pd.read_csv(input_path)

    print("\nInput:")
    print(df.to_string(index=False))

    # --------------------------------------------------------
    # STEP 1 - XGBoost
    # --------------------------------------------------------

    print("\n[1] Running XGBoost prediction...")

    prediction_df = predict_devices(df)

    prediction = {
        "critical_risk_probability": float(
            prediction_df.iloc[0][
                "critical_risk_probability"
            ]
        ),

        "predicted_critical": int(
            prediction_df.iloc[0][
                "predicted_critical"
            ]
        )
    }

    print("Prediction:")
    print(prediction)

    # --------------------------------------------------------
    # STEP 2 - SHAP
    # --------------------------------------------------------

    print("\n[2] Generating SHAP explanation...")

    shap_explanation = explain_device(
        df,
        top_n=3
    )

    print("SHAP explanation:")
    print(
        json.dumps(
            shap_explanation,
            indent=4
        )
    )

    # --------------------------------------------------------
    # STEP 3 - Equipment context
    # --------------------------------------------------------

    equipment = {
        "equipment_id": "PUMP-042",
        "criticality": "CRITICAL",
        "days_since_maintenance": 48
    }

    # --------------------------------------------------------
    # STEP 4 - Agent
    # --------------------------------------------------------

    print("\n[3] Running maintenance agent...")

    agent_result = run_maintenance_agent(
        prediction=prediction,
        shap_explanation=shap_explanation,
        equipment=equipment
    )

    # --------------------------------------------------------
    # FINAL RESULT
    # --------------------------------------------------------

    print("\n" + "=" * 70)
    print("FINAL AGENT DECISION")
    print("=" * 70)

    print(
        json.dumps(
            agent_result,
            indent=4
        )
    )


if __name__ == "__main__":
    main()