import { Button, Skeleton } from "@nextui-org/react";

interface IProps {
    length: number;
}

export default function UserSkeletons({ length = 1 }: IProps) {
    return (
        <>
            {Array.from({ length }).map((_, index) => (
                <div
                    key={index}
                    className="flex items-center justify-between py-5 border-b border-divider last:border-none"
                >
                    <section className="flex items-center gap-4">
                        <Skeleton className="rounded-full w-[40px] h-[40px]" />
                        <h4>
                            <Skeleton className="h-3 w-3/12 rounded-lg" />
                        </h4>
                    </section>
                    <section>
                        <Button color="default" isDisabled>
                            Follow
                        </Button>
                    </section>
                </div>
            ))}
        </>
    );
}
