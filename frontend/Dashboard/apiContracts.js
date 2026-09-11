/**
 * ============================================================================
 * API CONTRACTS & MOCK ADAPTER FOR INDUSTRIAL OPERATIONS DASHBOARD
 * ============================================================================
 * 
 * Purpose:
 * Defines the strict data contracts, deterministic fleet data generation,
 * SHAP explainability payloads, Agentic AI recommendations, multi-state
 * incident lifecycle management, and a controlled telemetry simulation engine.
 * 
 * Team Integration Guide:
 * - Vijay (ML Engineer): Predicts failure probability (0.00 - 1.00).
 * - Raghuvaran (Explainability): Computes SHAP feature attribution weights.
 * - Afreen (Agentic AI): Generates triage diagnostics & automated recommendations.
 * - Manideep & Yogesh (Backend): Mounts these structures via FastAPI routes.
 * - Chandrakala (Frontend Lead): Plugs OperationsDashboard.jsx into the main app
 *   and swaps the mock adapter functions with real FastAPI endpoints.
 * ============================================================================
 */

// ----------------------------------------------------------------------------
// 1. DATA CONTRACT SPECIFICATIONS (JSDoc Type Definitions)
// ----------------------------------------------------------------------------

/**
 * @typedef {Object} FleetSummary
 * @property {number} total - Total assets across fleet (128)
 * @property {number} productionLines - Number of active lines (4)
 * @property {number} healthy - Assets with risk < 40% (104)
 * @property {number} healthyPercent - Exact fleet healthy percentage (81.3%)
 * @property {number} atRisk - Assets with 40% <= risk < 70% (17)
 * @property {number} critical - Assets with risk >= 70% (7)
 * @property {number} criticalChange - Change count since last update session (e.g. +1)
 * @property {string} lastSynced - Timestamp of last telemetry synchronization
 */

/**
 * @typedef {Object} TelemetryReading
 * @property {number} value - Numeric sensor value
 * @property {string} unit - Measurement unit (mm/s, °C, PSI, RPM)
 * @property {number} delta - Change since previous cycle (e.g. +0.08)
 * @property {'nominal' | 'warning' | 'critical'} status - Sensor status
 */

/**
 * @typedef {Object} EquipmentItem
 * @property {string} equipmentId - Unique tag (e.g. "PUMP-042")
 * @property {string} name - Common asset name (e.g. "Hydraulic Feed Pump")
 * @property {number} failureRisk - Failure probability between 0.00 and 1.00 (e.g. 0.87)
 * @property {'healthy' | 'warning' | 'critical'} status - Centralized risk classification
 * @property {'low' | 'medium' | 'high' | 'urgent'} priority - Triage priority
 * @property {string} lastUpdated - Human-readable time since last telemetry packet
 * @property {string} productionLine - Assigned plant line
 * @property {Object.<string, TelemetryReading>} telemetry - Current live sensor telemetry
 */

/**
 * @typedef {Object} ShapFeature
 * @property {string} feature - Telemetry feature name (e.g. "Vibration")
 * @property {string} currentValue - Human-readable current sensor reading (e.g. "4.82 mm/s")
 * @property {number} value - SHAP attribution value (+0.42 or -0.08)
 * @property {'increase' | 'decrease'} direction - Risk direction
 * @property {string} label - Impact label ("pushes risk higher" | "reduces risk")
 * @property {string} contributionText - Formatted string (e.g. "+0.42", "-0.08")
 */

/**
 * @typedef {Object} ShapExplanation
 * @property {string} equipmentId - Linked asset ID
 * @property {number} predictedRisk - Current predicted failure risk (e.g. 0.87)
 * @property {number} baseValue - Population baseline failure risk (e.g. 0.15)
 * @property {ShapFeature[]} topFactors - Ranked influential factors
 */

/**
 * @typedef {Object} AiRecommendation
 * @property {string} equipmentId - Linked asset ID
 * @property {string} diagnosticHeadline - Concise diagnostic finding
 * @property {string} recommendation - Specific actionable maintenance step
 * @property {'urgent' | 'high' | 'medium' | 'low'} priority - Action priority
 * @property {string} source - Origin ("Agentic AI - Afreen")
 * @property {string} generatedAt - Timestamp of inference
 */

/**
 * @typedef {Object} AlertItem
 * @property {string} id - Unique alert ID (e.g. "ALT-801")
 * @property {'critical' | 'warning' | 'info'} severity - Alert severity
 * @property {string} equipmentId - Target asset ID
 * @property {string} equipmentName - Target asset name
 * @property {string} message - Primary diagnosis message
 * @property {string} recommendation - Agentic AI recommendation
 * @property {string} timestamp - Timestamp of event
 * @property {'active' | 'acknowledged' | 'resolved'} status - Full incident lifecycle state
 * @property {string|null} acknowledgedBy - Operator name who acknowledged
 * @property {string|null} acknowledgedAt - Timestamp of acknowledgement
 * @property {string|null} resolvedAt - Timestamp of resolution
 */

