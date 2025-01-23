import { Button, Skeleton } from "@heroui/react";

interface IProps {
    length: number;
    isShowedFollowButton?: boolean;
}

export default function UserSkeletons({ length = 1, isShowedFollowButton = true }: IProps) {
    return (
        <>
            {Array.from({ length }).map((_, index) => (
                <div
                    key={index}
                    className="flex items-center justify-between py-5 border-b border-divider last:border-none"
                >
                    <section className="flex items-center gap-4">
                        <Skeleton className="rounded-full w-[40px] h-[40px]" />

                        <Skeleton className="h-3 w-[80px] rounded-lg" />
                    </section>
                    {isShowedFollowButton && (
                        <section>
                            <Button color="default" isDisabled>
                                Follow
                            </Button>
                        </section>
                    )}
                </div>
            ))}
        </>
    );
}
