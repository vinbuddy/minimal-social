import { Spinner } from "@heroui/react";

export default function PageLoading() {
    return (
        <div className="w-screen h-screen flex items-center justify-center">
            <Spinner size="lg" color="primary" />
        </div>
    );
}