/**
 * @typedef {Object} LiveEvent
 * @property {string} id - Unique event ID
 * @property {string} timestamp - Time formatted (e.g. "09:42:18")
 * @property {string} equipmentId - Target asset ID
 * @property {string} message - Event description
 * @property {'critical' | 'warning' | 'info'} severity - Severity tier
 */

// ----------------------------------------------------------------------------
// 2. CENTRALIZED DEMONSTRATION RISK CLASSIFICATION
// ----------------------------------------------------------------------------

export const RISK_THRESHOLDS = {
  HEALTHY_MAX: 0.40, // < 40% is Healthy
  WARNING_MAX: 0.70  // 40% <= risk < 70% is Warning; >= 70% is Critical
};

/**
 * Centralized risk threshold evaluator.
 * Healthy: risk < 0.40 | Warning: 0.40 <= risk < 0.70 | Critical: risk >= 0.70
 */
export function getRiskClassification(risk) {
  if (risk >= RISK_THRESHOLDS.WARNING_MAX) return 'critical';
  if (risk >= RISK_THRESHOLDS.HEALTHY_MAX) return 'warning';
  return 'healthy';
}

export function getPriorityFromRisk(risk) {
  if (risk >= 0.80) return 'urgent';
  if (risk >= 0.70) return 'high';
  if (risk >= 0.40) return 'medium';
  return 'low';
}

// ----------------------------------------------------------------------------
// 3. DETERMINISTIC GENERATION OF EXACT 128-ASSET FLEET
// (Strict breakdown: 7 Critical, 17 Warning, 104 Healthy across 4 production lines)
// ----------------------------------------------------------------------------

const PRODUCTION_LINES = [
  'Line 1 - Extrusion Unit',
  'Line 2 - High Pressure Feed',
  'Line 3 - Pneumatics Central',
  'Line 4 - Thermal Extraction'
];

/**
 * Predefined priority equipment with exact specifications from the reference design.
 */
const BASE_EQUIPMENT = [
  {
    equipmentId: 'PUMP-042',
    name: 'Hydraulic Feed Pump',
    failureRisk: 0.87,
    status: 'critical',
    priority: 'urgent',
    lastUpdated: '2 min ago',
    productionLine: 'Line 2 - High Pressure Feed',
    telemetry: {
      vibration: { value: 4.82, unit: 'mm/s', delta: +0.11, status: 'critical' },
      temperature: { value: 88.4, unit: '°C', delta: +0.4, status: 'critical' },
      pressure: { value: 142.1, unit: 'PSI', delta: +1.2, status: 'warning' },
      rpm: { value: 1750, unit: 'RPM', delta: -5, status: 'nominal' }
    }
  },
  {
    equipmentId: 'MOTOR-018',
    name: 'Primary Drive Motor',
    failureRisk: 0.74,
    status: 'critical',
    priority: 'high',
    lastUpdated: '4 min ago',
    productionLine: 'Line 1 - Extrusion Unit',
    telemetry: {
      vibration: { value: 3.91, unit: 'mm/s', delta: +0.08, status: 'critical' },
      temperature: { value: 94.2, unit: '°C', delta: +0.8, status: 'critical' },
      current: { value: 48.6, unit: 'A', delta: +1.1, status: 'warning' },
      rpm: { value: 3100, unit: 'RPM', delta: 0, status: 'nominal' }
    }
  },
  {
    equipmentId: 'COMP-007',
    name: 'Air Compressor',
    failureRisk: 0.61,
    status: 'warning',
    priority: 'medium',
    lastUpdated: '8 min ago',
    productionLine: 'Line 3 - Pneumatics Central',
    telemetry: {
      vibration: { value: 2.45, unit: 'mm/s', delta: +0.02, status: 'warning' },
      temperature: { value: 76.0, unit: '°C', delta: -0.2, status: 'nominal' },
      pressure: { value: 115.3, unit: 'PSI', delta: +2.1, status: 'warning' },
      rpm: { value: 2400, unit: 'RPM', delta: 0, status: 'nominal' }
    }
  },
  {
    equipmentId: 'FAN-031',
    name: 'Exhaust Ventilation Fan',
    failureRisk: 0.40,
    status: 'warning',
    priority: 'medium',
    lastUpdated: '12 min ago',
    productionLine: 'Line 4 - Thermal Extraction',
    telemetry: {
      vibration: { value: 1.85, unit: 'mm/s', delta: +0.05, status: 'warning' },
      temperature: { value: 62.5, unit: '°C', delta: +0.1, status: 'nominal' },
      pressure: { value: 45.2, unit: 'PSI', delta: 0.0, status: 'nominal' },
      rpm: { value: 920, unit: 'RPM', delta: +10, status: 'nominal' }
    }
  },
  {
    equipmentId: 'PUMP-011',
    name: 'Coolant Booster Pump',
    failureRisk: 0.15,
    status: 'healthy',
    priority: 'low',
    lastUpdated: '15 min ago',
    productionLine: 'Line 1 - Auxiliary Cooling',
    telemetry: {
      vibration: { value: 0.82, unit: 'mm/s', delta: -0.01, status: 'nominal' },
      temperature: { value: 41.2, unit: '°C', delta: 0.0, status: 'nominal' },
      pressure: { value: 62.0, unit: 'PSI', delta: -0.5, status: 'nominal' },
      rpm: { value: 1450, unit: 'RPM', delta: 0, status: 'nominal' }
    }
  },
  {
    equipmentId: 'VALVE-104',
    name: 'Main Isolation Valve',
    failureRisk: 0.11,
    status: 'healthy',
    priority: 'low',
    lastUpdated: '18 min ago',
    productionLine: 'Line 2 - Safety Loop',
    telemetry: {
      vibration: { value: 0.45, unit: 'mm/s', delta: 0.0, status: 'nominal' },
      temperature: { value: 36.8, unit: '°C', delta: -0.1, status: 'nominal' },
      pressure: { value: 85.0, unit: 'PSI', delta: 0.0, status: 'nominal' },
      rpm: { value: 0, unit: 'RPM', delta: 0, status: 'nominal' }
    }
  }
];

