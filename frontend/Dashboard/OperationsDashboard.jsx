import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  fetchFleetStats,
  fetchEquipmentList,
  fetchEquipmentShap,
  fetchEquipmentRecommendation,
  fetchAlerts,
  acknowledgeAlert,
  resolveAlert,
  fetchLiveEventStream,
  simulateTelemetryTick
} from './apiContracts.js';

/**
 * Inline vector icon library for zero external package footprint.
 */
const Icons = {
  Gauge: () => (
    <svg className="w-4 h-4 text-[#5A6578]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 15l3.5-3.5" />
      <path d="M20.3 18a9 9 0 1 0-16.6 0" />
    </svg>
  ),
  Search: () => (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  ),
  Bell: () => (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
      <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
    </svg>
  ),
  ShieldCheck: () => (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  ),
  User: () => (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="4" />
      <path d="M20 21a8 8 0 0 0-16 0" />
    </svg>
  ),
  ArrowRight: () => (
    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </svg>
  ),
  ChevronRight: () => (
    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m9 18 6-6-6-6" />
    </svg>
  ),
  TrendingUp: () => (
    <svg className="w-3.5 h-3.5 text-[#E05252]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
      <polyline points="16 7 22 7 22 13" />
    </svg>
  ),
  TrendingDown: () => (
    <svg className="w-3.5 h-3.5 text-[#00B4D8]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22 17 13.5 8.5 8.5 13.5 2 7" />
      <polyline points="16 17 22 17 22 11" />
    </svg>
  ),
  OverviewGrid: () => (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect width="7" height="7" x="3" y="3" rx="1" />
      <rect width="7" height="7" x="14" y="3" rx="1" />
      <rect width="7" height="7" x="14" y="14" rx="1" />
      <rect width="7" height="7" x="3" y="14" rx="1" />
    </svg>
  ),
  Nodes: () => (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="5" r="2.5" />
      <circle cx="5" cy="18" r="2.5" />
      <circle cx="19" cy="18" r="2.5" />
      <line x1="12" y1="7.5" x2="5" y2="15.5" />
      <line x1="12" y1="7.5" x2="19" y2="15.5" />
    </svg>
  ),
  Wrench: () => (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
    </svg>
  ),
  Expand: () => (
    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 3h6v6" />
      <path d="M9 21H3v-6" />
      <path d="M21 3l-7 7" />
      <path d="M3 21l7-7" />
    </svg>
  ),
  Text: () => (
    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="4 7 4 4 20 4 20 7" />
      <line x1="9" y1="20" x2="15" y2="20" />
      <line x1="12" y1="4" x2="12" y2="20" />
    </svg>
  ),
  Pencil: () => (
    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
    </svg>
  ),
  MessageCircle: () => (
    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
    </svg>
  ),
  Close: () => (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  ),
  Play: () => (
    <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
      <polygon points="5 3 19 12 5 21 5 3" />
    </svg>
  ),
  Pause: () => (
    <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
      <rect x="6" y="4" width="4" height="16" />
      <rect x="14" y="4" width="4" height="16" />
    </svg>
  )
};

/**
 * ============================================================================
 * MAIN OPERATIONS DASHBOARD COMPONENT
 * ============================================================================
 */
