import React from 'react';
import { Building2, Plus, Sparkles, Play, LayoutDashboard, Box, Loader2, Undo2, Redo2 } from 'lucide-react';

import type { ViewMode } from '../types';

interface TopBarProps {
  projectName: string;
  viewMode: ViewMode;
  isGenerating: boolean;
  onGenerate: () => void;
  onValidate: () => void;
  onSwitchView: (mode: ViewMode) => void;
  onNewProject: () => void;
  onDemo: () => void;
  onUndo?: () => void;
  onRedo?: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
}

export const TopBar: React.FC<TopBarProps> = ({
  projectName,
  viewMode,
  isGenerating,
  onGenerate,
  onValidate,
  onSwitchView,
  onNewProject,
  onDemo,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
}) => {
  return (
    <div className="h-14 bg-slate-900 border-b border-slate-700 flex items-center justify-between px-4 select-none">
      <div className="flex items-center gap-3">
        <div className="bg-blue-600 p-1.5 rounded-md">
          <Building2 size={20} className="text-white" />
        </div>
        <div className="flex flex-col">
          <span className="font-semibold text-slate-200 text-sm leading-tight">ArchPlanner</span>
          <span className="text-xs text-slate-400 leading-tight">{projectName}</span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={onNewProject}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800 rounded-md transition-colors"
        >
          <Plus size={16} />
          New
        </button>
        <button
          onClick={onDemo}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-amber-400 hover:text-amber-300 hover:bg-slate-800 rounded-md transition-colors"
        >
          <Sparkles size={16} />
          Demo
        </button>
        
        <div className="w-px h-6 bg-slate-700 mx-2" />

        <div className="flex gap-1">
          <button
            onClick={onUndo}
            disabled={!canUndo}
            className={`p-1.5 rounded-md transition-colors ${canUndo ? 'text-slate-300 hover:text-white hover:bg-slate-800' : 'text-slate-600 cursor-not-allowed'}`}
            title="Undo"
          >
            <Undo2 size={16} />
          </button>
          <button
            onClick={onRedo}
            disabled={!canRedo}
            className={`p-1.5 rounded-md transition-colors ${canRedo ? 'text-slate-300 hover:text-white hover:bg-slate-800' : 'text-slate-600 cursor-not-allowed'}`}
            title="Redo"
          >
            <Redo2 size={16} />
          </button>
        </div>
        
        <div className="w-px h-6 bg-slate-700 mx-1" />
        
        <button
          onClick={onValidate}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800 rounded-md transition-colors"
        >
          <LayoutDashboard size={16} />
          Validate
        </button>
        
        <button
          onClick={onGenerate}
          disabled={isGenerating}
          className={`flex items-center gap-1.5 px-4 py-1.5 text-sm font-medium rounded-md transition-all ${
            isGenerating 
              ? 'bg-blue-700 text-blue-200 cursor-not-allowed' 
              : 'bg-blue-600 text-white hover:bg-blue-500 shadow-md shadow-blue-900/50'
          }`}
        >
          {isGenerating ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <Play size={16} className="fill-current" />
          )}
          {isGenerating ? 'Generating...' : 'Generate Plan'}
        </button>

        <div className="w-px h-6 bg-slate-700 mx-2" />

        <div className="flex bg-slate-800 p-0.5 rounded-lg border border-slate-700">
          <button
            onClick={() => onSwitchView('2D')}
            className={`flex items-center gap-1 px-3 py-1 text-xs font-medium rounded-md transition-colors ${
              viewMode === '2D' ? 'bg-slate-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <LayoutDashboard size={14} />
            2D
          </button>
          <button
            onClick={() => onSwitchView('SPLIT')}
            className={`flex items-center gap-1 px-3 py-1 text-xs font-medium rounded-md transition-colors ${
              viewMode === 'SPLIT' ? 'bg-slate-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <div className="flex">
              <LayoutDashboard size={14} className="opacity-70" />
              <Box size={14} className="-ml-1" />
            </div>
            Split
          </button>
          <button
            onClick={() => onSwitchView('3D')}
            className={`flex items-center gap-1 px-3 py-1 text-xs font-medium rounded-md transition-colors ${
              viewMode === '3D' ? 'bg-slate-600 text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Box size={14} />
            3D
          </button>
        </div>
      </div>
    </div>
  );
};
