'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Search, FileText, X } from 'lucide-react';
import type { SearchResult } from '@/app/api/docs/search/route';

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

export default function DocsSearch() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const debouncedQuery = useDebounce(query, 200);

  // Fetch results when debounced query changes
  useEffect(() => {
    if (debouncedQuery.length < 2) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    let cancelled = false;
    setLoading(true);

    fetch(`/api/docs/search?q=${encodeURIComponent(debouncedQuery)}`)
      .then((r) => r.json())
      .then((data: SearchResult[]) => {
        if (cancelled) return;
        setResults(data);
        setIsOpen(true);
        setActiveIndex(-1);
      })
      .catch(() => {
        if (!cancelled) setResults([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [debouncedQuery]);

  // Cmd/Ctrl+K focuses search
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
        inputRef.current?.select();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const navigate = useCallback(
    (url: string) => {
      router.push(url);
      setIsOpen(false);
      setQuery('');
      inputRef.current?.blur();
    },
    [router]
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen || results.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, -1));
    } else if (e.key === 'Enter' && activeIndex >= 0) {
      e.preventDefault();
      navigate(results[activeIndex].url);
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  // Scroll active item into view
  useEffect(() => {
    if (activeIndex < 0 || !listRef.current) return;
    const item = listRef.current.children[activeIndex] as HTMLElement;
    item?.scrollIntoView({ block: 'nearest' });
  }, [activeIndex]);

  function highlightMatch(text: string, query: string) {
    if (!query) return text;
    const idx = text.toLowerCase().indexOf(query.toLowerCase());
    if (idx === -1) return text;
    return (
      <>
        {text.slice(0, idx)}
        <mark className='rounded-sm bg-primary/20 px-0.5 text-primary'>
          {text.slice(idx, idx + query.length)}
        </mark>
        {text.slice(idx + query.length)}
      </>
    );
  }

  return (
    <div ref={containerRef} className='relative w-full max-w-xs lg:max-w-sm'>
      {/* Input */}
      <div className='relative flex items-center'>
        <Search className='pointer-events-none absolute left-3 h-3.5 w-3.5 text-muted-foreground' />
        <input
          ref={inputRef}
          type='text'
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => {
            if (results.length > 0) setIsOpen(true);
          }}
          onKeyDown={handleKeyDown}
          placeholder='Search docs…'
          className='h-8 w-full rounded-md border border-border bg-muted/50 pl-8 pr-16 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:bg-background focus:outline-none focus:ring-1 focus:ring-primary'
        />
        {query ? (
          <button
            onClick={() => {
              setQuery('');
              setResults([]);
              setIsOpen(false);
              inputRef.current?.focus();
            }}
            className='absolute right-2 rounded p-0.5 text-muted-foreground hover:text-foreground'
          >
            <X className='h-3.5 w-3.5' />
          </button>
        ) : (
          <kbd className='pointer-events-none absolute right-2 hidden select-none gap-0.5 rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground sm:flex'>
            ⌘K
          </kbd>
        )}
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div className='absolute left-0 right-0 top-full z-50 mt-1.5 overflow-hidden rounded-lg border border-border bg-background shadow-lg'>
          {loading && (
            <div className='px-4 py-3 text-sm text-muted-foreground'>
              Searching…
            </div>
          )}

          {!loading && results.length === 0 && (
            <div className='px-4 py-3 text-sm text-muted-foreground'>
              No results for &ldquo;{query}&rdquo;
            </div>
          )}

          {!loading && results.length > 0 && (
            <ul ref={listRef} className='max-h-80 overflow-y-auto py-1'>
              {results.map((result, i) => (
                <li key={result.url}>
                  <button
                    onClick={() => navigate(result.url)}
                    onMouseEnter={() => setActiveIndex(i)}
                    className={[
                      'flex w-full items-start gap-3 px-3 py-2.5 text-left transition-colors',
                      i === activeIndex ? 'bg-muted' : 'hover:bg-muted/60',
                    ].join(' ')}
                  >
                    <FileText className='mt-0.5 h-4 w-4 shrink-0 text-muted-foreground' />
                    <div className='min-w-0 flex-1'>
                      <div className='flex items-center gap-2'>
                        <span className='truncate text-sm font-medium text-foreground'>
                          {highlightMatch(result.title, query)}
                        </span>
                        {result.group && (
                          <span className='shrink-0 rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground'>
                            {result.group}
                          </span>
                        )}
                      </div>
                      <p className='mt-0.5 truncate text-xs text-muted-foreground'>
                        {result.excerpt}
                      </p>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}

          <div className='border-t border-border px-3 py-1.5'>
            <p className='text-[10px] text-muted-foreground'>
              <kbd className='font-mono'>↑↓</kbd> navigate &nbsp;
              <kbd className='font-mono'>↵</kbd> open &nbsp;
              <kbd className='font-mono'>esc</kbd> close
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
