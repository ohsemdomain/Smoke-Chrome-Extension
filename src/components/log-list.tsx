"use client"

import { ScrollArea } from "@/components/ui/scroll-area"
import { format } from "date-fns"
import { Button } from "./ui/button"
import { Trash2 } from "lucide-react"

interface LogListProps {
  logs: number[]
  onDeleteLog: (timestamp: number) => void;
}

export function LogList({ logs, onDeleteLog }: LogListProps) {
  if (logs.length === 0) {
    return (
      <div className="flex items-center justify-center h-40 text-muted-foreground">
        No logs yet.
      </div>
    )
  }

  return (
    <ScrollArea className="h-72 w-full rounded-md border p-4">
      <div className="flex flex-col gap-2">
        {logs.map((log) => (
          <div key={log} className="flex items-center justify-between text-sm text-foreground">
            <span>{format(new Date(log), "MMM d, yyyy 'at' h:mm:ss a")}</span>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onDeleteLog(log)}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
    </ScrollArea>
  )
}
