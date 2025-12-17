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
      <main className="popup">
        <section className="card">
          <div className="muted">Loading…</div>
        </section>
      </main>
    );
  }

  return (
    <main className="popup popup-home">
      <section className="card">
        <header className="header">
          <div className="title">Smoke Break Tracker</div>
          <div className="subtitle">Time since last</div>
        </header>

        <div className="timer" aria-label="Time since last smoke">
          {timeSinceLast}
        </div>

        <button className="btn btn-primary" onClick={handleLogCigarette} type="button">
          Log Smoke
        </button>

        <div className="stats">
          <div className="stat">
            <div className="stat-label">Today&apos;s count</div>
            <div className="stat-value">{dailyCount}</div>
          </div>
        </div>

        <div className="row row-bottom">
          <a className="btn btn-secondary" href="/log/index.html">
            View Logs
          </a>
        </div>
      </section>
    </main>
  );
}
