export default function Skeleton({ className = "" }) {
  return (
    <div className={`skeleton rounded-lg ${className}`} />
  );
}

export function ProjectCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-[28px] border border-black/10 bg-white/75 shadow-panel">
      <Skeleton className="h-64 w-full sm:h-72" />
      <div className="p-6">
        <Skeleton className="h-4 w-24 mb-3" />
        <Skeleton className="h-8 w-3/4 mb-3" />
        <Skeleton className="h-5 w-full mb-2" />
        <Skeleton className="h-5 w-2/3 mb-4" />
        <div className="flex flex-wrap gap-2">
          <Skeleton className="h-8 w-16 rounded-full" />
          <Skeleton className="h-8 w-20 rounded-full" />
          <Skeleton className="h-8 w-14 rounded-full" />
        </div>
        <div className="mt-6 flex gap-3">
          <Skeleton className="h-11 w-32 rounded-full" />
          <Skeleton className="h-11 w-28 rounded-full" />
        </div>
      </div>
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div className="rounded-[28px] border border-black/10 bg-white/70 p-6 shadow-panel backdrop-blur">
      <Skeleton className="h-4 w-32 mb-3" />
      <Skeleton className="h-8 w-3/4 mb-2" />
      <Skeleton className="h-5 w-full mb-2" />
      <Skeleton className="h-5 w-4/5" />
    </div>
  );
}

export function StatSkeleton() {
  return (
    <div className="rounded-[24px] border border-black/10 bg-white/65 p-4">
      <Skeleton className="h-8 w-16 mb-2" />
      <Skeleton className="h-4 w-32" />
    </div>
  );
}

