import { Spinner } from "@heroui/react";

export default function PageSlowLoading() {
    return (
        <div className="w-screen h-screen flex flex-col items-center justify-center p-5">
            <Spinner size="lg" color="primary" />
            <h1 className="text-2xl text-black mt-5 font-semibold text-center">
                Our server is taking its time, <span className="md:inline block">please wait a moment ...</span>
            </h1>
        </div>
    );
}
