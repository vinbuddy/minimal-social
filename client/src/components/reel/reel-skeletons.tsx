import { Skeleton } from "@heroui/react";

export function ReelSlideSkeleton() {
    return (
        <div className="flex items-end gap-4 h-full">
            <Skeleton className="h-full aspect-[9/16] max-w-full md:rounded-large" />
            <div className="hidden md:flex flex-col items-center gap-5 pb-1">
                {Array.from({ length: 4 }).map((_, index) => (
                    <Skeleton key={index} className="size-9 rounded-full" />
                ))}
            </div>
        </div>
    );
}

export default function ReelGridSkeletons({ length = 6 }: { length?: number }) {
    return (
        <div className="grid grid-cols-3 gap-1">
            {Array.from({ length }).map((_, index) => (
                <Skeleton key={index} className="aspect-[9/16] w-full" />
            ))}
        </div>
    );
}
