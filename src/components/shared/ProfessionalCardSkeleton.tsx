import { Skeleton } from "@/components/ui/skeleton";

export function ProfessionalCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-[20px] border border-[var(--brand-border-light)] bg-white">
      <Skeleton className="h-[120px] w-full rounded-none" />
      <div className="px-4 pb-5 text-center">
        <div className="-mt-14 flex justify-center">
          <Skeleton className="h-16 w-16 rounded-full border-4 border-white" />
        </div>
        <Skeleton className="mx-auto mt-4 h-5 w-32" />
        <Skeleton className="mx-auto mt-2 h-3 w-24" />
        <Skeleton className="mx-auto mt-2 h-3 w-28" />
        <div className="mt-3 flex justify-center">
          <Skeleton className="h-3 w-20" />
        </div>
        <div className="mt-4 flex flex-wrap justify-center gap-2">
          <Skeleton className="h-6 w-16 rounded-full" />
          <Skeleton className="h-6 w-16 rounded-full" />
        </div>
        <Skeleton className="mt-5 h-11 w-full rounded-full" />
      </div>
    </div>
  );
}
