//src/app/log/page.tsx
'use client';

import {useEffect, useMemo, useRef, useState} from 'react';

import {formatTimestampCompact} from '@/lib/time';

const STORAGE_KEY = 'smoke_break_tracker_logs';

export default function LogPage() {
  const buttonBase =
    'inline-flex select-none items-center justify-center rounded-xl border px-3.5 py-3 text-sm font-semibold leading-none no-underline transition-[transform,opacity,background-color,color] duration-150 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-onyx-100 disabled:cursor-not-allowed disabled:opacity-[0.55] disabled:active:scale-100';
  const buttonSecondary = `${buttonBase} border-onyx-300 bg-onyx-200 text-onyx-900 hover:bg-onyx-300 focus-visible:ring-onyx-400`;
  const buttonDanger = `${buttonBase} border-transparent bg-red-600 text-white hover:bg-red-500 focus-visible:ring-red-500 disabled:hover:bg-red-600`;
  const buttonLink =
    'inline-flex w-auto select-none items-center justify-center rounded-lg border border-transparent bg-transparent px-2 py-1.5 text-xs font-semibold leading-none text-onyx-800 no-underline transition-[transform,opacity,color] duration-150 hover:text-onyx-950 hover:underline active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-onyx-400 focus-visible:ring-offset-2 focus-visible:ring-offset-onyx-100 disabled:cursor-not-allowed disabled:opacity-[0.55] disabled:hover:no-underline disabled:active:scale-100';

  const [logs, setLogs] = useState<number[]>([]);
  const [isClient, setIsClient] = useState(false);
  const [confirmDeleteAllOpen, setConfirmDeleteAllOpen] = useState(false);
  const confirmCancelButtonRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    setIsClient(true);
    try {
      const storedLogs = localStorage.getItem(STORAGE_KEY);
      if (storedLogs) setLogs(JSON.parse(storedLogs));
    } catch (error) {
      console.error('Failed to parse logs from localStorage', error);
    }
  }, []);

  useEffect(() => {
    if (!isClient) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(logs));
  }, [logs, isClient]);

  const todaysCount = useMemo(() => {
    if (!isClient) return 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const startOfToday = today.getTime();
    return logs.filter((log) => log >= startOfToday).length;
  }, [logs, isClient]);

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

  if (!isClient) {
    return (
      <main className="h-full p-4">
        <section className="flex h-full min-h-0 flex-col">
          <div className="py-2.5 text-center text-[13px] text-onyx-700">
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

          <div className="flex justify-center" aria-label="Today's count">
            <div className="rounded-full border border-onyx-300 bg-onyx-200 px-3 py-1 text-xs font-semibold text-onyx-900">
              Today <span className="ml-1 font-extrabold tabular-nums">{todaysCount}</span>
            </div>
          </div>

          <button
            className={`${buttonDanger} w-auto px-3 py-2.5 text-xs`}
            type="button"
            disabled={logs.length === 0}
            onClick={() => setConfirmDeleteAllOpen(true)}
            title={logs.length === 0 ? 'No logs to delete' : 'Delete all logs'}
          >
            Delete All
          </button>
        </div>

        <section
          className="mt-4 flex min-h-0 flex-1 flex-col border-t border-onyx-200 pt-3"
          aria-label="Smoke log"
        >
          {logs.length === 0 ? (
            <div className="py-2.5 text-center text-[13px] text-onyx-700">
              No logs yet.
            </div>
          ) : (
            <ul className="scrollbar-subtle m-0 flex min-h-0 flex-1 list-none flex-col gap-1.5 overflow-auto p-0 pr-1">
              {logs.map((timestamp) => (
                <li
                  key={timestamp}
                  className="flex items-center justify-between gap-2 rounded-xl border border-onyx-200 bg-onyx-50 px-2.5 py-2"
                >
                  <div className="truncate text-[11px] text-onyx-700">
                    {formatTimestampCompact(timestamp)}
                  </div>
                  <button
                    className={buttonLink}
                    type="button"
                    onClick={() =>
                      setLogs((previousLogs) => previousLogs.filter((log) => log !== timestamp))
                    }
                    aria-label={`Delete log ${formatTimestampCompact(timestamp)}`}
                  >
                    Delete
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
      </section>

      {confirmDeleteAllOpen && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/45 p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Confirm delete all logs"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setConfirmDeleteAllOpen(false);
          }}
        >
          <div className="w-full max-w-[360px] rounded-2xl border border-onyx-200 bg-onyx-100 p-3.5 shadow-[0_18px_45px_-18px_rgba(0,0,0,0.35),0_8px_18px_-10px_rgba(0,0,0,0.25)]">
            <div className="mb-1.5 text-[15px] font-bold">Delete all logs?</div>
            <div className="mb-3 text-[13px] leading-[1.35] text-onyx-700">
              This will permanently delete all smoke logs. This cannot be undone.
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
