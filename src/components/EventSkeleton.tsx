import { SkeletonCard } from "./SkeletonCard";

type EventSkeletonProps = {
  count?: number;
};

export function EventSkeleton({ count = 4 }: EventSkeletonProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
      {Array.from({ length: count }).map((_, index) => (
        <SkeletonCard key={index} variant="event" index={index} />
      ))}
    </div>
  );
}
