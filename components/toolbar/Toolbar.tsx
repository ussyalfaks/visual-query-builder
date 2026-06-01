'use client';
import { useState, useRef } from 'react';
import {
  Play, Undo2, Download, Upload, RotateCcw,
  BookmarkPlus, ChevronDown, Trash2
} from 'lucide-react';
import { useQueryStore } from '@/store/queryStore';
import { MOCK_DATA } from '@/data/mockData';

export function Toolbar() {
  const {
    history, errors, isRunning, presets,
    runQuery, undo, resetQuery, savePreset, loadPreset, deletePreset,
    importQuery,
  } = useQueryStore();

  const { root } = useQueryStore();
  const [showPresets, setShowPresets] = useState(false);
  const [saveName, setSaveName] = useState('');
  const [showSave, setShowSave] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const errorCount = Object.keys(errors).length;

  const handleExport = () => {
    const blob = new Blob([JSON.stringify(root, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'query.json';
    a.click();
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      try {
        importQuery(ev.target?.result as string);
      } catch {
        alert('Invalid query JSON file');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleSave = () => {
    if (!saveName.trim()) return;
    savePreset(saveName.trim());
    setSaveName('');
    setShowSave(false);
  };

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {/* Run */}
      <button
        onClick={() => runQuery(MOCK_DATA)}
        disabled={isRunning}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-foreground text-background text-sm font-medium hover:opacity-90 disabled:opacity-50 transition-all"
      >
        <Play className="h-3.5 w-3.5" />
        {isRunning ? 'Running...' : 'Run query'}
      </button>

      {/* Error badge */}
      {errorCount > 0 && (
        <span className="text-xs px-2 py-1 rounded-full bg-destructive/10 text-destructive font-medium">
          {errorCount} error{errorCount > 1 ? 's' : ''}
        </span>
      )}

      <div className="h-5 w-px bg-border mx-1" />

      {/* Undo */}
      <button
        onClick={undo}
        disabled={history.length === 0}
        title="Undo (Ctrl+Z)"
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border border-border text-sm text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-40 transition-colors"
      >
        <Undo2 className="h-3.5 w-3.5" />
        Undo
      </button>

      {/* Reset */}
      <button
        onClick={resetQuery}
        title="Reset query"
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border border-border text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
      >
        <RotateCcw className="h-3.5 w-3.5" />
        Reset
      </button>

      <div className="h-5 w-px bg-border mx-1" />

      {/* Presets */}
      <div className="relative">
        <button
          onClick={() => setShowPresets(p => !p)}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border border-border text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        >
          Presets
          <ChevronDown className="h-3.5 w-3.5" />
        </button>
        {showPresets && (
          <div className="absolute left-0 top-full mt-1 z-50 bg-background border border-border rounded-lg shadow-lg min-w-52 overflow-hidden">
            {presets.length === 0 && (
              <div className="px-4 py-3 text-sm text-muted-foreground">No saved presets</div>
            )}
            {presets.map(p => (
              <div
                key={p.id}
                className="flex items-center gap-2 px-3 py-2 hover:bg-muted group"
              >
                <button
                  className="flex-1 text-left text-sm"
                  onClick={() => { loadPreset(p.query); setShowPresets(false); }}
                >
                  {p.name}
                </button>
                <button
                  onClick={() => deletePreset(p.id)}
                  className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-all"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
            <div className="border-t border-border p-2">
              {showSave ? (
                <div className="flex gap-2">
                  <input
                    autoFocus
                    type="text"
                    placeholder="Preset name..."
                    value={saveName}
                    onChange={e => setSaveName(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleSave()}
                    className="flex-1 h-7 rounded border border-input bg-background px-2 text-xs focus:outline-none focus:ring-1 focus:ring-ring"
                  />
                  <button onClick={handleSave} className="text-xs px-2 py-1 rounded bg-foreground text-background">Save</button>
                </div>
              ) : (
                <button
                  onClick={() => setShowSave(true)}
                  className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground w-full"
                >
                  <BookmarkPlus className="h-3.5 w-3.5" />
                  Save current as preset
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="flex-1" />

      {/* Import / Export */}
      <input ref={fileRef} type="file" accept=".json" onChange={handleImport} className="hidden" />
      <button
        onClick={() => fileRef.current?.click()}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border border-border text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
      >
        <Upload className="h-3.5 w-3.5" />
        Import
      </button>
      <button
        onClick={handleExport}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border border-border text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
      >
        <Download className="h-3.5 w-3.5" />
        Export
      </button>
    </div>
  );
}
