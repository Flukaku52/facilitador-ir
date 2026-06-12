interface SkeletonProps {
 className?: string;
}

export function Skeleton({ className = '' }: SkeletonProps) {
 return (
 <div className={`animate-pulse rounded-lg bg-slate-200 dark:bg-slate-800 ${className}`} />
 );
}

export function DashboardSkeleton() {
 return (
 <div className="mx-auto max-w-2xl px-4 py-10 space-y-6">
 <Skeleton className="h-8 w-32" />
 <Skeleton className="h-28 w-full" />
 <div className="grid gap-4 sm:grid-cols-3">
 <Skeleton className="h-24" />
 <Skeleton className="h-24" />
 <Skeleton className="h-24" />
 </div>
 <Skeleton className="h-20 w-full" />
 </div>
 );
}

export function ChecklistSkeleton() {
 return (
 <div className="mx-auto max-w-2xl px-4 py-10 space-y-6">
 <Skeleton className="h-8 w-48" />
 <Skeleton className="h-4 w-full" />
 <div className="space-y-3">
 {Array.from({ length: 5 }).map((_, i) => (
 <Skeleton key={i} className="h-16 w-full" />
 ))}
 </div>
 </div>
 );
}

export function GuidesSkeleton() {
 return (
 <div className="mx-auto max-w-2xl px-4 py-10 space-y-6">
 <Skeleton className="h-8 w-48" />
 <div className="grid gap-4 sm:grid-cols-2">
 {Array.from({ length: 6 }).map((_, i) => (
 <Skeleton key={i} className="h-32 w-full" />
 ))}
 </div>
 </div>
 );
}

export function ReportSkeleton() {
 return (
 <div className="mx-auto max-w-2xl px-4 py-10 space-y-6">
 <Skeleton className="h-8 w-32" />
 <Skeleton className="h-24 w-full" />
 <Skeleton className="h-40 w-full" />
 <Skeleton className="h-32 w-full" />
 </div>
 );
}
