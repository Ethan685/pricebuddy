interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className = "" }: SkeletonProps) {
  return (
    <div
      className={`animate-pulse bg-slate-800 rounded ${className}`}
      aria-label="Loading..."
    />
  );
}

export function SkeletonCard() {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
      <Skeleton className="w-full h-48 mb-3" />
      <Skeleton className="w-3/4 h-6 mb-2" />
      <Skeleton className="w-1/2 h-4" />
    </div>
  );
}

export function SkeletonPage() {
  return (
    <div className="space-y-4">
      <Skeleton className="w-1/3 h-8 mb-4" />
      <div className="grid gap-4 md:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    </div>
  );
}

