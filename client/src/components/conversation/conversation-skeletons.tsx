import { Skeleton } from "@heroui/react";

interface IProps {
    length: number;
}

export default function ConversationSkeletons({ length = 1 }: IProps) {
    return (
        <>
            {Array.from({ length }).map((_, index) => (
                <div
                    key={index}
                    className="flex items-center justify-between p-3 border-b border-divider last:border-none"
                >
                    <section className="flex items-center gap-4 ">
                        <Skeleton className="rounded-full w-[56px] h-[56px]" />
                    </section>
                    <section className="flex-1 w-full ms-3">
                        <h4>
                            <Skeleton className="h-3 w-3/12 rounded-lg" />
                        </h4>
                        <span className="mt-2">
                            <Skeleton className="h-2 w-2/4 rounded-lg" />
                        </span>
                    </section>
                </div>
            ))}
        </>
    );
}
