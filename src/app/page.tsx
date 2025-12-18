//src/app/page.tsx
'use client';

import {useEffect, useMemo, useState} from 'react';

const STORAGE_KEY = 'smoke_break_tracker_logs';

export default function Home() {
  const [logs, setLogs] = useState<number[]>([]);
  const [timeSinceLast, setTimeSinceLast] = useState<string>('--:--:--');
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    try {
      const storedLogs = localStorage.getItem(STORAGE_KEY);
      if (storedLogs) {
        setLogs(JSON.parse(storedLogs));
      }
    } catch (error) {
      console.error("Failed to parse logs from localStorage", error);
    }
  }, []);

  useEffect(() => {
    if (isClient) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(logs));
    }
  }, [logs, isClient]);

  const lastLog = useMemo(() => (logs.length > 0 ? logs[0] : null), [logs]);

  useEffect(() => {
    if (!lastLog || !isClient) {
      setTimeSinceLast('--:--:--');
      return;
    }

    const updateTimer = () => {
      const now = Date.now();
      const diff = now - lastLog;

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeSinceLast(
        `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
      );
    };
    
    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [lastLog, isClient]);

  const handleLogCigarette = () => {
    const now = Date.now();
    setLogs((previousLogs) => [now, ...previousLogs]);
  };

  const dailyCount = useMemo(() => {
    if (!isClient) return 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const startOfToday = today.getTime();
    return logs.filter(log => log >= startOfToday).length;
  }, [logs, isClient]);
  
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
        <header className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h1 className="text-sm font-semibold tracking-[0.2px] text-onyx-950">
              Smoke Break Tracker
            </h1>
            <p className="mt-0.5 text-xs text-onyx-700">Time since last smoke</p>
          </div>

          <div className="shrink-0 rounded-full border border-onyx-300 bg-onyx-200 px-3 py-1 text-xs font-semibold text-onyx-900">
            Today <span className="ml-1 font-extrabold tabular-nums">{dailyCount}</span>
          </div>
        </header>

        <div className="mt-4 flex min-h-0 flex-1 flex-col gap-3">
          <div className="flex flex-1 flex-col justify-center rounded-2xl border border-onyx-200 bg-onyx-50 px-3 py-4 text-center">
            <div className="text-[11px] font-semibold tracking-[0.18em] text-onyx-700">
              ELAPSED
            </div>
            <div
              className="mt-2 font-mono text-[48px] font-extrabold tracking-[-0.03em] tabular-nums text-onyx-950"
              aria-label="Time since last smoke"
            >
              {timeSinceLast}
            </div>

            {lastLog ? (
              <div className="mt-2 text-[12px] text-onyx-700">Keep going.</div>
            ) : (
              <div className="mt-2 text-[12px] text-onyx-700">
                No logs yet. Tap “Log Smoke” to start.
              </div>
            )}
          </div>

          <div className="grid gap-2.5">
            <button
              className="inline-flex w-full select-none items-center justify-center rounded-xl border border-transparent bg-onyx-700 px-3.5 py-3.5 text-sm font-semibold leading-none text-onyx-50 no-underline transition-[transform,opacity,background-color] duration-150 hover:bg-onyx-600 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-onyx-600 focus-visible:ring-offset-2 focus-visible:ring-offset-onyx-100 disabled:cursor-not-allowed disabled:opacity-[0.55] disabled:active:scale-100"
              onClick={handleLogCigarette}
              type="button"
            >
              Log Smoke
            </button>

            <div className="grid grid-cols-2 gap-2.5">
              <a
                className="inline-flex w-full select-none items-center justify-center rounded-xl border border-onyx-300 bg-onyx-200 px-3.5 py-3 text-sm font-semibold leading-none text-onyx-900 no-underline transition-[transform,opacity,background-color] duration-150 hover:bg-onyx-300 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-onyx-400 focus-visible:ring-offset-2 focus-visible:ring-offset-onyx-100"
                href="/log/index.html"
              >
                Logs
              </a>
              <a
                className="inline-flex w-full select-none items-center justify-center rounded-xl border border-onyx-300 bg-onyx-200 px-3.5 py-3 text-sm font-semibold leading-none text-onyx-900 no-underline transition-[transform,opacity,background-color] duration-150 hover:bg-onyx-300 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-onyx-400 focus-visible:ring-offset-2 focus-visible:ring-offset-onyx-100"
                href="/expense/index.html"
              >
                Boxes
              </a>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
