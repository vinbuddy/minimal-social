import { Skeleton } from "@nextui-org/react";

interface IProps {
    length: number;
}

export default function PostSkeletons({ length = 1 }: IProps) {
    return (
        <>
            {Array.from({ length }).map((_, index) => (
                <div key={index} className="py-5 border-b border-divider last:border-none">
                    <div className="flex px-1">
                        <section className="flex">
                            <div>
                                <Skeleton className="flex rounded-full w-[40px] h-[40px]" />
                            </div>
                        </section>
                        <section className="ms-4 flex-1 max-w-full overflow-hidden">
                            <div className="flex items-start justify-between">
                                <Skeleton className="h-3 w-3/12 rounded-lg" />

                                <div className="flex items-center gap-3">
                                    {/* Time */}
                                    <Skeleton className="h-3 w-[80px] rounded-lg" />

                                    {/* Menu */}
                                    <Skeleton className="h-3 w-[28px] rounded-lg" />
                                </div>
                            </div>

                            <div className="mt-3">
                                <Skeleton className="h-4 w-full rounded-lg" />
                                <Skeleton className="h-4 w-1/2 rounded-lg mt-2" />
                            </div>
                            <div className="flex gap-2 mt-3">
                                <Skeleton className="h-[280px] w-1/2 rounded-lg" />
                                <Skeleton className="h-[280px] w-1/2 rounded-lg" />
                            </div>
                        </section>
                    </div>
                </div>
            ))}
        </>
    );
}
