import { Skeleton } from "@/components/ui/skeleton";

export function ProductCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-[20px] border border-[var(--brand-border-light)] bg-white">
      <Skeleton className="h-[240px] w-full rounded-none" />
      <div className="space-y-3 p-5">
        <div className="flex items-center gap-2">
          <Skeleton className="h-6 w-6 rounded-full" />
          <Skeleton className="h-3 w-24" />
        </div>
        <Skeleton className="h-5 w-4/5" />
        <Skeleton className="h-3 w-1/2" />
        <Skeleton className="h-6 w-28" />
        <div className="flex gap-2 pt-1">
          <Skeleton className="h-9 flex-1 rounded-full" />
          <Skeleton className="h-9 flex-1 rounded-full" />
        </div>
      </div>
    </div>
  );
}
