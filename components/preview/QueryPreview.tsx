'use client';
import { useMemo, useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { useQueryStore } from '@/store/queryStore';
import { toSQL, toMongo } from '@/lib/formatters';
import { cn } from '@/lib/utils';
import { useTheme } from '@/lib/useTheme';
import Editor from '@monaco-editor/react';

export function QueryPreview() {
  const { root, schema, activeFormat, setActiveFormat } = useQueryStore();
  const [copied, setCopied] = useState(false);
  const monacoTheme = useTheme();

  const preview = useMemo(() => {
    if (activeFormat === 'sql') return toSQL(root, schema);
    return toMongo(root, schema);
  }, [root, schema, activeFormat]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(preview);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-3">
        {/* Format toggle */}
        <div className="inline-flex rounded overflow-hidden border border-border text-xs font-mono font-semibold">
          {(['sql', 'mongo'] as const).map(fmt => (
            <button
              key={fmt}
              onClick={() => setActiveFormat(fmt)}
              className={cn(
                'px-3 py-1.5 transition-colors',
                activeFormat === fmt
                  ? 'bg-accent-subtle text-accent'
                  : 'bg-surface-raised text-subtle hover:text-muted-foreground',
                fmt === 'sql' && 'border-r border-border'
              )}
            >
              {fmt === 'sql' ? 'SQL' : 'MongoDB'}
            </button>
          ))}
        </div>

        <span className="text-xs text-subtle">Live — updates as you build</span>

        <div className="flex-1" />

        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 text-xs text-subtle hover:text-muted-foreground transition-colors"
        >
          {copied
            ? <Check className="h-3.5 w-3.5 text-accent" />
            : <Copy className="h-3.5 w-3.5" />}
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>

      <div className="relative rounded-lg border border-border overflow-hidden">
        <Editor
          height="220px"
          language={activeFormat === 'sql' ? 'sql' : 'javascript'}
          value={preview}
          theme={monacoTheme}
          options={{
            readOnly: true,
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            fontSize: 13,
            fontFamily: 'var(--font-geist-mono), monospace',
            lineNumbers: 'off',
            folding: false,
            wordWrap: 'on',
            scrollbar: { vertical: 'auto', horizontal: 'auto' },
            renderLineHighlight: 'none',
            overviewRulerLanes: 0,
            hideCursorInOverviewRuler: true,
            contextmenu: false,
            padding: { top: 16, bottom: 16 },
          }}
        />
      </div>
    </div>
  );
}
