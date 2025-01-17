"use client";

import { Button, ButtonProps } from "@heroui/react";
import { ArrowLeftIcon } from "lucide-react";
import { useRouter } from "next/navigation";

interface IProps {
    buttonProps?: ButtonProps;
}

function BackButton({ buttonProps = {} }: IProps) {
    const router = useRouter();

    return (
        <Button {...buttonProps} onPress={() => router.back()} title="Back" isIconOnly radius="full" variant="light">
            <ArrowLeftIcon size={20} />
        </Button>
    );
}

export default BackButton;