/**
 * Builds the complete 128-asset fleet deterministically.
 * Guarantees exactly:
 * - 7 Critical assets
 * - 17 Warning assets
 * - 104 Healthy assets
 * Total = 128 assets across 4 production lines.
 */
export function generateFleet128() {
  const fleet = [...BASE_EQUIPMENT];

  // We already have:
  // Critical: PUMP-042 (0.87), MOTOR-018 (0.74) -> Need 5 more critical
  // Warning: COMP-007 (0.61), FAN-031 (0.40) -> Need 15 more warning
  // Healthy: PUMP-011 (0.15), VALVE-104 (0.11) -> Need 102 more healthy

  // 1. Add 5 more critical assets (Total = 7)
  const additionalCritical = [
    { id: 'TURB-002', name: 'Feedwater Turbine', risk: 0.81, line: 1 },
    { id: 'EXTR-014', name: 'Main Polymer Extruder', risk: 0.79, line: 0 },
    { id: 'BOIL-009', name: 'High-Pressure Boiler Pump', risk: 0.76, line: 1 },
    { id: 'GEAR-033', name: 'Heavy Drive Gearbox', risk: 0.73, line: 2 },
    { id: 'GEN-005', name: 'Auxiliary Generator Stator', risk: 0.71, line: 3 }
  ];

  additionalCritical.forEach(item => {
    fleet.push({
      equipmentId: item.id,
      name: item.name,
      failureRisk: item.risk,
      status: 'critical',
      priority: getPriorityFromRisk(item.risk),
      lastUpdated: '5 min ago',
      productionLine: PRODUCTION_LINES[item.line],
      telemetry: {
        vibration: { value: +(3.5 + item.risk).toFixed(2), unit: 'mm/s', delta: +0.07, status: 'critical' },
        temperature: { value: +(85 + (item.risk * 10)).toFixed(1), unit: '°C', delta: +0.5, status: 'critical' },
        pressure: { value: +(130 + (item.risk * 15)).toFixed(1), unit: 'PSI', delta: +1.0, status: 'warning' },
        rpm: { value: 1800, unit: 'RPM', delta: -10, status: 'nominal' }
      }
    });
  });

  // 2. Add 15 more warning assets (Total = 17)
  const warningNames = [
    'Centrifugal Chiller', 'Hydraulic Press Ram', 'Cooling Tower Fan B', 'Condensate Return Pump',
    'Conveyor Drive Unit', 'Air Scrubber Blower', 'Lube Oil Circulation Unit', 'Heat Exchanger Valve',
    'Agitator Drive', 'Slurry Transfer Pump', 'Intake Blower C', 'Rotary Feeder',
    'Deaerator Pump', 'Cooling Water Booster', 'Pneumatic Actuator'
  ];

  for (let i = 0; i < 15; i++) {
    const risk = +(0.42 + (i * 0.018)).toFixed(2); // between 0.42 and 0.69
    const lineIndex = (i + 1) % 4;
    const tag = `WRN-${String(100 + i)}`;
    fleet.push({
      equipmentId: tag,
      name: warningNames[i],
      failureRisk: risk,
      status: 'warning',
      priority: 'medium',
      lastUpdated: `${10 + i * 2} min ago`,
      productionLine: PRODUCTION_LINES[lineIndex],
      telemetry: {
        vibration: { value: +(2.1 + (i * 0.04)).toFixed(2), unit: 'mm/s', delta: +0.03, status: 'warning' },
        temperature: { value: +(68 + (i * 0.6)).toFixed(1), unit: '°C', delta: +0.2, status: 'warning' },
        pressure: { value: +(105 + (i * 0.8)).toFixed(1), unit: 'PSI', delta: 0.0, status: 'nominal' },
        rpm: { value: 1600, unit: 'RPM', delta: 0, status: 'nominal' }
      }
    });
  }

  // 3. Add 102 more healthy assets (Total = 104)
  for (let i = 0; i < 102; i++) {
    const risk = +(0.05 + ((i % 30) * 0.011)).toFixed(2); // 0.05 to 0.38
    const lineIndex = i % 4;
    const tag = `HLT-${String(200 + i)}`;
    fleet.push({
      equipmentId: tag,
      name: `Auxiliary Fleet Asset #${i + 1}`,
      failureRisk: risk,
      status: 'healthy',
      priority: 'low',
      lastUpdated: `${20 + (i % 45)} min ago`,
      productionLine: PRODUCTION_LINES[lineIndex],
      telemetry: {
        vibration: { value: +(0.6 + ((i % 10) * 0.05)).toFixed(2), unit: 'mm/s', delta: 0.0, status: 'nominal' },
        temperature: { value: +(38 + ((i % 15) * 0.5)).toFixed(1), unit: '°C', delta: 0.0, status: 'nominal' },
        pressure: { value: +(60 + ((i % 10) * 1.5)).toFixed(1), unit: 'PSI', delta: 0.0, status: 'nominal' },
        rpm: { value: 1200 + ((i % 5) * 100), unit: 'RPM', delta: 0, status: 'nominal' }
      }
    });
  }

  return fleet;
}

