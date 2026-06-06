'use client';
import { useState, useRef, useCallback, useEffect } from 'react';
import {
  Play, Undo2, RotateCcw, ChevronDown,
  BookmarkPlus, Upload, Download, Trash2, AlertCircle,
} from 'lucide-react';
import { useQueryStore } from '@/store/queryStore';
import { ConditionGroup } from '@/components/query-builder/ConditionGroup';
import { QueryBuilder } from '@/components/QueryBuilder';
import { ThemeToggle } from '@/components/ThemeToggle';
import { MOCK_DATA } from '@/data/mockData';
import { inferSchema } from '@/lib/inferSchema';

function collectArrays(node: unknown, depth = 0, results: Record<string, unknown>[][] = []): Record<string, unknown>[][] {
  if (depth > 5) return results;
  if (Array.isArray(node) && node.length > 0 && typeof node[0] === 'object') {
    results.push(node as Record<string, unknown>[]);
    return results;
  }
  if (node && typeof node === 'object' && !Array.isArray(node)) {
    for (const val of Object.values(node as Record<string, unknown>)) {
      collectArrays(val, depth + 1, results);
    }
  }
  return results;
}

function extractDataArray(parsed: unknown): Record<string, unknown>[] | null {
  if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
    const obj = parsed as Record<string, unknown>;
    if (obj.logic && Array.isArray(obj.rules) && Array.isArray(obj.groups)) return null;
  }
  const arrays = collectArrays(parsed);
  if (arrays.length === 0) return null;
  return arrays.reduce((a, b) => (b.length > a.length ? b : a));
}

