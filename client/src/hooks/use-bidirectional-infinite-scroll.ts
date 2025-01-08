import { RefObject, useEffect, useState } from "react";

type UseBiDirectionalInfiniteScrollProps = {
    ref: RefObject<HTMLDivElement>;
    threshold?: number;
    onScrollTop: () => void;
    onScrollBottom: () => void;
};

const useInfiniteScrollBothDirection = ({
    ref,
    threshold = 0,
    onScrollBottom,
    onScrollTop,
}: UseBiDirectionalInfiniteScrollProps) => {
    const [isBottom, setIsBottom] = useState(false);
    const [isTop, setIsTop] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            const container = ref.current;
            if (!container) return;

            const scrollTop = container.scrollTop;
            const scrollHeight = container.scrollHeight;
            const clientHeight = container.clientHeight;

            if (scrollTop + clientHeight >= scrollHeight - threshold) {
                if (!isBottom) {
                    setIsBottom(true);
                    onScrollBottom();
                }
            } else {
                setIsBottom(false);
            }

            if (scrollTop <= threshold) {
                if (!isTop) {
                    setIsTop(true);
                    onScrollTop();
                }
            } else {
                setIsTop(false);
            }
        };

        const container = ref.current;
        if (container) {
            container.addEventListener("scroll", handleScroll);
        }

        return () => {
            if (container) {
                container.removeEventListener("scroll", handleScroll);
            }
        };
    }, [ref, isBottom, isTop, onScrollTop, onScrollBottom, threshold]);

    return { isTop, isBottom };
};

export default useInfiniteScrollBothDirection;