// Initial full fleet state
export const INITIAL_FLEET = generateFleet128();

// ----------------------------------------------------------------------------
// 4. SHAP EXPLAINABILITY DATA (Feature Attributions)
// ----------------------------------------------------------------------------

export const SHAP_EXPLANATIONS = {
  'PUMP-042': {
    equipmentId: 'PUMP-042',
    predictedRisk: 0.87,
    baseValue: 0.15,
    topFactors: [
      {
        feature: 'Vibration',
        currentValue: '4.82 mm/s',
        value: 0.42,
        direction: 'increase',
        label: 'pushes risk higher',
        contributionText: '+0.42'
      },
      {
        feature: 'Operating Temp',
        currentValue: '88.4 °C',
        value: 0.23,
        direction: 'increase',
        label: 'pushes risk higher',
        contributionText: '+0.23'
      },
      {
        feature: 'Discharge Pressure',
        currentValue: '142.1 PSI',
        value: 0.15,
        direction: 'increase',
        label: 'pushes risk higher',
        contributionText: '+0.15'
      },
      {
        feature: 'Bearing Seal Pressure',
        currentValue: 'Normal (52 PSI)',
        value: -0.08,
        direction: 'decrease',
        label: 'reduces risk',
        contributionText: '-0.08'
      }
    ]
  },
  'MOTOR-018': {
    equipmentId: 'MOTOR-018',
    predictedRisk: 0.74,
    baseValue: 0.15,
    topFactors: [
      {
        feature: 'Winding Temp',
        currentValue: '94.2 °C',
        value: 0.38,
        direction: 'increase',
        label: 'pushes risk higher',
        contributionText: '+0.38'
      },
      {
        feature: 'Vibration Harmonic',
        currentValue: '3.91 mm/s',
        value: 0.29,
        direction: 'increase',
        label: 'pushes risk higher',
        contributionText: '+0.29'
      },
      {
        feature: 'Current Imbalance',
        currentValue: '48.6 A',
        value: 0.12,
        direction: 'increase',
        label: 'pushes risk higher',
        contributionText: '+0.12'
      },
      {
        feature: 'Cooling Fan RPM',
        currentValue: 'Nominal (3,100 RPM)',
        value: -0.20,
        direction: 'decrease',
        label: 'reduces risk',
        contributionText: '-0.20'
      }
    ]
  },
  'COMP-007': {
    equipmentId: 'COMP-007',
    predictedRisk: 0.61,
    baseValue: 0.15,
    topFactors: [
      {
        feature: 'Outlet Temp',
        currentValue: '76.0 °C',
        value: 0.31,
        direction: 'increase',
        label: 'pushes risk higher',
        contributionText: '+0.31'
      },
      {
        feature: 'Interstage Pressure',
        currentValue: '115.3 PSI',
        value: 0.22,
        direction: 'increase',
        label: 'pushes risk higher',
        contributionText: '+0.22'
      },
      {
        feature: 'Oil Viscosity',
        currentValue: 'Within Spec',
        value: -0.07,
        direction: 'decrease',
        label: 'reduces risk',
        contributionText: '-0.07'
      }
    ]
  },
  'FAN-031': {
    equipmentId: 'FAN-031',
    predictedRisk: 0.40,
    baseValue: 0.15,
    topFactors: [
      {
        feature: 'Blade Oscillation',
        currentValue: '1.85 mm/s',
        value: 0.21,
        direction: 'increase',
        label: 'pushes risk higher',
        contributionText: '+0.21'
      },
      {
        feature: 'Belt Tension',
        currentValue: 'Slightly Slack',
        value: 0.11,
        direction: 'increase',
        label: 'pushes risk higher',
        contributionText: '+0.11'
      },
      {
        feature: 'Ambient Temp',
        currentValue: '24.1 °C',
        value: -0.07,
        direction: 'decrease',
        label: 'reduces risk',
        contributionText: '-0.07'
      }
    ]
  },
  'PUMP-011': {
    equipmentId: 'PUMP-011',
    predictedRisk: 0.15,
    baseValue: 0.15,
    topFactors: [
      {
        feature: 'Vibration Baseline',
        currentValue: '0.82 mm/s',
        value: 0.03,
        direction: 'increase',
        label: 'pushes risk higher',
        contributionText: '+0.03'
      },
      {
        feature: 'Coolant Temp',
        currentValue: '41.2 °C',
        value: -0.02,
        direction: 'decrease',
        label: 'reduces risk',
        contributionText: '-0.02'
      },
      {
        feature: 'Impeller Clearance',
        currentValue: 'Optimal',
        value: -0.01,
        direction: 'decrease',
        label: 'reduces risk',
        contributionText: '-0.01'
      }
    ]
  }
};

