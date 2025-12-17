"use client"

import { ScrollArea } from "@/components/ui/scroll-area"
import { format } from "date-fns"

interface LogListProps {
  logs: number[]
}

export function LogList({ logs }: LogListProps) {
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
        {logs.map((log, index) => (
          <div key={index} className="text-sm text-foreground">
            {format(new Date(log), "MMM d, yyyy 'at' h:mm:ss a")}
          </div>
        ))}
      </div>
    </ScrollArea>
  )
}