export default function AppPage() {
  const {
    root, schema, errors, history, isRunning, presets, customData,
    runQuery, undo, resetQuery, savePreset, loadPreset, deletePreset, importQuery, setSchema, setCustomData,
  } = useQueryStore();

  const [showPresets, setShowPresets] = useState(false);
  const [showSave, setShowSave] = useState(false);
  const [saveName, setSaveName] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);
  const errorCount = Object.keys(errors).length;
  const activeData = customData ?? MOCK_DATA;

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
      e.preventDefault();
      undo();
    }
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      runQuery(activeData);
    }
  }, [undo, runQuery]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const handleExport = () => {
    const blob = new Blob([JSON.stringify(root, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'query.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      const raw = ev.target?.result as string;
      let parsed: unknown;
      try {
        parsed = JSON.parse(raw);
      } catch {
        alert('File is not valid JSON — check the file and try again.');
        return;
      }
      const dataArray = extractDataArray(parsed);
      if (dataArray) {
        setCustomData(dataArray);
        setSchema(inferSchema(dataArray));
      } else {
        try {
          importQuery(raw);
        } catch {
          alert('Could not load file — expected a data array or a query definition.');
        }
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
    <div className="h-screen flex flex-col bg-background overflow-hidden">

      {/* TOP BAR */}
      <header className="h-11 flex items-center gap-2 px-5 border-b border-border bg-surface shrink-0">
        <a href="/" className="flex items-center gap-2 mr-1">
          <div className="w-5 h-5 rounded bg-accent flex items-center justify-center shrink-0">
            <span className="text-[10px] font-black text-black leading-none">Q</span>
          </div>
          <span className="text-sm font-bold tracking-tight">QueryBuilder</span>
        </a>
        <span className="text-border font-light">/</span>
        <span className="text-sm text-muted-foreground">Untitled query</span>

        <div className="flex-1" />

        {errorCount > 0 && (
          <span className="flex items-center gap-1 text-xs px-2 py-1 rounded bg-destructive/10 border border-destructive/20 text-destructive font-medium">
            <AlertCircle className="h-3 w-3" />
            {errorCount} error{errorCount > 1 ? 's' : ''}
          </span>
        )}

        <div className="h-4 w-px bg-border mx-1" />

        <button
          onClick={undo}
          disabled={history.length === 0}
          title="Undo (Ctrl+Z)"
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded text-xs text-muted-foreground bg-surface-raised border border-border hover:text-foreground disabled:opacity-30 transition-colors"
        >
          <Undo2 className="h-3 w-3" /> Undo
        </button>
        <button
          onClick={resetQuery}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded text-xs text-muted-foreground bg-surface-raised border border-border hover:text-foreground transition-colors"
        >
          <RotateCcw className="h-3 w-3" /> Reset
        </button>

        <div className="h-4 w-px bg-border mx-1" />

        {/* Presets dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowPresets(p => !p)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded text-xs text-muted-foreground bg-surface-raised border border-border hover:text-foreground transition-colors"
          >
            <ChevronDown className="h-3 w-3" /> Presets
          </button>
          {showPresets && (
            <div className="absolute right-0 top-full mt-1 z-50 bg-surface border border-border rounded-lg shadow-xl min-w-52 overflow-hidden">
              {presets.length === 0 && (
                <div className="px-4 py-3 text-xs text-subtle">No saved presets</div>
              )}
              {presets.map(p => (
                <div key={p.id} className="flex items-center gap-2 px-3 py-2 hover:bg-surface-raised group">
                  <button
                    className="flex-1 text-left text-xs text-foreground"
                    onClick={() => { loadPreset(p.query); setShowPresets(false); setShowSave(false); setSaveName(''); }}
                  >
                    {p.name}
                  </button>
                  <button
                    onClick={() => deletePreset(p.id)}
                    className="opacity-0 group-hover:opacity-100 text-subtle hover:text-destructive transition-all"
                  >
                    <Trash2 className="h-3 w-3" />
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
                      className="flex-1 h-7 rounded border border-border bg-background px-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-accent"
                    />
                    <button
                      onClick={handleSave}
                      className="text-xs px-2 py-1 rounded bg-accent text-black font-semibold"
                    >
                      Save
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowSave(true)}
                    className="flex items-center gap-1.5 text-xs text-subtle hover:text-foreground w-full"
                  >
                    <BookmarkPlus className="h-3 w-3" /> Save current as preset
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="h-4 w-px bg-border mx-1" />

        <input ref={fileRef} type="file" accept=".json" onChange={handleImport} className="hidden" />
        <button
          onClick={() => fileRef.current?.click()}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded text-xs text-muted-foreground bg-surface-raised border border-border hover:text-foreground transition-colors"
        >
          <Upload className="h-3 w-3" /> Import
        </button>
        <button
          onClick={handleExport}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded text-xs text-muted-foreground bg-surface-raised border border-border hover:text-foreground transition-colors"
        >
          <Download className="h-3 w-3" /> Export
        </button>

        <div className="h-4 w-px bg-border mx-1" />

        <ThemeToggle />

        <div className="h-4 w-px bg-border mx-1" />

        <button
          onClick={() => runQuery(activeData)}
          disabled={isRunning}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-bold bg-accent text-black hover:bg-accent-hover disabled:opacity-50 transition-colors"
        >
          <Play className="h-3 w-3" />
          {isRunning ? 'Running…' : 'Run query'}
        </button>
      </header>

      {/* SPLIT PANEL */}
      <div className="flex flex-1 overflow-hidden">

        {/* LEFT: Conditions */}
        <div className="w-1/2 border-r border-border flex flex-col overflow-hidden">
          <div className="flex items-center px-4 py-2.5 border-b border-border/40 shrink-0">
            <span className="text-[9px] font-semibold uppercase tracking-widest text-subtle">
              Conditions
            </span>
            <span className="ml-auto text-[9px] text-subtle">⌘↵ to run</span>
          </div>
          <div className="flex-1 overflow-y-auto p-3">
            <ConditionGroup group={root} depth={0} />
          </div>
        </div>

        {/* RIGHT: Output */}
        <div className="w-1/2 flex flex-col overflow-hidden">
          <QueryBuilder />
        </div>
      </div>

      {/* STATUS BAR */}
      <div className="h-7 flex items-center px-5 border-t border-border/40 bg-surface shrink-0">
        <span className="text-[9px] text-subtle">
          {schema.length} fields · {activeData.length} {customData ? 'imported' : 'mock'} records
        </span>
        {errorCount > 0 && (
          <>
            <span className="mx-2 text-subtle text-[9px]">·</span>
            <span className="text-[9px] text-destructive">
              {errorCount} validation error{errorCount > 1 ? 's' : ''}
            </span>
          </>
        )}
        <span className="ml-auto text-[9px] text-subtle">⌘Z undo · ⌘↵ run</span>
      </div>

    </div>
  );
}
