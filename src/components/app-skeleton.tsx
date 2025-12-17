import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function AppSkeleton() {
    return (
        <main className="flex min-h-screen flex-col items-center justify-center p-4 sm:p-8 bg-background">
            <Card className="w-full max-w-xs sm:max-w-sm rounded-2xl shadow-xl border-border/20 bg-card">
                <CardHeader className="items-center p-6 pb-2">
                    <CardTitle className="text-lg font-medium text-muted-foreground font-headline tracking-wide">
                        Time Since Last
                    </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col items-center gap-6 px-6 pb-6 pt-2">
                    <Skeleton className="h-[60px] w-[240px] sm:h-[70px] sm:w-[280px]" />
                    <Skeleton className="w-full h-16 rounded-xl" />
                    <div className="text-center pt-2">
                        <p className="text-sm text-muted-foreground font-headline">Today's Count</p>
                        <Skeleton className="h-9 w-12 mx-auto mt-1" />
                    </div>
                </CardContent>
            </Card>
        </main>
    )
}
