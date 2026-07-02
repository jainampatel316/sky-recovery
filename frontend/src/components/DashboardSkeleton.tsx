import { Skeleton } from "@/components/ui/skeleton";

export function DashboardSkeleton() {
  return (
    <div className="max-w-3xl mx-auto space-y-5 animate-fade-in-up">
      {/* Disruption Alert Skeleton */}
      <div className="flex items-start gap-3 p-4 rounded-xl border border-border bg-card/50">
        <Skeleton className="w-5 h-5 rounded-full mt-0.5 shrink-0" />
        <div className="space-y-2 flex-1">
          <Skeleton className="h-4 w-1/4" />
          <Skeleton className="h-3 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      </div>

      {/* Flight Card Skeleton */}
      <div className="bg-card rounded-xl border border-[--card-border] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[--card-border]">
          <div className="flex items-center gap-3">
            <Skeleton className="w-9 h-9 rounded-lg" />
            <div className="space-y-1.5">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-6 w-20 rounded-full" />
            <Skeleton className="h-6 w-16 rounded-md" />
          </div>
        </div>

        {/* Route */}
        <div className="flex items-center justify-between px-6 py-8">
          <div className="space-y-2">
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-6 w-16" />
          </div>
          <div className="flex-1 px-8">
            <Skeleton className="h-0.5 w-full" />
          </div>
          <div className="space-y-2 items-end flex flex-col">
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-6 w-16" />
          </div>
        </div>

        {/* Details */}
        <div className="flex items-center gap-6 px-6 pb-6">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-20" />
        </div>
      </div>

      {/* Action / Recovery Panel Skeleton */}
      <div className="bg-card rounded-xl border border-[--card-border] overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[--card-border]">
          <div className="flex items-center gap-3">
            <Skeleton className="w-8 h-8 rounded-lg" />
            <div className="space-y-1.5">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-3 w-48" />
            </div>
          </div>
          <Skeleton className="w-16 h-16 rounded-full" />
        </div>
        
        {/* Tabs Skeleton */}
        <div className="flex border-b border-[--card-border]">
          <div className="flex-1 p-3"><Skeleton className="h-4 w-24 mx-auto" /></div>
          <div className="flex-1 p-3"><Skeleton className="h-4 w-24 mx-auto" /></div>
          <div className="flex-1 p-3"><Skeleton className="h-4 w-24 mx-auto" /></div>
        </div>

        <div className="p-5 space-y-4">
          <Skeleton className="h-12 w-full rounded-lg" />
          <Skeleton className="h-16 w-full rounded-lg" />
          <Skeleton className="h-16 w-full rounded-lg" />
          <Skeleton className="h-10 w-full rounded-lg mt-4" />
        </div>
      </div>
    </div>
  );
}