export default function OperationsDashboard() {
  // Primary Domain State
  const [fleetStats, setFleetStats] = useState(null);
  const [allFleet, setAllFleet] = useState([]);
  const [selectedEquipmentId, setSelectedEquipmentId] = useState('DEV-001');
  const [shapData, setShapData] = useState(null);
  const [aiRecommendation, setAiRecommendation] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [events, setEvents] = useState([]);

  // UI / Filter States
  const [statusFilter, setStatusFilter] = useState('All');
  const [timeframe, setTimeframe] = useState('24H');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAlertsOpen, setIsAlertsOpen] = useState(false);
  const [alertsTab, setAlertsTab] = useState('active'); // 'active' | 'acknowledged' | 'resolved'
  const [activeNavTab, setActiveNavTab] = useState('overview');
  const [isSimulating, setIsSimulating] = useState(true);
  const [simSeconds, setSimSeconds] = useState(2);
  const [toastMessage, setToastMessage] = useState(null);
  const [previousCriticalCount, setPreviousCriticalCount] = useState(7);
  const [criticalDeltaBanner, setCriticalDeltaBanner] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // --------------------------------------------------------------------------
  // INITIAL DATA BOOTSTRAP
  // --------------------------------------------------------------------------
  useEffect(() => {
    let mounted = true;
    Promise.all([
      fetchFleetStats(),
      fetchEquipmentList('All', ''),
      fetchAlerts(),
      fetchLiveEventStream(),
      fetchEquipmentShap('DEV-001'),
      fetchEquipmentRecommendation('DEV-001')
    ]).then(([stats, fleet, alertList, eventList, initialShap, initialRec]) => {
      if (!mounted) return;
      setFleetStats(stats);
      setAllFleet(fleet);
      setAlerts(alertList);
      setEvents(eventList);
      setShapData(initialShap);
      setAiRecommendation(initialRec);
      setPreviousCriticalCount(stats.critical);
      setIsLoading(false);
    }).catch(() => {
      console.error('Failed to bootstrap operations dashboard.');
      setIsLoading(false);
    });

    return () => {
      mounted = false;
    };
  }, []);

  // Sync SHAP, Recommendation, and Telemetry whenever Selected Equipment Changes
  useEffect(() => {
    if (!selectedEquipmentId) return;
    fetchEquipmentShap(selectedEquipmentId).then(setShapData);
    fetchEquipmentRecommendation(selectedEquipmentId).then(setAiRecommendation);
  }, [selectedEquipmentId]);

  // --------------------------------------------------------------------------
  // CONTROLLED TELEMETRY SIMULATION LOOP
  // --------------------------------------------------------------------------
  useEffect(() => {
    if (!isSimulating || isLoading) return;

    const interval = setInterval(() => {
      setSimSeconds(prev => (prev >= 60 ? 2 : prev + 3));

      setAllFleet(currentFleet => {
        if (!currentFleet.length) return currentFleet;

        const result = simulateTelemetryTick(currentFleet, alerts, events);

        // Check if critical count increased
        if (result.updatedSummary.critical > previousCriticalCount) {
          setCriticalDeltaBanner(`↑ ${result.updatedSummary.critical - previousCriticalCount} critical transition`);
          setTimeout(() => setCriticalDeltaBanner(null), 4000);
        }
        setPreviousCriticalCount(result.updatedSummary.critical);

        setFleetStats(result.updatedSummary);
        setAlerts(result.updatedAlerts);
        setEvents(result.updatedEvents);

        return result.updatedFleet;
      });
    }, 3500);

    return () => clearInterval(interval);
  }, [isSimulating, isLoading, alerts, events, previousCriticalCount]);

  // --------------------------------------------------------------------------
  // DERIVED DATA & COMPUTATIONS
  // --------------------------------------------------------------------------

  // Selected Equipment Details
  const selectedEquipment = useMemo(() => {
    return allFleet.find(e => e.equipmentId === selectedEquipmentId) || allFleet[0] || null;
  }, [allFleet, selectedEquipmentId]);

  // Filtered Equipment List (driven by search and status filter)
  const filteredFleet = useMemo(() => {
    let list = [...allFleet];

    if (statusFilter.toLowerCase() !== 'all') {
      list = list.filter(e => e.status.toLowerCase() === statusFilter.toLowerCase());
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(e =>
        e.equipmentId.toLowerCase().includes(q) ||
        e.name.toLowerCase().includes(q) ||
        e.productionLine.toLowerCase().includes(q)
      );
    }

    // Sort by failure risk descending
    list.sort((a, b) => b.failureRisk - a.failureRisk);
    return list;
  }, [allFleet, statusFilter, searchQuery]);

  // Top 5 assets for the Horizontal Bar Chart
  const topRiskAssets = useMemo(() => {
    return filteredFleet.slice(0, 5);
  }, [filteredFleet]);

  // Priority Table Assets (Top 4 critical / warning)
  const priorityAssets = useMemo(() => {
    return filteredFleet.slice(0, 4);
  }, [filteredFleet]);

  // Unread Active Alerts Count for Badge
  const activeAlertsCount = useMemo(() => {
    return alerts.filter(a => a.status === 'active').length;
  }, [alerts]);

  // Categorized Alerts for Drawer Tabs
  const visibleAlerts = useMemo(() => {
    if (alertsTab === 'active') return alerts.filter(a => a.status === 'active');
    if (alertsTab === 'acknowledged') return alerts.filter(a => a.status === 'acknowledged');
    return alerts.filter(a => a.status === 'resolved');
  }, [alerts, alertsTab]);

  // Toast Trigger Helper
  const triggerToast = useCallback((msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2800);
  }, []);

  // --------------------------------------------------------------------------
  // INCIDENT MANAGEMENT ACTIONS
  // --------------------------------------------------------------------------
  const handleAcknowledge = async (alertId) => {
    const res = await acknowledgeAlert(alertId, 'Operator M. Patel');
    setAlerts(prev => prev.map(a => {
      if (a.id === alertId) {
        return {
          ...a,
          status: 'acknowledged',
          acknowledgedBy: res.acknowledgedBy,
          acknowledgedAt: res.acknowledgedAt
        };
      }
      return a;
    }));
    triggerToast(`Alert ${alertId} acknowledged by Operator M. Patel.`);
  };

  const handleResolve = async (alertId) => {
    const res = await resolveAlert(alertId, 'Operator M. Patel');
    setAlerts(prev => prev.map(a => {
      if (a.id === alertId) {
        return {
          ...a,
          status: 'resolved',
          resolvedAt: res.resolvedAt
        };
      }
      return a;
    }));
    triggerToast(`Incident ${alertId} marked as RESOLVED.`);
  };

  // Donut SVG circumference fallback
  const donutGeometry = useMemo(() => {
    const radius = 62;
    const circumference = 2 * Math.PI * radius;
    const total = fleetStats?.total || 128;
    const healthyStroke = ((fleetStats?.healthy || 104) / total) * circumference;
    const warningStroke = ((fleetStats?.atRisk || 17) / total) * circumference;
    const criticalStroke = ((fleetStats?.critical || 7) / total) * circumference;

    return {
      radius,
      circumference,
      healthyStroke,
      warningStroke,
      criticalStroke,
      healthyOffset: 0,
      warningOffset: -healthyStroke,
      criticalOffset: -(healthyStroke + warningStroke)
    };
  }, [fleetStats]);

  // --------------------------------------------------------------------------
  // RENDER: LOADING SKELETON
  // --------------------------------------------------------------------------
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#090C10] text-[#E5E7EB] p-8 space-y-6 animate-pulse font-sans">
        <div className="h-12 bg-[#121722] rounded-xl w-1/3"></div>
        <div className="grid grid-cols-2 gap-4 h-48 bg-[#0D1117] rounded-xl border border-[#161B26]"></div>
        <div className="h-72 bg-[#0D1117] rounded-xl border border-[#161B26]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#090C10] text-[#E5E7EB] font-sans antialiased pb-32 selection:bg-cyan-500/20 selection:text-cyan-300">
      
      {/* -------------------------------------------------------------------- */}
      {/* 1. OPERATIONS DASHBOARD HEADER */}
      {/* -------------------------------------------------------------------- */}
      <header className="px-6 md:px-8 py-4 border-b border-[#141A24] bg-[#090C10]/95 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-[1360px] mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-[20px] md:text-[22px] font-semibold tracking-tight text-white">
                Operations Overview
              </h1>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-[#161F2E] border border-[#212E45] text-[#38BDF8]">
                Console v2.4
              </span>
            </div>
            <p className="text-[12px] text-[#6B7280] mt-0.5 font-normal">
              AI-powered equipment health monitoring & failure prevention
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4 md:gap-5 self-end md:self-center">
            {/* Live Simulation Connection Badge with Pause/Resume */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#0F141E] border border-[#1A2232] text-[12px] text-[#9CA3AF]">
              <span className="relative flex h-2 w-2">
                {isSimulating && (
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#22C55E] opacity-75"></span>
                )}
                <span className={`relative inline-flex rounded-full h-2 w-2 ${isSimulating ? 'bg-[#22C55E]' : 'bg-[#EAB308]'}`}></span>
              </span>
              <span>
                {isSimulating ? `Live Simulation · Updated ${simSeconds}s ago` : 'Simulation Paused'}
              </span>
              <button
                onClick={() => {
                  setIsSimulating(!isSimulating);
                  triggerToast(isSimulating ? 'Simulation paused.' : 'Live telemetry simulation resumed.');
                }}
                className="ml-1 p-1 rounded hover:bg-[#1A2334] text-slate-300 transition"
                title={isSimulating ? "Pause Telemetry Simulation" : "Resume Telemetry Simulation"}
                aria-label={isSimulating ? "Pause Simulation" : "Resume Simulation"}
              >
                {isSimulating ? <Icons.Pause /> : <Icons.Play />}
              </button>
            </div>

            {/* Real Search Input */}
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search equipment ID, name..."
                className="w-44 md:w-56 bg-[#0E131C] border border-[#1B2232] rounded-lg py-1.5 pl-8 pr-3 text-[12px] text-white placeholder-[#5A6578] focus:outline-none focus:border-[#00B4D8] transition"
              />
              <div className="absolute left-2.5 top-2 text-[#5A6578]">
                <Icons.Search />
              </div>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 top-2 text-[#5A6578] hover:text-white"
                  title="Clear search"
                >
                  <Icons.Close />
                </button>
              )}
            </div>

            {/* Header Action Icons */}
            <div className="flex items-center gap-3 text-[#9CA3AF]">
              {/* Notification Bell with Unread Badge */}
              <button
                onClick={() => setIsAlertsOpen(true)}
                className="relative p-2 rounded-lg bg-[#0E131C] border border-[#1B2232] hover:text-white hover:border-slate-700 transition"
                title="Active AI Incident Alerts"
                aria-label={`Open AI alerts, ${activeAlertsCount} active`}
              >
                <Icons.Bell />
                {activeAlertsCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 min-w-[1rem] px-1 items-center justify-center rounded-full bg-[#EF4444] text-[10px] font-bold text-white shadow-sm">
                    {activeAlertsCount}
                  </span>
                )}
              </button>

              <button
                onClick={() => triggerToast('Plant telemetry security verification active (TLS 1.3 encrypted).')}
                className="p-2 rounded-lg bg-[#0E131C] border border-[#1B2232] text-[#22C55E] hover:opacity-90 transition"
                title="Security Protocol Nominal"
                aria-label="Security Status"
              >
                <Icons.ShieldCheck />
              </button>

              <button
                onClick={() => triggerToast('Operator Profile: M. Patel (Senior Reliability Engineer).')}
                className="w-8 h-8 rounded-full bg-slate-800 border border-[#202A3C] flex items-center justify-center text-slate-300 hover:text-white transition"
                title="User Profile: M. Patel"
                aria-label="User Profile"
              >
                <Icons.User />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* -------------------------------------------------------------------- */}
      {/* 2. MAIN DASHBOARD CONTENT */}
      {/* -------------------------------------------------------------------- */}
      <main className="max-w-[1360px] mx-auto px-6 md:px-8 pt-6 space-y-6">

        {/* ------------------------------------------------------------------ */}
        {/* SECTION 1: 4-QUADRANT RISK METRIC CARD (2x2 GRID) */}
        {/* ------------------------------------------------------------------ */}
        <section aria-labelledby="fleet-summary-heading">
          <h2 id="fleet-summary-heading" className="sr-only">Fleet Risk Summary</h2>
          <div className="bg-[#0D1117] border border-[#161B26] rounded-xl overflow-hidden shadow-2xl">
            <div className="grid grid-cols-2 divide-x divide-y divide-[#161B26]">
              
              {/* Quadrant 1: TOTAL EQUIPMENT */}
              <div className="p-6 relative group hover:bg-[#10151E] transition">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold tracking-wider text-[#6B7280] uppercase">
                    TOTAL EQUIPMENT
                  </span>
                  <Icons.Gauge />
                </div>
                <div className="text-[38px] md:text-[42px] font-bold text-white tracking-tight mt-3 leading-none font-mono">
                  {fleetStats?.total ?? 128}
                </div>
                <div className="text-[12px] text-[#6B7280] mt-3 font-normal">
                  Across {fleetStats?.productionLines ?? 4} production lines
                </div>
              </div>

              {/* Quadrant 2: HEALTHY */}
              <div className="p-6 group hover:bg-[#10151E] transition">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold tracking-wider text-[#6B7280] uppercase">
                    HEALTHY
                  </span>
                  <span className="w-2 h-2 rounded-full bg-[#22C55E]"></span>
                </div>
                <div className="text-[38px] md:text-[42px] font-bold text-[#22C55E] tracking-tight mt-3 leading-none font-mono">
                  {fleetStats?.healthy ?? 104}
                </div>
                <div className="text-[12px] text-[#6B7280] mt-3 font-normal">
                  {fleetStats?.healthyPercent ?? 81.3}% of fleet
                </div>
              </div>

              {/* Quadrant 3: AT RISK */}
              <div className="p-6 group hover:bg-[#10151E] transition">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold tracking-wider text-[#6B7280] uppercase">
                    AT RISK
                  </span>
                  <span className="w-2 h-2 rounded-full bg-[#EAB308]"></span>
                </div>
                <div className="text-[38px] md:text-[42px] font-bold text-[#EAB308] tracking-tight mt-3 leading-none font-mono">
                  {fleetStats?.atRisk ?? 17}
                </div>
                <div className="text-[12px] text-[#6B7280] mt-3 font-normal">
                  Requires monitoring (40% - 69% risk)
                </div>
              </div>

              {/* Quadrant 4: CRITICAL */}
              <div className="p-6 relative group hover:bg-[#10151E] transition">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold tracking-wider text-[#6B7280] uppercase">
                    CRITICAL
                  </span>
                  <span className="w-2 h-2 rounded-full bg-[#EF4444] animate-pulse"></span>
                </div>
                <div className="flex items-baseline gap-3 mt-3">
                  <div className="text-[38px] md:text-[42px] font-bold text-[#EF4444] tracking-tight leading-none font-mono">
                    {fleetStats?.critical ?? 7}
                  </div>
                  {criticalDeltaBanner && (
                    <span className="text-[11px] text-[#EF4444] font-bold bg-[#2D1619] px-2 py-0.5 rounded border border-[#521E24] animate-bounce">
                      {criticalDeltaBanner}
                    </span>
                  )}
                </div>
                <div className="text-[12px] text-[#6B7280] mt-3 font-normal">
                  Action required (&ge; 70% risk)
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* ------------------------------------------------------------------ */}
        {/* SECTION 2: EQUIPMENT RISK OVERVIEW (RECHARTS BAR CHART) */}
        {/* ------------------------------------------------------------------ */}
        <section aria-labelledby="equipment-risk-heading" className="bg-[#0D1117] border border-[#161B26] rounded-xl p-6 shadow-xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[#141A24]">
            <div>
              <h2 id="equipment-risk-heading" className="text-[16px] font-semibold text-white tracking-tight">
                Equipment Risk Overview
              </h2>
              <p className="text-[13px] text-[#6B7280] mt-0.5">
                Current failure probability across monitored equipment
              </p>
            </div>

            {/* Filter Pills Controls */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Status Segmented Buttons */}
              <div className="flex items-center bg-[#121722] border border-[#1B2232] rounded-lg p-1 text-[12px]">
                {['All', 'Healthy', 'Warning', 'Critical'].map((st) => {
                  const isActive = statusFilter.toLowerCase() === st.toLowerCase();
                  return (
                    <button
                      key={st}
                      onClick={() => setStatusFilter(st)}
                      className={`px-3 py-1 rounded-md transition font-medium ${
                        isActive ? 'bg-[#1D2536] text-white shadow-sm' : 'text-[#6B7280] hover:text-[#D1D5DB]'
                      }`}
                    >
                      {st}
                    </button>
                  );
                })}
              </div>

              {/* Timeframe Segmented Buttons */}
              <div className="flex items-center bg-[#121722] border border-[#1B2232] rounded-lg p-1 text-[12px]">
                {['24H', '7D', '30D'].map((tf) => {
                  const isActive = timeframe === tf;
                  return (
                    <button
                      key={tf}
                      onClick={() => {
                        setTimeframe(tf);
                        triggerToast(`Loaded ${tf} historical risk telemetry baseline.`);
                      }}
                      className={`px-3 py-1 rounded-md transition font-medium ${
                        isActive ? 'bg-[#1D2536] text-white shadow-sm' : 'text-[#6B7280] hover:text-[#D1D5DB]'
                      }`}
                    >
                      {tf}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Bar Chart Visualization (Top 5 Assets) */}
          <div className="pt-4 pb-2 space-y-3.5">
            {topRiskAssets.length === 0 ? (
              <div className="py-12 text-center text-xs text-[#6B7280]">
                No equipment matching filter <span className="text-white font-mono font-semibold">"{statusFilter}"</span> or query.
              </div>
            ) : (
              topRiskAssets.map((item) => {
                const isSelected = item.equipmentId === selectedEquipmentId;
                const riskPercent = Math.round(item.failureRisk * 100);

                let barColor = 'bg-[#3E9B6A]';
                if (item.status === 'critical') barColor = 'bg-[#D94C4C]';
                else if (item.status === 'warning') barColor = 'bg-[#D9943B]';

                return (
                  <div
                    key={item.equipmentId}
                    onClick={() => {
                      setSelectedEquipmentId(item.equipmentId);
                      triggerToast(`Investigating ${item.name} (${item.equipmentId}).`);
                    }}
                    className={`flex items-center gap-4 py-1.5 px-3 rounded-lg cursor-pointer transition ${
                      isSelected ? 'bg-[#141B26] ring-1 ring-[#00B4D8]/50' : 'hover:bg-[#111620]'
                    }`}
                    title={`Click to analyze ${item.name}`}
                  >
                    {/* Equipment ID Label */}
                    <div className="w-24 text-right">
                      <span className={`text-[12px] font-mono font-semibold tracking-wide ${
                        isSelected ? 'text-[#00B4D8]' : 'text-white'
                      }`}>
                        {item.equipmentId}
                      </span>
                    </div>

                    {/* Horizontal Bar Track */}
                    <div className="flex-1 h-7 rounded-[3px] bg-[#0E131C] relative flex items-center overflow-hidden">
                      <div
                        className={`h-full rounded-[3px] transition-all duration-500 ease-out flex items-center justify-end pr-3 ${barColor}`}
                        style={{ width: `${Math.max(riskPercent, 4)}%` }}
                      >
                        {riskPercent >= 15 && (
                          <span className="text-[11px] font-bold text-slate-950/80 font-mono">
                            {riskPercent}%
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}

            {/* X-Axis Percentage Ticks */}
            <div className="flex justify-between items-center text-[11px] text-[#6B7280] pl-28 pr-3 pt-3 font-mono border-t border-[#141A24]">
              <span>0%</span>
              <span>25%</span>
              <span>50%</span>
              <span>75%</span>
              <span>100%</span>
            </div>
          </div>
        </section>

        {/* ------------------------------------------------------------------ */}
        {/* SECTION 3: RISK DISTRIBUTION (DONUT) */}
        {/* ------------------------------------------------------------------ */}
        <section aria-labelledby="risk-distribution-heading" className="bg-[#0D1117] border border-[#161B26] rounded-xl p-6 shadow-xl">
          <div className="pb-6 border-b border-[#141A24]">
            <h2 id="risk-distribution-heading" className="text-[16px] font-semibold text-white tracking-tight">
              Risk Distribution
            </h2>
            <p className="text-[13px] text-[#6B7280] mt-0.5">
              Fleet health by status
            </p>
          </div>

          <div className="py-8 flex flex-col md:flex-row items-center justify-center gap-14 lg:gap-24">
            {/* Donut Visualization */}
            <div className="relative w-52 h-52 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 160 160" role="img" aria-label="Donut Chart of Fleet Health">
                {/* Background Track */}
                <circle cx="80" cy="80" r={donutGeometry.radius} className="stroke-[#121722]" strokeWidth="16" fill="transparent" />

                {/* Healthy Slice (Green) */}
                <circle
                  cx="80" cy="80" r={donutGeometry.radius} stroke="#34D399" strokeWidth="16"
                  strokeDasharray={`${donutGeometry.healthyStroke} ${donutGeometry.circumference}`}
                  strokeDashoffset={donutGeometry.healthyOffset}
                  fill="transparent"
                  className="transition-all duration-500 cursor-pointer hover:stroke-[#10B981]"
                  onClick={() => setStatusFilter('Healthy')}
                />
                {/* Warning Slice (Amber) */}
                <circle
                  cx="80" cy="80" r={donutGeometry.radius} stroke="#EAB308" strokeWidth="16"
                  strokeDasharray={`${donutGeometry.warningStroke} ${donutGeometry.circumference}`}
                  strokeDashoffset={donutGeometry.warningOffset}
                  fill="transparent"
                  className="transition-all duration-500 cursor-pointer hover:stroke-[#F59E0B]"
                  onClick={() => setStatusFilter('Warning')}
                />
                {/* Critical Slice (Red) */}
                <circle
                  cx="80" cy="80" r={donutGeometry.radius} stroke="#EF4444" strokeWidth="16"
                  strokeDasharray={`${donutGeometry.criticalStroke} ${donutGeometry.circumference}`}
                  strokeDashoffset={donutGeometry.criticalOffset}
                  fill="transparent"
                  className="transition-all duration-500 cursor-pointer hover:stroke-[#F43F5E]"
                  onClick={() => setStatusFilter('Critical')}
                />
              </svg>

              {/* Center Typography */}
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center select-none pointer-events-none">
                <span className="text-[34px] font-bold text-white leading-none font-mono">
                  {fleetStats?.total ?? 128}
                </span>
                <span className="text-[11px] tracking-widest text-[#6B7280] uppercase font-semibold mt-1">
                  EQUIPMENT
                </span>
              </div>
            </div>

            {/* Donut Legend */}
            <div className="space-y-4 text-[13px] w-48">
              <div
                onClick={() => setStatusFilter('Healthy')}
                className="flex items-center justify-between p-1.5 rounded-lg hover:bg-[#131924] cursor-pointer transition"
              >
                <div className="flex items-center gap-2.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#22C55E]"></span>
                  <span className="text-[#9CA3AF]">Healthy</span>
                </div>
                <div className="text-right font-mono">
                  <span className="text-white font-bold">{fleetStats?.healthy ?? 104}</span>
                  <span className="text-[#6B7280] text-[11px] ml-1.5">({fleetStats?.healthyPercent ?? 81.3}%)</span>
                </div>
              </div>

              <div
                onClick={() => setStatusFilter('Warning')}
                className="flex items-center justify-between p-1.5 rounded-lg hover:bg-[#131924] cursor-pointer transition"
              >
                <div className="flex items-center gap-2.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#EAB308]"></span>
                  <span className="text-[#9CA3AF]">Warning</span>
                </div>
                <div className="text-right font-mono">
                  <span className="text-white font-bold">{fleetStats?.atRisk ?? 17}</span>
                  <span className="text-[#6B7280] text-[11px] ml-1.5">(13.3%)</span>
                </div>
              </div>

              <div
                onClick={() => setStatusFilter('Critical')}
                className="flex items-center justify-between p-1.5 rounded-lg hover:bg-[#131924] cursor-pointer transition"
              >
                <div className="flex items-center gap-2.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#EF4444]"></span>
                  <span className="text-[#9CA3AF]">Critical</span>
                </div>
                <div className="text-right font-mono">
                  <span className="text-white font-bold">{fleetStats?.critical ?? 7}</span>
                  <span className="text-[#6B7280] text-[11px] ml-1.5">(5.4%)</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ------------------------------------------------------------------ */}
        {/* SECTION 4: PRIORITY EQUIPMENT TABLE */}
        {/* ------------------------------------------------------------------ */}
        <section aria-labelledby="priority-equipment-heading" className="bg-[#0D1117] border border-[#161B26] rounded-xl p-6 shadow-xl">
          <div className="flex items-center justify-between pb-5 border-b border-[#141A24]">
            <div>
              <h2 id="priority-equipment-heading" className="text-[16px] font-semibold text-white tracking-tight">
                Priority Equipment
              </h2>
              <p className="text-[13px] text-[#6B7280] mt-0.5">
                Assets requiring immediate attention
              </p>
            </div>
            <button
              onClick={() => {
                setStatusFilter('All');
                triggerToast('Viewing all 128 production assets in fleet.');
              }}
              className="text-[13px] text-[#6B7280] hover:text-white flex items-center gap-1 transition"
            >
              <span>View all</span>
              <Icons.ChevronRight />
            </button>
          </div>

          <div className="overflow-x-auto pt-2">
            <table className="w-full text-left text-[13px] border-collapse">
              <thead>
                <tr className="border-b border-[#141A24] text-[11px] text-[#6B7280] font-medium tracking-wider uppercase">
                  <th className="py-3 px-2">EQUIPMENT</th>
                  <th className="py-3 px-4">STATUS</th>
                  <th className="py-3 px-4">FAILURE RISK</th>
                  <th className="py-3 px-4">PRIORITY</th>
                  <th className="py-3 px-4">LAST UPDATED</th>
                  <th className="py-3 px-2 text-right">ACTION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#141924]">
                {priorityAssets.map((item) => {
                  const isSelected = item.equipmentId === selectedEquipmentId;
                  const riskPct = Math.round(item.failureRisk * 100);

                  return (
                    <tr
                      key={item.equipmentId}
                      onClick={() => {
                        setSelectedEquipmentId(item.equipmentId);
                        triggerToast(`Selected ${item.name} (${item.equipmentId})`);
                      }}
                      className={`cursor-pointer transition group ${
                        isSelected ? 'bg-[#141B26]' : 'hover:bg-[#111622]'
                      }`}
                    >
                      <td className="py-4 px-2">
                        <div className={`font-semibold font-mono ${isSelected ? 'text-[#00B4D8]' : 'text-white'}`}>
                          {item.equipmentId}
                        </div>
                        <div className="text-[12px] text-[#6B7280] mt-0.5">
                          {item.name}
                        </div>
                      </td>

                      <td className="py-4 px-4">
                        {item.status === 'critical' && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#2D1619] border border-[#521E24] text-[#EF4444] text-[11px] font-medium">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#EF4444]"></span>
                            Critical
                          </span>
                        )}
                        {item.status === 'warning' && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#2A1F14] border border-[#52381B] text-[#EAB308] text-[11px] font-medium">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#EAB308]"></span>
                            Warning
                          </span>
                        )}
                        {item.status === 'healthy' && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#132A1F] border border-[#1F5438] text-[#22C55E] text-[11px] font-medium">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E]"></span>
                            Healthy
                          </span>
                        )}
                      </td>

                      <td className="py-4 px-4 font-bold text-white font-mono text-[14px]">
                        {riskPct}%
                      </td>

                      <td className="py-4 px-4 capitalize text-[#D1D5DB] font-medium">
                        {item.priority}
                      </td>

                      <td className="py-4 px-4 text-[#6B7280] font-mono text-[12px]">
                        {item.lastUpdated}
                      </td>

                      <td className="py-4 px-2 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedEquipmentId(item.equipmentId);
                            const el = document.getElementById('investigation-section');
                            if (el) el.scrollIntoView({ behavior: 'smooth' });
                          }}
                          className="inline-flex items-center gap-1 text-[#00B4D8] hover:text-[#38BDF8] font-medium transition group-hover:translate-x-0.5"
                        >
                          <span>View</span>
                          <Icons.ArrowRight />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        {/* ------------------------------------------------------------------ */}
        {/* SECTION 5: EQUIPMENT DETAIL & REAL-TIME TELEMETRY PANEL */}
        {/* ------------------------------------------------------------------ */}
        {selectedEquipment && (
          <section id="investigation-section" className="bg-[#0D1117] border border-[#161B26] rounded-xl p-6 shadow-xl scroll-mt-20">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-[#141A24]">
              <div>
                <div className="flex items-center gap-3">
                  <span className="text-[18px] font-bold text-white font-mono">
                    {selectedEquipment.equipmentId}
                  </span>
                  <span className="text-[14px] text-slate-300 font-medium">
                    {selectedEquipment.name}
                  </span>
                  <span className={`text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                    selectedEquipment.status === 'critical' ? 'bg-[#2D1619] text-[#EF4444]' :
                    selectedEquipment.status === 'warning' ? 'bg-[#2A1F14] text-[#EAB308]' :
                    'bg-[#132A1F] text-[#22C55E]'
                  }`}>
                    {selectedEquipment.status}
                  </span>
                </div>
                <p className="text-[12px] text-[#6B7280] mt-1">
                  Plant Assignment: <span className="text-slate-300">{selectedEquipment.productionLine}</span> · Failure Risk: <span className="text-white font-bold font-mono">{Math.round(selectedEquipment.failureRisk * 100)}%</span>
                </p>
              </div>

              <div className="text-right text-[12px] text-[#6B7280]">
                Telemetry Transmission: <span className="text-slate-300 font-mono">{selectedEquipment.lastUpdated}</span>
              </div>
            </div>

            {/* Live Telemetry Sensor Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-5">
              {/* Vibration */}
              <div className="bg-[#101520] border border-[#1A2234] rounded-lg p-4">
                <div className="text-[11px] text-[#6B7280] uppercase tracking-wider font-semibold">
                  Vibration (RMS)
                </div>
                <div className="text-[24px] font-bold text-white mt-1 font-mono">
                  {selectedEquipment.telemetry?.vibration?.value ?? 4.82} <span className="text-[12px] text-[#6B7280] font-sans font-normal">mm/s</span>
                </div>
                <div className="flex items-center gap-1.5 mt-2 text-[11px]">
                  <span className={selectedEquipment.telemetry?.vibration?.delta >= 0 ? 'text-[#EF4444]' : 'text-[#22C55E]'}>
                    {selectedEquipment.telemetry?.vibration?.delta >= 0 ? '▲ +' : '▼ '}
                    {selectedEquipment.telemetry?.vibration?.delta ?? +0.08}
                  </span>
                  <span className="text-[#6B7280]">drift</span>
                </div>
              </div>

              {/* Temperature */}
              <div className="bg-[#101520] border border-[#1A2234] rounded-lg p-4">
                <div className="text-[11px] text-[#6B7280] uppercase tracking-wider font-semibold">
                  Operating Temp
                </div>
                <div className="text-[24px] font-bold text-white mt-1 font-mono">
                  {selectedEquipment.telemetry?.temperature?.value ?? 88.4} <span className="text-[12px] text-[#6B7280] font-sans font-normal">°C</span>
                </div>
                <div className="flex items-center gap-1.5 mt-2 text-[11px]">
                  <span className={selectedEquipment.telemetry?.temperature?.delta >= 0 ? 'text-[#EF4444]' : 'text-[#22C55E]'}>
                    {selectedEquipment.telemetry?.temperature?.delta >= 0 ? '▲ +' : '▼ '}
                    {selectedEquipment.telemetry?.temperature?.delta ?? +0.4}
                  </span>
                  <span className="text-[#6B7280]">thermal shift</span>
                </div>
              </div>

              {/* Pressure / Current */}
              <div className="bg-[#101520] border border-[#1A2234] rounded-lg p-4">
                <div className="text-[11px] text-[#6B7280] uppercase tracking-wider font-semibold">
                  {selectedEquipment.telemetry?.pressure ? 'Discharge Pressure' : 'Phase Current'}
                </div>
                <div className="text-[24px] font-bold text-white mt-1 font-mono">
                  {selectedEquipment.telemetry?.pressure?.value ?? selectedEquipment.telemetry?.current?.value ?? 142.1} <span className="text-[12px] text-[#6B7280] font-sans font-normal">{selectedEquipment.telemetry?.pressure?.unit ?? 'PSI'}</span>
                </div>
                <div className="flex items-center gap-1.5 mt-2 text-[11px]">
                  <span className="text-[#EAB308]">Within limit</span>
                </div>
              </div>

              {/* RPM */}
              <div className="bg-[#101520] border border-[#1A2234] rounded-lg p-4">
                <div className="text-[11px] text-[#6B7280] uppercase tracking-wider font-semibold">
                  Shaft Speed
                </div>
                <div className="text-[24px] font-bold text-white mt-1 font-mono">
                  {selectedEquipment.telemetry?.rpm?.value ?? 1750} <span className="text-[12px] text-[#6B7280] font-sans font-normal">RPM</span>
                </div>
                <div className="flex items-center gap-1.5 mt-2 text-[11px]">
                  <span className="text-[#22C55E]">Nominal speed</span>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ------------------------------------------------------------------ */}
        {/* SECTION 6: "WHY IS THIS EQUIPMENT AT RISK?" (SHAP EXPLAINABILITY) */}
        {/* ------------------------------------------------------------------ */}
        <section id="shap-section" aria-labelledby="shap-heading" className="bg-[#0D1117] border border-[#161B26] rounded-xl p-6 shadow-xl scroll-mt-24">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-6 border-b border-[#141A24]">
            <div>
              <div className="flex items-center gap-3">
                <h2 id="shap-heading" className="text-[16px] font-semibold text-white tracking-tight">
                  Why is this equipment at risk?
                </h2>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-[#101826] border border-[#1E293B] text-[#00B4D8]">
                  Model contribution
                </span>
              </div>
              <p className="text-[13px] text-[#6B7280] mt-0.5">
                Top factors contributing to the model prediction for{' '}
                <span className="text-white font-mono font-semibold">
                  {selectedEquipment?.name} ({selectedEquipment?.equipmentId})
                </span>
              </p>
            </div>

            {/* Legend: Increases Risk vs Reduces Risk */}
            <div className="flex items-center gap-5 text-[12px]">
              <div className="flex items-center gap-1.5">
                <Icons.TrendingUp />
                <span className="text-[#9CA3AF]">Increases risk</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Icons.TrendingDown />
                <span className="text-[#9CA3AF]">Reduces risk</span>
              </div>
            </div>
          </div>

          {/* Model Risk Output Context */}
          <div className="pt-4 pb-3 flex items-center justify-between text-[12px] border-b border-[#141A24]">
            <div className="text-[#6B7280]">
              Base Population Risk: <span className="text-slate-300 font-mono">15%</span>
            </div>
            <div className="text-[#6B7280]">
              Model Predicted Risk: <span className="text-white font-bold font-mono text-[13px]">{Math.round((selectedEquipment?.failureRisk || 0.87) * 100)}%</span>
            </div>
          </div>

          {/* SHAP Contribution Factor Rows */}
          <div className="space-y-4 pt-4">
            {shapData?.topFactors?.map((factor, idx) => {
              const isIncrease = factor.direction === 'increase';
              const absVal = Math.abs(factor.value);
              // Proportional width capped at 85%
              const barWidth = Math.min(Math.round((absVal / 0.5) * 82), 85);

              return (
                <div key={idx} className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 py-1">
                  {/* Feature Label & Sensor Reading */}
                  <div className="w-44 text-[13px] text-[#9CA3AF] font-normal truncate">
                    <span className="text-white font-medium">{factor.feature}</span>
                    <span className="block text-[11px] text-[#6B7280] font-mono">{factor.currentValue}</span>
                  </div>

                  {/* Horizontal Contribution Bar */}
                  <div className="flex-1 h-7 rounded-[3px] bg-[#0E131C] relative overflow-hidden flex items-center">
                    <div
                      className={`h-full rounded-[3px] flex items-center px-3 transition-all duration-500 ease-out ${
                        isIncrease ? 'bg-[#B84343]' : 'bg-[#0E8388]'
                      }`}
                      style={{ width: `${Math.max(barWidth, 24)}%` }}
                    >
                      <span className="text-[11px] font-normal text-white/90 whitespace-nowrap">
                        {factor.label}
                      </span>
                    </div>
                  </div>

                  {/* Numeric Weight */}
                  <div className={`w-16 text-right font-bold text-[13px] font-mono ${
                    isIncrease ? 'text-[#E05252]' : 'text-[#00B4D8]'
                  }`}>
                    {factor.contributionText}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ------------------------------------------------------------------ */}
        {/* SECTION 7: AGENTIC AI MAINTENANCE INSIGHT */}
        {/* ------------------------------------------------------------------ */}
        {aiRecommendation && (
          <section aria-labelledby="ai-insight-heading" className="bg-[#0D1117] border border-[#161B26] rounded-xl p-6 shadow-xl">
            <div className="flex items-center justify-between pb-4 border-b border-[#141A24]">
              <div className="flex items-center gap-3">
                <div className="p-1.5 rounded-md bg-[#0F2232] text-[#38BDF8] border border-[#164157]">
                  <Icons.ShieldCheck />
                </div>
                <div>
                  <h3 id="ai-insight-heading" className="text-[15px] font-semibold text-white tracking-tight">
                    AI Maintenance Insight
                  </h3>
                  <p className="text-[11px] text-[#6B7280]">
                    Automated diagnosis & remedial triage via {aiRecommendation.source}
                  </p>
                </div>
              </div>

              <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded ${
                aiRecommendation.priority === 'urgent' ? 'bg-[#2D1619] text-[#EF4444] border border-[#521E24]' :
                aiRecommendation.priority === 'high' ? 'bg-[#2D1619] text-[#EF4444]' :
                'bg-[#2A1F14] text-[#EAB308]'
              }`}>
                {aiRecommendation.priority}
              </span>
            </div>

            <div className="pt-4 space-y-3">
              <div className="text-[13px] font-bold text-white">
                "{aiRecommendation.diagnosticHeadline}"
              </div>
              <div className="text-[12px] text-[#9CA3AF] leading-relaxed bg-[#090C10] p-3.5 rounded-lg border border-[#141A24]">
                <span className="text-white font-medium">Recommendation: </span>
                {aiRecommendation.recommendation}
              </div>

              <div className="flex flex-wrap items-center justify-end gap-3 pt-2">
                <button
                  onClick={() => triggerToast(`Work order draft initiated for ${selectedEquipment?.equipmentId}.`)}
                  className="px-3.5 py-1.5 rounded-lg bg-[#141C2A] hover:bg-[#1E283C] text-slate-200 text-[12px] font-medium border border-[#212C42] transition"
                >
                  Create Work Order
                </button>
                <button
                  onClick={() => triggerToast(`Technician dispatched to ${selectedEquipment?.productionLine}.`)}
                  className="px-3.5 py-1.5 rounded-lg bg-[#00B4D8] hover:bg-[#0096B4] text-slate-950 text-[12px] font-bold transition"
                >
                  Dispatch Technician
                </button>
              </div>
            </div>
          </section>
        )}

        {/* ------------------------------------------------------------------ */}
        {/* SECTION 8: LIVE OPERATIONAL EVENT STREAM */}
        {/* ------------------------------------------------------------------ */}
        <section aria-labelledby="live-events-heading" className="bg-[#0D1117] border border-[#161B26] rounded-xl p-6 shadow-xl">
          <div className="flex items-center justify-between pb-4 border-b border-[#141A24]">
            <div>
              <h3 id="live-events-heading" className="text-[15px] font-semibold text-white tracking-tight">
                Live Operational Event Stream
              </h3>
              <p className="text-[11px] text-[#6B7280]">
                Telemetry anomaly detection & automated incident transitions
              </p>
            </div>
            <span className="text-[11px] text-[#6B7280] font-mono">
              {events.length} logged
            </span>
          </div>

          <div className="divide-y divide-[#141924] pt-2">
            {events.slice(0, 5).map((evt) => (
              <div key={evt.id} className="py-2.5 flex items-center justify-between gap-4 text-[12px]">
                <div className="flex items-center gap-3">
                  <span className="text-[11px] font-mono text-[#6B7280] w-16">{evt.timestamp}</span>
                  <span className={`w-1.5 h-1.5 rounded-full ${
                    evt.severity === 'critical' ? 'bg-[#EF4444]' :
                    evt.severity === 'warning' ? 'bg-[#EAB308]' : 'bg-[#00B4D8]'
                  }`}></span>
                  <span className="text-slate-300">{evt.message}</span>
                </div>
                <span className="text-[11px] font-mono text-[#6B7280] hidden sm:inline">
                  {evt.equipmentId}
                </span>
              </div>
            ))}
          </div>
        </section>

      </main>

      {/* -------------------------------------------------------------------- */}
      {/* 3. SLIDE-OVER AI ALERT DRAWER (WITH ACTIVE -> ACK -> RESOLVED LIFECYCLE) */}
      {/* -------------------------------------------------------------------- */}
      {isAlertsOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden" role="dialog" aria-modal="true" aria-labelledby="alert-drawer-title">
          {/* Backdrop */}
          <div onClick={() => setIsAlertsOpen(false)} className="absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity" />

          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-md bg-[#0D1117] border-l border-[#1A202C] shadow-2xl flex flex-col">
              {/* Drawer Header */}
              <div className="p-5 border-b border-[#161B26] flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 rounded-md bg-[#2D1619] text-[#EF4444]">
                    <Icons.Bell />
                  </div>
                  <div>
                    <h3 id="alert-drawer-title" className="text-sm font-bold text-white">Active AI Triage Alerts</h3>
                    <p className="text-[11px] text-[#6B7280]">Incident triage & lifecycle management</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsAlertsOpen(false)}
                  className="p-1.5 text-[#6B7280] hover:text-white transition"
                  aria-label="Close Alert Drawer"
                >
                  <Icons.Close />
                </button>
              </div>

              {/* Drawer Tabs (Active vs Acknowledged vs Resolved) */}
              <div className="flex items-center border-b border-[#161B26] px-5 text-[12px]">
                {[
                  { id: 'active', label: `Active (${alerts.filter(a => a.status === 'active').length})` },
                  { id: 'acknowledged', label: `Acknowledged (${alerts.filter(a => a.status === 'acknowledged').length})` },
                  { id: 'resolved', label: `Resolved (${alerts.filter(a => a.status === 'resolved').length})` }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setAlertsTab(tab.id)}
                    className={`py-3 px-3 font-medium transition border-b-2 ${
                      alertsTab === tab.id
                        ? 'border-[#00B4D8] text-white font-semibold'
                        : 'border-transparent text-[#6B7280] hover:text-slate-200'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Alert List */}
              <div className="flex-1 overflow-y-auto p-5 space-y-3.5">
                {visibleAlerts.length === 0 ? (
                  <div className="py-16 text-center text-xs text-[#6B7280]">
                    No alerts currently under <span className="text-white capitalize">{alertsTab}</span> status.
                  </div>
                ) : (
                  visibleAlerts.map((alert) => (
                    <div
                      key={alert.id}
                      className={`p-4 rounded-xl border space-y-2.5 transition ${
                        alert.status === 'active'
                          ? 'bg-[#111620] border-[#1A2130]'
                          : 'bg-[#0E131C] border-[#161C28] opacity-80'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[12px] font-semibold text-[#00B4D8] font-mono">{alert.equipmentId}</span>
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                          alert.severity === 'critical' ? 'bg-[#2D1619] text-[#EF4444]' : 'bg-[#2A1F14] text-[#EAB308]'
                        }`}>
                          {alert.severity}
                        </span>
                      </div>

                      <div className="text-[13px] font-semibold text-white">
                        {alert.message}
                      </div>

                      <div className="text-[12px] text-[#9CA3AF] leading-relaxed bg-[#090C10] p-2.5 rounded-lg border border-[#141A24]">
                        <span className="text-[#D1D5DB] font-medium">Recommendation: </span>
                        {alert.recommendation}
                      </div>

                      {/* Acknowledgement Status Callout */}
                      {alert.acknowledgedBy && (
                        <div className="text-[11px] text-[#34D399] font-mono">
                          ✓ Acknowledged by {alert.acknowledgedBy} at {alert.acknowledgedAt}
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-2">
                        <span className="text-[11px] text-[#6B7280] font-mono">{alert.timestamp}</span>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              setSelectedEquipmentId(alert.equipmentId);
                              setIsAlertsOpen(false);
                              const el = document.getElementById('investigation-section');
                              if (el) el.scrollIntoView({ behavior: 'smooth' });
                            }}
                            className="px-2.5 py-1 rounded bg-[#1A2230] text-[#D1D5DB] text-[11px] hover:bg-[#222E42] transition"
                          >
                            Investigate
                          </button>

                          {alert.status === 'active' && (
                            <button
                              onClick={() => handleAcknowledge(alert.id)}
                              className="px-2.5 py-1 rounded bg-[#D94C4C] hover:bg-[#E05252] text-white text-[11px] font-semibold transition"
                            >
                              Acknowledge
                            </button>
                          )}

                          {alert.status === 'acknowledged' && (
                            <button
                              onClick={() => handleResolve(alert.id)}
                              className="px-2.5 py-1 rounded bg-[#22C55E] hover:bg-[#16A34A] text-slate-950 text-[11px] font-bold transition"
                            >
                              Resolve
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* -------------------------------------------------------------------- */}
      {/* 4. FLOATING BOTTOM TOOLBAR DOCK */}
      {/* -------------------------------------------------------------------- */}
      <footer className="fixed bottom-4 inset-x-0 z-40 flex justify-center pointer-events-none px-4">
        <div className="pointer-events-auto bg-[#0E131C]/95 backdrop-blur-md border border-[#1D2536] shadow-2xl rounded-xl px-5 py-2 flex items-center gap-8 text-[12px]">
          {/* Overview Tab */}
          <button
            onClick={() => {
              setActiveNavTab('overview');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className={`flex flex-col items-center gap-1 transition ${
              activeNavTab === 'overview' ? 'text-[#00B4D8]' : 'text-[#6B7280] hover:text-white'
            }`}
            aria-label="Overview Dashboard"
          >
            <Icons.OverviewGrid />
            <span className="text-[11px]">Overview</span>
          </button>

          {/* Equipment Tab */}
          <button
            onClick={() => {
              setActiveNavTab('equipment');
              const el = document.getElementById('equipment-risk-heading');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            className={`flex flex-col items-center gap-1 transition ${
              activeNavTab === 'equipment' ? 'text-[#00B4D8]' : 'text-[#6B7280] hover:text-white'
            }`}
            aria-label="Equipment Section"
          >
            <Icons.Nodes />
            <span className="text-[11px]">Equipment</span>
          </button>

          {/* Tools Capsule */}
          <div className="flex items-center gap-3 px-3 py-1 bg-[#141B26] rounded-lg border border-[#20293C] text-[#9CA3AF]">
            <button onClick={() => triggerToast('Canvas viewport zoomed to fit.')} className="p-1 hover:text-white" title="Fit"><Icons.Expand /></button>
            <button onClick={() => triggerToast('Annotation mode enabled.')} className="p-1 hover:text-white" title="Text"><Icons.Text /></button>
            <button onClick={() => triggerToast('Telemetry marker tool selected.')} className="p-1 hover:text-white" title="Marker"><Icons.Pencil /></button>
            <button onClick={() => triggerToast('AI Operations Assistant ready.')} className="p-1 hover:text-white" title="Chat"><Icons.MessageCircle /></button>
          </div>

          {/* Alerts Tab */}
          <button
            onClick={() => setIsAlertsOpen(true)}
            className={`flex flex-col items-center gap-1 transition relative ${
              activeNavTab === 'alerts' ? 'text-[#00B4D8]' : 'text-[#6B7280] hover:text-white'
            }`}
            aria-label="Alerts"
          >
            <Icons.Bell />
            <span className="text-[11px]">Alerts</span>
            {activeAlertsCount > 0 && (
              <span className="absolute -top-1 right-1 w-2 h-2 rounded-full bg-[#EF4444]"></span>
            )}
          </button>

          {/* Maintenance Tab */}
          <button
            onClick={() => {
              setActiveNavTab('maintenance');
              const el = document.getElementById('ai-insight-heading');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            className={`flex flex-col items-center gap-1 transition ${
              activeNavTab === 'maintenance' ? 'text-[#00B4D8]' : 'text-[#6B7280] hover:text-white'
            }`}
            aria-label="Maintenance"
          >
            <Icons.Wrench />
            <span className="text-[11px]">Maintenance</span>
          </button>
        </div>
      </footer>

      {/* -------------------------------------------------------------------- */}
      {/* 5. TOAST NOTIFICATION */}
      {/* -------------------------------------------------------------------- */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-[#141B26] border border-[#00B4D8]/40 text-slate-100 text-[12px] px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2.5 animate-in fade-in slide-in-from-top-2 duration-200">
          <span className="w-2 h-2 rounded-full bg-[#00B4D8]"></span>
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
