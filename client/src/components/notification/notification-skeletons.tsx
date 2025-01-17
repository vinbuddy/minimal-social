import { Button, Skeleton } from "@heroui/react";

interface IProps {
    length: number;
}

export default function NotificationSkeletons({ length = 1 }: IProps) {
    return (
        <>
            {Array.from({ length }).map((_, index) => (
                <div
                    key={index}
                    className="flex items-center justify-between py-5 border-b border-divider last:border-none"
                >
                    <section className="flex-1 flex items-center gap-4">
                        <Skeleton className="rounded-full w-[40px] h-[40px]" />
                        <div className="flex-1">
                            <h4>
                                <Skeleton className="h-3 w-2/4 rounded-lg" />
                            </h4>
                            <div className="mt-2">
                                <Skeleton className="h-2 w-[10%] rounded-lg" />
                            </div>
                        </div>
                    </section>
                    <section></section>
                </div>
            ))}
        </>
    );
}