/**
 * Returns SHAP explanations with dynamic fallback for any asset.
 */
export function getEquipmentShap(equipmentId) {
  if (SHAP_EXPLANATIONS[equipmentId]) {
    return SHAP_EXPLANATIONS[equipmentId];
  }
  // Dynamic fallback for any generated fleet item
  return {
    equipmentId,
    predictedRisk: 0.25,
    baseValue: 0.15,
    topFactors: [
      {
        feature: 'Operating Vibration',
        currentValue: '1.12 mm/s',
        value: 0.10,
        direction: 'increase',
        label: 'pushes risk higher',
        contributionText: '+0.10'
      },
      {
        feature: 'Thermal Stability',
        currentValue: '44.0 °C',
        value: -0.05,
        direction: 'decrease',
        label: 'reduces risk',
        contributionText: '-0.05'
      }
    ]
  };
}

// ----------------------------------------------------------------------------
// 5. AGENTIC AI MAINTENANCE RECOMMENDATIONS
// ----------------------------------------------------------------------------

export const AI_RECOMMENDATIONS = {
  'PUMP-042': {
    equipmentId: 'PUMP-042',
    diagnosticHeadline: 'Mechanical Bearing Degradation & Cavitation Imbalance',
    recommendation: 'Inspect vibration and temperature anomalies. Immediate bearing lubrication check advised. Reduce pump output by 15% to mitigate bearing race micro-fissuring.',
    priority: 'urgent',
    source: 'Agentic AI - Afreen',
    generatedAt: '2 min ago'
  },
  'MOTOR-018': {
    equipmentId: 'MOTOR-018',
    diagnosticHeadline: 'Stator Winding Overheating & Phase Current Imbalance',
    recommendation: 'Thermal run-away risk detected. Dispatch electrical technician to check terminal connections and cooling airflow. Consider 20% throughput down-rate.',
    priority: 'high',
    source: 'Agentic AI - Afreen',
    generatedAt: '4 min ago'
  },
  'COMP-007': {
    equipmentId: 'COMP-007',
    diagnosticHeadline: 'High Differential Pressure in Compression Chamber',
    recommendation: 'Differential pressure exceeds nominal threshold. Inspect intake intake filter for particulate fouling during the scheduled shift change.',
    priority: 'medium',
    source: 'Agentic AI - Afreen',
    generatedAt: '8 min ago'
  },
  'FAN-031': {
    equipmentId: 'FAN-031',
    diagnosticHeadline: 'Blade Oscillation Harmonic & Drive Belt Slack',
    recommendation: 'Schedule tensioning of primary drive belt and balance check on fan blades during upcoming maintenance window.',
    priority: 'medium',
    source: 'Agentic AI - Afreen',
    generatedAt: '12 min ago'
  },
  'PUMP-011': {
    equipmentId: 'PUMP-011',
    diagnosticHeadline: 'Nominal Operating Parameters Confirmed',
    recommendation: 'All sensor signatures within expected tolerance bands. Continue standard routine monitoring cycle.',
    priority: 'low',
    source: 'Agentic AI - Afreen',
    generatedAt: '15 min ago'
  }
};

export function getAiRecommendation(equipmentId) {
  if (AI_RECOMMENDATIONS[equipmentId]) {
    return AI_RECOMMENDATIONS[equipmentId];
  }
  return {
    equipmentId,
    diagnosticHeadline: 'Standard Telemetry Operating Profile',
    recommendation: 'System telemetry nominal. No immediate remedial action required by plant operations.',
    priority: 'low',
    source: 'Agentic AI - Afreen',
    generatedAt: 'Just now'
  };
}

