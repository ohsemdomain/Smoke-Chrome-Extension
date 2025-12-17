'use client';

import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Flame } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AppSkeleton } from '@/components/app-skeleton';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { LogList } from '@/components/log-list';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';


const STORAGE_KEY = 'smoke_break_tracker_logs';

export default function Home() {
  const [logs, setLogs] = useState<number[]>([]);
  const [timeSinceLast, setTimeSinceLast] = useState<string>('--:--:--');
  const [isPulsing, setIsPulsing] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [isLogOpen, setIsLogOpen] = useState(false);

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

  const lastLog = useMemo(() => (logs.length > 0 ? logs[logs.length - 1] : null), [logs]);

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
    setLogs(prevLogs => [now, ...prevLogs]);
    setIsPulsing(true);
    setTimeout(() => setIsPulsing(false), 500);
  };

  const handleClearLogs = () => {
    setLogs([]);
    setIsLogOpen(false);
  };

  const dailyCount = useMemo(() => {
    if (!isClient) return 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const startOfToday = today.getTime();
    return logs.filter(log => log >= startOfToday).length;
  }, [logs, isClient]);
  
  if (!isClient) {
    return <AppSkeleton />;
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 sm:p-8 bg-background">
      <Card className="w-full max-w-xs sm:max-w-sm rounded-2xl shadow-xl border-border/20 bg-card">
        <CardHeader className="items-center p-6 pb-2">
          <CardTitle className="text-lg font-medium text-muted-foreground font-headline tracking-wide">
            Time Since Last
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-6 px-6 pb-6 pt-2">
          <div className="text-6xl sm:text-7xl font-bold font-mono text-primary tabular-nums">
            {timeSinceLast}
          </div>
          <Button
            size="lg"
            onClick={handleLogCigarette}
            className={cn(
              'w-full h-16 text-xl rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg transition-transform duration-200 active:scale-95',
              isPulsing && 'animate-pulse-once'
            )}
            aria-label="Log a smoked cigarette"
          >
            <Flame className="mr-3 h-7 w-7" />
            Log Smoke
          </Button>
          <div className="text-center pt-2">
            <p className="text-sm text-muted-foreground font-headline">Today's Count</p>
            <p className="text-3xl font-bold text-foreground">{dailyCount}</p>
          </div>
           <Dialog open={isLogOpen} onOpenChange={setIsLogOpen}>
            <DialogTrigger asChild>
              <Button variant="link" className="text-muted-foreground">View Log</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Smoke Log</DialogTitle>
              </DialogHeader>
              <LogList logs={logs} />
              <DialogFooter>
                {logs.length > 0 && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive">Delete All Logs</Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will permanently delete all your smoke logs. This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleClearLogs}>
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
                <DialogClose asChild>
                  <Button variant="outline">Close</Button>
                </DialogClose>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
    </main>
  );
}
