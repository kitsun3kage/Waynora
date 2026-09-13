import {
  Loader2,
  MapPin,
  Search,
  X,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { searchPlaces } from '../services/geocoding';
import type { SearchResult } from '../types';

interface SearchBarProps {
  onSelect: (result: SearchResult) => void;
}

export default function SearchBar({
  onSelect,
}: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const abortController = useRef<AbortController | null>(null);

  useEffect(() => {
    const value = query.trim();

    if (value.length < 3) {
      setResults([]);
      setError(null);
      setLoading(false);
      return;
    }

    const timer = window.setTimeout(async () => {
      abortController.current?.abort();

      const controller = new AbortController();
      abortController.current = controller;

      setLoading(true);
      setError(null);

      try {
        const data = await searchPlaces(
          value,
          controller.signal,
        );

        setResults(data);
      } catch (err) {
        if (
          err instanceof DOMException &&
          err.name === 'AbortError'
        ) {
          return;
        }

        setResults([]);
        setError(
          'Nie udało się pobrać wyników wyszukiwania.',
        );
      } finally {
        setLoading(false);
      }
    }, 650);

    return () => {
      window.clearTimeout(timer);
    };
  }, [query]);

  function selectResult(result: SearchResult) {
    setQuery(result.displayName);
    setResults([]);
    onSelect(result);
  }

  function clear() {
    setQuery('');
    setResults([]);
    setError(null);
  }

  return (
    <div className="relative w-full">
      <div className="flex h-14 items-center gap-3 rounded-2xl border border-white/20 bg-white/95 px-4 shadow-floating backdrop-blur-xl dark:border-slate-700/60 dark:bg-slate-900/95">
        {loading ? (
          <Loader2
            size={21}
            className="shrink-0 animate-spin text-violet-600"
          />
        ) : (
          <Search
            size={21}
            className="shrink-0 text-slate-500"
          />
        )}

        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Dokąd jedziemy?"
          aria-label="Wyszukaj miejsce"
          className="min-w-0 flex-1 bg-transparent text-sm font-medium text-slate-900 outline-none placeholder:text-slate-400 dark:text-white"
        />

        {query && (
          <button
            type="button"
            onClick={clear}
            aria-label="Wyczyść wyszukiwanie"
            className="rounded-full p-1.5 text-slate-500 transition hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {(results.length > 0 || error) && (
        <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-[1000] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-floating dark:border-slate-700 dark:bg-slate-900">
          {results.map((result) => (
            <button
              type="button"
              key={result.placeId}
              onClick={() => selectResult(result)}
              className="flex w-full items-start gap-3 border-b border-slate-100 px-4 py-3 text-left transition last:border-0 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800"
            >
              <MapPin
                size={20}
                className="mt-0.5 shrink-0 text-violet-600"
              />

              <span className="min-w-0">
                <span className="block truncate text-sm font-semibold text-slate-900 dark:text-white">
                  {result.displayName.split(',')[0]}
                </span>

                <span className="mt-0.5 block truncate text-xs text-slate-500 dark:text-slate-400">
                  {result.displayName}
                </span>
              </span>
            </button>
          ))}

          {error && (
            <div className="px-4 py-4 text-sm text-red-500">
              {error}
            </div>
          )}
        </div>
      )}
    </div>
  );
}