// ----------------------------------------------------------------------------
// 6. INITIAL ALERTS WITH FULL INCIDENT LIFECYCLE
// (States: active -> acknowledged -> resolved)
// ----------------------------------------------------------------------------

export const INITIAL_ALERTS = [
  {
    id: 'ALT-801',
    severity: 'critical',
    equipmentId: 'PUMP-042',
    equipmentName: 'Hydraulic Feed Pump',
    message: 'Failure risk increased to 87%',
    recommendation: 'Inspect vibration and temperature anomalies. Immediate bearing lubrication check advised.',
    timestamp: '2 min ago',
    status: 'active',
    acknowledgedBy: null,
    acknowledgedAt: null,
    resolvedAt: null
  },
  {
    id: 'ALT-802',
    severity: 'critical',
    equipmentId: 'MOTOR-018',
    equipmentName: 'Primary Drive Motor',
    message: 'Thermal run-away risk detected (74%)',
    recommendation: 'Reduce extrusion throughput by 20% and dispatch electrical maintenance.',
    timestamp: '4 min ago',
    status: 'active',
    acknowledgedBy: null,
    acknowledgedAt: null,
    resolvedAt: null
  },
  {
    id: 'ALT-803',
    severity: 'warning',
    equipmentId: 'COMP-007',
    equipmentName: 'Air Compressor',
    message: 'Pressure differential exceeds threshold (61%)',
    recommendation: 'Schedule air filter inspection during upcoming shift transition.',
    timestamp: '8 min ago',
    status: 'active',
    acknowledgedBy: null,
    acknowledgedAt: null,
    resolvedAt: null
  },
  {
    id: 'ALT-804',
    severity: 'info',
    equipmentId: 'FLEET-LINE-2',
    equipmentName: 'Production Line 2',
    message: 'Automated telemetry calibration completed',
    recommendation: 'All 32 sensors online and reporting nominal transmission latency.',
    timestamp: '22 min ago',
    status: 'acknowledged',
    acknowledgedBy: 'Operator M. Patel',
    acknowledgedAt: '15 min ago',
    resolvedAt: null
  }
];

// ----------------------------------------------------------------------------
// 7. HISTORICAL TREND GENERATOR FOR TIMEFRAMES (24H, 7D, 30D)
// ----------------------------------------------------------------------------

export function generateHistoricalTrend(equipmentId, timeframe = '24H') {
  const currentRisk = equipmentId === 'PUMP-042' ? 0.87 :
                      equipmentId === 'MOTOR-018' ? 0.74 :
                      equipmentId === 'COMP-007' ? 0.61 : 0.25;

  if (timeframe === '24H') {
    // 24 hourly points
    return Array.from({ length: 24 }, (_, i) => {
      const hour = i;
      const noise = (Math.sin(i * 0.6) * 0.04) + ((i / 24) * 0.12);
      const riskVal = Math.min(Math.max(+(currentRisk - 0.12 + noise).toFixed(2), 0.05), 0.98);
      return {
        timestamp: `${String(hour).padStart(2, '0')}:00`,
        risk: Math.round(riskVal * 100),
        vibration: +(3.2 + (riskVal * 1.8)).toFixed(2),
        temperature: +(65 + (riskVal * 25)).toFixed(1)
      };
    });
  }

  if (timeframe === '7D') {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    return days.map((day, i) => {
      const progression = (i / 7) * 0.18;
      const riskVal = Math.min(Math.max(+(currentRisk - 0.15 + progression).toFixed(2), 0.05), 0.98);
      return {
        timestamp: day,
        risk: Math.round(riskVal * 100),
        vibration: +(3.0 + (riskVal * 1.9)).toFixed(2),
        temperature: +(62 + (riskVal * 27)).toFixed(1)
      };
    });
  }

  // 30D aggregate trend
  return Array.from({ length: 15 }, (_, i) => {
    const day = (i + 1) * 2;
    const progression = (i / 15) * 0.22;
    const riskVal = Math.min(Math.max(+(currentRisk - 0.20 + progression).toFixed(2), 0.05), 0.98);
    return {
      timestamp: `Day ${day}`,
      risk: Math.round(riskVal * 100),
      vibration: +(2.8 + (riskVal * 2.1)).toFixed(2),
      temperature: +(60 + (riskVal * 30)).toFixed(1)
    };
  });
}

// ----------------------------------------------------------------------------
// 8. LIVE OPERATIONAL EVENT LOG
// ----------------------------------------------------------------------------

