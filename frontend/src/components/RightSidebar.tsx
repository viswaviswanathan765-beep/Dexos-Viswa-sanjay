import React, { useState } from 'react';
import { CheckCircle, AlertTriangle, XCircle, Info, Activity, IndianRupee, PieChart } from 'lucide-react';
import type { ValidationResult, SpaceAnalysis, CostEstimate, PlacedRoom } from '../types';
import { formatINR } from '../engine/costEngine';

interface RightSidebarProps {
  validations: ValidationResult[];
  spaceAnalysis: SpaceAnalysis | null;
  costEstimate: CostEstimate | null;
  selectedRoom: string | null;
  rooms: PlacedRoom[];
}

const SeverityIcon: React.FC<{ severity: string }> = ({ severity }) => {
  switch (severity) {
    case 'ERROR': return <XCircle size={15} className="text-red-400 shrink-0" />;
    case 'WARNING': return <AlertTriangle size={15} className="text-amber-400 shrink-0" />;
    case 'SUCCESS': return <CheckCircle size={15} className="text-green-400 shrink-0" />;
    default: return <Info size={15} className="text-blue-400 shrink-0" />;
  }
};

const severityBg: Record<string, string> = {
  ERROR: 'bg-red-950/30 border-red-900/40 text-red-200',
  WARNING: 'bg-amber-950/30 border-amber-900/40 text-amber-200',
  SUCCESS: 'bg-green-950/30 border-green-900/40 text-green-200',
  INFO: 'bg-blue-950/30 border-blue-900/40 text-blue-200',
};

const costBreakdown = [
  { key: 'structureCost' as const, label: 'Structure', pct: 40, color: 'bg-blue-500' },
  { key: 'flooringCost' as const, label: 'Flooring', pct: 15, color: 'bg-purple-500' },
  { key: 'electricalCost' as const, label: 'Electrical', pct: 10, color: 'bg-amber-500' },
  { key: 'plumbingCost' as const, label: 'Plumbing', pct: 10, color: 'bg-cyan-500' },
  { key: 'finishesCost' as const, label: 'Finishes', pct: 25, color: 'bg-green-500' },
];

