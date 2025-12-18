//src/app/expense/page.tsx
'use client';

import {useEffect, useMemo, useRef, useState, type FormEvent} from 'react';

import {formatDurationCompact, formatTimestampCompact} from '@/lib/time';

const STORAGE_KEY = 'smoke_break_tracker_box_opens';

type BoxOpenLog = {
  id: string;
  timestamp: number;
  brand: string;
  boxes: number;
};

function createId() {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function normalizeBrand(value: string) {
  return value.trim().replace(/\s+/g, ' ');
}

function parseStoredLogs(raw: string | null): BoxOpenLog[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    const now = Date.now();
    return parsed
      .filter((entry) => entry && typeof entry === 'object')
      .map((entry) => ({
        id: typeof entry.id === 'string' ? entry.id : createId(),
        timestamp: typeof entry.timestamp === 'number' ? entry.timestamp : NaN,
        brand: typeof entry.brand === 'string' ? entry.brand : '',
        boxes: typeof entry.boxes === 'number' ? entry.boxes : 1,
      }))
      .filter((entry) => Number.isFinite(entry.timestamp) && entry.timestamp > 0 && entry.timestamp <= now)
      .map((entry) => ({
        ...entry,
        brand: normalizeBrand(entry.brand),
        boxes: Number.isFinite(entry.boxes) && entry.boxes > 0 ? Math.floor(entry.boxes) : 1,
      }))
      .filter((entry) => entry.brand.length > 0);
  } catch (error) {
    console.error('Failed to parse box logs from localStorage', error);
    return [];
  }
}

function findPreviousOpenForBrand(logsDesc: BoxOpenLog[], index: number) {
  const brand = logsDesc[index]?.brand;
  if (!brand) return null;
  for (let i = index + 1; i < logsDesc.length; i++) {
    if (logsDesc[i].brand === brand) return logsDesc[i];
  }
  return null;
}

