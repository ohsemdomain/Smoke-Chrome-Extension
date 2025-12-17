//src/app/log/page.tsx
'use client';

import {useEffect, useMemo, useRef, useState} from 'react';

const STORAGE_KEY = 'smoke_break_tracker_logs';

const formatTimestamp = (timestamp: number) => new Date(timestamp).toLocaleString();

export default function LogPage() {
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
      <main className="popup">
        <section className="card">
          <div className="muted">Loading…</div>
        </section>
      </main>
    );
  }

  return (
    <main className="popup">
      <section className="card">
        <div className="topbar">
          <a className="btn btn-secondary btn-compact" href="/index.html">
            Back
          </a>
          <div className="topbar-center" aria-label="Today's count">
            <div className="topbar-center-label">Today</div>
            <div className="topbar-center-value">{todaysCount}</div>
          </div>
          <button
            className="btn btn-danger btn-compact"
            type="button"
            disabled={logs.length === 0}
            onClick={() => setConfirmDeleteAllOpen(true)}
            title={logs.length === 0 ? 'No logs to delete' : 'Delete all logs'}
          >
            Delete All
          </button>
        </div>

        <section className="logs" aria-label="Smoke log">
          {logs.length === 0 ? (
            <div className="muted">No logs yet.</div>
          ) : (
            <ul className="log-list">
              {logs.map((timestamp) => (
                <li key={timestamp} className="log-item">
                  <div className="log-time">{formatTimestamp(timestamp)}</div>
                  <button
                    className="btn btn-link"
                    type="button"
                    onClick={() =>
                      setLogs((previousLogs) => previousLogs.filter((log) => log !== timestamp))
                    }
                    aria-label={`Delete log ${formatTimestamp(timestamp)}`}
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
          className="modal-backdrop"
          role="dialog"
          aria-modal="true"
          aria-label="Confirm delete all logs"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setConfirmDeleteAllOpen(false);
          }}
        >
          <div className="modal">
            <div className="modal-title">Delete all logs?</div>
            <div className="modal-text">This will permanently delete all smoke logs. This cannot be undone.</div>
            <div className="modal-actions">
              <button
                ref={confirmCancelButtonRef}
                className="btn btn-secondary"
                type="button"
                onClick={() => setConfirmDeleteAllOpen(false)}
              >
                Cancel
              </button>
              <button
                className="btn btn-danger"
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
