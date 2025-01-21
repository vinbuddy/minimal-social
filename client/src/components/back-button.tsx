"use client";

import { Button, ButtonProps } from "@heroui/react";
import { ArrowLeftIcon } from "lucide-react";
import { useRouter } from "next/navigation";

interface IProps extends ButtonProps {}

function BackButton({ ...rest }: IProps) {
    const router = useRouter();

    return (
        <Button onPress={() => router.back()} title="Back" isIconOnly radius="full" variant="light" {...rest}>
            <ArrowLeftIcon size={20} />
        </Button>
    );
}

export default BackButton;