export default function ExpensePage() {
  const buttonBase =
    'inline-flex select-none items-center justify-center rounded-xl border px-3.5 py-3 text-sm font-semibold leading-none no-underline transition-[transform,opacity,background-color,color] duration-150 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-onyx-100 disabled:cursor-not-allowed disabled:opacity-[0.55] disabled:active:scale-100';
  const buttonSecondary = `${buttonBase} border-onyx-300 bg-onyx-200 text-onyx-900 hover:bg-onyx-300 focus-visible:ring-onyx-400`;
  const buttonPrimary = `${buttonBase} border-transparent bg-onyx-700 text-onyx-50 hover:bg-onyx-600 focus-visible:ring-onyx-600`;
  const buttonDanger = `${buttonBase} border-transparent bg-red-600 text-white hover:bg-red-500 focus-visible:ring-red-500 disabled:hover:bg-red-600`;
  const buttonLink =
    'inline-flex w-auto select-none items-center justify-center rounded-lg border border-transparent bg-transparent px-2 py-1.5 text-xs font-semibold leading-none text-onyx-800 no-underline transition-[transform,opacity,color] duration-150 hover:text-onyx-950 hover:underline active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-onyx-400 focus-visible:ring-offset-2 focus-visible:ring-offset-onyx-100 disabled:cursor-not-allowed disabled:opacity-[0.55] disabled:hover:no-underline disabled:active:scale-100';

  const [isClient, setIsClient] = useState(false);
  const [logs, setLogs] = useState<BoxOpenLog[]>([]);
  const [brandInput, setBrandInput] = useState('');
  const [boxesInput, setBoxesInput] = useState(1);
  const [selectedBrand, setSelectedBrand] = useState<string>('');
  const [confirmDeleteAllOpen, setConfirmDeleteAllOpen] = useState(false);
  const confirmCancelButtonRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    setIsClient(true);
    const stored = parseStoredLogs(localStorage.getItem(STORAGE_KEY));
    stored.sort((a, b) => b.timestamp - a.timestamp);
    setLogs(stored);
  }, []);

  useEffect(() => {
    if (!isClient) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(logs));
  }, [logs, isClient]);

  const brands = useMemo(() => {
    const seen = new Set<string>();
    const result: string[] = [];
    for (const entry of logs) {
      if (!seen.has(entry.brand)) {
        seen.add(entry.brand);
        result.push(entry.brand);
      }
    }
    return result;
  }, [logs]);

  useEffect(() => {
    if (!isClient) return;
    if (selectedBrand) return;
    if (brands.length > 0) setSelectedBrand(brands[0]);
  }, [brands, isClient, selectedBrand]);

  const selectedBrandLogs = useMemo(() => {
    if (!selectedBrand) return logs;
    return logs.filter((entry) => entry.brand === selectedBrand);
  }, [logs, selectedBrand]);

  const now = Date.now();
  const lastOpen = selectedBrandLogs[0] ?? null;
  const timeSinceLastOpen = lastOpen ? formatDurationCompact(now - lastOpen.timestamp) : '--';

  const boxesLast30Days = useMemo(() => {
    const start = now - 30 * 24 * 60 * 60 * 1000;
    return selectedBrandLogs
      .filter((entry) => entry.timestamp >= start)
      .reduce((sum, entry) => sum + entry.boxes, 0);
  }, [now, selectedBrandLogs]);

  const avgDaysPerBox = useMemo(() => {
    const entriesAsc = [...selectedBrandLogs].sort((a, b) => a.timestamp - b.timestamp);
    if (entriesAsc.length < 2) return null;

    const diffs: number[] = [];
    for (let i = 1; i < entriesAsc.length; i++) {
      const diff = entriesAsc[i].timestamp - entriesAsc[i - 1].timestamp;
      if (diff > 0) diffs.push(diff);
    }
    if (diffs.length === 0) return null;
    const averageMs = diffs.reduce((a, b) => a + b, 0) / diffs.length;
    return averageMs / (1000 * 60 * 60 * 24);
  }, [selectedBrandLogs]);

  useEffect(() => {
    if (!confirmDeleteAllOpen) return;
    confirmCancelButtonRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        setConfirmDeleteAllOpen(false);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [confirmDeleteAllOpen]);

  const recentBrands = useMemo(() => brands.slice(0, 4), [brands]);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    const brand = normalizeBrand(brandInput);
    const boxes = Number.isFinite(boxesInput) && boxesInput > 0 ? Math.floor(boxesInput) : 1;
    if (!brand) return;

    const timestamp = Date.now();
    const entry: BoxOpenLog = {id: createId(), timestamp, brand, boxes};
    setLogs((previous) => [entry, ...previous]);
    setSelectedBrand(brand);
    setBrandInput('');
    setBoxesInput(1);
  };

  if (!isClient) {
    return (
      <main className="h-full p-4">
        <section className="flex h-full min-h-0 flex-col">
          <div className="flex flex-1 items-center justify-center py-2.5 text-center text-[13px] text-onyx-700">
            Loading…
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="h-full p-4">
      <section className="flex h-full min-h-0 flex-col">
        <div className="grid grid-cols-[auto_1fr_auto] items-center gap-2.5">
          <a className={`${buttonSecondary} w-auto px-3 py-2.5`} href="/index.html">
            Back
          </a>

          <div className="flex justify-center" aria-label="Boxes in last 30 days">
            <div className="rounded-full border border-onyx-300 bg-onyx-200 px-3 py-1 text-xs font-semibold text-onyx-900">
              30d <span className="ml-1 font-extrabold tabular-nums">{boxesLast30Days}</span>
            </div>
          </div>

          <button
            className={`${buttonDanger} w-auto px-3 py-2.5 text-xs`}
            type="button"
            disabled={logs.length === 0}
            onClick={() => setConfirmDeleteAllOpen(true)}
            title={logs.length === 0 ? 'No entries to delete' : 'Delete all entries'}
          >
            Delete All
          </button>
        </div>

        <div className="scrollbar-subtle mt-4 flex min-h-0 flex-1 flex-col gap-3 overflow-auto pr-1 pb-1">
          <form onSubmit={handleSubmit} className="grid gap-2.5">
            <div className="grid grid-cols-[1fr_84px] gap-2.5">
              <label className="grid gap-1">
                <span className="text-[11px] font-semibold tracking-[0.14em] text-onyx-700">BRAND</span>
                <input
                  className="h-10 w-full rounded-xl border border-onyx-200 bg-onyx-50 px-3 text-sm text-onyx-950 outline-none placeholder:text-onyx-500 focus-visible:ring-2 focus-visible:ring-onyx-400 focus-visible:ring-offset-2 focus-visible:ring-offset-onyx-100"
                  value={brandInput}
                  onChange={(e) => setBrandInput(e.target.value)}
                  placeholder="Dunhill"
                  list="brand-suggestions"
                  autoComplete="off"
                />
              </label>

              <label className="grid gap-1">
                <span className="text-[11px] font-semibold tracking-[0.14em] text-onyx-700">BOX</span>
                <input
                  className="h-10 w-full rounded-xl border border-onyx-200 bg-onyx-50 px-3 text-sm text-onyx-950 outline-none focus-visible:ring-2 focus-visible:ring-onyx-400 focus-visible:ring-offset-2 focus-visible:ring-offset-onyx-100"
                  value={boxesInput}
                  onChange={(e) => setBoxesInput(Number(e.target.value))}
                  type="number"
                  min={1}
                  inputMode="numeric"
                />
              </label>
            </div>

            <datalist id="brand-suggestions">
              {brands.map((brand) => (
                <option key={brand} value={brand} />
              ))}
            </datalist>

            {recentBrands.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {recentBrands.map((brand) => (
                  <button
                    key={brand}
                    type="button"
                    className="rounded-full border border-onyx-300 bg-onyx-200 px-3 py-1 text-xs font-semibold text-onyx-900 transition-[background-color,transform] duration-150 hover:bg-onyx-300 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-onyx-400 focus-visible:ring-offset-2 focus-visible:ring-offset-onyx-100"
                    onClick={() => setBrandInput(brand)}
                  >
                    {brand}
                  </button>
                ))}
              </div>
            )}

            <button className={buttonPrimary} type="submit" disabled={!normalizeBrand(brandInput)}>
              Log New Box
            </button>
          </form>

          <div className="rounded-2xl border border-onyx-200 bg-onyx-50 px-3 py-3">
            <div className="flex items-center justify-between gap-2">
              <div className="text-xs font-semibold text-onyx-950">Frequency</div>
              <select
                className="h-8 max-w-[180px] rounded-xl border border-onyx-200 bg-onyx-50 px-2 text-xs font-semibold text-onyx-900 outline-none focus-visible:ring-2 focus-visible:ring-onyx-400 focus-visible:ring-offset-2 focus-visible:ring-offset-onyx-100"
                value={selectedBrand}
                onChange={(e) => setSelectedBrand(e.target.value)}
                aria-label="Filter by brand"
              >
                <option value="">All brands</option>
                {brands.map((brand) => (
                  <option key={brand} value={brand}>
                    {brand}
                  </option>
                ))}
              </select>
            </div>

            <div className="mt-2 grid grid-cols-2 gap-2.5 text-xs">
              <div className="rounded-xl border border-onyx-200 bg-onyx-100 px-2.5 py-2">
                <div className="text-[11px] font-semibold tracking-[0.12em] text-onyx-700">SINCE LAST</div>
                <div className="mt-1 font-extrabold tabular-nums text-onyx-950">{timeSinceLastOpen}</div>
              </div>
              <div className="rounded-xl border border-onyx-200 bg-onyx-100 px-2.5 py-2">
                <div className="text-[11px] font-semibold tracking-[0.12em] text-onyx-700">AVG / BOX</div>
                <div className="mt-1 font-extrabold tabular-nums text-onyx-950">
                  {avgDaysPerBox === null ? '--' : `${avgDaysPerBox.toFixed(1)}d`}
                </div>
              </div>
            </div>
          </div>

          <section className="border-t border-onyx-200 pt-3" aria-label="Box open log">
            {selectedBrandLogs.length === 0 ? (
              <div className="py-2.5 text-center text-[13px] text-onyx-700">
                No entries yet. Log when you open a new box.
              </div>
            ) : (
              <ul className="m-0 flex list-none flex-col gap-1.5 p-0">
                {selectedBrandLogs.map((entry, index) => {
                  const previousSameBrand = findPreviousOpenForBrand(selectedBrandLogs, index);
                  const lasted = previousSameBrand
                    ? formatDurationCompact(entry.timestamp - previousSameBrand.timestamp)
                    : null;

                  return (
                    <li
                      key={entry.id}
                      className="rounded-xl border border-onyx-200 bg-onyx-50 px-2.5 py-2"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <div className="truncate text-sm font-semibold text-onyx-950">{entry.brand}</div>
                            <div className="shrink-0 rounded-full border border-onyx-200 bg-onyx-100 px-2 py-0.5 text-[11px] font-semibold text-onyx-700">
                              x{entry.boxes}
                            </div>
                          </div>
                          <div className="mt-0.5 truncate text-[11px] text-onyx-700">
                            {formatTimestampCompact(entry.timestamp)}
                            {lasted ? ` · prev lasted ${lasted}` : ' · first log'}
                          </div>
                        </div>
                        <button
                          className={buttonLink}
                          type="button"
                          onClick={() => setLogs((previous) => previous.filter((l) => l.id !== entry.id))}
                          aria-label={`Delete ${entry.brand} entry ${formatTimestampCompact(entry.timestamp)}`}
                        >
                          Delete
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        </div>
      </section>

      {confirmDeleteAllOpen && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/45 p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Confirm delete all entries"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setConfirmDeleteAllOpen(false);
          }}
        >
          <div className="w-full max-w-[360px] rounded-2xl border border-onyx-200 bg-onyx-100 p-3.5 shadow-[0_18px_45px_-18px_rgba(0,0,0,0.35),0_8px_18px_-10px_rgba(0,0,0,0.25)]">
            <div className="mb-1.5 text-[15px] font-bold">Delete all entries?</div>
            <div className="mb-3 text-[13px] leading-[1.35] text-onyx-700">
              This will permanently delete all box-open entries. This cannot be undone.
            </div>
            <div className="flex justify-end gap-2.5">
              <button
                ref={confirmCancelButtonRef}
                className={`${buttonSecondary} w-auto min-w-[120px]`}
                type="button"
                onClick={() => setConfirmDeleteAllOpen(false)}
              >
                Cancel
              </button>
              <button
                className={`${buttonDanger} w-auto min-w-[120px]`}
                type="button"
                onClick={() => {
                  setLogs([]);
                  setConfirmDeleteAllOpen(false);
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