export const INITIAL_EVENT_STREAM = [
  {
    id: 'EVT-01',
    timestamp: '09:42:18',
    equipmentId: 'PUMP-042',
    message: 'Hydraulic Feed Pump failure risk increased to 87%',
    severity: 'critical'
  },
  {
    id: 'EVT-02',
    timestamp: '09:40:12',
    equipmentId: 'MOTOR-018',
    message: 'Primary Drive Motor thermal anomaly detected (94.2 °C)',
    severity: 'critical'
  },
  {
    id: 'EVT-03',
    timestamp: '09:37:05',
    equipmentId: 'COMP-007',
    message: 'Air Compressor differential pressure exceeded 115 PSI',
    severity: 'warning'
  },
  {
    id: 'EVT-04',
    timestamp: '09:31:44',
    equipmentId: 'LINE-2',
    message: 'Line 2 - High Pressure Feed telemetry synchronized',
    severity: 'info'
  }
];

// ----------------------------------------------------------------------------
// 9. CONTROLLED TELEMETRY SIMULATION ENGINE
// (Deterministic drift, threshold crossings, alert generation & event logging)
// ----------------------------------------------------------------------------

let simulationTickCounter = 0;

/**
 * Steps the simulation forward by 1 controlled tick.
 * Drifts target assets gradually, recalculates risk, changes status when crossing
 * 40% or 70% boundaries, and creates contextual alerts without duplicate spam.
 */
export function simulateTelemetryTick(currentFleet, currentAlerts, currentEvents) {
  simulationTickCounter++;
  const updatedFleet = [...currentFleet];
  const newEvents = [...currentEvents];
  const newAlerts = [...currentAlerts];

  // Select target asset to drift: alternate between PUMP-042, MOTOR-018, and FAN-031
  const targetId = simulationTickCounter % 2 === 0 ? 'PUMP-042' : (simulationTickCounter % 3 === 0 ? 'FAN-031' : 'MOTOR-018');
  const targetIndex = updatedFleet.findIndex(e => e.equipmentId === targetId);

  if (targetIndex !== -1) {
    const item = { ...updatedFleet[targetIndex] };
    const oldStatus = item.status;
    const oldRisk = item.failureRisk;

    // Deterministic sinusoidal oscillation with gentle upward drift
    const driftFactor = Math.sin(simulationTickCounter * 0.8) * 0.015;
    let newRisk = +(oldRisk + driftFactor).toFixed(2);
    // Clamp between realistic bounds
    newRisk = Math.min(Math.max(newRisk, 0.35), 0.94);
    item.failureRisk = newRisk;

    // Recalculate status using centralized demo thresholds
    const newStatus = getRiskClassification(newRisk);
    item.status = newStatus;
    item.priority = getPriorityFromRisk(newRisk);
    item.lastUpdated = 'Just now';

    // Drift telemetry accordingly
    if (item.telemetry?.vibration) {
      const vibDelta = +(driftFactor * 4).toFixed(2);
      const newVib = Math.max(+(item.telemetry.vibration.value + vibDelta).toFixed(2), 0.5);
      item.telemetry = {
        ...item.telemetry,
        vibration: {
          ...item.telemetry.vibration,
          value: newVib,
          delta: vibDelta,
          status: newStatus
        }
      };
    }

    if (item.telemetry?.temperature) {
      const tempDelta = +(driftFactor * 10).toFixed(1);
      const newTemp = Math.max(+(item.telemetry.temperature.value + tempDelta).toFixed(1), 30.0);
      item.telemetry = {
        ...item.telemetry,
        temperature: {
          ...item.telemetry.temperature,
          value: newTemp,
          delta: tempDelta,
          status: newStatus
        }
      };
    }

    updatedFleet[targetIndex] = item;

    // Check for status boundary transition (e.g. Warning -> Critical or vice versa)
    if (oldStatus !== newStatus) {
      const now = new Date();
      const timeStr = now.toTimeString().split(' ')[0];

      // Add to event stream
      newEvents.unshift({
        id: `EVT-${Date.now()}`,
        timestamp: timeStr,
        equipmentId: item.equipmentId,
        message: `${item.name} (${item.equipmentId}) transitioned to ${newStatus.toUpperCase()} (Risk: ${Math.round(newRisk * 100)}%)`,
        severity: newStatus === 'critical' ? 'critical' : 'warning'
      });

      // If escalated to critical and no active alert exists for this asset, generate one
      if (newStatus === 'critical') {
        const existingActive = newAlerts.some(a => a.equipmentId === item.equipmentId && a.status === 'active');
        if (!existingActive) {
          newAlerts.unshift({
            id: `ALT-${Date.now()}`,
            severity: 'critical',
            equipmentId: item.equipmentId,
            equipmentName: item.name,
            message: `Failure risk escalated to ${Math.round(newRisk * 100)}% (${newStatus.toUpperCase()})`,
            recommendation: `Immediate inspection required. Sensor readings exceeded safety margin.`,
            timestamp: 'Just now',
            status: 'active',
            acknowledgedBy: null,
            acknowledgedAt: null,
            resolvedAt: null
          });
        }
      }
    }
  }

  // Derive new fleet summary stats dynamically from the actual fleet
  const healthyCount = updatedFleet.filter(e => e.status === 'healthy').length;
  const warningCount = updatedFleet.filter(e => e.status === 'warning').length;
  const criticalCount = updatedFleet.filter(e => e.status === 'critical').length;
  const healthyPercent = +((healthyCount / updatedFleet.length) * 100).toFixed(1);

  const updatedSummary = {
    total: updatedFleet.length,
    productionLines: 4,
    healthy: healthyCount,
    healthyPercent,
    atRisk: warningCount,
    critical: criticalCount,
    lastSynced: 'Simulation · Just updated'
  };

  return {
    updatedFleet,
    updatedAlerts: newAlerts,
    updatedEvents: newEvents.slice(0, 15), // keep last 15 events
    updatedSummary
  };
}

