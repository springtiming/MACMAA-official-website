import { motion } from "motion/react";
import { cn } from "./ui/utils";

type SkeletonCardProps = {
  variant: "news" | "event";
  index?: number;
};

function ShimmerBlock({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-shimmer",
        "bg-[length:200%_100%] rounded-md",
        className,
      )}
    />
  );
}

function NewsSkeletonLayout() {
  return (
    <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg overflow-hidden h-full">
      <ShimmerBlock className="h-48 sm:h-52 w-full rounded-b-none rounded-t-xl sm:rounded-t-2xl" />
      <div className="p-4 sm:p-6 space-y-3">
        <div className="flex items-center gap-2">
          <ShimmerBlock className="h-4 w-4 rounded-full" />
          <ShimmerBlock className="h-3 w-24" />
        </div>
        <ShimmerBlock className="h-5 w-3/4" />
        <ShimmerBlock className="h-4 w-full" />
        <ShimmerBlock className="h-4 w-11/12" />
        <div className="flex items-center gap-2">
          <ShimmerBlock className="h-4 w-20" />
          <ShimmerBlock className="h-4 w-4 rounded-full" />
        </div>
      </div>
    </div>
  );
}

function EventSkeletonLayout() {
  return (
    <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg overflow-hidden h-full">
      <div className="md:flex">
        <div className="md:w-2/5">
          <ShimmerBlock className="aspect-square w-full rounded-none md:rounded-l-2xl md:rounded-r-none" />
        </div>
        <div className="md:w-3/5 p-4 sm:p-6 space-y-4">
          <div className="flex items-center gap-2 flex-wrap">
            <ShimmerBlock className="h-6 w-20 rounded-full" />
            <ShimmerBlock className="h-6 w-24 rounded-full" />
          </div>
          <ShimmerBlock className="h-5 w-3/4" />
          <ShimmerBlock className="h-4 w-full" />
          <ShimmerBlock className="h-4 w-11/12" />
          <div className="space-y-2">
            <ShimmerBlock className="h-4 w-1/2" />
            <ShimmerBlock className="h-4 w-2/3" />
            <ShimmerBlock className="h-4 w-3/4" />
            <ShimmerBlock className="h-4 w-1/2" />
          </div>
          <ShimmerBlock className="h-11 w-full rounded-lg" />
        </div>
      </div>
    </div>
  );
}

export function SkeletonCard({ variant, index = 0 }: SkeletonCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.3 }}
      className="h-full"
    >
      {variant === "news" ? <NewsSkeletonLayout /> : <EventSkeletonLayout />}
    </motion.div>
  );
}