export const RightSidebar: React.FC<RightSidebarProps> = ({
  validations,
  spaceAnalysis,
  costEstimate,
}) => {
  const [activeTab, setActiveTab] = useState<'validation' | 'analysis' | 'cost'>('validation');

  const errorCount = validations.filter(v => v.severity === 'ERROR').length;
  const warningCount = validations.filter(v => v.severity === 'WARNING').length;
  const successCount = validations.filter(v => v.severity === 'SUCCESS').length;
  const score = spaceAnalysis?.validationScore ?? 0;

  const tabs = [
    { id: 'validation' as const, label: 'Validation', icon: <Activity size={14} /> },
    { id: 'analysis' as const, label: 'Analysis', icon: <PieChart size={14} /> },
    { id: 'cost' as const, label: 'Cost', icon: <IndianRupee size={14} /> },
  ];

  return (
    <div className="w-[310px] min-w-[310px] h-full bg-slate-900 border-l border-slate-700 flex flex-col">
      {/* Tab Headers */}
      <div className="flex border-b border-slate-700">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-3 text-xs font-medium border-b-2 flex justify-center gap-1.5 items-center transition-colors ${
              activeTab === tab.id
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-3">
        {/* Validation Tab */}
        {activeTab === 'validation' && (
          <div className="flex flex-col gap-3">
            {/* Score Ring */}
            <div className="flex items-center justify-between p-4 bg-slate-800 rounded-lg border border-slate-700">
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-slate-200">Plan Score</span>
                <span className="text-xs text-slate-400">Design Compliance</span>
              </div>
              <div className="relative w-14 h-14 flex items-center justify-center">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-slate-700"
                    strokeWidth="3" stroke="currentColor" fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className={score > 80 ? 'text-green-500' : score > 50 ? 'text-amber-500' : 'text-red-500'}
                    strokeDasharray={`${score}, 100`}
                    strokeWidth="3" strokeLinecap="round" stroke="currentColor" fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <div className="absolute flex items-center justify-center text-sm font-bold text-slate-200">
                  {score}
                </div>
              </div>
            </div>

            {/* Summary badges */}
            <div className="flex gap-2 text-xs">
              <div className="flex items-center gap-1 px-2 py-1.5 rounded bg-red-900/30 text-red-400 border border-red-900/50">
                <XCircle size={12} /> {errorCount} Errors
              </div>
              <div className="flex items-center gap-1 px-2 py-1.5 rounded bg-amber-900/30 text-amber-400 border border-amber-900/50">
                <AlertTriangle size={12} /> {warningCount} Warns
              </div>
              <div className="flex items-center gap-1 px-2 py-1.5 rounded bg-green-900/30 text-green-400 border border-green-900/50">
                <CheckCircle size={12} /> {successCount} OK
              </div>
            </div>

            {/* Validation list */}
            <div className="flex flex-col gap-2">
              {validations.length === 0 ? (
                <div className="text-sm text-slate-500 text-center py-8">
                  Generate a plan to see validation results
                </div>
              ) : (
                validations.map((v, i) => (
                  <div key={i} className={`p-2.5 rounded-lg border text-xs flex gap-2.5 ${severityBg[v.severity] || severityBg.INFO}`}>
                    <SeverityIcon severity={v.severity} />
                    <div className="flex flex-col gap-0.5">
                      <span className="font-medium leading-snug">{v.message}</span>
                      {v.suggestedFix && (
                        <span className="text-[10px] opacity-70 mt-0.5">💡 {v.suggestedFix}</span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Analysis Tab */}
        {activeTab === 'analysis' && (
          <div className="flex flex-col gap-3">
            {spaceAnalysis ? (
              <>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label: 'Plot Area', value: `${spaceAnalysis.plotArea.toLocaleString()} sq.ft` },
                    { label: 'Buildable Area', value: `${spaceAnalysis.buildableArea.toLocaleString()} sq.ft` },
                    { label: 'Built-up Area', value: `${spaceAnalysis.builtUpArea.toLocaleString()} sq.ft` },
                    { label: 'Open Area', value: `${spaceAnalysis.openArea.toLocaleString()} sq.ft` },
                    { label: 'Room Count', value: `${spaceAnalysis.roomCount}` },
                    { label: 'Parking Area', value: `${spaceAnalysis.parkingArea.toLocaleString()} sq.ft` },
                  ].map(item => (
                    <div key={item.label} className="bg-slate-800 p-3 rounded-lg border border-slate-700">
                      <div className="text-[10px] text-slate-400 mb-1">{item.label}</div>
                      <div className="text-sm font-semibold text-slate-200">{item.value}</div>
                    </div>
                  ))}
                </div>

                {/* Utilization bar */}
                <div className="bg-slate-800 p-3 rounded-lg border border-slate-700">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs text-slate-400">Space Utilization</span>
                    <span className="text-sm font-bold text-slate-200">{spaceAnalysis.spaceUtilization}%</span>
                  </div>
                  <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        spaceAnalysis.spaceUtilization > 90 ? 'bg-amber-500' :
                        spaceAnalysis.spaceUtilization > 70 ? 'bg-green-500' : 'bg-blue-500'
                      }`}
                      style={{ width: `${Math.min(100, spaceAnalysis.spaceUtilization)}%` }}
                    />
                  </div>
                </div>

                {/* Validation Score */}
                <div className="bg-slate-800 p-3 rounded-lg border border-slate-700">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-slate-400">Validation Score</span>
                    <span className={`text-sm font-bold ${
                      spaceAnalysis.validationScore > 80 ? 'text-green-400' :
                      spaceAnalysis.validationScore > 50 ? 'text-amber-400' : 'text-red-400'
                    }`}>{spaceAnalysis.validationScore}/100</span>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-sm text-slate-500 text-center py-8">Generate a plan to see analysis</div>
            )}
          </div>
        )}

        {/* Cost Tab */}
        {activeTab === 'cost' && (
          <div className="flex flex-col gap-3">
            {costEstimate ? (
              <>
                {/* Total cost */}
                <div className="bg-gradient-to-br from-slate-800 to-slate-800/50 p-4 rounded-lg border border-slate-700 text-center">
                  <div className="text-xs text-slate-400 mb-1">Estimated Total Cost</div>
                  <div className="text-2xl font-bold text-slate-100">
                    {formatINR(costEstimate.totalCost)}
                  </div>
                  <div className="text-xs text-slate-500 mt-1">
                    {costEstimate.builtUpArea.toLocaleString()} sq.ft × {formatINR(costEstimate.ratePerSqFt)}/sq.ft
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">
                    Quality: {costEstimate.finishQuality}
                  </div>
                </div>

                {/* Breakdown */}
                <div className="flex flex-col gap-2.5">
                  <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Cost Breakdown</h3>
                  {costBreakdown.map(item => (
                    <div key={item.key} className="flex flex-col gap-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-300">{item.label} ({item.pct}%)</span>
                        <span className="text-slate-400 font-medium">{formatINR(costEstimate[item.key])}</span>
                      </div>
                      <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${item.color}`} style={{ width: `${item.pct}%` }} />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Disclaimer */}
                <div className="mt-2 p-3 bg-slate-800/50 rounded-lg text-[10px] text-slate-500 leading-relaxed border border-slate-700/50">
                  <Info size={12} className="inline mr-1 mb-0.5 text-slate-400" />
                  Indicative estimate only. Actual costs vary based on location, materials, contractor, and market rates. Consult a professional for accurate costing.
                </div>
              </>
            ) : (
              <div className="text-sm text-slate-500 text-center py-8">Generate a plan to see cost estimate</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
