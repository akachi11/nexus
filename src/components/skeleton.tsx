import { cn } from "@/lib/utils";

function Bone({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-muted",
        className,
      )}
    />
  );
}

export function MarketItemSkeleton() {
  return (
    <div className="flex items-center gap-3 rounded-xl bg-card p-3">
      <Bone className="h-5 w-5 rounded" />
      <Bone className="h-10 w-10 rounded-full" />
      <div className="min-w-0 flex-1 space-y-2">
        <Bone className="h-4 w-16" />
        <Bone className="h-3 w-24" />
      </div>
      <Bone className="h-8 w-16 rounded-lg" />
      <div className="space-y-2 text-right">
        <Bone className="ml-auto h-4 w-20" />
        <Bone className="ml-auto h-3 w-12" />
      </div>
    </div>
  );
}

export function MarketListSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="flex flex-col gap-2">
      {Array.from({ length: count }, (_, i) => (
        <MarketItemSkeleton key={i} />
      ))}
    </div>
  );
}

export function TokenItemSkeleton() {
  return (
    <div className="flex items-center gap-3 rounded-xl bg-card p-3">
      <Bone className="h-10 w-10 rounded-full" />
      <div className="min-w-0 flex-1 space-y-2">
        <Bone className="h-4 w-20" />
        <Bone className="h-3 w-16" />
      </div>
      <div className="space-y-2 text-right">
        <Bone className="ml-auto h-4 w-20" />
        <Bone className="ml-auto h-3 w-12" />
      </div>
    </div>
  );
}

export function TokenListSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="flex flex-col gap-2">
      {Array.from({ length: count }, (_, i) => (
        <TokenItemSkeleton key={i} />
      ))}
    </div>
  );
}
