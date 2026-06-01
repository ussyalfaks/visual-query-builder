'use client';
import { useMemo, useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { useQueryStore } from '@/store/queryStore';
import { toSQL, toMongo } from '@/lib/formatters';

export function QueryPreview() {
  const { root, schema, activeFormat, setActiveFormat } = useQueryStore();
  const [copied, setCopied] = useState(false);

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
        <div className="flex rounded-md border border-input overflow-hidden">
          {(['sql', 'mongo'] as const).map(fmt => (
            <button
              key={fmt}
              onClick={() => setActiveFormat(fmt)}
              className={`px-3 py-1.5 text-xs font-mono font-medium transition-colors ${
                activeFormat === fmt
                  ? 'bg-foreground text-background'
                  : 'bg-background text-muted-foreground hover:bg-muted'
              }`}
            >
              {fmt === 'sql' ? 'SQL' : 'MongoDB'}
            </button>
          ))}
        </div>
        <span className="text-xs text-muted-foreground">Live — updates as you build</span>
        <div className="flex-1" />
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          {copied ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>

      <div className="relative rounded-lg border border-border bg-muted/50 overflow-hidden">
        <pre className="p-4 text-sm font-mono overflow-x-auto whitespace-pre leading-relaxed text-foreground">
          {preview}
        </pre>
      </div>
    </div>
  );
}