// ----------------------------------------------------------------------------
// 10. CONSUMABLE MOCK ADAPTER FUNCTIONS (Prepares for FastAPI Replacement)
// ----------------------------------------------------------------------------

/**
 * Fetch high-level fleet statistics.
 * In production: Replace with `fetch('/api/fleet/summary')`
 */
export async function fetchFleetStats() {
  return new Promise(resolve => {
    setTimeout(() => {
      const healthy = INITIAL_FLEET.filter(e => e.status === 'healthy').length;
      const atRisk = INITIAL_FLEET.filter(e => e.status === 'warning').length;
      const critical = INITIAL_FLEET.filter(e => e.status === 'critical').length;
      resolve({
        total: INITIAL_FLEET.length,
        productionLines: 4,
        healthy,
        healthyPercent: +((healthy / INITIAL_FLEET.length) * 100).toFixed(1),
        atRisk,
        critical,
        lastSynced: 'Simulation · Updated 2s ago'
      });
    }, 40);
  });
}

/**
 * Fetch equipment list filtered by status, timeframe, and search term.
 * In production: Replace with `fetch('/api/equipment?status=' + filter + '&search=' + query)`
 */
export async function fetchEquipmentList(statusFilter = 'All', searchQuery = '') {
  return new Promise(resolve => {
    setTimeout(() => {
      let list = [...INITIAL_FLEET];
      if (statusFilter && statusFilter.toLowerCase() !== 'all') {
        list = list.filter(item => item.status.toLowerCase() === statusFilter.toLowerCase());
      }
      if (searchQuery && searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase().trim();
        list = list.filter(item =>
          item.equipmentId.toLowerCase().includes(q) ||
          item.name.toLowerCase().includes(q) ||
          item.productionLine.toLowerCase().includes(q)
        );
      }
      // Sort by highest risk descending
      list.sort((a, b) => b.failureRisk - a.failureRisk);
      resolve(list);
    }, 40);
  });
}

/**
 * Fetch SHAP feature attribution data for a specific asset.
 * In production: Replace with `fetch('/api/equipment/' + equipmentId + '/shap')`
 */
export async function fetchEquipmentShap(equipmentId) {
  return new Promise(resolve => {
    setTimeout(() => resolve(getEquipmentShap(equipmentId)), 40);
  });
}

/**
 * Fetch Agentic AI maintenance recommendation for an asset.
 * In production: Replace with `fetch('/api/equipment/' + equipmentId + '/recommendation')`
 */
export async function fetchEquipmentRecommendation(equipmentId) {
  return new Promise(resolve => {
    setTimeout(() => resolve(getAiRecommendation(equipmentId)), 40);
  });
}

/**
 * Fetch active, acknowledged, and resolved alerts.
 * In production: Replace with `fetch('/api/alerts')`
 */
export async function fetchAlerts() {
  return new Promise(resolve => {
    setTimeout(() => resolve(INITIAL_ALERTS), 40);
  });
}

/**
 * Acknowledge an active alert (ACTIVE -> ACKNOWLEDGED).
 * In production: Replace with `fetch('/api/alerts/' + alertId + '/acknowledge', { method: 'POST' })`
 */
export async function acknowledgeAlert(alertId, operatorName = 'Operator M. Patel') {
  return new Promise(resolve => {
    setTimeout(() => {
      const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      resolve({
        success: true,
        alertId,
        acknowledgedBy: operatorName,
        acknowledgedAt: now
      });
    }, 50);
  });
}

/**
 * Resolve an acknowledged alert (ACKNOWLEDGED -> RESOLVED).
 * In production: Replace with `fetch('/api/alerts/' + alertId + '/resolve', { method: 'POST' })`
 */
export async function resolveAlert(alertId, operatorName = 'Operator M. Patel') {
  return new Promise(resolve => {
    setTimeout(() => {
      const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      resolve({
        success: true,
        alertId,
        resolvedBy: operatorName,
        resolvedAt: now
      });
    }, 50);
  });
}

/**
 * Fetch live operational event stream.
 * In production: Replace with WebSocket stream or SSE from `/api/events/stream`
 */
export async function fetchLiveEventStream() {
  return new Promise(resolve => {
    setTimeout(() => resolve(INITIAL_EVENT_STREAM), 40);
  });
}
